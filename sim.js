// sim.js — denge simulatoru (Adim 11). Tarayicida calismaz, dev araci:
//
//     node sim.js            → her bot icin 100 oyun
//     node sim.js 300        → her bot icin 300 oyun
//     node sim.js 100 akilli → sadece bir bot
//
// Botlar oyunun kendi modullerini cagirir (DOM yok). Amac: config.js'teki
// sayilarin oyunu nasil cevirdigini olcmek. Hedefler (tasarim/09, Adim 11):
//   - akilli bot %60-70 kazanir
//   - saf bot cogunlukla kaybeder
//   - hepSakla, hepSoyle'den daha kotu durur
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const KOK = __dirname;
const DOSYALAR = [
  "js/config.js", "js/rng.js", "js/yardimci.js",
  "data/modeller.js", "data/replikler.js", "data/kartlar.js", "data/rehber.js", "data/hikaye.js", "data/sefer.js", "data/sinav.js", "data/trendler.js",
  "js/araba.js", "js/ekspertiz.js", "js/karakterler.js",
  "js/pazarlik.js", "js/musteri.js", "js/olaylar.js", "js/sahne.js", "js/diyalog.js",
  "js/hikaye.js", "js/trend.js", "js/sefer.js", "js/konsinye.js", "js/takas.js", "js/cek.js", "js/belge.js", "js/rehber.js", "js/gun.js", "js/state.js"
];

function oyunuYukle() {
  const ctx = vm.createContext({ console, Math, Date, JSON, parseInt, parseFloat, isNaN });
  ctx.window = ctx;
  ctx.localStorage = null;
  for (const d of DOSYALAR) {
    const yol = path.join(KOK, d);
    if (!fs.existsSync(yol)) throw new Error("dosya yok: " + d);
    vm.runInContext(fs.readFileSync(yol, "utf8"), ctx, { filename: d });
  }
  return ctx.G;
}

const G = oyunuYukle();
const C = G.config;

// ---------------------------------------------------------------- yardimcilar

function stoktakiMusteri(state) {
  for (const m of state.musteriler) {
    for (const a of state.stok) if (a.id === m.arabaId) return m;
  }
  return null;
}

function ilanSupheli(ilan) {
  // Goz kontrolu sonrasi: iddia abartiliysa ya da ortaya cikmamis kusur ihtimali varsa
  if (ilan.saticiTipi && ilan.saticiTipi !== "durust") return true;
  for (const k of ilan.kusurlar) if (!k.ortayaCikti) return true;
  return false;
}

// ---------------------------------------------------------------- bot tanimlari

