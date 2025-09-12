"use client";

import { useState } from "react";

import { RealtimeChat } from "@/components/realTimeChat";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [username, setUsername] = useState("");

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Input
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <RealtimeChat roomName="my-chat-room" username={username} />
      </main>
    </div>
  );
}
