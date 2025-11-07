import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LoginPage onLogin={setUser} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Router>
  );
}

export default App;