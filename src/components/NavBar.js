import React from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav style={{ padding: "1rem", background: "#20232a", color: "#61dafb" }}>
      <Link style={{ marginRight: "1rem", color: "#61dafb" }} to="/">Login</Link>
      <Link style={{ marginRight: "1rem", color: "#61dafb" }} to="/dashboard">Dashboard</Link>
      <Link style={{ marginRight: "1rem", color: "#61dafb" }} to="/insights">Insights</Link>
      {/* <Link style={{ marginRight: "1rem", color: "#61dafb" }} to="/testpage">TestPage</Link> */}
    </nav>
  );
};

export default NavBar;