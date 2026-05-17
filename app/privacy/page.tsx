import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        p { margin-bottom: 1rem; line-height: 1.6; color: rgba(240,237,232,0.7); }
        h2 { font-family: 'Syne', sans-serif; font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; color: #f0ede8; }
        ul { margin-left: 1.5rem; margin-bottom: 1rem; color: rgba(240,237,232,0.7); line-height: 1.6; }
      `}</style>
      
      {/* Nav */}
      <nav style={{ padding: "1.5rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", textDecoration: "none", color: "#f0ede8" }}>
          Mechanic<span style={{ color: "#e85d26" }}>AI</span>
        </Link>
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Privacy Policy</h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(240,237,232,0.4)" }}>Last updated: May 17, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>When you use MechanicAI, we collect the following types of information:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address and authentication tokens via our secure authentication provider.</li>
          <li><strong>Vehicle Data:</strong> Make, model, year, and symptoms of your vehicle that you input for diagnosis.</li>
          <li><strong>Media:</strong> Audio recordings or images you upload for diagnostic purposes. These are processed by our AI partners and securely stored in your history.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information exclusively to provide and improve the MechanicAI service. Your vehicle symptoms and diagnostic history are stored to allow you to review past issues. We do not sell your personal data to third parties.</p>

        <h2>3. Third-Party Services</h2>
        <p>We rely on trusted third-party providers to operate our service:</p>
        <ul>
          <li><strong>Supabase:</strong> For secure database and user authentication.</li>
          <li><strong>Groq:</strong> For AI text, voice, and vision processing.</li>
          <li><strong>Paddle:</strong> For secure payment processing. We do not store your credit card information on our servers.</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We implement standard security measures, including Row Level Security (RLS) in our database, to ensure your diagnostic history and personal data are only accessible by you.</p>

        <h2>5. Contact Us</h2>
        <p>If you have any questions about our privacy practices, please contact our support team.</p>
      </main>
    </div>
  );
}
