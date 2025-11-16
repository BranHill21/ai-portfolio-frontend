import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
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
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <br />
        <button type="submit">Login</button>
      </form>

      <p>{message}</p>

      <p>
        Don't have an account? <a href="/register">Register Here</a>
      </p>
    </div>
  );
};

export default LoginPage;