import Link from "next/link";

export default function RefundPolicy() {
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
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.5rem", marginBottom: "0.5rem" }}>Refund & Cancellation Policy</h1>
        <p style={{ fontSize: "0.9rem", color: "rgba(240,237,232,0.4)" }}>Last updated: May 17, 2026</p>

        <h2>1. Subscription Cancellations</h2>
        <p>You can cancel your MechanicAI Pro subscription at any time. Once canceled, your subscription will not automatically renew, and you will retain access to Pro features until the end of your current billing cycle.</p>

        <h2>2. Refund Eligibility</h2>
        <p>We stand behind the quality of our service. However, because MechanicAI is a digital product providing immediate access to AI resources, we generally do not offer refunds for past billing cycles.</p>
        <p>You may be eligible for a refund if:</p>
        <ul>
          <li>You were charged in error due to a technical glitch.</li>
          <li>You request a refund within 3 days of your initial purchase and have not extensively utilized the service (e.g., fewer than 2 diagnoses).</li>
        </ul>

        <h2>3. How to Request a Refund</h2>
        <p>To request a refund, please contact our support team with your account email address and the reason for your request. All refund requests are reviewed on a case-by-case basis.</p>

        <h2>4. Free Trial</h2>
        <p>We offer a 1-day free trial on our Pro plan. If you cancel before the trial period ends, you will not be charged. It is the user's responsibility to cancel their trial if they do not wish to be billed.</p>
      </main>
    </div>
  );
}
