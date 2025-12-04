import Header from "../components/header";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router";

// Define TypeScript interface for Job
interface Job {
    _id: string;
    status: string;
    language: string;
    submittedAt: string;
    output: string;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [snippets, setSnippets] = useState<any[]>([]);
  const navigate = useNavigate();

  // Dynamic API URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
       navigate("/"); 
       return;
    }

    // 1. Fetch User Data
    axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data))
    .catch(() => {
        // If auth fails, kick them out
        localStorage.removeItem("token");
        navigate("/");
    });

    // 2. Fetch Job History
    axios.get(`${API_URL}/jobs/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setJobs(res.data))
    .catch(err => console.error(err));

    // 3. Fetch Saved Snippets
    axios.get(`${API_URL}/snippets`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSnippets(res.data))
    .catch(err => console.error(err));

  }, []);

  if (!user) return <div style={{background: "#050505", minHeight: "100vh", color: "white", padding: "20px"}}>Loading Profile...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#050505", color: "white", fontFamily: "sans-serif" }}>
      <Header />
      
      <div style={{ maxWidth: "1000px", margin: "50px auto", padding: "40px" }}>
        
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "30px", marginBottom: "40px", background: "#111", padding: "30px", borderRadius: "15px", border: "1px solid #333" }}>
            <img 
                src={user.picture || "https://github.com/shadcn.png"} 
                style={{ width: "100px", height: "100px", borderRadius: "50%", border: "4px solid #2563eb" }} 
            />
            <div>
                <h1 style={{ margin: 0, fontSize: "32px" }}>{user.username}</h1>
                <p style={{ color: "#888", marginTop: "5px" }}>{user.email}</p>
                <div style={{ marginTop: "10px", display: "inline-block", padding: "5px 15px", background: "#2563eb33", color: "#60a5fa", borderRadius: "20px", fontSize: "14px" }}>
                    Pro Member
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
            <StatBox label="Total Submissions" value={jobs.length.toString()} />
            <StatBox label="Success Rate" value={calculateSuccessRate(jobs)} />
            <StatBox label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>

        {/* Saved Snippets Section */}
        <h2 style={{ borderBottom: "1px solid #333", paddingBottom: "15px", marginBottom: "20px" }}>Saved Snippets</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginBottom: "50px" }}>
            {snippets.map((snippet) => (
                <div key={snippet._id} style={{ background: "#111", padding: "20px", borderRadius: "8px", border: "1px solid #333", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "150px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>{snippet.title}</h3>
                        <span style={{ fontSize: "12px", color: "#666", background: "#222", padding: "3px 8px", borderRadius: "4px" }}>
                            {snippet.language}
                        </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
                        <span style={{ fontSize: "12px", color: "#666" }}>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                        <Link to={`/editor?loadId=${snippet._id}`}>
                            <button style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                                Open ↗
                            </button>
                        </Link>
                    </div>
                </div>
            ))}
            {snippets.length === 0 && <p style={{ color: "#666" }}>No saved snippets found.</p>}
        </div>

        {/* Submission History Table */}
        <h2 style={{ borderBottom: "1px solid #333", paddingBottom: "15px", marginBottom: "20px" }}>Recent Activity</h2>
        <div style={{ background: "#111", borderRadius: "8px", border: "1px solid #333", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                    <tr style={{ background: "#1a1a1a", color: "#888", fontSize: "14px" }}>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Language</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Output Snippet</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.length > 0 ? jobs.map((job) => (
                        <tr key={job._id} style={{ borderBottom: "1px solid #222" }}>
                            <td style={tdStyle}>
                                <span style={{ 
                                    padding: "4px 8px", 
                                    borderRadius: "4px", 
                                    fontSize: "12px", 
                                    fontWeight: "bold",
                                    backgroundColor: job.status === "success" ? "#0f2f1a" : "#2f0f0f",
                                    color: job.status === "success" ? "#4caf50" : "#ff4d4d"
                                }}>
                                    {job.status.toUpperCase()}
                                </span>
                            </td>
                            <td style={tdStyle}>{job.language}</td>
                            <td style={tdStyle}>{new Date(job.submittedAt).toLocaleString()}</td>
                            <td style={{...tdStyle, fontFamily: "monospace", color: "#aaa"}}>
                                {job.output ? job.output.substring(0, 50) + (job.output.length > 50 ? "..." : "") : "-"}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} style={{ padding: "30px", textAlign: "center", color: "#666" }}>
                                No submissions yet. Go write some code!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  );
}

// Helper Components & Styles
function StatBox({ label, value }: { label: string, value: string }) {
    return (
        <div style={{ padding: "20px", background: "#111", borderRadius: "8px", border: "1px solid #333" }}>
            <div style={{ color: "#888", fontSize: "14px", marginBottom: "5px" }}>{label}</div>
            <div style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</div>
        </div>
    )
}

function calculateSuccessRate(jobs: Job[]) {
    if (jobs.length === 0) return "0%";
    const successCount = jobs.filter(j => j.status === "success").length;
    return Math.round((successCount / jobs.length) * 100) + "%";
}

const thStyle = { padding: "15px 20px", fontWeight: "normal" };
const tdStyle = { padding: "15px 20px", fontSize: "14px" };