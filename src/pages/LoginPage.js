import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) navigate("/dashboard");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/users/login", form);
      onLogin(res.data);
      navigate("/dashboard");
    } catch {
      setMessage("Invalid username or password.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            className={styles.input}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className={styles.input}
            onChange={handleChange}
            required
          />

          <button className={styles.button} type="submit">
            Login
          </button>
        </form>

        {message && <p className={styles.error}>{message}</p>}

        <p className={styles.footer}>
          Don't have an account? <a href="/register">Register Here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;