import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./OverlayPanel.module.css";

interface OverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

// Dark skewed panel with a red border and hard red shadow, shared by Quick Log and New Mission
export function OverlayPanel({ isOpen, onClose, title, subtitle, children }: OverlayPanelProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.85, rotate: 3 }}
            animate={{ scale: 1, rotate: -1 }}
            exit={{ scale: 0.85, rotate: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
          >
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
