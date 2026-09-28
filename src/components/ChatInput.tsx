import React, { useState } from "react";
import styles from "./ChatInput.module.css";
import { useT } from "@/lib/i18n";

interface ChatInputProps {
  onSend: (text: string) => void;
  // Blocks sending while a reply is in flight
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const t = useT();

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
        placeholder={t.chat.placeholder}
        aria-label={t.chat.placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className={styles.sendBtn} disabled={!text.trim() || disabled}>
        {t.chat.send}
      </button>
    </form>
  );
}
