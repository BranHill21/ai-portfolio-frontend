import React, { useEffect, useState } from "react";
import API from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = ({ user, assets, setAssets }) => {
  const [loading, setLoading] = useState(false);

  // ---------- MODAL STATES ----------
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentAsset, setCurrentAsset] = useState(null);

  // Update fields
  const [newQuantity, setNewQuantity] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");

  // Alerts
  const [alert, setAlert] = useState(null);

  // ---------- FUNCTIONS FOR ALERTS ----------
  const pushAlert = (msg, variant = "success") => {
    setAlert({ msg, variant });

    setTimeout(() => {
      setAlert(null);
    }, 3000);
  };

  // ---------------- FETCH ASSETS ----------------
  useEffect(() => {
    if (!user) return;

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

  // -------------- OPEN UPDATE MODAL --------------
  const beginUpdate = (asset) => {
    setCurrentAsset(asset);
    setNewQuantity(asset.quantity);
    setNewBuyPrice(asset.buyPrice);
    setShowUpdateModal(true);
  };

  // ---------------- UPDATE ASSET ----------------
  const handleUpdate = async () => {
    try {
      const updated = {
        ...currentAsset,
        quantity: Number(newQuantity),
        buyPrice: Number(newBuyPrice),
      };

      await API.put(`/api/assets/update/${currentAsset.id}`, updated);

      const newList = assets.map((a) =>
        a.id === currentAsset.id ? updated : a
      );

      setAssets(newList);
      setShowUpdateModal(false);
      pushAlert("Asset updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      pushAlert("Update failed!", "danger");
    }
  };

  // -------------- OPEN DELETE MODAL --------------
  const beginDelete = (asset) => {
    setCurrentAsset(asset);
    setShowDeleteModal(true);
  };

  // ---------------- DELETE ASSET ----------------
  const handleDelete = async () => {
    try {
      await API.delete(`/api/assets/delete/${currentAsset.id}`);

      const newList = assets.filter((a) => a.id !== currentAsset.id);
      setAssets(newList);

      setShowDeleteModal(false);
      pushAlert("Asset deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      pushAlert("Delete failed!", "danger");
    }
  };

  if (!user) return <p>Please log in.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>
        Hello, <b>{user.username}</b>
      </p>

      {/* Bootstrap Alert */}
      {alert && (
        <div className={`alert alert-${alert.variant} alert-dismissible fade show`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {loading && <p>Loading assets...</p>}

      {!loading && assets && assets.length > 0 ? (
        <table className="table table-bordered mt-3">
          <thead className="table-dark">
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
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
                  <button className="btn btn-primary btn-sm me-2" onClick={() => beginUpdate(asset)}>
                    Update
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => beginDelete(asset)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No assets found.</p>
      )}

      {/* ---------------- UPDATE MODAL ---------------- */}
      {showUpdateModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Update Asset</h5>
                <button className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
              </div>

              <div className="modal-body">
                <label>Quantity</label>
                <input
                  type="number"
                  className="form-control mb-3"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                />

                <label>Buy Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={newBuyPrice}
                  onChange={(e) => setNewBuyPrice(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>

              <div className="modal-body">
                <p>Are you sure you want to delete <b>{currentAsset.symbol}</b>?</p>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop (greys out background) */}
      {(showUpdateModal || showDeleteModal) && (
        <div className="modal-backdrop fade show"></div>
      )}

    </div>
  );
};

export default Dashboard;