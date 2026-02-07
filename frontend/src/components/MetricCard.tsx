import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  subtitle?: string;
}

export function MetricCard({ label, value, subtitle }: MetricCardProps) {
  const hasValue = value !== null && value !== undefined && value !== "";

  if (!hasValue) return null;

  return (
    <motion.div
      className="metric-card card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="metric-card-label">{label}</span>
      <span className="metric-card-value">{value}</span>
      {subtitle && <span className="metric-card-subtitle">{subtitle}</span>}
    </motion.div>
  );
}
