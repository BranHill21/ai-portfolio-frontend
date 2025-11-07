// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "https://backend.render.com",
});

// You can add interceptors later for auth tokens if needed
export default API;