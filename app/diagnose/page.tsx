"use client";
import { useState, useEffect, useRef } from "react";
import FloatingTools from "@/components/FloatingTools";
import Paywall from "@/components/Paywall";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const BRANDS: Record<string, string[]> = {
  "Honda":    ["Activa", "Shine", "Unicorn", "CB350", "City"],
  "Bajaj":    ["Pulsar 150", "Pulsar NS200", "Dominar 400", "Platina", "CT100"],
  "Hero":     ["Splendor", "HF Deluxe", "Passion", "Xtreme 160R", "Xpulse 200"],
  "TVS":      ["Apache RTR 160", "Apache RTR 200", "Jupiter", "NTORQ", "Raider"],
  "Royal Enfield": ["Classic 350", "Meteor 350", "Hunter 350", "Himalayan", "Bullet 350"],
  "Maruti":   ["Swift", "Alto", "Wagon R", "Baleno", "Dzire", "Ertiga"],
  "Hyundai":  ["i20", "Creta", "Venue", "Grand i10", "Verna"],
  "Tata":     ["Nexon", "Punch", "Altroz", "Tiago", "Harrier"],
  "Mahindra": ["Scorpio", "XUV700", "Thar", "Bolero", "XUV300"],
  "Toyota":   ["Innova", "Fortuner", "Glanza", "Urban Cruiser"],
};

const YEARS = Array.from({ length: 15 }, (_, i) => (2025 - i).toString());

type Result = {
  problem: string;
  severity: string;
  fairPrice: string;
  dealerPrice: string;
  whatToSay: string;
  redFlags: string[];
  explanation: string;
  _meta?: { diagnosesUsed: number; freeLimit: number; isSubscribed: boolean };
};


