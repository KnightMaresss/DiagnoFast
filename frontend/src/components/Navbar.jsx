// src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import PropTypes from "prop-types"; 
import AuthContext from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = ({ darkMode, setDarkMode }) => {
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show navbar on login/signup pages
    if (location.pathname === "/login" || location.pathname === "/signup") {
        return null;
    }

    return (
        <nav className="glass-navbar">
            <div className="nav-brand" onClick={() => navigate(token ? "/diagnosis" : "/")}>
                DiagnoFast
            </div>
            
            <div className="nav-links">
                {token && (
                    <>
                        <Link to="/diagnosis" className="nav-item">Diagnosis</Link>
                        <Link to="/profile" className="nav-item">Profile</Link>
                    </>
                )}
            </div>

            <div className="nav-actions">
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                    <span className="slider"></span>
                </label>

                {token ? (
                    <button onClick={logout} className="nav-btn logout-btn">Logout</button>
                ) : (
                    <Link to="/login" className="nav-btn login-btn">Login</Link>
                )}
            </div>
        </nav>
    );
};
Navbar.propTypes = {
    darkMode: PropTypes.bool.isRequired,
    setDarkMode: PropTypes.func.isRequired,
};
export default Navbar;