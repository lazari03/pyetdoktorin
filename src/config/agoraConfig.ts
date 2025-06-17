// Agora Video configuration
export const agoraVideoConfig = {
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "",
};

// Agora Chat configuration
export const agoraChatConfig = {
  appKey: process.env.NEXT_PUBLIC_AGORA_CHAT_APP_KEY || "",
  orgName: process.env.NEXT_PUBLIC_AGORA_CHAT_ORG_NAME || "",
  appName: process.env.NEXT_PUBLIC_AGORA_CHAT_APP_NAME || "",
  wsUrl: process.env.NEXT_PUBLIC_AGORA_CHAT_WEBSOCKET_URL || "msync-api-r1.chat.agora.io",
  restUrl: process.env.NEXT_PUBLIC_AGORA_CHAT_REST_API_URL || "a71.chat.agora.io",
};
