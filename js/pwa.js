// pwa.js — service worker kaydi. Oyun mantigiyla ilgisi yok, sadece tarayici isi.
//
// file:// altinda hicbir sey yapmaz: index.html cift tiklanip acildiginda service
// worker kaydi zaten tarayici tarafindan reddedilir, konsola gereksiz hata dusmesin.
// Kaydi yalnizca https ve localhost altinda deniyoruz (tarayicilarin guvenli saydigi
// iki durum).
(function () {
  if (!("serviceWorker" in navigator)) return;

  var guvenli = location.protocol === "https:" ||
                location.hostname === "localhost" ||
                location.hostname === "127.0.0.1";
  if (!guvenli) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function (hata) {
      // Kayit olmazsa oyun yine calisir, sadece cevrimdisi destegi olmaz.
      if (window.console) console.warn("service worker kaydi olmadi:", hata);
    });
  });
})();
