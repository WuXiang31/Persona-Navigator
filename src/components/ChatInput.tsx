import React, { useState } from "react";
import styles from "./ChatInput.module.css";

interface ChatInputProps {
  onSend: (text: string) => void;
  // Blocks sending while a reply is in flight
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.input}
        placeholder="Type a message..."
        aria-label="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className={styles.sendBtn} disabled={!text.trim() || disabled}>
        SEND
      </button>
    </form>
  );
}
