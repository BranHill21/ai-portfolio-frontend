import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./NavBar.module.css";

export default function NavBar({ user, setUser, setAssets }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setAssets(null);
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        {!user && (
          <>
            <Link className={styles.link} to="/">Home</Link>
            <Link className={styles.link} to="/login">Login</Link>
            <Link className={styles.link} to="/register">Register</Link>
          </>
        )}

        {user && (
          <>
            <Link className={styles.link} to="/dashboard">Dashboard</Link>
            <Link className={styles.link} to="/insights">Insights</Link>
            <span className={styles.username}>Hi, {user.username}</span>
            <button className={styles.logoutBtn} onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}