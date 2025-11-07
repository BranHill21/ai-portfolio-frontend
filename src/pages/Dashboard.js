import React, { useEffect, useState } from "react";
import API from "../api";

const Dashboard = () => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await API.get("/assets");
        setAssets(res.data);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
    };
    fetchAssets();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Portfolio</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Average Cost</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>{asset.symbol}</td>
              <td>{asset.quantity}</td>
              <td>${asset.averageCost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;