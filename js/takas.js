// takas.js — musteri parayla degil arabayla gelir (Adim 20, tasarim/12).
// Dizideki karsiligi: kuryeci iki Clio'ya karsilik Mercedes'ini takasa veriyor (43. bolum).
// Oyuncunun karari: musterinin arabasina kac bicecegi. Kusurunu goremezse zarar eder.
window.G = window.G || {};

G.takas = (function () {
  var C = function () { return G.config; };

  function teklifVarMi(musteri) {
    return !!(musteri && musteri.takasArabasi && !musteri.takasKapandi);
  }

  // Musteri gelirken yaninda arabasini getirir. Cogunlukla "abartici" profilde
  // uretilir: "benim araba tertemiz abi" diyen adamin arabasi temiz cikmaz (tasarim/12).
  function arabaUret(state) {
    var c = C();
    var tip = G.rng.sans(c.TAKAS_ABARTICI_ORAN) ? "abartici" : "durust";
    var araba = G.araba.ilanUret(state, "takas", tip);
    araba.takasArabasi = true;
    araba.konsinyeMumkun = false;
    G.ekspertiz.gozKontrol(araba);         // gozle bakmak bedava
    return araba;
  }

  // Musterinin kendi arabasina bicilmesini bekledigi deger
  function beklenti(araba) {
    var c = C();
    if (araba.takasBeklenti) return araba.takasBeklenti;
    araba.takasBeklenti = G.yuvarla(
      G.araba.bilinenDeger(araba) * G.rng.aralik(c.TAKAS_BEKLENTI[0], c.TAKAS_BEKLENTI[1])
    );
    return araba.takasBeklenti;
  }

  // Oyuncunun bictigi deger musteriye ne hissettiriyor
  function degerlendir(state, musteri, bicilen) {
    var c = C();
    var araba = musteri.takasArabasi;
    if (!araba) return { hata: "Ortada takas yok." };
    var bekleniyor = beklenti(araba);
    var oran = bicilen / bekleniyor;

    if (oran >= 1) return { durum: "kabul", oran: oran };
    if (oran >= c.TAKAS_RED_ESIK) return { durum: "direnir", oran: oran };
    return { durum: "red", oran: oran };
  }

  // Takasi satis pazarligina baglar: nakit farki = senin fiyatin - bicilen deger
  function kabulEt(state, bicilen) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "satis") return { hata: "Görüşme yok." };
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    if (!musteri || !teklifVarMi(musteri)) return { hata: "Bu müşteride takas yok." };
    if (state.stok.length >= c.KAPASITE) {
      return { hata: "Tezgâh dolu, takas arabası sığmaz." };
    }

    bicilen = G.yuvarla(bicilen, c.TEKLIF_ADIMI);
    if (bicilen <= 0) return { hata: "Değer sıfır olmaz." };

    var sonuc = degerlendir(state, musteri, bicilen);
    if (sonuc.durum === "red") {
      p.sabir -= 2;
      p.mesaj = "Müşteri bu değere bozuldu: \"Arabamı hurdaya mı sayıyorsun abi?\"";
      p.replik = { kim: "musteri", metin: "O pere arabamın lastiğini almaz abi." };
      musteri.takasRed = (musteri.takasRed || 0) + 1;
      if (p.sabir <= 0) {
        p.bitti = true;
        p.sonuc = "gitti";
        p.mesaj = "Müşteri takas konusunda anlaşamayıp gitti.";
      }
      return p;
    }
    if (sonuc.durum === "direnir") {
      p.sabir -= 1;
      p.mesaj = "Müşteri direniyor: \"Biraz daha ver abi, araba temiz.\"";
      p.replik = { kim: "musteri", metin: "Biraz daha gel abi, bu araba o kadar eder." };
      musteri.takasRed = (musteri.takasRed || 0) + 1;
      if (p.sabir <= 0) {
        p.bitti = true;
        p.sonuc = "gitti";
        p.mesaj = "Müşteri takas pazarlığında sabrını tüketti.";
      }
      return p;
    }

    // Anlasma: takas pazarliga islenir, satis fiyati verildiginde fark alinir
    p.takas = {
      arabaId: musteri.takasArabasi.id,
      arabaAdi: G.araba.adi(musteri.takasArabasi),
      bicilenDeger: bicilen
    };
    musteri.takasKapandi = true;
    p.sabir += c.TAKAS_ANLASMA_SABIR;      // is kolaylasti, musteri rahatladi
    p.mesaj = "Takas tamam: " + p.takas.arabaAdi + " için " + G.paraYaz(bicilen) +
      " yazdık. Kalanı nakit.";
    p.replik = { kim: "musteri", metin: "Anlaştık abi. Farkı hemen veririm." };
    state.istatistik.takasYapilan++;
    return p;
  }

  function vazgec(state) {
    var p = state.aktifPazarlik;
    if (!p) return null;
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    if (musteri) musteri.takasKapandi = true;
    p.takas = null;
    p.mesaj = "Takası almadık, görüşme nakit üstünden sürüyor.";
    return p;
  }

  // Satis kapandiginda cagrilir: takas arabasi tezgaha girer
  function satisaIsle(state, p) {
    if (!p.takas) return 0;
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    var araba = musteri ? musteri.takasArabasi : null;
    if (!araba) return 0;

    araba.alisFiyati = p.takas.bicilenDeger;
    araba.masraflar = C().NOTER_PLAKA;
    araba.ilanFiyati = G.yuvarla(p.takas.bicilenDeger * C().ILAN_FIYAT_ONERI);
    araba.stogaGirisGunu = state.gun;
    araba.gecmisKusurSayisi = G.ekspertiz.cikanKusurlar(araba).length;
    state.stok.push(araba);

    state.gunNotlari.push("Takasla " + G.araba.adi(araba) + " tezgâha girdi: " +
      G.paraYaz(p.takas.bicilenDeger) + " yazıldı.");
    state.defter.push({
      gun: state.gun, tur: "takas", araba: G.araba.adi(araba),
      fiyat: p.takas.bicilenDeger, masraf: C().NOTER_PLAKA
    });
    return p.takas.bicilenDeger;
  }

  return {
    teklifVarMi: teklifVarMi,
    arabaUret: arabaUret,
    beklenti: beklenti,
    degerlendir: degerlendir,
    kabulEt: kabulEt,
    vazgec: vazgec,
    satisaIsle: satisaIsle
  };
})();
