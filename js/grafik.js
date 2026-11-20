// grafik.js — 30 gunluk kümülatif kâr / kasa seyri (saf SVG, sifir bagimlilik, DOM'a dokunmaz).
// Mevcut state.defter kayitlarindan gunluk kümülatif degisimi cizer; yeni state alani gerektirmez.
window.G = window.G || {};

G.grafik = (function () {

  function kisa(tl) {
    var m = tl / 1000000;
    if (Math.abs(m) >= 1) return m.toFixed(1).replace(".", ",") + "M";
    return Math.round(tl / 1000) + "B";
  }

  function seriCikar(state) {
    var baslangic = (G.config && G.config.BASLANGIC_KASA) ? G.config.BASLANGIC_KASA : 6000000;
    var hedef = (G.config && G.config.HEDEF_NET_VARLIK) ? G.config.HEDEF_NET_VARLIK : 7500000;
    var sonGun = Math.max(1, (state && state.gun) ? Math.min(30, state.gun) : 1);
    var defter = (state && state.defter) ? state.defter : [];

    var gunlukFark = {};
    for (var i = 0; i < defter.length; i++) {
      var d = defter[i];
      if (!d || !d.gun) continue;
      var g = d.gun;
      var fark = 0;
      if (typeof d.kar === "number" && d.kar !== 0) {
        fark = d.kar;
      } else if (d.tur === "yol" && d.fiyat) {
        fark = -d.fiyat;
      }
      gunlukFark[g] = (gunlukFark[g] || 0) + fark;
    }

    var noktalar = [{ gun: 0, deger: baslangic }];
    var biriken = baslangic;
    for (var gun = 1; gun <= sonGun; gun++) {
      biriken += (gunlukFark[gun] || 0);
      noktalar.push({ gun: gun, deger: biriken });
    }
    return { noktalar: noktalar, baslangic: baslangic, hedef: hedef, sonGun: sonGun };
  }

  function ciz(state) {
    var s = seriCikar(state);
    var n = s.noktalar;
    var W = 560, H = 160;
    var padL = 52, padR = 16, padT = 18, padB = 26;
    var icW = W - padL - padR;
    var icH = H - padT - padB;

    var minV = Math.min(s.baslangic, s.hedef);
    var maxV = Math.max(s.baslangic, s.hedef);
    for (var i = 0; i < n.length; i++) {
      if (n[i].deger < minV) minV = n[i].deger;
      if (n[i].deger > maxV) maxV = n[i].deger;
    }
    var aralik = Math.max(400000, maxV - minV);
    minV -= aralik * 0.12;
    maxV += aralik * 0.12;

    function x(gun) {
      return padL + (gun / Math.max(1, s.sonGun)) * icW;
    }
    function y(val) {
      return padT + (1 - (val - minV) / (maxV - minV)) * icH;
    }

    var yol = [];
    for (var j = 0; j < n.length; j++) {
      yol.push((j === 0 ? "M " : "L ") + x(n[j].gun).toFixed(1) + " " + y(n[j].deger).toFixed(1));
    }
    var cizgiD = yol.join(" ");
    var tabanY = y(s.baslangic).toFixed(1);
    var alanD = cizgiD + " L " + x(s.sonGun).toFixed(1) + " " + tabanY +
      " L " + x(0).toFixed(1) + " " + tabanY + " Z";

    var son = n[n.length - 1];
    var karliMi = son.deger >= s.baslangic;
    var hedefY = y(s.hedef).toFixed(1);

    return '<div class="grafik-kutu">' +
      '<div class="grafik-baslik">' +
        '<span>GÜNLÜK TİCARET SEYRİ (1–' + s.sonGun + '. GÜN)</span>' +
        '<span class="grafik-ozet ' + (karliMi ? "arti" : "eksi") + '">Son: ' + kisa(son.deger) + " TL</span>" +
      "</div>" +
      '<svg class="grafik-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Günlük ticaret grafiği">' +
        // Hedef cizgisi (7.5M)
        '<line x1="' + padL + '" y1="' + hedefY + '" x2="' + (W - padR) + '" y2="' + hedefY + '" class="grf-hedef"/>' +
        '<text x="' + (padL - 6) + '" y="' + (parseFloat(hedefY) + 4).toFixed(1) + '" text-anchor="end" class="grf-etiket hedef">' + kisa(s.hedef) + "</text>" +
        // Baslangic cizgisi (6.0M)
        '<line x1="' + padL + '" y1="' + tabanY + '" x2="' + (W - padR) + '" y2="' + tabanY + '" class="grf-taban"/>' +
        '<text x="' + (padL - 6) + '" y="' + (parseFloat(tabanY) + 4).toFixed(1) + '" text-anchor="end" class="grf-etiket">' + kisa(s.baslangic) + "</text>" +
        // Dolgu ve cizgi
        '<path d="' + alanD + '" class="grf-alan ' + (karliMi ? "arti" : "eksi") + '"/>' +
        '<path d="' + cizgiD + '" class="grf-cizgi ' + (karliMi ? "arti" : "eksi") + '"/>' +
        // Son nokta
        '<circle cx="' + x(son.gun).toFixed(1) + '" cy="' + y(son.deger).toFixed(1) + '" r="4.5" class="grf-nokta ' + (karliMi ? "arti" : "eksi") + '"/>' +
        // Gun ekseni
        '<text x="' + padL + '" y="' + (H - 6) + '" class="grf-etiket">Gün 1</text>' +
        '<text x="' + (padL + icW / 2).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="grf-etiket">Gün ' + Math.round(s.sonGun / 2) + "</text>" +
        '<text x="' + (W - padR) + '" y="' + (H - 6) + '" text-anchor="end" class="grf-etiket">Gün ' + s.sonGun + "</text>" +
      "</svg>" +
    "</div>";
  }

  return {
    seriCikar: seriCikar,
    ciz: ciz
  };
})();
