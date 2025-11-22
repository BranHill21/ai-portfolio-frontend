import Threads from "./Threads";
import { useNavigate } from "react-router-dom";

const Landing = () => {
    const navigate = useNavigate();

    const goToLogin = async (e) => {
        e.preventDefault();
        navigate("/login");
    };

    const goToRegister = async (e) => {
        e.preventDefault();
        navigate("/register");
    };

    return (
        <div style={{ position: "relative", overflow: "hidden" }}>
        {/* ---------------- BACKGROUND THREADS ---------------- */}
        <div
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,               // Keeps it behind everything
            pointerEvents: "none",    // Prevents it from blocking clicks
            }}
        >
            <Threads
            amplitude={1}
            distance={0.2}
            enableMouseInteraction={false}
            color={[0, 1, 0]}
            />
        </div>

        {/* ---------------- FOREGROUND CONTENT ---------------- */}
        <div
            style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            paddingTop: "20vh",
            color: "black",
            }}
        >
            <h1>Stockfolioai</h1>
            <p>Wall street level analytics brought to your computer</p>

            <button style={{ padding: "10px 20px", marginTop: "20px" }} onClick={goToLogin}>
            Login
            </button>
            <button style={{ padding: "10px 20px", marginTop: "20px" }} onClick={goToRegister}>
            Register
            </button>
        </div>
        </div>
    );
};

export default Landing;