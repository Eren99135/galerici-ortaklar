// diyalog.js — gorsel roman diyalog kuyrugu. Tiklayinca siradaki replik gelir.
// Karar #17. Saf mantik: state'i degistirir, DOM'a dokunmaz.
//
// Kullanim:
//   G.diyalog.kur(state, [{kim:"nuri", ifade:"kizgin", metin:"Erebe gider, pere gelir!"}],
//                 { mekan:"galeri-onu", kisiler:[...], sonra:"dukkan" });
//   G.diyalog.suAnki(state)  -> {kim, ifade, metin} | null
//   G.diyalog.ilerle(state)  -> siradaki replik; bitince `sonra` ekranina gecer
window.G = window.G || {};

G.diyalog = (function () {

  var KELIME_SINIRI = 12;     // baloncukta en fazla bu kadar kelime (karar #17)

  function kelimeSayisi(metin) {
    var temiz = String(metin || "").trim();
    if (!temiz) return 0;
    return temiz.split(/\s+/).length;
  }

  // Sinirdan uzun replik gelirse sessizce kirpmak yerine gelistirmede yakalansin diye uyarir
  function denetle(satirlar) {
    var uzunlar = [];
    for (var i = 0; i < satirlar.length; i++) {
      if (kelimeSayisi(satirlar[i].metin) > KELIME_SINIRI) uzunlar.push(satirlar[i].metin);
    }
    return uzunlar;
  }

  function kur(state, satirlar, ayar) {
    var a = ayar || {};
    var liste = [];
    for (var i = 0; i < (satirlar || []).length; i++) {
      var s = satirlar[i];
      if (!s || !s.metin) continue;
      liste.push({ kim: s.kim || "nuri", ifade: s.ifade || "normal", metin: s.metin });
    }
    if (liste.length === 0) {
      state.diyalog = null;
      if (a.sonra) state.ekran = a.sonra;
      return null;
    }
    var uzun = denetle(liste);
    if (uzun.length) console.warn("Baloncukta " + KELIME_SINIRI + " kelimeyi asan replik:", uzun);

    state.diyalog = {
      sira: 0,
      satirlar: liste,
      mekan: a.mekan || null,
      kisiler: a.kisiler || null,
      sonra: a.sonra || null,
      kaynak: a.kaynak || null
    };
    return state.diyalog;
  }

  function acikMi(state) {
    return !!(state.diyalog && state.diyalog.satirlar && state.diyalog.sira < state.diyalog.satirlar.length);
  }

  function suAnki(state) {
    if (!acikMi(state)) return null;
    return state.diyalog.satirlar[state.diyalog.sira];
  }

  function kalan(state) {
    if (!acikMi(state)) return 0;
    return state.diyalog.satirlar.length - state.diyalog.sira;
  }

  // Diyalogun sahnesi: kur() ile verilen mekan/kisiler, konusan su anki replige gore
  function sahne(state) {
    if (!acikMi(state)) return null;
    var d = state.diyalog;
    var satir = suAnki(state);
    var kisiler = d.kisiler ? d.kisiler.slice() : [{ kim: satir.kim, konum: "orta" }];
    // Konusanin ifadesi repligin ifadesiyle guncellenir
    for (var i = 0; i < kisiler.length; i++) {
      if (kisiler[i].kim === satir.kim) {
        kisiler[i] = { kim: kisiler[i].kim, konum: kisiler[i].konum, ifade: satir.ifade };
      }
    }
    return { mekan: d.mekan || "sanayi-avlu", kisiler: kisiler, konusan: satir.kim };
  }

  function ilerle(state) {
    if (!state.diyalog) return null;
    state.diyalog.sira++;
    if (state.diyalog.sira >= state.diyalog.satirlar.length) {
      var sonra = state.diyalog.sonra;
      state.diyalog = null;
      if (sonra) state.ekran = sonra;
      return null;
    }
    return suAnki(state);
  }

  function kapat(state) {
    var sonra = state.diyalog ? state.diyalog.sonra : null;
    state.diyalog = null;
    if (sonra) state.ekran = sonra;
  }

  return {
    KELIME_SINIRI: KELIME_SINIRI,
    kelimeSayisi: kelimeSayisi,
    denetle: denetle,
    kur: kur,
    acikMi: acikMi,
    suAnki: suAnki,
    kalan: kalan,
    sahne: sahne,
    ilerle: ilerle,
    kapat: kapat
  };
})();
