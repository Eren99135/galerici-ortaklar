// belge.js — yetki belgesi sinavi ve belgesiz satis denetimi (Adim 22, tasarim/14).
// Dizide 34. bolum: Drej 88, Nuri 60; baraj %70. Belgesiz satista ~400.000 ceza.
window.G = window.G || {};

G.belge = (function () {
  var C = function () { return G.config; };

  function belgeliMi(state) {
    // Testlerdeki sade state nesnelerinde belge alani olmayabilir
    return !!(state.belge && state.belge.alindi);
  }

  function engel(state) {
    var c = C();
    if (state.bitis) return "Oyun bitti ortak.";
    if (belgeliMi(state)) return "Belge zaten alındı.";
    if (state.faz !== "mesai") return "Sınava mesai içinde girilir.";
    if (state.aksiyon < 1) return "Bugün aksiyon hakkın kalmadı ortak.";
    if (state.kasa < c.SINAV_BEDEL) return "Sınav harcı için kasada pere yok.";
    if (!state.belge) return "Belge kaydı yok.";
    if (state.belge.sonDeneme && state.gun - state.belge.sonDeneme < c.SINAV_BEKLEME) {
      var kalan = c.SINAV_BEKLEME - (state.gun - state.belge.sonDeneme);
      return "Yeni sınav " + kalan + " gün sonra.";
    }
    return null;
  }

  function girebilirMi(state) {
    return engel(state) === null;
  }

  function soruHavuzu() { return G.data.sinavSorulari || []; }

  // Sinavi kurar: havuzdan rastgele sorular, siklar karistirilmaz (sabit kalsin,
  // dogru sik indeksi veride duruyor). Drej girerse her soruda bir yanlis sik elenir.
  function sinavBaslat(state, kim) {
    var c = C();
    var hata = engel(state);
    if (hata) return { hata: hata };
    if (kim !== "nuri" && kim !== "drej") return { hata: "Sınava Nuri ya da Drej girer." };
    if (kim === "nuri" && G.karakterler.nuriYokMu(state)) {
      return { hata: "Nuri bugün ablasının yanında." };
    }

    state.kasa -= c.SINAV_BEDEL;
    state.aksiyon--;
    state.belge.sonDeneme = state.gun;
    state.istatistik.sinavDenemesi++;

    var havuz = soruHavuzu().slice();
    var secilen = [];
    for (var i = 0; i < c.SINAV_SORU && havuz.length; i++) {
      var sira = G.rng.tam(0, havuz.length - 1);
      var soru = havuz[sira];
      havuz.splice(sira, 1);

      var elenen = -1;
      if (kim === "drej") {                    // Drej bir yanlis sikki eler
        var yanlislar = [];
        for (var j = 0; j < soru.siklar.length; j++) {
          if (j !== soru.dogru) yanlislar.push(j);
        }
        elenen = G.rng.sec(yanlislar);
      }
      secilen.push({ id: soru.id, elenen: elenen, cevap: null });
    }

    state.sinav = {
      kim: kim,
      sira: 0,
      sorular: secilen,
      dogru: 0,
      bitti: false,
      gecti: false
    };
    state.ekran = "sinav";
    return state.sinav;
  }

  function suAnkiSoru(state) {
    var sinav = state.sinav;
    if (!sinav || sinav.bitti) return null;
    var kayit = sinav.sorular[sinav.sira];
    if (!kayit) return null;
    var havuz = soruHavuzu();
    for (var i = 0; i < havuz.length; i++) {
      if (havuz[i].id === kayit.id) {
        return { tanim: havuz[i], elenen: kayit.elenen, sira: sinav.sira };
      }
    }
    return null;
  }

  function cevapla(state, sik) {
    var c = C();
    var sinav = state.sinav;
    if (!sinav || sinav.bitti) return { hata: "Sınav yok." };
    var suanki = suAnkiSoru(state);
    if (!suanki) return { hata: "Soru yok." };

    var dogruMu = sik === suanki.tanim.dogru;
    sinav.sorular[sinav.sira].cevap = sik;
    if (dogruMu) sinav.dogru++;
    sinav.sira++;

    if (sinav.sira >= sinav.sorular.length) {
      sinav.bitti = true;
      sinav.puan = Math.round((sinav.dogru / sinav.sorular.length) * 100);
      sinav.gecti = sinav.puan >= c.SINAV_BARAJ;
      if (sinav.gecti) {
        state.belge.alindi = true;
        state.belge.gun = state.gun;
        state.istatistik.sinavGecti = 1;
        G.durum.itibarDegis(state, c.BELGE_ITIBAR);
        state.gunNotlari.push("Yetki belgesi alındı (" + sinav.puan + " puan): itibar +" +
          c.BELGE_ITIBAR + ".");
      } else {
        state.gunNotlari.push("Sınavdan " + sinav.puan + " geldi, baraj " + c.SINAV_BARAJ +
          ". " + c.SINAV_BEKLEME + " gün sonra tekrar.");
      }
    }
    return { dogru: dogruMu, aciklama: suanki.tanim.aciklama, bitti: sinav.bitti };
  }

  function kapat(state) {
    state.sinav = null;
    state.ekran = "dukkan";
  }

  // Belgesiz satista denetim riski (satis kapandiginda cagrilir)
  function denetimKontrol(state, araba) {
    var c = C();
    if (belgeliMi(state)) return null;
    if (!G.rng.sans(c.BELGESIZ_DENETIM)) return null;

    state.istatistik.denetim++;
    state.bekleyenEtkiler.push({
      gun: state.gun + G.rng.tam(1, 3),
      tur: "denetim",
      araba: G.araba.adi(araba),
      etki: {
        kasa: -c.BELGESIZ_CEZA,
        itibar: c.BELGESIZ_ITIBAR,
        not: "Ticaret Müdürlüğü denetimi: belgesiz satıştan " +
          G.paraYaz(c.BELGESIZ_CEZA) + " ceza kesildi."
      }
    });
    state.gunNotlari.push("Denetim görevlisi dükkânda: belgesiz satış tutanağa geçti.");
    return { ceza: c.BELGESIZ_CEZA };
  }

  // Ticaret Mudurlugu yazisi: belirli gunde bir kez
  function yaziGeldiMi(state) {
    var c = C();
    if (belgeliMi(state) || !state.belge || state.belge.yaziGeldi) return false;
    if (state.gun < c.BELGE_YAZI_GUN) return false;
    state.belge.yaziGeldi = true;
    state.sabahHaberleri.push(
      "Ticaret Müdürlüğü'nden yazı: yetki belgesi olmadan satış yaparsan " +
      G.paraYaz(c.BELGESIZ_CEZA) + " ceza var."
    );
    return true;
  }

  return {
    belgeliMi: belgeliMi,
    engel: engel,
    girebilirMi: girebilirMi,
    soruHavuzu: soruHavuzu,
    sinavBaslat: sinavBaslat,
    suAnkiSoru: suAnkiSoru,
    cevapla: cevapla,
    kapat: kapat,
    denetimKontrol: denetimKontrol,
    yaziGeldiMi: yaziGeldiMi
  };
})();
