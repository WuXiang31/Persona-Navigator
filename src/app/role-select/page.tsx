"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile, RoleType } from "@/context/ProfileContext";
import styles from "./page.module.css";

const ROLES = [
  {
    id: "scholar",
    numeral: "I",
    name: "The Scholar",
    description: "Driven by intellect and curiosity. You seek to uncover the truth of the world. (Focus: Knowledge)",
  },
  {
    id: "professional",
    numeral: "II",
    name: "The Professional",
    description: "Ambitious and organized. You navigate the complex web of society with precision. (Focus: Craft & Charm)",
  },
  {
    id: "creative",
    numeral: "III",
    name: "The Creative",
    description: "Expressive and unbound. You shape the hearts of others through your vision. (Focus: Charm & Knowledge)",
  },
  {
    id: "athlete",
    numeral: "IV",
    name: "The Athlete",
    description: "Resilient and energetic. You push the physical limits of what is possible. (Focus: Vitality & Nerve)",
  },
  {
    id: "explorer",
    numeral: "V",
    name: "The Explorer",
    description: "Bold and adventurous. You fearlessly dive into the unknown. (Focus: Nerve & Craft)",
  },
] as const;

export default function RoleSelectScreen() {
  const router = useRouter();
  const { setRole } = useProfile();
  const [selectedId, setSelectedId] = useState<RoleType>(null);

  const handleConfirm = () => {
    if (selectedId) {
      setRole(selectedId);
      router.push("/home");
    }
  };

  return (
    <main className={styles.container}>
      <div className={`${styles.halftoneOverlay} halftone-bg`} />

      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        CHOOSE YOUR MASK
      </motion.h1>

      <div className={styles.list}>
        {ROLES.map((role, index) => {
          const isSelected = selectedId === role.id;

          return (
            <motion.div
              key={role.id}
              className={styles.cardWrapper}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`${styles.card} skew-container ${
                  isSelected ? styles.cardSelected : "hard-shadow"
                }`}
                onClick={() => setSelectedId(role.id as RoleType)}
              >
                <div className="unskew-content">
                  <div className={styles.cardHeader}>
                    <div
                      className={`${styles.numeralChip} skew-container ${
                        isSelected ? styles.numeralChipSelected : ""
                      }`}
                    >
                      <span className="unskew-content">{role.numeral}</span>
                    </div>
                    <span className={styles.roleName}>{role.name}</span>
                  </div>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className={styles.description}>{role.description}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            className={styles.confirmWrapper}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <button className={styles.confirmButton} onClick={handleConfirm}>
              <span className="unskew-content">CONFIRM</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
