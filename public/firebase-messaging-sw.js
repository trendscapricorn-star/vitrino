importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBfq9JB_Rq6C3lgyAa5bnkmqJx79IGgafY",
  authDomain: "vitrino-push.firebaseapp.com",
  projectId: "vitrino-push",
  storageBucket: "vitrino-push.appspot.com",
  messagingSenderId: "345907703597",
  appId: "1:345907703597:web:48ecd87b4f6c1e74a42da4"
});

const messaging = firebase.messaging();

/* =========================
   Background Message
========================= */

messaging.onBackgroundMessage(function (payload) {

  console.log("FCM Background:", payload);

  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "New Update";

  const body =
    payload.notification?.body ||
    payload.data?.body ||
    "";

  const url =
    payload.data?.url ||
    "/";

  const options = {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url }
  };

  self.registration.showNotification(title, options);

});


/* =========================
   Notification Click
========================= */

self.addEventListener("notificationclick", function (event) {

  event.notification.close();

  const url = event.notification?.data?.url || "/";

  event.waitUntil(

    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {

        for (const client of clientList) {

          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }

        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }

      })

  );

});