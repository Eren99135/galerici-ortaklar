// state.js — oyunun tum durumu tek nesnede, JSON'a cevrilebilir (kurallar.md 6-7).
// Kaynak: context/tasarim/08-teknik-mimari.md
window.G = window.G || {};

G.state = null;

G.durum = (function () {
  var C = function () { return G.config; };

  function bosIstatistik() {
    return {
      alinan: 0,
      satilan: 0,
      toplamKar: 0,
      durustSatis: 0,
      saklanan: 0,
      yakalanan: 0,
      kalkanSatici: 0,
      fazlaVerdik: 0,
      agizKullanildi: 0,
      nuriSinirlendi: 0,
      hesapKullanildi: 0,
      kroIlani: 0,
      kroSatisi: 0,
      sikayetGelen: 0,
      kartSecimi: 0,
      hikayeSahnesi: 0,
      sefer: 0,
      seferYemegi: 0,
      takasYapilan: 0,
      sinavDenemesi: 0,
      sinavGecti: 0,
      denetim: 0,
      cekAlinan: 0,
      cekTahsil: 0,
      cekYanan: 0,
      cekSorgusu: 0,
      aval: 0,
      konsinyeAlinan: 0,
      konsinyeSatilan: 0,
      konsinyeKomisyonu: 0,
      konsinyeGeriGiden: 0,
      sizceSecimi: 0,
      yakalananDolandirici: 0,
      enIyiPazarlik: 0
    };
  }

  function yeniOyun(tohum) {
    var c = C();
    var t = tohum;
    if (t === undefined || t === null || isNaN(t)) {
      t = Math.floor((Date.now() % 1000000) + 1);
    }
    t = Math.floor(Math.abs(t)) || 1;
    G.rng.tohumla(t);

    G.state = {
      surum: c.SURUM,
      tohum: t,
      gun: 1,
      faz: "mesai",
      aksiyon: c.GUNLUK_AKSIYON,
      kasa: c.BASLANGIC_KASA,
      itibar: c.BASLANGIC_ITIBAR,
      idSayac: 0,
      ilanlar: [],
      stok: [],
      musteriler: [],
      geriDonenler: [],
      geriGelenMusteriler: [],
      aktifPazarlik: null,
      bayraklar: {
        bedavaEkspertiz: false,
        bereket: false,
        nuriSakin: 0,          // Abla karti (Adim 8): kac gun sinirlenmeyecek
        nuriYokGun: 0,         // bu gun numarasinda Nuri ablasinin yaninda
        kroYokGun: 0,
        sahteIlanGun: 0,       // sahte ilan donemi kac gun surecek (Adim 8)
        vergiIndirimi: false
      },
      bekleyenEtkiler: [],
      aksamEtkileri: [],
      aktifKart: null,
      sonKartId: null,
      cikanKartlar: [],
      yarinkiKart: null,
      sizceSecimi: null,
      sizceKaydirma: 0,
      gunNotlari: [],
      sabahHaberleri: [],
      trend: null,            // aktif piyasa trendi: { id, baslangicGun, bitisGun }
      trendSayaci: 0,         // kacinci trend — yan RNG akisinin tohumu bundan geliyor
      defter: [],
      istatistik: bosIstatistik(),
      beklemeBonusu: 0,
      gunBasiItibar: c.BASLANGIC_ITIBAR,
      ekran: "dukkan",
      acikArabaId: null,
      acikMusteriId: null,
      satisKonusan: "nuri",
      rehber: { adim: 0, acik: true, bitti: false, acikYardim: null },
      diyalog: null,
      detay: {},
      gorulenHikaye: [],
      aktifHikaye: null,
      sefer: null,
      sonSeferGun: 0,
      cekler: [],
      belge: { alindi: false, gun: 0, sonDeneme: 0, yaziGeldi: false },
      sinav: null,
      sonRapor: null,
      bitis: null
    };

    G.gun.sabah(G.state);   // ilk gunun ilanlari
    return G.state;
  }

  function netVarlik(state) {
    var toplam = state.kasa;
    for (var i = 0; i < state.stok.length; i++) {
      var araba = state.stok[i];
      var deger = G.araba.gercekDeger(araba) * C().NET_VARLIK_STOK_ORANI;
      if (araba.konsinye) {
        // Konsinye araba bizim malimiz degil: sadece beklenen komisyon varlik sayilir
        toplam += Math.max(0, deger - araba.konsinye.sahipNet);
      } else {
        toplam += deger;
      }
    }
    return Math.round(toplam);
  }

  function itibarDegis(state, miktar) {
    state.itibar = G.kirp(state.itibar + miktar, C().ITIBAR_MIN, C().ITIBAR_MAKS);
  }

  // ---- kayit ----

  function kaydet() {
    if (!G.state) return false;
    try {
      var paket = { rngDurum: G.rng.durumAl(), state: G.state };
      window.localStorage.setItem(C().KAYIT_ANAHTARI, JSON.stringify(paket));
      return true;
    } catch (e) {
      console.error("Kayit yazilamadi:", e);
      return false;
    }
  }

  function yukle() {
    try {
      var ham = window.localStorage.getItem(C().KAYIT_ANAHTARI);
      if (!ham) return null;
      var paket = JSON.parse(ham);
      if (!paket || !paket.state || paket.state.surum !== C().SURUM) return null;
      G.state = paket.state;
      G.rng.durumYaz(paket.rngDurum);
      return G.state;
    } catch (e) {
      console.error("Kayit okunamadi, yeni oyun aciliyor:", e);
      return null;
    }
  }

  function kaydiSil() {
    try {
      window.localStorage.removeItem(C().KAYIT_ANAHTARI);
      // Eski surumlerden kalan kayitlar da temizlensin: tarayicida birikmesinler
      for (var surum = 1; surum <= C().SURUM; surum++) {
        window.localStorage.removeItem("galerici_kayit_v" + surum);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // ---- Faz 4: ogretici oynanis (madde 8) ----
  // Ayri bir sahte akis yazmiyoruz; gercek oyun sabit tohumla, affedici bir ilk ilanla
  // ve rehber acik halde oynatiliyor. Bitince yeniOyun cagrilip her sey temizleniyor,
  // yani burada kaybettigin gercek olmuyor.
  function tutorialBaslat() {
    var c = G.config;
    var state = yeniOyun(c.TUTORIAL_TOHUM);
    state.tutorial = { aktif: true, bitisGun: c.TUTORIAL_GUN };
    state.rehber = { adim: 0, acik: true, bitti: false, acikYardim: null };

    // Ilk ilan ogretici icin yumusatilir: durust satici, gizli kusur yok, fiyat piyasanin alti
    var ilk = state.ilanlar[0];
    if (ilk) {
      ilk.saticiTipi = "durust";
      ilk.persona = "memur";
      ilk.tabanR = 0.92;
      for (var i = 0; i < ilk.kusurlar.length; i++) ilk.kusurlar[i].gorunurluk = "acik";
      ilk.istenenFiyat = G.yuvarla(ilk.piyasaDegeri * c.TUTORIAL_ILAN_INDIRIM);
      ilk.iddia = { boyasiz: ilk.kusurlar.length === 0, degisensiz: true, tramer: 0 };
    }
    return state;      // ekrani zorlamiyoruz: oyun dogal akisiyla (prologla) basliyor
  }

  function tutorialAktifMi(state) {
    return !!(state && state.tutorial && state.tutorial.aktif);
  }

  // Ogretici suresi doldu mu (gun sayaci gecince bitis ekrani cikar)
  function tutorialBittiMi(state) {
    return tutorialAktifMi(state) && state.gun > state.tutorial.bitisGun;
  }

  function tutorialBitir() {
    return yeniOyun(null);     // her sey temizlenir, gercek oyun prologuyla baslar
  }

  return {
    yeniOyun: yeniOyun,
    tutorialBaslat: tutorialBaslat,
    tutorialBitir: tutorialBitir,
    tutorialAktifMi: tutorialAktifMi,
    tutorialBittiMi: tutorialBittiMi,
    netVarlik: netVarlik,
    itibarDegis: itibarDegis,
    kaydet: kaydet,
    yukle: yukle,
    kaydiSil: kaydiSil,
    bosIstatistik: bosIstatistik
  };
})();
