import React from "react";
import { motion } from "framer-motion";
import styles from "./ChatMessage.module.css";
import { MissionProposal } from "./MissionProposals";
import { COMPANION_INITIAL } from "@/lib/companion";

export interface MessageData {
  id: string;
  sender: "user" | "companion";
  text: string;
  timestamp: number;
  proposals?: MissionProposal[];
}

function Avatar({ isUser }: { isUser: boolean }) {
  return (
    <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.companionAvatar}`} aria-hidden>
      {isUser ? "ME" : COMPANION_INITIAL}
    </div>
  );
}

export function ChatMessage({ message }: { message: MessageData }) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      className={`${styles.row} ${isUser ? styles.userRow : ""}`}
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Avatar isUser={isUser} />
      <p className={`${styles.bubble} ${isUser ? styles.userBubble : styles.companionBubble}`}>{message.text}</p>
    </motion.div>
  );
}

// Pulsing "..." bubble shown while the companion is replying
export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className={styles.row} role="status" aria-label={`${name} is typing`}>
      <Avatar isUser={false} />
      <p className={`${styles.bubble} ${styles.companionBubble} ${styles.typing}`}>&hellip;</p>
    </div>
  );
}
