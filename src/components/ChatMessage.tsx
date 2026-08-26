import React from "react";
import { motion } from "framer-motion";
import styles from "./ChatMessage.module.css";

export interface MessageData {
  id: string;
  sender: "user" | "mona";
  text: string;
  timestamp: number;
}

export function ChatMessage({ message }: { message: MessageData }) {
  const isUser = message.sender === "user";

  return (
    <motion.div
      className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.monaWrapper}`}
      initial={{ opacity: 0, x: isUser ? 20 : -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.monaBubble}`}>
        <p className={styles.text}>{message.text}</p>
      </div>
    </motion.div>
  );
}
