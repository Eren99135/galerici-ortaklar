// ekspertiz-sema.js — ustten bakan sanayi ekspertiz kagidi (saf SVG, DOM'a dokunmaz).
// Yalnizca ortayaCikti === true olan kusurlari gosterir; gizli kusuru asla sizdirmaz.
window.G = window.G || {};

G.ekspertizSema = (function () {

  var PARCA_ETIKET = {
    "kaput": "Kaput",
    "tavan": "Tavan",
    "bagaj kapagi": "Bagaj kapağı",
    "sol on camurluk": "Sol ön çamurluk",
    "sag on camurluk": "Sağ ön çamurluk",
    "sol arka camurluk": "Sol arka çamurluk",
    "sag arka camurluk": "Sağ arka çamurluk",
    "sol on kapi": "Sol ön kapı",
    "sag on kapi": "Sağ ön kapı",
    "sol arka kapi": "Sol arka kapı",
    "sag arka kapi": "Sağ arka kapı"
  };

  function kacis(metin) {
    return String(metin === undefined || metin === null ? "" : metin)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Parcalarin durumunu cikarir: "orijinal" | "boya" | "degisen"
  // Ayni parcada hem boya hem degisen varsa degisen agir basar.
  function parcaDurumlari(araba) {
    var harita = {};
    var diger = [];
    var liste = (araba && araba.kusurlar) ? araba.kusurlar : [];

    for (var i = 0; i < liste.length; i++) {
      var k = liste[i];
      if (!k || !k.ortayaCikti) continue;
      if ((k.tip === "boya" || k.tip === "degisen") && k.parca) {
        if (k.tip === "degisen" || harita[k.parca] !== "degisen") {
          harita[k.parca] = k.tip;
        }
      } else {
        diger.push(k);
      }
    }
    return { parcalar: harita, diger: diger };
  }

  function sinif(harita, ad) {
    var d = harita[ad];
    if (d === "degisen") return "eks-parca eks-degisen";
    if (d === "boya") return "eks-parca eks-boya";
    return "eks-parca eks-orijinal";
  }

  function durumMetni(d) {
    if (d === "degisen") return "Değişen";
    if (d === "boya") return "Boyalı";
    return "Orijinal";
  }

  function rozetMetni(k) {
    if (k.tip === "sase") return "ŞASE HASARLI";
    if (k.tip === "agirHasar") return "AĞIR HASAR KAYDI";
    if (k.tip === "motor") return "MOTOR SORUNLU";
    if (k.tip === "lastik") return "LASTİKLER BİTİK";
    if (k.tip === "tramer") {
      var hamTutar = k.tramerTutar || k.etki;
      var tutar = hamTutar ? (G.kisaFiyat ? G.kisaFiyat(hamTutar) : Math.round(hamTutar / 1000) + " bin") : "";
      return "TRAMER" + (tutar ? " " + tutar : "");
    }
    return k.tip ? k.tip.toUpperCase() : "KUSUR";
  }

  function ciz(araba) {
    var analiz = parcaDurumlari(araba);
    var p = analiz.parcalar;
    var diger = analiz.diger;

    var boyaSay = 0, degisenSay = 0;
    for (var key in p) {
      if (p[key] === "boya") boyaSay++;
      else if (p[key] === "degisen") degisenSay++;
    }

    var seviyeAd = "Göz Kontrolü";
    if (araba && araba.ekspertizSeviyesi === "normal") seviyeAd = "Normal Ekspertiz";
    else if (araba && araba.ekspertizSeviyesi === "premium") seviyeAd = "Premium Ekspertiz";
    else if (araba && araba.ekspertizSeviyesi === "tanidik") seviyeAd = "Tanıdık Ekspertiz";

    var temizMi = (boyaSay === 0 && degisenSay === 0 && diger.length === 0);
    var baslik = (araba && araba.marka) ? (araba.marka + " " + araba.model + (araba.yil ? " · " + araba.yil : "")) : "Araç Şeması";

    function pEl(tag, attrs, ad) {
      var ipucu = (PARCA_ETIKET[ad] || ad) + ": " + durumMetni(p[ad]);
      return "<" + tag + " " + attrs + ' class="' + sinif(p, ad) + '" data-parca="' + kacis(ad) + '">' +
        "<title>" + kacis(ipucu) + "</title></" + tag + ">";
    }

    // Ustten bakan araba semasi: 220x320 viewBox, on yukarida (kaput ustte, bagaj altta)
    var svg =
      '<svg class="eks-svg" viewBox="0 0 220 320" role="img" aria-label="Ekspertiz gövde şeması">' +
        // Tekerlekler (dekoratif, disarida)
        '<rect x="18" y="48" width="14" height="44" rx="5" class="eks-teker"/>' +
        '<rect x="188" y="48" width="14" height="44" rx="5" class="eks-teker"/>' +
        '<rect x="18" y="226" width="14" height="44" rx="5" class="eks-teker"/>' +
        '<rect x="188" y="226" width="14" height="44" rx="5" class="eks-teker"/>' +

        // On ve arka tampon (dekoratif)
        '<path d="M 48 24 Q 110 8 172 24 L 168 38 L 52 38 Z" class="eks-tampon"/>' +
        '<path d="M 52 284 L 168 284 L 172 298 Q 110 312 48 298 Z" class="eks-tampon"/>' +

        // 1. Kaput
        pEl("path", 'd="M 54 38 L 166 38 L 162 104 L 58 104 Z"', "kaput") +
        // On cam (dekoratif)
        '<path d="M 60 106 L 160 106 L 154 134 L 66 134 Z" class="eks-cam"/>' +
        // 2. Tavan
        pEl("rect", 'x="66" y="136" width="88" height="74" rx="8"', "tavan") +
        // Arka cam (dekoratif)
        '<path d="M 66 212 L 154 212 L 160 236 L 60 236 Z" class="eks-cam"/>' +
        // 3. Bagaj kapagi
        pEl("path", 'd="M 58 238 L 162 238 L 166 282 L 54 282 Z"', "bagaj kapagi") +

        // 4-5. Sol / Sag on camurluk
        pEl("path", 'd="M 34 42 L 52 38 L 56 108 L 34 108 Z"', "sol on camurluk") +
        pEl("path", 'd="M 168 38 L 186 42 L 186 108 L 164 108 Z"', "sag on camurluk") +

        // 6-7. Sol / Sag on kapi
        pEl("path", 'd="M 34 110 L 58 110 L 62 172 L 34 172 Z"', "sol on kapi") +
        pEl("path", 'd="M 162 110 L 186 110 L 186 172 L 158 172 Z"', "sag on kapi") +

        // 8-9. Sol / Sag arka kapi
        pEl("path", 'd="M 34 174 L 62 174 L 58 232 L 34 232 Z"', "sol arka kapi") +
        pEl("path", 'd="M 158 174 L 186 174 L 186 232 L 162 232 Z"', "sag arka kapi") +

        // 10-11. Sol / Sag arka camurluk
        pEl("path", 'd="M 34 234 L 56 234 L 52 282 L 34 278 Z"', "sol arka camurluk") +
        pEl("path", 'd="M 164 234 L 186 234 L 186 278 L 168 282 Z"', "sag arka camurluk") +

        // Yon ve taraf ipuclari
        '<text x="110" y="20" text-anchor="middle" class="eks-yon">ÖN</text>' +
        '<text x="110" y="314" text-anchor="middle" class="eks-yon">ARKA</text>' +
        '<text x="10" y="164" text-anchor="middle" class="eks-yon" transform="rotate(-90 10 164)">SOL</text>' +
        '<text x="210" y="164" text-anchor="middle" class="eks-yon" transform="rotate(90 210 164)">SAĞ</text>' +
      "</svg>";

    // Diger kusur rozetleri (sase, agirHasar, motor, tramer, lastik)
    var rozetler = "";
    for (var j = 0; j < diger.length; j++) {
      var agirMi = (diger[j].tip === "sase" || diger[j].tip === "agirHasar" || diger[j].tip === "motor");
      rozetler += '<span class="eks-rozet' + (agirMi ? " agir" : "") + '">' + kacis(rozetMetni(diger[j])) + "</span>";
    }
    if (temizMi) {
      rozetler = '<span class="eks-rozet temiz">GÖRÜNEN KUSUR YOK</span>';
    }

    // Kisa parca listesi (renkli nokta ile)
    var parcaOzeti = "";
    var sira = [
      "kaput", "tavan", "bagaj kapagi",
      "sol on camurluk", "sag on camurluk",
      "sol on kapi", "sag on kapi",
      "sol arka kapi", "sag arka kapi",
      "sol arka camurluk", "sag arka camurluk"
    ];
    for (var m = 0; m < sira.length; m++) {
      var ad = sira[m];
      if (!p[ad]) continue;
      parcaOzeti += '<div class="eks-satir"><i class="eks-nokta ' + p[ad] + '"></i>' +
        kacis(PARCA_ETIKET[ad]) + ': <b>' + durumMetni(p[ad]) + "</b></div>";
    }

    return '<div class="eks-kagit">' +
      '<div class="eks-ust">' +
        '<div><div class="eks-baslik">EKSPERTİZ RAPORU</div><div class="eks-alt">' + kacis(baslik) + "</div></div>" +
        '<span class="eks-damga">' + kacis(seviyeAd) + "</span>" +
      "</div>" +
      '<div class="eks-govde">' +
        '<div class="eks-sema-kutu">' + svg + "</div>" +
        '<div class="eks-bilgi">' +
          '<div class="eks-lejant">' +
            '<span><i class="eks-nokta orijinal"></i>Orijinal</span>' +
            '<span><i class="eks-nokta boya"></i>Boyalı (' + boyaSay + ")</span>" +
            '<span><i class="eks-nokta degisen"></i>Değişen (' + degisenSay + ")</span>" +
          "</div>" +
          '<div class="eks-rozetler">' + rozetler + "</div>" +
          (parcaOzeti ? '<div class="eks-liste">' + parcaOzeti + "</div>" : "") +
        "</div>" +
      "</div>" +
      "</div>";
  }

  return {
    ciz: ciz,
    parcaDurumlari: parcaDurumlari
  };
})();
