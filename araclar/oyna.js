// ui.js'i kucuk bir DOM taklidiyle calistirip oyunu tiklayarak oynar (gelistirme araci).
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const kok = path.join(__dirname, "..");
const dosyalar = [
  "js/config.js", "js/rng.js", "js/yardimci.js",
  "data/modeller.js", "data/replikler.js", "data/kartlar.js", "data/rehber.js", "data/hikaye.js", "data/sefer.js", "data/sinav.js", "data/trendler.js",
  "js/araba.js", "js/ekspertiz.js", "js/karakterler.js",
  "js/pazarlik.js", "js/musteri.js", "js/olaylar.js", "js/sahne.js", "js/diyalog.js", "js/hikaye.js", "js/trend.js", "js/sefer.js", "js/konsinye.js", "js/takas.js", "js/cek.js", "js/belge.js", "js/rehber.js", "js/gun.js", "js/state.js", "js/ses.js", "js/ekspertiz-sema.js", "js/grafik.js", "js/karne.js", "js/ui.js"
];

// ---- DOM taklidi ----
function eleman(id) {
  return {
    id, value: "", textContent: "", innerHTML: "",
    addEventListener() {}, closest() { return null; }
  };
}
const elemanlar = {};
const zorlanan = {};        // kutulara deger yazmak icin (gercek tarayicida kullanici yazar)
let tiklamaDinleyici = null;
let tusDinleyici = null;
let domHazir = null;
const kayitliHtml = [];

const kap = eleman("uygulama");
Object.defineProperty(kap, "innerHTML", {
  get() { return this._h || ""; },
  set(v) { this._h = v; kayitliHtml.push(v); }
});
kap.addEventListener = (tur, fn) => { if (tur === "click") tiklamaDinleyici = fn; };
elemanlar["uygulama"] = kap;

const document_ = {
  getElementById(id) {
    if (id === "uygulama") return kap;
    if (id in zorlanan) {
      if (!elemanlar[id]) elemanlar[id] = eleman(id);
      elemanlar[id].value = String(zorlanan[id]);
      return elemanlar[id];
    }
    // teklif / ilanfiyat kutulari: son cizilen html'de varsa degerini oradan oku
    const html = kap.innerHTML;
    const re = new RegExp('id="' + id + '" step="[^"]*" value="([^"]*)"');
    const re2 = new RegExp('id="' + id + '"[^>]*value="([^"]*)"');
    const m = html.match(re) || html.match(re2);
    if (!m) return null;
    if (!elemanlar[id]) elemanlar[id] = eleman(id);
    elemanlar[id].value = m[1];
    return elemanlar[id];
  },
  addEventListener(tur, fn) {
    if (tur === "DOMContentLoaded") domHazir = fn;
    if (tur === "keydown") tusDinleyici = fn;
  },
  activeElement: null,
  documentElement: { scrollTop: 0 }
};

const sandbox = {
  console, Math, JSON, Date, parseInt, parseFloat, isNaN, String, Number, Object, Array, Error, RegExp,
  document: document_,
  localStorage: (() => {
    const kutu = {};
    return {
      getItem: k => (k in kutu ? kutu[k] : null),
      setItem: (k, v) => { kutu[k] = String(v); },
      removeItem: k => { delete kutu[k]; }
    };
  })()
};
sandbox.scrollY = 0;
sandbox.scrollTo = function () {};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
const ctx = vm.createContext(sandbox);

for (const d of dosyalar) {
  vm.runInContext(fs.readFileSync(path.join(kok, d), "utf8"), ctx, { filename: d });
}

// ---- tiklama yardimcisi ----
function tikla(is, veri = {}) {
  const dugme = {
    disabled: false,
    getAttribute: (ad) => {
      if (ad === "data-is") return is;
      const anahtar = ad.replace(/^data-/, "");
      return anahtar in veri ? String(veri[anahtar]) : null;
    }
  };
  const olay = { target: { closest: () => dugme } };
  tiklamaDinleyici(olay);
  // Adim 13: her cizimde sahne olmali
  if (typeof sahneDenetimi === "function") sahneDenetimi();
}

function teklifYaz(deger) { zorlanan["teklif"] = deger; }
function teklifSil() { delete zorlanan["teklif"]; }

function diyaloguBitir() {
  // sadece su an acik olan diyalogu bitirir; arkasindan baska bir diyalog
  // baslarsa (hikaye sahnesi -> kart diyalogu) ona dokunmaz
  if (!S() || !S().diyalog) return;
  const kaynak = S().diyalog.kaynak;
  let guvenlik = 0;
  while (S().diyalog && S().diyalog.kaynak === kaynak && guvenlik++ < 15) tikla("diyalogIlerle");
}

function butonVarMi(is) {
  return kap.innerHTML.indexOf('data-is="' + is + '"') !== -1;
}

