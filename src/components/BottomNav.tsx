"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./BottomNav.module.css";

const NAV_ITEMS = [
  { path: "/home", label: "HOME" },
  { path: "/missions", label: "MISSIONS" },
  { path: "/chat", label: "CHAT" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.navContainer}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            href={item.path}
            className={styles.navItem}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.div
                layoutId="navIndicator"
                className={styles.activeIndicator}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className={`${styles.navButton} ${isActive ? styles.activeText : styles.inactiveText}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
