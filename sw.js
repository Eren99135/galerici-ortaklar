// sw.js — service worker: oyun telefonda ana ekrandan acilsin ve cevrimdisi oynansin.
//
// Strateji bilerek iki satir:
//   img/   -> once onbellek. Agirlik orada (7,7 MB), bir kere indi mi bir daha inmez.
//   kalani -> once ag, ag yoksa onbellek. index.html, js/, data/, style.css boyle.
//
// Neden kalani icin "once ag": klasik PWA tuzagi, oyun guncellendigi halde oyuncunun
// eski surumde takili kalmasidir. Once ag dedigimizde her acilista son surum geliyor,
// internet yoksa son calisan surum onbellekten aciliyor.
//
// Precache listesi tutmuyoruz. Tutsaydik index.html icindeki script sirasi ikinci bir
// yerde daha yazili olurdu ve biri unutuldugunda cevrimdisi oyun bozulurdu.

var ONBELLEK = "galerici-v1";

self.addEventListener("install", function (olay) {
  // Kabuk hemen devralsin, ikinci ziyaretin beklenmesine gerek yok.
  self.skipWaiting();
  olay.waitUntil(
    caches.open(ONBELLEK).then(function (kutu) {
      return kutu.addAll(["./", "./index.html", "./style.css", "./manifest.json"]);
    }).catch(function () { /* biri gelmezse kurulum yine de surmeli */ })
  );
});

self.addEventListener("activate", function (olay) {
  olay.waitUntil(
    caches.keys().then(function (adlar) {
      return Promise.all(adlar.map(function (ad) {
        return ad === ONBELLEK ? null : caches.delete(ad);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function sakla(istek, cevap) {
  if (cevap && cevap.ok && cevap.type === "basic") {
    var kopya = cevap.clone();
    caches.open(ONBELLEK).then(function (kutu) { kutu.put(istek, kopya); });
  }
  return cevap;
}

self.addEventListener("fetch", function (olay) {
  var istek = olay.request;
  if (istek.method !== "GET") return;

  var adres = new URL(istek.url);
  if (adres.origin !== self.location.origin) return;

  if (adres.pathname.indexOf("/img/") !== -1) {
    olay.respondWith(
      caches.match(istek).then(function (bulunan) {
        return bulunan || fetch(istek).then(function (cevap) { return sakla(istek, cevap); });
      })
    );
    return;
  }

  olay.respondWith(
    fetch(istek)
      .then(function (cevap) { return sakla(istek, cevap); })
      .catch(function () {
        return caches.match(istek).then(function (bulunan) {
          return bulunan || caches.match("./index.html");
        });
      })
  );
});
