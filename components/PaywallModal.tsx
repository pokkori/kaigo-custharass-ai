"use client";
import { useState, useEffect } from "react";

export function PaywallModal({
  open,
  onClose,
  onUpgrade,
}: {
  open: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}) {
  const [seconds, setSeconds] = useState(600);

  useEffect(() => {
    if (!open) return;
    setSeconds(600);
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [open]);

  if (!open) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-modal-title"
    >
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #1e3a5f",
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          id="paywall-modal-title"
          style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}
        >
          今日の無料回数を使い切りました
        </div>
        <div style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
          明日また無料で使えます。または月額プランで
          <span style={{ color: "#fff", fontWeight: 700 }}>無制限</span>
          に使えます。
        </div>
        {seconds > 0 && (
          <div
            style={{
              background: "rgba(7,89,133,0.4)",
              border: "1px solid #0369a1",
              borderRadius: 12,
              padding: "8px 16px",
              marginBottom: 16,
            }}
          >
            <div style={{ color: "#7dd3fc", fontSize: 12 }}>期間限定オファー終了まで</div>
            <div
              style={{
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {m}:{String(s).padStart(2, "0")}
            </div>
          </div>
        )}
        <button
          onClick={onUpgrade}
          style={{
            display: "block",
            width: "100%",
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            color: "#fff",
            fontWeight: 700,
            padding: "12px 24px",
            borderRadius: 12,
            marginBottom: 12,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            minHeight: 44,
          }}
          aria-label="有料プランにアップグレードして無制限に使う"
        >
          プランを見る（無制限に使う）
        </button>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>または</div>
          <a
            href="https://line.me/R/ti/p/@462mlayk"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              background: "#06C755",
              color: "#fff",
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 12,
              textDecoration: "none",
              fontSize: 14,
              minHeight: 44,
              boxSizing: "border-box",
            }}
            aria-label="LINEで無料相談する"
          >
            LINEで無料相談する
          </a>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: 14,
            cursor: "pointer",
            minHeight: 44,
          }}
          aria-label="閉じて明日また無料で使う"
        >
          明日また無料で使う
        </button>
      </div>
    </div>
  );
}
