import { useState, useContext } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AuthContext from "../context/AuthContext";
import "../styles/Auth.css";

const Login = ({ darkMode }) => {
  const { login, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, bounce to /diagnosis
  if (token) return <Navigate to="/diagnosis" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/diagnosis", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-wrapper ${darkMode ? "dark" : ""}`}>
      <div className="auth-container">
        <div className="auth-brand" onClick={() => navigate("/")}>DiagnoFast</div>
        <h2>Welcome back</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-subtext">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

Login.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default Login;