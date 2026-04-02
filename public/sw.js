// Service Worker - 介護カスハラAI Web Push 通知処理
// キャッシュバージョン
const CACHE_NAME = 'kaigo-custharass-v1';

// ── インストール ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  // 即座にアクティブ化
  self.skipWaiting();
});

// ── アクティベート ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 古いキャッシュを削除
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      // 即座にクライアントを制御下に置く
      self.clients.claim(),
    ])
  );
});

// ── Push イベント ─────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: '介護カスハラAI',
    body: '今日のストリークを継続しましょう！',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'streak-reminder',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    tag: data.tag || 'kaigo-notification',
    renotify: true,
    requireInteraction: false,
    data: data.data || { url: '/' },
    actions: [
      {
        action: 'open',
        title: '今すぐ確認',
      },
      {
        action: 'dismiss',
        title: '後で',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── notificationclick イベント ────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // 「今すぐ確認」またはバナー本体をクリック
  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているタブがあればフォーカス
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          const targetUrlObj = new URL(targetUrl, self.location.origin);
          if (clientUrl.pathname === targetUrlObj.pathname && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいタブで開く
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ── pushsubscriptionchange ────────────────────────────────────
// サブスクリプションが期限切れになった場合の自動更新
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.__VAPID_PUBLIC_KEY__,
      })
      .then((newSubscription) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSubscription.toJSON()),
        });
      })
  );
});