const BOTLAR = {
  // Fiyati bilir, supheli arabaya ekspertiz yaptirir, kusuru soyler
  akilli: {
    ad: "akıllı",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,   // kar musterinin tavanindan cikar
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8
  },
  // Hic bakmadan alir, istenen fiyati verir, ucuza satar
  saf: {
    ad: "saf",
    trendGormez: true,
    ekspertiz: () => null,
    alisTavani: (deger) => deger * 1.15,   // bakmadan alir, fazla verir
    ilanCarpani: 1.02,
    durustluk: () => (G.rng.sans(0.5) ? "soyle" : "sakla"),
    kartSecimi: (state, kart) => (kart.secenekler.length > 1 ? 1 : 0),
    satisSabri: 1,
    kozOynar: false,
    yetenekKullanir: false,
    enUcuzuSecer: true
  },
  // Sinava hic girmeyen: belgesiz satisin bedelini olcer
  belgesiz: {
    ad: "belgesiz",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: false
  },
  // Ceki sorgulamadan kabul eden: Kemal'e yem olan oyuncu
  cekci: {
    ad: "cekci (kör)",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8,
    cekHepAlir: true
  },
  // Ceki sorgulayip sadece dusuk riskliyi alan
  cekSorgulayan: {
    ad: "çek sorgular",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8,
    cekSorgular: true,
    avalIster: true
  },
  // Akilli oynar, ustune musterinin takas teklifini degerlendirir
  takasci: {
    ad: "takasci",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8,
    takasAlir: true,
    takasEnAzKar: 60000
  },
  // Akilli oynar, ustune konsinye teklifi gelirse kabul eder
  konsinyeci: {
    ad: "konsinyeci",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8,
    konsinyeAlir: true,
    konsinyeHepAlir: true,
    konsinyeKasaEsigi: 1500000,
    konsinyeEnAzKomisyon: 25000
  },
  // Akilli oynar, ustune firsat buldukca sehir disina cikar
  seferci: {
    ad: "seferci",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8,
    sefereCikar: true
  },
  // Akilli oynar ama sadece ucuz arabaya gider: cesitlilik ise yariyor mu, onu olcer
  ucuzcu: {
    ad: "ucuzcu",
    trendGormez: true,
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 300000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8,
    enCokDeger: 700000,
    konsinyeAlir: true,
    konsinyeKasaEsigi: 99000000,
    konsinyeEnAzKomisyon: 20000
  },
  // Akilli ama kusuru hep saklar
  hepSakla: {
    ad: "hep sakla",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "sakla",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8
  },
  // Akilli ama kusuru hep soyler
  hepSoyle: {
    ad: "hep söyle",
    ekspertiz: (state, ilan) => (ilanSupheli(ilan) && state.kasa > 500000 ? "normal" : null),
    alisTavani: (deger) => deger * 0.99,
    ilanCarpani: 1.10,
    durustluk: () => "soyle",
    kartSecimi: () => 0,
    satisSabri: 3,
    kozOynar: true,
    yetenekKullanir: true,
    sonAlimGunu: 3,
    sinavaGirer: true,
    sinavBilgi: 0.8
  }
};

const sayac = { ekspertiz: 0, ekspertizAdet: 0 };

// Bir ilandan beklenen kar: deger x (segment carpani - alis orani).
// Oyuncu da bunu birkac gun oynayinca ogrenir: ucuz araba yuzdesel, pahali araba mutlak kazandirir.
function beklenenKar(ilan) {
  const deger = G.araba.bilinenDeger(ilan);
  return deger * (G.pazarlik.segmentCarpani(ilan.piyasaDegeri) - 0.99);
}

// ---------------------------------------------------------------- aksiyonlar

function konusanSec(state) {
  return G.karakterler.nuriYokMu(state) ? "drej" : "nuri";
}

// Seferdeyken sehirdeki ilanlardan alir; dondugunde gun biter
function seferGunu(state, bot) {
  const sefer = state.sefer;
  if (!sefer) return;
  if (sefer.ilanlar.length && state.kasa > 60000) G.sefer.yemek(state);
  if (state.diyalog) diyaloguGec(state);

  let guvenlik = 0;
  while (sefer.kalanPazarlik > 0 && sefer.ilanlar.length && guvenlik++ < 8) {
    const ilan = sefer.ilanlar
      .filter((i) => sefer.gezilen.indexOf(i.id) === -1)
      .filter((i) => i.istenenFiyat < state.kasa * 0.75)
      .sort((a, b) => beklenenKar(b) - beklenenKar(a))[0];
    if (!ilan) break;
    if (!arabaAl(state, bot, ilan)) break;
  }
  G.sefer.don(state);
}

