import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/Diagnosis.css";

const Diagnosis = ({ darkMode }) => {
  const [symptomText, setSymptomText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handles saving the diagnosis to MongoDB via Node backend
  const saveDiagnosis = async (symptomsText, diagnosis, recommendation) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch("http://localhost:5000/users/save-diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          symptoms: [symptomsText], // saved as array to match your old schema
          diagnosis, 
          recommendation 
        }),
      });
    } catch (error) {
      console.error("Error saving diagnosis:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomText.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      
      // ✅ Call your Node backend /predict route
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: symptomText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to analyze symptoms");
      }

      if (data.message) {
        setError(data.message);
      } else if (data.predictions && data.predictions.length > 0) {
        setResult(data.predictions);
        
        // Save the top prediction to history
        const diagnosedDisease = data.predictions[0].disease || "Unknown";
        saveDiagnosis(symptomText, diagnosedDisease, "Consult a doctor");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptomText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className={`page-container ${darkMode ? "dark" : ""}`}>
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="dashboard-card input-card">
          <div className="card-header">
            <h2>Patient Symptoms</h2>
            <p>Describe how you are feeling in plain English.</p>
          </div>

          <form onSubmit={handleSubmit} className="diagnosis-form">
            
            {/* NEW TEXTAREA INPUT */}
            <div className="search-container" style={{ height: "100%", flex: 1 }}>
              <textarea
                className="search-input"
                placeholder="Example: I have a severe headache, blurry vision, and I feel very thirsty all the time..."
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                style={{ 
                  height: "100%", 
                  minHeight: "250px", 
                  resize: "none", 
                  lineHeight: "1.6",
                  padding: "16px"
                }}
              />
            </div>

            <div className="action-buttons" style={{ marginTop: "20px" }}>
              <button 
                type="submit" 
                className="primary-btn" 
                disabled={loading || !symptomText.trim()}
              >
                {loading ? "Analyzing Data..." : "Run Diagnosis"}
              </button>
              <button type="button" className="secondary-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>

        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="dashboard-card results-card">
          <div className="card-header">
            <h2>AI Analysis</h2>
            <p>Probable conditions based on your description.</p>
          </div>

          <div className="results-content">
            {loading && (
              <div className="state-message loading-state">
                <div className="spinner"></div>
                <p>Analyzing symptoms...</p>
              </div>
            )}

            {error && !loading && (
              <div className="state-message error-state">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="state-message empty-state">
                <div className="empty-icon">🩺</div>
                <p>Ready for analysis.</p>
                <span>Describe your symptoms on the left and click Run Diagnosis.</span>
              </div>
            )}

            {!loading && result && result.length > 0 && (
              <div className="prediction-results">
                <ul>
                  {result
                    .filter((item) => item.disease && item.probability)
                    .map((item) => {
                      return (
                        <li key={item.disease} className="prediction-item">
                          <div className="prediction-header">
                            <strong>{item.disease}</strong>
                            <span className="prob-badge">{item.probability}</span>
                          </div>
                        </li>
                      );
                    })}
                </ul>
                {result.every((item) => parseFloat(item?.probability?.replace("%", "") || 0) < 50) && (
                  <p className="warning-box">
                    ⚠️ Low confidence. Consider providing more detailed symptoms.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

Diagnosis.propTypes = {
  darkMode: PropTypes.bool,
};

export default Diagnosis;