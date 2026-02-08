import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      className="header"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
    >
      <Link to="/" className="header-brand">
        <motion.h1
          className="header-title"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Urban Traffic Congestion Intelligence
        </motion.h1>
      </Link>
      <nav className="header-nav">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="nav-link">Dashboard</Link>
        </motion.div>
      </nav>
    </motion.header>
  );
}
