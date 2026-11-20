// test.js — kucuk test kosucusu. test.html ile calisir, ui.js yuklenmez.
// Kritik testler: tasarim/03 §6 BMW senaryosu, ortasi, kalk blofu, tohum tekrari, kayit, para hesaplari.
window.G = window.G || {};

G.testler = [];

G.test = function (ad, fn) {
  G.testler.push({ ad: ad, fn: fn });
};

G.esit = function (bulunan, beklenen, etiket) {
  if (bulunan !== beklenen) {
    throw new Error((etiket ? etiket + ": " : "") + "beklenen " + beklenen + ", bulunan " + bulunan);
  }
  return true;
};

G.dogru = function (kosul, etiket) {
  if (!kosul) throw new Error((etiket || "kosul") + " saglanmadi");
  return true;
};

G.testKos = function () {
  var sonuclar = [];
  for (var i = 0; i < G.testler.length; i++) {
    var t = G.testler[i];
    try {
      t.fn();
      sonuclar.push({ ad: t.ad, gecti: true });
    } catch (e) {
      sonuclar.push({ ad: t.ad, gecti: false, hata: e.message });
    }
  }
  return sonuclar;
};

// ---------- test yardimcilari ----------

function sahteState() {
  G.rng.tohumla(42);
  return {
    surum: G.config.SURUM, tohum: 42, gun: 1, faz: "mesai", aksiyon: 3,
    kasa: G.config.BASLANGIC_KASA, itibar: 50, idSayac: 0,
    ilanlar: [], stok: [], musteriler: [], geriDonenler: [], geriGelenMusteriler: [],
    aktifPazarlik: null,
    bayraklar: { bedavaEkspertiz: false },
    bekleyenEtkiler: [], aksamEtkileri: [], aktifKart: null, sonKartId: null, cikanKartlar: [],
    gunNotlari: [], sabahHaberleri: [], bugunGezilen: [],
    defter: [], istatistik: G.durum.bosIstatistik(), beklemeBonusu: 0,
    ekran: "dukkan", acikArabaId: null, sonRapor: null, bitis: null
  };
}

function kusur(tip, parca, etki, gorunurluk, tutar) {
  var k = {
    tip: tip, parca: parca || "", etki: etki, gorunurluk: gorunurluk,
    ortayaCikti: true, musteriyeSoylendi: false
  };
  if (tutar) k.tutar = tutar;
  return k;
}

// tasarim/03 §6 kontrol senaryosu: BMW 3.20i, abartici satici
function bmwIlani(state) {
  var araba = {
    id: "bmw", marka: "BMW", model: "3.20i", yil: 2017, km: 120000, renk: "siyah", not: "",
    piyasaDegeri: 1750000,
    kusurlar: [
      kusur("boya", "kaput", 26250, "normal"),
      kusur("boya", "sol on kapi", 26250, "normal"),
      kusur("tramer", "", 51000, "normal", 85000)
    ],
    iddia: { boyasiz: true, degisensiz: true, tramer: 0 },
    saticiTipi: "abartici",
    istenenFiyat: 1850000,
    ilanYasi: 0,
    kaynak: "ilan",
    gozBakildi: true,
    ekspertizSeviyesi: "normal",
    ekspertizMasrafi: 7500,
    tanidikRaporu: false,
    tabanR: 0.90,
    geriDonus: false
  };
  state.ilanlar.push(araba);
  return araba;
}

// ---------- testler ----------

G.test("paraYaz bicimi 1.575.000 TL", function () {
  G.esit(G.paraYaz(1575000), "1.575.000 TL");
  G.esit(G.paraYaz(8000), "8.000 TL");
  G.esit(G.paraYaz(-12000), "-12.000 TL");
  G.esit(G.paraYaz(0), "0 TL");
});

G.test("yuvarla 10.000'e yuvarlar", function () {
  G.esit(G.yuvarla(1693200), 1690000);
  G.esit(G.yuvarla(1007500), 1010000);
  G.esit(G.yuvarla(1005000), 1010000);
});

G.test("kisaFiyat esnaf agzi", function () {
  G.esit(G.kisaFiyat(1575000), "1 milyon 575");
  G.esit(G.kisaFiyat(850000), "850 bin");
  G.esit(G.kisaFiyat(2000000), "2 milyon");
});

G.test("gercekDeger kusurlari duser", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  G.esit(G.araba.gercekDeger(araba), 1750000 - 26250 - 26250 - 51000);
  G.esit(G.araba.kusurToplami(araba.kusurlar), 103500);
});

G.test("unvan esikleri", function () {
  G.esit(G.unvanBul(6700000), "Cirak");
  G.esit(G.unvanBul(7000000), "Galerici");
  G.esit(G.unvanBul(7500000), "Usta");
  G.esit(G.unvanBul(9000000), "Sanayinin Krali");
});

// tasarim/03 §6 — tablo birebir
G.test("BMW senaryosu: taban, karsi ve sabir tablosu", function () {
  var state = sahteState();
  var araba = bmwIlani(state);

  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.esit(Math.round(p.taban), 1665000, "baslangic taban");
  G.esit(p.karsi, 1850000, "baslangic karsi");
  G.esit(p.sabir, 4, "baslangic sabir (abartici 3 + Nuri 1)");

  G.pazarlik.kozKullan(state, "boya");
  G.esit(Math.round(p.taban), 1623000, "boya kozu sonrasi taban");
  G.esit(Math.round(p.karsi), 1808000, "boya kozu sonrasi karsi");
  G.esit(p.sabir, 3, "boya kozu sonrasi sabir");

  G.pazarlik.kozKullan(state, "tramer");
  G.esit(Math.round(p.taban), 1582200, "tramer kozu sonrasi taban");
  G.esit(Math.round(p.karsi), 1767200, "tramer kozu sonrasi karsi");
  G.esit(p.sabir, 2, "tramer kozu sonrasi sabir");

  G.pazarlik.alisTeklif(state, 1500000);
  G.esit(p.karsi, 1690000, "karsi teklif");
  G.esit(p.sabir, 1, "karsi teklif sonrasi sabir");
  G.esit(p.bitti, false, "pazarlik surmeli");

  G.pazarlik.alisTeklif(state, 1590000);
  G.esit(p.sonuc, "kabul", "sonuc");
  G.esit(p.anlasmaFiyati, 1590000, "anlasma fiyati");
  G.esit(p.fazlaVerdik, false, "fazla verdik olmamali");
  G.esit(state.stok.length, 1, "araba stoga girdi");
  G.esit(state.stok[0].masraflar, 7500 + G.config.NOTER_PLAKA, "ekspertiz + noter masrafi");
  G.esit(state.kasa, G.config.BASLANGIC_KASA - 1590000 - G.config.NOTER_PLAKA, "kasa");
});

G.test("BMW senaryosu: tabanin hemen altinda teklif saticiyi kaldirir", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.pazarlik.kozKullan(state, "boya");
  G.pazarlik.kozKullan(state, "tramer");
  G.pazarlik.alisTeklif(state, 1500000);   // sabir 1
  G.pazarlik.alisTeklif(state, 1570000);   // taban alti, ortasi esigi disinda
  G.esit(p.sonuc, "kalkis", "satici kalkmali");
  G.esit(state.ilanlar.length, 0, "ilan listeden dusmeli");
});

// karar #13 — "ortasi"
G.test("ortasi: iki rakam yakinsa satici ortayi soyler", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  p.taban = 1000000;
  p.karsi = 1020000;
  G.pazarlik.alisTeklif(state, 990000);          // fark 30.000 <= 30.000 esigi
  G.esit(p.ortaTeklif, 1010000, "orta teklif");
  G.esit(p.bitti, false, "henuz bitmedi");
  G.pazarlik.ortasiKabul(state);
  G.esit(p.sonuc, "kabul", "el sikisma");
  G.esit(p.anlasmaFiyati, 1010000, "anlasma ortadan");
});

G.test("ortasi: fark buyukse tetiklenmez (BMW tablosu bozulmaz)", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  p.taban = 1000000;
  p.karsi = 1200000;
  G.pazarlik.alisTeklif(state, 990000);
  G.esit(p.ortaTeklif, null, "ortasi cikmamali");
  G.esit(p.karsi, 1120000, "normal karsi teklif");
});

G.test("ortasi reddi sabri yakar", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  p.taban = 1000000;
  p.karsi = 1020000;
  p.sabir = 2;
  G.pazarlik.alisTeklif(state, 990000);
  G.pazarlik.ortasiRed(state);
  G.esit(p.sabir, 1, "sabir dusmeli");
  G.esit(p.karsi, 1010000, "karsi ortaya iner");
  G.esit(p.ortaTeklif, null, "orta teklif temizlenir");
});

// karar #13 — "kalkiyoruz" blofu
G.test("kalk blofu: satici geri cagirirsa taban duser, sabir 1 olur", function () {
  var state = sahteState();
  bmwIlani(state);
  var eski = G.config.KALK_GERI_CAGIRMA.abartici;
  G.config.KALK_GERI_CAGIRMA.abartici = 1;
  try {
    var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
    p.taban = 1400000;          // taban alt sinirinin (gercek deger x %80) uzerinde
    p.karsi = 1600000;
    G.pazarlik.masadanKalk(state);
    G.esit(Math.round(p.taban), 1358000, "taban -%3");
    G.esit(p.karsi, 1480000, "karsi yarilanir");
    G.esit(p.sabir, 1, "son sans");
    G.esit(p.bitti, false, "pazarlik surmeli");
    G.esit(G.pazarlik.masadanKalk(state).hata !== undefined, true, "ikinci kalk calismaz");
  } finally {
    G.config.KALK_GERI_CAGIRMA.abartici = eski;
  }
});

G.test("kalk blofu: cagirmazsa pazarlik biter", function () {
  var state = sahteState();
  bmwIlani(state);
  var eski = G.config.KALK_GERI_CAGIRMA.abartici;
  G.config.KALK_GERI_CAGIRMA.abartici = 0;
  try {
    var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
    G.pazarlik.masadanKalk(state);
    G.esit(p.sonuc, "kalkis", "satici gitmeli");
    G.esit(state.ilanlar.length, 0, "ilan kapanir");
  } finally {
    G.config.KALK_GERI_CAGIRMA.abartici = eski;
  }
});

G.test("dolandirici kozu tanimaz, sadece sabri duser", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.saticiTipi = "dolandirici";
  var p = G.pazarlik.alisBaslat(state, "bmw", "drej");
  var tabanOnce = p.taban;
  var sabirOnce = p.sabir;
  G.pazarlik.kozKullan(state, "boya");
  G.esit(p.taban, tabanOnce, "taban degismemeli");
  G.esit(p.sabir, sabirOnce - G.config.DOLANDIRICI_KOZ_SABIR, "sabir dusmeli");
});

G.test("ilk teklif hakaret sayilmaz, ikincisi sayilir (karar #19)", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  // HAKARET_ESIK ile HAKARET_AGIR_ESIK arasinda: "cok ucuz" ama asagilama degil
  var hafif = Math.round(p.taban * 0.75 / 10000) * 10000;
  var oncekiSabir = p.sabir;
  G.pazarlik.alisTeklif(state, hafif);     // ILK teklif: muaf
  G.esit(p.sabir, oncekiSabir - 1, "ilk teklif sadece sabir -1");
  G.esit(p.bitti, false, "masa dagilmaz");
  G.pazarlik.alisTeklif(state, hafif);     // ayni rakam, bu kez ikinci teklif
  G.esit(p.sabir, oncekiSabir - 3, "ikinci teklif hakaret: sabir -2 daha");
});

G.test("tabanin cok altindaki teklif agir hakaret sayilir, gururlu satici kalkar", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.persona = "elit";                  // gururlu
  var p = G.pazarlik.alisBaslat(state, "bmw", "drej");
  var agir = Math.round(p.taban * 0.45 / 10000) * 10000;
  G.pazarlik.alisTeklif(state, agir);      // ilk teklif muaf
  G.pazarlik.alisTeklif(state, agir);
  G.dogru(p.bitti, "gururlu satici agir hakarete masadan kalkar");

  var state2 = sahteState();
  var araba2 = bmwIlani(state2);
  araba2.persona = "cifci";                // gururlu degil
  var p2 = G.pazarlik.alisBaslat(state2, "bmw", "drej");
  p2.sabir = 9;                            // sabri bol olsun ki kademe farki olculsun
  var agir2 = Math.round(p2.taban * 0.45 / 10000) * 10000;
  G.pazarlik.alisTeklif(state2, agir2);
  G.pazarlik.alisTeklif(state2, agir2);
  G.dogru(!p2.bitti, "gururlu olmayan satici masada kalir");
  G.esit(p2.sabir, 9 - 1 - G.config.HAKARET_AGIR_SABIR, "agir hakaret daha cok sabir yer");
});

G.test("teklif saticinin istediginden yuksekse fazlasi verilmez", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.pazarlik.alisTeklif(state, 1900000);
  G.esit(p.anlasmaFiyati, 1850000, "ilan fiyatindan kapanir");
});

G.test("Drej pasifi sabri dusurur", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "drej");
  G.esit(p.sabir, G.config.SABIR.abartici - 1, "abartici 3 - 1");
});

G.test("taban gercek degerin %80'inin altina inmez", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.kusurlar.push(kusur("agirHasar", "", 437500, "gizli"));
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  var alt = G.araba.gercekDeger(araba) * G.config.TABAN_ALT_SINIR;
  G.pazarlik.kozKullan(state, "agirHasar");
  G.dogru(p.taban >= alt - 1, "taban alt sinirin altina inmemeli");
});

// Satis tarafi
G.test("satis: vergi pozitif kardan %20 kesilir", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.alisFiyati = 1000000;
  araba.masraflar = 19500;
  araba.ilanFiyati = 1150000;
  araba.stogaGirisGunu = 1;
  state.ilanlar.length = 0;
  state.stok.push(araba);
  var musteri = {
    id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw",
    sabir: 4, gelisGunu: 1, ekspertizYok: true
  };
  state.musteriler.push(musteri);
  state.aktifPazarlik = {
    tur: "satis", arabaId: "bmw", musteriId: "m1", durustluk: "soyle",
    tavan: 1200000, karsi: 1000000, sabir: 4, tavizKullanildi: false,
    teklif: 1150000, gecmis: [], bitti: false, sonuc: null, bulunanKusurlar: []
  };
  var p = G.pazarlik.satisTeklif(state, 1150000);
  G.esit(p.sonuc, "satildi");
  G.esit(p.anlasmaFiyati, 1150000, "satis fiyati");
  G.esit(p.kar, 1150000 - 1000000 - 19500, "brut kar");
  G.esit(p.vergi, Math.round((1150000 - 1000000 - 19500) * 0.2), "vergi");
  G.esit(state.stok.length, 0, "araba stoktan dustu");
  G.esit(state.itibar, 53, "durust satis itibar +3");
});

