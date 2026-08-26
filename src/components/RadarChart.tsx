"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./RadarChart.module.css";
import { useProfile } from "@/context/ProfileContext";

// Constants for the radar math
const MAX_STAT = 500;
const RADIUS = 120;
const CENTER = { x: 150, y: 150 }; // SVG 300x300 viewBox
const STATS_ORDER = ["knowledge", "charm", "nerve", "craft", "vitality"] as const;

// Helper to calculate Rank (1-5)
const getRank = (value: number) => {
  if (value < 100) return "Rank 1";
  if (value < 200) return "Rank 2";
  if (value < 300) return "Rank 3";
  if (value < 400) return "Rank 4";
  return "Rank 5 (Max)";
};

export function RadarChart() {
  const { stats } = useProfile();

  // Helper to get coordinates on the radar
  const getCoordinates = (value: number, index: number, maxRadius: number) => {
    // Start at -90 degrees (top), 360 / 5 = 72 degrees per stat
    const angle = (Math.PI / 2) * -1 + (index * 2 * Math.PI) / 5;
    const r = (value / MAX_STAT) * maxRadius;
    return {
      x: CENTER.x + r * Math.cos(angle),
      y: CENTER.y + r * Math.sin(angle),
    };
  };

  // Generate grid points for concentric pentagons
  const gridLevels = [1, 2, 3, 4, 5];
  const gridPolygons = gridLevels.map((level) => {
    const r = (level / 5) * RADIUS;
    const points = STATS_ORDER.map((_, i) => {
      const { x, y } = getCoordinates(MAX_STAT, i, r);
      return `${x},${y}`;
    }).join(" ");
    return points;
  });

  // Generate data polygon points based on current stats
  const dataPoints = STATS_ORDER.map((statKey, i) => {
    const value = stats[statKey] || 10; // Ensure at least a tiny polygon is visible
    const { x, y } = getCoordinates(value, i, RADIUS);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className={styles.radarContainer}>
      <svg viewBox="0 0 300 300" className={styles.radarSvg}>
        {/* Render Concentric Pentagons */}
        {gridPolygons.map((points, i) => (
          <polygon key={`grid-${i}`} points={points} className={styles.gridLine} />
        ))}

        {/* Render Axis Lines */}
        {STATS_ORDER.map((_, i) => {
          const { x, y } = getCoordinates(MAX_STAT, i, RADIUS);
          return (
            <line
              key={`axis-${i}`}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={x}
              y2={y}
              className={styles.axisLine}
            />
          );
        })}

        {/* Render Animated Data Polygon */}
        <motion.polygon
          points={dataPoints}
          className={styles.dataPolygon}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, points: dataPoints }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 },
            points: { type: "spring", stiffness: 60, damping: 12 },
          }}
          style={{ originX: "150px", originY: "150px" }}
        />

        {/* Render Labels */}
        {STATS_ORDER.map((statKey, i) => {
          const value = stats[statKey] || 0;
          // Push labels slightly further out than max radius
          const { x, y } = getCoordinates(MAX_STAT, i, RADIUS + 25);
          
          return (
            <g key={`label-${statKey}`} className={styles.labelGroup} transform={`translate(${x}, ${y})`}>
              <text y="0" className={styles.statName}>
                {statKey}
              </text>
              <text y="14" className={styles.statRank}>
                {getRank(value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
