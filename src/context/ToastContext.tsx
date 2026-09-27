"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ToastContext.module.css";

export type ToastVariant = "xp" | "rank" | "info";

interface Toast {
  id: string;
  text: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (text: string, variant?: ToastVariant, delayMs?: number) => void;
}

const TOAST_DURATION_MS = 1800;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((text: string, variant: ToastVariant = "xp", delayMs = 0) => {
    const id = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      setToasts((prev) => [...prev, { id, text, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, TOAST_DURATION_MS);
    }, delayMs);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.stack}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, scale: 1.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className={`${styles.toast} ${styles[t.variant]}`}>{t.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