G.test("satis: musteri daha fazla verecek olsa bile senin soyledigin fiyattan kapanir", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.alisFiyati = 1000000;
  araba.masraflar = 12000;
  araba.ilanFiyati = 1150000;
  state.ilanlar.length = 0;
  state.stok.push(araba);
  state.musteriler.push({ id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw", sabir: 4, gelisGunu: 1, ekspertizYok: true });
  state.aktifPazarlik = {
    tur: "satis", arabaId: "bmw", musteriId: "m1", durustluk: "soyle",
    tavan: 1200000, karsi: 1100000, sabir: 4, tavizKullanildi: false,
    teklif: 1000000, gecmis: [], bitti: false, sonuc: null, bulunanKusurlar: []
  };
  var p = G.pazarlik.satisTeklif(state, 1050000);
  G.esit(p.anlasmaFiyati, 1050000, "senin soyledigin fiyattan kapanir");
});

G.test("satis: saklanan kusur sikayet olarak zamanlanir", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.alisFiyati = 1000000;
  araba.masraflar = 12000;
  araba.ilanFiyati = 1150000;
  state.ilanlar.length = 0;
  state.stok.push(araba);
  state.musteriler.push({ id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw", sabir: 4, gelisGunu: 1, ekspertizYok: true });
  state.aktifPazarlik = {
    tur: "satis", arabaId: "bmw", musteriId: "m1", durustluk: "sakla",
    tavan: 1200000, karsi: 1000000, sabir: 4, tavizKullanildi: false,
    teklif: 1150000, gecmis: [], bitti: false, sonuc: null, bulunanKusurlar: []
  };
  G.pazarlik.satisTeklif(state, 1150000);
  G.esit(state.bekleyenEtkiler.length, 1, "sikayet zamanlandi");
  var b = state.bekleyenEtkiler[0];
  G.esit(b.tur, "sikayet");
  G.esit(b.etki.kasa, -Math.round(103500 * G.config.SIKAYET_CARPAN), "geri odeme = etki x 1,5");
  G.esit(b.etki.itibar, G.config.SIKAYET_ITIBAR, "itibar cezasi");
  G.dogru(b.gun >= 1 + G.config.SIKAYET_GECIKME_MIN && b.gun <= 1 + G.config.SIKAYET_GECIKME_MAKS, "gecikme araligi");
});

G.test("musteri gelme olasiligi: kusursuz arabada ilan fiyati algilanana esitse %35", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.kusurlar.length = 0;                       // kusur yuku 0: formulun tabanini olcuyoruz
  araba.ilanFiyati = G.araba.bilinenDeger(araba);
  state.stok.push(araba);
  var p = G.musteri.gelmeOlasiligi(state, araba);
  G.esit(Math.round(p * 1000) / 1000, 0.35, "itibar 50 -> carpan 1,0");
});

// Tohum ve kayit
G.test("ayni tohum ayni ilk 5 gunu verir", function () {
  function besGun(tohum) {
    var s = G.durum.yeniOyun(tohum);
    var kayit = [];
    for (var gun = 0; gun < 5; gun++) {
      for (var i = 0; i < s.ilanlar.length; i++) {
        var a = s.ilanlar[i];
        kayit.push(a.marka + a.model + a.yil + a.km + a.istenenFiyat + a.saticiTipi + a.kusurlar.length);
      }
      G.gun.gunuBitir(s);
      G.gun.raporKapat(s);
      G.gun.sizceSec(s, 0);
    }
    return kayit.join("|");
  }
  var a = besGun(777);
  var b = besGun(777);
  G.esit(a, b, "ayni tohum");
  G.dogru(a !== besGun(778), "farkli tohum farkli ilanlar vermeli");
  G.dogru(a.length > 50, "ilan uretilmis olmali");
});

G.test("kayit JSON'a cevrilebilir ve geri yuklenebilir", function () {
  var s = G.durum.yeniOyun(1234);
  G.gun.gunuBitir(s);
  G.gun.raporKapat(s);
  G.gun.sizceSec(s, 0);
  var metin = JSON.stringify({ rngDurum: G.rng.durumAl(), state: s });
  var geri = JSON.parse(metin);
  G.esit(geri.state.gun, s.gun, "gun");
  G.esit(JSON.stringify(geri.state), JSON.stringify(s), "state birebir");
});

G.test("localStorage kaydet/yukle (yoksa atlanir)", function () {
  var s = G.durum.yeniOyun(555);
  s.kasa = 1234560;
  if (!G.durum.kaydet()) return;      // file:// altinda depolama kapaliysa test atlanir
  var once = JSON.stringify(s);
  G.state = null;
  var yuklenen = G.durum.yukle();
  G.dogru(yuklenen !== null, "kayit okunmali");
  G.esit(JSON.stringify(yuklenen), once, "yuklenen state ayni");
  G.durum.kaydiSil();
});

// Gun dongusu
G.test("gunu bitirince sabit gider duser ve gun ilerler", function () {
  var s = G.durum.yeniOyun(99);
  var kasaOnce = s.kasa;
  G.gun.gunuBitir(s);
  G.esit(s.kasa, kasaOnce - G.config.SABIT_GIDER, "sabit gider");
  G.esit(s.faz, "aksam", "faz");
  G.gun.raporKapat(s);
  G.gun.sizceSec(s, 0);
  G.esit(s.gun, 2, "gun 2");
  G.esit(s.aksiyon, G.config.GUNLUK_AKSIYON, "aksiyon tazelenir");
  G.dogru(s.ilanlar.length >= G.config.GUNLUK_ILAN_MIN, "yeni ilanlar geldi");
});

G.test("kullanilmayan aksiyon yarina bekleme bonusu birakir", function () {
  var s = G.durum.yeniOyun(101);
  s.aksiyon = 2;
  G.gun.gunuBitir(s);
  G.esit(s.beklemeBonusu, 2 * G.config.BEKLEME_BONUSU, "bekleme bonusu");
});

G.test("kasa eksiye dusunce oyun biter", function () {
  var s = G.durum.yeniOyun(202);
  s.kasa = 1000;
  G.gun.gunuBitir(s);
  G.dogru(s.bitis !== null, "bitis olmali");
  G.esit(s.bitis.tur, "batti");
});

G.test("30. gunun sonunda oyun biter ve unvan verilir", function () {
  var s = G.durum.yeniOyun(303);
  s.gun = G.config.GUN_SAYISI;
  G.gun.gunuBitir(s);
  G.dogru(s.bitis !== null, "bitis olmali");
  G.esit(s.bitis.tur, "son");
  G.dogru(typeof s.bitis.unvan === "string", "unvan");
});

G.test("sikayet zamani gelince sabah karti olarak cikar", function () {
  var s = G.durum.yeniOyun(404);
  var kasaOnce = s.kasa;
  var itibarOnce = s.itibar;
  s.bekleyenEtkiler.push({ gun: 2, tur: "sikayet", araba: "Test Araba", etki: { kasa: -150000, itibar: -12 } });
  s.aktifKart = { id: "sakin" };              // 1. gunun karti etkisiz olsun
  G.olaylar.secenekSec(s, 0);
  G.gun.gunuBitir(s);
  G.gun.raporKapat(s);
  G.gun.sizceSec(s, 0);

  G.esit(s.aktifKart.id, "sikayet", "sabah karti sikayet olmali");
  G.esit(s.kasa, kasaOnce - G.config.SABIT_GIDER, "kart kapanmadan para cikmaz");
  G.esit(s.bekleyenEtkiler.length, 0, "kayit desteden alindi");

  G.olaylar.secenekSec(s, 0);                 // "Parayi geri ver"
  G.esit(s.kasa, kasaOnce - G.config.SABIT_GIDER - 150000, "geri odeme");
  G.esit(s.itibar, itibarOnce - 12, "itibar");
  G.esit(s.istatistik.sikayetGelen, 1, "istatistik");
  G.esit(s.faz, "mesai", "kart kapaninca mesai");
});

// Ilan uretimi
G.test("ilan uretimi makul deger ve satici tipi veriyor", function () {
  var s = G.durum.yeniOyun(606);
  for (var gun = 0; gun < 8; gun++) {
    for (var i = 0; i < s.ilanlar.length; i++) {
      var a = s.ilanlar[i];
      // Adim 17: katalogda 285.000 TL'lik Sahin de var, alt sinir ona gore
      G.dogru(a.piyasaDegeri > 180000, "piyasa degeri cok dusuk: " + a.piyasaDegeri);
      G.dogru(a.piyasaDegeri < 3500000, "piyasa degeri cok yuksek: " + a.piyasaDegeri);
      G.dogru(a.istenenFiyat % 10000 === 0, "istenen fiyat 10.000'e yuvarli olmali");
      G.dogru(["durust", "abartici", "dolandirici"].indexOf(a.saticiTipi) !== -1, "satici tipi");
      if (a.saticiTipi === "dolandirici") {
        var agir = false;
        for (var j = 0; j < a.kusurlar.length; j++) {
          if (a.kusurlar[j].tip === "sase" || a.kusurlar[j].tip === "agirHasar") agir = true;
        }
        G.dogru(agir, "dolandiricida agir gizli kusur olmali");
      }
      if (a.saticiTipi === "durust") {
        for (var k = 0; k < a.kusurlar.length; k++) {
          G.dogru(a.kusurlar[k].gorunurluk !== "gizli", "durust saticida gizli kusur olmaz");
        }
      }
    }
    G.gun.gunuBitir(s);
    G.gun.raporKapat(s);
    G.gun.sizceSec(s, 0);
  }
});

G.test("ekspertiz seviyeleri gizli kusuru farkli oranda buluyor", function () {
  var bulunanNormal = 0, bulunanPremium = 0, deneme = 300;
  G.rng.tohumla(7);
  for (var i = 0; i < deneme; i++) {
    var a1 = { kusurlar: [kusur("motor", "", 100000, "gizli")] };
    a1.kusurlar[0].ortayaCikti = false;
    if (G.ekspertiz.uygula(a1, "normal").length) bulunanNormal++;
    var a2 = { kusurlar: [kusur("motor", "", 100000, "gizli")] };
    a2.kusurlar[0].ortayaCikti = false;
    if (G.ekspertiz.uygula(a2, "premium").length) bulunanPremium++;
  }
  G.dogru(bulunanPremium > bulunanNormal, "premium daha cok bulmali");
  G.dogru(bulunanNormal > deneme * 0.3 && bulunanNormal < deneme * 0.7, "normal ~%50 olmali, cikan: " + bulunanNormal);
  G.dogru(bulunanPremium > deneme * 0.85, "premium ~%95 olmali, cikan: " + bulunanPremium);
});

G.test("goz kontrolu acik kusuru her zaman bulur, gizliyi hic bulmaz", function () {
  var araba = {
    gozBakildi: false,
    kusurlar: [kusur("lastik", "", 20000, "acik"), kusur("motor", "", 100000, "gizli")]
  };
  araba.kusurlar[0].ortayaCikti = false;
  araba.kusurlar[1].ortayaCikti = false;
  G.ekspertiz.gozKontrol(araba);
  G.esit(araba.kusurlar[0].ortayaCikti, true, "lastik gorunur");
  G.esit(araba.kusurlar[1].ortayaCikti, false, "motor gizli kalir");
});

// ---------- Adim 6: itibar ----------

G.test("itibar musteri gelme olasiligini gorunur sekilde degistirir", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.kusurlar.length = 0;                       // kusur yuku ayri testte olculuyor
  araba.ilanFiyati = G.araba.bilinenDeger(araba);
  state.ilanlar.length = 0;
  state.stok.push(araba);

  state.itibar = 20;
  var dusuk = G.musteri.gelmeOlasiligi(state, araba);
  state.itibar = 50;
  var orta = G.musteri.gelmeOlasiligi(state, araba);
  state.itibar = 90;
  var yuksek = G.musteri.gelmeOlasiligi(state, araba);

  G.dogru(dusuk < orta && orta < yuksek, "itibar arttikca sans artmali");
  G.esit(Math.round(dusuk * 1000) / 1000, 0.266, "itibar 20 -> carpan 0,76");
  G.esit(Math.round(yuksek * 1000) / 1000, 0.462, "itibar 90 -> carpan 1,32");
  G.dogru(orta - dusuk > 0.05, "fark gozle gorulur olmali");
});

G.test("itibar her 5 gunde bir 50'ye yaklasir", function () {
  var s = G.durum.yeniOyun(1111);
  s.gun = 5;
  s.itibar = 70;
  G.gun.gunuBitir(s);
  G.esit(s.itibar, 69, "yukaridan 50'ye dogru");
  G.esit(s.sonRapor.itibarKaymasi, -1, "raporda gorunur");

  var t = G.durum.yeniOyun(1112);
  t.gun = 10;
  t.itibar = 30;
  G.gun.gunuBitir(t);
  G.esit(t.itibar, 31, "asagidan 50'ye dogru");

  var u = G.durum.yeniOyun(1113);
  u.gun = 4;
  u.itibar = 70;
  G.gun.gunuBitir(u);
  G.esit(u.itibar, 70, "5'in kati olmayan gunde kayma yok");
});

G.test("itibar musteri butcesini config'e gore degistirir", function () {
  function tavanOlc(itibar) {
    var state = sahteState();
    var araba = bmwIlani(state);
    araba.alisFiyati = 1500000;
    araba.masraflar = 19500;
    araba.ilanFiyati = 1700000;
    state.ilanlar.length = 0;
    state.stok.push(araba);
    state.itibar = itibar;
    state.musteriler.push({
      id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw",
      sabir: 4, gelisGunu: 1, ekspertizYok: true
    });
    G.rng.tohumla(5150);                    // ayni zar, tek fark itibar
    return G.pazarlik.satisBaslat(state, "m1", "soyle", "drej").tavan;
  }
  var normal = tavanOlc(50);
  var iyi = tavanOlc(80);
  var kotu = tavanOlc(20);
  G.dogru(iyi > normal, "itibar 80 butceyi artirmali");
  G.dogru(kotu < normal, "itibar 20 butceyi dusurmeli");
});

G.test("sahte ilan donemi her gun itibari yiyor", function () {
  var s = G.durum.yeniOyun(1212);
  s.bayraklar.sahteIlanGun = 2;
  var once = s.itibar;
  G.gun.gunuBitir(s);
  G.gun.raporKapat(s);
  G.gun.sizceSec(s, 0);
  G.esit(s.itibar, once + G.config.SAHTE_ILAN_ITIBAR, "ilk gun");
  G.esit(s.bayraklar.sahteIlanGun, 1, "sayac dustu");
  G.gun.gunuBitir(s);
  G.gun.raporKapat(s);
  G.gun.sizceSec(s, 0);
  G.esit(s.bayraklar.sahteIlanGun, 0, "donem bitti");
});

G.test("itibar sifirlanirsa oyun biter", function () {
  var s = G.durum.yeniOyun(1313);
  s.itibar = 8;
  G.durum.itibarDegis(s, -8);
  G.esit(s.itibar, 0, "itibar tabana vurdu");
  G.gun.gunuBitir(s);
  G.dogru(s.bitis !== null, "oyun bitmeli");
  G.esit(s.bitis.tur, "itibarsiz");
});

// ---------- Adim 7: karakterler ----------

G.test("Nuri'nin Agzi tabani %3 indirir", function () {
  var state = sahteState();
  bmwIlani(state);
  var eski = G.config.NURI_SINIR_OLASILIK;
  G.config.NURI_SINIR_OLASILIK = 0;
  try {
    var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
    var tabanOnce = p.taban;
    G.pazarlik.yetenekKullan(state);
    G.esit(Math.round(p.taban), Math.round(tabanOnce * 0.97), "taban -%3");
    G.esit(p.yetenekKullanildi, true, "yetenek isaretlendi");
    G.dogru(G.pazarlik.yetenekKullan(state).hata !== undefined, "ikinci kullanim olmaz");
  } finally {
    G.config.NURI_SINIR_OLASILIK = eski;
  }
});

G.test("Nuri sinirlenince masa dagilir ve ertesi gun yok", function () {
  var state = sahteState();
  bmwIlani(state);
  var eski = G.config.NURI_SINIR_OLASILIK;
  G.config.NURI_SINIR_OLASILIK = 1;
  try {
    state.gun = 3;                       // ilk iki gun Nuri sakin (karar #19)
    var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
    G.pazarlik.yetenekKullan(state);
    G.esit(p.bitti, true, "masa dagilmali");
    G.esit(p.sonuc, "kalkis", "satici kalkti");
    G.esit(state.bayraklar.nuriYokGun, state.gun + 1, "yarin yok");
    G.esit(state.istatistik.nuriSinirlendi, 1, "istatistik");
    state.gun = state.gun + 1;
    G.esit(G.karakterler.nuriYokMu(state), true, "ertesi gun kullanilamaz");
    var adlar = G.karakterler.alistaKonusanlar(state).map(function (k) { return k.anahtar; });
    G.esit(adlar.indexOf("nuri"), -1, "konusan listesinde olmamali");
    state.gun = state.gun + 1;
    G.esit(G.karakterler.nuriYokMu(state), false, "bir gun sonra doner");
  } finally {
    G.config.NURI_SINIR_OLASILIK = eski;
  }
});

G.test("hakaret turundan sonra Nuri daha cabuk parlar", function () {
  var state = sahteState();
  state.gun = 3;                          // ilk iki gun sakin kurali disinda
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), G.config.NURI_SINIR_OLASILIK, "once %20");
  G.pazarlik.alisTeklif(state, 1000000);     // ilk teklif: muaf
  G.pazarlik.alisTeklif(state, 1000000);     // ikinci teklif: hakaret
  G.esit(p.hakaretOldu, true, "hakaret isaretlendi");
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), G.config.NURI_SINIR_OLASILIK_KIZGIN, "sonra %40");
  state.bayraklar.nuriSakin = 3;
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), 0, "ablanin yemeginden sonra sinirlenmez");
});

G.test("Drej'in Hesap araligi dogru tabani kapsiyor", function () {
  for (var deneme = 0; deneme < 25; deneme++) {
    var state = sahteState();
    G.rng.tohumla(900 + deneme);
    var araba = G.araba.ilanUret(state, "ilan");
    state.ilanlar.push(araba);
    G.ekspertiz.uygula(araba, "normal");
    var p = G.pazarlik.alisBaslat(state, araba.id, "drej");
    G.pazarlik.yetenekKullan(state);
    G.dogru(p.hesapAraligi !== null, "aralik verilmeli");
    G.dogru(p.hesapAraligi.alt <= p.taban && p.taban <= p.hesapAraligi.ust,
      "taban aralikta olmali: " + Math.round(p.taban) + " / " + p.hesapAraligi.alt + "-" + p.hesapAraligi.ust);
    // Aralik tabanin +-%4'u; 10.000'e yuvarlandigi icin ucuz arabada orani buyur.
    // O yuzden orana degil, yuvarlama adimi payiyla mutlak genislige bakiyoruz.
    var genislik = p.hesapAraligi.ust - p.hesapAraligi.alt;
    var pers = G.config.PERSONALAR[araba.persona];
    var carpan = (pers && pers.hesapCarpani) || 1;      // Faz 3: aralik personaya gore degisir
    var beklenen = 2 * G.config.HESAP_ARALIK * carpan * p.taban;
    G.dogru(Math.abs(genislik - beklenen) <= G.config.YUVARLAMA,
      "aralik ~%8 genis olmali: beklenen " + Math.round(beklenen) + ", cikan " + genislik);
  }
});

G.test("satista Nuri tavani %3 artirir, Drej tavani soyler", function () {
  function kur() {
    var state = sahteState();
    var araba = bmwIlani(state);
    araba.alisFiyati = 1500000;
    araba.masraflar = 19500;
    araba.ilanFiyati = 1700000;
    state.ilanlar.length = 0;
    state.stok.push(araba);
    state.musteriler.push({
      id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw",
      sabir: 4, gelisGunu: 1, ekspertizYok: true
    });
    return state;
  }
  var eski = G.config.NURI_SINIR_OLASILIK;
  G.config.NURI_SINIR_OLASILIK = 0;
  try {
    var s1 = kur();
    var p1 = G.pazarlik.satisBaslat(s1, "m1", "soyle", "nuri");
    var tavanOnce = p1.tavan;
    G.pazarlik.yetenekKullan(s1);
    G.esit(p1.tavan, G.yuvarla(tavanOnce * 1.03), "tavan +%3");

    var s2 = kur();
    var p2 = G.pazarlik.satisBaslat(s2, "m1", "soyle", "drej");
    G.pazarlik.yetenekKullan(s2);
    G.dogru(p2.hesapAraligi.alt <= p2.tavan && p2.tavan <= p2.hesapAraligi.ust, "tavan aralikta");
  } finally {
    G.config.NURI_SINIR_OLASILIK = eski;
  }
});

G.test("satis pasifleri sabri degistiriyor", function () {
  function sabirOlc(konusan) {
    var state = sahteState();
    var araba = bmwIlani(state);
    araba.alisFiyati = 1500000; araba.masraflar = 19500; araba.ilanFiyati = 1700000;
    state.ilanlar.length = 0;
    state.stok.push(araba);
    state.musteriler.push({
      id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw",
      sabir: 4, gelisGunu: 1, ekspertizYok: true
    });
    return G.pazarlik.satisBaslat(state, "m1", "soyle", konusan).sabir;
  }
  G.esit(sabirOlc("nuri"), 5, "Nuri +1");
  G.esit(sabirOlc("drej"), 3, "Drej -1");
  G.esit(sabirOlc("kro"), 5, "Kro +1");
});

G.test("Kro gorusmeye girerse kusurlar zorunlu soylenir", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.alisFiyati = 1500000;
  araba.masraflar = 19500;
  araba.ilanFiyati = 1700000;
  state.ilanlar.length = 0;
  state.stok.push(araba);
  state.musteriler.push({
    id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw",
    sabir: 4, gelisGunu: 1, ekspertizYok: true
  });
  var p = G.pazarlik.satisBaslat(state, "m1", "sakla", "kro");
  G.esit(p.durustluk, "soyle", "Kro saklamaz");
  G.esit(G.pazarlik.saklananKusurlar(araba).length, 0, "saklanan kusur kalmamali");
  G.dogru(G.pazarlik.yetenekKullan(state).hata !== undefined, "Kro'nun yetenegi yok");
});

G.test("Kro sabah ilan getiriyor, firsat ilani piyasanin altinda", function () {
  var eski = G.config.KRO_SABAH_OLASILIK;
  G.config.KRO_SABAH_OLASILIK = 1;
  try {
    var firsat = 0, dolandirici = 0;
    for (var i = 0; i < 40; i++) {
      var s = G.durum.yeniOyun(3000 + i);
      var kroIlanlari = s.ilanlar.filter(function (a) { return a.kaynak === "kro"; });
      G.esit(kroIlanlari.length, 1, "her sabah bir Kro ilani");
      var a = kroIlanlari[0];
      if (a.saticiTipi === "durust") {
        firsat++;
        var oran = a.istenenFiyat / a.piyasaDegeri;
        G.dogru(oran >= 0.89 && oran <= 0.96, "firsat fiyati piyasa x 0,90-0,95 olmali: " + oran);
      } else {
        dolandirici++;
        G.esit(a.saticiTipi, "dolandirici", "firsat degilse dolandirici");
      }
      G.esit(s.istatistik.kroIlani, 1, "istatistik");
    }
    G.dogru(firsat > 0 && dolandirici > 0, "iki tur de cikmali (firsat " + firsat + ", dolandirici " + dolandirici + ")");
  } finally {
    G.config.KRO_SABAH_OLASILIK = eski;
  }
});

G.test("Kro'nun ilaninda bir gizli kusur normale iner", function () {
  var eski = G.config.KRO_SABAH_OLASILIK;
  G.config.KRO_SABAH_OLASILIK = 1;
  try {
    var kontrolEdildi = 0;
    for (var i = 0; i < 40 && kontrolEdildi < 5; i++) {
      var s = G.durum.yeniOyun(4000 + i);
      var a = s.ilanlar.filter(function (x) { return x.kaynak === "kro"; })[0];
      var kroGordu = a.kusurlar.filter(function (k) { return k.kroGordu; });
      if (kroGordu.length) {
        G.esit(kroGordu.length, 1, "en fazla bir kusurun gorunurlugu iner");
        G.esit(kroGordu[0].gorunurluk, "normal", "gizliden normale");
        kontrolEdildi++;
      }
    }
    G.dogru(kontrolEdildi > 0, "gizli kusurlu Kro ilani hic cikmadi");
  } finally {
    G.config.KRO_SABAH_OLASILIK = eski;
  }
});

// ---------- Adim 8: olay kartlari ----------

function kartiOynat(state, kartId, sira) {
  state.aktifKart = { id: kartId };
  return G.olaylar.secenekSec(state, sira || 0);
}

function sansZorla(deger, fn) {
  var eski = G.rng.sans;
  G.rng.sans = function () { return deger; };
  try { fn(); } finally { G.rng.sans = eski; }
}

