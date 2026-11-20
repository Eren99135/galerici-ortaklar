// cek.js — vadeli cekle satis, cek sorgusu ve aval (Adim 21, tasarim/13).
// Dizideki Kemal hikayesi: pazarlik etmeyen, ekspertiz istemeyen, ustune fark veren
// alici. Para pesin degil; cek vadesinde ya doner ya karsiliksiz cikar.
window.G = window.G || {};

G.cek = (function () {
  var C = function () { return G.config; };

  function teklifVarMi(musteri) {
    return !!(musteri && musteri.odeme === "cek" && !musteri.cekKapandi);
  }

  // Musteri uretilirken belirlenir: cekle odeyen pazarlik etmez, ekspertiz istemez
  function musteriyiCekciYap(state, musteri) {
    var c = C();
    musteri.odeme = "cek";
    musteri.ekspertizYok = true;
    musteri.cekKapandi = false;
    musteri.cekSorgulandi = false;
    musteri.cekAval = false;
    musteri.cekRiski = G.rng.agirlikliSec([
      { deger: "dusuk", agirlik: c.CEK_RISK_ORANLARI.dusuk },
      { deger: "orta", agirlik: c.CEK_RISK_ORANLARI.orta },
      { deger: "yuksek", agirlik: c.CEK_RISK_ORANLARI.yuksek }
    ]);
    musteri.cekPrim = G.rng.aralik(c.CEK_PRIM[0], c.CEK_PRIM[1]);
    musteri.cekVade = G.rng.tam(c.CEK_VADE[0], c.CEK_VADE[1]);
    return musteri;
  }

  // Cekle odemeye gecis: musteri ustune fark veriyor, tavan ve rakami yukseliyor
  function cekeCevir(state) {
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "satis") return { hata: "Görüşme yok." };
    if (p.cekli) return { hata: "Zaten çekle konuşuyoruz." };
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    if (!teklifVarMi(musteri)) return { hata: "Bu müşteride çek yok." };

    p.cekli = true;
    p.tavan = G.yuvarla(p.tavan * (1 + musteri.cekPrim));
    p.karsi = G.yuvarla(Math.max(p.karsi, p.tavan * 0.99));
    p.mesaj = "Çeke geçtik: müşteri üstüne %" + Math.round(musteri.cekPrim * 100) +
      " fark veriyor, para vadede.";
    p.replik = { kim: "musteri", metin: "Çeki yazıyorum abi, üstüne de koyuyorum." };
    return p;
  }

  function nakdeDon(state) {
    var p = state.aktifPazarlik;
    if (!p || !p.cekli) return { hata: "Çek yok." };
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    p.cekli = false;
    p.tavan = G.yuvarla(p.tavan / (1 + (musteri ? musteri.cekPrim : 0)));
    p.karsi = Math.min(p.karsi, p.tavan);
    p.mesaj = "Çeki almadık, nakit üstünden konuşuyoruz.";
    return p;
  }

  // Kro karekodu okutur: risk gorunur hale gelir
  function sorgula(state) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "satis") return { hata: "Görüşme yok." };
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    if (!teklifVarMi(musteri)) return { hata: "Ortada çek yok." };
    if (musteri.cekSorgulandi) return { hata: "Sorguladık ortak." };
    if (state.kasa < c.CEK_SORGU_BEDEL) return { hata: "Kasada pere yok ortak." };

    state.kasa -= c.CEK_SORGU_BEDEL;
    musteri.cekSorgulandi = true;
    state.istatistik.cekSorgusu++;
    p.mesaj = "Kro karekodu okuttu: çek riski " + riskSozu(musteri.cekRiski) + ".";
    p.replik = { kim: "musteri", metin: "Sorgula sorgula abi, benim çekim sağlam." };
    state.gunNotlari.push("Çek sorgusu " + G.paraYaz(c.CEK_SORGU_BEDEL) + ": " +
      riskSozu(musteri.cekRiski) + ".");
    return { risk: musteri.cekRiski };
  }

  // Riza aval verir: yanarsa zararin bir kismi ona kalir, karsiliginda pay alir
  function avalIste(state) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "satis") return { hata: "Görüşme yok." };
    var musteri = G.pazarlik.musteriBul(state, p.musteriId);
    if (!teklifVarMi(musteri)) return { hata: "Ortada çek yok." };
    if (musteri.cekAval) return { hata: "Rıza zaten aval verdi." };
    if (musteri.cekRiski === "yuksek" && musteri.cekSorgulandi) {
      return { hata: "Rıza bu çeke aval vermez: \"Ben aradaki köprüyüm abi.\"" };
    }

    musteri.cekAval = true;
    state.istatistik.aval++;
    p.mesaj = "Rıza aval verdi. Payı satıştan düşecek.";
    p.replik = { kim: "riza", metin: "İmzayı atarım ama payımı alırım Nuri." };
    return { tamam: true };
  }

  function riskSozu(risk) {
    if (risk === "dusuk") return "düşük";
    if (risk === "orta") return "orta";
    return "yüksek";
  }

  function karsiliksizOlasilik(risk) {
    return C().CEK_KARSILIKSIZ[risk] || 0;
  }

  // Satis kapandiginda cagrilir: para kasaya girmez, cek listeye duser
  function satisaIsle(state, p, musteri, fiyat, vergi, sahibeOdenen) {
    var c = C();
    if (!musteri || !p.cekli) return 0;

    var pay = musteri.cekAval ? Math.round((fiyat - vergi) * c.AVAL_PAY) : 0;
    if (pay > 0) state.kasa -= pay;

    state.cekler.push({
      id: "c" + (++state.idSayac),
      musteri: musteri.isim,
      araba: p.arabaAdi,
      tutar: fiyat,
      vergi: vergi,
      sahipNet: sahibeOdenen || 0,
      vadeGun: state.gun + musteri.cekVade,
      risk: musteri.cekRiski,
      sorgulandi: !!musteri.cekSorgulandi,
      aval: !!musteri.cekAval,
      avalPayi: pay
    });

    state.istatistik.cekAlinan++;
    musteri.cekKapandi = true;
    state.gunNotlari.push(p.arabaAdi + " çekle gitti: " + G.paraYaz(fiyat) +
      ", vade " + musteri.cekVade + " gün." +
      (musteri.cekAval ? " Rıza'nın payı " + G.paraYaz(pay) + "." : ""));
    state.defter.push({
      gun: state.gun, tur: "cek-satis", araba: p.arabaAdi,
      fiyat: fiyat, masraf: vergi + pay, kar: 0
    });
    return fiyat;
  }

  // Her sabah: vadesi gelen cekler ya tahsil edilir ya karsiliksiz cikar
  function vadeKontrol(state) {
    var c = C();
    for (var i = state.cekler.length - 1; i >= 0; i--) {
      var cek = state.cekler[i];
      if (cek.vadeGun > state.gun) continue;
      state.cekler.splice(i, 1);

      if (G.rng.sans(karsiliksizOlasilik(cek.risk))) {
        var zarar = cek.tutar;
        var avalKurtardi = cek.aval ? Math.round(zarar * c.AVAL_KARSILAMA) : 0;
        state.kasa += avalKurtardi;
        G.durum.itibarDegis(state, c.CEK_YANIK_ITIBAR);
        state.istatistik.cekYanan++;
        state.sabahHaberleri.push(
          cek.musteri + "'in çeki karşılıksız çıktı: " + G.paraYaz(cek.tutar) + "." +
          (cek.aval ? " Rıza avalden " + G.paraYaz(avalKurtardi) + " karşıladı." : "")
        );
        state.defter.push({
          gun: state.gun, tur: "karsiliksiz", araba: cek.araba,
          fiyat: 0, masraf: 0, kar: -(zarar - avalKurtardi)
        });
        state.bekleyenEtkiler.push({
          gun: state.gun + G.rng.tam(2, 4),
          tur: "icra",
          araba: cek.araba,
          etki: { not: cek.musteri + " için icra takibi başlatıldı. Avukat masrafı düştü.",
                  kasa: -c.ICRA_MASRAFI }
        });
      } else {
        state.kasa += cek.tutar - cek.vergi - (cek.sahipNet || 0);
        state.istatistik.cekTahsil++;
        state.sabahHaberleri.push(cek.musteri + "'in çeki ödendi: " +
          G.paraYaz(cek.tutar - cek.vergi - (cek.sahipNet || 0)) + " kasaya girdi.");
        state.defter.push({
          gun: state.gun, tur: "cek-tahsil", araba: cek.araba,
          fiyat: cek.tutar, masraf: cek.vergi, kar: 0
        });
      }
    }
  }

  function bekleyenToplam(state) {
    var toplam = 0;
    for (var i = 0; i < state.cekler.length; i++) toplam += state.cekler[i].tutar;
    return toplam;
  }

  return {
    teklifVarMi: teklifVarMi,
    cekeCevir: cekeCevir,
    nakdeDon: nakdeDon,
    musteriyiCekciYap: musteriyiCekciYap,
    sorgula: sorgula,
    avalIste: avalIste,
    riskSozu: riskSozu,
    karsiliksizOlasilik: karsiliksizOlasilik,
    satisaIsle: satisaIsle,
    vadeKontrol: vadeKontrol,
    bekleyenToplam: bekleyenToplam
  };
})();
