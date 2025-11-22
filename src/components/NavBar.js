import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar({ user, setUser, setAssets }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setAssets(null);
    navigate("/");
  };

  return (
    <nav style={{ padding: "1rem", background: "#252629ff" }}>
      

      {!user && (
        <>
          <Link to="/" style={{ marginRight: "1rem" }}>Home</Link>
          <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
          <Link to="/register" style={{ marginRight: "1rem" }}>Register</Link>
        </>
      )}

      {user && (
        <>
          <Link to="/dashboard" style={{ marginRight: "1rem" }}>Dashboard</Link>
          <Link to="/insights" style={{ marginRight: "1rem" }}>Insights</Link>
          <span style={{ marginRight: "1rem" }}>Hi, {user.username}</span>
          <button onClick={logout}>Logout</button>
        </>
      )}
    </nav>
  );
}