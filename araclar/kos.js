// Tarayici dısında test kosucusu (gelistirme araci, oyun klasorune girmez).
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const kok = process.argv[2] || path.join(__dirname, "..");
const dosyalar = [
  "js/config.js", "js/rng.js", "js/yardimci.js",
  "data/modeller.js", "data/replikler.js", "data/kartlar.js", "data/rehber.js", "data/hikaye.js", "data/sefer.js", "data/sinav.js", "data/trendler.js",
  "js/araba.js", "js/ekspertiz.js", "js/karakterler.js",
  "js/pazarlik.js", "js/musteri.js", "js/olaylar.js", "js/sahne.js", "js/diyalog.js", "js/hikaye.js", "js/trend.js", "js/sefer.js", "js/konsinye.js", "js/takas.js", "js/cek.js", "js/belge.js", "js/rehber.js", "js/gun.js", "js/state.js",
  "js/ses.js", "js/ekspertiz-sema.js", "js/grafik.js", "js/karne.js",
  "js/test.js"
];

const sandbox = { console, Math, JSON, Date, parseInt, parseFloat, isNaN, String, Number, Object, Array, Error };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);

for (const d of dosyalar) {
  const kod = fs.readFileSync(path.join(kok, d), "utf8");
  try {
    vm.runInContext(kod, ctx, { filename: d });
  } catch (e) {
    console.log("YUKLEME HATASI " + d + ": " + e.message);
    process.exit(1);
  }
}

const sonuclar = vm.runInContext("G.testKos()", ctx);
let gecen = 0;
for (const s of sonuclar) {
  if (s.gecti) { gecen++; console.log("  gecti  " + s.ad); }
  else console.log("  KALDI  " + s.ad + "\n         -> " + s.hata);
}
console.log("\n" + gecen + " / " + sonuclar.length);
process.exit(gecen === sonuclar.length ? 0 : 1);
