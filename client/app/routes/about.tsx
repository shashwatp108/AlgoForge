import Header from "../components/header";

export default function About() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#050505", color: "white", fontFamily: "sans-serif" }}>
      <Header />
      
      <div style={{ maxWidth: "800px", margin: "60px auto", padding: "20px" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "20px", color: "#61dafb" }}>About AlgoForge</h1>
        
        <p style={{ fontSize: "18px", lineHeight: "1.6", color: "#ccc" }}>
          AlgoForge is a high-performance remote code execution engine designed to mimic professional 
          Online Judge systems. It was built to demonstrate advanced backend engineering concepts including:
        </p>

        <ul style={{ marginTop: "30px", fontSize: "18px", lineHeight: "1.8", color: "#aaa" }}>
          <li><strong>Systems Programming:</strong> Using C++ child processes for secure execution.</li>
          <li><strong>Dockerization:</strong> Containerized environment for consistent production builds.</li>
          <li><strong>OAuth 2.0 & JWT:</strong> Secure stateless authentication with Google.</li>
          <li><strong>Modern UI:</strong> Built with React Router v7 and Monaco Editor.</li>
        </ul>

        <div style={{ marginTop: "50px", padding: "20px", borderLeft: "4px solid #2563eb", background: "#111" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Developer Note</h3>
          <p style={{ margin: 0, color: "#888" }}>
            Built by <strong>Shashwat Pandey</strong> as a Full Stack Systems Engineering portfolio project.
          </p>
        </div>
      </div>
    </div>
  );
}