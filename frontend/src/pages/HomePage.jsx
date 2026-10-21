import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import PropTypes from "prop-types";
import "../styles/Home.css";

const HomePage = ({ darkMode }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className={`home-wrapper ${darkMode ? "dark" : ""}`}>
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            AI-Powered <span className="gradient-text">Medical Diagnosis</span> at your fingertips.
          </h1>
          <p className="hero-subtitle">
            Enter your symptoms and let our advanced machine learning model analyze them against thousands of medical records to provide instant, accurate predictions and precautions.
          </p>
          <div className="hero-actions">
            <button 
              className="primary-hero-btn"
              onClick={() => navigate(token ? "/diagnosis" : "/login")}
            >
              {token ? "Go to Diagnosis" : "Get Started Now"}
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          {/* A subtle glowing UI mockup made with CSS */}
          <div className="mockup-card">
            <div className="mockup-header">
              <div className="mockup-dot red"></div>
              <div className="mockup-dot yellow"></div>
              <div className="mockup-dot green"></div>
            </div>
            <div className="mockup-body">
              <div className="mockup-line long"></div>
              <div className="mockup-line short"></div>
              <div className="mockup-pill">Headache</div>
              <div className="mockup-pill">High Fever</div>
              <div className="mockup-btn">Analyze Symptoms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why use DiagnoFast?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Results</h3>
            <p>No waiting rooms. Get top 3 probable diagnoses and probabilities in seconds.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Smart Symptom Matching</h3>
            <p>Our AI uses fuzzy matching and synonym mapping, so it understands how you actually type.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure History</h3>
            <p>Your diagnosis history is saved securely to your profile so you can track your health over time.</p>
          </div>
          
        </div>
      </div>

    </div>
  );
};

HomePage.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default HomePage;