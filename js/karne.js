// karne.js — 30. gun Galeri Karnesi, oyun tarzi unvani ve tohum paylasimi.
// Mevcut state.defter, state.istatistik ve state.tohum uzerinden hesaplar;
// state.js yapisina veya RNG akisina hic dokunmaz. DOM'a dokunmaz.
window.G = window.G || {};

G.karne = (function () {

  function kacis(metin) {
    return String(metin === undefined || metin === null ? "" : metin)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function para(n) {
    if (typeof G.paraYaz === "function") return G.paraYaz(n);
    var v = Math.round(n || 0);
    var isaret = v < 0 ? "-" : "";
    return isaret + Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " TL";
  }

  function analizEt(state) {
    var defter = (state && state.defter) ? state.defter : [];
    var ist = (state && state.istatistik) ? state.istatistik : {};

    var enIyi = null;
    var enKotu = null;
    var modelSayac = {};
    var satisSay = 0;
    var toplamKar = 0;

    for (var i = 0; i < defter.length; i++) {
      var d = defter[i];
      if (!d) continue;
      var satisTuru = (d.tur === "satis" || d.tur === "konsinye-satis");
      var zararTuru = (satisTuru || d.tur === "hurda" || d.tur === "karsiliksiz");

      if (satisTuru) {
        satisSay++;
        if (d.araba) {
          // Yili atip model adina gore say: "Opel Corsa 2018" -> "Opel Corsa"
          var temizAd = String(d.araba).replace(/\s+\d{4}$/, "");
          modelSayac[temizAd] = (modelSayac[temizAd] || 0) + 1;
        }
      }
      if (typeof d.kar === "number") {
        toplamKar += d.kar;
        if (satisTuru && d.kar > 0 && (!enIyi || d.kar > enIyi.kar)) {
          enIyi = { araba: d.araba || "Araç", kar: d.kar, gun: d.gun };
        }
        if (zararTuru && d.kar < 0 && (!enKotu || d.kar < enKotu.kar)) {
          enKotu = { araba: d.araba || "Araç", kar: d.kar, gun: d.gun, tur: d.tur };
        }
      }
    }

    var favoriModel = null;
    var favoriAdet = 0;
    for (var ad in modelSayac) {
      if (modelSayac[ad] > favoriAdet) {
        favoriAdet = modelSayac[ad];
        favoriModel = ad;
      }
    }

    var tarz = tarzBelirle(state, ist, satisSay);
    return {
      enIyi: enIyi,
      enKotu: enKotu,
      favoriModel: favoriModel,
      favoriAdet: favoriAdet,
      satisSay: satisSay,
      toplamKar: toplamKar,
      tarz: tarz,
      tohum: (state && state.tohum) ? state.tohum : 1
    };
  }

  function tarzBelirle(state, ist, satisSay) {
    var itibar = (state && typeof state.itibar === "number") ? state.itibar : 50;
    if ((ist.saklanan || 0) >= 3) {
      return { ad: "Çakal Galerici", aciklama: "Kusuru halının altına süpürdün, sanayide adın çıktı." };
    }
    if ((ist.sefer || 0) >= 3) {
      return { ad: "Şehirlerarası Avcı", aciklama: "Anadolu'yu dolaşıp kelepir araba topladın." };
    }
    if ((ist.konsinyeSatilan || 0) >= 3) {
      return { ad: "Konsinye Baronu", aciklama: "Cebinden pere çıkarmadan komisyonla kasa doldurdun." };
    }
    if ((ist.takasYapilan || 0) >= 3) {
      return { ad: "Takas Ustası", aciklama: "Nakit yerine anahtarı anahtarla çevirdin." };
    }
    if ((ist.cekAlinan || 0) >= 3) {
      return { ad: "Çek Kumarbazı", aciklama: "Vadeli kâğıda güvendin, sinirlerin çelik gibi." };
    }
    if ((ist.saklanan || 0) === 0 && satisSay >= 5 && itibar >= 75) {
      return { ad: "Temiz Esnaf", aciklama: "Sözün senet oldu, müşteri kapıdan eksik olmadı." };
    }
    if ((ist.enIyiPazarlik || 0) >= 150000) {
      return { ad: "Pazarlık Kurdu", aciklama: "Masaya oturdun mu satıcıyı terletmeden kalkmadın." };
    }
    return { ad: "Mahalle Galericisi", aciklama: "Al-sat dengesini koruyup dükkânı ayakta tuttun." };
  }

  function ciz(state) {
    var r = analizEt(state);
    var grafikHtml = (G.grafik && typeof G.grafik.ciz === "function") ? G.grafik.ciz(state) : "";

    var enIyiMetin = r.enIyi
      ? kacis(r.enIyi.araba) + ' <b class="karne-arti">+' + kacis(para(r.enIyi.kar)) + "</b>"
      : '<span class="karne-yok">Kârlı satış yok</span>';

    var enKotuMetin = r.enKotu
      ? kacis(r.enKotu.araba) + ' <b class="karne-eksi">' + kacis(para(r.enKotu.kar)) + "</b>"
      : '<span class="karne-yok">Zararlı işlem yok</span>';

    var favoriMetin = r.favoriModel
      ? kacis(r.favoriModel) + " (" + r.favoriAdet + " kez)"
      : '<span class="karne-yok">—</span>';

    return '<div class="karne-kutu">' +
      '<div class="karne-ust">' +
        '<div>' +
          '<div class="karne-etiket">GALERİ KARNESİ</div>' +
          '<div class="karne-unvan">' + kacis(r.tarz.ad) + "</div>" +
          '<div class="karne-aciklama">' + kacis(r.tarz.aciklama) + "</div>" +
        "</div>" +
        '<div class="karne-tohum-kutu">' +
          '<span class="karne-tohum-etiket">OYUN TOHUMU</span>' +
          '<b class="karne-tohum-kod">#' + kacis(r.tohum) + "</b>" +
          '<button type="button" class="karne-kopyala" data-is="tohumKopyala" data-tohum="' + kacis(r.tohum) + '">Tohumu Kopyala</button>' +
        "</div>" +
      "</div>" +

      '<div class="karne-izgara">' +
        '<div class="karne-kart">' +
          '<span class="karne-kart-baslik">EN İYİ VURGUN</span>' +
          '<div class="karne-kart-deger">' + enIyiMetin + "</div>" +
        "</div>" +
        '<div class="karne-kart">' +
          '<span class="karne-kart-baslik">EN KÖTÜ KAZIK</span>' +
          '<div class="karne-kart-deger">' + enKotuMetin + "</div>" +
        "</div>" +
        '<div class="karne-kart">' +
          '<span class="karne-kart-baslik">EN ÇOK SATILAN</span>' +
          '<div class="karne-kart-deger">' + favoriMetin + "</div>" +
        "</div>" +
      "</div>" +

      grafikHtml +

      '<div class="karne-yaris">' +
        '<span class="karne-yaris-metin">Arkadaşınla aynı 30 günü oyna:</span>' +
        '<input type="number" class="karne-tohum-girdi" id="tohumGirdi" min="1" max="9999999" placeholder="Tohum no (ör. ' + kacis(r.tohum) + ')">' +
        '<button type="button" class="karne-yaris-btn" data-is="tohumlaBaslat">Bu Tohumla Başla</button>' +
      "</div>" +
    "</div>";
  }

  return {
    analizEt: analizEt,
    ciz: ciz
  };
})();
