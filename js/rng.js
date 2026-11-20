// rng.js — tohumlu rastgelelik. Math.random() yasak (kurallar.md 5).
// mulberry32: tek sayilik durum, kayda yaziliyor, yuklenince oyun aynen devam ediyor.
window.G = window.G || {};

G.rng = (function () {
  var durum = 1;

  function tohumla(tohum) {
    durum = (tohum >>> 0) || 1;
  }

  function sayi() {
    durum = (durum + 0x6D2B79F5) >>> 0;
    var t = durum;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // [min, maks) arasi ondalik
  function aralik(min, maks) {
    return min + sayi() * (maks - min);
  }

  // [min, maks] arasi tam sayi
  function tam(min, maks) {
    return Math.floor(min + sayi() * (maks - min + 1));
  }

  function sec(dizi) {
    return dizi[Math.floor(sayi() * dizi.length)];
  }

  // [{ deger, agirlik }] listesinden agirlikli secim
  function agirlikliSec(liste) {
    var toplam = 0, i;
    for (i = 0; i < liste.length; i++) toplam += liste[i].agirlik;
    var nokta = sayi() * toplam;
    for (i = 0; i < liste.length; i++) {
      nokta -= liste[i].agirlik;
      if (nokta <= 0) return liste[i].deger;
    }
    return liste[liste.length - 1].deger;
  }

  function sans(p) {
    return sayi() < p;
  }

  // Listeden tekrarsiz n eleman
  function secBirkac(dizi, n) {
    var kalan = dizi.slice(), sonuc = [];
    while (n > 0 && kalan.length > 0) {
      var i = Math.floor(sayi() * kalan.length);
      sonuc.push(kalan[i]);
      kalan.splice(i, 1);
      n--;
    }
    return sonuc;
  }

  return {
    tohumla: tohumla,
    sayi: sayi,
    aralik: aralik,
    tam: tam,
    sec: sec,
    secBirkac: secBirkac,
    agirlikliSec: agirlikliSec,
    sans: sans,
    durumAl: function () { return durum; },
    durumYaz: function (d) { durum = (d >>> 0) || 1; }
  };
})();