function arabaAl(state, bot, hazirIlan) {
  if (state.stok.length >= 4) return false;
  if (!hazirIlan && !state.ilanlar.length) return false;
  // Son gunlerde alinan araba satilamadan kalir, stok net varligi kirpilmis sayilir
  if (bot.sonAlimGunu && state.gun > C.GUN_SAYISI - bot.sonAlimGunu) return false;

  // Bir gunde sayili aksiyon var: ucuz arabanin marji da kucuk olur.
  // O yuzden kasanin dayandigi ilanlar arasindan en degerlisi secilir (Adim 17).
  // Piyasa trendi: revacta olan gövde daha hizli ve biraz daha pahaliya gidiyor,
  // o yuzden analiz yapan botlar ilan secerken trende de bakiyor. Hic analiz
  // yapmayan saf bot ve "hep en ucuzu" diyen ucuzcu bunu gormez.
  const trendAgirlik = (ilan) => {
    if (bot.trendGormez) return 1;
    // Trend bir esitlik bozucu, "daha kotu arabayi al" sebebi degil. Olculdu:
    // 1.5 agirlikla bot trend ugruna daha karli ilani feda edip %68'den %63'e
    // dusuyor; 1.15'te ise secimi hic degismiyor. Dogru yer ikisinin arasi.
    const y = G.trend.yon(state, ilan);
    return y > 0 ? 1.06 : (y < 0 ? 0.95 : 1);
  };
  const adaylar = (hazirIlan ? [hazirIlan] : state.ilanlar)
    .filter((i) => state.bugunGezilen.indexOf(i.id) === -1)
    .filter((i) => i.istenenFiyat < state.kasa * 0.75)
    .filter((i) => !bot.enCokDeger || G.araba.bilinenDeger(i) <= bot.enCokDeger)
    .sort((a, b) => beklenenKar(b) * trendAgirlik(b) - beklenenKar(a) * trendAgirlik(a));
  const ilan = bot.enUcuzuSecer ? adaylar[adaylar.length - 1] : adaylar[0];
  if (!ilan) return false;

  const sonuc = G.sefer.acikMi(state)
    ? G.sefer.ilanaGit(state, ilan.id)
    : G.gun.ilanaGit(state, ilan.id);
  if (sonuc && sonuc.hata) return false;
  G.ekspertiz.gozKontrol(ilan);

  // Ekspertiz parayi yiyor: sadece alinmaya deger gorunen ilana yaptir
  const degerli = ilan.istenenFiyat <= G.araba.bilinenDeger(ilan) * 1.08;
  // Konsinye: sermaye baglamadan tezgaha araba koyar (Adim 19)
  if (bot.konsinyeAlir && G.konsinye.teklifVarMi(ilan)) {
    const net = G.konsinye.netHesapla(ilan);
    const beklenenSatis = G.araba.bilinenDeger(ilan) *
      G.pazarlik.segmentCarpani(ilan.piyasaDegeri);
    const kasaDar = state.kasa < bot.konsinyeKasaEsigi;
    if (beklenenSatis - net > bot.konsinyeEnAzKomisyon && (kasaDar || bot.konsinyeHepAlir)) {
      const sonuc = G.konsinye.kabulEt(state, ilan.id);
      if (sonuc && !sonuc.hata) return true;
    }
  }

  const seviye = degerli ? bot.ekspertiz(state, ilan) : null;
  if (seviye) {
    const oncekiKasa = state.kasa;
    G.ekspertiz.ekspertizYap(state, ilan, seviye);
    sayac.ekspertiz += oncekiKasa - state.kasa;
    sayac.ekspertizAdet++;
  }

  const deger = G.araba.bilinenDeger(ilan);
  const tavan = bot.alisTavani(deger);

  let p = G.pazarlik.alisBaslat(state, ilan.id, konusanSec(state));
  if (!p || p.hata) return false;
  if (ilan.pazarliksiz) {
    if (ilan.istenenFiyat <= tavan) G.pazarlik.dogrudanAl(state, ilan.id);
    else G.pazarlik.vazgec(state);
    state.aktifPazarlik = null;
    return true;
  }

  // Nuri'nin agzi: alista taban -%3 (sinirlenme riski var)
  if (bot.yetenekKullanir && state.aktifPazarlik && !state.aktifPazarlik.bitti) {
    G.pazarlik.yetenekKullan(state);
  }

  // Ortaya cikmis kusurlari koz olarak oyna: satici tabani duser (tasarim/03 §3)
  if (bot.kozOynar) {
    const oynanan = {};
    for (const k of ilan.kusurlar) {
      if (!k.ortayaCikti || oynanan[k.tip]) continue;
      oynanan[k.tip] = 1;
      const sonuc = G.pazarlik.kozKullan(state, k.tip);
      if (!sonuc || sonuc.hata || sonuc.bitti) break;
      if (state.aktifPazarlik && state.aktifPazarlik.sabir <= 1) break;   // sabri tuketme
    }
  }

  // Satici tabani bilinmez: dusukten basla, her turda biraz yukari cik, tavani asma
  const merdiven = [0.88, 0.93, 0.965, 0.99];
  for (let tur = 0; tur < merdiven.length; tur++) {
    p = state.aktifPazarlik;
    if (!p || p.bitti) break;

    if (p.ortaTeklif) {
      if (p.ortaTeklif <= tavan) G.pazarlik.ortasiKabul(state);
      else G.pazarlik.ortasiRed(state);
      continue;
    }
    if (p.karsi <= tavan) {              // istedigi fiyat zaten sinirin altinda
      G.pazarlik.alisTeklif(state, p.karsi);
      break;
    }
    G.pazarlik.alisTeklif(state, Math.min(tavan, tavan * merdiven[tur]));
  }

  p = state.aktifPazarlik;
  if (p && !p.bitti) G.pazarlik.vazgec(state);
  state.aktifPazarlik = null;
  state.acikArabaId = null;
  return true;
}

