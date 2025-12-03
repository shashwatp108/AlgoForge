import { useState, useEffect, Suspense, lazy } from "react";
import axios from "axios";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/editor";
import Header from "../components/header";
import "./editor.css";

const Editor = lazy(() => import("@monaco-editor/react"));

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AlgoForge - Editor" },
    { name: "description", content: "Write and execute C++ code instantly." },
  ];
}

export default function EditorPage() {
  const [code, setCode] = useState<string>('#include <iostream>\nusing namespace std;\n\nint main() {\n    int x;\n    cin >> x;\n    cout << "Value: " << x << endl;\n    return 0;\n}');
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");

  const [searchParams] = useSearchParams();
  const loadId = searchParams.get("loadId");

  useEffect(() => {
    if (loadId) {
      const token = localStorage.getItem("token");
      if (token) {
        // axios.get(`http://localhost:5000/snippets/${loadId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // })
        axios.get(`https://algoforge-backend-f1ht.onrender.com/snippets/${loadId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setCode(res.data.code);
          setOutput(`// Loaded script: ${res.data.title}`);
        })
        .catch(err => setOutput("Error loading script: " + err.message));
      }
    }
  }, [loadId]);

  const handleSubmit = async () => {
    setLoading(true);
    const payload = { language: "cpp", code, input };
    const token = localStorage.getItem("token");

    try {
      // Use HTTP for localhost
      const { data } = await axios.post("https://algoforge-backend-f1ht.onrender.com/run", payload, {
         headers: { Authorization: token ? `Bearer ${token}` : "" }
      });
      // const { data } = await axios.post("http://localhost:5000/run", payload, {
      //    headers: { Authorization: token ? `Bearer ${token}` : "" }
      // });
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

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to save snippets!");
      return;
    }
    try {
      // await axios.post("http://localhost:5000/snippets", {
      //   title: snippetTitle,
      //   code,
      //   language: "cpp"
      // },
      await axios.post("https://algoforge-backend-f1ht.onrender.com/snippets", {
        title: snippetTitle,
        code,
        language: "cpp"
      },
       {
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
    <div className="editor-page">
      <Header />

      {/* Toolbar */}
      <div className="editor-toolbar">
        <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
           <h2 className="toolbar-title">C++ Environment</h2>
           <button className="save-btn" onClick={() => setIsModalOpen(true)}>
              💾 Save Script
           </button>
        </div>
        
        <button className="run-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Compiling..." : "▶ Run Code"}
        </button>
      </div>

      {/* Main Workspace */}
      <div className="editor-workspace">
        
        {/* Left Panel: EDITOR ONLY (Full Height) */}
        <div className="left-panel">
          <div className="editor-wrapper">
            <Suspense fallback={<div className="output-content output-loading">Loading Editor...</div>}>
              <Editor
                height="100%"
                defaultLanguage="cpp"
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value || "")}
                options={{ 
                    fontSize: 14, 
                    minimap: { enabled: false }, 
                    automaticLayout: true,
                    padding: { top: 20 }
                }}
              />
            </Suspense>
          </div>
        </div>

        {/* Right Panel: Output (Top) & Input (Bottom) */}
        <div className="right-panel">
            
            {/* Output Section */}
            <div className="output-section">
                <div className="section-label">Terminal Output</div>
                <div className={`output-content ${getOutputClass()}`}>
                    {loading ? "Executing remote container..." : (output || "Ready to run.")}
                </div>
            </div>

            {/* Input Section */}
            <div className="input-section">
                <div className="section-label">
                    <span>Custom Input (Stdin)</span>
                </div>
                <textarea 
                    className="input-textarea"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter input for cin >> here..."
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
              placeholder="e.g., Graph DFS Implementation"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
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