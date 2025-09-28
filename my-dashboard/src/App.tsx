import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // your dashboard page

import "./App.css";

function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif" }}>
        {/* ✅ Navigation Bar */}
        <nav style={{ padding: "12px", background: "#282c34", color: "white" }}>
          <ul style={{ display: "flex", gap: "20px", listStyle: "none", margin: 0, padding: 0 }}>
            <li><Link to="/" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link></li>
            <li><Link to="/about" style={{ color: "white", textDecoration: "none" }}>About</Link></li>
            <li><Link to="/contact" style={{ color: "white", textDecoration: "none" }}>Contact</Link></li>
          </ul>
        </nav>

        {/* ✅ Page Routes */}
        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
