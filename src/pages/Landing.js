import Threads from "./Threads";
import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";

const Landing = () => {
  const navigate = useNavigate();

  const goToLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const goToRegister = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <div className={styles.landingWrapper}>
      {/* Background Threads */}
      <div className={styles.background}>
        <Threads
          amplitude={2}
          distance={0.2}
          enableMouseInteraction={false}
          color={[0, 1, 0]}
        />
      </div>

      {/* Foreground Content */}
      <div className={styles.content}>
        <h1 className={styles.title}>Stockfolioai</h1>
        <p className={styles.subtitle}>
          Predictive stock analytics powered by institutional-grade intelligence.
        </p>

        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={goToLogin}>
            Login
          </button>
          <button className={styles.button} onClick={goToRegister}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;