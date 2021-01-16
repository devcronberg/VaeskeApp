let staticCacheNavn = "2202101170018";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheNavn).then(function (cache) {
      return cache.addAll([
        "/",
        "/index.html",
        "/favicon.ico",
        "/style/style.css",
        "/script/app.js",
        "/script/dayjs.min.js",
        "/script/index-min.js",
        "/script/jquery.min.js",
        "/images/maskable_icon_x72.png",
        "/images/maskable_icon_x96.png",
        "/images/maskable_icon_x128.png",
        "/images/maskable_icon_x144.png",
        "/images/maskable_icon_x152.png",
        "/images/maskable_icon_x384.png",
        "/images/maskable_icon_x512.png",
        "/images/apple-touch-icon.png",
        "/images/favicon-16x16.png",
        "/images/favicon-32x32.png",
        "/favicon.ico",
      ]);
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== staticCacheNavn).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request);
    })
  );
});
