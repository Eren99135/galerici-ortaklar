// araba.js — ilan uretimi, kusurlar, gercek deger. DOM'a dokunmaz (kurallar.md 3).
// Kaynak: context/tasarim/02-arabalar-ve-kusurlar.md
window.G = window.G || {};

G.araba = (function () {
  var C = function () { return G.config; };

  // tasarim/02 — piyasa degeri: katalog degeri, yil, km, +-%8 oynama
  function piyasaDegeriHesapla(katalog, yil, km) {
    var c = C();
    var deger = katalog.deger;

    var ortaYil = (katalog.yilMin + katalog.yilMaks) / 2;
    deger = deger * (1 + c.YIL_ETKISI * (yil - ortaYil));

    if (!katalog.kmEtkisiz) {
      var beklenenKm = (c.SIMDIKI_YIL - yil) * c.KM_YILLIK;
      var adimSayisi = (km - beklenenKm) / c.KM_ADIM;
      deger = deger * (1 - c.KM_ETKISI * adimSayisi);
    }

    deger = deger * G.rng.aralik(1 - c.FIYAT_OYNAMA, 1 + c.FIYAT_OYNAMA);
    return G.yuvarla(deger);
  }

  function kmUret(katalog, yil) {
    var c = C();
    if (katalog.kmEtkisiz) return G.rng.tam(150, 320) * 1000; // klasik
    var beklenen = (c.SIMDIKI_YIL - yil) * c.KM_YILLIK;
    var km = beklenen * G.rng.aralik(0.55, 1.5);
    if (km < 5000) km = G.rng.tam(5, 20) * 1000;
    return Math.round(km / 1000) * 1000;
  }

  function kusurYap(tip, parca, etki, gorunurluk) {
    return {
      tip: tip,
      parca: parca || "",
      etki: Math.round(etki),
      gorunurluk: gorunurluk,
      ortayaCikti: false,
      musteriyeSoylendi: false
    };
  }

  // tasarim/02 — kusur tipleri ve satici profilleri
  function kusurUret(saticiTipi, piyasaDegeri) {
    var c = C();
    var p = c.KUSUR_PROFILI[saticiTipi];
    var e = c.KUSUR_ETKILERI;
    var kusurlar = [];

    // Boyali parcalar
    var boyaSayisi = G.rng.tam(p.boyaMin, p.boyaMaks);
    var boyaParcalari = G.rng.secBirkac(c.PARCALAR, boyaSayisi);
    for (var i = 0; i < boyaParcalari.length; i++) {
      kusurlar.push(kusurYap("boya", boyaParcalari[i], piyasaDegeri * e.boya, "normal"));
    }

    // Degisen parcalar
    if (G.rng.sans(p.degisenOlasilik)) {
      var degisenSayisi = G.rng.tam(c.DEGISEN_MIN, c.DEGISEN_MAKS);
      var degisenParcalari = G.rng.secBirkac(c.PARCALAR, degisenSayisi);
      for (var j = 0; j < degisenParcalari.length; j++) {
        kusurlar.push(kusurYap("degisen", degisenParcalari[j], piyasaDegeri * e.degisen, "normal"));
      }
    }

    // Tramer kaydi
    if (G.rng.sans(p.tramerOlasilik)) {
      var tutar = G.yuvarla(G.rng.tam(c.TRAMER_MIN, c.TRAMER_MAKS));
      var tramer = kusurYap("tramer", "", tutar * e.tramer, "normal");
      tramer.tutar = tutar;
      kusurlar.push(tramer);
    }

    // Lastik (gozle gorunur)
    if (G.rng.sans(c.LASTIK_OLASILIGI)) {
      kusurlar.push(kusurYap("lastik", "", e.lastik, "acik"));
    }

    // Motor (gizli)
    if (G.rng.sans(p.motorOlasilik)) {
      kusurlar.push(kusurYap("motor", "", piyasaDegeri * e.motor, "gizli"));
    }

    // Dolandiricida en az bir agir gizli kusur
    if (saticiTipi === "dolandirici") {
      if (G.rng.sans(c.SASE_OLASILIGI)) {
        var sase = kusurYap("sase", "", piyasaDegeri * e.sase, "gizli");
        sase.satilamaz = true;
        kusurlar.push(sase);
      } else {
        kusurlar.push(kusurYap("agirHasar", "", piyasaDegeri * e.agirHasar, "gizli"));
      }
    }

    return kusurlar;
  }

  // Faz 3 — ilani kim satiyor. Modelin kendi personasi cogunlukla cikar, kalaninda
  // rastgele baskasi: ayni Sahin'i her seferinde ayni tip insan satmasin.
  function personaSec(katalog) {
    var c = C();
    var liste = [];
    for (var a in c.PERSONALAR) {
      if (c.PERSONALAR.hasOwnProperty(a)) liste.push(a);
    }
    var kendi = katalog && katalog.persona;
    if (!kendi || !c.PERSONALAR[kendi]) return G.rng.sec(liste);
    return G.rng.sans(c.PERSONA_SADAKAT) ? kendi : G.rng.sec(liste);
  }

  // Satici tipi persona ile birlikte cekilir: piyasacidan dolandirici, memurdan
  // durust cikma ihtimali daha yuksek (tasarim: persona tipin yerine gecmez, ustune biner).
  function saticiTipiSec(persona) {
    var c = C();
    var o = c.SATICI_ORANLARI;
    var p = (c.PERSONALAR[persona] && c.PERSONALAR[persona].tipAgirlik) || {};
    return G.rng.agirlikliSec([
      { deger: "durust", agirlik: o.durust * (p.durust || 1) },
      { deger: "abartici", agirlik: o.abartici * (p.abartici || 1) },
      { deger: "dolandirici", agirlik: o.dolandirici * (p.dolandirici || 1) }
    ]);
  }

  // tasarim/02 — satici ne iddia ediyor
  function iddiaUret(saticiTipi, kusurlar) {
    var boyaVar = false, degisenVar = false, tramerTutari = 0;
    for (var i = 0; i < kusurlar.length; i++) {
      if (kusurlar[i].tip === "boya") boyaVar = true;
      if (kusurlar[i].tip === "degisen") degisenVar = true;
      if (kusurlar[i].tip === "tramer") tramerTutari = kusurlar[i].tutar || 0;
    }
    if (saticiTipi === "durust") {
      return { boyasiz: !boyaVar, degisensiz: !degisenVar, tramer: tramerTutari };
    }
    // abartici ve dolandirici: her sey mukemmel
    return { boyasiz: true, degisensiz: true, tramer: 0 };
  }

  function gercekDeger(araba) {
    var toplam = araba.piyasaDegeri;
    for (var i = 0; i < araba.kusurlar.length; i++) toplam -= araba.kusurlar[i].etki;
    return Math.round(toplam);
  }

  // Oyuncunun bildigi kusurlara gore deger (tasarim/04 §1 algilananDeger)
  function bilinenDeger(araba) {
    var toplam = araba.piyasaDegeri;
    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].ortayaCikti) toplam -= araba.kusurlar[i].etki;
    }
    return Math.round(toplam);
  }

  function kusurToplami(kusurlar) {
    var t = 0;
    for (var i = 0; i < kusurlar.length; i++) t += kusurlar[i].etki;
    return Math.round(t);
  }

  // Faz 2 — musterinin gordugu kusurlarin agirligi: 0 (temiz) .. 1 (hurda gibi).
  // Fiyattan ayri bir olcu: ucuza konan sorunlu araba da zor satilsin diye var.
  // Ortaya cikmamis kusur sayilmaz; musteri bilmedigi kusurdan urkmez (sakladiysan
  // bedeli sonra sikayet olarak doner, bkz. js/pazarlik.js).
  function kusurYuku(araba) {
    var c = C();
    if (!araba || !araba.kusurlar || !araba.piyasaDegeri) return 0;
    var kalan = 1;
    for (var i = 0; i < araba.kusurlar.length; i++) {
      var k = araba.kusurlar[i];
      if (!k.ortayaCikti) continue;
      var pay = Math.min(c.KUSUR_YUK_TAVAN, (k.etki / araba.piyasaDegeri) * c.KUSUR_YUK_CARPAN);
      if (pay > 0) kalan *= (1 - pay);
    }
    return 1 - kalan;
  }

  // Yukun oyunda hissedilen hali: karesi alinarak hafif kusurlar serbest birakilir,
  // ustuste binenler hizla agirlasir (bkz. config KUSUR_YUK_US).
  function kusurBaskisi(araba) {
    return Math.pow(kusurYuku(araba), C().KUSUR_YUK_US);
  }

  function satilamazMi(araba) {
    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].tip === "sase") return true;
    }
    return false;
  }

  // tasarim/02 — bir ilan uret. zorlaTip verilirse satici tipi ona sabitlenir (Kro'nun ilani).
  function ilanUret(state, kaynak, zorlaTip) {
    var c = C();
    var katalog = G.rng.sec(G.data.modeller);
    var yil = G.rng.tam(katalog.yilMin, katalog.yilMaks);
    var km = kmUret(katalog, yil);
    var piyasaDegeri = piyasaDegeriHesapla(katalog, yil, km);
    var persona = personaSec(katalog);
    // Sehir disinda satici tanidik degil: personanin tip agirliklari devreye girmez,
    // sehrin kendi dolandirici carpani seyrelmez (karar #22 — sefer bedava para olmamali).
    var seferde = kaynak === "sefer";
    var saticiTipi = zorlaTip || saticiTipiSec(seferde ? null : persona);
    var kusurlar = kusurUret(saticiTipi, piyasaDegeri);

    // Cekilis sirasi onemli: once konsinye, sonra renk. Tohumlu RNG akisi
    // kaymasin diye ikisi de nesne icindeki eski sirasinda atiliyor (bkz. js/rng.js).
    var konsinyeMumkun = G.rng.sans(C().KONSINYE_OLASILIK[saticiTipi] || 0);   // Adim 19
    // Renk katalogdan gelir: ilanda yazan renk ile fotograftaki araba ayni olsun.
    // Cekilis yine de atiliyor, sadece katalogda renk varsa sonucu kullanilmiyor.
    var rastgeleRenk = G.rng.sec(c.RENKLER);
    var renk = katalog.renk || rastgeleRenk;

    var araba = {
      id: "a" + (++state.idSayac),
      marka: katalog.marka,
      model: katalog.model,
      govde: katalog.govde || "sedan",     // sahnedeki ve ilan kartindaki gorsel icin
      persona: persona,                    // Faz 3: satici tiplemesi (js/config.js PERSONALAR)
      konsinyeMumkun: konsinyeMumkun,
      not: katalog.not || "",
      yil: yil,
      km: km,
      renk: renk,
      piyasaDegeri: piyasaDegeri,
      kusurlar: kusurlar,
      saticiTipi: saticiTipi,
      ilanYasi: 0,
      kaynak: kaynak || "ilan",
      gozBakildi: false,
      ekspertizSeviyesi: null,
      ekspertizMasrafi: 0,
      tanidikRaporu: false
    };

    araba.iddia = iddiaUret(saticiTipi, kusurlar);

    // Istenen fiyat: durust satici gercek degerin, digerleri piyasa degerinin ustune ister
    var kural = c.SATICI_FIYAT[saticiTipi];
    var temel = kural.taban === "gercek" ? gercekDeger(araba) : piyasaDegeri;
    araba.istenenFiyat = G.yuvarla(temel * G.rng.aralik(kural.min, kural.maks));

    // Taban carpani ilanda sabit kalir; pazarliga her girisde yeniden atilmaz (tasarim/03 §2)
    var r = c.TABAN_R[saticiTipi];
    araba.tabanR = G.rng.aralik(r[0], r[1]);
    araba.geriDonus = false;

    return araba;
  }

  // tasarim/05 — Kro'nun sabah getirdigi ilan.
  // %60 gercek firsat (durust satici, piyasa x 0,90-0,95), %40 dolandirici ilan.
  // Kro'nun detay gozu: bir gizli kusurun gorunurlugu "normal"e iner.
  function kroIlaniUret(state) {
    var c = C();
    var firsat = G.rng.sans(c.KRO_FIRSAT_ORANI);
    var araba = ilanUret(state, "kro", firsat ? "durust" : "dolandirici");

    if (firsat) {
      araba.istenenFiyat = G.yuvarla(
        araba.piyasaDegeri * G.rng.aralik(c.KRO_FIRSAT_FIYAT[0], c.KRO_FIRSAT_FIYAT[1])
      );
    }

    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].gorunurluk === "gizli") {
        araba.kusurlar[i].gorunurluk = "normal";
        araba.kusurlar[i].kroGordu = true;
        break;
      }
    }

    // Drej'in sezgisi: zar burada bir kez atilir, ekranda degismesin
    araba.drejTuhaflik = araba.saticiTipi === "dolandirici" &&
      G.rng.sans(c.DREJ_TUHAFLIK_OLASILIK);

    return araba;
  }

  function adi(araba) {
    return araba.marka + " " + araba.model + " " + araba.yil;
  }

  return {
    ilanUret: ilanUret,
    kroIlaniUret: kroIlaniUret,
    kusurUret: kusurUret,
    iddiaUret: iddiaUret,
    gercekDeger: gercekDeger,
    bilinenDeger: bilinenDeger,
    kusurToplami: kusurToplami,
    kusurYuku: kusurYuku,
    kusurBaskisi: kusurBaskisi,
    satilamazMi: satilamazMi,
    piyasaDegeriHesapla: piyasaDegeriHesapla,
    adi: adi
  };
})();