function fiyatlandir(state, bot) {
  for (const araba of state.stok) {
    if (araba.ilanFiyati) continue;
    araba.ilanFiyati = G.yuvarla(G.araba.bilinenDeger(araba) * bot.ilanCarpani, C.TEKLIF_ADIMI);
  }
}

function arabaSat(state, bot) {
  const musteri = stoktakiMusteri(state);
  if (!musteri) return false;
  if (state.aksiyon < 1) return false;
  state.aksiyon--;

  const araba = G.pazarlik.arabaBul(state, musteri.arabaId);
  if (!araba) return false;

  let p = G.pazarlik.satisBaslat(state, musteri.id, bot.durustluk(), konusanSec(state));
  if (!p || p.hata) return false;

  if (bot.yetenekKullanir && state.aktifPazarlik && !state.aktifPazarlik.bitti) {
    G.pazarlik.yetenekKullan(state);     // satista tavan +%3
  }

  // Cek: teklifi degerlendir (Adim 21). Almazsak satis nakit olarak surer.
  if (G.cek.teklifVarMi(musteri) && state.aktifPazarlik && !state.aktifPazarlik.bitti) {
    if (bot.cekSorgular && state.kasa > 200000) G.cek.sorgula(state);
    const risk = musteri.cekSorgulandi ? musteri.cekRiski : "bilinmiyor";
    // Vadesi 30. gunu asan cek hic tahsil edilmez; oyuncu da bunu ekranda goruyor
    const vadeyeYetisir = state.gun + musteri.cekVade <= G.config.GUN_SAYISI;
    const kabul = vadeyeYetisir && (bot.cekHepAlir ||
      (bot.cekSorgular && (risk === "dusuk" || (risk === "orta" && bot.cekOrtayiAlir))));
    if (kabul) {
      G.cek.cekeCevir(state);
      if (bot.avalIster) G.cek.avalIste(state);
    }
  }

  // Takas: musterinin arabasina deger bicmek (Adim 20). Once ekspertiz, sonra karar.
  if (bot.takasAlir && G.takas.teklifVarMi(musteri) && state.stok.length < G.config.KAPASITE) {
    const takasArabasi = musteri.takasArabasi;
    if (state.kasa > 400000) G.ekspertiz.ekspertizYap(state, takasArabasi, "normal");
    const deger = G.araba.bilinenDeger(takasArabasi);
    const beklenti = G.takas.beklenti(takasArabasi);
    const satilabilir = deger * G.pazarlik.segmentCarpani(takasArabasi.piyasaDegeri);
    // Beklentiyi ancak satistan cikacak para karsiliyorsa kabul et
    if (beklenti <= satilabilir - bot.takasEnAzKar) G.takas.kabulEt(state, beklenti);
    else G.takas.vazgec(state);
  }

  // Musterinin acilis rakami tavanin ~%92'si; tavani zorlayip adim adim in
  const merdiven = [1.08, 1.04, 1.01];
  for (let tur = 0; tur < Math.min(bot.satisSabri, merdiven.length); tur++) {
    p = state.aktifPazarlik;
    if (!p || p.bitti) break;
    G.pazarlik.satisTeklif(state, p.karsi * merdiven[tur]);
  }

  p = state.aktifPazarlik;
  if (p && !p.bitti) G.pazarlik.satisTeklif(state, p.karsi);   // masadakine razi ol
  if (state.aktifPazarlik && !state.aktifPazarlik.bitti) G.pazarlik.vazgec(state);
  state.aktifPazarlik = null;
  state.acikMusteriId = null;
  return true;
}

