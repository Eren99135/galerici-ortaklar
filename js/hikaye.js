// hikaye.js — ana hikaye sahnelerini gunun sabahinda oynatir (Adim 14).
// Hikaye, olay karti motorunun ustune biner: sahne once oynar, bitince gunun karti gelir.
window.G = window.G || {};

G.hikaye = (function () {

  function sahneler() { return G.data.hikaye || []; }

  function bul(id) {
    var liste = sahneler();
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].id === id) return liste[i];
    }
    return null;
  }

  // Bugun oynayacak sahne (daha once oynamadiysa)
  function gununSahnesi(state) {
    var liste = sahneler();
    for (var i = 0; i < liste.length; i++) {
      var sahne = liste[i];
      if (sahne.gun !== state.gun) continue;
      if (state.gorulenHikaye.indexOf(sahne.id) !== -1) continue;
      if (sahne.kosul && !sahne.kosul(state)) continue;
      return sahne;
    }
    return null;
  }

  // Sahneyi diyalog olarak kurar; bitince ekran olay kartina gecer
  function baslat(state, sahne) {
    if (!sahne) return null;
    state.gorulenHikaye.push(sahne.id);
    state.aktifHikaye = { id: sahne.id, baslik: sahne.baslik };
    G.diyalog.kur(state, sahne.replikler, {
      mekan: sahne.mekan,
      kisiler: sahne.kisiler,
      sonra: "olay",
      kaynak: "hikaye"
    });
    state.ekran = "hikaye";
    state.istatistik.hikayeSahnesi++;
    return sahne;
  }

  // Sabahta cagrilir: bugun sahne varsa kurar
  function sabah(state) {
    var sahne = gununSahnesi(state);
    if (!sahne) return null;
    return baslat(state, sahne);
  }

  // Diyalog bitince sahnenin etkisi islenir
  function bitir(state) {
    var ak = state.aktifHikaye;
    state.aktifHikaye = null;
    if (!ak) return;
    var sahne = bul(ak.id);
    if (sahne && sahne.etki) G.olaylar.etkiUygula(state, sahne.etki);
  }

  function acikMi(state) {
    return !!(state.aktifHikaye && G.diyalog.acikMi(state) && state.diyalog.kaynak === "hikaye");
  }

  function toplam() { return sahneler().length; }

  return {
    sahneler: sahneler,
    bul: bul,
    gununSahnesi: gununSahnesi,
    baslat: baslat,
    sabah: sabah,
    bitir: bitir,
    acikMi: acikMi,
    toplam: toplam
  };
})();
