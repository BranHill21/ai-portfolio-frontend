// Insights.jsx
import React, { useState } from "react";
import API from "../api";
import { Alert, Button, Form, Collapse } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  // Bar
} from "recharts";

const safeNum = (v, fallback = null) => {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return fallback;
  return Number(v);
};

const buildChartData = (chart) => {
  // construct data array safely using the shortest array length we have
  if (!chart || !chart.dates) return [];
  const dates = chart.dates || [];
  // determine best length available using known arrays (close is preferred)
  const lengths = [
    dates.length,
    chart.close?.length || 0,
    chart.bb_upper?.length || 0,
    chart.bb_lower?.length || 0,
    chart.ema_20?.length || 0,
    chart.rsi_14?.length || 0,
    chart.macd?.length || 0,
    chart.macd_signal?.length || 0,
    chart.macd_hist?.length || 0,
    chart.vol?.length || 0,
    chart.vol_mean_20?.length || 0,
    chart.sma_7?.length || 0,
    chart.sma_20?.length || 0
  ];
  const minLen = Math.max(0, Math.min(...lengths.filter((n) => n > 0)));
  const useLen = minLen > 0 ? minLen : dates.length;

  const data = [];
  for (let i = 0; i < useLen; i++) {
    data.push({
      date: dates[i] || `i${i}`,
      close: safeNum(chart.close?.[i]),
      bb_upper: safeNum(chart.bb_upper?.[i]),
      bb_lower: safeNum(chart.bb_lower?.[i]),
      ema_20: safeNum(chart.ema_20?.[i]),
      rsi_14: safeNum(chart.rsi_14?.[i]),
      macd: safeNum(chart.macd?.[i]),
      macd_signal: safeNum(chart.macd_signal?.[i]),
      macd_hist: safeNum(chart.macd_hist?.[i]),
      vol: safeNum(chart.vol?.[i]),
      vol_mean_20: safeNum(chart.vol_mean_20?.[i]),
      sma_7: safeNum(chart.sma_7?.[i]),
      sma_20: safeNum(chart.sma_20?.[i])
    });
  }
  return data;
};

const ExplanationBlock = ({ title, children, open, onToggle }) => (
  <div className="mt-2">
    <Button
      variant="link"
      onClick={onToggle}
      style={{ padding: 0, marginBottom: 8 }}
    >
      {open ? "Hide explanation ▲" : "What does this mean? ▼"}
    </Button>
    <Collapse in={open}>
      <div
        style={{
          borderLeft: "3px solid #eee",
          padding: "10px 14px",
          background: "#fafafa",
          borderRadius: 4,
        }}
      >
        <h6 style={{ marginTop: 0 }}>{title}</h6>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
      </div>
    </Collapse>
  </div>
);

