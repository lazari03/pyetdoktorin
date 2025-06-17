"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import useAgoraRtm from "../../hooks/useAgoraRtm";

// Define the ChatMessage interface here since it's not exported from useAgoraRtm
interface ChatMessage {
  text: string;
  sender: string;
}

interface AgoraChatProps {
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  currentUserId: string;
}

export default function AgoraChat({
  messages,
  sendMessage,
  currentUserId,
}: AgoraChatProps) {
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-2 flex flex-col">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center mt-10">No messages yet</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-1 max-w-xs px-3 py-1 rounded break-words ${
              msg.sender === currentUserId
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-2 flex">
        <input
          type="text"
          className="flex-grow border rounded px-3 py-2 mr-2"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