// ---------------------------------------------------------------- gun dongusu

function diyaloguGec(state) {
  let guvenlik = 0;
  while (state.diyalog && guvenlik++ < 40) {
    const hikayeydi = state.diyalog.kaynak === "hikaye";
    G.diyalog.ilerle(state);
    if (hikayeydi && !G.diyalog.acikMi(state)) {
      G.hikaye.bitir(state);
      G.olaylar.kartDiyalogunuKur(state);
    }
  }
}

function gunuOyna(state, bot) {
  diyaloguGec(state);

  if (state.aktifKart) {
    const kart = G.olaylar.aktifKartTanimi(state);
    const sira = kart ? bot.kartSecimi(state, kart) % kart.secenekler.length : 0;
    G.olaylar.secenekSec(state, sira);
  }
  if (G.gun.oyunBittiMi(state)) return;

  fiyatlandir(state, bot);

  // Yetki belgesi: sinava gir (Adim 22). Bot soru havuzunu bilmiyor, bilgi
  // seviyesine gore dogru cevap veriyor: Drej'in elemesi sansi yukseltiyor.
  if (bot.sinavaGirer && !G.belge.belgeliMi(state) && G.belge.girebilirMi(state)) {
    const kim = bot.sinavKim || "drej";
    const sinav = G.belge.sinavBaslat(state, kim);
    if (sinav && !sinav.hata) {
      let guvenlik = 0;
      while (state.sinav && !state.sinav.bitti && guvenlik++ < 20) {
        const soru = G.belge.suAnkiSoru(state);
        const siklar = [];
        for (let i = 0; i < soru.tanim.siklar.length; i++) {
          if (i !== soru.elenen) siklar.push(i);
        }
        // bot.sinavBilgi olasilikla dogruyu bilir, bilemezse kalanlardan secer
        const cevap = G.rng.sans(bot.sinavBilgi) ? soru.tanim.dogru : G.rng.sec(siklar);
        G.belge.cevapla(state, cevap);
      }
      G.belge.kapat(state);
    }
  }

  // Sefer karari: kosullar uygunsa ve bot seferciyse yola cik (gunu yer)
  if (bot.sefereCikar && G.sefer.gidebilirMi(state)) {
    const sehirler = G.sefer.secenekler(state);
    const sehir = sehirler[sehirler.length - 1];        // en uzak = en ucuz ilanlar
    const basladi = G.sefer.baslat(state, sehir.id);
    if (basladi && !basladi.hata) {
      seferGunu(state, bot);
      fiyatlandir(state, bot);
      G.gun.gunuBitir(state);
      if (G.gun.oyunBittiMi(state)) return;
      G.gun.raporKapat(state);
      G.gun.sizceSec(state, 0);
      return;
    }
  }

  let guvenlik = 0;
  while (state.aksiyon > 0 && !G.gun.oyunBittiMi(state) && guvenlik++ < 12) {
    if (arabaSat(state, bot)) { fiyatlandir(state, bot); continue; }
    if (arabaAl(state, bot)) { fiyatlandir(state, bot); continue; }
    break;
  }
  if (G.gun.oyunBittiMi(state)) return;

  G.gun.gunuBitir(state);
  if (G.gun.oyunBittiMi(state)) return;
  G.gun.raporKapat(state);
  G.gun.sizceSec(state, 0);
}

