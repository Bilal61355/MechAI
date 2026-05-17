"use client";
import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

interface PaywallProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function Paywall({ onClose, onSuccess }: PaywallProps) {
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize Paddle.js on mount
  useEffect(() => {
    initializePaddle({
      environment: "production",
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      eventCallback(event) {
        if (event.name === "checkout.completed") {
          onSuccess?.();
          onClose();
          // Reload to refresh subscription status
          window.location.reload();
        }
      },
    }).then((instance) => {
      if (instance) setPaddle(instance);
    });
  }, [onClose, onSuccess]);

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      // Create a transaction server-side (passes userId securely in customData)
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.transactionId) {
        throw new Error(data.error ?? "Failed to start checkout");
      }

      // Open Paddle overlay with the transaction ID
      paddle?.Checkout.open({
        transactionId: data.transactionId,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="paywall-modal"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid rgba(232,93,38,0.3)",
          borderRadius: "20px",
          padding: "2.5rem",
          maxWidth: "420px",
          width: "90%",
          position: "relative",
          boxShadow: "0 0 80px rgba(232,93,38,0.15)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            color: "rgba(240,237,232,0.3)",
            fontSize: "1.3rem",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔒</div>

        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
            color: "#f0ede8",
          }}
        >
          Free diagnoses used up
        </h2>
        <p
          style={{
            fontSize: "0.88rem",
            color: "rgba(240,237,232,0.45)",
            marginBottom: "1.75rem",
            lineHeight: 1.6,
            fontWeight: 300,
          }}
        >
          You&apos;ve used all 3 free diagnoses. Upgrade to Pro for unlimited
          vehicle diagnoses.
        </p>

        {/* Feature list */}
        <ul style={{ listStyle: "none", marginBottom: "2rem" }}>
          {[
            "Unlimited AI diagnoses",
            "Full price comparison data",
            "Red flag upsell detector",
            "Complete diagnosis history",
          ].map((f) => (
            <li
              key={f}
              style={{
                display: "flex",
                gap: "0.6rem",
                alignItems: "center",
                marginBottom: "0.6rem",
                fontSize: "0.9rem",
                color: "rgba(240,237,232,0.7)",
              }}
            >
              <span style={{ color: "#e85d26", fontSize: "0.8rem" }}>✓</span>{" "}
              {f}
            </li>
          ))}
        </ul>

        {/* Price */}
        <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "2rem",
              color: "#e85d26",
            }}
          >
            ₹99
          </span>
          <span style={{ fontSize: "0.85rem", color: "rgba(240,237,232,0.35)" }}>
            /month
          </span>
        </div>

        {error && (
          <p
            style={{
              color: "#e85d26",
              fontSize: "0.82rem",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          id="paywall-upgrade-btn"
          onClick={handleUpgrade}
          disabled={loading || !paddle}
          style={{
            width: "100%",
            background: loading || !paddle ? "rgba(232,93,38,0.4)" : "#e85d26",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "0.9rem",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "1rem",
            fontWeight: 500,
            cursor: loading || !paddle ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {loading
            ? "Opening checkout..."
            : !paddle
            ? "Loading..."
            : "Unlock Pro — ₹99/month →"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "rgba(240,237,232,0.2)",
            marginTop: "0.75rem",
          }}
        >
          Cancel anytime • Secure payment via Paddle
        </p>
      </div>
    </div>
  );
}
