// ekspertiz.js — goz kontrolu, normal, premium, tanidik ekspertiz.
// Kaynak: context/tasarim/03-ekspertiz-ve-pazarlik.md §1
window.G = window.G || {};

G.ekspertiz = (function () {

  // Her kusur icin zar bir kez atilir. Daha iyi bir ekspertiz sonradan yaptirilirsa
  // yalnizca ortaya cikmamis kusurlar icin tekrar atilir (tasarim/03 §1).
  function uygula(araba, seviye) {
    var ayar = G.config.EKSPERTIZ[seviye];
    var bulunan = [];
    for (var i = 0; i < araba.kusurlar.length; i++) {
      var k = araba.kusurlar[i];
      if (k.ortayaCikti) continue;
      var sans = ayar[k.gorunurluk];
      if (G.rng.sans(sans)) {
        k.ortayaCikti = true;
        bulunan.push(k);
      }
    }
    return bulunan;
  }

  // Ilan ilk kez acildiginda bedava goz kontrolu
  function gozKontrol(araba) {
    if (araba.gozBakildi) return [];
    araba.gozBakildi = true;
    return uygula(araba, "goz");
  }

  // Paralı ekspertiz. Kasadan parayi burada duser; araba alinirsa masraflara yazilir,
  // alinmazsa bosa gider (tasarim/03 §1).
  function ekspertizYap(state, araba, seviye) {
    var ayar = G.config.EKSPERTIZ[seviye];
    if (!ayar) return { hata: "Boyle bir ekspertiz yok." };

    var bedel = ayar.bedel;
    if (state.bayraklar.bedavaEkspertiz && seviye === "normal") {
      bedel = 0;
      state.bayraklar.bedavaEkspertiz = false;
    }
    if (bedel > state.kasa) {
      return { hata: "Kasada pere yok ortak." };
    }

    state.kasa -= bedel;
    araba.ekspertizMasrafi += bedel;
    araba.ekspertizSeviyesi = seviye;
    if (seviye === "tanidik") araba.tanidikRaporu = true;

    var bulunan = uygula(araba, seviye);

    // tasarim/07 ekran 9 — "yakalanan dolandirici": agir gizli kusuru alistan once gorduk
    if (araba.saticiTipi === "dolandirici" && !araba.dolandiriciYakalandi) {
      for (var i = 0; i < bulunan.length; i++) {
        if (bulunan[i].tip === "sase" || bulunan[i].tip === "agirHasar") {
          araba.dolandiriciYakalandi = true;
          state.istatistik.yakalananDolandirici++;
          break;
        }
      }
    }

    return { bedel: bedel, bulunan: bulunan, seviye: seviye };
  }

  // Satici abartici ya da dolandiriciysa "tanidigim ekspertiz" teklifi gelir (tasarim/03 §1)
  function tanidikTeklifVarMi(araba) {
    return araba.saticiTipi !== "durust" && !araba.tanidikRaporu;
  }

  // Bir ekspertizin ortaya cikarmadigi kusur olabilir; oyuncu kac tane oldugunu bilmez
  function bilinmeyenVarMi(araba) {
    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (!araba.kusurlar[i].ortayaCikti) return true;
    }
    return false;
  }

  function cikanKusurlar(araba) {
    var liste = [];
    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].ortayaCikti) liste.push(araba.kusurlar[i]);
    }
    return liste;
  }

  return {
    uygula: uygula,
    gozKontrol: gozKontrol,
    ekspertizYap: ekspertizYap,
    tanidikTeklifVarMi: tanidikTeklifVarMi,
    bilinmeyenVarMi: bilinmeyenVarMi,
    cikanKusurlar: cikanKusurlar
  };
})();
