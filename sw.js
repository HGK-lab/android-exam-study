/* 오프라인 캐시: 처음 열 때 앱 파일을 저장해 두고, 이후에는 저장본을 바로 보여 주면서 뒤에서 새 버전을 받아 둔다.
   파일 목록을 바꾸면 CACHE 이름의 숫자를 올릴 것 */
const CACHE = "android-exam-study-v3";
const ASSETS = [
  "./",
  "index.html",
  "css/style.css",
  "js/content.js",
  "js/diagrams.js",
  "js/render.js",
  "js/app.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          /* 206(부분 응답, PDF 뷰어가 씀)은 캐시에 못 넣음 */
          if (res.status === 200) cache.put(req, res.clone()).catch(() => {});
          return res;
        })
        .catch(() => hit || Response.error());
      if (hit) {
        e.waitUntil(fresh);
        return hit;
      }
      return fresh;
    })
  );
});
