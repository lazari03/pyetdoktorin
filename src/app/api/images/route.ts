

import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 500): Promise<Response> {
    let lastError: any;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fetch(url, options);
        } catch (err) {
            lastError = err;
            console.error(`Image fetch attempt ${attempt + 1} failed:`, err);
            if (attempt < retries - 1) {
                await new Promise((res) => setTimeout(res, delay));
            }
        }
    }
    throw lastError;
}

type LocalImage = {
    buffer: Buffer;
    contentType: string;
};

async function loadLocalImage(key: string): Promise<LocalImage | null> {
    const publicDir = path.join(process.cwd(), "public", "website");
    const candidates = key.includes(".")
        ? [key]
        : [`${key}.svg`, `${key}.png`, `${key}.jpg`, `${key}.jpeg`];

    for (const filename of candidates) {
        const filePath = path.join(publicDir, filename);
        try {
            const buffer = await fs.readFile(filePath);
            const ext = path.extname(filename).toLowerCase();
            const contentType =
                ext === ".svg" ? "image/svg+xml" :
                ext === ".png" ? "image/png" :
                "image/jpeg";
            return { buffer, contentType };
        } catch {
            continue;
        }
    }

    return null;
}

export async function GET(req: NextRequest) {

    const key = req.nextUrl.searchParams.get("key");
    // Validate key: must be a simple filename (no slashes, no traversal)
    if (!key || !/^[a-zA-Z0-9._-]+$/.test(key)) {
        return new Response("Invalid or missing 'key' parameter", { status: 400 });
    }


    const bucketUrl = process.env.NEXT_PUBLIC_STORAGE_BUCKET;

    if (bucketUrl) {
        const imageUrl = `${bucketUrl}/website-images/${key}`;
        try {
            const imageResponse = await fetchWithRetry(imageUrl);
            if (imageResponse && imageResponse.ok) {
                const contentType = imageResponse.headers.get("Content-Type") || "image/jpeg";
                const imageBuffer = await imageResponse.arrayBuffer();
                return new Response(imageBuffer, {
                    headers: {
                        "Content-Type": contentType,
                        "X-Content-Type-Options": "nosniff",
                        "Cache-Control": "public, max-age=86400, immutable"
                    }
                });
            } else {
                const errText = imageResponse ? await imageResponse.text() : 'No response';
                console.error('Image fetch error response:', imageResponse?.status, errText);
            }
        } catch (err) {
            console.error('Image fetch network error:', err);
            // Fall back to local assets below.
        }
    }

    const localImage = await loadLocalImage(key);
    if (localImage) {
        const body = new Uint8Array(localImage.buffer);
        return new Response(body, {
            headers: {
                "Content-Type": localImage.contentType,
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=86400, immutable"
            }
        });
    }

    return new Response('Image not found', { status: 404 });
}
