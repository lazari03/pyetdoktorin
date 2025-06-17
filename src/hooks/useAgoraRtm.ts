import { useState, useEffect, useRef } from "react";
import AgoraRTM from "agora-rtm-sdk";


export interface ChatMessage {
  text: string;
  sender: string;
}


export default function useAgoraRtm(appId: string, channelName: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!appId || !channelName || !userId) return;

    // Fix RTM initialization - try different initialization methods
    let client;
    try {
      // For agora-rtm-sdk v1.x
      if (typeof AgoraRTM.createInstance === 'function') {
        client = AgoraRTM.createInstance(appId);
      } 
      // For agora-rtm-sdk v2.x
      else if (typeof AgoraRTM.default?.createInstance === 'function') {
        client = AgoraRTM.default.createInstance(appId);
      }
      // Fallback to default import
      else if (typeof AgoraRTM.default === 'function') {
        client = AgoraRTM.default(appId);
      }
      // Last resort - direct import
      else {
        client = AgoraRTM(appId);
      }
    } catch (error) {
      console.error("Failed to initialize Agora RTM client:", error);
      return;
    }

    if (!client) {
      console.error("Could not initialize Agora RTM client - unsupported SDK version");
      return;
    }

    clientRef.current = client;

    async function start() {
      try {
        await client.login({ uid: userId });
        const channel = client.createChannel(channelName);
        channelRef.current = channel;

        channel.on("ChannelMessage", (message: { text: string }, senderId: string) => {
          setMessages((prev) => [...prev, { text: message.text, sender: senderId }]);
        });

        await channel.join();
      } catch (error) {
        console.error("RTM login or join failed:", error);
      }
    }

    start();

    return () => {
      if (channelRef.current) {
        channelRef.current.leave().catch(() => {});
        channelRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.logout().catch(() => {});
        clientRef.current = null;
      }
    };
  }, [appId, channelName, userId]);

  const sendMessage = async (text: string) => {
    if (!channelRef.current) return;
    try {
      await channelRef.current.sendMessage({ text });
      setMessages((prev) => [...prev, { text, sender: userId }]);
    } catch (error) {
      console.error("Failed to send RTM message:", error);
    }
  };

  return { messages, sendMessage };
}
