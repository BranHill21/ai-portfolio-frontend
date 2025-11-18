import React, { useState } from "react";
import API from "../api";
import { Alert, Button, Form } from "react-bootstrap";

const Insights = ({ user }) => {
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("");

  // ---------- Alerts ----------
  const [alert, setAlert] = useState({ message: "", type: "", show: false });

  const showAlert = (message, type = "success") => {
    setAlert({ message, type, show: true });

    // Auto-dismiss after 3s
    setTimeout(() => {
      setAlert({ show: false });
    }, 3000);
  };

  // ---------- Wake Backend First ----------
  // const wakeBackend = async () => {
  //   try {
  //     // This should be a very fast and harmless endpoint
  //     await API.get("/api/predict/ping");
  //   } catch (err) {
  //     console.error("Wake error:", err);
  //   }
  // };
  async function fetchWithRetry(fn, retries = 3, delay = 400) {
    try {
      return await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(fn, retries - 1, delay * 1.5);
    }
  }

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    try {
      // Step 1 Wake backend (no error if asleep)
      // await wakeBackend();

      // Step 2 Now make real prediction request
      const res = await fetchWithRetry(() =>
        API.post("/api/predict", { symbol })
      );


      setPrediction(res.data);
      setQuantity("");
      showAlert("Prediction loaded successfully!");
    } catch (err) {
      console.error(err);
      showAlert("Failed to load prediction. Please try again.", "danger");
    }

    setLoading(false);
  };

  const addAsset = async () => {
    if (!quantity || quantity <= 0) {
      showAlert("Please enter a valid quantity.", "danger");
      return;
    }

    try {
      const res = await API.post("/api/assets/addAsset", {
        symbol: prediction.symbol,
        buyPrice: prediction.current_price,
        quantity: Number(quantity),
        userId: user.id,
      });

      // Invalidate cache ensures dashboard reloads latest assets
      localStorage.removeItem("assets_expires");

      console.log("Asset added:", res);
      showAlert("Asset added successfully!");
    } catch (err) {
      console.error(err);
      showAlert("Failed to add asset", "danger");
    }
  };

  return (
    <div className="container mt-4">
      {/* Alerts */}
      {alert.show && (
        <Alert
          variant={alert.type}
          dismissible
          onClose={() => setAlert({ show: false })}
        >
          {alert.message}
        </Alert>
      )}

      <h2>Market Insights</h2>

      {/* SYMBOL INPUT */}
      <Form.Control
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter Stock/Crypto Symbol (AAPL, BTC-USD)"
        className="mb-2"
      />
      <Button onClick={handlePredict} disabled={!symbol || loading}>
        {loading ? "Loading..." : "Get Prediction"}
      </Button>

      {/* SHOW PREDICTION */}
      {prediction && (
        <div style={{ marginTop: "2rem" }}>
          <h3>{prediction.symbol}</h3>
          <p>Price Change: {prediction.price_change}%</p>
          <p>Sentiment: {prediction.sentiment}</p>
          <h4>Recommendation: {prediction.recommendation}</h4>

          {user ? (
            <>
              {/* Quantity */}
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="mt-3 mb-2"
              />

              <Button onClick={addAsset}>Add to your assets</Button>
            </>
          ) : (
            <p>Logging in will allow you to track assets.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;