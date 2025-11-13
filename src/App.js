import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import TestPage from "./pages/TestPage";

function App() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage if already logged in
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // const handleLogout = () => {
  //   setUser(null);
  //   localStorage.removeItem("user");
  //   navigate("/");
  // };

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <NavBar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<LoginPage onLogin={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/insights" element={<Insights user={user} />} />
        <Route path="/testpage" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;