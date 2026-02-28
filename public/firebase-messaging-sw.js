importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBfq9JB_Rq6C3lgyAa5bnkmqJx79IGgafY",
  authDomain: "vitrino-push.firebaseapp.com",
  projectId: "vitrino-push",
  storageBucket: "vitrino-push.appspot.com",
  messagingSenderId: "345907703597",
  appId: "vitrino-push"
});

const messaging = firebase.messaging();

/* =========================
   Background Message Handler
========================= */
messaging.onBackgroundMessage(function (payload) {

  const title = payload.notification?.title || 'New Update';

  const options = {
    body: payload.notification?.body || '',
    icon: '/icon-192.png',
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(title, options);
});


/* =========================
   Notification Click Handler
========================= */
self.addEventListener('notificationclick', function (event) {

  event.notification.close();

  const url = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {

        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
