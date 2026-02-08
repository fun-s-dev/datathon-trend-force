import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  subtitle?: string;
  accentColor?: string;
}

export function MetricCard({ label, value, subtitle, accentColor }: MetricCardProps) {
  const hasValue = value !== null && value !== undefined && value !== "";

  if (!hasValue) return null;

  return (
    <motion.div
      className="metric-card card"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
      whileHover={{
        y: -2,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      layout
    >
      <span className="metric-card-label">{label}</span>
      <motion.span
        className="metric-card-value"
        style={accentColor ? { color: accentColor } : undefined}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
      >
        {value}
      </motion.span>
      {subtitle && <span className="metric-card-subtitle">{subtitle}</span>}
    </motion.div>
  );
}
