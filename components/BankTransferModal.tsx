"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

type Plan = "personal" | "business";

interface FormState {
  name: string;
  email: string;
  plan: Plan;
}

type Status = "idle" | "loading" | "success" | "error";

const PLANS: { id: Plan; label: string; price: string; description: string }[] = [
  { id: "personal", label: "個人プラン", price: "¥2,980/月", description: "個人スタッフ・ヘルパー向け" },
  { id: "business", label: "事業所プラン", price: "¥9,800/月", description: "事業所・施設単位での利用" },
];

export default function BankTransferModal({ onClose }: Props) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", plan: "personal" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  function validateName(v: string): string {
    if (!v.trim()) return "お名前を入力してください";
    return "";
  }
  function validateEmail(v: string): string {
    if (!v.trim()) return "メールアドレスを入力してください";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "正しいメールアドレスを入力してください";
    return "";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ne = validateName(form.name);
    const ee = validateEmail(form.email);
    setNameError(ne);
    setEmailError(ee);
    if (ne || ee) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setErrorMsg(data.error ?? "申し込みに失敗しました。再度お試しください。");
        setStatus("error");
      }
    } catch {
      setErrorMsg("通信エラーが発生しました。再度お試しください。");
      setStatus("error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-transfer-modal-title"
    >
      <div className="backdrop-blur-md bg-white/[0.07] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-xl relative">
        <button
          onClick={onClose}
          aria-label="銀行振込申し込みモーダルを閉じる"
          className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors text-xl leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          x
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="bank-transfer-modal-title" className="text-lg font-bold text-white mb-2">
              お申し込みを受け付けました
            </h2>
            <p className="text-sm text-white/60 mb-4">
              振込先口座をメールでお送りしました。ご確認ください。
            </p>
            <p className="text-xs text-white/40 mb-6">
              ご入金確認後、24時間以内にアカウントを有効化いたします。
            </p>
            <button
              onClick={onClose}
              className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors min-h-[44px]"
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-3">
              <svg className="w-7 h-7 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="bank-transfer-modal-title" className="text-base font-bold mb-1 text-center text-white">
              銀行振込で申し込む
            </h2>
            <p className="text-xs text-white/50 mb-4 text-center">
              お申し込み後、振込先口座をメールでご案内します
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* プラン選択 */}
              <div className="space-y-2 mb-4">
                {PLANS.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition-colors ${
                      form.plan === p.id
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={p.id}
                      checked={form.plan === p.id}
                      onChange={() => setForm((f) => ({ ...f, plan: p.id }))}
                      className="mt-0.5 accent-teal-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {p.label}{" "}
                        <span className="text-teal-400">{p.price}</span>
                      </p>
                      <p className="text-xs text-white/50">{p.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* お名前 */}
              <div className="mb-3">
                <label htmlFor="bt-name" className="block text-xs text-white/60 mb-1">
                  お名前 <span className="text-red-400">*</span>
                </label>
                <input
                  id="bt-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    if (nameError) setNameError(validateName(e.target.value));
                  }}
                  onBlur={(e) => setNameError(validateName(e.target.value))}
                  placeholder="山田 太郎"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500 min-h-[44px]"
                  aria-describedby={nameError ? "bt-name-error" : undefined}
                  aria-invalid={nameError ? "true" : "false"}
                />
                {nameError && (
                  <p id="bt-name-error" className="text-red-400 text-xs mt-1" role="alert">
                    {nameError}
                  </p>
                )}
              </div>

              {/* メールアドレス */}
              <div className="mb-4">
                <label htmlFor="bt-email" className="block text-xs text-white/60 mb-1">
                  メールアドレス <span className="text-red-400">*</span>
                </label>
                <input
                  id="bt-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }));
                    if (emailError) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                  placeholder="taro@example.com"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500 min-h-[44px]"
                  aria-describedby={emailError ? "bt-email-error" : undefined}
                  aria-invalid={emailError ? "true" : "false"}
                />
                {emailError && (
                  <p id="bt-email-error" className="text-red-400 text-xs mt-1" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              {errorMsg && (
                <p className="text-red-400 text-xs mb-3 text-center" role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-teal-800 text-white font-bold py-3 rounded-xl hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm min-h-[44px]"
              >
                {status === "loading" ? "送信中..." : "振込先をメールで受け取る"}
              </button>
              <p className="text-xs text-white/30 text-center mt-2">
                ご入金確認後にアカウントを有効化いたします
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
