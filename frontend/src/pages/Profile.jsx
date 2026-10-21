import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import AuthContext from "../context/AuthContext";
import "../styles/Profile.css"; // We will create this next

const Profile = ({ darkMode }) => {
  const { user, token } = useContext(AuthContext);
  const [diagnosisHistory, setDiagnosisHistory] = useState([]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/users/diagnosis-history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setDiagnosisHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Diagnosis history fetch error:", err);
      }
    })();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diagnosis?")) return;

    try {
      const response = await fetch(`http://localhost:5000/delete-diagnosis/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete diagnosis");
      setDiagnosisHistory((prev) => prev.filter((entry) => entry._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete diagnosis. Please try again.");
    }
  };

  return (
    <div className={`page-container ${darkMode ? "dark" : ""}`}>
      <div className="profile-container">
        
        {user && (
          <div className="profile-header-text">
            <h2>
              Welcome,{" "}
              {user.displayName ||
                user.email.split("@")[0].charAt(0).toUpperCase() +
                  user.email.split("@")[0].slice(1)}
              !
            </h2>
            <p>{user.email}</p>
          </div>
        )}

        <div className="table-section">
          <h3>Diagnosis History</h3>
          
          <div className="table-wrapper">
            <table className="diagnosis-history">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symptoms</th>
                  <th>Diagnosis</th>
                  <th>Recommendation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {diagnosisHistory.length > 0 ? (
                  diagnosisHistory.map((entry) => (
                    <tr key={entry._id}>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>{entry.symptoms.join(", ")}</td>
                      <td>{entry.diagnosis}</td>
                      <td>{entry.recommendation}</td>
                      <td>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(entry._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No diagnosis history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

Profile.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

export default Profile;