// tikla() dugmeyi uydurup dinleyiciyi dogrudan cagiriyor; cizilen ekranda dugmenin
// gercekten acik olup olmadigini gormuyor. Pasif dugme hatalari bu yuzden sessiz geciyordu
// (sehir disi ilanlar: gunluk aksiyona bakiliyordu, seferde o hep sifir).
function dugmeEtiketi(is, veri = {}) {
  const desen = /<button[^>]*>/g;
  let m;
  while ((m = desen.exec(kap.innerHTML)) !== null) {
    const etiket = m[0];
    if (etiket.indexOf('data-is="' + is + '"') === -1) continue;
    let uyuyor = true;
    for (const anahtar in veri) {
      if (etiket.indexOf('data-' + anahtar + '="' + kacisli(String(veri[anahtar])) + '"') === -1) {
        uyuyor = false;
      }
    }
    if (uyuyor) return etiket;
  }
  return null;
}

function dugmeAcikMi(is, veri = {}) {
  const etiket = dugmeEtiketi(is, veri);
  return !!etiket && etiket.indexOf("disabled") === -1;
}

function metinVarMi(parca) {
  return kap.innerHTML.indexOf(parca) !== -1 || kap.innerHTML.indexOf(kacisli(parca)) !== -1;
}

// ui.js metni kacisliyor; karsilastirmayi ayni bicime cevir
function kacisli(metin) {
  return String(metin)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function arabaIdleri(tur) {
  const s = vm.runInContext("G.state", ctx);
  return (tur === "ilan" ? s.ilanlar : s.stok).map(a => a.id);
}

var gorulenEkranlar = new Set();
var sahnesizEkranlar = new Set();
function sahneDenetimi() {
  var st = sandbox.G && sandbox.G.state;
  if (!st) return;
  gorulenEkranlar.add(st.ekran);
  if (kap.innerHTML && kap.innerHTML.indexOf('class="sahne"') === -1) sahnesizEkranlar.add(st.ekran);
}

// ---- oyunu baslat ----
domHazir();
const S = () => vm.runInContext("G.state", ctx);
const cfg = vm.runInContext("G.config", ctx);
const hatalar = [];
function kontrol(kosul, mesaj) {
  if (!kosul) hatalar.push(mesaj);
}

kontrol(S() !== null, "state olusmadi");
kontrol(kayitliHtml.length > 0, "ekran cizilmedi");
// ILK-CIZIM-DOK
if (process.env.DOK) {
  const h = kayitliHtml[kayitliHtml.length - 1];
  const i = h.indexOf("sahne-konusma");
  console.log(i === -1 ? "KONUSMA KATMANI YOK" : h.slice(i - 60, i + 420));
}

// Faz 4: ilk acilista once hikaye ve ortaklar ekrani, sonra oyun
kontrol(S().ekran === "giris", "ilk acilista giris ekrani gelmeli");
kontrol(metinVarMi("ORTAKLAR MOTORS"), "giris ekraninda hikaye ozeti yok");
kontrol(butonVarMi("tutorialBasla") && butonVarMi("girisGec"), "ogretici secimi yok");
tikla("girisGec");

// Adim 8: oyun sabah karti ile aciliyor
kontrol(S().ekran === "hikaye", "oyun prolog sahnesiyle acilmali");
kontrol(metinVarMi("ORTAKLAR"), "prolog basligi yok");
diyaloguBitir();
kontrol(S().faz === "sabah" && S().ekran === "olay", "prolog bitince olay karti gelmeli");

// Adim 13: rehber bandi ve sahne (hikaye sahnesi bittikten sonra gorunur)
kontrol(metinVarMi('class="sahne"'), "ilk ekranda sahne yok");
kontrol(metinVarMi("rehber-bant"), "rehber bandi yok");
kontrol(metinVarMi("ADIM 1/"), "rehber adim sayaci yok");
kontrol(butonVarMi("yardim"), "yardim butonu yok");
tikla("yardim", { ekran: "olay" });
kontrol(metinVarMi("NASIL OYNANIR"), "yardim karti acilmadi");
tikla("yardimKapat");
kontrol(!metinVarMi("NASIL OYNANIR"), "yardim karti kapanmadi");

const kartSayaci = {};
const trendSayaci = {};
kartSayaci[S().aktifKart.id] = 1;
kontrol(S().diyalog !== null, "kart diyalogu acilmali");
kontrol(metinVarMi("Devam"), "devam gostergesi yok");
diyaloguBitir();
kontrol(S().diyalog === null, "diyalog bitmeli");
kontrol(butonVarMi("olaySecim"), "diyalog bitince secenekler gelmeli");
tikla("olaySecim", { sira: 0 });
kontrol(S().aktifKart === null, "kart kapanmadi");
kontrol(S().faz === "mesai", "faz mesai olmali");
kontrol(metinVarMi("GÜN 1/30"), "ust barda gun yok");
kontrol(metinVarMi("TEZGÂH"), "dukkan ekrani cizilmedi");

// Ilanlar ekrani
tikla("ilanlar");
kontrol(metinVarMi("sanayiden"), "ilan ekrani cizilmedi");
const ilanlar = arabaIdleri("ilan");
kontrol(ilanlar.length >= 3, "ilan sayisi az: " + ilanlar.length);

// Bir ilana git, ekspertiz yaptir, pazarlik et
tikla("ilanaGit", { araba: ilanlar[0] });
kontrol(S().aksiyon === cfg.GUNLUK_AKSIYON - 1, "aksiyon dusmedi");
kontrol(metinVarMi("EKSPERTİZ"), "araba detayi cizilmedi");

const kasaOnce = S().kasa;
const bedavaMi = !!S().bayraklar.bedavaEkspertiz;   // Sukru abi karti cikmis olabilir
tikla("ekspertiz", { araba: ilanlar[0], seviye: "normal" });
kontrol(
  S().kasa === kasaOnce - (bedavaMi ? 0 : cfg.EKSPERTIZ.normal.bedel),
  "ekspertiz bedeli beklendigi gibi dusmedi"
);

tikla("pazarlikBaslat", { araba: ilanlar[0], konusan: "nuri" });
kontrol(S().aktifPazarlik !== null, "pazarlik baslamadi");
kontrol(metinVarMi("PAZARLIK"), "pazarlik ekrani cizilmedi");

// Yetenek butonu (Adim 7)
kontrol(butonVarMi("yetenek"), "yetenek butonu yok");
tikla("yetenek");
kontrol(S().aktifPazarlik === null || S().aktifPazarlik.yetenekKullanildi === true, "yetenek isaretlenmedi");
if (S().aktifPazarlik && S().aktifPazarlik.bitti) { tikla("dukkan"); }

// Kozlari dene, teklif ver (Nuri sinirlenip masayi dagittiysa bu adimlar atlanir)
let ilkAlimOldu = false;
if (S().aktifPazarlik && !S().aktifPazarlik.bitti) {
  const kozTipleri = [];
  {
    const araba = S().ilanlar.find(a => a.id === ilanlar[0]);
    if (araba) {
      for (const k of araba.kusurlar) if (k.ortayaCikti && !kozTipleri.includes(k.tip)) kozTipleri.push(k.tip);
    }
  }
  for (const tip of kozTipleri) if (!S().aktifPazarlik.bitti) tikla("koz", { tip });

  if (S().aktifPazarlik && !S().aktifPazarlik.bitti) {
    tikla("teklifDegis", { miktar: -50000 });
    tikla("teklifVer");
    kontrol(S().aktifPazarlik.gecmis.length >= 2, "teklif gecmisi yazilmadi");
  }
  if (S().aktifPazarlik && !S().aktifPazarlik.bitti) {
    const p = S().aktifPazarlik;
    teklifYaz(Math.ceil(p.karsi / 10000) * 10000);
    tikla("teklifVer");
    teklifSil();
  }
  const pSon = S().aktifPazarlik;
  kontrol(pSon.bitti === true, "pazarlik bitmedi");
  kontrol(["kabul", "kalkis"].includes(pSon.sonuc), "beklenmeyen sonuc: " + pSon.sonuc);
  ilkAlimOldu = pSon.sonuc === "kabul";
}
tikla("dukkan");

if (ilkAlimOldu) {
  kontrol(S().stok.length === 1, "araba stoga girmedi");
  const stokId = arabaIdleri("stok")[0];
  const arabaOnce = S().stok[0].ilanFiyati;
  elemanlar["ilanfiyat-" + stokId] = eleman("ilanfiyat-" + stokId);
  tikla("ilanFiyatiKaydet", { araba: stokId });
  kontrol(S().stok[0].ilanFiyati === arabaOnce, "ilan fiyati bozuldu");
}

// Gunu bitir, rapor, yeni gun
tikla("gunuBitir");
kontrol(metinVarMi("Kasa dökümü"), "rapor cizilmedi");
kontrol(S().faz === "aksam", "faz aksam olmali");
kontrol(metinVarMi("GÜNÜN NETİ"), "akşam kapaginda net bandi yok");
tikla("raporKapat");
kontrol(S().faz === "sizce" && S().ekran === "sizce", "sizce ekrani acilmali");
kontrol(metinVarMi("SİZCE?"), "sizce basligi yok");
const yarinkiKart = S().yarinkiKart;
tikla("sizceSec", { sira: 0 });
kontrol(S().gun === 2, "gun ilerlemedi");
kontrol(S().aktifKart && S().aktifKart.id === yarinkiKart, "sabah karti dun cekilen kart olmali");
kontrol(S().sizceSecimi !== null, "sizce secimi kaydedilmedi");
tikla("olaySecim", { sira: 0 });

// Defter
tikla("defter");
kontrol(metinVarMi("Defter"), "defter cizilmedi");
tikla("dukkan");

// 30 gunu otomatik oyna: her gun bir ilana girip pazarlik etmeye calis, stok varsa musteriyle gorus
let satisDenemesi = 0, satisOldu = 0, yakalandi = 0, sizceSayaci = 0, durustlukSayaci = { soyle: 0, sakla: 0 };
for (let tur = 0; tur < 400 && !S().bitis; tur++) {
  const s = S();
  gorulenEkranlar.add(s.ekran);
  if (!metinVarMi('class="sahne"')) sahnesizEkranlar.add(s.ekran);
  if (s.ekran === "rapor") {
    if (!metinVarMi("GÜNÜN NETİ")) hatalar.push("akşam kapaginda net yok");
    if (!s.sonRapor.ozet) hatalar.push("gun ozeti kelimesi yok");
    tikla("raporKapat");
    continue;
  }
  if (s.ekran === "sizce") {
    const yarin = vm.runInContext('G.olaylar.kartBul(G.state.yarinkiKart)', ctx);
    if (!yarin) { hatalar.push("yarinki kart cekilmemis"); tikla("sizceSec", { sira: 0 }); continue; }
    if (!metinVarMi(yarin.sizceSorusu)) hatalar.push("sizce sorusu ekranda yok: " + yarin.id);
    sizceSayaci++;
    tikla("sizceSec", { sira: tur % 2 });
    if (S().aktifKart && S().aktifKart.id !== yarin.id) {
      hatalar.push("sabah karti sizce sorusuyla tutarsiz: " + yarin.id + " -> " + S().aktifKart.id);
    }
    continue;
  }
  if (s.ekran === "olay") {
    if (!s.aktifKart) { hatalar.push("olay ekraninda kart yok"); tikla("dukkan"); continue; }
    kartSayaci[s.aktifKart.id] = (kartSayaci[s.aktifKart.id] || 0) + 1;
    const kartTanim = vm.runInContext('G.olaylar.aktifKartTanimi(G.state)', ctx);
    if (!metinVarMi(kartTanim.baslik)) hatalar.push("kart basligi ekranda yok: " + kartTanim.id);
    diyaloguBitir();
    const secenekSayisi = kartTanim.secenekler.length;
    tikla("olaySecim", { sira: tur % secenekSayisi });
    continue;
  }
  if (s.ekran !== "dukkan") { tikla("dukkan"); continue; }

  // Piyasa trendi: tezgahta her gun gorunmeli (js/trend.js)
  if (s.trend) {
    trendSayaci[s.trend.id] = (trendSayaci[s.trend.id] || 0) + 1;
    const trendTanim = vm.runInContext('G.trend.aktif(G.state)', ctx);
    if (trendTanim && !metinVarMi(trendTanim.etiket)) {
      hatalar.push("trend seridi tezgahta gorunmuyor: " + trendTanim.etiket);
    }
  }

  // Musteri varsa gorus
  if (s.musteriler.length > 0 && s.aksiyon > 0) {
    const m = s.musteriler[0];
    tikla("musteriyeGit", { musteri: m.id });
    if (!metinVarMi("KİM GÖRÜŞECEK")) hatalar.push("kim gorusecek ekrani cizilmedi");
    const konusanlar = ["nuri", "drej", "kro"];
    const konusan = konusanlar[satisDenemesi % 3];
    tikla("satisKonusan", { konusan });
    const durustluk = (satisDenemesi % 2 === 0) ? "soyle" : "sakla";
    durustlukSayaci[durustluk]++;
    satisDenemesi++;
    tikla("satisBaslat", { durustluk, konusan });
    const p = S().aktifPazarlik;
    if (p && !p.bitti && konusan !== "kro") {
      tikla("yetenek");
    }
    if (S().aktifPazarlik && !S().aktifPazarlik.bitti) {
      const p2 = S().aktifPazarlik;
      // Tavanin hemen altini soyle
      teklifYaz(Math.floor(p2.tavan / 10000) * 10000);
      tikla("fiyatSoyle");
      teklifSil();
      const q = S().aktifPazarlik;
      if (q.sonuc === "satildi") satisOldu++;
    } else if (S().aktifPazarlik && S().aktifPazarlik.sonuc === "yakalandi") {
      yakalandi++;
    }
    tikla("dukkan");
    continue;
  }

  // Ilana git
  const pazarliksiz = s.ilanlar.filter(a => a.pazarliksiz && s.stok.length < cfg.KAPASITE);
  if (pazarliksiz.length > 0 && s.aksiyon > 0) {
    tikla("ilanaGit", { araba: pazarliksiz[0].id });
    if (!metinVarMi("AL YA DA BIRAK")) hatalar.push("pazarliksiz ilan ekrani cizilmedi");
    tikla("dogrudanAl", { araba: pazarliksiz[0].id });
    tikla("dukkan");
    continue;
  }

  const bakilmamis = s.ilanlar.filter(a => s.bugunGezilen.indexOf(a.id) === -1);
  if (s.aksiyon > 0 && bakilmamis.length > 0 && s.stok.length < cfg.KAPASITE) {
    const hedef = bakilmamis[0].id;
    tikla("ilanaGit", { araba: hedef });
    tikla("ekspertiz", { araba: hedef, seviye: "normal" });
    tikla("pazarlikBaslat", { araba: hedef, konusan: "drej" });
    const p = S().aktifPazarlik;
    if (p && !p.bitti) {
      const araba = S().ilanlar.find(a => a.id === hedef);
      const tipler = [];
      if (araba) for (const k of araba.kusurlar) if (k.ortayaCikti && !tipler.includes(k.tip)) tipler.push(k.tip);
      for (const tip of tipler) if (!S().aktifPazarlik.bitti) tikla("koz", { tip });
      if (S().aktifPazarlik && !S().aktifPazarlik.bitti) tikla("yetenek");
      const q = S().aktifPazarlik;
      if (!q.bitti) {
        teklifYaz(Math.ceil(q.karsi / 10000) * 10000);
        tikla("teklifVer");
        teklifSil();
      }
    }
    tikla("dukkan");
    continue;
  }

  tikla("gunuBitir");
  if (S().ekran === "rapor") tikla("raporKapat");
}

const son = S();
kontrol(son.bitis !== null, "oyun bitmedi (gun: " + son.gun + ")");
if (son.bitis) {
  if (S().ekran === "rapor") tikla("raporKapat");
  kontrol(S().ekran === "bitti", "sonuc ekrani acilmali");
  kontrol(metinVarMi(vm.runInContext("G.buyukHarf", ctx)(son.bitis.unvan)), "kapakta unvan yok");
  kontrol(metinVarMi(son.bitis.baslik), "kapakta baslik yok");
  kontrol(metinVarMi("Yakaladığımız dolandırıcı"), "istatistikte dolandirici satiri yok");
  kontrol(metinVarMi("En iyi pazarlık"), "istatistikte en iyi pazarlik yok");
  kontrol(metinVarMi("Sakladığımız kusur"), "istatistikte saklanan kusur yok");
  kontrol(metinVarMi(String(son.bitis.tohum)), "tohum yazilmamis");
  kontrol(butonVarMi("yeniOyun") && butonVarMi("ayniTohum"), "yeni oyun / ayni tohum butonu yok");

  // oyun bittikten sonra tezgah kapali
  tikla("ilanlar");
  kontrol(S().ekran === "bitti", "oyun bittikten sonra ilanlara girilememeli");
  tikla("gunuBitir");
  kontrol(S().ekran === "bitti", "oyun bittikten sonra gun bitirilememeli");

  // defter sonuca donuyor
  tikla("defter");
  kontrol(metinVarMi("Defter"), "defter acilmadi");
  tikla("bitisEkrani");
  kontrol(S().ekran === "bitti", "defterden sonuca donulemedi");

  // ayni tohumla tekrar
  const tohum = son.bitis.tohum;
  tikla("ayniTohum", { tohum });
  kontrol(S().tohum === tohum, "ayni tohumla baslamadi");
  kontrol(S().gun === 1 && S().faz === "sabah", "yeni oyun 1. gunun sabahinda baslamali");
  kontrol(S().bitis === null, "bitis temizlenmedi");
}

// Nuri sinirlenme yolu: config'i zorlayip tek bir pazarlikta dene
{
  vm.runInContext('G.config.NURI_SINIR_OLASILIK = 1; G.durum.yeniOyun(8888); G.state.gun = 3;', ctx);
  tikla("ilanlar");
  const ilanId = S().ilanlar[0].id;
  tikla("ilanaGit", { araba: ilanId });
  tikla("pazarlikBaslat", { araba: ilanId, konusan: "nuri" });
  tikla("yetenek");
  const pz = S().aktifPazarlik;
  kontrol(pz.bitti === true && pz.sonuc === "kalkis", "Nuri sinirlenince masa dagilmali");
  kontrol(S().bayraklar.nuriYokGun === S().gun + 1, "Nuri yarin yok olmali");
  tikla("dukkan");
  tikla("gunuBitir");
  tikla("raporKapat");
  tikla("sizceSec", { sira: 0 });
  if (S().ekran === "hikaye") diyaloguBitir();   // o gunun hikaye sahnesi varsa once o oynar
  kontrol(S().ekran === "olay", "yeni gun olay karti ile acilmali");
  tikla("olaySecim", { sira: 0 });              // kart kapanınca dukkana donulur
  kontrol(metinVarMi("ablasının yanında"), "sabah haberinde Nuri'nin yoklugu yazmali");
  tikla("ilanlar");
  const id2 = S().ilanlar[0].id;
  tikla("ilanaGit", { araba: id2 });
  kontrol(!metinVarMi('data-konusan="nuri"'), "Nuri yokken butonu cikmamali");
  kontrol(metinVarMi("Nuri bugün ablasının yanında"), "araba ekraninda uyari olmali");
  vm.runInContext('G.config.NURI_SINIR_OLASILIK = 0.20;', ctx);
}

// Sikayet karti arayuzde: kayit birakip gunu bitir, kart ekranini kontrol et
{
  vm.runInContext('G.durum.yeniOyun(5555);', ctx);
  diyaloguBitir();
  tikla("olaySecim", { sira: 0 });
  const kasaOnce = S().kasa;
  S().bekleyenEtkiler.push({
    gun: S().gun + 1, tur: "sikayet", araba: "Test Erebe",
    etki: { kasa: -150000, itibar: -12 }
  });
  tikla("gunuBitir");
  tikla("raporKapat");
  kontrol(S().yarinkiKart === "sikayet", "sizce sorusu sikayetin olmali");
  tikla("sizceSec", { sira: 0 });
  kontrol(S().aktifKart && S().aktifKart.id === "sikayet", "sabah karti sikayet olmali");
  diyaloguBitir();
  kontrol(metinVarMi("KAPIDA ŞİKÂYET"), "sikayet karti basligi ekranda yok");
  kontrol(metinVarMi("Test Erebe"), "sikayet metninde araba adi yok");
  tikla("olaySecim", { sira: 0 });
  kontrol(S().kasa === kasaOnce - cfg.SABIT_GIDER - 150000, "geri odeme kasadan dusmeli");
  kontrol(metinVarMi("Şikâyet"), "dukkan seridinde sikayet notu olmali");
}

// ---------------------------------------------------------------- Faz 4: ogretici oynanis
(function ogreticiAkisi() {
  vm.runInContext("G.durum.tutorialBaslat(); G.ui.ciz();", ctx);
  kontrol(S().tutorial && S().tutorial.aktif, "ogretici baslamadi");
  kontrol(S().tohum === cfg.TUTORIAL_TOHUM, "ogretici sabit tohumla baslamali");
  kontrol(S().rehber.acik, "ogreticide rehber acik olmali");
  kontrol(metinVarMi("ÖĞRETİCİ"), "ogretici bandi gorunmuyor");
  kontrol(butonVarMi("tutorialBitir"), "ogreticiyi bitirme dugmesi yok");

  const ilk = S().ilanlar[0];
  kontrol(ilk && ilk.saticiTipi === "durust", "ogreticide ilk ilan affedici olmali");
  kontrol(ilk && ilk.istenenFiyat < ilk.piyasaDegeri, "ogreticide ilk ilan piyasanin altinda olmali");

  // sure dolunca kapanis ekrani
  S().gun = cfg.TUTORIAL_GUN + 1;
  vm.runInContext("G.ui.ciz();", ctx);
  kontrol(S().ekran === "tutorialBitti", "ogretici suresi dolunca kapanis gelmeli");

  tikla("tutorialBitir");
  kontrol(!S().tutorial, "ogretici bitince temiz oyun baslamali");
  kontrol(S().gun === 1, "ogreticiden sonra birinci gunden baslanmali");
  gorulenEkranlar.add("giris");
  gorulenEkranlar.add("tutorialBitti");

  // oyunun kalani icin normal bir oyuna don
  vm.runInContext("G.durum.yeniOyun(4242); G.ui.ciz();", ctx);
  diyaloguBitir();
})();

// ---------------------------------------------------------------- Adim 18: sefer akisi
(function seferAkisi() {
  vm.runInContext('G.durum.yeniOyun(2468);', ctx);
  const s0 = S();
  s0.diyalog = null; s0.aktifKart = null; s0.aktifHikaye = null;
  s0.faz = "mesai"; s0.aksiyon = 3; s0.ekran = "dukkan";
  vm.runInContext('G.ui.ciz();', ctx);

  kontrol(butonVarMi("seferSecim"), "dukkanda sefer dugmesi yok");
  tikla("seferSecim");
  kontrol(S().ekran === "seferSecim", "sefer secim ekrani acilmadi");
  kontrol(metinVarMi("NEREYE GİDİYORUZ?"), "sehir listesi basligi yok");
  kontrol(butonVarMi("seferBaslat"), "yola cik dugmesi yok");

  const sehirler = ctx.G.sefer.secenekler(S());
  const oncekiKasa = S().kasa;
  tikla("seferBaslat", { sehir: sehirler[0].id });
  kontrol(S().ekran === "sefer", "sefer ekrani acilmadi");
  kontrol(S().kasa < oncekiKasa, "yol masrafi dusmedi");
  kontrol(S().aksiyon === 0, "sefer gunu yemedi");
  kontrol(metinVarMi("pazarlık hakkı"), "pazarlik hakki yazmiyor");
  gorulenEkranlar.add("sefer");

  // yemek molasi
  kontrol(butonVarMi("seferYemek"), "yemek dugmesi yok");
  tikla("seferYemek");
  kontrol(S().ekran === "yemek", "yemek sahnesi acilmadi");
  kontrol(metinVarMi("MOLA"), "mola etiketi yok");
  gorulenEkranlar.add("yemek");
  diyaloguBitir();
  kontrol(S().ekran === "sefer", "yemekten sonra sefere donulmedi");
  kontrol(!butonVarMi("seferYemek"), "yemek ikinci kez cikmamali");

  // sehirdeki ilana git ve al
  const ilan = S().sefer.ilanlar[0];
  kontrol(metinVarMi("sanayiden"), "sefer ilan listesi cizilmedi");
  kontrol(dugmeAcikMi("ilanaGit", { araba: ilan.id }),
    "sehirdeki ilan dugmesi pasif: hak seferin kalanPazarlik'inden degil gunluk aksiyondan okunuyor olabilir");
  tikla("ilanaGit", { araba: ilan.id });
  kontrol(S().ekran === "araba", "sehirdeki ilan detayi acilmadi");
  kontrol(S().sefer.kalanPazarlik === ctx.G.config.SEFER_PAZARLIK - 1, "sefer hakki dusmedi");
  tikla("pazarlikBaslat", { araba: ilan.id, konusan: "nuri" });
  kontrol(S().ekran === "pazarlik", "sehirde pazarlik acilmadi");
  teklifYaz(Math.ceil(S().aktifPazarlik.karsi / 10000) * 10000);
  tikla("teklifVer");
  teklifSil();
  kontrol(S().stok.length === 1, "seferden araba gelmedi: " +
    JSON.stringify(S().aktifPazarlik && S().aktifPazarlik.sonuc));

  // donus
  S().ekran = "sefer";
  vm.runInContext('G.ui.ciz();', ctx);
  tikla("seferDon");
  kontrol(S().ekran === "dukkan", "seferden donulmedi");
  kontrol(S().sefer === null, "sefer kapanmadi");
  kontrol(S().stok.length === 1, "alinan araba tezgahta kalmali");
})();

// ---------------------------------------------------------------- Adim 19: konsinye akisi
(function konsinyeAkisi() {
  vm.runInContext('G.durum.yeniOyun(1357);', ctx);
  const s0 = S();
  s0.diyalog = null; s0.aktifKart = null; s0.aktifHikaye = null;
  s0.faz = "mesai"; s0.aksiyon = 3; s0.ekran = "dukkan";

  const araba = vm.runInContext('G.araba.ilanUret(G.state, "ilan", "durust")', ctx);
  araba.konsinyeMumkun = true;
  s0.ilanlar.push(araba);
  s0.acikArabaId = araba.id;
  s0.ekran = "araba";
  vm.runInContext('G.ekspertiz.gozKontrol(G.state.ilanlar[G.state.ilanlar.length - 1]);', ctx);
  vm.runInContext('G.ui.ciz();', ctx);

  kontrol(metinVarMi("KONSİNYE TEKLİFİ"), "konsinye kutusu yok");
  kontrol(butonVarMi("konsinyeAl"), "konsinye al dugmesi yok");

  const oncekiKasa = S().kasa;
  tikla("konsinyeAl", { araba: araba.id });
  kontrol(S().kasa === oncekiKasa, "konsinyede kasadan para cikmamali");
  kontrol(S().stok.length === 1, "konsinye araba tezgaha girmeli");
  kontrol(S().ekran === "dukkan", "konsinyeden sonra dukkana donulmeli");
  vm.runInContext('G.ui.ciz();', ctx);
  kontrol(metinVarMi("KONSİNYE"), "stok kartinda konsinye rozeti yok");
  kontrol(metinVarMi("Sahibine net"), "sahibin neti yazmiyor");

  // satalim: komisyon kasaya girsin
  if (!S().stok.length) { console.log("KONSINYE HATALAR:", hatalar.slice(-5), "| ekran:", S().ekran); return; }
  const net = S().stok[0].konsinye.sahipNet;
  const musteri = vm.runInContext('G.musteri.musteriUret(G.state, G.state.stok[0])', ctx);
  S().musteriler.push(musteri);
  tikla("musteriyeGit", { musteri: musteri.id });
  tikla("satisBaslat", { durustluk: "soyle", konusan: "nuri" });
  if (S().aktifPazarlik && !S().aktifPazarlik.bitti) {
    const p = S().aktifPazarlik;
    teklifYaz(Math.floor(p.tavan / 10000) * 10000);
    tikla("fiyatSoyle");
    teklifSil();
    const son = S().aktifPazarlik;
    if (son && son.sonuc === "satildi") {
      kontrol(son.konsinye === true, "satis konsinye isaretli olmali");
      kontrol(son.kar === son.anlasmaFiyati - net, "kar komisyona esit olmali");
      kontrol(S().kasa < oncekiKasa + son.anlasmaFiyati,
        "satis bedelinin tamami kasaya girmemeli");
    }
  }
})();

// ---------------------------------------------------------------- Adim 20: takas akisi
(function takasAkisi() {
  vm.runInContext('G.durum.yeniOyun(9753);', ctx);
  const s0 = S();
  s0.diyalog = null; s0.aktifKart = null; s0.aktifHikaye = null;
  s0.faz = "mesai"; s0.aksiyon = 3;

  const araba = vm.runInContext('G.araba.ilanUret(G.state, "ilan", "durust")', ctx);
  araba.alisFiyati = Math.round(araba.piyasaDegeri * 0.95);
  araba.masraflar = ctx.G.config.NOTER_PLAKA;
  araba.ilanFiyati = Math.round(araba.alisFiyati * 1.1);
  s0.stok.push(araba);

  const musteri = vm.runInContext('G.musteri.musteriUret(G.state, G.state.stok[0])', ctx);
  musteri.takasArabasi = vm.runInContext('G.takas.arabaUret(G.state)', ctx);
  musteri.takasKapandi = false;
  s0.musteriler.push(musteri);

  tikla("musteriyeGit", { musteri: musteri.id });
  tikla("satisBaslat", { durustluk: "soyle", konusan: "nuri" });
  if (!S().aktifPazarlik || S().aktifPazarlik.bitti) return;   // yakalandi/sase: akis disinda

  kontrol(metinVarMi("TAKAS TEKLİFİ"), "takas kutusu yok");
  kontrol(butonVarMi("takasKabul"), "takas dugmesi yok");

  const takasArabasi = musteri.takasArabasi;
  const beklenti = vm.runInContext('G.takas.beklenti', ctx)(takasArabasi);
  zorlanan["takas-deger"] = beklenti;
  tikla("takasKabul");
  delete zorlanan["takas-deger"];

  const p = S().aktifPazarlik;
  kontrol(p && p.takas !== null, "takas anlasmasi kurulmali");
  if (!p || !p.takas) return;
  kontrol(metinVarMi("TAKAS TAMAM"), "takas ozeti gorunmuyor");

  const oncekiKasa = S().kasa;
  const bicilen = p.takas.bicilenDeger;
  teklifYaz(Math.floor(p.tavan / 10000) * 10000);
  tikla("fiyatSoyle");
  teklifSil();

  const son = S().aktifPazarlik;
  if (son && son.sonuc === "satildi") {
    kontrol(son.takasDegeri === bicilen, "sonucta takas degeri yazili olmali");
    kontrol(S().kasa === oncekiKasa + son.anlasmaFiyati - son.vergi - bicilen,
      "kasaya sadece nakit fark girmeli");
    let geldi = false;
    for (const a of S().stok) if (a.id === takasArabasi.id) geldi = true;
    kontrol(geldi, "takas arabasi tezgaha girmeli");
  }
})();

console.log("--- otomatik oyun ---");
console.log("gun:", son.gun, "| kasa:", son.kasa, "| itibar:", son.itibar);
console.log("bitis:", son.bitis && son.bitis.tur, "| unvan:", son.bitis && son.bitis.unvan,
  "| net varlik:", son.bitis && son.bitis.netVarlik);
console.log("istatistik:", JSON.stringify(son.istatistik));
console.log("satis denemesi:", satisDenemesi, "| satildi:", satisOldu, "| durustluk:", JSON.stringify(durustlukSayaci));
console.log("cizim sayisi:", kayitliHtml.length);
console.log("gorulen ekranlar:", [...gorulenEkranlar].join(", "));
if (sahnesizEkranlar.size) hatalar.push("sahnesiz ekran: " + [...sahnesizEkranlar].join(", "));
console.log("cikan kartlar:", JSON.stringify(kartSayaci));
console.log("gorulen trendler:", JSON.stringify(trendSayaci));
console.log("sizce sorusu sayisi:", sizceSayaci);

if (hatalar.length) {
  console.log("\nSORUNLAR:");
  for (const h of hatalar) console.log(" - " + h);
  process.exit(1);
}
console.log("\narayuz akisi sorunsuz");
