"use client";

import { useEffect, useRef } from "react";
import type { TranscriptMessage } from "@/types/call";

interface TranscriptProps {
  messages: TranscriptMessage[];
}

export default function Transcript({ messages }: TranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Conversation will appear here...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-96 flex-col gap-3 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: TranscriptMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
        } ${!message.isFinal ? "opacity-70" : ""}`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <div
          className={`mt-1 flex items-center gap-2 text-xs ${
            isUser
              ? "text-blue-200"
              : "text-zinc-500 dark:text-zinc-500"
          }`}
        >
          <span>
            {formatTime(message.timestamp)}
          </span>
          {!message.isFinal && (
            <span className="italic">transcribing...</span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
