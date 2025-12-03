import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams(); // To read URL params
  const navigate = useNavigate();

  useEffect(() => {
    // --- CRITICAL FIX START ---
    // 1. Check if the URL has a token (coming back from Google)
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      // Save it!
      localStorage.setItem("token", tokenFromUrl);
      
      // Remove the messy token from the URL bar so it looks clean
      setSearchParams({}); 
    }
    // --- CRITICAL FIX END ---

    // 2. Now check if we have a valid token (either just saved or old)
    const token = localStorage.getItem("token");
    
    if (token) {
      axios.get("http://localhost:5000/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        // If token is invalid (expired), clear it
        localStorage.removeItem("token");
        setUser(null);
      });
    }
  }, [searchParams]); // Re-run this if URL changes

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const handleLogin = () => {
    // Redirect to Backend Google Auth
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <nav style={{ 
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "15px 40px", backgroundColor: "#0e0e0e", borderBottom: "1px solid #333", color: "white"
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", color: "white", fontSize: "24px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>⚡ AlgoForge</span>
      </Link>

      {/* Navigation Links */}
      <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/editor" style={linkStyle}>Code Editor</Link>
        <Link to="/about" style={linkStyle}>About</Link>
      </div>

      {/* Auth Actions */}
      <div>
        {user ? (
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             {/* This Link takes you to the Profile Page */}
             <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "white" }}>
                <img 
                  src={user.picture || "https://github.com/shadcn.png"} 
                  alt="Avatar" 
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #444" }} 
                />
                <span style={{fontWeight: "bold"}}>{user.username}</span>
             </Link>
             
             <button onClick={handleLogout} style={btnSecondary}>Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin} style={btnPrimary}>
            G Sign in with Google
          </button>
        )}
      </div>
    </nav>
  );
}

// Styles
const linkStyle = { color: "#ccc", textDecoration: "none", fontSize: "16px", transition: "color 0.2s" };
const btnPrimary = { backgroundColor: "white", color: "black", padding: "8px 16px", borderRadius: "5px", border: "none", fontWeight: "bold", cursor: "pointer" };
const btnSecondary = { backgroundColor: "#333", color: "white", padding: "8px 16px", borderRadius: "5px", border: "none", cursor: "pointer" };