import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Dashboard } from "./pages/Dashboard";
import { IncidentReport } from "./pages/IncidentReport";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report-incident" element={<IncidentReport />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
