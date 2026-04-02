"use client";

import { useState, useEffect, useCallback } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotificationResult {
  permissionState: PermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0))) as Uint8Array<ArrayBuffer>;
}

/**
 * Web Push 通知の登録・解除を管理する hook
 *
 * 使用例:
 * const { permissionState, isSubscribed, subscribe } = usePushNotification();
 */
export function usePushNotification(
  userId?: string
): UsePushNotificationResult {
  const [permissionState, setPermissionState] =
    useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Service Worker 登録 + 既存サブスクリプション確認
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setPermissionState("unsupported");
      return;
    }

    const init = async () => {
      try {
        // SW 登録
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        setRegistration(reg);

        // 現在の権限状態
        const currentPermission = Notification.permission as PermissionState;
        setPermissionState(currentPermission);

        // 既存サブスクリプション確認
        const existingSubscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!existingSubscription);
      } catch (err) {
        console.error("[usePushNotification] SW 登録エラー:", err);
        setError("通知の初期化に失敗しました");
      }
    };

    init();
  }, []);

  /** 通知購読 */
  const subscribe = useCallback(async () => {
    if (!registration) {
      setError("Service Worker が未登録です");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setError("VAPID 公開鍵が設定されていません");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 通知権限を要求
      const permission = await Notification.requestPermission();
      setPermissionState(permission as PermissionState);

      if (permission !== "granted") {
        setError("通知が許可されませんでした");
        return;
      }

      // Push サブスクリプション作成
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionJson = subscription.toJSON();

      // サーバーに保存
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: subscriptionJson.keys,
          userId: userId ?? null,
        }),
      });

      if (!res.ok) {
        throw new Error("サブスクリプション保存に失敗しました");
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error("[usePushNotification] subscribe エラー:", err);
      setError(
        err instanceof Error ? err.message : "通知の登録に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, [registration, userId]);

  /** 通知解除 */
  const unsubscribe = useCallback(async () => {
    if (!registration) return;

    setIsLoading(true);
    setError(null);

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      // サーバー側から削除
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });

      // ブラウザ側サブスクリプションを解除
      await subscription.unsubscribe();
      setIsSubscribed(false);
    } catch (err) {
      console.error("[usePushNotification] unsubscribe エラー:", err);
      setError(
        err instanceof Error ? err.message : "通知の解除に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  return {
    permissionState,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  };
}
