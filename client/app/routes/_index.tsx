import Header from "../components/header";
import { Link } from "react-router";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "white", fontFamily: "sans-serif" }}>
      <Header />
      
      {/* Hero Section */}
      <main style={{ textAlign: "center", padding: "100px 20px" }}>
        <h1 style={{ fontSize: "60px", marginBottom: "20px", background: "linear-gradient(to right, #fff, #666)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Build Algorithms Faster.
        </h1>
        <p style={{ fontSize: "20px", color: "#888", maxWidth: "600px", margin: "0 auto 40px" }}>
          Execute C++, Python, and Java code in a secure, sandboxed cloud environment. 
          Perfect for interviews, competitions, and learning systems programming.
        </p>
        
        <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
          <Link to="/editor">
            <button style={{ padding: "15px 40px", fontSize: "18px", borderRadius: "30px", border: "none", background: "#2563eb", color: "white", cursor: "pointer", fontWeight: "bold" }}>
              Start Coding Now
            </button>
          </Link>
          <a href="https://github.com/shashwatp108/AlgoForge" target="_blank">
             <button style={{ padding: "15px 40px", fontSize: "18px", borderRadius: "30px", border: "1px solid #444", background: "transparent", color: "white", cursor: "pointer" }}>
               View on GitHub
             </button>
          </a>
        </div>
      </main>

      {/* Feature Grid */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", padding: "60px 100px", borderTop: "1px solid #222" }}>
         <FeatureCard title="Ultra Fast Execution" desc="Powered by C++ workers and Docker containers for millisecond latency." />
         <FeatureCard title="Secure Sandboxing" desc="Your code runs in isolated environments. Safe, reliable, and crash-proof." />
         <FeatureCard title="Cloud Storage" desc="Save your snippets and access them from anywhere in the world." />
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div style={{ padding: "30px", background: "#111", borderRadius: "10px", border: "1px solid #222" }}>
            <h3 style={{ marginBottom: "10px" }}>{title}</h3>
            <p style={{ color: "#888", lineHeight: "1.6" }}>{desc}</p>
        </div>
    )
}