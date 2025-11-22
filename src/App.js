import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import TestPage from "./pages/TestPage";
import Landing from "./pages/Landing";

function App() {
  // ------------------ USER STATE ------------------
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    const expires = localStorage.getItem("user_expires");

    if (!saved || !expires) return null;

    if (Date.now() > Number(expires)) {
      localStorage.removeItem("user");
      localStorage.removeItem("user_expires");
      return null;
    }

    return JSON.parse(saved);
  });

  // ------------------ ASSETS STATE ------------------
  const [assets, setAssets] = useState(() => {
    const savedAssets = localStorage.getItem("assets");
    const assetsExpires = localStorage.getItem("assets_expires");

    if (!savedAssets || !assetsExpires) return null;

    if (Date.now() > Number(assetsExpires)) {
      localStorage.removeItem("assets");
      localStorage.removeItem("assets_expires");
      return null;
    }

    return JSON.parse(savedAssets);
  });

  // ------------------ SAVE TO LOCALSTORAGE ------------------
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));

      // Set user expiration = 12 hours
      localStorage.setItem("user_expires", (Date.now() + 12 * 60 * 60 * 1000).toString());
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("user_expires");
    }
  }, [user]);

  useEffect(() => {
    if (assets) {
      localStorage.setItem("assets", JSON.stringify(assets));

      // Assets expire every 60 minutes
      localStorage.setItem("assets_expires", (Date.now() + 60 * 60 * 1000).toString());
    }
  }, [assets]);

  return (
    <Router>
      <NavBar user={user} setUser={setUser} setAssets={setAssets} />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={<Dashboard user={user} assets={assets} setAssets={setAssets} />}
        />

        <Route path="/insights/" element={<Insights user={user} setAssets={setAssets} />} />
        <Route path="/insights/:symbol" element={<Insights user={user} setAssets={setAssets} />} />
        <Route path="/testpage" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;