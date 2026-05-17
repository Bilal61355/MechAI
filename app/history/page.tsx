"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import FloatingTools from "@/components/FloatingTools";

type Diagnosis = {
  id: string;
  brand: string;
  model: string;
  year: string;
  symptom: string;
  created_at: string;
  result: {
    problem: string;
    severity: string;
    fairPrice: string;
    dealerPrice: string;
    whatToSay: string;
    redFlags: string[];
    explanation: string;
  };
};

const severityColor: Record<string, string> = {
  high: "#e85d26",
  medium: "#e8a326",
  low: "#4caf50",
};

const severityLabel: Record<string, string> = {
  high: "⚠ High",
  medium: "◐ Medium",
  low: "✓ Low",
};

export default function HistoryPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserEmail(user.email ?? "");

      const { data } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setDiagnoses(data ?? []);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .history-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .history-card:hover { border-color: rgba(232,93,38,0.2); }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          cursor: pointer;
          gap: 1rem;
        }

        .expand-btn {
          background: none; border: none; color: rgba(240,237,232,0.3);
          font-size: 1.1rem; cursor: pointer; flex-shrink: 0; margin-top: 2px;
          transition: color 0.2s;
        }
        .expand-btn:hover { color: rgba(240,237,232,0.7); }

        .card-detail {
          padding: 0 1.5rem 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
        }

        .skeleton {
          background: rgba(255,255,255,0.04);
          border-radius: 14px;
          height: 88px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <FloatingTools />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <a href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", textDecoration: "none", color: "#f0ede8" }}>
          Mechanic<span style={{ color: "#e85d26" }}>AI</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="/diagnose" style={{ fontSize: "0.85rem", color: "rgba(240,237,232,0.45)", textDecoration: "none" }}>New Diagnosis</a>
          {userEmail && (
            <span style={{ fontSize: "0.78rem", color: "rgba(240,237,232,0.2)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {userEmail}
            </span>
          )}
          <button onClick={handleSignOut} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.4rem 0.9rem", color: "rgba(240,237,232,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 5, maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.2rem", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
            Diagnosis History
          </h1>
          <p style={{ color: "rgba(240,237,232,0.4)", fontSize: "0.95rem", fontWeight: 300 }}>
            All your past vehicle diagnoses, saved securely.
          </p>
        </div>

        {/* Stats bar */}
        {!loading && diagnoses.length > 0 && (
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Total diagnoses", value: diagnoses.length },
              { label: "High severity", value: diagnoses.filter(d => d.result?.severity === "high").length },
              { label: "Vehicles diagnosed", value: new Set(diagnoses.map(d => `${d.brand} ${d.model}`)).size },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "0.75rem 1.25rem", flex: "1", minWidth: "120px" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "#e85d26" }}>{value}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.15rem" }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && diagnoses.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔧</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.3rem", marginBottom: "0.5rem" }}>No diagnoses yet</h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(240,237,232,0.35)", marginBottom: "1.5rem" }}>
              Run your first vehicle diagnosis to see it here.
            </p>
            <a href="/diagnose" style={{ display: "inline-block", background: "#e85d26", color: "#fff", textDecoration: "none", padding: "0.75rem 1.75rem", borderRadius: "8px", fontWeight: 500, fontSize: "0.95rem" }}>
              Diagnose a Vehicle →
            </a>
          </div>
        )}

        {/* Diagnosis cards */}
        {!loading && diagnoses.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {diagnoses.map(d => (
              <div key={d.id} className="history-card">
                {/* Card header — always visible */}
                <div
                  className="card-header"
                  onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                >
                  <div style={{ flex: 1 }}>
                    {/* Vehicle + date */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem" }}>
                        {d.year} {d.brand} {d.model}
                      </span>
                      <span style={{
                        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.04em",
                        color: severityColor[d.result?.severity?.toLowerCase()] ?? "#f0ede8",
                        background: `${severityColor[d.result?.severity?.toLowerCase()] ?? "#fff"}15`,
                        border: `1px solid ${severityColor[d.result?.severity?.toLowerCase()] ?? "#fff"}30`,
                        borderRadius: "6px", padding: "0.2rem 0.5rem"
                      }}>
                        {severityLabel[d.result?.severity?.toLowerCase()] ?? d.result?.severity}
                      </span>
                    </div>
                    {/* Problem name */}
                    <div style={{ fontSize: "0.92rem", color: "rgba(240,237,232,0.75)", marginBottom: "0.25rem" }}>
                      {d.result?.problem}
                    </div>
                    {/* Date */}
                    <div style={{ fontSize: "0.75rem", color: "rgba(240,237,232,0.25)" }}>
                      {formatDate(d.created_at)}
                    </div>
                  </div>
                  <button className="expand-btn" aria-label="Toggle details">
                    {expanded === d.id ? "▲" : "▼"}
                  </button>
                </div>

                {/* Expanded details */}
                {expanded === d.id && (
                  <div className="card-detail">
                    {/* Symptom */}
                    <div style={{ padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "0.68rem", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Symptom reported</div>
                      <div style={{ fontSize: "0.88rem", color: "rgba(240,237,232,0.6)", fontStyle: "italic" }}>&ldquo;{d.symptom}&rdquo;</div>
                    </div>

                    {/* Explanation */}
                    <div style={{ padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: "0.68rem", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Explanation</div>
                      <div style={{ fontSize: "0.88rem", color: "rgba(240,237,232,0.6)", lineHeight: 1.6 }}>{d.result?.explanation}</div>
                    </div>

                    {/* Prices */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {[
                        { label: "Fair market price", value: d.result?.fairPrice, accent: false },
                        { label: "Dealer will quote", value: d.result?.dealerPrice, accent: true },
                      ].map(({ label, value, accent }) => (
                        <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accent ? "rgba(232,163,38,0.15)" : "rgba(255,255,255,0.05)"}`, borderRadius: "8px", padding: "0.75rem 1rem" }}>
                          <div style={{ fontSize: "0.68rem", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.25rem" }}>{label}</div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: accent ? "#e8a326" : "#f0ede8" }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* What to say */}
                    <div style={{ padding: "1rem 0", borderBottom: d.result?.redFlags?.length > 0 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <div style={{ fontSize: "0.68rem", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>What to say to the mechanic</div>
                      <div style={{ fontSize: "0.88rem", fontStyle: "italic", color: "rgba(240,237,232,0.75)", lineHeight: 1.6 }}>&ldquo;{d.result?.whatToSay}&rdquo;</div>
                    </div>

                    {/* Red flags */}
                    {d.result?.redFlags?.length > 0 && (
                      <div style={{ paddingTop: "1rem" }}>
                        <div style={{ fontSize: "0.68rem", color: "rgba(240,237,232,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Watch out for</div>
                        {d.result.redFlags.map((f, i) => (
                          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                            <span style={{ color: "#e85d26", fontSize: "0.78rem", marginTop: "2px" }}>⚠</span>
                            <span style={{ fontSize: "0.83rem", color: "rgba(240,237,232,0.5)", lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
