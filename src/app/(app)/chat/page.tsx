"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { ChatMessage, MessageData } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useProfile } from "@/context/ProfileContext";

const MONA_RESPONSES = [
  "Looking sharp, Joker. What's our next move?",
  "Don't push yourself too hard, it's late. You should get some sleep.",
  "I sense a Treasure nearby... oh wait, that's just your homework.",
  "A Phantom Thief always completes their Missions!",
  "Make sure you're increasing your Charm... you'll need it.",
  "You've been grinding stats, haven't you? Impressive.",
];

export default function ChatPage() {
  const { role } = useProfile();
  
  const [messages, setMessages] = useState<MessageData[]>([
    {
      id: "welcome-1",
      sender: "mona",
      text: `Welcome to the Metaverse, ${role ? role : "trickster"}. Ready to steal some hearts?`,
      timestamp: Date.now(),
    }
  ]);
  
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    // Add user message
    const userMsg: MessageData = {
      id: Math.random().toString(36).substring(2, 9),
      sender: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Mona');
      }

      const data = await response.json();
      
      const monaMsg: MessageData = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "mona",
        text: data.reply || "...",
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, monaMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: MessageData = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "mona",
        text: "Signal lost... I can't reach you right now.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>MONA SECURE CHAT</h1>
      </header>

      <div className={styles.messageList}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div style={{ padding: "10px", fontFamily: "var(--font-outfit)", fontStyle: "italic", color: "#888" }}>
            Mona is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <ChatInput onSend={handleSend} />
      </div>
    </main>
  );
}