function oyunOyna(tohum, bot) {
  const state = G.durum.yeniOyun(tohum);
  let guvenlik = 0;
  while (!G.gun.oyunBittiMi(state) && guvenlik++ < 60) gunuOyna(state, bot);
  const b = state.bitis || { kazandi: false, netVarlik: G.durum.netVarlik(state), tur: "takildi" };
  return {
    kazandi: !!b.kazandi,
    netVarlik: b.netVarlik,
    tur: b.tur,
    gun: state.gun,
    itibar: state.itibar,
    satilan: state.istatistik.satilan,
    alinan: state.istatistik.alinan,
    sefer: state.istatistik.sefer,
    konsinye: state.istatistik.konsinyeSatilan,
    takas: state.istatistik.takasYapilan,
    cek: state.istatistik.cekAlinan,
    cekYanan: state.istatistik.cekYanan,
    denetim: state.istatistik.denetim,
    belge: state.belge.alindi ? 1 : 0,
    yakalanan: state.istatistik.yakalanan
  };
}

// ---------------------------------------------------------------- rapor

function ortalama(dizi) { return dizi.reduce((t, s) => t + s, 0) / (dizi.length || 1); }

function medyan(dizi) {
  const s = dizi.slice().sort((a, b) => a - b);
  const o = Math.floor(s.length / 2);
  return s.length % 2 ? s[o] : (s[o - 1] + s[o]) / 2;
}

function tl(sayi) {
  return Math.round(sayi).toLocaleString("tr-TR");
}

function botuOlc(anahtar, adet) {
  const bot = BOTLAR[anahtar];
  const sonuclar = [];
  for (let i = 0; i < adet; i++) sonuclar.push(oyunOyna(1000 + i, bot));

  const net = sonuclar.map((s) => s.netVarlik);
  const kazanan = sonuclar.filter((s) => s.kazandi).length;
  const batan = sonuclar.filter((s) => s.tur === "batti").length;
  const itibarsiz = sonuclar.filter((s) => s.tur === "itibarsiz").length;
  const takilan = sonuclar.filter((s) => s.tur === "takildi").length;

  return {
    anahtar,
    ad: bot.ad,
    adet,
    kazanmaYuzdesi: (100 * kazanan) / adet,
    ortalamaNet: ortalama(net),
    medyanNet: medyan(net),
    batan, itibarsiz, takilan,
    ortalamaSatis: ortalama(sonuclar.map((s) => s.satilan)),
    ortalamaAlis: ortalama(sonuclar.map((s) => s.alinan)),
    ortalamaItibar: ortalama(sonuclar.map((s) => s.itibar)),
    ortalamaYakalanan: ortalama(sonuclar.map((s) => s.yakalanan)),
    ortalamaSefer: ortalama(sonuclar.map((s) => s.sefer)),
    ortalamaKonsinye: ortalama(sonuclar.map((s) => s.konsinye)),
    ortalamaTakas: ortalama(sonuclar.map((s) => s.takas)),
    ortalamaCek: ortalama(sonuclar.map((s) => s.cek)),
    ortalamaCekYanan: ortalama(sonuclar.map((s) => s.cekYanan)),
    ortalamaDenetim: ortalama(sonuclar.map((s) => s.denetim)),
    belgeOrani: ortalama(sonuclar.map((s) => s.belge))
  };
}