G.test("deste butunlugu: her kartin alanlari tam", function () {
  var idler = [];
  for (var i = 0; i < G.data.kartlar.length; i++) {
    var k = G.data.kartlar[i];
    G.dogru(!!k.id, "id yok");
    G.dogru(idler.indexOf(k.id) === -1, "tekrar eden id: " + k.id);
    idler.push(k.id);
    G.dogru(!!k.kategori, k.id + ": kategori yok");
    G.dogru(!!k.baslik, k.id + ": baslik yok");
    G.dogru(!!k.metin && k.metin.length > 20, k.id + ": metin kisa");
    G.dogru(k.secenekler && k.secenekler.length >= 1, k.id + ": secenek yok");
    for (var j = 0; j < k.secenekler.length; j++) {
      G.dogru(!!k.secenekler[j].etiket, k.id + ": secenek etiketi yok");
      G.dogru(k.secenekler[j].etki !== undefined, k.id + ": secenek etkisi tanimsiz");
    }
    G.dogru(!!k.sizceSorusu, k.id + ": sizce sorusu yok");          // Adim 9 icin hazir
    G.esit(k.sizceSecenekleri.length, 2, k.id + ": sizce secenegi 2 olmali");
    if (!k.gizli) G.dogru(k.agirlik > 0, k.id + ": agirlik yok");
    if (k.kosul) G.esit(typeof k.kosul, "function", k.id + ": kosul fonksiyon olmali");
  }
  // tasarim/06: 12 kart + sakin gun; Adim 19 Riza konsinyesi, sonra hiz cezasi
  G.esit(G.data.kartlar.length, 15, "14 kart + sakin gun");
  G.dogru(idler.indexOf("sikayet") !== -1, "sikayet karti olmali");
  G.esit(G.olaylar.kartBul("sikayet").gizli, true, "sikayet gizli olmali");
});

G.test("Kro kartlarinin agirlik payi %35'i gecmiyor", function () {
  var toplam = 0, kro = 0;
  for (var i = 0; i < G.data.kartlar.length; i++) {
    var k = G.data.kartlar[i];
    if (k.gizli) continue;
    toplam += k.agirlik;
    if (k.kategori === "KRO") kro += k.agirlik;
  }
  G.dogru(kro / toplam <= 0.35, "Kro payi: " + Math.round(100 * kro / toplam) + "%");
  G.dogru(kro > 0, "Kro karti olmali");
  G.esit(G.olaylar.kartBul("sakin").agirlik, G.config.SAKIN_GUN_AGIRLIK, "sakin gun agirligi config'ten");
});

G.test("ayni kart art arda iki gun cikmiyor, gizli kart cekilmiyor", function () {
  var s = G.durum.yeniOyun(7070);
  var sira = [];
  for (var gun = 0; gun < 30 && !s.bitis; gun++) {
    G.dogru(s.aktifKart !== null, gun + ". gun karti yok");
    G.dogru(G.olaylar.kartBul(s.aktifKart.id).gizli !== true || s.aktifKart.ekEtki,
      "gizli kart desteden cikti");
    sira.push(s.aktifKart.id);
    G.olaylar.secenekSec(s, 0);
    G.esit(s.faz, "mesai", "kart kapaninca mesai fazi");
    G.gun.gunuBitir(s);
    G.gun.raporKapat(s);
    G.gun.sizceSec(s, 0);
  }
  for (var i = 1; i < sira.length; i++) {
    G.dogru(sira[i] !== sira[i - 1], i + ". gun ayni kart tekrar cikti: " + sira[i]);
  }
  var tekil = sira.filter(function (id, i) { return sira.indexOf(id) === i; });
  G.dogru(tekil.length >= 5, "30 gunde en az 5 farkli kart cikmali, cikan: " + tekil.length);
});

G.test("stok bossa stok isteyen kartlar cikmiyor", function () {
  var s = G.durum.yeniOyun(8080);
  s.stok = [];
  for (var i = 0; i < 200; i++) {
    var kart = G.olaylar.kartCek(s);
    G.dogru(["kro_gezinti", "sahte_ilan", "kro_emanet"].indexOf(kart.id) === -1,
      "kosullu kart stok bosken cikti: " + kart.id);
  }
});

G.test("tekrarYok karti ikinci kez cikmiyor", function () {
  var s = G.durum.yeniOyun(9090);
  s.cikanKartlar = ["abla"];
  for (var i = 0; i < 200; i++) {
    G.dogru(G.olaylar.kartCek(s).id !== "abla", "abla karti ikinci kez cikti");
  }
});

G.test("etki motoru veriyi uyguluyor", function () {
  var s = G.durum.yeniOyun(1010);
  var kasaOnce = s.kasa;
  G.olaylar.etkiUygula(s, { kasa: -10000, itibar: 3, not: "test notu" });
  G.esit(s.kasa, kasaOnce - 10000, "kasa");
  G.esit(s.itibar, 53, "itibar");
  G.dogru(s.gunNotlari.indexOf("test notu") !== -1, "not gun notlarina yazildi");

  G.olaylar.etkiUygula(s, { bayrak: "bedavaEkspertiz" });
  G.esit(s.bayraklar.bedavaEkspertiz, true, "bayrak");

  G.olaylar.etkiUygula(s, { sayac: { ad: "nuriSakin", deger: 3 } });
  G.esit(s.bayraklar.nuriSakin, 3, "sayac");

  G.olaylar.etkiUygula(s, { kroYok: true });
  G.esit(s.bayraklar.kroYokGun, s.gun + 1, "Kro yarin yok");

  G.olaylar.etkiUygula(s, { gecikme: { gun: 5, etki: { kasa: -40000 } } });
  G.esit(s.bekleyenEtkiler.length, 1, "gecikmeli etki yazildi");
  G.esit(s.bekleyenEtkiler[0].gun, s.gun + 5, "gecikme gunu");

  G.olaylar.etkiUygula(s, { aksamda: { not: "aksam notu" } });
  G.esit(s.aksamEtkileri.length, 1, "aksam etkisi yazildi");

  sansZorla(true, function () {
    var kasa2 = s.kasa;
    G.olaylar.etkiUygula(s, { sans: 0.5, evet: { kasa: 1000 }, hayir: { kasa: -1000 } });
    G.esit(s.kasa, kasa2 + 1000, "sans tuttu");
  });
  sansZorla(false, function () {
    var kasa3 = s.kasa;
    G.olaylar.etkiUygula(s, { sans: 0.5, evet: { kasa: 1000 }, hayir: { kasa: -1000 } });
    G.esit(s.kasa, kasa3 - 1000, "sans tutmadi");
  });
});

G.test("gecikmeli etki zamani gelince sabah cozulur", function () {
  var s = G.durum.yeniOyun(1011);
  var kasaOnce = s.kasa;
  s.bekleyenEtkiler.push({ gun: 2, tur: "olay", sans: 0.5, etki: { kasa: -40000, not: "mahkeme" }, bosNot: "mahkeme dustu" });
  s.aktifKart = { id: "sakin" };                 // gunun karti etkisiz olsun
  G.olaylar.secenekSec(s, 0);
  sansZorla(true, function () {
    G.gun.gunuBitir(s);
    G.gun.raporKapat(s);
    G.gun.sizceSec(s, 0);
  });
  G.esit(s.kasa, kasaOnce - G.config.SABIT_GIDER - 40000, "etki uygulandi");
  G.esit(s.bekleyenEtkiler.length, 0, "liste bosaldi");
});

G.test("Cuma karti bereketi sonraki alis pazarligina tasiyor", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  kartiOynat(state, "cuma", 0);                    // Sadaka ver
  G.esit(state.bayraklar.bereket, true, "bereket bayragi");
  G.esit(state.itibar, 52, "itibar +2");

  var tabanNormal;
  var state2 = sahteState();
  bmwIlani(state2);
  tabanNormal = G.pazarlik.alisBaslat(state2, "bmw", "nuri").taban;

  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.esit(Math.round(p.taban), Math.round(tabanNormal * (1 - G.config.BEREKET_INDIRIM)), "taban -%2");
  G.esit(state.bayraklar.bereket, false, "bayrak tukendi");
});

G.test("Mali musavir karti sonraki satista vergiyi %15 yapiyor", function () {
  function satisYap(vergiIndirimi) {
    var state = sahteState();
    var araba = bmwIlani(state);
    araba.alisFiyati = 1000000;
    araba.masraflar = 19500;
    araba.ilanFiyati = 1150000;
    state.ilanlar.length = 0;
    state.stok.push(araba);
    state.bayraklar.vergiIndirimi = vergiIndirimi;
    state.musteriler.push({ id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw", sabir: 4, gelisGunu: 1, ekspertizYok: true });
    state.aktifPazarlik = {
      tur: "satis", arabaId: "bmw", musteriId: "m1", durustluk: "soyle",
      tavan: 1200000, karsi: 1000000, sabir: 4, tavizKullanildi: false,
      teklif: 1150000, gecmis: [], bitti: false, sonuc: null, bulunanKusurlar: []
    };
    var p = G.pazarlik.satisTeklif(state, 1150000);
    return { vergi: p.vergi, bayrak: state.bayraklar.vergiIndirimi };
  }
  var kar = 1150000 - 1000000 - 19500;
  G.esit(satisYap(false).vergi, Math.round(kar * 0.20), "normal vergi");
  var indirimli = satisYap(true);
  G.esit(indirimli.vergi, Math.round(kar * 0.15), "indirimli vergi");
  G.esit(indirimli.bayrak, false, "bayrak tukendi");
});

G.test("Abla karti Nuri'yi 3 gun sakinlestiriyor", function () {
  var state = sahteState();
  bmwIlani(state);
  kartiOynat(state, "abla", 0);
  G.esit(state.bayraklar.nuriSakin, 3, "3 gun");
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), 0, "sinirlenme ihtimali sifir");
});

G.test("Riza'nin arabasi listeye sabir 5 ile giriyor", function () {
  var state = sahteState();
  kartiOynat(state, "riza_araba", 0);
  G.esit(state.ilanlar.length, 1, "ilan geldi");
  var ilan = state.ilanlar[0];
  G.esit(ilan.riza, true, "Riza etiketi");
  G.esit(ilan.saticiTipi, "abartici", "abartici satici");
  G.esit(ilan.sabirZorla, G.config.RIZA_SABIR, "zorunlu sabir");
  var p = G.pazarlik.alisBaslat(state, ilan.id, "drej");
  G.esit(p.sabir, G.config.RIZA_SABIR - 1, "sabir 5 + Drej pasifi");
});

G.test("Kro'nun tuttugu teklif pazarliksiz ilan getiriyor ve alinabiliyor", function () {
  var state = sahteState();
  sansZorla(true, function () {
    kartiOynat(state, "kro_teklif", 0);
  });
  G.esit(state.ilanlar.length, 1, "ilan geldi");
  var ilan = state.ilanlar[0];
  G.esit(ilan.pazarliksiz, true, "pazarliksiz");
  G.esit(ilan.istenenFiyat, G.yuvarla(ilan.piyasaDegeri * G.config.UCUZ_ILAN_ORAN), "piyasa x 0,80");
  G.dogru(G.pazarlik.alisBaslat(state, ilan.id, "nuri") !== null, "pazarlik acilabilir ama");

  var kasaOnce = state.kasa;
  var p = G.pazarlik.dogrudanAl(state, ilan.id);
  G.esit(p.sonuc, "kabul", "dogrudan alindi");
  G.esit(p.anlasmaFiyati, ilan.istenenFiyat, "sabit fiyat");
  G.esit(state.kasa, kasaOnce - ilan.istenenFiyat - G.config.NOTER_PLAKA, "kasa");
  G.esit(state.stok.length, 1, "stoga girdi");
});

G.test("Dukkan Kro'ya emanet: aksiyon eksilir, aksam cozulur", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.alisFiyati = 1000000;
  araba.masraflar = 19500;
  araba.ilanFiyati = 1700000;
  state.ilanlar.length = 0;
  state.stok.push(araba);
  state.aksiyon = 3;
  state.sonRapor = null;

  kartiOynat(state, "kro_emanet", 0);
  G.esit(state.aksiyon, 2, "bugun bir aksiyon eksik");
  G.esit(state.aksamEtkileri.length, 1, "aksam etkisi bekliyor");

  var kasaOnce = state.kasa;
  sansZorla(true, function () { G.gun.gunuBitir(state); });
  G.esit(state.stok.length, 0, "Kro arabayi satmis");
  G.dogru(state.kasa > kasaOnce, "kasaya pere girdi");
  G.esit(state.aksamEtkileri.length, 0, "aksam etkisi tukendi");
});

G.test("Kro'nun gezintisini ortmek titiz musteride itibara dokunuyor", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.alisFiyati = 1000000;
  araba.masraflar = 19500;
  araba.ilanFiyati = 1700000;
  state.ilanlar.length = 0;
  state.stok.push(araba);
  var kmOnce = araba.km;

  kartiOynat(state, "kro_gezinti", 1);            // Ustunu ort
  G.esit(araba.km, kmOnce + 30, "temel etki: +30 km");
  G.esit(state.bayraklar.ortulenKm, true, "bayrak");

  state.musteriler.push({ id: "m1", isim: "Titiz", tip: "titiz", arabaId: "bmw", sabir: 3, gelisGunu: 1, ekspertizYok: true });
  var itibarOnce = state.itibar;
  sansZorla(true, function () {
    G.pazarlik.satisBaslat(state, "m1", "soyle", "drej");
  });
  G.esit(state.itibar, itibarOnce + G.config.ORTULEN_KM_ITIBAR, "titiz musteri fark etti");
  G.esit(state.bayraklar.ortulenKm, false, "bayrak tukendi");
});

G.test("Sahte ilan karti donemi baslatiyor", function () {
  var state = sahteState();
  bmwIlani(state);
  state.stok.push(state.ilanlar[0]);
  kartiOynat(state, "sahte_ilan", 0);             // Polise git
  G.esit(state.bayraklar.sahteIlanGun, 3, "3 gun surer");
});

G.test("yeni oyun prolog sahnesiyle basliyor", function () {
  var s = G.durum.yeniOyun(1414);
  G.esit(s.faz, "sabah", "faz");
  G.esit(s.ekran, "hikaye", "ilk ekran hikaye sahnesi");
  G.esit(s.aktifHikaye.id, "prolog", "prolog oynuyor");
  G.dogru(s.aktifKart !== null, "kart arkada hazir");
  // prolog bitince gunun karti gelir
  var guvenlik = 0;
  while (G.diyalog.acikMi(s) && guvenlik++ < 20) G.diyalog.ilerle(s);
  G.hikaye.bitir(s);
  G.esit(s.ekran, "olay", "ekran");
  G.esit(s.aksiyon, G.config.GUNLUK_AKSIYON, "aksiyon tam");
  G.olaylar.secenekSec(s, 0);
  G.esit(s.faz, "mesai", "kart kapandi");
  G.esit(s.ekran, "dukkan", "dukkana donuldu");
  G.esit(s.aktifKart, null, "kart temizlendi");
});

G.test("karta bakmadan gun bitirilirse etkisi islemez", function () {
  var s = G.durum.yeniOyun(1515);
  s.aktifKart = { id: "cuma" };
  var kasaOnce = s.kasa;
  G.gun.gunuBitir(s);
  G.esit(s.aktifKart, null, "kart dustu");
  G.esit(s.kasa, kasaOnce - G.config.SABIT_GIDER, "sadece sabit gider");
  G.dogru(s.sonRapor.notlar.join(" ").indexOf("bakılmadı") !== -1, "rapora not dusuldu");
});

// ---------- Adim 9: aksam raporu ve "Sizce?" ----------

function sansYakala(fn, sonuc) {
  var kayit = [];
  var eski = G.rng.sans;
  G.rng.sans = function (p) { kayit.push(p); return !!sonuc; };
  try { fn(); } finally { G.rng.sans = eski; }
  return kayit;
}

G.test("faz zinciri sabah -> mesai -> aksam -> sizce -> sabah", function () {
  var s = G.durum.yeniOyun(2101);
  G.esit(s.faz, "sabah", "gun basi");
  G.olaylar.secenekSec(s, 0);
  G.esit(s.faz, "mesai", "kart kapandi");
  G.gun.gunuBitir(s);
  G.esit(s.faz, "aksam", "rapor");
  G.esit(s.ekran, "rapor", "rapor ekrani");
  G.gun.raporKapat(s);
  G.esit(s.faz, "sizce", "sizce fazi");
  G.esit(s.ekran, "sizce", "sizce ekrani");
  G.esit(s.gun, 1, "sizce henuz gunu ilerletmez");
  G.gun.sizceSec(s, 0);
  G.esit(s.gun, 2, "gun ilerledi");
  G.esit(s.faz, "sabah", "yeni gunun sabahi");
  G.esit(s.ekran, "olay", "olay karti");
});

// tasarim/09 Adim 9 "Bitti" olcutu
G.test("Sizce sorusu ertesi gunun kartiyla tutarli", function () {
  var s = G.durum.yeniOyun(2102);
  for (var gun = 0; gun < 8; gun++) {
    G.olaylar.secenekSec(s, 0);
    G.gun.gunuBitir(s);
    G.gun.raporKapat(s);
    G.dogru(s.yarinkiKart !== null, "yarinki kart cekilmeli");
    var beklenen = s.yarinkiKart;
    var kart = G.olaylar.kartBul(beklenen);
    G.dogru(!!kart.sizceSorusu, "sorusu olmali");
    G.gun.sizceSec(s, gun % 2);
    G.esit(s.aktifKart.id, beklenen, "sabah karti dun aksam cekilen kart olmali");
    G.esit(s.yarinkiKart, null, "yarinki kart tuketildi");
  }
});

G.test("Sizce secimi ertesi sabah hatirlatma olarak duruyor", function () {
  var s = G.durum.yeniOyun(2103);
  G.olaylar.secenekSec(s, 0);
  G.gun.gunuBitir(s);
  G.gun.raporKapat(s);
  var kartId = s.yarinkiKart;
  var secenek = G.olaylar.kartBul(kartId).sizceSecenekleri[1];
  G.gun.sizceSec(s, 1);
  G.esit(s.sizceSecimi.kartId, kartId, "secim karta bagli");
  G.esit(s.sizceSecimi.etiket, secenek.etiket, "secilen etiket");
  G.esit(s.sizceSecimi.hatirlatma, secenek.hatirlatma, "hatirlatma metni");
  G.esit(s.istatistik.sizceSecimi, 1, "istatistik");
});

G.test("30. gunun aksaminda Sizce sorulmaz", function () {
  var s = G.durum.yeniOyun(2104);
  s.gun = G.config.GUN_SAYISI;
  G.olaylar.secenekSec(s, 0);
  G.gun.gunuBitir(s);
  G.dogru(s.bitis !== null, "oyun bitmeli");
  G.gun.raporKapat(s);
  G.esit(s.ekran, "bitti", "dogrudan sonuc ekrani");
  G.esit(s.yarinkiKart, null, "yarinki kart cekilmemeli");
  G.dogru(G.gun.sizceSec(s, 0).hata !== undefined, "sizce fazi degil");
});

G.test("Sizce secimi olasiligi +-%20 kaydiriyor", function () {
  // Mali musavir karti: sans 0,5 ve evet dali iyi olan dal
  var s = G.durum.yeniOyun(2105);
  s.yarinkiKart = "musavir";
  G.olaylar.sizceUygula(s, 0);                       // "Görür" -> kaydirma +1
  G.esit(s.sizceKaydirma, G.config.SIZCE_KAYDIRMA, "kaydirma kuruldu");
  s.aktifKart = { id: "musavir" };
  var kayit = sansYakala(function () { G.olaylar.secenekSec(s, 0); }, false);
  G.esit(kayit[0], 0.7, "0,5 + 0,20");
  G.esit(s.sizceKaydirma, 0, "kaydirma tukendi");

  var t = G.durum.yeniOyun(2106);
  t.yarinkiKart = "musavir";
  G.olaylar.sizceUygula(t, 1);                       // "Kâğıt üstünde kalır" -> kaydirma -1
  t.aktifKart = { id: "musavir" };
  var kayit2 = sansYakala(function () { G.olaylar.secenekSec(t, 0); }, false);
  G.esit(Math.round(kayit2[0] * 100) / 100, 0.3, "0,5 - 0,20");
});

G.test("olasiliksiz kartin Sizce secimi kaydirma yapmaz", function () {
  var s = G.durum.yeniOyun(2107);
  s.yarinkiKart = "sakin";
  G.olaylar.sizceUygula(s, 0);
  G.esit(s.sizceKaydirma, 0, "saka sorusu etkisiz");
  G.dogru(!!s.sizceSecimi.hatirlatma, "ama hatirlatmasi var");
});

