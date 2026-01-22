import { fetchAndActivate, getValue } from "firebase/remote-config";
import { remoteConfig } from "@/config/firebaseconfig";

export async function fetchRemoteConfig() {
  if (!remoteConfig) return;
  await fetchAndActivate(remoteConfig);
}

export function getRemoteConfigValue(key: string) {
  if (!remoteConfig) return "";
  return getValue(remoteConfig, key).asString();
}
