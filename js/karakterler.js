// karakterler.js — Nuri, Drej, Kro. Pasifler Adim 4'te, aktif yetenekler ve Kro Adim 7'de geldi.
// Kaynak: context/tasarim/05-karakterler.md
window.G = window.G || {};

G.karakterler = (function () {
  var C = function () { return G.config; };

  var tanimlar = {
    nuri: {
      anahtar: "nuri",
      ad: "Nuri",
      kisaTanim: "Ağzıyla satar, çabuk parlar",
      renkSinifi: "nuri",
      sabirBonusu: 1,              // konustugu pazarlikta karsi tarafin sabri +1
      kusurToplamiGorur: false,
      yetenek: { ad: "Ağız", aciklama: "Alışta taban -%3, satışta tavan +%3. Sinirlenirse masa dağılır." },
      alista: true, satista: true
    },
    drej: {
      anahtar: "drej",
      ad: "Drej",
      kisaTanim: "Hesapçı, kuralcı",
      renkSinifi: "drej",
      sabirBonusu: -1,             // cok soru sorar
      kusurToplamiGorur: true,
      yetenek: { ad: "Hesap", aciklama: "Satıcının tabanını (satışta müşterinin tavanını) ±%4 aralıkla söyler." },
      alista: true, satista: true
    },
    kro: {
      anahtar: "kro",
      ad: "Kro",
      kisaTanim: "Fırsat ve kaos",
      renkSinifi: "kro",
      sabirBonusu: 1,              // tasarim/05: musteri sabri +1
      kusurToplamiGorur: false,
      yetenek: null,               // pazarlikta yetenegi yok
      alista: false,               // MVP'de alis pazarliginda konusmaz
      satista: true,
      durustlukZorunlu: "soyle"    // kusurlari durustce soyler
    }
  };

  function al(anahtar) {
    return tanimlar[anahtar] || tanimlar.nuri;
  }

  // Nuri sinirlendigi gunun ertesinde ablasinin yanindadir (tasarim/05)
  function nuriYokMu(state) {
    return !!(state.bayraklar && state.bayraklar.nuriYokGun === state.gun);
  }

  function kullanilabilir(state, anahtar) {
    if (anahtar === "nuri") return !nuriYokMu(state);
    if (anahtar === "kro") return !(state.bayraklar && state.bayraklar.kroYokGun === state.gun);
    return true;
  }

  function alistaKonusanlar(state) {
    var liste = [];
    for (var a in tanimlar) {
      if (tanimlar[a].alista && kullanilabilir(state, a)) liste.push(tanimlar[a]);
    }
    return liste;
  }

  function satistaKonusanlar(state) {
    var liste = [];
    for (var a in tanimlar) {
      if (tanimlar[a].satista && kullanilabilir(state, a)) liste.push(tanimlar[a]);
    }
    return liste;
  }

  // Bir hakaret ya da kazik turundan sonra Nuri daha cabuk parlar (tasarim/05).
  // Abla'nin yemegi (bayraklar.nuriSakin) sirasinda hic sinirlenmez; karti Adim 8'de gelecek.
  function sinirlenmeOlasiligi(state, p) {
    if (state && state.bayraklar && state.bayraklar.nuriSakin > 0) return 0;
    // karar #19: oyunun ilk gunlerinde Nuri masayi dagitmaz
    if (state && state.gun <= C().NURI_SAKIN_GUN) return 0;
    return p && p.hakaretOldu ? C().NURI_SINIR_OLASILIK_KIZGIN : C().NURI_SINIR_OLASILIK;
  }

  // Drej, saticinin tanidik ekspertizine karsi uyarir (tasarim/05)
  function uyariVarMi(konusan, araba) {
    return konusan === "drej" && G.ekspertiz.tanidikTeklifVarMi(araba);
  }

  // Drej, Kro'nun getirdigi ilan dolandiriciysa %40 ihtimalle tuhafligi sezer.
  // Zar ilan uretilirken bir kez atilir, ekrana her girildiginde degismesin.
  function tuhaflikSezildiMi(araba) {
    return !!araba.drejTuhaflik;
  }

  // Her sabah Kro %50 ihtimalle bir ilan getirir (tasarim/05)
  function kroSabah(state) {
    var c = C();
    if (!kullanilabilir(state, "kro")) return null;
    if (state.ilanlar.length >= c.MAKS_ILAN) return null;
    if (!G.rng.sans(c.KRO_SABAH_OLASILIK)) return null;

    var araba = G.araba.kroIlaniUret(state);
    state.ilanlar.push(araba);
    state.istatistik.kroIlani++;
    return araba;
  }

  return {
    al: al,
    liste: function () { return [tanimlar.nuri, tanimlar.drej, tanimlar.kro]; },
    nuriYokMu: nuriYokMu,
    kullanilabilir: kullanilabilir,
    alistaKonusanlar: alistaKonusanlar,
    satistaKonusanlar: satistaKonusanlar,
    sinirlenmeOlasiligi: sinirlenmeOlasiligi,
    uyariVarMi: uyariVarMi,
    tuhaflikSezildiMi: tuhaflikSezildiMi,
    kroSabah: kroSabah,
    // eski cagrilar icin kisayollar
    nuri: tanimlar.nuri,
    drej: tanimlar.drej,
    kro: tanimlar.kro
  };
})();
