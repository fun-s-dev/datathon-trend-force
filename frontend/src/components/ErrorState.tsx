import { motion } from "framer-motion";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      className="error-state"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
    >
      <motion.p
        className="error-message"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {message}
      </motion.p>
      {onRetry && (
        <motion.button
          type="button"
          className="retry-btn"
          onClick={onRetry}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
          whileTap={{ scale: 0.95 }}
        >
          Retry
        </motion.button>
      )}
    </motion.div>
  );
}
