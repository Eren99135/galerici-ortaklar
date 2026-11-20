// musteri.js — musteri gelisi ve musteri uretimi. DOM'a dokunmaz.
// Kaynak: context/tasarim/04-satis-ve-itibar.md §1-2
window.G = window.G || {};

G.musteri = (function () {
  var C = function () { return G.config; };

  function tipSec() {
    var t = C().MUSTERI_TIPLERI;
    return G.rng.agirlikliSec([
      { deger: "pazarlikci", agirlik: t.pazarlikci.oran },
      { deger: "aceleci", agirlik: t.aceleci.oran },
      { deger: "titiz", agirlik: t.titiz.oran }
    ]);
  }

  // tasarim/04 §1 — musteri gelme olasiligi
  function gelmeOlasiligi(state, araba) {
    var c = C();
    if (!araba.ilanFiyati || araba.ilanFiyati <= 0) return 0;
    var algilanan = G.pazarlik.algilananDeger(araba);     // secim yapilmadi: bilinen kusurlar soylenecek varsayilir
    var itibarCarpani = c.ITIBAR_CARPAN_TABAN + state.itibar / c.ITIBAR_CARPAN_BOLEN;
    // Faz 2: kusur yuku fiyattan BAGIMSIZ olarak trafigi kisar. Yukaridaki oran sadece
    // "ucuz mu" diye bakiyordu, o yuzden hurda araba ucuza konunca temiz araba kadar kolay
    // satiliyordu. Artik sorunlu arabaya daha az musteri ugruyor.
    var kusurCarpani = 1 - G.araba.kusurBaskisi(araba) * c.KUSUR_GELME_ETKI;
    // Piyasa trendi: revactaki gövdeye daha cok musteri ugruyor (js/trend.js)
    var trendCarpani = G.trend.carpanlar(state, araba).gelme;
    var p = c.MUSTERI_P_TABAN *
            Math.pow(algilanan / araba.ilanFiyati, c.MUSTERI_P_US) *
            itibarCarpani *
            kusurCarpani *
            trendCarpani +
            (state.beklemeBonusu || 0);
    return Math.max(0, Math.min(p, c.MUSTERI_P_MAKS));
  }

  // Faz 2 — dusuk itibarda musteri ekspertizden vazgecmez: "once bir baktiralim abi".
  // Zar yine atiliyor, sadece sonucu yok sayiliyor; tohumlu RNG akisi kaymasin diye.
  function ekspertizAtlar(state, ayar) {
    var atlar = ayar.ekspertizYokOlasilik > 0 ? G.rng.sans(ayar.ekspertizYokOlasilik) : false;
    if (state.itibar < C().ITIBAR_EKSPERTIZ_ESIK) return false;
    return atlar;
  }

  function musteriUret(state, araba) {
    var c = C();
    var tip = tipSec();
    var ayar = c.MUSTERI_TIPLERI[tip];
    var musteri = {
      id: "m" + (++state.idSayac),
      isim: G.rng.sec(G.data.musteriIsimleri),
      tip: tip,
      arabaId: araba.id,
      sabir: ayar.sabir,
      gelisGunu: state.gun,
      ekspertizYok: ekspertizAtlar(state, ayar),
      geriGelisGunu: null,
      takasArabasi: null,
      takasKapandi: false
    };

    // Adim 21: kucuk bir kismi vadeli cekle odemek ister (pazarlik etmez, ekspertiz istemez)
    if (G.rng.sans(c.CEK_OLASILIK)) G.cek.musteriyiCekciYap(state, musteri);

    // Adim 20: bir kismi yaninda kendi arabasiyla gelir (tezgahta yer varsa)
    if (state.stok.length < c.KAPASITE && G.rng.sans(c.TAKAS_OLASILIK)) {
      musteri.takasArabasi = G.takas.arabaUret(state);
    }

    return musteri;
  }

  // Her sabah stoktaki her araba icin musteri zari
  function musteriGelisleri(state) {
    var c = C();
    var gelenler = [];
    for (var i = 0; i < state.stok.length; i++) {
      if (state.musteriler.length >= c.MAKS_MUSTERI) break;
      var araba = state.stok[i];
      if (G.araba.satilamazMi(araba) && saseBiliniyor(araba)) continue;
      var p = gelmeOlasiligi(state, araba);
      if (G.rng.sans(p)) {
        var m = musteriUret(state, araba);
        state.musteriler.push(m);
        gelenler.push(m);
      }
    }
    return gelenler;
  }

  function saseBiliniyor(araba) {
    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].tip === "sase" && araba.kusurlar[i].ortayaCikti) return true;
    }
    return false;
  }

  // Bekleme suresi gecen musteriler gider (tasarim/01)
  function bekleyenleriEskit(state) {
    var c = C();
    var gidenler = [];
    for (var i = state.musteriler.length - 1; i >= 0; i--) {
      var m = state.musteriler[i];
      if (state.gun - m.gelisGunu >= c.MUSTERI_BEKLEME_GUN) {
        gidenler.push(m);
        state.musteriler.splice(i, 1);
      }
    }
    return gidenler;
  }

  // Pazarliktan kalkip "bi dusuneyim" diyen musteriler geri gelir
  function geriGelenleriIsle(state) {
    var c = C();
    var gelenler = [];
    for (var i = state.geriGelenMusteriler.length - 1; i >= 0; i--) {
      var m = state.geriGelenMusteriler[i];
      if (m.geriGelisGunu <= state.gun) {
        state.geriGelenMusteriler.splice(i, 1);
        var arabaDuruyor = false;
        for (var j = 0; j < state.stok.length; j++) {
          if (state.stok[j].id === m.arabaId) arabaDuruyor = true;
        }
        if (arabaDuruyor && state.musteriler.length < c.MAKS_MUSTERI) {
          m.gelisGunu = state.gun;
          m.sabir = c.MUSTERI_TIPLERI[m.tip].sabir;
          m.geriDonen = true;
          state.musteriler.push(m);
          gelenler.push(m);
        }
      }
    }
    return gelenler;
  }

  function tipAdi(tip) {
    if (tip === "pazarlikci") return "pazarlıkçı";
    if (tip === "aceleci") return "aceleci";
    return "titiz";
  }

  return {
    musteriGelisleri: musteriGelisleri,
    musteriUret: musteriUret,
    gelmeOlasiligi: gelmeOlasiligi,
    bekleyenleriEskit: bekleyenleriEskit,
    geriGelenleriIsle: geriGelenleriIsle,
    tipAdi: tipAdi
  };
})();
