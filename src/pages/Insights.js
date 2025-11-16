import React, { useState } from "react";
import API from "../api";

const Insights = ({ user }) => {
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEW: quantity input for stock amount
  const [quantity, setQuantity] = useState("");

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await API.post("/api/predict", { symbol });
      setPrediction(res.data);
      setQuantity(""); // reset quantity every new prediction
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addAsset = async () => {
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      const res = await API.post("/api/assets/addAsset", {
        symbol: prediction.symbol,
        buyPrice: prediction.current_price,
        quantity: Number(quantity),
        userId: user.id,
      });

      // Invalidate local asset cache so dashboard refreshes assets
      localStorage.removeItem("assets_expires");

      console.log("Asset added:", res);
      alert("Asset added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add asset");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Market Insights</h2>

      {/* SYMBOL INPUT */}
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter Stock/Crypto Symbol (e.g., AAPL, BTC-USD)"
      />
      <button onClick={handlePredict} disabled={!symbol || loading}>
        {loading ? "Loading..." : "Get Prediction"}
      </button>

      {/* SHOW PREDICTION */}
      {prediction && (
        <div style={{ marginTop: "2rem" }}>
          <h3>{prediction.symbol}</h3>
          <p>Price Change: {prediction.price_change}%</p>
          <p>Sentiment: {prediction.sentiment}</p>
          <h4>Recommendation: {prediction.recommendation}</h4>

          {/* ONLY SHOW QUANTITY FIELD + BUTTON IF USER LOGGED IN */}
          {user ? (
            <>
              {/* NEW: quantity input */}
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                style={{ marginTop: "1rem", marginRight: "1rem" }}
              />

              <button onClick={addAsset}>Add to your assets</button>
            </>
          ) : (
            <p>Logging in will allow you to track various assets.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;