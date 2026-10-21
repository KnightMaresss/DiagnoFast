// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DiagnosisPage from "./pages/DiagnosisPage";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar"; // <-- New Import

import "./styles/App.css";
import "./styles/Diagnosis.css";
import "./styles/Forms.css";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className={`app-container ${darkMode ? "dark" : ""}`}>
        
        {/* New Navbar */}
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <Routes>
          <Route path="/" element={<HomePage darkMode={darkMode} />} />
          <Route path="/diagnosis" element={<ProtectedRoute><DiagnosisPage darkMode={darkMode} /></ProtectedRoute>} />
          <Route path="/login" element={<Login darkMode={darkMode} />} />
          <Route path="/signup" element={<Signup darkMode={darkMode} />} />
          <Route path="/profile" element={<Profile darkMode={darkMode} />} />
        </Routes>
        
      </div>
    </AuthProvider>
  );
}

export default App;