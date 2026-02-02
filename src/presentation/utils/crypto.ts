"use client";

// Simple AES-GCM helper using Web Crypto. All strings are UTF-8; binary is base64.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type EncryptedPayload = {
  cipher: string; // base64
  iv: string;     // base64
  salt: string;   // base64
};

function toBase64(buf: ArrayBuffer | Uint8Array) {
  const view = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...view));
}

function fromBase64(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt), // ensure ArrayBuffer, not SharedArrayBuffer
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptString(passphrase: string, plaintext: string): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(passphrase, salt);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );
  return {
    cipher: toBase64(cipherBuf),
    iv: toBase64(iv),
    salt: toBase64(salt),
  };
}

export async function decryptString(passphrase: string, payload: EncryptedPayload): Promise<string | null> {
  try {
    const iv = fromBase64(payload.iv);
    const salt = fromBase64(payload.salt);
    const cipher = fromBase64(payload.cipher);
    const key = await deriveKey(passphrase, salt);
    const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
    return decoder.decode(plainBuf);
  } catch {
    return null;
  }
}
