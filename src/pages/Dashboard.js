import React, { useEffect, useState } from "react";
import API from "../api";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

const Dashboard = ({ user, assets, setAssets }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // ---------- Search + Pagination ----------
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredAssets = assets
    ? assets.filter((a) =>
        a.symbol.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ---------- Alerts ----------
  const [alert, setAlert] = useState({ message: "", type: "", show: false });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type, show: true });
    setTimeout(() => setAlert({ show: false }), 3000); // Auto dismiss
  };

  // ---------- Modal States ----------
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [newPrice, setNewPrice] = useState("");
  // ---------- USER UPDATE ----------
  const [showUserUpdateModal, setShowUserUpdateModal] = useState(false);
  const [updatedUsername, setUpdatedUsername] = useState(user?.username || "");
  const [updatedEmail, setUpdatedEmail] = useState(user?.email || "");
  const [updatedPassword, setUpdatedPassword] = useState("");

  // ---------- USER DELETE ----------
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  // ---------- Fetch Assets ----------
  useEffect(() => {
    if (!user) return;

    setUpdatedUsername(user.username);
    setUpdatedEmail(user.email);

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

  // ---------- Open Update Modal ----------
  const openUpdateModal = (asset) => {
    setActiveAsset(asset);
    setNewQuantity(asset.quantity);
    setNewPrice(asset.buyPrice);
    setShowUpdateModal(true);
  };

  // ---------- Open Delete Modal ----------
  const openDeleteModal = (asset) => {
    setActiveAsset(asset);
    setShowDeleteModal(true);
  };

  // ---------------- UPDATE ASSET ----------------
  const confirmUpdate = async () => {
    try {
      const updated = {
        ...activeAsset,
        quantity: Number(newQuantity),
        buyPrice: Number(newPrice),
      };

      await API.put(`/api/assets/update/${activeAsset.id}`, updated);

      const newList = assets.map((a) =>
        a.id === activeAsset.id ? updated : a
      );

      setAssets(newList);
      setShowUpdateModal(false);
      showAlert("Asset updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      showAlert("Update failed", "danger");
    }
  };

  // ---------------- DELETE ASSET ----------------
  const confirmDelete = async () => {
    try {
      await API.delete(`/api/assets/delete/${activeAsset.id}`);

      const newList = assets.filter((a) => a.id !== activeAsset.id);
      setAssets(newList);

      setShowDeleteModal(false);
      showAlert("Asset deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      showAlert("Delete failed", "danger");
    }
  };

  const confirmUserUpdate = async () => {
    try {
      const payload = {
        username: updatedUsername,
        email: updatedEmail
      };

      if (updatedPassword.trim()) {
        payload.password = updatedPassword;
      }

      const res = await API.put(`/api/users/${user.id}`, payload);

      localStorage.setItem("user", JSON.stringify(res.data));
      setUpdatedPassword("");
      setShowUserUpdateModal(false);

      showAlert("Profile updated successfully");
      window.location.reload(); // ensures navbar + state sync
    } catch (err) {
      console.error("User update failed:", err);
      showAlert("Profile update failed", "danger");
    }
  };

  const confirmUserDelete = async () => {
    try {
      await API.delete(`/api/users/${user.id}`);

      localStorage.clear();
      setAssets(null);

      navigate("/");
    } catch (err) {
      console.error("User delete failed:", err);
      showAlert("Account deletion failed", "danger");
    }
  };

  if (!user) return <p>Please log in.</p>;

  return (
    <div className={styles.containerDark}>

      {/* Alerts */}
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })}>
          {alert.message}
        </Alert>
      )}

      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Hello, <b>{user.username}</b></p>

      <div className={styles.userActions}>
        <Button
          variant="warning"
          className={styles.actionBtn}
          onClick={() => setShowUserUpdateModal(true)}
        >
          Update Profile
        </Button>

        <Button
          variant="danger"
          className={styles.actionBtn}
          onClick={() => setShowDeleteUserModal(true)}
        >
          Delete Account
        </Button>
      </div>

      {/* Search */}
      <Form.Control
        placeholder="Search assets..."
        className={styles.search}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {loading && <p>Loading assets...</p>}

      {!loading && paginatedAssets.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Buy Price</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} onClick={() =>
                navigate(`/insights/${asset.symbol}?buyPrice=${asset.buyPrice}&quantity=${asset.quantity}`)
              }>
                  <td>{asset.symbol}</td>
                  <td>{asset.quantity}</td>
                  <td>${asset.buyPrice}</td>
                  <td>
                    <Button size="sm" className={styles.actionBtn} onClick={(e) =>{ 
                      e.stopPropagation();
                      openUpdateModal(asset);
                      }}>
                      Update
                    </Button>{" "}
                    <Button size="sm" variant="danger" className={styles.actionBtn} onClick={(e) =>{ 
                      e.stopPropagation();
                      openDeleteModal(asset);
                      }}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className={styles.pageText}>
              Page {page} of {totalPages}
            </span>
            <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      ) : (
        <p>No assets found.</p>
      )}

      {/* ------------------- UPDATE MODAL ------------------- */}
      <Modal className={styles.modalDark} show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <label>Quantity</label>
            <Form.Control
              type="number"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <label>Buy Price</label>
            <Form.Control
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button onClick={confirmUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* ------------------- DELETE MODAL ------------------- */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete {activeAsset?.symbol}?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUserUpdateModal} onHide={() => setShowUserUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Profile</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <label>Username</label>
            <Form.Control
              value={updatedUsername}
              onChange={(e) => setUpdatedUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <label>Email</label>
            <Form.Control
              type="email"
              value={updatedEmail}
              onChange={(e) => setUpdatedEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group>
            <label>New Password (optional)</label>
            <Form.Control
              type="password"
              value={updatedPassword}
              onChange={(e) => setUpdatedPassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserUpdateModal(false)}>
            Cancel
          </Button>
          <Button onClick={confirmUserUpdate}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteUserModal} onHide={() => setShowDeleteUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          This action is permanent. Are you sure you want to delete your account?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteUserModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmUserDelete}>
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;