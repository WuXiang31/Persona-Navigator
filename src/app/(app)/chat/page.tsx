"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { ChatMessage, MessageData } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { MissionProposals, MissionProposal, ProposalStatus } from "@/components/MissionProposals";
import { useProfile } from "@/context/ProfileContext";
import { useMissions } from "@/context/MissionContext";
import { COMPANION_NAME } from "@/lib/companion";
import { createLocalStore, useLocalStore } from "@/lib/localStore";
import { useWeather } from "@/lib/useWeather";

const MAX_SAVED_MESSAGES = 100;
const chatStore = createLocalStore<MessageData[]>("persona_chat", []);

function setMessages(update: (prev: MessageData[]) => MessageData[]) {
  chatStore.set((prev) => update(prev).slice(-MAX_SAVED_MESSAGES));
}

export default function ChatPage() {
  const { role, stats, profile, mask } = useProfile();
  const { condition: weather } = useWeather();
  const { missions, addMission } = useMissions();
  
  const messages = useLocalStore(chatStore);

  const welcome: MessageData = {
    id: "welcome-1",
    sender: "companion",
    text: `${COMPANION_NAME} here${mask ? `, ${mask.name}` : role ? `, ${role}` : ""}. Tell me what's on your plate today and I'll turn it into missions.`,
    timestamp: 0,
  };

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
    const history = [...messages, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: history.map(({ sender, text }) => ({ sender, text })),
          role,
          profile,
          mask,
          stats,
          weather,
          activeMissions: missions.filter((m) => m.status === "active").map((m) => m.title),
        }),
      });

      if (!response.ok) {
        console.warn('Failed to fetch from chat API, status:', response.status);
        const errorMsg: MessageData = {
          id: Math.random().toString(36).substring(2, 9),
          sender: "companion",
          text: "Tch, the signal just dropped. What were you saying?",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const data = await response.json();
      
      const companionMsg: MessageData = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "companion",
        text: data.reply || "...",
        timestamp: Date.now(),
        proposals: Array.isArray(data.missions) && data.missions.length
          ? data.missions.map((m: Omit<MissionProposal, "proposalStatus">) => ({ ...m, proposalStatus: "pending" }))
          : undefined,
      };
      
      setMessages((prev) => [...prev, companionMsg]);
    } catch (error) {
      console.warn('Chat request failed:', error);
      const errorMsg: MessageData = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "companion",
        text: "Our connection got cut off. Let's try that again in a bit.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Moves the chosen proposals of one message from "pending" to a final status,
  // adding them to the mission list when accepted
  const resolveProposals = (messageId: string, indices: number[], status: ProposalStatus) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg?.proposals) return;

    const targets = indices.filter((i) => msg.proposals![i]?.proposalStatus === "pending");
    if (status === "accepted") {
      targets.forEach((i) => {
        const { title, description, rewardStat, rewardXp } = msg.proposals![i];
        addMission({ title, description, rewardStat, rewardXp });
      });
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.proposals
          ? { ...m, proposals: m.proposals.map((p, i) => (targets.includes(i) ? { ...p, proposalStatus: status } : p)) }
          : m
      )
    );
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>{COMPANION_NAME} / NAVIGATOR ONLINE</h1>
      </header>

      <div className={styles.messageList}>
        {[welcome, ...messages].map((msg) => (
          <React.Fragment key={msg.id}>
            <ChatMessage message={msg} />
            {msg.proposals && (
              <MissionProposals
                proposals={msg.proposals}
                onAccept={(i) => resolveProposals(msg.id, [i], "accepted")}
                onDismiss={(i) => resolveProposals(msg.id, [i], "dismissed")}
                onAcceptAll={() => resolveProposals(msg.id, msg.proposals!.map((_, i) => i), "accepted")}
              />
            )}
          </React.Fragment>
        ))}
        {isTyping && (
          <div style={{ padding: "10px", fontFamily: "var(--font-outfit)", fontStyle: "italic", color: "#888" }}>
            {COMPANION_NAME} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </main>
  );
}
