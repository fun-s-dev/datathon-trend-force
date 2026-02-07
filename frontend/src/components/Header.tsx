import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="header">
      <Link to="/" className="header-brand">
        <h1 className="header-title">Urban Traffic Congestion Intelligence</h1>
      </Link>
      <nav className="header-nav">
        <Link to="/" className="nav-link">Dashboard</Link>
        <Link to="/report-incident" className="nav-link">Report Incident</Link>
      </nav>
    </header>
  );
}
