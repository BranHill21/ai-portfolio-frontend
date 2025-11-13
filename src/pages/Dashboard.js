import React, { useEffect, useState } from "react";
import API from "../api";

const Dashboard = ({ user }) => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (!user?.id) return; // prevents running before user exists

    const fetchAssets = async () => {
      try {
        const res = await API.get(`/api/assets/${user.id}`);
        setAssets(res.data);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };

    fetchAssets();
  }, [user?.id]); // includes dependency, removes warning

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard</h1>
      {user ? (
        <>
          <p>
            Hello, <strong>{user.username}</strong>
          </p>
          <p>Here are your personalized insights and portfolio details.</p>
        </>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}

      {assets.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Buy Price</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.symbol}</td>
                <td>{asset.quantity}</td>
                <td>${asset.buyPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assets found for this user.</p>
      )}
    </div>
  );
};

export default Dashboard;