function satirYaz(r) {
  console.log(
    r.ad.padEnd(11) +
    (r.kazanmaYuzdesi.toFixed(0) + "%").padStart(6) +
    tl(r.ortalamaNet).padStart(13) +
    tl(r.medyanNet).padStart(13) +
    String(r.batan).padStart(7) +
    String(r.itibarsiz).padStart(10) +
    r.ortalamaAlis.toFixed(1).padStart(7) +
    r.ortalamaSatis.toFixed(1).padStart(7) +
    r.ortalamaItibar.toFixed(0).padStart(8) +
    r.ortalamaYakalanan.toFixed(2).padStart(10) +
    r.ortalamaSefer.toFixed(1).padStart(7) +
    r.ortalamaKonsinye.toFixed(1).padStart(10) +
    r.ortalamaTakas.toFixed(1).padStart(8) +
    r.ortalamaCek.toFixed(1).padStart(6) +
    r.ortalamaCekYanan.toFixed(1).padStart(7) +
    ("%" + Math.round(r.belgeOrani * 100)).padStart(7) +
    r.ortalamaDenetim.toFixed(1).padStart(9)
  );
}

// node sim.js 1 akilli --iz  → tek oyunun defterini dokar
function izSur(anahtar, tohum) {
  const bot = BOTLAR[anahtar];
  const state = G.durum.yeniOyun(tohum);
  let guvenlik = 0;
  while (!G.gun.oyunBittiMi(state) && guvenlik++ < 60) gunuOyna(state, bot);
  console.log("bot: " + bot.ad + "   tohum: " + tohum);
  let alis = 0, satis = 0, kar = 0;
  for (const k of state.defter) {
    if (k.tur === "alis") alis += k.fiyat + (k.masraf || 0);
    else { satis += k.fiyat; kar += k.kar || 0; }
    console.log("  gun " + String(k.gun).padStart(2) + "  " + k.tur.padEnd(7) +
      (k.araba || "").padEnd(22) + tl(k.fiyat).padStart(12) +
      (k.kar !== undefined ? ("   kar " + tl(k.kar).padStart(10)) : ""));
  }
  console.log("");
  console.log("  alis toplami : " + tl(alis));
  console.log("  satis toplami: " + tl(satis));
  console.log("  defter kari  : " + tl(kar));
  console.log("  sabit gider  : " + tl(C.SABIT_GIDER * (state.gun - 1)));
  console.log("  ekspertiz    : " + tl(sayac.ekspertiz) + " (" + sayac.ekspertizAdet + " kez)");
  console.log("  net varlik   : " + tl(G.durum.netVarlik(state)) +
    "   (hedef " + tl(C.HEDEF_NET_VARLIK) + ")");
  console.log("  stok: " + state.stok.length + "   itibar: " + state.itibar);
}

