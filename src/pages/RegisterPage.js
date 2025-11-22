import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await API.post("/api/users/register", form);
      navigate("/");
    } catch (err) {
      setMessage("Registration failed.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Account</h2>

      <form onSubmit={submit} className={styles.formCard}>
        <input
          name="username"
          placeholder="Username"
          className={styles.input}
          onChange={change}
          required
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          className={styles.input}
          onChange={change}
          required
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          className={styles.input}
          onChange={change}
          required
        />

        <input
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          className={styles.input}
          onChange={change}
          required
        />

        <button type="submit" className={styles.button}>
          Register
        </button>

        <p className={styles.message}>{message}</p>
      </form>
    </div>
  );
}