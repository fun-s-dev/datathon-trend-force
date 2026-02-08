import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TRAFFIC_PHASES = [
  { active: "red", label: "Analyzing routes…" },
  { active: "yellow", label: "Computing predictions…" },
  { active: "green", label: "Optimizing results…" },
] as const;

export function LoaderSkeleton() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % TRAFFIC_PHASES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const current = TRAFFIC_PHASES[phase];

  return (
    <motion.div
      className="loader-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="traffic-light-loader">
        {(["red", "yellow", "green"] as const).map((color) => (
          <motion.div
            key={color}
            className={`traffic-light-dot ${color} ${current.active !== color ? "dim" : ""}`}
            animate={
              current.active === color
                ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
                : { scale: 1, opacity: 0.15 }
            }
            transition={
              current.active === color
                ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          />
        ))}
      </div>
      <div className="shimmer-bar" />
      <motion.p
        className="skeleton-text"
        key={current.label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {current.label}
      </motion.p>
    </motion.div>
  );
}
