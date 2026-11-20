// trend.js — haftalik piyasa haberleri: 4-5 gun suren mini talep trendleri.
// Kaynak: context/tasarim/15-piyasa-trendleri.md
//
// Trend sadece SATIS tarafini oynatir: ilgili gövdeye/segmente musteri gelme
// olasiligi ve musterinin butcesi hafifce degisir. Alim tarafi (ilan uretimi,
// saticinin tabani) kasitli olarak disarida: trend "ucuza al, pahaliya sat"
// diye cifte avantaja donusmesin, bir de ilan uretimindeki cekilis sirasi
// bozulmasin diye.
//
// RNG: trend secimi ANA AKISTAN CEKMEZ. Durum saklanip ayri bir tohumla
// cekilis yapiliyor, sonra eski durum geri konuyor. Boylece ayni tohumda
// ilanlar bugunkuyle birebir ayni kaliyor (bkz. hafiza.md, "tohumlu RNG'de
// onemli olan cekilis sayisi degil sirasi").
window.G = window.G || {};

G.trend = (function () {
  var C = function () { return G.config; };

  function katalog() {
    return (G.data && G.data.trendler) || [];
  }

  function tanim(id) {
    var liste = katalog();
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].id === id) return liste[i];
    }
    return null;
  }

  // Fiyat segmenti: SEGMENT_BUTCE tablosunun esikleri (pazarlik.js segmentCarpani
  // ile ayni kaynak). Ilk dilim ucuz, ortanca orta, ustu pahali.
  function segmentAdi(deger) {
    var tablo = C().SEGMENT_BUTCE || [];
    if (tablo.length < 2) return "orta";
    if (deger <= tablo[0].ustDeger) return "ucuz";
    if (deger <= tablo[1].ustDeger) return "orta";
    return "pahali";
  }

  function kumeKapsarMi(kume, araba) {
    if (!kume) return false;
    var i;
    if (kume.govde && araba.govde) {
      for (i = 0; i < kume.govde.length; i++) {
        if (kume.govde[i] === araba.govde) return true;
      }
    }
    if (kume.segment) {
      var ad = segmentAdi(araba.piyasaDegeri);
      for (i = 0; i < kume.segment.length; i++) {
        if (kume.segment[i] === ad) return true;
      }
    }
    return false;
  }

  // Ana akisa dokunmadan cekilis yapar.
  function yanAkis(tohum, islev) {
    var saklanan = G.rng.durumAl();
    G.rng.tohumla(tohum);
    var sonuc = islev();
    G.rng.durumYaz(saklanan);
    return sonuc;
  }

  function aktif(state) {
    if (!state || !state.trend) return null;
    return tanim(state.trend.id);
  }

  function kalanGun(state) {
    if (!state || !state.trend) return 0;
    return Math.max(0, state.trend.bitisGun - state.gun + 1);
  }

  // Yeni trend secer. Ust uste ayni trend gelmez.
  function trendSec(state) {
    var c = C();
    var liste = katalog();
    if (!liste.length) return null;

    var sayac = (state.trendSayaci || 0) + 1;
    var tohum = ((state.tohum || 1) ^ (sayac * 0x9E3779B1)) >>> 0;
    var oncekiId = state.trend ? state.trend.id : null;

    var secim = yanAkis(tohum, function () {
      var secilebilir = [];
      for (var i = 0; i < liste.length; i++) {
        if (liste[i].id !== oncekiId) secilebilir.push(liste[i]);
      }
      if (!secilebilir.length) secilebilir = liste;
      return {
        id: G.rng.sec(secilebilir).id,
        sure: G.rng.tam(c.TREND_SURE_MIN, c.TREND_SURE_MAKS)
      };
    });

    state.trendSayaci = sayac;
    state.trend = {
      id: secim.id,
      baslangicGun: state.gun,
      bitisGun: state.gun + secim.sure - 1
    };
    return tanim(secim.id);
  }

  // Her sabah cagrilir. Yeni trend basladiysa tanimini dondurur, yoksa null.
  function sabahKontrol(state) {
    if (!state.trend || state.gun > state.trend.bitisGun) {
      return trendSec(state);
    }
    return null;
  }

  // Bir arabanin trendden gordugu carpanlar.
  function carpanlar(state, araba) {
    var c = C();
    var bos = { gelme: 1, butce: 1 };
    if (!araba) return bos;
    var t = aktif(state);
    if (!t) return bos;
    if (kumeKapsarMi(t.artan, araba)) {
      return { gelme: c.TREND_GELME.artan, butce: c.TREND_BUTCE.artan };
    }
    if (kumeKapsarMi(t.azalan, araba)) {
      return { gelme: c.TREND_GELME.azalan, butce: c.TREND_BUTCE.azalan };
    }
    return bos;
  }

  // Arabanin trende gore yonu: 1 artan, -1 azalan, 0 ilgisiz. Arayuz kullaniyor.
  function yon(state, araba) {
    var t = aktif(state);
    if (!t || !araba) return 0;
    if (kumeKapsarMi(t.artan, araba)) return 1;
    if (kumeKapsarMi(t.azalan, araba)) return -1;
    return 0;
  }

  return {
    aktif: aktif,
    kalanGun: kalanGun,
    sabahKontrol: sabahKontrol,
    carpanlar: carpanlar,
    yon: yon,
    segmentAdi: segmentAdi,
    trendSec: trendSec
  };
})();
