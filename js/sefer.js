// sefer.js — sehir disi seferler (Adim 18, tasarim/10).
// Sefer bir gunu yer: cikilinca o gunun kalan aksiyonlari biter, yerine sefere
// ozel pazarlik hakki gelir. Sehirdeki ilanlar daha ucuz ama daha riskli.
window.G = window.G || {};

G.sefer = (function () {
  var C = function () { return G.config; };

  function sehirler() { return G.data.sehirler || []; }

  function sehirBul(id) {
    var liste = sehirler();
    for (var i = 0; i < liste.length; i++) {
      if (liste[i].id === id) return liste[i];
    }
    return null;
  }

  function acikMi(state) {
    return !!state.sefer;
  }

  // Bugun sefere cikilabilir mi; cikilamiyorsa sebebi
  function engel(state) {
    var c = C();
    if (state.bitis) return "Oyun bitti ortak.";
    if (acikMi(state)) return "Zaten yoldayız.";
    if (state.faz !== "mesai") return "Sefer sabah kartından sonra çıkılır.";
    if (state.aksiyon < 1) return "Bugün aksiyon hakkın kalmadı ortak.";
    if (state.stok.length >= c.KAPASITE) return "Tezgâh dolu, önce satalım.";
    if (state.gun > c.GUN_SAYISI - c.SEFER_SON_GUN) {
      return "Son günlerde sefere çıkılmaz, araba satılamadan kalır.";
    }
    if (state.sonSeferGun && state.gun - state.sonSeferGun < c.SEFER_BEKLEME) {
      var kalan = c.SEFER_BEKLEME - (state.gun - state.sonSeferGun);
      return "Daha yeni döndük, " + kalan + " gün sonra.";
    }
    if (state.kasa < c.SEFER_EN_AZ_KASA) return "Kasa yol parasını bile kaldırmaz.";
    return null;
  }

  function gidebilirMi(state) {
    return engel(state) === null;
  }

  // Bugun gidilebilecek sehirler (tohumlu secim, her gun ayni gun icin ayni liste)
  function secenekler(state) {
    var liste = sehirler().slice();
    var secilen = [];
    var adet = Math.min(C().SEFER_SECENEK, liste.length);
    for (var i = 0; i < adet; i++) {
      var sira = G.rng.tam(0, liste.length - 1);
      secilen.push(liste[sira]);
      liste.splice(sira, 1);
    }
    secilen.sort(function (a, b) { return a.mesafe - b.mesafe; });
    return secilen;
  }

  // Sehirdeki ilanlar: ucuz ama riskli
  function sehirIlanlari(state, sehir) {
    var c = C();
    var ilanlar = [];
    var eskiOranlar = c.SATICI_ORANLARI;

    // Dolandirici agirligi sehre gore artar (config'e dokunmadan, gecici degisim)
    c.SATICI_ORANLARI = {
      durust: eskiOranlar.durust,
      abartici: eskiOranlar.abartici * c.SEFER_ABARTICI_CARPAN,
      dolandirici: eskiOranlar.dolandirici * sehir.dolandiriciCarpani
    };

    try {
      for (var i = 0; i < sehir.ilanSayisi; i++) {
        var araba = G.araba.ilanUret(state, "sefer");
        var indirim = G.rng.aralik(sehir.indirim[0], sehir.indirim[1]);
        araba.istenenFiyat = G.yuvarla(araba.istenenFiyat * (1 - indirim));
        araba.seferIndirimi = Math.round(indirim * 100);
        araba.sehir = sehir.ad;
        ilanlar.push(araba);
      }
    } finally {
      c.SATICI_ORANLARI = eskiOranlar;
    }

    // Biri varinca satilmis olabilir: eli bos donme riski (dizideki Konya seferi)
    if (ilanlar.length > 1 && G.rng.sans(c.SEFER_SATILMIS_OLASILIK)) {
      var giden = ilanlar.pop();
      state.gunNotlari.push(sehir.ad + ": " + G.araba.adi(giden) + " biz varmadan satılmış.");
    }

    return ilanlar;
  }

  function baslat(state, sehirId) {
    var c = C();
    var hata = engel(state);
    if (hata) return { hata: hata };

    var sehir = sehirBul(sehirId);
    if (!sehir) return { hata: "Böyle bir şehir yok." };
    if (state.kasa < sehir.yolMasrafi) return { hata: "Yol parası bile yok ortak." };

    state.kasa -= sehir.yolMasrafi;
    state.aksiyon = 0;                       // sefer gunu yer
    state.sonSeferGun = state.gun;
    state.istatistik.sefer++;

    state.sefer = {
      sehirId: sehir.id,
      sehirAdi: sehir.ad,
      yolMasrafi: sehir.yolMasrafi,
      ilanlar: sehirIlanlari(state, sehir),
      kalanPazarlik: c.SEFER_PAZARLIK,
      yemekYapildi: false,
      sabirBonusu: 0,
      alinan: 0,
      gezilen: []
    };

    state.defter.push({
      gun: state.gun, tur: "yol", araba: sehir.ad + " seferi",
      fiyat: sehir.yolMasrafi, masraf: 0
    });
    state.gunNotlari.push(sehir.ad + " seferi: yol " + G.paraYaz(sehir.yolMasrafi) +
      ". Dükkân Kro'ya emanet.");

    state.ekran = "sefer";
    return state.sefer;
  }

  // Sehirdeki ilana gitmek sefere ozel hakki harcar (ayni ilana donmek bedava)
  function ilanaGit(state, arabaId) {
    var sefer = state.sefer;
    if (!sefer) return { hata: "Seferde değiliz." };
    if (sefer.gezilen.indexOf(arabaId) !== -1) return { tamam: true, bedava: true };
    if (sefer.kalanPazarlik < 1) return { hata: "Bu seferde vakit kalmadı ortak." };
    sefer.kalanPazarlik--;
    sefer.gezilen.push(arabaId);
    return { tamam: true };
  }

  // Yemek molasi: bir kez, kalan pazarliklarda sabir +1
  function yemek(state) {
    var c = C();
    var sefer = state.sefer;
    if (!sefer) return { hata: "Seferde değiliz." };
    if (sefer.yemekYapildi) return { hata: "Yedik ortak, kalkalım." };
    var sehir = sehirBul(sefer.sehirId);
    if (!sehir) return { hata: "Şehir bulunamadı." };
    if (state.kasa < sehir.yemek.bedel) return { hata: "Kasada pere yok ortak." };

    state.kasa -= sehir.yemek.bedel;
    sefer.yemekYapildi = true;
    sefer.sabirBonusu = c.SEFER_YEMEK_SABIR;
    state.istatistik.seferYemegi++;
    state.gunNotlari.push(sehir.ad + ": " + sehir.yemek.ad + " molası, " +
      G.paraYaz(sehir.yemek.bedel) + ".");

    G.diyalog.kur(state, sehir.yemek.replikler, {
      mekan: "lokanta",
      kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }],
      sonra: "sefer",
      kaynak: "yemek"
    });
    state.ekran = "yemek";
    return sefer;
  }

  function don(state) {
    var sefer = state.sefer;
    if (!sefer) return null;
    var ozet = {
      sehir: sefer.sehirAdi,
      alinan: sefer.alinan,
      yolMasrafi: sefer.yolMasrafi
    };
    state.gunNotlari.push(sefer.sehirAdi + " seferi bitti: " +
      (sefer.alinan > 0 ? sefer.alinan + " araba geldi." : "eli boş döndük."));
    state.sefer = null;
    state.ekran = "dukkan";
    state.aktifPazarlik = null;
    state.acikArabaId = null;
    return ozet;
  }

  // Pazarlik sefer ilanini da bulabilsin diye
  function ilanBul(state, id) {
    if (!state.sefer) return null;
    for (var i = 0; i < state.sefer.ilanlar.length; i++) {
      if (state.sefer.ilanlar[i].id === id) return state.sefer.ilanlar[i];
    }
    return null;
  }

  function ilanSil(state, id) {
    if (!state.sefer) return;
    for (var i = 0; i < state.sefer.ilanlar.length; i++) {
      if (state.sefer.ilanlar[i].id === id) {
        state.sefer.ilanlar.splice(i, 1);
        return;
      }
    }
  }

  function sabirBonusu(state) {
    return state.sefer ? state.sefer.sabirBonusu : 0;
  }

  return {
    sehirler: sehirler,
    sehirBul: sehirBul,
    acikMi: acikMi,
    engel: engel,
    gidebilirMi: gidebilirMi,
    secenekler: secenekler,
    baslat: baslat,
    ilanaGit: ilanaGit,
    yemek: yemek,
    don: don,
    ilanBul: ilanBul,
    ilanSil: ilanSil,
    sabirBonusu: sabirBonusu
  };
})();
