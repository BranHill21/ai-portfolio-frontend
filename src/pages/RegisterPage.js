import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

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
    <div style={{ padding: "2rem" }}>
      <h2>Create Account</h2>

      <form onSubmit={submit}>
        <input name="username" placeholder="Username" onChange={change} required />
        <br />
        <input name="email" placeholder="Email" type="email" onChange={change} required />
        <br />
        <input name="password" placeholder="Password" type="password" onChange={change} required />
        <br />
        <input name="confirmPassword" placeholder="Confirm Password" type="password" onChange={change} required />
        <br />
        <button type="submit">Register</button>
      </form>

      <p>{message}</p>
    </div>
  );
}