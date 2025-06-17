import { useEffect, useRef, useState } from "react";
import AgoraRTM from "agora-rtm-sdk";

interface ChatMessage {
  text: string;
  sender: string;
}

export default function useAgoraRtm(appId: string, channelName: string, userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!appId || !channelName || !userId) return;

    let isMounted = true;
    const client = AgoraRTM.createInstance(appId);
    clientRef.current = client;

    async function setup() {
      await client.login({ uid: userId });
      const channel = client.createChannel(channelName);
      channelRef.current = channel;

      channel.on("ChannelMessage", (message: { text: string }, senderId: string) => {
        console.log("Received message:", message, "from", senderId);
        if (isMounted) {
          setMessages((msgs) => [...msgs, { text: message.text, sender: senderId }]);
        }
      });

      await channel.join();
      console.log("Joined channel:", channelName, "as", userId);
    }

    setup();

    return () => {
      isMounted = false;
      channelRef.current?.leave();
      clientRef.current?.logout();
    };
  }, [appId, channelName, userId]);

  const sendMessage = (text: string) => {
    if (channelRef.current) {
      console.log("Sending message:", text);
      channelRef.current.sendMessage({ text });
      setMessages((msgs) => [...msgs, { text, sender: userId }]);
    } else {
      console.warn("No channelRef, cannot send message");
    }
  };

  return { messages, sendMessage };
}