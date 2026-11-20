// yardimci.js — kucuk ortak fonksiyonlar. DOM'a dokunmaz.
window.G = window.G || {};

// 1575000 -> "1.575.000 TL"  (kurallar.md 9)
// Turkce buyuk harf: "i" -> "İ", "ı" -> "I". JS'in toUpperCase'i bunu bilmiyor.
G.buyukHarf = function (metin) {
  return String(metin || "")
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .replace(/ğ/g, "Ğ")
    .replace(/ü/g, "Ü")
    .replace(/ş/g, "Ş")
    .replace(/ö/g, "Ö")
    .replace(/ç/g, "Ç")
    .toUpperCase();
};

G.paraYaz = function (tl) {
  var n = Math.round(tl || 0);
  var eksi = n < 0;
  n = Math.abs(n);
  var metin = String(n);
  var parcali = "";
  while (metin.length > 3) {
    parcali = "." + metin.slice(-3) + parcali;
    metin = metin.slice(0, -3);
  }
  parcali = metin + parcali;
  return (eksi ? "-" : "") + parcali + " TL";
};

// Esnaf agzi kisa fiyat: 1575000 -> "1 milyon 575", 850000 -> "850 bin"
G.kisaFiyat = function (tl) {
  var n = Math.round((tl || 0) / 1000); // bin cinsinden
  if (n >= 1000) {
    var milyon = Math.floor(n / 1000);
    var kalan = n % 1000;
    return kalan === 0 ? milyon + " milyon" : milyon + " milyon " + kalan;
  }
  return n + " bin";
};

// Varsayilan 10.000'e yuvarlama (tasarim/02, tasarim/03 §4)
G.yuvarla = function (sayi, adim) {
  var a = adim || G.config.YUVARLAMA;
  return Math.round(sayi / a) * a;
};

G.kirp = function (sayi, alt, ust) {
  return Math.max(alt, Math.min(ust, sayi));
};

G.yuzde = function (deger, oran) {
  return deger * oran;
};

// tasarim/01 — unvan tablosu
G.unvanBul = function (netVarlik) {
  var liste = G.config.UNVANLAR;
  for (var i = 0; i < liste.length; i++) {
    if (netVarlik >= liste[i].esik) return liste[i].ad;
  }
  return liste[liste.length - 1].ad;
};

// Kusur tipinin okunur adi
G.kusurAdi = function (tip) {
  var adlar = {
    boya: "boyalı parça",
    degisen: "değişen parça",
    tramer: "tramer kaydı",
    lastik: "lastik masrafı",
    motor: "motor arızası",
    agirHasar: "ağır hasar kaydı",
    sase: "şase uyumsuzluğu"
  };
  return adlar[tip] || tip;
};

G.gorunurlukAdi = function (g) {
  if (g === "acik") return "gozle gorunur";
  if (g === "normal") return "ekspertizde cikar";
  return "gizli";
};

// Replik yer tutuculari: {fiyat}, {model}, {parca}
G.replikDoldur = function (metin, veri) {
  return String(metin).replace(/\{(\w+)\}/g, function (tam, anahtar) {
    return veri && veri[anahtar] !== undefined ? veri[anahtar] : tam;
  });
};
