import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "kaigo_custharass_taio",
      "介護事業所のカスタマーハラスメント事案に対し、口頭スクリプト・書面通知文・インシデント記録テンプレートを生成します。",
      {
        caseType: z
          .enum(["暴言・威圧", "過剰な電話・要求", "金品・サービス要求", "家族からのクレーム", "行政・苦情申し立て", "法的措置の示唆"])
          .optional()
          .describe("カスハラ種別"),
        requesterType: z
          .enum(["利用者本人", "家族・親族", "その他"])
          .optional()
          .describe("要求者の種別"),
        severity: z
          .enum(["軽度", "中度", "重度"])
          .optional()
          .describe("深刻度"),
        situation: z.string().describe("カスハラ状況の詳細（必須、1500文字以内）"),
      },
      async (params) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kaigo-kasuhara-ai.vercel.app";
        const res = await fetch(`${baseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const text = await res.text();
        const content = text.split("\nDONE:")[0].split("\nERROR:")[0];
        return { content: [{ type: "text" as const, text: content }] };
      }
    );
  },
  {},
  { basePath: "/api" }
);

export { handler as GET, handler as POST, handler as DELETE };
