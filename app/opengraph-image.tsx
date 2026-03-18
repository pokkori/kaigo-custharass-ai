import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "介護カスハラAI | カスタマーハラスメント対応文書を30秒で生成";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>🛡️</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#99f6e4", marginBottom: 16, textAlign: "center" }}>
          介護カスハラAI
        </div>
        <div style={{ fontSize: 28, color: "#ccfbf1", textAlign: "center", maxWidth: 900 }}>
          カスハラ対応文書を30秒で生成・証拠保全もAIサポート
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          {["エスカレーション判定", "証拠保全ガイド", "無料3回"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                background: "rgba(153,246,228,0.15)",
                border: "1px solid rgba(153,246,228,0.5)",
                borderRadius: 24,
                fontSize: 18,
                color: "#a7f3d0",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 32,
            padding: "12px 36px",
            background: "#0d9488",
            borderRadius: 40,
            fontSize: 22,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          無料3回 → ¥9,800/月〜
        </div>
      </div>
    ),
    { ...size }
  );
}
