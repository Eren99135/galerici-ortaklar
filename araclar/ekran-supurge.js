// ekran-supurge.js — her ekrani sirayla cizdirip cokme, bos govde, "undefined" ve "NaN" arar.
// Kullanim: node araclar/ekran-supurge.js
//
// oyna.js oyunu gercek akisiyla oynar ama bazi ekranlara hic ugramaz; bu betik ekran
// listesini kodun kendisinden degil elle tutar, yani yeni bir ekran eklendiginde
// EKRANLAR dizisine de eklenmeli. Durumu kurulamayan ekran ekranDukkan'a duser,
// bu beklenen davranis: cokmedigini dogruluyoruz.
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const KOK = path.dirname(__dirname);   // araclar/ -> proje koku

let kayitliHtml = "";
const kap = {
  set innerHTML(v) { kayitliHtml = v; },
  get innerHTML() { return kayitliHtml; },
  addEventListener() {},
  querySelector() { return null; }
};
const sandbox = {
  console, Math, JSON, Date, setTimeout, parseInt, parseFloat, isNaN, String, Number, Array, Object,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  document: {
    getElementById: (id) => (id === "uygulama" ? kap : null),
    addEventListener() {},
    activeElement: null,
    documentElement: { scrollTop: 0 }
  },
  scrollTo() {}
};
sandbox.window = sandbox;
const ctx = vm.createContext(sandbox);

const dosyalar = ["js/config.js", "js/rng.js", "js/yardimci.js", "data/modeller.js",
  "data/replikler.js", "data/kartlar.js", "data/rehber.js", "data/hikaye.js", "data/sefer.js",
  "data/sinav.js", "data/trendler.js", "js/araba.js", "js/ekspertiz.js", "js/karakterler.js", "js/pazarlik.js",
  "js/musteri.js", "js/olaylar.js", "js/sahne.js", "js/diyalog.js", "js/hikaye.js", "js/trend.js", "js/sefer.js",
  "js/konsinye.js", "js/takas.js", "js/cek.js", "js/belge.js", "js/rehber.js", "js/gun.js",
  "js/state.js", "js/ses.js", "js/ekspertiz-sema.js", "js/grafik.js", "js/karne.js", "js/ui.js"];
dosyalar.forEach((f) => vm.runInContext(fs.readFileSync(path.join(KOK, f), "utf8"), ctx));
const G = ctx.G;

G.ui.baslat();   // ui.js icindeki kap degiskeni burada baglaniyor

const EKRANLAR = ["giris", "tutorialBitti", "kimKimdir", "ilanlar", "araba", "olay", "hikaye",
  "sinav", "sinavSecim", "seferSecim", "sefer", "yemek", "pazarlik", "durustluk", "satis",
  "rapor", "sizce", "bitti", "defter", "dukkan", "yokboyle"];

const hatalar = [];
for (const ekran of EKRANLAR) {
  const s = G.durum.yeniOyun(5150);
  // ekranin ihtiyaci olan asgari durum
  s.diyalog = null; s.aktifKart = null; s.aktifHikaye = null;
  s.faz = "mesai"; s.aksiyon = 3;
  if (s.ilanlar.length) s.acikArabaId = s.ilanlar[0].id;
  if (ekran === "pazarlik" || ekran === "araba") {
    G.pazarlik.alisBaslat(s, s.ilanlar[0].id, "nuri");
  }
  if (ekran === "bitti") { s.gun = G.config.GUN_SAYISI; G.gun.gunuBitir(s); }
  if (ekran === "sefer" || ekran === "yemek") {
    const sehirler = G.sefer.secenekler(s);
    if (sehirler.length) G.sefer.baslat(s, sehirler[0].id);
    if (ekran === "yemek") G.sefer.yemek(s);
  }
  if (ekran === "tutorialBitti") { s.tutorial = { aktif: true, bitisGun: 2 }; s.gun = 3; }
  s.ekran = ekran;
  kayitliHtml = "";
  try {
    G.ui.ciz();
    if (!kayitliHtml || kayitliHtml.length < 200) {
      hatalar.push(ekran + ": govde bos ya da cok kisa (" + kayitliHtml.length + " karakter)");
    } else if (kayitliHtml.indexOf("undefined") !== -1) {
      const i = kayitliHtml.indexOf("undefined");
      hatalar.push(ekran + ": ciktida 'undefined' var -> " + kayitliHtml.slice(i - 60, i + 20));
    } else if (kayitliHtml.indexOf("NaN") !== -1) {
      const i = kayitliHtml.indexOf("NaN");
      hatalar.push(ekran + ": ciktida 'NaN' var -> " + kayitliHtml.slice(i - 60, i + 20));
    } else {
      console.log(ekran.padEnd(15) + "ok   " + kayitliHtml.length + " karakter");
    }
  } catch (e) {
    hatalar.push(ekran + ": COKTU -> " + e.message);
  }
}

console.log("");
if (hatalar.length) {
  console.log("SORUNLAR:");
  hatalar.forEach((h) => console.log(" - " + h));
} else {
  console.log("butun ekranlar temiz");
}