const Insights = ({ user }) => {
  const [symbol, setSymbol] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "", show: false });

  // explanation toggles per chart
  const [openBBExplain, setOpenBBExplain] = useState(false);
  // const [openEMAExplain, setOpenEMAExplain] = useState(false);
  const [openRSIExplain, setOpenRSIExplain] = useState(false);
  const [openMACDExplain, setOpenMACDExplain] = useState(false);
  const [openVolExplain, setOpenVolExplain] = useState(false);
  const [openShortExplain, setOpenShortExplain] = useState(false);
  const [openLongExplain, setOpenLongExplain] = useState(false);
  const [openFundExplain, setOpenFundExplain] = useState(false);

  const showAlert = (message, type = "success") => {
    setAlert({ message, type, show: true });
    setTimeout(() => {
      setAlert({ show: false });
    }, 3000);
  };

  async function fetchWithRetry(fn, retries = 3, delay = 400) {
    try {
      return await fn();
    } catch (err) {
      if (retries <= 0) throw err;
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(fn, retries - 1, delay * 1.5);
    }
  }

  const handlePredict = async (useSimple = false) => {
    // same logic: call /predict (default) or /predict/simple if useSimple true
    setLoading(true);
    setPrediction(null);

    try {
      const endpoint = useSimple ? "/api/predict/simple" : "/api/predict";
      const res = await fetchWithRetry(() =>
        API.post(endpoint, { symbol })
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

      localStorage.removeItem("assets_expires");
      console.log("Asset added:", res);
      showAlert("Asset added successfully!");
    } catch (err) {
      console.error(err);
      showAlert("Failed to add asset", "danger");
    }
  };

  // Prepare chart data safely when prediction exists
  const chartData = prediction?.chart ? buildChartData(prediction.chart) : [];

  return (
    <div className="container mt-4">
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

      <div className="mb-3 d-flex gap-2">
        {/* simple endpoint available to anyone */}
        {/* <Button
          variant="outline-primary"
          onClick={() => handlePredict(true)}
          disabled={!symbol || loading}
        >
          {loading ? "Loading..." : "Get Simple Prediction"}
        </Button> */}

        {/* full /predict only for logged-in users */}
        <Button
          onClick={() => handlePredict(false)}
          disabled={!symbol || loading || !user}
          title={user ? "" : "Login required for full prediction"}
        >
          {loading ? "Loading..." : user ? "Get Full Prediction" : "Login to use full"}
        </Button>
      </div>

      {/* SHOW PREDICTION */}
      {prediction && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: 0 }}>
            {prediction.symbol}{" "}
            <small style={{ color: "#666", fontSize: 14 }}>
              ${prediction.current_price?.toFixed?.(2) ?? prediction.current_price}
            </small>
          </h3>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 8 }}>
            <div>
              <strong>Total Change:</strong>{" "}
              {prediction.price_change_pct_history ?? "N/A"}%
            </div>
            <div>
              <strong>Short Sentiment:</strong>{" "}
              {prediction.short_term?.sentiment_compound ?? prediction.short_term?.sentiment ?? "N/A"}
            </div>
            <div>
              <strong>Short Recommendation:</strong>{" "}
              {prediction.short_term?.recommendation ?? "N/A"}
            </div>
            <div>
              <strong>Short Confidence:</strong>{" "}
              {prediction.short_term?.confidence ?? prediction.short_term?.score ?? "N/A"}
            </div>
          </div>

          {/* Short-term reasoning */}
          <div className="mt-3">
            <h5>Short-Term Reasoning</h5>
            <p style={{ marginBottom: 6 }}>
              {prediction.short_term?.reasoning ||
                (Array.isArray(prediction.short_term?.reasoning)
                  ? prediction.short_term.reasoning.join(", ")
                  : prediction.short_term?.reasoning) ||
                "No short-term reasoning available."}
            </p>

            <ExplanationBlock
              title="Short-term recommendation explained"
              open={openShortExplain}
              onToggle={() => setOpenShortExplain(!openShortExplain)}
            >
              <p>
                This is a *quick* view meant for the next few days. The service analyzes momentum
                (recent price moves), momentum indicators like RSI and MACD, simple candlestick patterns,
                and whether trading volume supports the move. A higher confidence means stronger alignment
                between indicators.
              </p>
              <ul>
                <li><strong>BUY</strong> — indicators lean upward.</li>
                <li><strong>SELL</strong> — indicators lean downward.</li>
                <li><strong>HOLD</strong> — mixed signals or uncertainty.</li>
              </ul>
              <p>Remember: short-term predictions are riskier — treat them as quick ideas, not guarantees.</p>
            </ExplanationBlock>
          </div>

          {/* Long-Term view */}
          <div className="mt-3">
            <h5>Long-Term Outlook (6–24 months)</h5>
            <p><strong>Recommendation:</strong> {prediction.long_term?.recommendation ?? "N/A"}</p>
            <p><strong>Score:</strong> {prediction.long_term?.score ?? prediction.long_term?.confidence ?? "N/A"}</p>
            <p>{prediction.long_term?.reasoning ?? "No long-term reasoning available."}</p>

            <ExplanationBlock
              title="Long-term outlook explained"
              open={openLongExplain}
              onToggle={() => setOpenLongExplain(!openLongExplain)}
            >
              <p>
                The long-term view uses returns over 6 months — 1 year, volatility, and simple fundamental metrics
                (P/E, dividend yield, market cap, beta). It's meant to help decide whether a stock could be a
                candidate to hold for many months, not for day trading.
              </p>
              <ul>
                <li><strong>Long-term buy</strong> — longer-term trend + reasonable volatility.</li>
                <li><strong>Hold / Accumulate</strong> — okay fundamentals and trend.</li>
                <li><strong>Neutral / Watch</strong> — mixed signals; monitor.</li>
                <li><strong>Avoid / High risk</strong> — high volatility or deteriorating fundamentals.</li>
              </ul>
            </ExplanationBlock>
          </div>

          {/* FUNDAMENTALS */}
          <div className="mt-3">
            <h5>Fundamentals</h5>
            <ul>
              <li><strong>Company:</strong> {prediction.fundamentals?.shortName ?? "N/A"}</li>
              <li><strong>Market Cap:</strong> {prediction.fundamentals?.marketCap ? Number(prediction.fundamentals.marketCap).toLocaleString() : "N/A"}</li>
              <li><strong>Sector:</strong> {prediction.fundamentals?.sector ?? "N/A"}</li>
              <li><strong>Trailing P/E:</strong> {prediction.fundamentals?.trailingPE ?? "N/A"}</li>
              <li><strong>Forward P/E:</strong> {prediction.fundamentals?.forwardPE ?? "N/A"}</li>
              <li><strong>Dividend Yield:</strong> {prediction.fundamentals?.dividendYield ?? "N/A"}</li>
              <li><strong>Beta:</strong> {prediction.fundamentals?.beta ?? "N/A"}</li>
            </ul>

            <ExplanationBlock
              title="Fundamental metrics explained"
              open={openFundExplain}
              onToggle={() => setOpenFundExplain(!openFundExplain)}
            >
              <p>These are company-level measures that help evaluate long-term suitability:</p>
              <ul>
                <li><strong>Market Cap</strong> — company size. Large cap = more stable on average.</li>
                <li><strong>P/E (Price-to-Earnings)</strong> — how the market values earnings. Very high P/E can mean expensive expectations.</li>
                <li><strong>Dividend Yield</strong> — yearly dividend as % of price. Provides income if present.</li>
                <li><strong>Beta</strong> — how volatile compared to the market. Beta /greaterthan 1 = more volatile than market.</li>
              </ul>
            </ExplanationBlock>
          </div>

          {/* CHARTS SECTION */}
          {prediction?.chart && chartData.length > 0 && (
            <div className="mt-4">
              {/* BB (Close + BB upper/lower) */}
              <div className="mb-4">
                <h4>Price Chart — Close + Bollinger Bands + EMA</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="close" stroke="#007bff" dot={false} name="Close" />
                    <Line type="monotone" dataKey="bb_upper" stroke="#28a745" dot={false} name="BB Upper" />
                    <Line type="monotone" dataKey="bb_lower" stroke="#dc3545" dot={false} name="BB Lower" />
                    <Line type="monotone" dataKey="ema_20" stroke="#6542b7ff" dot={false} name="EMA 20" />
                  </LineChart>
                </ResponsiveContainer>

                <ExplanationBlock
                  title="Bollinger Bands explained + EMA"
                  open={openBBExplain}
                  onToggle={() => setOpenBBExplain(!openBBExplain)}
                >
                  <p>
                    <strong>Bollinger Bands</strong> are two lines (upper and lower) drawn a couple of standard deviations above
                    and below the 20-day moving average. They show how stretched a price move is.
                  </p>
                  <ul>
                    <li>If price touches the upper band often, it may be overbought in the short-term.</li>
                    <li>If price touches the lower band often, it may be oversold.</li>
                    <li>When bands tighten (narrow), volatility is low and a move often follows; when bands widen, volatility is high.</li>
                  </ul>
                  <p>
                    EMA stands for <strong>Exponential Moving Average</strong>. The EMA gives more weight to recent prices,
                    so it reacts faster than a simple moving average. The 20-day EMA is a common short-to-medium trend indicator.
                  </p>
                  <p>
                    Price above EMA → short-term uptrend. Price below EMA → short-term downtrend. The EMA helps smooth noise.
                  </p>
                </ExplanationBlock>
              </div>

              {/* EMA 20 + Close
              <div className="mb-4">
                <h4>Price Chart — Close + EMA 20</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="close" stroke="#007bff" dot={false} name="Close" />
                    <Line type="monotone" dataKey="ema_20" stroke="#28a745" dot={false} name="EMA 20" />
                  </LineChart>
                </ResponsiveContainer>

                <ExplanationBlock
                  title="EMA 20 explained"
                  open={openEMAExplain}
                  onToggle={() => setOpenEMAExplain(!openEMAExplain)}
                >
                  <p>
                    EMA stands for <strong>Exponential Moving Average</strong>. The EMA gives more weight to recent prices,
                    so it reacts faster than a simple moving average. The 20-day EMA is a common short-to-medium trend indicator.
                  </p>
                  <p>
                    Price above EMA → short-term uptrend. Price below EMA → short-term downtrend. The EMA helps smooth noise.
                  </p>
                </ExplanationBlock>
              </div> */}

              {/* RSI */}
              <div className="mb-4">
                <h4>RSI (Relative Strength Index) — 14</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rsi_14" stroke="#007bff" dot={false} name="RSI 14" />
                    {/* zone lines */}
                    <Line type="monotone" dataKey={() => 70} stroke="#28a745" dot={false} name="Overbought (70)" />
                    <Line type="monotone" dataKey={() => 30} stroke="#dc3545" dot={false} name="Oversold (30)" />
                  </LineChart>
                </ResponsiveContainer>

                <ExplanationBlock
                  title="RSI explained (for beginners)"
                  open={openRSIExplain}
                  onToggle={() => setOpenRSIExplain(!openRSIExplain)}
                >
                  <p>
                    RSI measures how fast price changed recently. Values run 0-100:
                  </p>
                  <ul>
                    <li><strong>\greaterthan70</strong> — often considered <em>overbought</em> (many buyers recently).</li>
                    <li><strong>\lessthan30</strong> — often considered <em>oversold</em> (many sellers recently).</li>
                    <li>Between 30-70 is neutral. RSI helps spot short-term extremes — not a guaranteed trade signal.</li>
                  </ul>
                </ExplanationBlock>
              </div>

              {/* MACD */}
              <div className="mb-4">
                <h4>MACD (Moving Average Convergence Divergence)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="macd" stroke="#28a745" dot={false} name="MACD" />
                    <Line type="monotone" dataKey="macd_signal" stroke="#dc3545" dot={false} name="Signal" />
                    <Line type="monotone" dataKey="macd_hist" stroke="#007bff" dot={false} name="Hist" />
                  </LineChart>
                </ResponsiveContainer>

                <ExplanationBlock
                  title="MACD explained"
                  open={openMACDExplain}
                  onToggle={() => setOpenMACDExplain(!openMACDExplain)}
                >
                  <p>
                    MACD compares two EMAs (fast & slow) to show momentum shifts. The MACD line minus its signal line
                    is shown as the histogram:
                  </p>
                  <ul>
                    <li><strong>MACD line above signal</strong> — bullish momentum.</li>
                    <li><strong>MACD line below signal</strong> — bearish momentum.</li>
                    <li>Rising histogram bars usually mean strengthening momentum; falling bars mean weakening.</li>
                  </ul>
                  <p>MACD is useful for spotting trend changes, but combine with other checks like volume and price structure.</p>
                </ExplanationBlock>
              </div>

              {/* VOLUME */}
              <div className="mb-4">
                <h4>Volume (and 20-day avg)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" hide={true} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="vol" stroke="#32ce57ff" dot={false} name="Volume" />
                    <Line type="monotone" dataKey="vol_mean_20" stroke="#00801eff" dot={false} name="20-day Avg Vol" />
                  </LineChart>
                </ResponsiveContainer>

                <ExplanationBlock
                  title="Volume explained"
                  open={openVolExplain}
                  onToggle={() => setOpenVolExplain(!openVolExplain)}
                >
                  <p>
                    Volume is how many shares/contracts traded. Volume helps confirm moves:
                  </p>
                  <ul>
                    <li>Price up + rising volume → move likely supported.</li>
                    <li>Price up + low volume → move may be weak (less conviction).</li>
                    <li>Volume spikes often occur at important events (news, earnings).</li>
                  </ul>
                </ExplanationBlock>
              </div>
            </div>
          )}

          {/* Candlestick patterns & Forecast */}
          <div className="mt-3">
            <h5>Candlestick Patterns</h5>
            {prediction.short_term?.candlestick_patterns?.length > 0 ? (
              <ul>
                {prediction.short_term.candlestick_patterns.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            ) : (
              <p>No major patterns detected.</p>
            )}
          </div>

          <div className="mt-3">
            <h5>7-Day Forecast (short-term)</h5>
            {prediction.short_term?.forecast_next_days?.length > 0 ? (
              <ul>
                {prediction.short_term.forecast_next_days.map((val, i) => (
                  <li key={i}>Day {i + 1}: ${Number(val).toFixed(2)}</li>
                ))}
              </ul>
            ) : (
              <p>No forecast available.</p>
            )}
          </div>

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