import { useState, useEffect, lazy, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/editor";
import Header from "../components/header";
import { ClientOnly } from "../components/clientOnly";
import { defaultCodes } from "../utils/defaultCodes"; // Import templates
import "./editor.css";

const Editor = lazy(() => import("@monaco-editor/react"));
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AlgoForge - Editor" },
    { name: "description", content: "Write and execute code instantly." },
  ];
}

export default function EditorPage() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState<string>(defaultCodes["cpp"]); // Load default C++
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");

  const [searchParams] = useSearchParams();
  const loadId = searchParams.get("loadId");

  // Load Script from URL
  useEffect(() => {
    if (loadId) {
      const token = localStorage.getItem("token");
      if (token) {
        axios.get(`${API_URL}/snippets/${loadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setLanguage(res.data.language || "cpp");
          setCode(res.data.code);
          setOutput(`// Loaded script: ${res.data.title}`);
        })
        .catch(err => setOutput("Error loading script: " + err.message));
      }
    }
  }, [loadId]);

  // Handle Language Switch with Warning
  const handleLanguageChange = (newLang: string) => {
    if (code !== defaultCodes[language as keyof typeof defaultCodes]) {
        const confirmSwitch = window.confirm(
            "Switching languages will reset your current code. Are you sure?"
        );
        if (!confirmSwitch) return;
    }
    setLanguage(newLang);
    setCode(defaultCodes[newLang as keyof typeof defaultCodes]);
  };

  // Keyboard Shortcuts (Cmd+S, Cmd+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        setIsModalOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, input]); // Dependencies needed for handleSubmit closure

  const handleSubmit = async () => {
    if (loading) return; // Prevent double submission
    setLoading(true);
    const payload = { language, code, input };
    const token = localStorage.getItem("token");

    try {
      const { data } = await axios.post(`${API_URL}/run`, payload, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      setOutput(data.output);
    } catch (error: any) {
      if (error.response) {
        setOutput(error.response.data.err?.stderr || error.response.data.error || JSON.stringify(error.response.data));
      } else {
        setOutput("Error connecting to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save snippets!");
      return;
    }
    try {
      await axios.post(`${API_URL}/snippets`, {
        title: snippetTitle,
        code,
        language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      alert("Snippet saved successfully!");
    } catch (err) {
      alert("Failed to save snippet.");
    }
  };

  const getOutputClass = () => {
    if (loading) return "output-loading";
    if (output.includes("error") || output.includes("Error")) return "output-error";
    return "output-success";
  };

  return (
    <div className="editor-page" style={{ minHeight: "100vh", backgroundColor: "#050505", color: "white", fontFamily: "sans-serif" }}>
      <Header />

      {/* Toolbar */}
      <div className="editor-toolbar">
        <div style={{display: "flex", gap: "15px", alignItems: "center"}}>
           <h2 className="toolbar-title">AlgoForge Runner</h2>
           
           <select 
              value={language} 
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                  padding: "6px 10px", 
                  borderRadius: "4px", 
                  background: "#252526", 
                  color: "white", 
                  border: "1px solid #333",
                  fontSize: "14px",
                  cursor: "pointer"
              }}
           >
              <option value="cpp">C++ (GCC)</option>
              <option value="c">C (GCC)</option>
              <option value="python">Python 3</option>
              <option value="java">Java (OpenJDK)</option>
              <option value="javascript">JavaScript (Node.js)</option>
           </select>

           <button className="save-btn" onClick={() => setIsModalOpen(true)} title="Cmd + S">
              💾 Save
           </button>
        </div>
        
        <button 
            className="run-btn" 
            onClick={handleSubmit} 
            disabled={loading}
            title="Cmd + Enter"
        >
          {loading ? "Running..." : "▶ Run Code"}
        </button>
      </div>

      {/* Main Workspace */}
      <div className="editor-workspace">
        <div className="left-panel">
          <div className="editor-wrapper">
            <ClientOnly fallback={<div className="output-content output-loading">Loading Editor...</div>}>
              {() => (
                <Editor
                  height="100%"
                  language={language === "c" ? "cpp" : language} // Monaco uses 'cpp' for C
                  value={code}
                  theme="vs-dark"
                  onChange={(value) => setCode(value || "")}
                  options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, padding: { top: 20 } }}
                />
              )}
            </ClientOnly>
          </div>
        </div>

        <div className="right-panel">
            <div className="output-section">
                <div className="section-label">Terminal Output</div>
                <div className={`output-content ${getOutputClass()}`}>
                    {loading ? "Executing..." : (output || "Ready to run.")}
                </div>
            </div>

            <div className="input-section">
                <div className="section-label">Custom Input (Stdin)</div>
                <textarea 
                    className="input-textarea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input for your code here..."
                />
            </div>
        </div>
      </div>

      {/* Save Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Save Snippet</h3>
            <input 
              type="text" 
              className="modal-input" 
              placeholder="e.g., Graph DFS Template"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}