G.test("kaydirma gecikmeli ve aksam etkilerine isliyor", function () {
  var s = G.durum.yeniOyun(2108);
  var araba = G.araba.ilanUret(s, "ilan");
  araba.alisFiyati = 1000000; araba.masraflar = 12000; araba.ilanFiyati = 1200000;
  s.stok.push(araba);
  s.yarinkiKart = "kro_emanet";
  G.olaylar.sizceUygula(s, 0);                       // "Kro'ya güven" -> +1
  s.aktifKart = { id: "kro_emanet" };
  G.olaylar.secenekSec(s, 0);
  G.esit(s.aksamEtkileri.length, 1, "aksam etkisi yazildi");
  G.esit(s.aksamEtkileri[0].etki.sans, 0.7, "aksam zarina kaydirma islendi");

  var t = G.durum.yeniOyun(2109);
  t.yarinkiKart = "kro_kavga";
  G.olaylar.sizceUygula(t, 0);                       // "Bizi" -> kaydirma -1 (odeme olasiligi duser)
  t.aktifKart = { id: "kro_kavga" };
  G.olaylar.secenekSec(t, 1);                        // "Mahkemeye kalsin"
  G.esit(t.bekleyenEtkiler.length, 1, "gecikmeli etki yazildi");
  G.esit(Math.round(t.bekleyenEtkiler[0].sans * 100) / 100, 0.3, "gecikmeli zara kaydirma islendi");
});

G.test("kaydirma tek atista tukeniyor", function () {
  var s = G.durum.yeniOyun(2110);
  s.sizceKaydirma = 0.2;
  var kayit = sansYakala(function () {
    G.olaylar.etkiUygula(s, { sans: 0.5, evet: {}, hayir: {} });
    G.olaylar.etkiUygula(s, { sans: 0.5, evet: {}, hayir: {} });
  }, false);
  G.esit(kayit[0], 0.7, "ilk atis kaydirildi");
  G.esit(kayit[1], 0.5, "ikinci atis normal");
});

G.test("yarin sikayet varsa Sizce sorusu sikayet kartinin olur", function () {
  var s = G.durum.yeniOyun(2111);
  G.olaylar.secenekSec(s, 0);
  s.bekleyenEtkiler.push({ gun: s.gun + 1, tur: "sikayet", araba: "Test Erebe", etki: { kasa: -90000, itibar: -12 } });
  G.gun.gunuBitir(s);
  G.gun.raporKapat(s);
  G.esit(s.yarinkiKart, "sikayet", "zamanlanmis kart cekilen kartin yerine gecer");
  G.esit(G.olaylar.kartBul("sikayet").sizceSorusu.indexOf("ses çıkar") !== -1, true, "tehditkar ama belirsiz soru");
  var kasaOnce = s.kasa;
  G.gun.sizceSec(s, 0);
  G.esit(s.aktifKart.id, "sikayet", "sabah sikayet karti");
  G.dogru(s.aktifKart.ekMetin.indexOf("Test Erebe") !== -1, "hangi araba oldugu yazili");
  G.esit(s.kasa, kasaOnce, "para kart kapanmadan cikmaz");
  G.olaylar.secenekSec(s, 0);
  G.esit(s.kasa, kasaOnce - 90000, "geri odeme");
});

G.test("akşam kapaginin tek kelimelik ozeti duruma uyuyor", function () {
  function ozet(hazirla) {
    var s = G.durum.yeniOyun(2112);
    G.olaylar.secenekSec(s, 0);
    hazirla(s);
    G.gun.gunuBitir(s);
    return s.sonRapor.ozet;
  }
  G.esit(ozet(function () {}), "SESSİZ", "hicbir sey olmadiysa");
  G.esit(ozet(function (s) { s.gunNotlari.push("Fazla verdik ortak. BMW icin."); }), "KAZIK", "fazla verdik");
  G.esit(ozet(function (s) { s.gunNotlari.push("Şikâyet geldi: BMW"); }), "ŞİKÂYET", "sikayet");
  G.esit(ozet(function (s) { s.gunNotlari.push("BMW: müşteri boya yakaladı, itibar düştü."); }), "YAKALANDIK", "yakalandik");
  G.esit(ozet(function (s) {
    s.defter.push({ gun: s.gun, tur: "satis", araba: "BMW", fiyat: 1500000, masraf: 0, kar: 120000 });
  }), "BEREKET", "iyi kar");
  G.esit(ozet(function (s) {
    s.defter.push({ gun: s.gun, tur: "satis", araba: "BMW", fiyat: 1000000, masraf: 0, kar: 10000 });
  }), "SATTIK", "kucuk kar");
  G.esit(ozet(function (s) {
    s.defter.push({ gun: s.gun, tur: "alis", araba: "BMW", fiyat: 1000000, masraf: 12000 });
  }), "ALDIK", "alis");
  G.esit(ozet(function (s) {
    s.defter.push({ gun: s.gun, tur: "satis", araba: "BMW", fiyat: 900000, masraf: 0, kar: -60000 });
  }), "EKSİDEYİZ", "zarar");
  G.esit(ozet(function (s) { s.kasa = 1000; }), "BATTIK", "kasa eksiye dustu");
});

G.test("rapor itibar ve kasa bilgisini tasiyor", function () {
  var s = G.durum.yeniOyun(2113);
  G.olaylar.secenekSec(s, 0);
  s.itibar = 60;
  s.gunBasiItibar = 55;
  G.gun.gunuBitir(s);
  var r = s.sonRapor;
  G.esit(r.itibarBasi, 55, "gun basi itibar");
  G.esit(r.itibarSon, s.itibar, "gun sonu itibar");
  G.esit(r.kasa, s.kasa, "kasa");
  G.dogru(r.ozet.length > 2, "ozet kelimesi");
});

// ---------- Adim 10: oyun sonu ----------

G.test("net varlik = kasa + stokun gercek degerinin %90'i", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  state.ilanlar.length = 0;
  state.stok.push(araba);
  state.kasa = 1000000;
  var beklenen = Math.round(1000000 + G.araba.gercekDeger(araba) * G.config.NET_VARLIK_STOK_ORANI);
  G.esit(G.durum.netVarlik(state), beklenen, "net varlik");
});

G.test("30. gun sonunda bitis nesnesi tam dolu", function () {
  var s = G.durum.yeniOyun(3101);
  G.olaylar.secenekSec(s, 0);
  s.gun = G.config.GUN_SAYISI;
  s.kasa = 7600000;
  G.gun.gunuBitir(s);
  var b = s.bitis;
  G.dogru(b !== null, "bitis olmali");
  G.esit(b.tur, "son", "tur");
  G.esit(b.gun, G.config.GUN_SAYISI, "gun");
  G.esit(b.hedef, G.config.HEDEF_NET_VARLIK, "hedef");
  G.esit(b.kasa, s.kasa, "kasa");
  G.esit(b.stokAdet, s.stok.length, "stok adedi");
  G.esit(b.netVarlik, G.durum.netVarlik(s), "net varlik");
  G.esit(b.fark, b.netVarlik - b.hedef, "hedefe gore fark");
  G.esit(b.tohum, s.tohum, "tohum");
  G.esit(b.kazandi, true, "hedefi tuttuk");
  G.esit(b.unvan, "Usta", "unvan");
  G.dogru(b.baslik.indexOf("Dükkân bizim") !== -1, "baslik: " + b.baslik);
});

G.test("hedefin altinda bitirince kazandi yanlis, unvan duser", function () {
  var s = G.durum.yeniOyun(3102);
  G.olaylar.secenekSec(s, 0);
  s.gun = G.config.GUN_SAYISI;
  s.kasa = 6500000;
  s.stok = [];
  G.gun.gunuBitir(s);
  G.esit(s.bitis.kazandi, false, "kazanmadik");
  G.esit(s.bitis.unvan, "Cirak", "unvan");
  G.dogru(s.bitis.fark < 0, "fark eksi");
});

G.test("battiginda ve itibar bittiginde bitis bilgisi dogru", function () {
  var s = G.durum.yeniOyun(3103);
  G.olaylar.secenekSec(s, 0);
  s.kasa = 1000;
  G.gun.gunuBitir(s);
  G.esit(s.bitis.tur, "batti", "batti");
  G.esit(s.bitis.gun, s.gun, "kacinci gunde battigi");
  G.esit(s.bitis.kazandi, false, "kazanmadik");

  var t = G.durum.yeniOyun(3104);
  G.olaylar.secenekSec(t, 0);
  t.itibar = 0;
  G.gun.gunuBitir(t);
  G.esit(t.bitis.tur, "itibarsiz", "itibarsiz");
});

G.test("ekspertizde agir kusur cikinca dolandirici yakalanmis sayilir", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.saticiTipi = "dolandirici";
  araba.kusurlar.push({
    tip: "sase", parca: "", etki: 787500, gorunurluk: "gizli",
    ortayaCikti: false, musteriyeSoylendi: false, satilamaz: true
  });
  G.esit(state.istatistik.yakalananDolandirici, 0, "baslangic");
  araba.ekspertizSeviyesi = null;
  G.ekspertiz.ekspertizYap(state, araba, "premium");
  G.esit(state.istatistik.yakalananDolandirici, 1, "yakalandi");
  G.ekspertiz.ekspertizYap(state, araba, "premium");
  G.esit(state.istatistik.yakalananDolandirici, 1, "ikinci kez sayilmaz");

  // durust saticida bu sayac artmaz
  var state2 = sahteState();
  var araba2 = bmwIlani(state2);
  araba2.kusurlar.push({
    tip: "agirHasar", parca: "", etki: 437500, gorunurluk: "gizli",
    ortayaCikti: false, musteriyeSoylendi: false
  });
  G.ekspertiz.ekspertizYap(state2, araba2, "premium");
  G.esit(state2.istatistik.yakalananDolandirici, 0, "abartici satici dolandirici degil");
});

G.test("oyun bittikten sonra ilana gidilemez", function () {
  var s = G.durum.yeniOyun(3105);
  G.olaylar.secenekSec(s, 0);
  var ilanId = s.ilanlar[0].id;
  s.gun = G.config.GUN_SAYISI;
  G.gun.gunuBitir(s);
  G.dogru(s.bitis !== null, "oyun bitti");
  var sonuc = G.gun.ilanaGit(s, ilanId);
  G.dogru(sonuc.hata !== undefined, "ilana gidilememeli");
});

G.test("ayni tohumla tekrar ayni oyunu veriyor", function () {
  function ilkGun(tohum) {
    var s = G.durum.yeniOyun(tohum);
    var kart = s.aktifKart.id;
    var ilanlar = s.ilanlar.map(function (a) {
      return a.marka + a.model + a.yil + a.istenenFiyat + a.saticiTipi;
    }).join("|");
    return kart + "::" + ilanlar;
  }
  var s = G.durum.yeniOyun(3106);
  var tohum = s.tohum;
  G.esit(tohum, 3106, "tohum state'te duruyor");
  G.esit(ilkGun(tohum), ilkGun(tohum), "ayni tohum ayni ilk gun");
  G.dogru(ilkGun(tohum) !== ilkGun(tohum + 1), "farkli tohum farkli oyun");
});

G.test("unvan esikleri bitis ekraninda tutuyor", function () {
  function unvanOlc(kasa) {
    var s = G.durum.yeniOyun(3107);
    G.olaylar.secenekSec(s, 0);
    s.stok = [];
    s.gun = G.config.GUN_SAYISI;
    s.kasa = kasa + G.config.SABIT_GIDER;      // akşam sabit gider dusecek
    G.gun.gunuBitir(s);
    return s.bitis.unvan;
  }
  G.esit(unvanOlc(6000000), "Cirak", "6 M");
  G.esit(unvanOlc(7000000), "Galerici", "7 M");
  G.esit(unvanOlc(7600000), "Usta", "7,6 M");
  G.esit(unvanOlc(9000000), "Sanayinin Krali", "9 M");
});

// ---------- Adim 15: gorsel roman sahnesi ----------

G.test("mekan ve karakter listeleri tam", function () {
  var mekanlar = G.sahne.mekanlar();
  var gerekli = ["galeri-onu", "galeri-ici", "sanayi-avlu", "ilan-sokak", "ekspertiz",
                 "noter", "buro", "ev-sofra", "kahve", "gece-sanayi", "yol"];
  for (var i = 0; i < gerekli.length; i++) {
    G.dogru(mekanlar.indexOf(gerekli[i]) !== -1, "mekan eksik: " + gerekli[i]);
  }
  var kisiler = G.sahne.karakterler();
  var gerekliKisi = ["nuri", "drej", "kro", "riza", "sukru", "abla", "satici",
                     "musteri", "noter", "teknisyen", "musavir", "cuneyt", "polis"];
  for (var j = 0; j < gerekliKisi.length; j++) {
    G.dogru(kisiler.indexOf(gerekliKisi[j]) !== -1, "karakter eksik: " + gerekliKisi[j]);
  }
  G.esit(G.sahne.ifadeler().join(","), "normal,sevincli,sinirli", "uc ifade");
  G.esit(G.sahne.konumlar().join(","), "sol,orta,sag", "uc konum");
});

G.test("dosya adi kurali dogru yol uretiyor", function () {
  G.esit(G.sahne.mekanYolu("ekspertiz"), "img/mekan/ekspertiz.jpg");
  G.esit(G.sahne.mekanYolu("ekspertiz", "png"), "img/mekan/ekspertiz.png");
  G.esit(G.sahne.karakterYolu("nuri", "sinirli"), "img/karakter/nuri-sinirli.png");
  G.esit(G.sahne.karakterYolu("nuri", "kizgin"), "img/karakter/nuri-sinirli.png", "eski ad yeniye duser");
  G.esit(G.sahne.karakterYolu("drej"), "img/karakter/drej-normal.png");
  G.esit(G.sahne.karakterYolu("kro", "boyle-ifade-yok"), "img/karakter/kro-normal.png",
    "bilinmeyen ifade normale duser");
});

G.test("sahne ciktisi mekan, karakter ve yedek zinciri tasiyor", function () {
  var cikti = G.sahne.ciz({
    mekan: "noter",
    kisiler: [{ kim: "nuri", ifade: "sevincli", konum: "sol" }, { kim: "noter", konum: "sag" }],
    konusan: "nuri"
  });
  G.dogru(cikti.indexOf('<div class="sahne"') === 0, "sahne kabi");
  G.dogru(cikti.indexOf("img/mekan/noter.jpg") !== -1, "mekan jpg");
  G.dogru(cikti.indexOf("img/mekan/noter.png") !== -1, "mekan png yedegi");
  G.dogru(cikti.indexOf("img/karakter/nuri-sevincli.png") !== -1, "ifadeli karakter");
  G.dogru(cikti.indexOf("img/karakter/nuri-normal.png") !== -1, "karakter yedegi");
  G.dogru(cikti.indexOf("Noter") !== -1, "mekan adi yer tutucusu");
  G.dogru(cikti.indexOf("siluet") === -1, "siluet artik cizilmiyor");
  G.dogru(cikti.indexOf("onerror") !== -1 && cikti.indexOf("onload") !== -1, "takas kancalari");
  G.dogru(cikti.indexOf('class="karakter sol konusan"') !== -1, "konusan one cikmali");
  G.dogru(cikti.indexOf('class="karakter sag geride"') !== -1, "digerleri geride");
});

G.test("eksik ve bilinmeyen veride sahne cokmuyor", function () {
  G.dogru(G.sahne.ciz().indexOf("<div") === 0, "bos cagri");
  G.dogru(G.sahne.ciz({ mekan: "olmayan-mekan", kisiler: [{ kim: "olmayan-kisi" }] }).indexOf("<div") === 0,
    "bilinmeyen mekan/karakter cokmemeli");
  var k = G.sahne.ciz({ mekan: "yol", kisiler: [{ kim: "kro", konum: "yanlis-konum" }] });
  G.dogru(k.indexOf("karakter orta") !== -1, "gecersiz konum ortaya duser");
  G.sahne.bulunamadi("img/karakter/kro-normal.png");
  G.dogru(G.sahne.ciz({ mekan: "yol", kisiler: [{ kim: "kro", konum: "sol" }] }).indexOf("kro-normal") === -1,
    "bulunamayan gorsel bir daha denenmez");
});

G.test("ekran anahtarlari hazir sahneye cevriliyor", function () {
  var ekranlar = ["giris", "dukkan", "ilanlar", "araba", "ekspertiz", "pazarlik", "noter",
                  "musteri", "satis", "yakalandi", "aksam", "gece", "defter",
                  "bitis-kazandi", "bitis-batti", "bitis-son"];
  var mekanlar = G.sahne.mekanlar();
  for (var i = 0; i < ekranlar.length; i++) {
    var sahne = G.sahne.hazir(ekranlar[i], { konusan: "drej" });
    G.dogru(mekanlar.indexOf(sahne.mekan) !== -1, ekranlar[i] + ": gecerli mekan olmali");
    G.dogru(sahne.kisiler.length >= 0, ekranlar[i] + ": kisiler dizisi");
  }
  var pazarlik = G.sahne.hazir("pazarlik", { konusan: "drej", ruh: "kizgin" });
  G.esit(pazarlik.kisiler[0].kim, "drej", "konusan ortak sahnede");
  G.esit(pazarlik.kisiler[1].ifade, "sinirli", "gergin satici sinirli cizilir");
  G.esit(G.sahne.hazir("bilinmeyen-ekran").kisiler.length, 0, "bilinmeyen ekran bos sahne");
});

G.test("kart kategorilerinin hepsinin sahnesi var", function () {
  var mekanlar = G.sahne.mekanlar();
  var kisiler = G.sahne.karakterler();
  for (var i = 0; i < G.data.kartlar.length; i++) {
    var sahne = G.sahne.kartSahnesi(G.data.kartlar[i].kategori);
    G.dogru(mekanlar.indexOf(sahne.mekan) !== -1, G.data.kartlar[i].kategori + ": mekan");
    G.dogru(sahne.kisiler.length > 0, G.data.kartlar[i].kategori + ": en az bir karakter");
    for (var j = 0; j < sahne.kisiler.length; j++) {
      G.dogru(kisiler.indexOf(sahne.kisiler[j].kim) !== -1,
        G.data.kartlar[i].kategori + ": bilinmeyen karakter " + sahne.kisiler[j].kim);
    }
  }
});

// ---------- Adim 15: diyalog kuyrugu ----------

G.test("diyalog sirayla ilerliyor ve bitince ekran degistiriyor", function () {
  var s = G.durum.yeniOyun(6001);
  G.diyalog.kur(s, [
    { kim: "nuri", ifade: "sevincli", metin: "Gelsin pereler gelsin!" },
    { kim: "drej", metin: "Deftere yazdım ortak." }
  ], { mekan: "galeri-ici", kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }], sonra: "dukkan" });

  G.esit(G.diyalog.acikMi(s), true, "diyalog acildi");
  G.esit(G.diyalog.suAnki(s).kim, "nuri", "ilk replik");
  G.esit(G.diyalog.kalan(s), 2, "iki replik kaldi");

  var sahne = G.diyalog.sahne(s);
  G.esit(sahne.konusan, "nuri", "konusan ilk replige gore");
  G.esit(sahne.kisiler[0].ifade, "sevincli", "ifade replige gore guncellenir");

  G.diyalog.ilerle(s);
  G.esit(G.diyalog.suAnki(s).kim, "drej", "ikinci replik");
  G.diyalog.ilerle(s);
  G.esit(G.diyalog.acikMi(s), false, "diyalog bitti");
  G.esit(s.diyalog, null, "temizlendi");
  G.esit(s.ekran, "dukkan", "sonra ekranina gecti");
});

G.test("bos diyalog dogrudan sonraki ekrana geciyor", function () {
  var s = G.durum.yeniOyun(6002);
  G.diyalog.kur(s, [], { sonra: "ilanlar" });
  G.esit(s.diyalog, null, "acilmadi");
  G.esit(s.ekran, "ilanlar", "dogrudan gecti");
});

G.test("diyalog kayda giriyor", function () {
  var s = G.durum.yeniOyun(6003);
  G.diyalog.kur(s, [{ kim: "kro", metin: "Dayı bak ne buldum." }], { mekan: "ilan-sokak" });
  var metin = JSON.stringify(s);
  var geri = JSON.parse(metin);
  G.esit(geri.diyalog.satirlar.length, 1, "replik kaydedildi");
  G.esit(geri.diyalog.mekan, "ilan-sokak", "mekan kaydedildi");
  G.dogru(metin.indexOf("function") === -1, "state'te fonksiyon olmamali");
});

