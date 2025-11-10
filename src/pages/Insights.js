import React, { useState } from "react";
import API from "../api";

const Insights = () => {
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await API.post("/predict", { symbol });
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
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
        </div>
      )}
    </div>
  );
};

export default Insights;