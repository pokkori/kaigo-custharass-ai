"use client";

import React, { useState, useEffect, useCallback } from "react";

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export function TrialModal({ isOpen, onClose }: TrialModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // ESCキーで閉じる
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // モーダルが閉じるたびに状態リセット
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setStatus("idle");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/trial/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        let msg = "送信に失敗しました";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          /* noop */
        }
        setErrorMessage(msg);
        setStatus("error");
      }
    } catch {
      setErrorMessage("通信エラーが発生しました。しばらくしてから再試行してください。");
      setStatus("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-modal-title"
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="モーダルを閉じる"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-teal-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">登録完了しました</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              ご登録ありがとうございます。メールをご確認ください。
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors text-sm min-h-[44px]"
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            <h2
              id="trial-modal-title"
              className="text-xl font-bold text-gray-800 mb-1"
            >
              14日間無料トライアル登録
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              クレジットカード不要。いつでもキャンセル可能です。
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label
                  htmlFor="trial-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  お名前
                  <span className="text-gray-400 font-normal ml-1">（任意）</span>
                </label>
                <input
                  id="trial-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例：田中 太郎"
                  maxLength={100}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="trial-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  メールアドレス
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="trial-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="例：info@example.com"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              {status === "error" && (
                <div
                  role="alert"
                  className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 transition-colors text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
              >
                {status === "loading" ? "送信中..." : "無料で始める →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