function main() {
  if (process.argv.indexOf("--iz") !== -1) {
    izSur(process.argv[3] || "akilli", parseInt(process.argv[2], 10) || 1000);
    return;
  }
  const adet = parseInt(process.argv[2], 10) || 100;
  const istenen = process.argv[3];
  const anahtarlar = istenen ? [istenen] : Object.keys(BOTLAR);

  console.log("Galerici Ortaklar — denge simulasyonu");
  console.log("hedef net varlik: " + tl(C.HEDEF_NET_VARLIK) +
    " TL   baslangic: " + tl(C.BASLANGIC_KASA) + " TL   oyun basi: " + adet + "\n");
  console.log("bot".padEnd(11) + "kazan".padStart(6) + "ort.net".padStart(13) +
    "medyan".padStart(13) + "batan".padStart(7) + "itibarsiz".padStart(10) +
    "alis".padStart(7) + "satis".padStart(7) + "itibar".padStart(8) + "yakalanan".padStart(10) +
    "sefer".padStart(7) + "konsinye".padStart(10) + "takas".padStart(8) +
    "cek".padStart(6) + "yanan".padStart(7) + "belge".padStart(7) + "denetim".padStart(9));
  console.log("-".repeat(146));

  const hepsi = {};
  for (const a of anahtarlar) {
    if (!BOTLAR[a]) { console.log("bilinmeyen bot: " + a); continue; }
    hepsi[a] = botuOlc(a, adet);
    satirYaz(hepsi[a]);
  }

  if (hepsi.akilli && hepsi.saf && hepsi.hepSakla && hepsi.hepSoyle) {
    console.log("\nhedef kontrolu:");
    const k = hepsi.akilli.kazanmaYuzdesi;
    console.log("  akilli bot %60-70 kazanmali      -> %" + k.toFixed(0) +
      (k >= 60 && k <= 70 ? "  TUTUYOR" : "  TUTMUYOR"));
    console.log("  saf bot cogunlukla kaybetmeli    -> %" + hepsi.saf.kazanmaYuzdesi.toFixed(0) +
      (hepsi.saf.kazanmaYuzdesi < 35 ? "  TUTUYOR" : "  TUTMUYOR"));
    if (hepsi.seferci) {
      const fark = Math.abs(hepsi.seferci.kazanmaYuzdesi - hepsi.akilli.kazanmaYuzdesi);
      console.log("  seferci ile akilli arasi <= 10   -> %" + fark.toFixed(0) +
        (fark <= 10 ? "  TUTUYOR" : "  TUTMUYOR"));
    }
    if (hepsi.konsinyeci) {
      const fark = Math.abs(hepsi.konsinyeci.kazanmaYuzdesi - hepsi.akilli.kazanmaYuzdesi);
      console.log("  konsinyeci ile akilli arasi <=10 -> %" + fark.toFixed(0) +
        (fark <= 10 ? "  TUTUYOR" : "  TUTMUYOR"));
    }
    if (hepsi.takasci) {
      const fark = Math.abs(hepsi.takasci.kazanmaYuzdesi - hepsi.akilli.kazanmaYuzdesi);
      console.log("  takasci ile akilli arasi <= 10   -> %" + fark.toFixed(0) +
        (fark <= 10 ? "  TUTUYOR" : "  TUTMUYOR"));
    }
    if (hepsi.cekci && hepsi.cekSorgulayan) {
      console.log("  kor cekci < sorgulayan           -> " +
        tl(hepsi.cekci.ortalamaNet) + " / " + tl(hepsi.cekSorgulayan.ortalamaNet) +
        (hepsi.cekci.ortalamaNet < hepsi.cekSorgulayan.ortalamaNet ? "  TUTUYOR" : "  TUTMUYOR"));
      const fark = Math.abs(hepsi.cekSorgulayan.kazanmaYuzdesi - hepsi.akilli.kazanmaYuzdesi);
      console.log("  sorgulayan ile akilli arasi <=10 -> %" + fark.toFixed(0) +
        (fark <= 10 ? "  TUTUYOR" : "  TUTMUYOR"));
    }
    if (hepsi.belgesiz) {
      console.log("  belgesiz < akilli                -> " +
        tl(hepsi.belgesiz.ortalamaNet) + " / " + tl(hepsi.akilli.ortalamaNet) +
        (hepsi.belgesiz.ortalamaNet < hepsi.akilli.ortalamaNet ? "  TUTUYOR" : "  TUTMUYOR"));
    }
    console.log("  hepSakla < hepSoyle              -> " +
      tl(hepsi.hepSakla.ortalamaNet) + " / " + tl(hepsi.hepSoyle.ortalamaNet) +
      (hepsi.hepSakla.ortalamaNet < hepsi.hepSoyle.ortalamaNet ? "  TUTUYOR" : "  TUTMUYOR"));
  }
}

main();