G.test("baloncuk metinleri 12 kelimeyi gecmiyor", function () {
  var sinir = G.diyalog.KELIME_SINIRI;
  G.esit(sinir, 12, "sinir 12 kelime");
  var uzunlar = [];

  function tara(nesne, yol) {
    for (var k in nesne) {
      if (!nesne.hasOwnProperty(k)) continue;
      var v = nesne[k];
      if (typeof v === "string") {
        if (G.diyalog.kelimeSayisi(v) > sinir) uzunlar.push(yol + "." + k + ": " + v);
      } else if (v && typeof v === "object") {
        tara(v, yol + "." + k);
      }
    }
  }
  tara(G.data.replikler, "replikler");

  for (var i = 0; i < G.data.kartlar.length; i++) {
    var kart = G.data.kartlar[i];
    if (!kart.replikler) continue;
    for (var j = 0; j < kart.replikler.length; j++) {
      if (G.diyalog.kelimeSayisi(kart.replikler[j].metin) > sinir) {
        uzunlar.push("kart " + kart.id + ": " + kart.replikler[j].metin);
      }
    }
  }
  for (var r = 0; r < G.data.rehberAdimlari.length; r++) {
    var adim = G.data.rehberAdimlari[r];
    if (G.diyalog.kelimeSayisi(adim.metin) > sinir) {
      uzunlar.push("rehber " + adim.id + ": " + adim.metin);
    }
  }
  G.dogru(uzunlar.length === 0, uzunlar.length + " replik 12 kelimeyi geciyor: " + uzunlar.slice(0, 3).join(" | "));
});

G.test("kelime sayaci dogru sayiyor", function () {
  G.esit(G.diyalog.kelimeSayisi("Erebe gider, pere gelir!"), 4);
  G.esit(G.diyalog.kelimeSayisi("   "), 0);
  G.esit(G.diyalog.denetle([{ metin: "bir iki üç" }]).length, 0, "kisa replik gecer");
  G.esit(G.diyalog.denetle([{ metin: "a a a a a a a a a a a a a" }]).length, 1, "uzun replik yakalanir");
});

// ---------- Adim 13: baslangic rehberi ----------

G.test("rehber ilk gunde acik ve ilk adim olay karti", function () {
  var s = G.durum.yeniOyun(5001);
  var r = G.rehber.durum(s);
  G.esit(r.acik, true, "rehber acik");
  G.esit(r.adim, 0, "ilk adim");
  G.esit(G.rehber.suAnki(s).id, "kart", "ilk adim kart okumak");
  G.esit(G.rehber.ilerleme(s).adim, 1, "ilerleme 1");
  G.esit(G.rehber.ilerleme(s).toplam, G.data.rehberAdimlari.length, "toplam adim");
});

G.test("rehber kosul saglanince ilerliyor ve sonunda kapaniyor", function () {
  var s = G.durum.yeniOyun(5002);
  G.olaylar.secenekSec(s, 0);
  G.rehber.ilerlet(s);
  G.esit(G.rehber.suAnki(s).id, "ilanlar", "kart kapaninca ilan adimi");

  s.bugunGezilen.push("a1");
  G.rehber.ilerlet(s);
  G.esit(G.rehber.suAnki(s).id, "ekspertiz", "ilana girilince ekspertiz adimi");

  G.esit(G.rehber.suAnki(s).id, "ekspertiz", "alis yapilmadan ilan fiyati adimi gelmez");
  s.istatistik.alinan = 1;
  G.rehber.ilerlet(s);
  G.esit(G.rehber.suAnki(s).id, "gunuBitir", "alis yapilinca ilan fiyati adimi tamamlanir");

  s.faz = "aksam";
  G.rehber.ilerlet(s);
  G.esit(G.rehber.suAnki(s).id, "sizce", "gun bitince Sizce adimi");

  s.gun = 2;
  G.rehber.ilerlet(s);
  G.esit(G.rehber.suAnki(s).id, "musteri", "yeni gunde musteri adimi");

  s.istatistik.satilan = 1;
  G.rehber.ilerlet(s);
  G.esit(G.rehber.suAnki(s), null, "adimlar bitti");
  G.esit(G.rehber.durum(s).acik, false, "rehber kapandi");
  G.esit(G.rehber.durum(s).bitti, true, "bitti isaretlendi");
});

G.test("rehber kapatilip yeniden acilabiliyor", function () {
  var s = G.durum.yeniOyun(5003);
  G.rehber.kapat(s);
  G.esit(G.rehber.suAnki(s), null, "kapaliyken adim gosterilmez");
  G.rehber.ac(s);
  G.dogru(G.rehber.suAnki(s) !== null, "yeniden acilinca adim doner");
  G.rehber.sifirla(s);
  G.esit(G.rehber.durum(s).adim, 0, "sifirlanabiliyor");
});

G.test("rehber durumu kayda giriyor", function () {
  var s = G.durum.yeniOyun(5004);
  G.olaylar.secenekSec(s, 0);
  s.bugunGezilen.push("a1");
  G.rehber.ilerlet(s);
  G.rehber.yardimAc(s, "pazarlik");
  var metin = JSON.stringify(s);
  var geri = JSON.parse(metin);
  G.esit(geri.rehber.adim, s.rehber.adim, "adim kaydedildi");
  G.esit(geri.rehber.acikYardim, "pazarlik", "acik yardim kaydedildi");
  G.dogru(metin.indexOf("function") === -1, "state'te fonksiyon olmamali");
});

G.test("her ekranin yardim metni var", function () {
  var ekranlar = ["dukkan", "ilanlar", "araba", "olay", "pazarlik", "durustluk",
                  "satis", "rapor", "sizce", "bitti", "defter"];
  for (var i = 0; i < ekranlar.length; i++) {
    var y = G.rehber.yardim(ekranlar[i]);
    G.dogru(!!y, ekranlar[i] + ": yardim yok");
    G.dogru(!!y.baslik, ekranlar[i] + ": baslik yok");
    G.dogru(y.satirlar.length >= 2, ekranlar[i] + ": en az iki satir olmali");
    for (var j = 0; j < y.satirlar.length; j++) {
      G.dogru(y.satirlar[j].length > 20, ekranlar[i] + ": satir cok kisa");
    }
  }
  G.esit(G.rehber.yardim("olmayanEkran"), null, "olmayan ekran icin null");
});

G.test("rehber adimlari tutarli", function () {
  var gecerliEkranlar = ["dukkan", "ilanlar", "araba", "olay", "pazarlik", "durustluk",
                         "satis", "rapor", "sizce", "bitti", "defter"];
  var idler = [];
  for (var i = 0; i < G.data.rehberAdimlari.length; i++) {
    var a = G.data.rehberAdimlari[i];
    G.dogru(!!a.id, "id yok");
    G.dogru(idler.indexOf(a.id) === -1, "tekrar eden adim id: " + a.id);
    idler.push(a.id);
    G.dogru(["nuri", "drej", "kro"].indexOf(a.kim) !== -1, a.id + ": gecerli karakter olmali");
    G.dogru(gecerliEkranlar.indexOf(a.ekran) !== -1, a.id + ": gecerli ekran olmali (" + a.ekran + ")");
    G.dogru(a.metin.length > 10, a.id + ": metin bos");
    G.dogru(G.diyalog.kelimeSayisi(a.metin) <= G.diyalog.KELIME_SINIRI,
      a.id + ": baloncuk 12 kelimeyi gecmemeli");
    G.dogru(!!a.yardim && a.yardim.length > 40, a.id + ": uzun aciklama yardim alaninda olmali");
    G.esit(typeof a.kosul, "function", a.id + ": kosul fonksiyon olmali");
  }
  G.dogru(idler.length >= 10, "en az 10 adim olmali");
});

G.test("ilk iki gun Nuri sinirlenmez (karar #19)", function () {
  var state = sahteState();
  bmwIlani(state);
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  state.gun = 1;
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), 0, "1. gun");
  state.gun = 2;
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), 0, "2. gun");
  state.gun = 3;
  G.esit(G.karakterler.sinirlenmeOlasiligi(state, p), G.config.NURI_SINIR_OLASILIK, "3. gun normale doner");
});


// ---------------------------------------------------------------- Adim 14: hikaye

G.test("hikaye destesi butun: gun, mekan ve replikler yerinde", function () {
  var liste = G.hikaye.sahneler();
  G.dogru(liste.length >= 8, "en az 8 sahne var, bulunan: " + liste.length);
  var gunler = {};
  var idler = {};
  for (var i = 0; i < liste.length; i++) {
    var sahne = liste[i];
    G.dogru(!!sahne.id && !idler[sahne.id], "id tekil: " + sahne.id);
    idler[sahne.id] = 1;
    G.dogru(sahne.gun >= 1 && sahne.gun <= G.config.GUN_SAYISI, sahne.id + " gunu araliikta");
    G.dogru(!gunler[sahne.gun], "ayni gunde tek sahne: gun " + sahne.gun);
    gunler[sahne.gun] = 1;
    G.dogru(!!G.sahne.mekanBilgi(sahne.mekan), sahne.id + " mekani tanimli: " + sahne.mekan);
    G.dogru(sahne.replikler.length >= 2, sahne.id + " en az iki replik");
    for (var j = 0; j < sahne.replikler.length; j++) {
      var r = sahne.replikler[j];
      G.dogru(!!G.sahne.karakterBilgi(r.kim), sahne.id + " konusani tanimli: " + r.kim);
      G.dogru(G.sahne.ifadeler().indexOf(r.ifade) !== -1, sahne.id + " ifadesi gecerli: " + r.ifade);
      G.dogru(G.diyalog.kelimeSayisi(r.metin) <= G.diyalog.KELIME_SINIRI,
        sahne.id + " repligi 12 kelimeyi gecmemeli: " + r.metin);
    }
    for (var k = 0; k < sahne.kisiler.length; k++) {
      G.dogru(!!G.sahne.karakterBilgi(sahne.kisiler[k].kim),
        sahne.id + " sahnedeki kisi tanimli: " + sahne.kisiler[k].kim);
    }
  }
});

G.test("hikaye sahnesi gunu gelince bir kez oynuyor", function () {
  var s = G.durum.yeniOyun(2727);
  G.esit(s.aktifHikaye.id, "prolog", "1. gun prolog");
  // ayni gun ikinci kez cagirilinca sahne gelmemeli
  G.esit(G.hikaye.gununSahnesi(s), null, "gorulen sahne tekrar gelmez");

  s.gun = 4;
  var sahne = G.hikaye.gununSahnesi(s);
  G.dogru(sahne !== null && sahne.id === "riza_tanisma", "4. gun Riza sahnesi");

  s.gun = 5;
  G.esit(G.hikaye.gununSahnesi(s), null, "sahnesiz gunde sahne yok");
});

G.test("hikaye sahnesi bitince etkisi isliyor", function () {
  var s = G.durum.yeniOyun(3131);
  s.gun = 22;
  s.itibar = 50;
  var onceki = s.itibar;
  var sahne = G.hikaye.gununSahnesi(s);
  G.esit(sahne.id, "cuneyt_gitti", "22. gun Cuneyt sahnesi");
  G.hikaye.baslat(s, sahne);
  G.esit(s.ekran, "hikaye", "ekran hikayeye gecti");
  G.dogru(G.hikaye.acikMi(s), "hikaye diyalogu acik");

  var guvenlik = 0;
  while (G.diyalog.acikMi(s) && guvenlik++ < 20) G.diyalog.ilerle(s);
  G.hikaye.bitir(s);
  G.esit(s.itibar, onceki + 2, "sahnenin itibar etkisi islendi");
  G.esit(s.aktifHikaye, null, "aktif hikaye temizlendi");
  G.esit(s.ekran, "olay", "diyalog sonunda olay kartina gecildi");
});

G.test("hikaye durumu kayda giriyor", function () {
  var s = G.durum.yeniOyun(4242);
  var metin = JSON.stringify(s);
  var geri = JSON.parse(metin);
  G.dogru(geri.gorulenHikaye.indexOf("prolog") !== -1, "gorulen sahne kayitta");
  G.esit(geri.istatistik.hikayeSahnesi, 1, "sayac kayitta");
});

G.test("30 gunluk oyunda butun hikaye sahneleri cikiyor", function () {
  var s = G.durum.yeniOyun(5151);
  for (var gun = 1; gun <= G.config.GUN_SAYISI; gun++) {
    s.gun = gun;
    var sahne = G.hikaye.gununSahnesi(s);
    if (sahne) G.hikaye.baslat(s, sahne);
  }
  G.esit(s.gorulenHikaye.length, G.hikaye.toplam(), "butun sahneler gorulur");
});


// ---------------------------------------------------------------- Adim 12: cila

G.test("her replik havuzunda en az 5 secenek var", function () {
  var R = G.data.replikler;
  var azOlanlar = [];
  var toplam = 0;
  (function tara(nesne, yol) {
    for (var k in nesne) {
      if (!nesne.hasOwnProperty(k)) continue;
      var v = nesne[k];
      if (Object.prototype.toString.call(v) === "[object Array]") {
        toplam += v.length;
        if (v.length < 5) azOlanlar.push(yol + "." + k + " = " + v.length);
      } else if (v && typeof v === "object") {
        tara(v, yol + "." + k);
      }
    }
  })(R, "");
  G.esit(azOlanlar.join(", "), "", "5'in altinda kalan havuz");
  G.dogru(toplam >= 300, "toplam replik sayisi: " + toplam);
});

G.test("repliklerdeki yer tutucular tanimli", function () {
  var izin = { fiyat: 1, model: 1, parca: 1, tutar: 1, alt: 1, ust: 1 };
  var hatali = [];
  (function tara(nesne, yol) {
    for (var k in nesne) {
      if (!nesne.hasOwnProperty(k)) continue;
      var v = nesne[k];
      if (typeof v === "string") v = [v];
      if (Object.prototype.toString.call(v) === "[object Array]") {
        for (var i = 0; i < v.length; i++) {
          if (typeof v[i] !== "string") continue;
          var bulunan = v[i].match(/\{([a-zA-Z]+)\}/g) || [];
          for (var j = 0; j < bulunan.length; j++) {
            var ad = bulunan[j].slice(1, -1);
            if (!izin[ad]) hatali.push(yol + "." + k + ": {" + ad + "}");
          }
        }
      } else if (v && typeof v === "object") {
        tara(v, yol + "." + k);
      }
    }
  })(G.data.replikler, "");
  G.esit(hatali.join(", "), "", "tanimsiz yer tutucu");
});

G.test("replik secici havuzdaki butun secenekleri kullanabiliyor", function () {
  G.durum.yeniOyun(777);
  var havuz = G.data.replikler.satici.durust.acilis;
  var gorulen = {};
  for (var i = 0; i < 200; i++) {
    gorulen[G.rng.sec(havuz)] = 1;
  }
  var sayi = 0;
  for (var k in gorulen) if (gorulen.hasOwnProperty(k)) sayi++;
  G.dogru(sayi >= 4, "200 cekiliste en az 4 farkli replik cikmali, cikan: " + sayi);
});


// ---------------------------------------------------------------- Adim 17: katalog ve araba gorseli

G.test("katalog butun: marka-model tekil, degerler ve yillar makul", function () {
  var govdeler = ["sedan", "hatchback", "station", "suv", "pickup", "ticari", "klasik"];
  var liste = G.data.modeller;
  var gorulen = {};
  G.dogru(liste.length >= 40, "katalogda en az 40 model olmali, bulunan: " + liste.length);

  for (var i = 0; i < liste.length; i++) {
    var m = liste[i];
    var ad = m.marka + " " + m.model;
    G.dogru(!gorulen[ad], "model tekil olmali: " + ad);
    gorulen[ad] = 1;
    G.dogru(m.deger >= 200000 && m.deger <= 2500000, ad + " degeri araliikta: " + m.deger);
    G.dogru(m.yilMin <= m.yilMaks, ad + " yil araligi ters");
    G.dogru(govdeler.indexOf(m.govde) !== -1, ad + " govdesi tanimli degil: " + m.govde);
    if (m.yilMaks < 2005) {
      G.dogru(m.kmEtkisiz === true, ad + " 2005 oncesi, kmEtkisiz olmali");
    }
  }
});

G.test("araba anahtari dosya adina cevriliyor", function () {
  var beklenen = [
    [{ marka: "VW", model: "Passat" }, "vw-passat"],
    [{ marka: "Tofaş", model: "Şahin" }, "tofas-sahin"],
    [{ marka: "BMW", model: "3.20i" }, "bmw-3-20i"],
    [{ marka: "Seat", model: "Leon FR" }, "seat-leon-fr"],
    [{ marka: "Mercedes", model: "W124" }, "mercedes-w124"],
    [{ marka: "Citroën", model: "C-Elysée" }, "citroen-c-elysee"],
    [{ marka: "Škoda", model: "Octavia" }, "skoda-octavia"],
    [{ marka: "Fiat", model: "Doblò" }, "fiat-doblo"]
  ];
  for (var i = 0; i < beklenen.length; i++) {
    G.esit(G.sahne.arabaAnahtari(beklenen[i][0]), beklenen[i][1],
      beklenen[i][0].marka + " " + beklenen[i][0].model);
  }

  // katalogdaki butun anahtarlar temiz ve tekil
  var gorulen = {};
  for (var j = 0; j < G.data.modeller.length; j++) {
    var anahtar = G.sahne.arabaAnahtari(G.data.modeller[j]);
    G.dogru(/^[a-z0-9-]+$/.test(anahtar), "anahtar sadece kucuk harf, rakam ve tire: " + anahtar);
    G.dogru(!gorulen[anahtar], "anahtar tekil olmali: " + anahtar);
    gorulen[anahtar] = 1;
  }
});

G.test("uretilen her ilan govde tasiyor", function () {
  var state = G.durum.yeniOyun(818);
  for (var gun = 0; gun < 6; gun++) {
    for (var i = 0; i < state.ilanlar.length; i++) {
      G.dogru(!!state.ilanlar[i].govde, G.araba.adi(state.ilanlar[i]) + " govdesiz");
    }
    G.gun.gunuBitir(state);
    if (state.bitis) break;
    G.gun.raporKapat(state);
    G.gun.sizceSec(state, 0);
  }
});

G.test("sahne araba katmanini sadece araba verilince ciziyor", function () {
  var arabasiz = G.sahne.ciz({ mekan: "sanayi-avlu", kisiler: [] });
  G.dogru(arabasiz.indexOf("sahne-araba") === -1, "araba verilmeyince katman olmamali");

  var arabali = G.sahne.ciz({
    mekan: "sanayi-avlu", kisiler: [],
    araba: { anahtar: "vw-passat", govde: "sedan" }
  });
  G.dogru(arabali.indexOf("sahne-araba") !== -1, "araba katmani cizilmeli");
  G.dogru(arabali.indexOf("img/araba/vw-passat.png") !== -1, "once modelin fotografi denenmeli");
  G.dogru(arabali.indexOf("img/araba/sedan.png") !== -1, "yedek olarak govde fotografi olmali");

  // bulunamayan gorsel bir daha istenmez
  G.sahne.bulunamadi("img/araba/vw-passat.png");
  G.sahne.bulunamadi("img/araba/vw-passat.webp");
  var ikinci = G.sahne.ciz({
    mekan: "sanayi-avlu", kisiler: [],
    araba: { anahtar: "vw-passat", govde: "sedan" }
  });
  G.dogru(ikinci.indexOf("img/araba/vw-passat.png") === -1, "bulunamayan yol tekrar istenmemeli");
  G.dogru(ikinci.indexOf("img/araba/sedan.png") !== -1, "govde yedegi hala denenmeli");

  // govde de yoksa katman hic cizilmez
  G.sahne.bulunamadi("img/araba/sedan.png");
  G.sahne.bulunamadi("img/araba/sedan.webp");
  var ucuncu = G.sahne.ciz({
    mekan: "sanayi-avlu", kisiler: [],
    araba: { anahtar: "vw-passat", govde: "sedan" }
  });
  G.dogru(ucuncu.indexOf("sahne-araba") === -1, "hicbir gorsel yoksa katman cizilmemeli");
});


// ---------------------------------------------------------------- Adim 18: sehir disi sefer

