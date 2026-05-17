"use client";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("error") === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
        });
        if (error) throw error;
        setMessage("Check your email — we sent you a confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const next = searchParams.get("next") || "/diagnose";
        router.push(next);
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#080808", minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", color: "#f0ede8", position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 10;
          backdrop-filter: blur(20px);
          box-shadow: 0 0 80px rgba(232,93,38,0.08), 0 0 160px rgba(232,93,38,0.04);
        }

        .tab-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: #e85d26;
          color: #fff;
        }
        .tab-btn.inactive {
          background: transparent;
          color: rgba(240,237,232,0.4);
        }
        .tab-btn.inactive:hover {
          color: rgba(240,237,232,0.7);
        }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 0.85rem 1rem;
          color: #f0ede8;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: text;
        }
        .input-field:focus {
          border-color: rgba(232,93,38,0.5);
          box-shadow: 0 0 0 3px rgba(232,93,38,0.08);
        }
        .input-field::placeholder { color: rgba(240,237,232,0.25); }

        .submit-btn {
          width: 100%;
          background: #e85d26;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }
        .submit-btn:hover:not(:disabled) { background: #d94f1a; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Ambient orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
      `}</style>

      {/* Ambient glow orbs */}
      <div className="orb" style={{ width: 400, height: 400, background: "rgba(232,93,38,0.06)", top: "-100px", left: "-100px" }} />
      <div className="orb" style={{ width: 300, height: 300, background: "rgba(232,93,38,0.04)", bottom: "-80px", right: "-80px" }} />

      <div className="login-card">
        {/* Logo */}
        <a href="/" style={{ display: "block", marginBottom: "2rem", textDecoration: "none" }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#f0ede8" }}>
            Mechanic<span style={{ color: "#e85d26" }}>AI</span>
          </span>
        </a>

        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.6rem", marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p style={{ fontSize: "0.88rem", color: "rgba(240,237,232,0.35)", marginBottom: "2rem", fontWeight: 300 }}>
          {mode === "login" ? "Sign in to access your diagnoses." : "Join MechanicAI — 3 free diagnoses."}
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: "0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "0.3rem", marginBottom: "1.75rem" }}>
          <button className={`tab-btn ${mode === "login" ? "active" : "inactive"}`} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>
            Sign In
          </button>
          <button className={`tab-btn ${mode === "signup" ? "active" : "inactive"}`} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.72rem", color: "rgba(240,237,232,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(232,93,38,0.08)", border: "1px solid rgba(232,93,38,0.25)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#e85d26" }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: "rgba(76,175,80,0.08)", border: "1px solid rgba(76,175,80,0.25)", borderRadius: "8px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#4caf50" }}>
              {message}
            </div>
          )}

          <button id="auth-submit" type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "rgba(240,237,232,0.25)", marginTop: "1.5rem" }}>
          Your data is encrypted and never shared.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background: "#080808", minHeight: "100vh" }} />}>
      <LoginForm />
    </Suspense>
  );
}
