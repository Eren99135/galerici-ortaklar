// sahne.js — gorsel roman sahnesi: arka plan + onunde karakter PNG'si.
// Karar #17: kodla cizilen SVG sahneler birakildi. Burada sadece gorsel yerlestirme var.
//
// DOSYA ADI KURALI (gorsel atilinca kendiliginden oturur):
//   img/mekan/<mekan>.jpg            yoksa .png              yoksa gradyan + mekan adi
//   img/karakter/<kisi>-<ifade>.png  yoksa <kisi>-normal.png yoksa renkli siluet
//
// Mekan gorseli: yatay 16:9, en az 1600x900, ICINDE INSAN OLMASIN.
// Karakter gorseli: dikey, seffaf arka plan, ~900x1200, tam boy, zemin cizgisi altta.
window.G = window.G || {};

G.sahne = (function () {

  // ---------- mekanlar ----------
  var MEKANLAR = {
    "galeri-onu":   { ad: "Galeri önü",    ust: "#49566B", alt: "#1C2330" },
    "galeri-ici":   { ad: "Galeri içi",    ust: "#5B4E3E", alt: "#241D16" },
    "sanayi-avlu":  { ad: "Sanayi avlusu", ust: "#4E5666", alt: "#1A1E27" },
    "ilan-sokak":   { ad: "Sanayi sokağı", ust: "#53606F", alt: "#1D232C" },
    "ekspertiz":    { ad: "Ekspertiz",     ust: "#48515D", alt: "#171B21" },
    "noter":        { ad: "Noter",         ust: "#5E5342", alt: "#241F18" },
    "buro":         { ad: "Büro",          ust: "#55493A", alt: "#211C15" },
    "ev-sofra":     { ad: "Ablanın evi",   ust: "#64513D", alt: "#271E16" },
    "kahve":        { ad: "Kahve",         ust: "#4D4335", alt: "#1E1913" },
    "lokanta":     { ad: "Lokanta", ust: "#3A2A1C", alt: "#15110C" },
    "gece-sanayi":  { ad: "Gece sanayi",   ust: "#222A3A", alt: "#0D1016" },
    "gece-sokak":   { ad: "Gece sokak",    ust: "#1B2630", alt: "#090D11" },
    "yol":          { ad: "Yol",           ust: "#44506A", alt: "#161B25" }
  };

  // ---------- karakterler ----------
  var KARAKTERLER = {
    nuri:      { ad: "Nuri",         renk: "#F6C12A" },
    drej:      { ad: "Drej",         renk: "#4E6490" },
    kro:       { ad: "Kro",          renk: "#E88A2E" },
    riza:      { ad: "Rıza",         renk: "#C8202E" },
    sukru:     { ad: "Şükrü abi",    renk: "#C9BBA2" },
    abla:      { ad: "Abla",         renk: "#3FA34D" },
    satici:    { ad: "Satıcı",       renk: "#8A929E" },
    musteri:   { ad: "Müşteri",      renk: "#79838F" },
    noter:     { ad: "Noter",        renk: "#6F7684" },
    teknisyen: { ad: "Ekspertizci",  renk: "#3E6B8A" },
    musavir:   { ad: "Mali müşavir", renk: "#7A6E8A" },
    cuneyt:    { ad: "Cüneyt",       renk: "#5A5A5A" },
    polis:     { ad: "Polis",        renk: "#2F4D7A" }
  };

  var IFADELER = ["normal", "sevincli", "sinirli"];
  var KONUMLAR = ["sol", "orta", "sag"];

  function mekanBilgi(mekan) { return MEKANLAR[mekan] || MEKANLAR["sanayi-avlu"]; }
  function karakterBilgi(kim) { return KARAKTERLER[kim] || KARAKTERLER.satici; }

  function mekanYolu(mekan, uzanti) {
    return "img/mekan/" + mekan + "." + (uzanti || "jpg");
  }
  // Eski ifade adlari da kabul edilir, yeni uclu listeye dusurulur
  var IFADE_ESLESME = {
    kizgin: "sinirli", sinirli: "sinirli", sevincli: "sevincli",
    sasirmis: "normal", uzgun: "normal", kurnaz: "normal", normal: "normal"
  };

  function ifadeDuzelt(ifade) {
    return IFADE_ESLESME[ifade] || "normal";
  }

  function karakterYolu(kim, ifade) {
    return "img/karakter/" + kim + "-" + ifadeDuzelt(ifade) + ".png";
  }

  // "VW Passat" -> "vw-passat", "Tofaş Şahin" -> "tofas-sahin", "BMW 3.20i" -> "bmw-3-20i"
  var HARF = {
    "ş": "s", "Ş": "s", "ı": "i", "İ": "i", "ğ": "g", "Ğ": "g",
    "ü": "u", "Ü": "u", "ö": "o", "Ö": "o", "ç": "c", "Ç": "c",
    "á": "a", "à": "a", "â": "a", "ä": "a", "å": "a", "ã": "a",
    "é": "e", "è": "e", "ê": "e", "ë": "e", "É": "e", "È": "e",
    "í": "i", "ì": "i", "î": "i", "ï": "i",
    "ó": "o", "ò": "o", "ô": "o", "õ": "o", "ø": "o",
    "ú": "u", "ù": "u", "û": "u",
    "ñ": "n", "ý": "y", "ÿ": "y", "ß": "ss",
    "š": "s", "Š": "s", "ž": "z", "Ž": "z", "č": "c", "Č": "c", "ř": "r", "ě": "e"
  };

  function sadelestir(metin) {
    var cikti = "";
    for (var i = 0; i < metin.length; i++) {
      var h = metin.charAt(i);
      cikti += HARF.hasOwnProperty(h) ? HARF[h] : h;
    }
    return cikti.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function arabaAnahtari(araba) {
    if (!araba) return "";
    if (typeof araba === "string") return sadelestir(araba);
    return sadelestir((araba.marka || "") + " " + (araba.model || ""));
  }

  function arabaYolu(anahtar, uzanti) {
    return "img/araba/" + anahtar + "." + (uzanti || "png");
  }

  // Elimizde her govde tipinin fotografi yok. Yoksa en yakinina duser:
  // bir hatchback ile sedan sahnedeki olcekte neredeyse ayni gorunuyor.
  var GOVDE_YEDEK = {
    hatchback: "sedan",
    station: "sedan",
    klasik: "sedan",
    suv: "pickup",
    ticari: "pickup"
  };

  // Sahnedeki araba: once modelin kendi fotografi, sonra govde tipi, o da yoksa hicbir sey
  function arabaKatmani(araba) {
    if (!araba) return "";
    var anahtar = araba.anahtar || arabaAnahtari(araba);
    var govde = araba.govde || "sedan";
    if (!anahtar) return "";

    var yollar = [];
    if (anahtar) {
      yollar.push(arabaYolu(anahtar, "png"));
      yollar.push(arabaYolu(anahtar, "webp"));
    }
    yollar.push(arabaYolu(govde, "png"));
    yollar.push(arabaYolu(govde, "webp"));
    if (GOVDE_YEDEK[govde]) {
      yollar.push(arabaYolu(GOVDE_YEDEK[govde], "png"));
      yollar.push(arabaYolu(GOVDE_YEDEK[govde], "webp"));
    }
    yollar = yollar.filter(varOlabilir);
    if (!yollar.length) return "";

    return '<div class="sahne-araba" data-araba="' + kacis(anahtar) + '">' +
      fotoImg("araba-foto", yollar, "") + "</div>";
  }

  function kacis(metin) {
    return String(metin === undefined || metin === null ? "" : metin)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ---------- bulunamayan gorseller ----------
  // Oyun her aksiyonda yeniden ciziliyor; olmayan dosyayi bir kez deneyip birakiyoruz.
  var bulunamayanlar = {};

  function bulunamadi(yol) {
    if (yol) bulunamayanlar[yol] = true;
  }

  function varOlabilir(yol) {
    return !bulunamayanlar[yol];
  }

  // ---------- katmanlar ----------

  // Birden fazla uzanti denenir: ilki yuklenirse o gorunur, hepsi bosa cikarsa yer tutucu kalir
  function fotoImg(sinif, yollar, onloadKod) {
    var kalan = yollar.slice(1).join(",");
    return '<img class="' + sinif + '" alt="" src="' + yollar[0] + '" data-kalan="' + kalan + '" ' +
      'onload="' + onloadKod + '" ' +
      'onerror="G.sahne.bulunamadi(this.getAttribute(&quot;src&quot;));' +
      'var k=(this.dataset.kalan||&quot;&quot;).split(&quot;,&quot;).filter(Boolean);' +
      'if(k.length){var u=k.shift();this.dataset.kalan=k.join(&quot;,&quot;);this.src=u;}else{this.remove();}">';
  }

  function mekanKatmani(mekan) {
    var m = mekanBilgi(mekan);
    var yollar = [mekanYolu(mekan, "jpg"), mekanYolu(mekan, "png"), mekanYolu(mekan, "webp")]
      .filter(varOlabilir);
    return '<div class="mekan" style="background:linear-gradient(170deg,' + m.ust + " 0%," + m.alt + ' 100%)">' +
      '<span class="mekan-ad">' + kacis(m.ad) + "</span>" +
      (yollar.length
        ? fotoImg("mekan-foto", yollar,
            "var a=this.parentNode.querySelector(&quot;.mekan-ad&quot;); if(a){a.style.display=&quot;none&quot;;}")
        : "") +
      "</div>";
  }

  function karakterKatmani(k, konusanMi) {
    var bilgi = karakterBilgi(k.kim);
    var konum = KONUMLAR.indexOf(k.konum) === -1 ? "orta" : k.konum;
    var ifadeli = karakterYolu(k.kim, k.ifade);
    var normali = karakterYolu(k.kim, "normal");
    var yollar = ifadeli === normali ? [ifadeli] : [ifadeli, normali];
    yollar = yollar.filter(varOlabilir);

    // Gorsel yoksa figur cizilmez; yerinde sadece isim etiketi durur (Adim 16)
    if (yollar.length === 0) {
      return '<div class="karakter adsiz ' + konum + (konusanMi ? " konusan" : "") +
        '" data-kim="' + kacis(k.kim) + '">' +
        '<span class="karakter-ad">' + kacis(bilgi.ad) + "</span></div>";
    }

    return '<div class="karakter ' + konum + (konusanMi ? " konusan" : " geride") +
      '" data-kim="' + kacis(k.kim) + '">' +
      fotoImg("karakter-foto", yollar, "this.classList.add(&quot;yuklendi&quot;);") +
      '<span class="karakter-ad">' + kacis(bilgi.ad) + "</span>" +
      "</div>";
  }

  // ---------- dis arayuz ----------

  // o = { mekan, kisiler: [{kim, ifade, konum}], konusan }
  function ciz(o, ustKatman) {
    var veri = o || {};
    var mekan = veri.mekan || "sanayi-avlu";
    var kisiler = veri.kisiler || [];
    var isik = veri.isik || veri.konusan;
    var h = '<div class="sahne" data-mekan="' + kacis(mekan) + '">';
    h += mekanKatmani(mekan);
    h += arabaKatmani(veri.araba);
    // Uc kisilik sahnelerde ortadaki figur galerinin tabelasini kapatiyordu; kap
    // sinifi CSS'e kac kisi oldugunu soyluyor, olcu orada kuculuyor.
    h += '<div class="sahne-kisiler' + (kisiler.length >= 3 ? " uclu" : "") + '">';
    for (var i = 0; i < kisiler.length; i++) {
      h += karakterKatmani(kisiler[i], isik ? kisiler[i].kim === isik : false);
    }
    h += "</div>";
    h += '<i class="sahne-perde"></i>';
    if (ustKatman) h += '<div class="sahne-konusma">' + ustKatman + "</div>";
    h += "</div>";
    return h;
  }

  // Ekran anahtarini sahne nesnesine cevirir, ui.js sade kalsin
  function hazir(anahtar, veri) {
    var v = veri || {};
    var sonuc = hazirIc(anahtar, v);
    if (v.isik) sonuc.isik = v.isik;
    if (v.araba) sonuc.araba = v.araba;

    // Rehberde konusan sahnede yoksa eklenir (Adim 16)
    if (v.ekKisi) {
      var varMi = false;
      for (var i = 0; i < sonuc.kisiler.length; i++) {
        if (sonuc.kisiler[i].kim === v.ekKisi) varMi = true;
      }
      if (!varMi) {
        var bosKonum = "orta";
        var dolu = sonuc.kisiler.map(function (k) { return k.konum; });
        if (dolu.indexOf("sol") === -1) bosKonum = "sol";
        else if (dolu.indexOf("orta") === -1) bosKonum = "orta";
        else bosKonum = "sag";
        sonuc.kisiler.push({ kim: v.ekKisi, konum: bosKonum, ifade: v.ekIfade || "normal" });
      }
      sonuc.isik = v.ekKisi;
    }
    return sonuc;
  }

  function hazirIc(anahtar, veri) {
    var v = veri || {};
    var konusan = v.konusan || "nuri";
    var saticiIfade = v.saticiIfade ||
      (v.ruh === "kizgin" ? "sinirli" : "normal");
    var satici = { kim: "satici", ifade: saticiIfade, konum: "sag" };
    var musteri = { kim: "musteri", ifade: v.musteriIfade || "normal", konum: "sol" };

    switch (anahtar) {
      case "giris":
        return { mekan: "galeri-onu", konusan: "nuri", kisiler: [
          { kim: "nuri", konum: "sol" }, { kim: "drej", konum: "orta" }, { kim: "kro", konum: "sag" }] };
      case "dukkan":
        return { mekan: v.aksam ? "gece-sanayi" : "galeri-onu", konusan: v.konusan || null, kisiler: [
          { kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }] };
      case "ilanlar":
        return { mekan: "ilan-sokak", konusan: v.konusan || "kro", kisiler: [{ kim: "kro", konum: "sag" }] };
      case "araba":
        return { mekan: "sanayi-avlu", konusan: v.konusan || "satici", kisiler: [satici] };
      case "ekspertiz":
        return { mekan: "ekspertiz", konusan: v.konusan || "teknisyen", kisiler: [
          { kim: "drej", konum: "sol" }, { kim: "teknisyen", konum: "sag" }] };
      case "pazarlik":
        // Araba ALINAN ekran saticinin mekaninda gecer: ilan detayi da (case "araba")
        // ayni avluda. Bu ara cozum degil, kalici esleme — satis tarafi "galeri-onu".
        return { mekan: "sanayi-avlu", konusan: v.konusan, kisiler: [
          { kim: konusan, ifade: v.ortakIfade || "normal", konum: "sol" }, satici] };
      case "sinav":
        return { mekan: "buro", konusan: v.konusan || v.isik || "drej", kisiler: [
          { kim: v.isik === "nuri" ? "nuri" : "drej", konum: "orta" },
          { kim: "musavir", konum: "sag" }
        ] };
      case "noter":
        return { mekan: "noter", konusan: "noter", kisiler: [
          { kim: "nuri", konum: "sol" }, { kim: "noter", konum: "orta" }, { kim: "drej", konum: "sag" }] };
      case "musteri":
      case "satis":
        return { mekan: "galeri-onu", konusan: v.konusan || "musteri", kisiler: [
          musteri, { kim: konusan, konum: "sag" }] };
      case "yakalandi":
        return { mekan: "galeri-onu", konusan: "musteri", kisiler: [
          { kim: "musteri", ifade: "sinirli", konum: "sol" },
          { kim: konusan, ifade: "normal", konum: "sag" }] };
      case "aksam":
        return { mekan: "gece-sanayi", konusan: v.konusan || "drej", kisiler: [
          { kim: "drej", ifade: v.ozet === "EKSİDEYİZ" ? "sinirli" : "normal", konum: "sol" },
          { kim: "nuri", ifade: v.ozet === "BEREKET" ? "sevincli" : "normal", konum: "sag" }] };
      case "gece":
        return { mekan: "gece-sanayi", konusan: v.konusan || "drej", kisiler: [
          { kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }] };
      case "defter":
        return { mekan: "galeri-ici", konusan: "drej", kisiler: [{ kim: "drej", konum: "orta" }] };
      case "bitis-kazandi":
        return { mekan: "galeri-onu", konusan: "nuri", kisiler: [
          { kim: "nuri", ifade: "sevincli", konum: "sol" },
          { kim: "drej", ifade: "sevincli", konum: "orta" },
          { kim: "kro", ifade: "sevincli", konum: "sag" }] };
      case "bitis-batti":
        return { mekan: "gece-sanayi", konusan: "nuri", kisiler: [
          { kim: "nuri", ifade: "normal", konum: "sol" },
          { kim: "drej", ifade: "normal", konum: "sag" }] };
      case "bitis-son":
        return { mekan: "galeri-onu", konusan: "drej", kisiler: [
          { kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }] };
      default:
        return { mekan: "sanayi-avlu", konusan: null, kisiler: [] };
    }
  }

  // Olay karti kategorisi -> sahne
  function kartSahnesi(kategori) {
    var harita = {
      "RIZA":        { mekan: "sanayi-avlu", konusan: "riza", kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "riza", ifade: "normal", konum: "sag" }] },
      "KRO":         { mekan: "galeri-onu",  konusan: "kro",  kisiler: [{ kim: "kro", konum: "sol" }, { kim: "nuri", ifade: "sinirli", konum: "sag" }] },
      "CUMA":        { mekan: "ilan-sokak",  konusan: "nuri", kisiler: [{ kim: "nuri", konum: "orta" }] },
      // Ceza dukkana geliyor ("tezgahtaki arabaya hiz cezasi gelmis"), yol kenari degil
      "POLİS":       { mekan: "galeri-onu",  konusan: "polis", kisiler: [{ kim: "kro", ifade: "normal", konum: "sol" }, { kim: "polis", konum: "sag" }] },
      "BÜROKRASİ":   { mekan: "buro",        konusan: "musavir", kisiler: [{ kim: "drej", konum: "sol" }, { kim: "musavir", konum: "sag" }] },
      "ŞÜKRÜ ABİ":   { mekan: "kahve",       konusan: "sukru", kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "sukru", konum: "sag" }] },
      "ABLA":        { mekan: "ev-sofra",    konusan: "abla", kisiler: [{ kim: "abla", konum: "sol" }, { kim: "nuri", konum: "sag" }] },
      // Sahte ilanin bulusmasi karanlik sokakta; gece-sanayi kendi avlumuz, orasi aksam raporunun yeri
      "DOLANDIRICI": { mekan: "gece-sokak",  konusan: "cuneyt", kisiler: [{ kim: "drej", ifade: "sinirli", konum: "sol" }, { kim: "cuneyt", ifade: "normal", konum: "sag" }] },
      "SANAYİ":      { mekan: "sanayi-avlu", konusan: "nuri", kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }] },
      "ŞİKÂYET":     { mekan: "galeri-onu",  konusan: "musteri", kisiler: [{ kim: "musteri", ifade: "sinirli", konum: "sol" }, { kim: "nuri", ifade: "normal", konum: "sag" }] }
    };
    return harita[kategori] || harita["SANAYİ"];
  }

  return {
    ciz: ciz,
    hazir: hazir,
    kartSahnesi: kartSahnesi,
    mekanYolu: mekanYolu,
    karakterYolu: karakterYolu,
    arabaAnahtari: arabaAnahtari,
    arabaYolu: arabaYolu,
    govdeYedegi: function (govde) { return GOVDE_YEDEK[govde] || null; },
    mekanBilgi: mekanBilgi,
    karakterBilgi: karakterBilgi,
    bulunamadi: bulunamadi,
    ifadeDuzelt: ifadeDuzelt,
    mekanlar: function () { return Object.keys(MEKANLAR); },
    karakterler: function () { return Object.keys(KARAKTERLER); },
    ifadeler: function () { return IFADELER.slice(); },
    konumlar: function () { return KONUMLAR.slice(); }
  };
})();