G.test("sefer sehirleri butun: alanlar ve replikler yerinde", function () {
  var liste = G.sefer.sehirler();
  G.dogru(liste.length >= 5, "en az 5 sehir olmali, bulunan: " + liste.length);
  var idler = {};
  for (var i = 0; i < liste.length; i++) {
    var sehir = liste[i];
    G.dogru(!!sehir.id && !idler[sehir.id], "sehir id tekil: " + sehir.id);
    idler[sehir.id] = 1;
    G.dogru(sehir.yolMasrafi > 0 && sehir.yolMasrafi < 200000, sehir.ad + " yol masrafi makul");
    G.dogru(sehir.indirim[0] > 0 && sehir.indirim[1] > sehir.indirim[0] && sehir.indirim[1] < 0.3,
      sehir.ad + " indirim araligi makul");
    G.dogru(sehir.ilanSayisi >= 3, sehir.ad + " en az 3 ilan");
    G.dogru(G.diyalog.kelimeSayisi(sehir.ipucu) <= G.diyalog.KELIME_SINIRI,
      sehir.ad + " ipucu 12 kelimeyi gecmemeli");
    G.dogru(sehir.yemek.replikler.length >= 2, sehir.ad + " yemek repligi az");
    for (var j = 0; j < sehir.yemek.replikler.length; j++) {
      var r = sehir.yemek.replikler[j];
      G.dogru(G.diyalog.kelimeSayisi(r.metin) <= G.diyalog.KELIME_SINIRI,
        sehir.ad + " yemek repligi 12 kelimeyi gecmemeli: " + r.metin);
      G.dogru(!!G.sahne.karakterBilgi(r.kim), sehir.ad + " konusani tanimli: " + r.kim);
    }
  }
});

G.test("sefer baslayinca yol masrafi duser ve gun biter", function () {
  var s = G.durum.yeniOyun(3300);
  s.diyalog = null;
  s.aktifHikaye = null;
  s.aktifKart = null;
  s.faz = "mesai";
  var oncekiKasa = s.kasa;

  var sehir = G.sefer.secenekler(s)[0];
  var sefer = G.sefer.baslat(s, sehir.id);
  G.dogru(!sefer.hata, "sefer baslamali: " + sefer.hata);
  G.esit(s.kasa, oncekiKasa - sehir.yolMasrafi, "yol masrafi dustu");
  G.esit(s.aksiyon, 0, "gun bitti");
  G.esit(s.ekran, "sefer", "ekran sefere gecti");
  G.esit(s.sonSeferGun, s.gun, "sefer gunu isaretlendi");
  G.esit(s.istatistik.sefer, 1, "sayac");
  G.dogru(s.sefer.ilanlar.length >= 2, "sehirde ilan var");
  G.esit(s.sefer.kalanPazarlik, G.config.SEFER_PAZARLIK, "pazarlik hakki");
});

G.test("sefer ilanlari yereldekinden ucuz ve daha riskli", function () {
  var s = G.durum.yeniOyun(4400);
  var yerelOran = 0, seferOran = 0, yerelAdet = 0, seferAdet = 0;
  var yerelFark = 0, seferFark = 0;
  var i, araba;

  for (i = 0; i < 150; i++) {
    araba = G.araba.ilanUret(s, "ilan");
    if (araba.saticiTipi === "dolandirici") yerelOran++;
    yerelFark += araba.istenenFiyat / G.araba.gercekDeger(araba);
    yerelAdet++;
  }

  var sehir = G.sefer.sehirBul("diyarbakir");
  for (i = 0; i < 40; i++) {
    s.gun = 3;
    s.sonSeferGun = 0;
    s.faz = "mesai";
    s.aksiyon = 3;
    s.sefer = null;
    s.stok = [];
    G.sefer.baslat(s, sehir.id);
    for (var j = 0; j < s.sefer.ilanlar.length; j++) {
      araba = s.sefer.ilanlar[j];
      if (araba.saticiTipi === "dolandirici") seferOran++;
      seferFark += araba.istenenFiyat / G.araba.gercekDeger(araba);
      seferAdet++;
    }
    G.sefer.don(s);
  }

  G.dogru(seferFark / seferAdet < yerelFark / yerelAdet,
    "sefer ilani gercek degere gore daha ucuz olmali: " +
    (seferFark / seferAdet).toFixed(2) + " < " + (yerelFark / yerelAdet).toFixed(2));
  G.dogru(seferOran / seferAdet > yerelOran / yerelAdet,
    "seferde dolandirici orani yuksek olmali: " +
    (seferOran / seferAdet).toFixed(2) + " > " + (yerelOran / yerelAdet).toFixed(2));
});

G.test("sefer kosullari: bekleme, kapasite, son gunler, kasa", function () {
  var s = G.durum.yeniOyun(5500);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  G.dogru(G.sefer.gidebilirMi(s), "normalde cikilabilmeli: " + G.sefer.engel(s));

  s.sonSeferGun = s.gun;
  G.dogru(!G.sefer.gidebilirMi(s), "yeni dondukse cikilamaz");
  s.sonSeferGun = 0;

  var dolu = [];
  for (var i = 0; i < G.config.KAPASITE; i++) dolu.push({ id: "x" + i });
  s.stok = dolu;
  G.dogru(!G.sefer.gidebilirMi(s), "tezgah doluyken cikilamaz");
  s.stok = [];

  s.gun = G.config.GUN_SAYISI;
  G.dogru(!G.sefer.gidebilirMi(s), "son gunlerde cikilamaz");
  s.gun = 5;

  s.kasa = 100;
  G.dogru(!G.sefer.gidebilirMi(s), "kasa bostan cikilamaz");
});

G.test("yemek molasi bir kez yenir ve pazarligi yumusatir", function () {
  var s = G.durum.yeniOyun(6600);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  var sehir = G.sefer.sehirBul("konya");
  G.sefer.baslat(s, sehir.id);

  var oncekiKasa = s.kasa;
  var sonuc = G.sefer.yemek(s);
  G.dogru(!sonuc.hata, "yemek yenebilmeli");
  G.esit(s.kasa, oncekiKasa - sehir.yemek.bedel, "yemek bedeli dustu");
  G.esit(s.ekran, "yemek", "yemek sahnesi acildi");
  G.dogru(G.diyalog.acikMi(s), "yemek diyalogu acik");
  G.esit(G.sefer.sabirBonusu(s), G.config.SEFER_YEMEK_SABIR, "sabir bonusu");

  var ikinci = G.sefer.yemek(s);
  G.dogru(!!ikinci.hata, "ikinci kez yenmez");

  // bonus pazarliga yansiyor
  var guvenlik = 0;
  while (G.diyalog.acikMi(s) && guvenlik++ < 10) G.diyalog.ilerle(s);
  var araba = s.sefer.ilanlar[0];
  var p = G.pazarlik.alisBaslat(s, araba.id, "nuri");
  var persona = G.config.PERSONALAR[araba.persona] || { sabirEk: 0, ortak: {} };
  var beklenen = (araba.sabirZorla || G.config.SABIR[araba.saticiTipi]) +
    G.karakterler.al("nuri").sabirBonusu + G.config.SEFER_YEMEK_SABIR +
    persona.sabirEk + (persona.ortak.nuri || 0);     // Faz 3: persona da sabra giriyor
  G.esit(p.sabir, beklenen, "yemek sonrasi sabir");
});

G.test("seferden alinan araba stoga girer, donunce sefer kapanir", function () {
  var s = G.durum.yeniOyun(7700);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  G.sefer.baslat(s, G.sefer.secenekler(s)[0].id);

  var araba = s.sefer.ilanlar[0];
  var oncekiStok = s.stok.length;
  G.sefer.ilanaGit(s, araba.id);
  G.pazarlik.alisBaslat(s, araba.id, "nuri");
  G.pazarlik.alisTeklif(s, araba.istenenFiyat);      // istedigini ver, kapansin

  G.esit(s.stok.length, oncekiStok + 1, "araba tezgaha girdi");
  G.esit(s.sefer.alinan, 1, "sefer sayaci");
  G.dogru(G.sefer.ilanBul(s, araba.id) === null, "ilan sehir listesinden dustu");

  var ozet = G.sefer.don(s);
  G.esit(ozet.alinan, 1, "ozet");
  G.esit(s.sefer, null, "sefer kapandi");
  G.esit(s.ekran, "dukkan", "dukkana donuldu");
});

G.test("sefer acikken kayit JSON'a cevrilip geri yuklenebiliyor", function () {
  var s = G.durum.yeniOyun(8800);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  G.sefer.baslat(s, G.sefer.secenekler(s)[0].id);

  var geri = JSON.parse(JSON.stringify(s));
  G.esit(geri.sefer.sehirId, s.sefer.sehirId, "sehir kayitta");
  G.esit(geri.sefer.ilanlar.length, s.sefer.ilanlar.length, "ilanlar kayitta");
  G.esit(geri.sonSeferGun, s.sonSeferGun, "sefer gunu kayitta");
});

G.test("sefer ilanina ikinci kez gitmek bedava, hak bitince gidilmez", function () {
  var s = G.durum.yeniOyun(9900);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  G.sefer.baslat(s, G.sefer.sehirBul("gaziantep").id);

  var ilanlar = s.sefer.ilanlar;
  G.sefer.ilanaGit(s, ilanlar[0].id);
  G.esit(s.sefer.kalanPazarlik, G.config.SEFER_PAZARLIK - 1, "bir hak gitti");
  G.sefer.ilanaGit(s, ilanlar[0].id);
  G.esit(s.sefer.kalanPazarlik, G.config.SEFER_PAZARLIK - 1, "ayni ilan bedava");

  for (var i = 1; i < ilanlar.length; i++) G.sefer.ilanaGit(s, ilanlar[i].id);
  G.esit(s.sefer.kalanPazarlik, 0, "hak bitti");
  var sonuc = G.sefer.ilanaGit(s, ilanlar[ilanlar.length - 1].id + "-yok");
  G.dogru(!!sonuc.hata, "hak bitince gidilemez");
});


// ---------------------------------------------------------------- Adim 19: konsinye

function konsinyeKur(tohum) {
  var s = G.durum.yeniOyun(tohum || 1919);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  var araba = G.araba.ilanUret(s, "ilan", "durust");
  araba.konsinyeMumkun = true;
  s.ilanlar.push(araba);
  G.ekspertiz.gozKontrol(araba);
  return { state: s, araba: araba };
}

G.test("konsinye kabul edilince kasadan para cikmaz", function () {
  var k = konsinyeKur(1001);
  var oncekiKasa = k.state.kasa;
  var oncekiIlan = k.state.ilanlar.length;
  var net = G.konsinye.netHesapla(k.araba);

  var sonuc = G.konsinye.kabulEt(k.state, k.araba.id);
  G.dogru(!sonuc.hata, "konsinye alinmali: " + sonuc.hata);
  G.esit(k.state.kasa, oncekiKasa, "kasa degismemeli");
  G.esit(k.state.stok.length, 1, "araba tezgahta");
  G.esit(k.state.ilanlar.length, oncekiIlan - 1, "ilan listesinden dustu");
  G.esit(k.araba.alisFiyati, net, "alis fiyati sahibin neti");
  G.esit(k.araba.masraflar, 0, "noter odenmedi");
  G.esit(k.araba.konsinye.sonGun, k.state.gun + G.config.KONSINYE_SURE, "sure");
  G.esit(k.state.istatistik.konsinyeAlinan, 1, "sayac");
});

G.test("konsinye satisinda sahibin neti kasadan dusulur", function () {
  var k = konsinyeKur(1002);
  var net = G.konsinye.netHesapla(k.araba);
  G.konsinye.kabulEt(k.state, k.araba.id);

  var fiyat = G.yuvarla(net * 1.10);
  k.araba.ilanFiyati = fiyat;
  var musteri = G.musteri.musteriUret(k.state, k.araba);
  k.state.musteriler.push(musteri);

  var oncekiKasa = k.state.kasa;
  var p = G.pazarlik.satisBaslat(k.state, musteri.id, "soyle", "nuri");
  G.dogru(!p.hata, "satis baslamali");
  if (p.bitti) return;                       // yakalandi/sase gibi durumlar bu testin disinda

  var satisFiyati = p.tavan;                 // musterinin tavanindan satalim
  G.pazarlik.satisTeklif(k.state, satisFiyati);
  var son = k.state.aktifPazarlik;
  G.esit(son.sonuc, "satildi", "satis kapanmali");

  var komisyon = son.anlasmaFiyati - net;
  G.esit(son.kar, komisyon, "kar komisyona esit");
  G.esit(k.state.kasa, oncekiKasa + son.anlasmaFiyati - son.vergi - net,
    "kasaya sadece komisyon (eksi vergi) kaldi");
  G.esit(k.state.istatistik.konsinyeSatilan, 1, "konsinye satis sayaci");
  G.dogru(son.konsinye === true, "pazarlik konsinye isaretli");
});

G.test("sahibin netinin altina satis cepten odemeye doner", function () {
  var k = konsinyeKur(1003);
  var net = G.konsinye.netHesapla(k.araba);
  G.konsinye.kabulEt(k.state, k.araba.id);

  var oncekiKasa = k.state.kasa;
  var dusukFiyat = G.yuvarla(net * 0.8);
  var p = { tur: "satis", arabaId: k.araba.id, konusan: "nuri", durustluk: "soyle",
    gecmis: [], bitti: false, bulunanKusurlar: [] };
  k.state.aktifPazarlik = p;
  var musteri = G.musteri.musteriUret(k.state, k.araba);
  k.state.musteriler.push(musteri);
  p.musteriId = musteri.id;

  G.pazarlik.satisKapatDisari
    ? G.pazarlik.satisKapatDisari(k.state, p, k.araba, musteri, dusukFiyat)
    : (function () {
        // satisKapat disa acik degil: normal akisla dusuk fiyata satalim
        k.state.aktifPazarlik = null;
        k.araba.ilanFiyati = dusukFiyat;
        var p2 = G.pazarlik.satisBaslat(k.state, musteri.id, "soyle", "nuri");
        if (!p2.bitti) G.pazarlik.satisTeklif(k.state, dusukFiyat);
      })();

  G.dogru(k.state.kasa < oncekiKasa + net,
    "sahibin netinin altina satinca kasaya net kadar para girmez");
});

G.test("konsinye kozu bir kez oynanir ve neti dusurur", function () {
  var k = konsinyeKur(1004);
  G.ekspertiz.uygula(k.araba, "premium");
  var cikanlar = G.ekspertiz.cikanKusurlar(k.araba);
  if (!cikanlar.length) return;              // kusursuz araba cikmissa bu test gecerli degil

  var ilkNet = G.konsinye.netHesapla(k.araba);
  var tip = cikanlar[0].tip;
  var sonuc = G.konsinye.kozOyna(k.state, k.araba.id, tip);
  G.dogru(!sonuc.hata, "koz oynanmali: " + sonuc.hata);
  G.dogru(k.araba.konsinyeNet < ilkNet, "net dusmeli");

  var ikinci = G.konsinye.kozOyna(k.state, k.araba.id, tip);
  G.dogru(!!ikinci.hata, "ayni koz ikinci kez oynanmaz");
});

G.test("konsinye suresi dolunca araba sahibine gider", function () {
  var k = konsinyeKur(1005);
  G.konsinye.kabulEt(k.state, k.araba.id);
  var oncekiKasa = k.state.kasa;

  k.state.gun = k.araba.konsinye.sonGun - G.config.KONSINYE_UYARI_GUN;
  k.state.sabahHaberleri = [];
  G.konsinye.sureKontrol(k.state);
  G.esit(k.state.stok.length, 1, "uyari gununde araba duruyor");
  G.dogru(k.state.sabahHaberleri.join(" ").indexOf("Sahibi arıyor") !== -1,
    "sahibi aramali: " + k.state.sabahHaberleri.join(" "));

  k.state.gun = k.araba.konsinye.sonGun;
  k.state.sabahHaberleri = [];
  G.konsinye.sureKontrol(k.state);
  G.esit(k.state.stok.length, 0, "araba sahibine gitti");
  G.esit(k.state.kasa, oncekiKasa, "para hareketi yok");
  G.esit(k.state.istatistik.konsinyeGeriGiden, 1, "sayac");
});

G.test("net varlik konsinye arabayi tam degerle saymaz", function () {
  var k = konsinyeKur(1006);
  var net = G.konsinye.netHesapla(k.araba);
  var kasa = k.state.kasa;
  G.konsinye.kabulEt(k.state, k.araba.id);

  var beklenen = kasa + Math.max(0,
    G.araba.gercekDeger(k.araba) * G.config.NET_VARLIK_STOK_ORANI - net);
  G.esit(G.durum.netVarlik(k.state), Math.round(beklenen),
    "konsinyede sadece beklenen komisyon varlik sayilir");
  G.dogru(G.durum.netVarlik(k.state) < kasa + G.araba.gercekDeger(k.araba),
    "arabanin tamami varlik sayilmamali");
});

G.test("konsinye araba hurdaya verilemez", function () {
  var k = konsinyeKur(1007);
  G.konsinye.kabulEt(k.state, k.araba.id);
  var sonuc = G.pazarlik.hurdayaVer(k.state, k.araba.id);
  G.dogru(!!sonuc.hata, "konsinye hurdaya verilmemeli");
  G.esit(k.state.stok.length, 1, "araba yerinde kalmali");
});

G.test("dolandirici saticida konsinye teklifi cikmaz", function () {
  var s = G.durum.yeniOyun(1008);
  var dolandiriciSayisi = 0, konsinyeli = 0;
  for (var i = 0; i < 300; i++) {
    var araba = G.araba.ilanUret(s, "ilan", "dolandirici");
    dolandiriciSayisi++;
    if (araba.konsinyeMumkun) konsinyeli++;
  }
  G.dogru(dolandiriciSayisi > 0, "uretim oldu");
  G.esit(konsinyeli, 0, "dolandiricida konsinye teklifi olmamali");
});

G.test("konsinye durumu kayda giriyor", function () {
  var k = konsinyeKur(1009);
  G.konsinye.kabulEt(k.state, k.araba.id);
  var geri = JSON.parse(JSON.stringify(k.state));
  G.esit(geri.stok[0].konsinye.sahipNet, k.araba.konsinye.sahipNet, "net kayitta");
  G.esit(geri.stok[0].konsinye.sonGun, k.araba.konsinye.sonGun, "sure kayitta");
  G.esit(geri.istatistik.konsinyeAlinan, 1, "sayac kayitta");
});


// ---------------------------------------------------------------- Adim 20: takas

function takasKur(tohum) {
  var s = G.durum.yeniOyun(tohum || 2020);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  var araba = G.araba.ilanUret(s, "ilan", "durust");
  araba.alisFiyati = G.yuvarla(G.araba.bilinenDeger(araba) * 0.95);
  araba.masraflar = G.config.NOTER_PLAKA;
  araba.ilanFiyati = G.yuvarla(araba.alisFiyati * 1.10);
  s.stok.push(araba);

  var musteri = G.musteri.musteriUret(s, araba);
  musteri.takasArabasi = G.takas.arabaUret(s);
  musteri.takasKapandi = false;
  s.musteriler.push(musteri);
  return { state: s, araba: araba, musteri: musteri };
}

G.test("takas arabasi uretiliyor ve gozle bakilmis oluyor", function () {
  var k = takasKur(2001);
  var t = k.musteri.takasArabasi;
  G.dogru(!!t, "takas arabasi var");
  G.dogru(t.takasArabasi === true, "takas isaretli");
  G.dogru(t.gozBakildi === true, "gozle bakilmis olmali");
  G.dogru(t.konsinyeMumkun === false, "takas arabasinda konsinye teklifi olmaz");
  G.dogru(G.araba.bilinenDeger(t) > 0, "degeri var");
});

G.test("takas beklentisi config araliginda ve sabit kaliyor", function () {
  var k = takasKur(2002);
  var t = k.musteri.takasArabasi;
  var bekleniyor = G.takas.beklenti(t);
  var bilinen = G.araba.bilinenDeger(t);
  G.dogru(bekleniyor >= bilinen * G.config.TAKAS_BEKLENTI[0] * 0.999,
    "beklenti alt sinirda: " + bekleniyor + " / " + bilinen);
  G.dogru(bekleniyor <= bilinen * G.config.TAKAS_BEKLENTI[1] * 1.001, "beklenti tavani");
  G.esit(G.takas.beklenti(t), bekleniyor, "beklenti sabit kaliyor");
});

