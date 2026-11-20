// rehber.js — baslangic rehberi (ilk iki gun) ve ekran yardimlari. Karar #15.
// Saf mantik: durumu okur, adim ilerletir. DOM'a dokunmaz.
window.G = window.G || {};

G.rehber = (function () {

  function durum(state) {
    if (!state.rehber) {
      state.rehber = { adim: 0, acik: true, bitti: false, acikYardim: null };
    }
    return state.rehber;
  }

  function adimlar() { return G.data.rehberAdimlari; }

  // Her cizimden once cagrilir: kosulu saglanan adimlari atlar
  function ilerlet(state) {
    var r = durum(state);
    if (!r.acik) return null;
    var liste = adimlar();
    var sayac = 0;
    while (r.adim < liste.length && liste[r.adim].kosul(state) && sayac < liste.length + 1) {
      r.adim++;
      sayac++;
    }
    if (r.adim >= liste.length) {
      r.acik = false;
      r.bitti = true;
      return null;
    }
    return liste[r.adim];
  }

  function suAnki(state) {
    var r = durum(state);
    if (!r.acik) return null;
    return adimlar()[r.adim] || null;
  }

  // Bu adimin balonu bu ekranda gosterilsin mi?
  function buEkrandaMi(state, ekran) {
    var adim = suAnki(state);
    return !!(adim && adim.ekran === ekran);
  }

  function kapat(state) { durum(state).acik = false; }

  function ac(state) {
    var r = durum(state);
    r.acik = true;
    r.bitti = false;
    if (r.adim >= adimlar().length) r.adim = 0;
  }

  function sifirla(state) {
    state.rehber = { adim: 0, acik: true, bitti: false, acikYardim: null };
  }

  function yardimAc(state, ekran) { durum(state).acikYardim = ekran; }
  function yardimKapat(state) { durum(state).acikYardim = null; }
  function yardim(ekran) { return G.data.yardim[ekran] || null; }

  function ilerleme(state) {
    var r = durum(state);
    return { adim: Math.min(r.adim + 1, adimlar().length), toplam: adimlar().length };
  }

  return {
    durum: durum,
    ilerlet: ilerlet,
    suAnki: suAnki,
    buEkrandaMi: buEkrandaMi,
    kapat: kapat,
    ac: ac,
    sifirla: sifirla,
    yardimAc: yardimAc,
    yardimKapat: yardimKapat,
    yardim: yardim,
    ilerleme: ilerleme,
    adimlar: adimlar
  };
})();
