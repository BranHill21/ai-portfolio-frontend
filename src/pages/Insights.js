import React, { useState } from "react";
import API from "../api";
import { Alert, Button, Form } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

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

      {prediction && (
        <div style={{ marginTop: "2rem" }}>
          <h3>{prediction.symbol}</h3>
          <p><strong>Current Price:</strong> ${prediction.current_price}</p>
          <p><strong>Total Change:</strong> {prediction.price_change_pct_history}%</p>
          <p><strong>Sentiment Score:</strong> {prediction.short_term.sentiment_compound}</p>

          <h4 className="mt-3">Short-Term Outlook</h4>
          <p><strong>Recommendation:</strong> {prediction.short_term.recommendation}</p>
          <p><strong>Score:</strong> {prediction.short_term.confidence}</p>
          <p>{prediction.short_term.reasoning}</p>

          <h4 className="mt-3">Long-Term Outlook (6-24 months)</h4>
          <p><strong>Recommendation:</strong> {prediction.long_term?.recommendation}</p>
          <p><strong>Score:</strong> {prediction.long_term?.score}</p>
          <p>{prediction.long_term?.reasoning}</p>

          <div className="mt-2">
            <strong>Returns:</strong>
            <ul>
              <li>6-month return: {prediction.long_term?.returns?.six_month_return_pct}%</li>
              <li>1-year return: {prediction.long_term?.returns?.one_year_return_pct}%</li>
              <li>Overall period: {prediction.long_term?.returns?.full_period_return_pct}%</li>
            </ul>
            <p><strong>Annual Volatility:</strong> {prediction.long_term?.volatility_annual_pct}%</p>
          </div>

          <h4 className="mt-3">Fundamentals</h4>
          <ul>
            <li>Company: {prediction.fundamentals?.shortName}</li>
            <li>Market Cap: {prediction.fundamentals?.marketCap?.toLocaleString()}</li>
            <li>Sector: {prediction.fundamentals?.sector}</li>
            <li>Trailing PE: {prediction.fundamentals?.trailingPE}</li>
            <li>Forward PE: {prediction.fundamentals?.forwardPE}</li>
            <li>Dividend Yield: {prediction.fundamentals?.dividendYield}</li>
            <li>Beta: {prediction.fundamentals?.beta}</li>
            <li>Currency: {prediction.fundamentals?.currency}</li>
            <li>Exchange: {prediction.fundamentals?.exchange}</li>
          </ul>

          <h4 className="mt-3">Technical Indicators (Latest)</h4>
          <ul>
            <li>RSI 14: {prediction.chart?.rsi_14}</li>
            <li>SMA 7: {prediction.chart?.sma_7}</li>
            <li>SMA 20: {prediction.chart?.sma_20}</li>
            <li>EMA 20: {prediction.chart?.ema_20}</li>
            {/* <li>MACD: {prediction.chart?.macd}</li>
            <li>MACD Signal: {prediction.chart?.macd_signal}</li> */}
            <li>MACD Hist: {prediction.chart?.macd_hist}</li>
            {/* <li>Stoch %K: {prediction.chart?.stoch_k}</li>
            <li>Stoch %D: {prediction.chart?.stoch_d}</li>
            <li>Bollinger Mid: {prediction.chart?.bb_mid}</li> */}
            <li>Bollinger Upper: {prediction.chart?.bb_upper}</li>
            <li>Bollinger Lower: {prediction.chart?.bb_lower}</li>
            {/* <li>ATR 14: {prediction.chart?.atr_14}</li>
            <li>Volume: {prediction.chart?.vol}</li>
            <li>20-day Vol Avg: {prediction.chart?.vol_mean_20}</li> */}
          </ul>

          <h4 className="mt-3">Candlestick Patterns</h4>
          {prediction.patterns?.length > 0 ? (
            <ul>
              {prediction.short_term.candlestick_patterns.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          ) : (
            <p>No major patterns detected.</p>
          )}

          <h4 className="mt-3">7-Day Forecast</h4>
          <ul>
            {prediction.short_term.forecast_next_days?.map((val, i) => (
              <li key={i}>Day {i + 1}: ${val.toFixed(2)}</li>
            ))}
          </ul>

          {prediction?.chart && (
            <div className="mt-4">
              <h4>Price Chart (Close + Bollinger Bands)</h4>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={prediction.chart.dates.map((date, i) => ({
                    date,
                    close: prediction.chart.close[i],
                    bb_upper: prediction.chart.bb_upper[i],
                    bb_lower: prediction.chart.bb_lower[i],
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" hide={true} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#007bff"
                    dot={false}
                    name="Close"
                  />

                  <Line
                    type="monotone"
                    dataKey="bb_upper"
                    stroke="#28a745"
                    dot={false}
                    name="Bollinger Upper"
                  />

                  <Line
                    type="monotone"
                    dataKey="bb_lower"
                    stroke="#dc3545"
                    dot={false}
                    name="Bollinger Lower"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Quantity + Add Asset */}
          {user && (
            <>
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
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;