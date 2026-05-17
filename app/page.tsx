"use client";
import FloatingTools from "@/components/FloatingTools";

export default function Home() {

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", cursor: "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { cursor: none; }
        .badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(232,93,38,0.1); border: 1px solid rgba(232,93,38,0.25); border-radius: 100px; padding: 0.28rem 0.85rem; font-size: 0.7rem; color: #e8834a; font-weight: 500; margin-bottom: 1.8rem; letter-spacing: 0.06em; text-transform: uppercase; }
        .pulse { width: 5px; height: 5px; background: #e85d26; border-radius: 50%; animation: pulse 2s infinite; display: inline-block; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.7); } }
        .btn-primary { background: #e85d26; color: #fff; border: none; padding: 0.82rem 1.85rem; border-radius: 7px; font-size: 0.95rem; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: none; letter-spacing: -0.01em; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-ghost { background: transparent; color: rgba(240,237,232,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 0.82rem 1.6rem; border-radius: 7px; font-size: 0.95rem; font-family: 'DM Sans', sans-serif; cursor: none; transition: all 0.2s; }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.25); color: #f0ede8; }
        .demo-bubble-bot { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 4px 12px 12px 12px; padding: 0.75rem 1rem; font-size: 0.88rem; line-height: 1.65; color: rgba(240,237,232,0.82); }
        .demo-bubble-user { background: rgba(232,93,38,0.12); border: 1px solid rgba(232,93,38,0.2); border-radius: 12px 4px 12px 12px; padding: 0.75rem 1rem; font-size: 0.88rem; line-height: 1.65; color: rgba(240,237,232,0.82); }
        .result-card { background: rgba(232,93,38,0.07); border: 1px solid rgba(232,93,38,0.18); border-radius: 10px; padding: 0.9rem 1rem; margin-top: 0.6rem; }
        .result-row { display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem; }
        .result-row:last-child { border: none; }
        .warn { color: #e8a326; }
        .feat-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1.75rem; transition: border-color 0.3s; }
        .feat-card:hover { border-color: rgba(232,93,38,0.25); }
        .vline { width: 1px; background: rgba(255,255,255,0.07); align-self: stretch; }
      `}</style>


      {/* 3D Canvas */}
      <FloatingTools />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.4rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
          Mechanic<span style={{ color: "#e85d26" }}>AI</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["How it works", "Pricing", "For Workshops"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.82rem", color: "rgba(240,237,232,0.4)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <button className="btn-primary" style={{ padding: "0.45rem 1.1rem", fontSize: "0.82rem" }}>Get Early Access</button>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 5, padding: "5rem 3rem 0", maxWidth: "860px" }}>
        <div className="badge"><span className="pulse" />India&apos;s first AI mechanic</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.8rem,5.5vw,4.8rem)", lineHeight: 1.04, letterSpacing: "-0.04em", marginBottom: "1.3rem" }}>
          Never get cheated<br />at a service<br />center <span style={{ color: "#e85d26" }}>again.</span>
        </h1>
        <p style={{ fontSize: "1rem", color: "rgba(240,237,232,0.45)", maxWidth: "480px", lineHeight: 1.75, marginBottom: "2.2rem", fontWeight: 300 }}>
          Describe what&apos;s wrong. We diagnose your vehicle, reveal the real cost, and arm you with exactly what to say to the mechanic.
        </p>
        <div style={{ display: "flex", gap: "0.9rem" }}>
          <button className="btn-primary">Diagnose my vehicle</button>
          <button className="btn-ghost">Watch demo</button>
        </div>
      </section>

      {/* Demo + Features below */}
      <section style={{ position: "relative", zIndex: 5, padding: "4rem 3rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", maxWidth: "1100px" }}>
        {/* Demo chat */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.75rem" }}>
          <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(240,237,232,0.25)", marginBottom: "1.25rem" }}>Live demo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "row-reverse", gap: "0.7rem", alignItems: "flex-start" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "rgba(240,237,232,0.4)", flexShrink: 0 }}>B</div>
              <div className="demo-bubble-user">My 2019 Honda Activa makes khtak khtak sound above 40kmph and feels weak</div>
            </div>
            <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(232,93,38,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", color: "#e85d26", flexShrink: 0, fontWeight: 700 }}>M</div>
              <div className="demo-bubble-bot">
                Classic CVT belt wear — very common after 25K km. Here&apos;s the breakdown:
                <div className="result-card">
                  <div className="result-row"><span style={{ color: "rgba(240,237,232,0.4)" }}>Problem</span><span>CVT Belt + Rollers</span></div>
                  <div className="result-row"><span style={{ color: "rgba(240,237,232,0.4)" }}>Fair price (Bengaluru)</span><span>₹800 – ₹1,200</span></div>
                  <div className="result-row"><span style={{ color: "rgba(240,237,232,0.4)" }}>Dealer will quote</span><span className="warn">₹2,500 – ₹3,500 ⚠</span></div>
                  <div className="result-row"><span style={{ color: "rgba(240,237,232,0.4)" }}>What to say</span><span>&quot;Only replace belt & rollers&quot;</span></div>
                </div>
                Don&apos;t let them upsell an engine flush — your engine is fine.
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {[
            { icon: "🔍", title: "Symptom Diagnosis", desc: "Describe in plain Hinglish. We map it to the real problem." },
            { icon: "💰", title: "Real Price Data", desc: "City-specific repair costs. Know before you go." },
            { icon: "🛡️", title: "Fraud Protection", desc: "We flag every upsell trick mechanics use on your model." },
            { icon: "🗣️", title: "What to Say", desc: "Exact words so you sound informed and pay the right price." },
          ].map((f) => (
            <div key={f.title} className="feat-card">
              <div style={{ fontSize: "1.4rem", marginBottom: "0.8rem" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.4rem" }}>{f.title}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(240,237,232,0.35)", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ position: "relative", zIndex: 5, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem 3rem", display: "flex", gap: "3rem", alignItems: "center" }}>
        {[
          { val: "₹3,200", label: "Avg. saved per visit" },
          { val: "12K+", label: "Diagnoses done" },
          { val: "98%", label: "Accuracy rate" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: "3rem", alignItems: "center" }}>
            {i > 0 && <div className="vline" style={{ height: "40px" }} />}
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#f0ede8" }}>{s.val}</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.3)", letterSpacing: "0.04em", marginTop: "2px" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}