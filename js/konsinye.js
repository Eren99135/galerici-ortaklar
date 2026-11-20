// konsinye.js — araba sahibinde kalir, galeri satar, komisyon alir (Adim 19, tasarim/11).
// Dizideki ornek: sahibine 1.050.000 net, ilan 1.150.000, galeriye 100.000 komisyon.
// Kasadan para cikmaz; karsiliginda marj dar, araba senin degil ve suresi var.
window.G = window.G || {};

G.konsinye = (function () {
  var C = function () { return G.config; };

  function teklifVarMi(araba) {
    return !!(araba && araba.konsinyeMumkun && !araba.konsinye);
  }

  function konsinyeMi(araba) {
    return !!(araba && araba.konsinye);
  }

  // Sahibin istedigi net: bilinen degerin %90-96'si. Ekspertiz kusur bulduysa
  // koz oynanarak asagi cekilebilir (kozOyna).
  function netHesapla(araba) {
    var c = C();
    if (araba.konsinyeNet) return araba.konsinyeNet;
    var oran = G.rng.aralik(c.KONSINYE_NET[0], c.KONSINYE_NET[1]);
    araba.konsinyeNet = G.yuvarla(G.araba.bilinenDeger(araba) * oran);
    return araba.konsinyeNet;
  }

  // Ortaya cikmis bir kusuru sahibine gosterip neti dusurmek (bir kusur bir kez)
  function kozOyna(state, arabaId, kusurTipi) {
    var c = C();
    var araba = G.pazarlik.arabaBul(state, arabaId);
    if (!araba) return { hata: "İlan bulunamadı." };
    if (!teklifVarMi(araba)) return { hata: "Burada konsinye yok." };

    araba.konsinyeKozlari = araba.konsinyeKozlari || [];
    if (araba.konsinyeKozlari.indexOf(kusurTipi) !== -1) {
      return { hata: "Bunu gösterdin ortak." };
    }

    var etki = 0;
    for (var i = 0; i < araba.kusurlar.length; i++) {
      var k = araba.kusurlar[i];
      if (k.tip === kusurTipi && k.ortayaCikti) etki += k.etki;
    }
    if (etki === 0) return { hata: "Ortada böyle bir kusur yok." };

    araba.konsinyeKozlari.push(kusurTipi);
    netHesapla(araba);
    araba.konsinyeNet = G.yuvarla(araba.konsinyeNet - etki * c.KONSINYE_KOZ_ORAN);
    return { net: araba.konsinyeNet, dusen: G.yuvarla(etki * c.KONSINYE_KOZ_ORAN) };
  }

  function kabulEt(state, arabaId) {
    var c = C();
    var araba = G.pazarlik.arabaBul(state, arabaId);
    if (!araba) return { hata: "İlan bulunamadı." };
    if (!teklifVarMi(araba)) return { hata: "Bu arabada konsinye yok ortak." };
    if (state.stok.length >= c.KAPASITE) return { hata: "Tezgâh dolu, önce satalım." };

    var net = netHesapla(araba);
    araba.konsinye = {
      sahipNet: net,
      baslangicGun: state.gun,
      sonGun: state.gun + c.KONSINYE_SURE
    };
    araba.alisFiyati = net;              // kar hesabi = fiyat - net = komisyon
    araba.masraflar = 0;                 // noter sahibinde, bize masraf yok
    araba.ilanFiyati = G.yuvarla(net * c.ILAN_FIYAT_ONERI);
    araba.stogaGirisGunu = state.gun;
    araba.gecmisKusurSayisi = G.ekspertiz.cikanKusurlar(araba).length;

    var i = state.ilanlar.indexOf(araba);
    if (i !== -1) state.ilanlar.splice(i, 1);
    if (state.sefer) G.sefer.ilanSil(state, araba.id);
    state.stok.push(araba);

    state.istatistik.konsinyeAlinan++;
    state.gunNotlari.push(G.araba.adi(araba) + " konsinyeye alındı: sahibine net " +
      G.paraYaz(net) + ", " + c.KONSINYE_SURE + " gün.");
    state.defter.push({
      gun: state.gun, tur: "konsinye", araba: G.araba.adi(araba), fiyat: 0, masraf: 0
    });
    return araba;
  }

  function komisyon(araba, fiyat) {
    if (!konsinyeMi(araba)) return 0;
    return fiyat - araba.konsinye.sahipNet;
  }

  function kalanGun(state, araba) {
    if (!konsinyeMi(araba)) return 0;
    return araba.konsinye.sonGun - state.gun;
  }

  // Her sabah: suresi dolan araba sahibine gider, yaklasani haber olur
  function sureKontrol(state) {
    var c = C();
    for (var i = state.stok.length - 1; i >= 0; i--) {
      var araba = state.stok[i];
      if (!konsinyeMi(araba)) continue;
      var kalan = kalanGun(state, araba);

      if (kalan <= 0) {
        state.stok.splice(i, 1);
        for (var j = state.musteriler.length - 1; j >= 0; j--) {
          if (state.musteriler[j].arabaId === araba.id) state.musteriler.splice(j, 1);
        }
        state.istatistik.konsinyeGeriGiden++;
        state.sabahHaberleri.push(G.araba.adi(araba) + " konsinye süresi doldu, sahibi aldı.");
      } else if (kalan <= c.KONSINYE_UYARI_GUN) {
        state.sabahHaberleri.push("Sahibi arıyor: " + G.araba.adi(araba) +
          " için " + kalan + " gün kaldı.");
      }
    }
  }

  function stoktakiSayi(state) {
    var sayi = 0;
    for (var i = 0; i < state.stok.length; i++) {
      if (konsinyeMi(state.stok[i])) sayi++;
    }
    return sayi;
  }

  return {
    teklifVarMi: teklifVarMi,
    konsinyeMi: konsinyeMi,
    netHesapla: netHesapla,
    kozOyna: kozOyna,
    kabulEt: kabulEt,
    komisyon: komisyon,
    kalanGun: kalanGun,
    sureKontrol: sureKontrol,
    stoktakiSayi: stoktakiSayi
  };
})();
