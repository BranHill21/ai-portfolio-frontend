import React, { useState } from "react";
import API from "../api";

const Insights = ({ user }) => {
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await API.post("/api/predict", { symbol });
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addAsset = async () => {
    try {
      const res = await API.post("/api/assets/addAsset", {
        symbol: prediction.symbol,
        buyPrice: prediction.current_price,
        quantity: 1, // or user input
        userId: user.id,
      });
      localStorage.removeItem("assets_expires");
      console.log("Asset added: " + res);
    } catch (err) {
      alert(user.id);
      console.error(err);
      alert("Failed to add asset");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Market Insights</h2>
      <input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter Stock/Crypto Symbol (e.g., AAPL, BTC-USD)"
      />
      <button onClick={handlePredict} disabled={!symbol || loading}>
        {loading ? "Loading..." : "Get Prediction"}
      </button>

      {prediction && (
        <div style={{ marginTop: "2rem" }}>
          <h3>{prediction.symbol}</h3>
          <p>Price Change: {prediction.price_change}%</p>
          <p>Sentiment: {prediction.sentiment}</p>
          <h4>Recommendation: {prediction.recommendation}</h4>
          {user != null ? (<>
          <button onClick={addAsset} >Add to your assets</button>
          </>) 
          : (<>
          <p>Logging in will allow you to track various assets.</p>
          </>)}
          
        </div>
      )}
    </div>
  );
};

export default Insights;