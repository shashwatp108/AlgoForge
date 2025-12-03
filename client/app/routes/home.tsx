import { useState,useEffect, Suspense, lazy } from "react";
import axios from "axios";
import type { Route } from "./+types/home";

const Editor = lazy(() => import("@monaco-editor/react"));

// Helper to get params from URL
const getTokenFromUrl = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get("token");
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AlgoForge" },
    { name: "description", content: "C++ Code Execution Engine" },
  ];
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [code, setCode] = useState<string>(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    int x;\n    cin >> x;\n    cout << "Value: " << x << endl;\n    return 0;\n}'
  );
  const [input, setInput] = useState<string>(""); // New State for Input
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(true); // Toggle for UI

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      language: "cpp",
      code,
      input, // Send input to backend
    };

    try {
      // const { data } = await axios.post("https://algoforge-backend-f1ht.onrender.com/run", payload);
      const { data } = await axios.post("https://localhost:5000/run", payload);
      setOutput(data.output);
    } catch (error: any) {
      if (error.response) {
        setOutput(error.response.data.err.stderr || JSON.stringify(error.response.data));
      } else {
        setOutput("Error connecting to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check if we just came back from Google
    const token = getTokenFromUrl();
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/"); // Clean URL
    }

    // 2. Check if we are logged in
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      axios.get("http://localhost:5000/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const handleLogin = () => {
    // Redirect browser to Backend Google Auth
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#0e0e0e", minHeight: "100vh", color: "white" }}>
      <header style={{ marginBottom: "20px", borderBottom: "1px solid #333", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#61dafb" }}>AlgoForge ⚡</h1>

        {/* AUTH SECTION */}
        <div>
            {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{color: "#ccc"}}>Welcome, {user.username}</span>
                    <button onClick={handleLogout} style={{background: "red", color: "white", padding: "5px 10px", border: "none", cursor: "pointer"}}>Logout</button>
                </div>
            ) : (
                <button onClick={handleLogin} style={{background: "white", color: "black", padding: "8px 15px", border: "none", cursor: "pointer", fontWeight: "bold"}}>
                    G Sign in with Google
                </button>
            )}
        </div>

        <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{
                padding: "10px 24px", 
                backgroundColor: loading ? "#555" : "#28a745", 
                color: "white", 
                border: "none", 
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                borderRadius: "5px",
                fontWeight: "bold"
            }}
          >
            {loading ? "Running..." : "Run Code >"}
          </button>
      </header>

      <div style={{ display: "flex", gap: "20px", flexDirection: "row", height: "85vh" }}>
        
        {/* LEFT: EDITOR + INPUT */}
        <div style={{ width: "60%", display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* EDITOR */}
          <div style={{ flex: 1, border: "1px solid #333", borderRadius: "8px", overflow: "hidden", backgroundColor: "#1e1e1e" }}>
            <Suspense fallback={<div style={{ padding: "20px" }}>Loading Editor...</div>}>
              <Editor
                height="100%"
                defaultLanguage="cpp"
                defaultValue={code}
                theme="vs-dark"
                onChange={(value) => setCode(value || "")}
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
              />
            </Suspense>
          </div>

          {/* INPUT AREA */}
          <div style={{ height: "150px", border: "1px solid #333", borderRadius: "8px", backgroundColor: "#1e1e1e", display: "flex", flexDirection: "column" }}>
             <div style={{ padding: "5px 10px", backgroundColor: "#252526", borderBottom: "1px solid #333", fontSize: "12px", color: "#ccc", fontWeight: "bold" }}>
                CUSTOM INPUT (stdin)
             </div>
             <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{ flex: 1, backgroundColor: "#1e1e1e", color: "white", border: "none", padding: "10px", resize: "none", outline: "none", fontFamily: "'Fira Code', monospace" }}
                placeholder="Enter your input values here (e.g., 5 10)"
             />
          </div>

        </div>

        {/* RIGHT: OUTPUT */}
        <div style={{ flex: 1, border: "1px solid #333", borderRadius: "8px", backgroundColor: "#1e1e1e", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px", backgroundColor: "#252526", borderBottom: "1px solid #333", fontSize: "14px", fontWeight: "bold" }}>
                TERMINAL OUTPUT
            </div>
            <div style={{ 
                flex: 1, 
                padding: "15px", 
                whiteSpace: "pre-wrap", 
                overflowY: "auto", 
                color: output.includes("error") ? "#ff4d4d" : "#4caf50", 
                fontFamily: "'Fira Code', monospace",
            }}>
                {output ? output : "Ready to execute..."}
            </div>
        </div>

      </div>
    </div>
  );
}