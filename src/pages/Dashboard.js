import React, { useEffect, useState } from "react";
import API from "../api";

const Dashboard = ({ user, assets, setAssets }) => {
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH ASSETS ----------------
  useEffect(() => {
    if (!user) return;

    // if assets exist & not stale → do NOT fetch
    const expires = localStorage.getItem("assets_expires");
    if (assets && expires && Date.now() < Number(expires)) return;

    const fetchAssets = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/api/assets/${user.id}`);
        setAssets(res.data);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      }
      setLoading(false);
    };

    fetchAssets();
  }, [user, assets, setAssets]);

  // ---------------- UPDATE ASSET ----------------
  const updateAsset = async (asset) => {
    const newQuantity = prompt("Enter new quantity:", asset.quantity);
    if (newQuantity === null) return;

    const newPrice = prompt("Enter new buy price:", asset.buyPrice);
    if (newPrice === null) return;

    try {
      const updated = {
        ...asset,
        quantity: Number(newQuantity),
        buyPrice: Number(newPrice)
      };

      await API.put(`/api/assets/update/${asset.id}`, updated);
      // localStorage.removeItem("assets_expires");

      const newList = assets.map((a) =>
        a.id === asset.id ? updated : a
      );

      setAssets(newList); // saves into localStorage automatically
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // ---------------- DELETE ASSET ----------------
  const deleteAsset = async (asset) => {
    if (!window.confirm(`Delete ${asset.symbol}?`)) return;

    try {
      await API.delete(`/api/assets/delete/${asset.id}`);

      const newList = assets.filter((a) => a.id !== asset.id);
      setAssets(newList);
      // localStorage.removeItem("assets_expires");
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  if (!user) return <p>Please log in.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>Hello, <b>{user.username}</b></p>

      {/* <button
        onClick={() => {
          localStorage.clear();
          setAssets(null);
          window.location.reload();
        }}
      >
        Logout
      </button> */}

      {loading && <p>Loading assets...</p>}

      {!loading && assets && assets.length > 0 ? (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Qty</th>
              <th>Buy Price</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.symbol}</td>
                <td>{asset.quantity}</td>
                <td>${asset.buyPrice}</td>
                <td>
                  <button onClick={() => updateAsset(asset)}>Update</button>
                  <button onClick={() => deleteAsset(asset)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assets found.</p>
      )}
    </div>
  );
};

export default Dashboard;