G.test("dusuk deger bicince musteri bozulur, yeterli deger anlasmaya gider", function () {
  var k = takasKur(2003);
  var t = k.musteri.takasArabasi;
  var bekleniyor = G.takas.beklenti(t);

  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;                           // yakalandi/sase: bu testin disinda
  var ilkSabir = p.sabir;

  G.takas.kabulEt(k.state, G.yuvarla(bekleniyor * 0.5));
  G.dogru(k.state.aktifPazarlik.sabir < ilkSabir, "hakaret gibi dusuk deger sabri yer");
  G.esit(k.state.aktifPazarlik.takas, null, "anlasma olmadi");

  // yeterli deger
  var p2 = k.state.aktifPazarlik;
  if (p2.bitti) return;
  G.takas.kabulEt(k.state, bekleniyor);
  G.dogru(!!k.state.aktifPazarlik.takas, "beklentisi karsilaninca anlasir");
  G.esit(k.state.aktifPazarlik.takas.bicilenDeger, G.yuvarla(bekleniyor, G.config.TEKLIF_ADIMI),
    "bicilen deger yazildi");
  G.esit(k.state.istatistik.takasYapilan, 1, "sayac");
});

G.test("takasli satista nakit fark alinir, araba tezgaha girer", function () {
  var k = takasKur(2004);
  var t = k.musteri.takasArabasi;
  var bekleniyor = G.takas.beklenti(t);

  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.takas.kabulEt(k.state, bekleniyor);
  if (!k.state.aktifPazarlik.takas) return;

  var oncekiKasa = k.state.kasa;
  var oncekiStok = k.state.stok.length;
  var bicilen = k.state.aktifPazarlik.takas.bicilenDeger;

  G.pazarlik.satisTeklif(k.state, k.state.aktifPazarlik.tavan);
  var son = k.state.aktifPazarlik;
  if (son.sonuc !== "satildi") return;

  G.esit(k.state.stok.length, oncekiStok, "biri cikti biri girdi: stok ayni");
  G.esit(k.state.kasa, oncekiKasa + son.anlasmaFiyati - son.vergi - bicilen,
    "kasaya sadece nakit fark girdi");
  G.esit(son.takasDegeri, bicilen, "sonucta takas degeri yazili");

  var geldi = false;
  for (var i = 0; i < k.state.stok.length; i++) {
    if (k.state.stok[i].id === t.id) geldi = true;
  }
  G.dogru(geldi, "takas arabasi tezgahta");
});

G.test("tezgah doluyken takasli musteri gelmez", function () {
  var s = G.durum.yeniOyun(2005);
  var dolu = [];
  for (var i = 0; i < G.config.KAPASITE; i++) {
    var a = G.araba.ilanUret(s, "ilan");
    a.ilanFiyati = a.piyasaDegeri;
    dolu.push(a);
  }
  s.stok = dolu;
  var takasli = 0;
  for (var j = 0; j < 60; j++) {
    var m = G.musteri.musteriUret(s, dolu[0]);
    if (m.takasArabasi) takasli++;
  }
  G.esit(takasli, 0, "tezgah doluyken takas teklifi uretilmemeli");
});

G.test("takastan vazgecilince gorusme nakit uzerinden surer", function () {
  var k = takasKur(2006);
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.takas.vazgec(k.state);
  G.dogru(k.musteri.takasKapandi === true, "takas kapandi");
  G.dogru(!G.takas.teklifVarMi(k.musteri), "teklif artik gorunmez");
  G.esit(k.state.aktifPazarlik.takas, null, "pazarlikta takas yok");
});

G.test("takas durumu kayda giriyor", function () {
  var k = takasKur(2007);
  var geri = JSON.parse(JSON.stringify(k.state));
  var m = geri.musteriler[geri.musteriler.length - 1];
  G.dogru(!!m.takasArabasi, "takas arabasi kayitta");
  G.esit(m.takasArabasi.id, k.musteri.takasArabasi.id, "ayni araba");
});


// ---------------------------------------------------------------- Adim 21: cek ve aval

function cekKur(tohum, risk) {
  var s = G.durum.yeniOyun(tohum || 2100);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  var araba = G.araba.ilanUret(s, "ilan", "durust");
  araba.alisFiyati = G.yuvarla(G.araba.bilinenDeger(araba) * 0.95);
  araba.masraflar = G.config.NOTER_PLAKA;
  araba.ilanFiyati = G.yuvarla(araba.alisFiyati * 1.10);
  s.stok.push(araba);

  var musteri = G.musteri.musteriUret(s, araba);
  musteri.takasArabasi = null;
  G.cek.musteriyiCekciYap(s, musteri);
  if (risk) musteri.cekRiski = risk;
  s.musteriler.push(musteri);
  return { state: s, araba: araba, musteri: musteri };
}

G.test("cekci musteri pazarlik etmez, ustune fark verir", function () {
  var k = cekKur(2101, "dusuk");
  G.dogru(k.musteri.ekspertizYok === true, "ekspertiz istemez");
  G.dogru(k.musteri.cekPrim >= G.config.CEK_PRIM[0], "prim alt sinir");
  G.dogru(k.musteri.cekPrim <= G.config.CEK_PRIM[1], "prim ust sinir");

  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.dogru(p.cekTeklifi === true, "cek teklifi isaretli");
  G.dogru(!p.cekli, "cek kabul edilmeden cekli olmaz");

  var nakitTavan = p.tavan;
  G.cek.cekeCevir(k.state);
  G.dogru(p.cekli === true, "ceke gecildi");
  G.dogru(p.tavan > nakitTavan, "cekte musteri ustune fark veriyor");
  G.dogru(p.karsi >= p.tavan * 0.98, "cekte acilista neredeyse tavandan baslar");

  G.cek.nakdeDon(k.state);
  G.dogru(!p.cekli, "nakde donulebiliyor");
  G.esit(p.tavan, nakitTavan, "tavan eski haline donuyor");
});

G.test("cek sorgusu bedel karsiliginda riski acar", function () {
  var k = cekKur(2102, "yuksek");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  var oncekiKasa = k.state.kasa;

  var sonuc = G.cek.sorgula(k.state);
  G.dogru(!sonuc.hata, "sorgu yapilmali: " + sonuc.hata);
  G.esit(k.state.kasa, oncekiKasa - G.config.CEK_SORGU_BEDEL, "bedel dustu");
  G.dogru(k.musteri.cekSorgulandi === true, "sorgulandi isareti");
  G.esit(sonuc.risk, "yuksek", "risk donuyor");

  var ikinci = G.cek.sorgula(k.state);
  G.dogru(!!ikinci.hata, "ikinci kez sorgulanmaz");
});

G.test("cekle satista para kasaya girmez, cek listeye duser", function () {
  var k = cekKur(2103, "dusuk");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.cek.cekeCevir(k.state);
  var oncekiKasa = k.state.kasa;

  G.pazarlik.satisTeklif(k.state, p.tavan);
  var son = k.state.aktifPazarlik;
  if (son.sonuc !== "satildi") return;

  G.esit(k.state.kasa, oncekiKasa, "kasa degismemeli");
  G.esit(k.state.cekler.length, 1, "cek listede");
  G.esit(k.state.cekler[0].tutar, son.anlasmaFiyati, "cek tutari");
  G.esit(k.state.cekler[0].vadeGun, k.state.gun + k.musteri.cekVade, "vade gunu");
  G.esit(k.state.istatistik.cekAlinan, 1, "sayac");
  G.esit(k.state.stok.length, 0, "araba gitti");
});

G.test("vade gelince dusuk riskli cek tahsil edilir", function () {
  var k = cekKur(2104, "dusuk");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.cek.cekeCevir(k.state);
  G.pazarlik.satisTeklif(k.state, p.tavan);
  if (k.state.cekler.length === 0) return;

  var cek = k.state.cekler[0];
  var oncekiKasa = k.state.kasa;
  var tahsil = 0, yanan = 0;

  // dusuk riskte karsiliksiz %5: 40 denemede cogu tahsil olmali
  for (var i = 0; i < 40; i++) {
    var kopya = JSON.parse(JSON.stringify(k.state));
    kopya.gun = cek.vadeGun;
    kopya.sabahHaberleri = [];
    G.cek.vadeKontrol(kopya);
    if (kopya.kasa > oncekiKasa) tahsil++;
    else yanan++;
  }
  G.dogru(tahsil > yanan, "dusuk riskte cogunlukla tahsil edilmeli: " + tahsil + "/" + yanan);
});

G.test("karsiliksiz cek itibari dusurur ve icra takibi birakir", function () {
  var k = cekKur(2105, "yuksek");
  k.state.cekler.push({
    id: "c1", musteri: "Vedat", araba: "VW Golf 2018", tutar: 1000000, vergi: 50000,
    vadeGun: k.state.gun, risk: "yuksek", sorgulandi: true, aval: false, avalPayi: 0
  });
  var oncekiItibar = k.state.itibar;
  var oncekiKasa = k.state.kasa;

  // yuksek riskte karsiliksiz cikana kadar dene
  var yandi = false;
  for (var i = 0; i < 30 && !yandi; i++) {
    var kopya = JSON.parse(JSON.stringify(k.state));
    kopya.sabahHaberleri = [];
    G.cek.vadeKontrol(kopya);
    if (kopya.kasa === oncekiKasa && kopya.itibar < oncekiItibar) {
      yandi = true;
      G.dogru(kopya.sabahHaberleri.join(" ").indexOf("karşılıksız") !== -1,
        "sabah haberinde yazmali");
      G.esit(kopya.istatistik.cekYanan, 1, "sayac");
      var icraVar = false;
      for (var j = 0; j < kopya.bekleyenEtkiler.length; j++) {
        if (kopya.bekleyenEtkiler[j].tur === "icra") icraVar = true;
      }
      G.dogru(icraVar, "icra takibi birakilmali");
    }
  }
  G.dogru(yandi, "30 denemede yuksek riskli cek en az bir kez yanmali");
});

G.test("aval zarari yariya indirir, karsiliginda pay alir", function () {
  var k = cekKur(2106, "orta");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;

  G.cek.cekeCevir(k.state);
  var avalSonuc = G.cek.avalIste(k.state);
  G.dogru(!avalSonuc.hata, "aval alinmali: " + avalSonuc.hata);
  G.dogru(k.musteri.cekAval === true, "aval isareti");

  var oncekiKasa = k.state.kasa;
  G.pazarlik.satisTeklif(k.state, p.tavan);
  var son = k.state.aktifPazarlik;
  if (son.sonuc !== "satildi") return;

  var cek = k.state.cekler[0];
  G.dogru(cek.aval === true, "cekte aval isareti");
  G.dogru(cek.avalPayi > 0, "Riza payini aldi");
  G.esit(k.state.kasa, oncekiKasa - cek.avalPayi, "pay kasadan dustu");
});

G.test("sorgulanan yuksek riskli ceke Riza aval vermez", function () {
  var k = cekKur(2107, "yuksek");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.cek.sorgula(k.state);
  var sonuc = G.cek.avalIste(k.state);
  G.dogru(!!sonuc.hata, "yuksek riskli sorgulanmis ceke aval verilmemeli");
});

G.test("bekleyen cekler kayda giriyor ve net varligi sismiyor", function () {
  var k = cekKur(2108, "dusuk");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  G.cek.cekeCevir(k.state);
  var oncekiNet = G.durum.netVarlik(k.state);
  G.pazarlik.satisTeklif(k.state, p.tavan);
  if (k.state.cekler.length === 0) return;

  var yeniNet = G.durum.netVarlik(k.state);
  G.dogru(yeniNet < oncekiNet, "tahsil edilmemis cek net varliga sayilmamali");

  var geri = JSON.parse(JSON.stringify(k.state));
  G.esit(geri.cekler.length, 1, "cek kayitta");
  G.esit(geri.cekler[0].tutar, k.state.cekler[0].tutar, "tutar kayitta");
});

G.test("cek alinmazsa satis nakit olarak surer", function () {
  var k = cekKur(2109, "yuksek");
  var p = G.pazarlik.satisBaslat(k.state, k.musteri.id, "soyle", "nuri");
  if (p.bitti) return;
  var oncekiKasa = k.state.kasa;

  G.pazarlik.satisTeklif(k.state, p.tavan);     // ceke hic gecmeden sat
  var son = k.state.aktifPazarlik;
  if (son.sonuc !== "satildi") return;

  G.esit(k.state.cekler.length, 0, "cek olusmamali");
  G.dogru(k.state.kasa > oncekiKasa, "para pesin girmeli");
});


// ---------------------------------------------------------------- Adim 22: yetki belgesi

function belgeKur(tohum) {
  var s = G.durum.yeniOyun(tohum || 2200);
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  return s;
}

function sinavDogruCevapla(state) {
  var guvenlik = 0;
  while (state.sinav && !state.sinav.bitti && guvenlik++ < 20) {
    var soru = G.belge.suAnkiSoru(state);
    G.belge.cevapla(state, soru.tanim.dogru);
  }
}

G.test("sinav soru havuzu butun", function () {
  var havuz = G.belge.soruHavuzu();
  G.dogru(havuz.length >= G.config.SINAV_SORU * 2,
    "havuz sinav soru sayisinin en az iki kati olmali: " + havuz.length);
  var idler = {};
  for (var i = 0; i < havuz.length; i++) {
    var soru = havuz[i];
    G.dogru(!!soru.id && !idler[soru.id], "soru id tekil: " + soru.id);
    idler[soru.id] = 1;
    G.dogru(soru.siklar.length === 3, soru.id + ": uc sik olmali");
    G.dogru(soru.dogru >= 0 && soru.dogru < soru.siklar.length, soru.id + ": dogru sik gecerli");
    G.dogru(!!soru.aciklama, soru.id + ": aciklama yok");
  }
});

G.test("sinav harc ve aksiyon alir, sorulari kurar", function () {
  var s = belgeKur(2201);
  var oncekiKasa = s.kasa;
  var oncekiAksiyon = s.aksiyon;

  var sinav = G.belge.sinavBaslat(s, "drej");
  G.dogru(!sinav.hata, "sinav baslamali: " + sinav.hata);
  G.esit(s.kasa, oncekiKasa - G.config.SINAV_BEDEL, "harc dustu");
  G.esit(s.aksiyon, oncekiAksiyon - 1, "aksiyon gitti");
  G.esit(s.ekran, "sinav", "ekran sinav");
  G.esit(sinav.sorular.length, G.config.SINAV_SORU, "soru sayisi");
  G.esit(s.istatistik.sinavDenemesi, 1, "sayac");

  // Drej girdiyse her soruda bir sik elenmis olmali
  for (var i = 0; i < sinav.sorular.length; i++) {
    G.dogru(sinav.sorular[i].elenen >= 0, "Drej bir sik elemeli");
  }
});

G.test("Nuri girince sik elenmez", function () {
  var s = belgeKur(2202);
  var sinav = G.belge.sinavBaslat(s, "nuri");
  if (sinav.hata) return;
  for (var i = 0; i < sinav.sorular.length; i++) {
    G.esit(sinav.sorular[i].elenen, -1, "Nuri sik elemez");
  }
});

G.test("hepsini dogru cevaplayinca belge aliniyor", function () {
  var s = belgeKur(2203);
  var oncekiItibar = s.itibar;
  G.belge.sinavBaslat(s, "drej");
  sinavDogruCevapla(s);

  G.dogru(s.sinav.bitti, "sinav bitti");
  G.esit(s.sinav.puan, 100, "puan");
  G.dogru(s.sinav.gecti, "gecti");
  G.dogru(G.belge.belgeliMi(s), "belge alindi");
  G.esit(s.itibar, oncekiItibar + G.config.BELGE_ITIBAR, "itibar arttı");
  G.esit(s.istatistik.sinavGecti, 1, "sayac");

  G.belge.kapat(s);
  G.esit(s.ekran, "dukkan", "dukkana donuldu");
  G.dogru(!!G.belge.engel(s), "belge alininca tekrar sinava girilmez");
});

G.test("baraj altinda kalinca belge verilmiyor ve bekleme basliyor", function () {
  var s = belgeKur(2204);
  G.belge.sinavBaslat(s, "nuri");
  var guvenlik = 0;
  while (s.sinav && !s.sinav.bitti && guvenlik++ < 20) {
    var soru = G.belge.suAnkiSoru(s);
    var yanlis = soru.tanim.dogru === 0 ? 1 : 0;
    G.belge.cevapla(s, yanlis);
  }
  G.esit(s.sinav.puan, 0, "hepsi yanlis");
  G.dogru(!s.sinav.gecti, "kaldi");
  G.dogru(!G.belge.belgeliMi(s), "belge yok");
  G.dogru(!!G.belge.engel(s), "bekleme suresi basladi: " + G.belge.engel(s));

  s.gun += G.config.SINAV_BEKLEME;
  s.aksiyon = 3;
  s.sinav = null;
  s.ekran = "dukkan";
  G.dogru(G.belge.girebilirMi(s), "bekleme bitince tekrar girilebilir");
});

G.test("belgesiz satista denetim riski var, belgeliyken yok", function () {
  var s = belgeKur(2205);
  var araba = G.araba.ilanUret(s, "ilan", "durust");

  var denetimsiz = 0;
  for (var i = 0; i < 300; i++) {
    var kopya = belgeKur(2205 + i);
    kopya.gunNotlari = [];
    if (G.belge.denetimKontrol(kopya, araba)) denetimsiz++;
  }
  G.dogru(denetimsiz > 0, "belgesizken denetim cikmali (300 denemede): " + denetimsiz);

  var belgeli = belgeKur(2206);
  belgeli.belge.alindi = true;
  var cikti = 0;
  for (var j = 0; j < 300; j++) {
    if (G.belge.denetimKontrol(belgeli, araba)) cikti++;
  }
  G.esit(cikti, 0, "belgeliyken denetim olmamali");
});

G.test("denetim cezasi gecikmeli olarak kasadan dusuyor", function () {
  var s = belgeKur(2207);
  var araba = G.araba.ilanUret(s, "ilan", "durust");
  s.bekleyenEtkiler = [];
  var sonuc = null;
  for (var i = 0; i < 200 && !sonuc; i++) sonuc = G.belge.denetimKontrol(s, araba);
  if (!sonuc) return;

  G.esit(s.bekleyenEtkiler.length, 1, "gecikmeli etki birakildi");
  var etki = s.bekleyenEtkiler[0];
  G.esit(etki.tur, "denetim", "tur");
  G.esit(etki.etki.kasa, -G.config.BELGESIZ_CEZA, "ceza tutari");

  var oncekiKasa = s.kasa;
  s.gun = etki.gun;
  G.olaylar.bekleyenEtkileriIsle(s);
  G.esit(s.kasa, oncekiKasa - G.config.BELGESIZ_CEZA, "ceza kasadan dustu");
});

G.test("Ticaret Mudurlugu yazisi bir kez geliyor", function () {
  var s = belgeKur(2208);
  s.gun = G.config.BELGE_YAZI_GUN;
  s.sabahHaberleri = [];
  G.dogru(G.belge.yaziGeldiMi(s), "yazi gelmeli");
  G.dogru(s.sabahHaberleri.join(" ").indexOf("yetki belgesi") !== -1, "haberde yazmali");
  s.sabahHaberleri = [];
  G.dogru(!G.belge.yaziGeldiMi(s), "ikinci kez gelmez");
});

G.test("belge durumu kayda giriyor", function () {
  var s = belgeKur(2209);
  G.belge.sinavBaslat(s, "drej");
  sinavDogruCevapla(s);
  var geri = JSON.parse(JSON.stringify(s));
  G.dogru(geri.belge.alindi === true, "belge kayitta");
  G.esit(geri.belge.gun, s.gun, "alindigi gun kayitta");
});


G.test("govdenin fotografi yoksa en yakinina dusuyor", function () {
  G.esit(G.sahne.govdeYedegi("hatchback"), "sedan", "hatchback -> sedan");
  G.esit(G.sahne.govdeYedegi("suv"), "pickup", "suv -> pickup");
  G.esit(G.sahne.govdeYedegi("ticari"), "pickup", "ticari -> pickup");
  G.esit(G.sahne.govdeYedegi("sedan"), null, "sedanin yedegi yok");

  // Not: sedan.png baska bir testte "bulunamadi" olarak isaretleniyor,
  // o yuzden burada ticari -> pickup zinciri olculuyor.
  var cikti = G.sahne.ciz({
    mekan: "sanayi-avlu", kisiler: [],
    araba: { anahtar: "vw-caddy", govde: "ticari" }
  });
  G.dogru(cikti.indexOf("img/araba/vw-caddy.png") !== -1, "once modelin kendisi");
  G.dogru(cikti.indexOf("img/araba/ticari.png") !== -1, "sonra govde");
  G.dogru(cikti.indexOf("img/araba/pickup.png") !== -1, "en son yedek govde");
});