export default function DiagnosePage() {
  const [brand, setBrand]       = useState("");
  const [model, setModel]       = useState("");
  const [year, setYear]         = useState("");
  const [symptom, setSymptom]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<Result | null>(null);
  const [error, setError]       = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  
  const recognitionRef = useRef<any>(null);

  const router = useRouter();
  const supabase = createClient();

  const models = brand ? BRANDS[brand] : [];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgrade") === "true") {
        setShowPaywall(true);
        window.history.replaceState(null, "", "/diagnose");
      }

      // Initialize SpeechRecognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setSymptom((prev) => prev + (prev ? " " : "") + finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === "not-allowed") {
            alert("Microphone access was denied. Please allow microphone permissions in your browser.");
          } else {
            alert(`Speech recognition stopped: ${event.error}. Ensure you are on HTTPS or localhost.`);
          }
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.error("Speech recognition start error:", e);
        }
      } else {
        alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const diagnose = async () => {
    if (!brand || !model || !year || (!symptom.trim() && !imageBase64)) {
      setError("Please describe the symptom or upload a photo."); return;
    }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, model, year, symptom, image: imageBase64 }),
      });

      if (res.status === 401) {
        router.push("/login"); return;
      }
      if (res.status === 402) {
        setShowPaywall(true); return;
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const meta = result?._meta;
  const usedCount = meta?.diagnosesUsed ?? 0;
  const freeLimit = meta?.freeLimit ?? 3;
  const isSubscribed = meta?.isSubscribed ?? false;

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        select, textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f0ede8;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
          cursor: pointer;
        }
        select:focus, textarea:focus { border-color: rgba(232,93,38,0.6); }
        textarea { cursor: text; }
        select option { background: #1a1a1a; }
        .severity-low    { color: #4caf50; }
        .severity-medium { color: #e8a326; }
        .severity-high   { color: #e85d26; }

        .usage-dot {
          width: 8px; height: 8px; border-radius: 50%;
          display: inline-block;
        }
        .pulse { width: 8px; height: 8px; background: #e85d26; border-radius: 50%; animation: pulse 1.5s infinite; display: inline-block; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.8); } }
      `}</style>

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      <FloatingTools />

      {/* Nav */}
      <nav style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.2rem 3rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <a href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.1rem", textDecoration: "none", color: "#f0ede8" }}>
          Mechanic<span style={{ color: "#e85d26" }}>AI</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="/history" style={{ fontSize: "0.85rem", color: "rgba(240,237,232,0.45)", textDecoration: "none" }}>History</a>
          <button onClick={handleSignOut} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "0.4rem 0.9rem", color: "rgba(240,237,232,0.4)", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 5, maxWidth: "680px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.2rem", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          What&apos;s wrong with your vehicle?
        </h1>
        <p style={{ color: "rgba(240,237,232,0.4)", fontSize: "0.95rem", marginBottom: "2.5rem", fontWeight: 300 }}>
          Describe the symptom honestly — the more detail, the better the diagnosis.
        </p>

        {/* Vehicle selectors */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Brand</label>
            <select value={brand} onChange={e => { setBrand(e.target.value); setModel(""); }}>
              <option value="">Select</option>
              {Object.keys(BRANDS).map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Model</label>
            <select value={model} onChange={e => setModel(e.target.value)} disabled={!brand}>
              <option value="">Select</option>
              {models.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Select</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Symptom */}
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>Describe the symptom</label>
          <textarea
            rows={4}
            placeholder="e.g. Engine makes a khtak khtak sound above 40kmph, feels weak on acceleration, no smoke..."
            value={symptom}
            onChange={e => setSymptom(e.target.value)}
            style={{ resize: "none", paddingBottom: "2.5rem", width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#f0ede8", borderRadius: "8px", padding: "0.75rem 1rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", outline: "none" }}
          />
          <button
            onClick={toggleRecording}
            title={isRecording ? "Stop recording" : "Start voice typing"}
            style={{
              position: "absolute",
              bottom: "0.8rem",
              right: "0.8rem",
              background: isRecording ? "rgba(232,93,38,0.2)" : "transparent",
              border: "none",
              color: isRecording ? "#e85d26" : "rgba(240,237,232,0.4)",
              cursor: "pointer",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
          >
            {isRecording && <span className="pulse" style={{ width: "16px", height: "16px", position: "absolute" }} />}
            <span style={{ fontSize: "1.1rem", position: "relative", zIndex: 2 }}>🎤</span>
          </button>
        </div>

        {/* Multimodal inputs */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "0.6rem 1rem", borderRadius: "8px", color: "#f0ede8", cursor: "pointer", transition: "all 0.2s" }}>
            <span>📷</span> Upload Photo
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
          </label>
        </div>

        {imageBase64 && (
          <div style={{ marginBottom: "1.5rem", position: "relative", display: "inline-block" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageBase64} alt="Vehicle issue" style={{ height: "80px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", objectFit: "cover" }} />
            <button onClick={() => setImageBase64("")} style={{ position: "absolute", top: "-8px", right: "-8px", background: "#e85d26", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        )}

        {error && <p style={{ color: "#e85d26", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>}

        <button
          id="diagnose-btn"
          onClick={diagnose}
          disabled={loading}
          style={{ background: loading ? "rgba(232,93,38,0.4)" : "#e85d26", color: "#fff", border: "none", padding: "0.9rem 2rem", borderRadius: "8px", fontSize: "1rem", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", width: "100%", transition: "background 0.2s" }}
        >
          {loading ? "Diagnosing your vehicle..." : "Diagnose →"}
        </button>

        {/* Usage indicator (shown after first result) */}
        {result && !isSubscribed && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: freeLimit }).map((_, i) => (
                <span key={i} className="usage-dot" style={{ background: i < usedCount ? "#e85d26" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            <span style={{ fontSize: "0.78rem", color: "rgba(240,237,232,0.35)" }}>
              {usedCount}/{freeLimit} free diagnoses used
              {usedCount >= freeLimit && " — "}
              {usedCount >= freeLimit && <span style={{ color: "#e85d26", cursor: "pointer" }} onClick={() => setShowPaywall(true)}>Upgrade to Pro</span>}
            </span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ marginTop: "2.5rem", border: "1px solid rgba(232,93,38,0.2)", borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ background: "rgba(232,93,38,0.08)", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(232,93,38,0.15)" }}>
              <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(240,237,232,0.35)", marginBottom: "0.3rem" }}>Diagnosis</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>{result.problem}</div>
              <div className={`severity-${result.severity?.toLowerCase()}`} style={{ fontSize: "0.8rem", marginTop: "0.25rem", fontWeight: 500 }}>
                {result.severity === "high" ? "⚠ High severity — fix soon" : result.severity === "medium" ? "◐ Medium severity" : "✓ Low severity"}
              </div>
            </div>

            <div style={{ padding: "1.25rem 1.5rem" }}>
              <p style={{ fontSize: "0.9rem", color: "rgba(240,237,232,0.6)", lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 300 }}>{result.explanation}</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                {[
                  { label: "Fair market price", value: result.fairPrice, accent: false },
                  { label: "Dealer will quote", value: result.dealerPrice, accent: true },
                ].map(({ label, value, accent }) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent ? "rgba(232,163,38,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: "10px", padding: "1rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "rgba(240,237,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>{label}</div>
                    <div style={{ fontSize: "1.2rem", fontFamily: "'Syne', sans-serif", fontWeight: 700, color: accent ? "#e8a326" : "#f0ede8" }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(232,93,38,0.06)", border: "1px solid rgba(232,93,38,0.15)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: "rgba(240,237,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>What to say to the mechanic</div>
                <div style={{ fontSize: "0.95rem", fontStyle: "italic", color: "rgba(240,237,232,0.85)", lineHeight: 1.6 }}>&ldquo;{result.whatToSay}&rdquo;</div>
              </div>

              {result.redFlags?.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(240,237,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.6rem" }}>Watch out for these upsells</div>
                  {result.redFlags.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                      <span style={{ color: "#e85d26", fontSize: "0.85rem", marginTop: "2px" }}>⚠</span>
                      <span style={{ fontSize: "0.88rem", color: "rgba(240,237,232,0.6)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}