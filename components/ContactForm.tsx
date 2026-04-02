"use client";
import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          className="w-full border rounded px-3 py-2 text-sm"
          style={{ minHeight: "44px" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          メールアドレス <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
          className="w-full border rounded px-3 py-2 text-sm"
          style={{ minHeight: "44px" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">件名</label>
        <input
          type="text"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm"
          style={{ minHeight: "44px" }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          お問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          required
          rows={5}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-blue-600 text-white rounded px-4 py-3 text-sm font-medium disabled:opacity-50"
        style={{ minHeight: "44px" }}
      >
        {status === "loading" ? "送信中..." : "送信する"}
      </button>
      {status === "success" && (
        <p className="text-green-600 text-sm">
          送信しました。2営業日以内にご返信いたします。
        </p>
      )}
      {status === "error" && (
        <p className="text-red-600 text-sm">
          送信に失敗しました。しばらく後にお試しください。
        </p>
      )}
    </form>
  );
}