G.test("sifirlama kaydi siliyor ve birinci gune donuyor", function () {
  var s = G.durum.yeniOyun(1212);
  s.gun = 9;
  s.kasa = 123456;
  G.durum.kaydet();

  G.durum.kaydiSil();
  var yeni = G.durum.yeniOyun(null);
  G.esit(yeni.gun, 1, "birinci gun");
  G.esit(yeni.kasa, G.config.BASLANGIC_KASA, "kasa baslangic");
  G.esit(G.durum.yukle(), null, "kayit silinmis olmali");
});


// ---------------------------------------------------------------- Faz 2: kusur yuku ve itibar

G.test("kusur yuku: temiz araba sifir, agir hasar boyadan agir basar", function () {
  var state = sahteState();
  var temiz = bmwIlani(state);
  temiz.kusurlar.length = 0;
  G.esit(G.araba.kusurYuku(temiz), 0, "temiz arabanin yuku yok");

  var boyali = bmwIlani(state);
  boyali.kusurlar = [kusur("boya", "kaput", 26250, "normal")];
  var hasarli = bmwIlani(state);
  hasarli.kusurlar = [kusur("agirHasar", "", 437500, "normal")];

  G.dogru(G.araba.kusurYuku(boyali) > 0, "boya yuk uretir");
  G.dogru(G.araba.kusurYuku(hasarli) > G.araba.kusurYuku(boyali), "agir hasar daha agir");
  G.dogru(G.araba.kusurYuku(hasarli) <= 1, "yuk 1'i gecmez");
});

G.test("kusur yuku: kusur sayisi arttikca yuk artar ama 1'i gecmez", function () {
  var state = sahteState();
  var bir = bmwIlani(state);
  bir.kusurlar = [kusur("boya", "kaput", 26250, "normal")];
  var dort = bmwIlani(state);
  dort.kusurlar = [
    kusur("boya", "kaput", 26250, "normal"),
    kusur("boya", "tavan", 26250, "normal"),
    kusur("degisen", "sag on kapi", 52500, "normal"),
    kusur("motor", "", 140000, "normal")
  ];
  G.dogru(G.araba.kusurYuku(dort) > G.araba.kusurYuku(bir), "dort kusur bir kusurdan agir");
  G.dogru(G.araba.kusurYuku(dort) < 1, "carpimsal birikim 1'i gecmez");
});

G.test("kusur yuku: ortaya cikmamis kusur musteriyi urkutmez", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  araba.kusurlar = [kusur("motor", "", 140000, "gizli")];
  araba.kusurlar[0].ortayaCikti = false;
  G.esit(G.araba.kusurYuku(araba), 0, "bilinmeyen kusur yuk uretmez");
});

G.test("sorunlu arabaya ayni fiyat orani ile daha az musteri ugrar", function () {
  var state = sahteState();
  var temiz = bmwIlani(state);
  temiz.kusurlar.length = 0;
  temiz.ilanFiyati = G.araba.bilinenDeger(temiz);

  var sorunlu = bmwIlani(state);
  sorunlu.kusurlar = [
    kusur("boya", "kaput", 26250, "normal"),
    kusur("degisen", "sag on kapi", 52500, "normal"),
    kusur("motor", "", 140000, "normal")
  ];
  sorunlu.ilanFiyati = G.araba.bilinenDeger(sorunlu);   // ucuzlattik: oran ayni

  var pTemiz = G.musteri.gelmeOlasiligi(state, temiz);
  var pSorunlu = G.musteri.gelmeOlasiligi(state, sorunlu);
  G.dogru(pSorunlu < pTemiz, "ucuzlatmak sorunlu arabayi temiz araba kadar cekici yapmamali");
});

G.test("dusuk itibarda musteri ekspertizden vazgecmez", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  state.stok.push(araba);

  // Cekle odeyen musteri ayri bir mekanik: aceleci oldugu icin zaten ekspertiz istemiyor
  // (js/cek.js), itibar kuralı onu kapsamaz. Nakit musterileri sayiyoruz.
  state.itibar = 15;
  var atlayan = 0, nakit = 0;
  for (var i = 0; i < 60; i++) {
    var m = G.musteri.musteriUret(state, araba);
    if (m.odeme === "cek") continue;
    nakit++;
    if (m.ekspertizYok) atlayan++;
  }
  G.dogru(nakit > 20, "ornek yeterli olmali: " + nakit);
  G.esit(atlayan, 0, "itibar dusukken nakit musteri ekspertizi atlamaz");
});

G.test("kusur yuku ve dusuk itibar satis masasinda sabri yer", function () {
  function sabirOlc(itibar, kusurlar) {
    var state = sahteState();
    state.itibar = itibar;
    var araba = bmwIlani(state);
    araba.kusurlar = kusurlar;
    araba.alisFiyati = 1000000;
    araba.masraflar = 0;
    araba.ilanFiyati = 1500000;
    state.ilanlar.length = 0;
    state.stok.push(araba);
    state.musteriler.push({
      id: "m1", isim: "Test", tip: "pazarlikci", arabaId: "bmw",
      sabir: G.config.MUSTERI_TIPLERI.pazarlikci.sabir, gelisGunu: 1, ekspertizYok: true
    });
    return G.pazarlik.satisBaslat(state, "m1", "soyle", "drej").sabir;
  }

  var temizIyi = sabirOlc(50, []);
  var sorunluIyi = sabirOlc(50, [kusur("agirHasar", "", 437500, "normal")]);
  var temizKotu = sabirOlc(15, []);

  G.dogru(sorunluIyi < temizIyi, "sorunlu arabada sabir daha az");
  G.dogru(temizKotu < temizIyi, "dusuk itibarda sabir daha az");
  G.dogru(temizKotu >= G.config.SATIS_SABIR_MIN, "sabir tabanin altina inmez");
});

// ---------------------------------------------------------------- Faz 4: giris ve ogretici

G.test("ogretici sabit tohumla, affedici ilk ilanla ve rehber acik baslar", function () {
  var s = G.durum.tutorialBaslat();
  G.esit(s.tohum, G.config.TUTORIAL_TOHUM, "sabit tohum");
  G.dogru(G.durum.tutorialAktifMi(s), "ogretici aktif");
  G.dogru(s.rehber.acik, "rehber acik");
  G.esit(s.gun, 1, "birinci gun");

  var ilk = s.ilanlar[0];
  G.esit(ilk.saticiTipi, "durust", "ilk ilan durust saticidan");
  G.dogru(ilk.istenenFiyat < ilk.piyasaDegeri, "ilk ilan piyasanin altinda");
  for (var i = 0; i < ilk.kusurlar.length; i++) {
    G.esit(ilk.kusurlar[i].gorunurluk, "acik", "ogreticide gizli kusur olmaz");
  }
});

G.test("ogretici suresi dolunca biter, bitince hersey temizlenir", function () {
  var s = G.durum.tutorialBaslat();
  G.dogru(!G.durum.tutorialBittiMi(s), "ilk gun bitmis sayilmaz");
  s.gun = G.config.TUTORIAL_GUN + 1;
  G.dogru(G.durum.tutorialBittiMi(s), "sure dolunca biter");

  s.kasa = 1;
  s.itibar = 3;
  var yeni = G.durum.tutorialBitir();
  G.dogru(!G.durum.tutorialAktifMi(yeni), "ogretici kapandi");
  G.esit(yeni.gun, 1, "gercek oyun birinci gunden");
  G.esit(yeni.kasa, G.config.BASLANGIC_KASA, "ogreticideki kasa tasinmaz");
  G.esit(yeni.itibar, G.config.BASLANGIC_ITIBAR, "ogreticideki itibar tasinmaz");
});

G.test("hikaye ozeti ve karakter tanitimlari dolu", function () {
  var ozet = G.data.hikayeOzeti;
  G.dogru(!!ozet && ozet.satirlar.length >= 3, "hikaye ozeti olmali");
  G.dogru(ozet.hedefCumlesi.indexOf("7.500.000") !== -1, "hedef cumlesi hedefi soylemeli");

  var liste = G.data.karakterTanitim;
  G.dogru(liste.length >= 10, "en az on karakter tanitilmali");
  var ortak = 0;
  for (var i = 0; i < liste.length; i++) {
    G.dogru(!!liste[i].anahtar && !!liste[i].ad && !!liste[i].metin, "tanitim alanlari dolu olmali");
    if (liste[i].anahtar === "nuri" || liste[i].anahtar === "drej" || liste[i].anahtar === "kro") ortak++;
  }
  G.esit(ortak, 3, "uc ortak da tanitilmali");
});

// ---------------------------------------------------------------- Faz 6: supurge testleri

G.test("hicbir satici durumu bos replik vermez (persona olsa da olmasa da)", function () {
  var durumlar = ["acilis", "karsiTeklif", "ortasi", "koz", "hakaret", "agirHakaret",
                  "kabul", "kalkis", "kalkCagirdi", "kalkBitti", "geriDonus"];
  var tipler = ["durust", "abartici", "dolandirici"];
  var personalar = [null];
  for (var p in G.config.PERSONALAR) {
    if (G.config.PERSONALAR.hasOwnProperty(p)) personalar.push(p);
  }

  var bos = [];
  for (var t = 0; t < tipler.length; t++) {
    for (var pi = 0; pi < personalar.length; pi++) {
      var state = sahteState();
      var araba = bmwIlani(state);
      araba.saticiTipi = tipler[t];
      if (personalar[pi]) araba.persona = personalar[pi];
      else delete araba.persona;                  // eski kayitlarda persona alani yok
      for (var d = 0; d < durumlar.length; d++) {
        if (!G.pazarlik.saticiRepligi(araba, durumlar[d])) {
          bos.push(tipler[t] + "/" + (personalar[pi] || "personasiz") + "/" + durumlar[d]);
        }
      }
    }
  }
  G.esit(bos.length, 0, "bos replik: " + bos.join(", "));
});

G.test("persona alani olmayan eski kayit pazarligi cokertmez", function () {
  var state = sahteState();
  var araba = bmwIlani(state);
  delete araba.persona;                            // Faz 3 oncesi kayit taklidi
  var p = G.pazarlik.alisBaslat(state, "bmw", "nuri");
  G.dogru(p.sabir > 0, "pazarlik acilmali");
  G.dogru(!!p.replik.metin, "acilis repligi dolu olmali");

  var agir = Math.round(p.taban * 0.40 / 10000) * 10000;
  G.pazarlik.alisTeklif(state, agir);
  G.pazarlik.alisTeklif(state, agir);
  G.dogru(!!p.replik.metin, "agir hakarette bos baloncuk cikmamali");
  G.esit(G.araba.kusurYuku(araba) >= 0, true, "kusur yuku hesaplanabilmeli");
});


// ---------- piyasa trendleri (data/trendler.js, js/trend.js) ----------

function trendliState(trendId, govde, deger) {
  var state = sahteState();
  state.trend = { id: trendId, baslangicGun: 1, bitisGun: 5 };
  state.trendSayaci = 1;
  return {
    state: state,
    araba: { govde: govde, piyasaDegeri: deger === undefined ? 900000 : deger }
  };
}

G.test("trend secimi ana RNG akisini kaydirmaz", function () {
  var state = sahteState();
  state.tohum = 4242;
  G.rng.tohumla(777);
  var once = G.rng.durumAl();
  G.trend.trendSec(state);
  G.esit(G.rng.durumAl(), once, "yan akis ana durumu degistirmemeli");
  G.dogru(!!state.trend, "trend secilmis olmali");
});

G.test("trend suresi 4-5 gun, ust uste ayni trend gelmez", function () {
  for (var tohum = 1; tohum <= 40; tohum++) {
    var state = sahteState();
    state.tohum = tohum;
    var oncekiId = null;
    for (var tur = 0; tur < 8; tur++) {
      var oncekiBitis = state.trend ? state.trend.bitisGun : 0;
      state.gun = oncekiBitis + 1;
      G.trend.trendSec(state);
      var sure = state.trend.bitisGun - state.trend.baslangicGun + 1;
      G.dogru(sure >= G.config.TREND_SURE_MIN && sure <= G.config.TREND_SURE_MAKS,
        "sure 4-5 olmali, bulunan: " + sure);
      G.dogru(state.trend.id !== oncekiId, "ust uste ayni trend gelmemeli: " + state.trend.id);
      oncekiId = state.trend.id;
    }
  }
});

G.test("30 gunde en az 6 trend doner", function () {
  var state = sahteState();
  state.tohum = 99;
  var sayi = 0;
  for (var gun = 1; gun <= G.config.GUN_SAYISI; gun++) {
    state.gun = gun;
    if (G.trend.sabahKontrol(state)) sayi++;
  }
  G.dogru(sayi >= 6, "30 gunde en az 6 trend beklenir, bulunan: " + sayi);
});

G.test("trend gövdeye gore musteri gelme olasiligini oynatir", function () {
  // "insaat": artan ticari + pickup, azalan hatchback
  var artan = trendliState("insaat", "pickup");
  var azalan = trendliState("insaat", "hatchback");
  var ilgisiz = trendliState("insaat", "sedan");
  G.esit(G.trend.carpanlar(artan.state, artan.araba).gelme, G.config.TREND_GELME.artan);
  G.esit(G.trend.carpanlar(azalan.state, azalan.araba).gelme, G.config.TREND_GELME.azalan);
  G.esit(G.trend.carpanlar(ilgisiz.state, ilgisiz.araba).gelme, 1);
  G.esit(G.trend.yon(artan.state, artan.araba), 1);
  G.esit(G.trend.yon(azalan.state, azalan.araba), -1);
  G.esit(G.trend.yon(ilgisiz.state, ilgisiz.araba), 0);
});

G.test("segment bazli trend fiyata gore siniflandirir", function () {
  G.esit(G.trend.segmentAdi(400000), "ucuz");
  G.esit(G.trend.segmentAdi(900000), "orta");
  G.esit(G.trend.segmentAdi(1800000), "pahali");
  // "faiz": artan ucuz, azalan pahali — govdeye hic bakmaz
  var ucuz = trendliState("faiz", "sedan", 400000);
  var pahali = trendliState("faiz", "sedan", 1800000);
  G.esit(G.trend.carpanlar(ucuz.state, ucuz.araba).butce, G.config.TREND_BUTCE.artan);
  G.esit(G.trend.carpanlar(pahali.state, pahali.araba).butce, G.config.TREND_BUTCE.azalan);
});

G.test("gelmeOlasiligi trendi hesaba katar", function () {
  var kur = function (trendId) {
    var state = sahteState();
    var araba = bmwIlani(state);
    araba.govde = "sedan";
    araba.ilanFiyati = 1900000;
    if (trendId) {
      state.trend = { id: trendId, baslangicGun: 1, bitisGun: 5 };
      state.trendSayaci = 1;
    }
    return G.musteri.gelmeOlasiligi(state, araba);
  };
  var trendsiz = kur(null);
  var artan = kur("bayram");      // sedan + station artan
  var azalan = kur("benzin");     // sedan ne artan ne azalan -> degismemeli
  G.dogru(artan > trendsiz, "bayram trendinde sedana daha cok musteri gelmeli");
  G.esit(azalan, trendsiz, "ilgisiz trend olasiligi degistirmemeli");
});

G.test("trend alani olmayan eski kayit sabahi cokertmez", function () {
  var state = sahteState();
  delete state.trend;                              // trend oncesi kayit taklidi
  delete state.trendSayaci;
  var araba = bmwIlani(state);
  araba.govde = "hatchback";
  G.esit(G.trend.aktif(state), null, "trend yokken aktif null olmali");
  G.esit(G.trend.carpanlar(state, araba).gelme, 1, "trend yokken carpan 1 olmali");
  G.esit(G.trend.kalanGun(state), 0);
  var yeni = G.trend.sabahKontrol(state);
  G.dogru(!!yeni, "sabah kontrolu yeni trend secmeli");
  G.dogru(!!yeni.haber, "trendin haber cumlesi olmali");
});


// ---------- ses, gorsel ekspertiz semasi, grafik ve karne ----------

G.test("ses: Node ortaminda AudioContext olmadan sessizce calisir ve ac/kapa doner", function () {
  G.ses.tikla(); G.ses.para(); G.ses.zarar(); G.ses.damga(); G.ses.kapi(); G.ses.ekspertiz(); G.ses.kart();
  var ilk = G.ses.acikMi();
  G.esit(G.ses.degistir(), !ilk, "degistir durumu cevirmeli");
  G.esit(G.ses.ayarla(true), true, "ayarla true acmali");
});

G.test("ekspertizSema: gizli kusurlari asla sizdirmaz ve 11 parcayi cizer", function () {
  var gizli = {
    marka: "BMW", model: "3.20i", yil: 2019, ekspertizSeviyesi: "goz",
    kusurlar: [
      { tip: "sase", parca: "", ortayaCikti: false, etki: 500000 },
      { tip: "boya", parca: "kaput", ortayaCikti: false, etki: 25000 }
    ]
  };
  var html = G.ekspertizSema.ciz(gizli);
  G.dogru(html.indexOf("ŞASE HASARLI") === -1, "gizli sase sizmamali");
  G.dogru(html.indexOf("eks-boya") === -1, "gizli boya boyanmamali");
  for (var i = 0; i < G.config.PARCALAR.length; i++) {
    G.dogru(html.indexOf('data-parca="' + G.config.PARCALAR[i] + '"') !== -1,
      "parca eksik: " + G.config.PARCALAR[i]);
  }
});

G.test("ekspertizSema: boya ve degisen renkleri dogru, degisen boyaya baskin", function () {
  var araba = {
    marka: "Opel", model: "Corsa", yil: 2018, ekspertizSeviyesi: "premium",
    kusurlar: [
      { tip: "boya", parca: "kaput", ortayaCikti: true, etki: 15000 },
      { tip: "boya", parca: "sol on kapi", ortayaCikti: true, etki: 15000 },
      { tip: "degisen", parca: "sol on kapi", ortayaCikti: true, etki: 30000 },
      { tip: "tramer", parca: "", ortayaCikti: true, etki: 36000, tramerTutar: 60000 }
    ]
  };
  var html = G.ekspertizSema.ciz(araba);
  G.dogru(html.indexOf('class="eks-parca eks-boya" data-parca="kaput"') !== -1, "kaput boyali");
  G.dogru(html.indexOf('class="eks-parca eks-degisen" data-parca="sol on kapi"') !== -1, "kapi degisen");
  G.dogru(html.indexOf("TRAMER") !== -1, "tramer rozeti");
});

G.test("grafik ve karne: defterden 30 gunluk seri, vurgun, kazik ve unvan cikar", function () {
  var st = {
    gun: 30, tohum: 424299, itibar: 86,
    istatistik: { saklanan: 0, sefer: 1, takasYapilan: 0, konsinyeSatilan: 0, cekAlinan: 0, enIyiPazarlik: 90000 },
    defter: [
      { gun: 2,  tur: "satis", araba: "Fiat Egea 2020", kar: 120000 },
      { gun: 6,  tur: "satis", araba: "Fiat Egea 2021", kar: 210000 },
      { gun: 9,  tur: "hurda", araba: "Tofaş Şahin 1998", kar: -90000 },
      { gun: 14, tur: "satis", araba: "Renault Clio 2019", kar: 110000 },
      { gun: 18, tur: "satis", araba: "Toyota Corolla 2020", kar: 130000 },
      { gun: 24, tur: "satis", araba: "Honda Civic 2019", kar: 120000 }
    ]
  };
  var seri = G.grafik.seriCikar(st);
  G.esit(seri.noktalar.length, 31, "0..30 arasi 31 nokta");
  var r = G.karne.analizEt(st);
  G.esit(r.enIyi.kar, 210000, "en iyi vurgun");
  G.esit(r.enKotu.kar, -90000, "en kotu kazik");
  G.esit(r.favoriModel, "Fiat Egea", "favori model");
  G.esit(r.tarz.ad, "Temiz Esnaf", "unvan");
  var html = G.karne.ciz(st);
  G.dogru(html.indexOf("<svg") !== -1, "grafik svg icermeli");
  G.dogru(html.indexOf("#424299") !== -1, "tohum gorunmeli");
});
