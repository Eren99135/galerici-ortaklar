// pazarlik.js — alis ve satis pazarligi. Saf mantik, DOM'a dokunmaz.
// Kaynak: context/tasarim/03-ekspertiz-ve-pazarlik.md ve 04-satis-ve-itibar.md
// Karar #13: "ortasi" kapanisi (§4 madde 3) ve "kalkiyoruz" blofu (§4b) buraya eklendi.
window.G = window.G || {};

G.pazarlik = (function () {
  var C = function () { return G.config; };
  var R = function () { return G.data.replikler; };

  // ---------- yardimcilar ----------

  function replikSec(liste, veri, p) {
    if (!liste || !liste.length) return "";
    var metin = liste[Math.floor(G.rng.sayi() * liste.length)];
    if (p && liste.length > 1 && metin === p.sonReplikMetni) {
      metin = liste[Math.floor(G.rng.sayi() * liste.length)];
    }
    if (p) p.sonReplikMetni = metin;
    return G.replikDoldur(metin, veri || {});
  }

  // Bir durumun havuzu hic yoksa dusulecek en yakin durum. Bos baloncuk cikmasin diye:
  // eski kayitlardaki arabalarda persona alani olmuyor ve agirHakaret sadece persona
  // havuzlarinda yaziliydi (2026-11-19'da yakalandi).
  var REPLIK_YEDEGI = {
    agirHakaret: "hakaret",
    geriDonus: "acilis",
    kalkCagirdi: "kalkis",
    kalkBitti: "kalkis",
    ortasi: "karsiTeklif"
  };

  function saticiReplik(p, araba, durum, fiyat) {
    // Faz 3: once personanin kendi agzi, yoksa satici tipinin genel repligi
    var personaListesi = (R().saticiPersona && R().saticiPersona[araba.persona]) || {};
    var tipListesi = R().satici[araba.saticiTipi] || {};
    var liste = personaListesi[durum] || tipListesi[durum];
    if (!liste || !liste.length) {
      var yedek = REPLIK_YEDEGI[durum];
      liste = (yedek && (personaListesi[yedek] || tipListesi[yedek])) || tipListesi.karsiTeklif;
    }
    return replikSec(liste, {
      fiyat: fiyat !== undefined ? G.kisaFiyat(fiyat) : "",
      model: araba.model,
      parca: ""
    }, p);
  }

  function musteriReplik(p, musteri, durum, fiyat, parca) {
    var tipListesi = R().musteri[musteri.tip] || {};
    var liste = tipListesi[durum] || R().musteriGenel[durum];
    return replikSec(liste, {
      fiyat: fiyat !== undefined ? G.kisaFiyat(fiyat) : "",
      parca: parca || ""
    }, p);
  }

  function ruhHali(sabir) {
    if (sabir >= 3) return "Sakin";
    if (sabir === 2) return "Gerginleşiyor";
    if (sabir === 1) return "Kalkmak üzere";
    return "Kalktı";
  }

  function gecmiseYaz(p, kim, fiyat) {
    p.gecmis.push({ kim: kim, fiyat: fiyat });
  }

  // tasarim/03 §3 — taban, gercek degerin %80'inin altina inmez
  function tabanSinirla(p, araba) {
    var alt = G.araba.gercekDeger(araba) * C().TABAN_ALT_SINIR;
    if (p.taban < alt) p.taban = alt;
    if (p.karsi < p.taban) p.karsi = p.taban;
  }

  function arabaBul(state, id) {
    var i;
    for (i = 0; i < state.ilanlar.length; i++) if (state.ilanlar[i].id === id) return state.ilanlar[i];
    for (i = 0; i < state.stok.length; i++) if (state.stok[i].id === id) return state.stok[i];
    if (state.sefer) {                       // Adim 18: sehirdeki ilanlar
      for (i = 0; i < state.sefer.ilanlar.length; i++) {
        if (state.sefer.ilanlar[i].id === id) return state.sefer.ilanlar[i];
      }
    }
    return null;
  }

  function musteriBul(state, id) {
    for (var i = 0; i < state.musteriler.length; i++) {
      if (state.musteriler[i].id === id) return state.musteriler[i];
    }
    return null;
  }

  // ---------- ALIS ----------

  // tasarim/03 §2 — saticinin gizli degerleri
  function alisBaslat(state, arabaId, konusan) {
    var c = C();
    var araba = arabaBul(state, arabaId);
    if (!araba) return { hata: "İlan bulunamadı." };

    var karakter = G.karakterler.al(konusan);
    var yasIndirim = 1 - c.ILAN_YASI_INDIRIM * Math.floor(araba.ilanYasi / c.ILAN_YASI_ADIM);
    var taban = araba.istenenFiyat * araba.tabanR * yasIndirim;
    var sabir = (araba.sabirZorla || c.SABIR[araba.saticiTipi]) + karakter.sabirBonusu +
      G.sefer.sabirBonusu(state);            // Adim 18: yemek molasindan sonra satici daha sabirli

    // Faz 3 — persona masaya oturuyor: ne kadar kiriliyor, ne kadar sabirli,
    // dusuk itibara tahammulu var mi, karsisindaki ortakla anlasiyor mu.
    var persona = c.PERSONALAR[araba.persona];
    if (persona) {
      taban = taban * persona.tabanCarpani;
      sabir += persona.sabirEk;
      sabir += (persona.ortak && persona.ortak[karakter.anahtar]) || 0;
      if (state.itibar < c.ITIBAR_SABIR_ESIK) sabir -= persona.itibarDuyarlilik;
      sabir = Math.max(c.SATIS_SABIR_MIN, sabir);
    }
    var bereketVar = false;

    if (araba.geriDonus) {                       // tasarim/03 §4 — geri donen satici
      taban = taban * c.GERI_DONUS_TABAN;
      sabir = c.GERI_DONUS_SABIR;
    }

    // Cuma karti: sadaka verdiysek sonraki alista taban -%2 (tasarim/06 madde 4)
    if (state.bayraklar.bereket) {
      taban = taban * (1 - c.BEREKET_INDIRIM);
      state.bayraklar.bereket = false;
      bereketVar = true;
    }

    var p = {
      tur: "alis",
      arabaId: araba.id,
      arabaAdi: G.araba.adi(araba),      // satici kalkinca araba listeden duser, ad burada kalsin
      istenenFiyat: araba.istenenFiyat,
      konusan: karakter.anahtar,
      taban: taban,
      karsi: araba.istenenFiyat,
      sabir: sabir,
      baslangicSabir: sabir,
      kullanilanKozlar: [],
      kalkKullanildi: false,
      yetenekKullanildi: false,
      hakaretOldu: false,
      hesapAraligi: null,
      ortaTeklif: null,
      teklif: G.yuvarla(araba.istenenFiyat * 0.93),
      gecmis: [],
      bitti: false,
      sonuc: null,
      anlasmaFiyati: 0,
      fazlaVerdik: false,
      sonReplikMetni: null,
      mesaj: null
    };

    tabanSinirla(p, araba);
    if (bereketVar) p.mesaj = "Cuma sadakasının bereketi: satıcı bugün biraz daha yumuşak.";
    p.replik = { kim: "satici", metin: saticiReplik(p, araba, "acilis", araba.istenenFiyat) };
    gecmiseYaz(p, "satici", araba.istenenFiyat);

    state.aktifPazarlik = p;
    return p;
  }

  // tasarim/03 §3 — kusuru yuzune vurmak
  function kozKullan(state, tip) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "alis") return { hata: "Pazarlık yok." };
    if (p.ortaTeklif) return { hata: "Önce ortasına cevap ver." };
    if (p.kullanilanKozlar.indexOf(tip) !== -1) return { hata: "Bu kozu kullandın." };

    var araba = arabaBul(state, p.arabaId);
    var etki = 0, tutar = 0, parca = "";
    for (var i = 0; i < araba.kusurlar.length; i++) {
      var k = araba.kusurlar[i];
      if (k.tip === tip && k.ortayaCikti) {
        etki += k.etki;
        if (k.tutar) tutar = k.tutar;
        if (!parca && k.parca) parca = k.parca;
      }
    }
    if (etki === 0) return { hata: "Ortada böyle bir kusur yok." };

    p.kullanilanKozlar.push(tip);

    // Dolandirici kozu tanimaz (karar #10, tasarim/03 §3)
    if (araba.saticiTipi === "dolandirici") {
      p.sabir -= c.DOLANDIRICI_KOZ_SABIR;
      p.replik = { kim: "satici", metin: saticiReplik(p, araba, "koz") };
      p.mesaj = "Satıcı kozu tanımadı. Bu ilanda bir tuhaflık var.";
      return sabirKontrol(state, p, araba);
    }

    var celisiyor = kozCelisiyorMu(araba, tip, tutar);
    var oran = celisiyor ? c.KOZ_CELISKI_ORAN : c.KOZ_SOYLENMIS_ORAN;
    p.taban -= etki * oran;
    if (celisiyor) {
      p.karsi -= etki * oran;
      p.sabir -= c.KOZ_SABIR_MALIYETI;
    }
    tabanSinirla(p, araba);

    p.replik = {
      kim: "satici",
      metin: celisiyor
        ? saticiReplik(p, araba, "karsiTeklif", p.karsi)
        : saticiReplik(p, araba, "koz")
    };
    p.mesaj = celisiyor
      ? "Satıcı sıkıştı: " + G.kusurAdi(tip) + " iddiasıyla çelişiyor."
      : "Satıcı bunu baştan söylemişti, fiyata az yansıdı.";

    return sabirKontrol(state, p, araba);
  }

  // Satici bu kusuru iddiasinda ortmus mu?
  function kozCelisiyorMu(araba, tip, tutar) {
    var iddia = araba.iddia;
    if (tip === "boya") return !!iddia.boyasiz;
    if (tip === "degisen") return !!iddia.degisensiz;
    if (tip === "tramer") return (iddia.tramer || 0) < tutar;
    // lastik, motor, agirHasar, sase: durust satici bunlari soyler, digerleri ortbas eder
    return araba.saticiTipi !== "durust";
  }

  // tasarim/03 §4 — teklif turu
  function alisTeklif(state, T) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "alis") return { hata: "Pazarlık yok." };
    if (p.ortaTeklif) return { hata: "Önce ortasına cevap ver." };

    var araba = arabaBul(state, p.arabaId);
    T = G.yuvarla(T, c.TEKLIF_ADIMI);
    if (T <= 0) return { hata: "Teklif sıfır olmaz." };
    p.teklif = T;
    gecmiseYaz(p, "sen", T);

    // 1) Teklif, saticinin istediginin uzerindeyse fazlasini vermeyiz
    if (T >= p.karsi) {
      return alisKapat(state, p, araba, p.karsi);
    }

    // 2) Taban ustu: anlasma oyuncunun verdigi fiyattan
    if (T >= p.taban) {
      if (T > p.taban * c.FAZLA_VERDIK_ESIK) p.fazlaVerdik = true;
      return alisKapat(state, p, araba, T);
    }

    // 3) "Ortasi" (karar #13): iki rakam yakinsa satici ortayi teklif eder
    var orta = G.yuvarla((T + p.karsi) / 2);
    if (p.karsi - T <= p.taban * c.ORTASI_ESIK && orta >= p.taban) {
      p.ortaTeklif = orta;
      p.replik = { kim: "satici", metin: saticiReplik(p, araba, "ortasi", orta) };
      p.mesaj = "Satıcı ortasını söyledi.";
      return p;
    }

    // 4) Karsi teklif. karar #19: oyuncunun ilk teklifi hakaret sayilmaz
    var ilkTeklif = true;
    for (var gi = 0; gi < p.gecmis.length - 1; gi++) {
      if (p.gecmis[gi].kim === "sen") ilkTeklif = false;
    }
    if (T >= p.taban * c.HAKARET_ESIK || (c.HAKARET_ILK_TEKLIF_MUAF && ilkTeklif)) {
      p.karsi = G.yuvarla(Math.max(p.taban, p.karsi - (p.karsi - p.taban) * c.KARSI_ADIM));
      p.sabir -= 1;
      gecmiseYaz(p, "satici", p.karsi);
      p.replik = { kim: "satici", metin: saticiReplik(p, araba, "karsiTeklif", p.karsi) };
      p.mesaj = (ilkTeklif && T < p.taban * c.HAKARET_ESIK)
        ? "Satıcı ilk teklifi ciddiye almadı ama masada kaldı."
        : null;
      return sabirKontrol(state, p, araba);
    }

    // 5) Hakaret. Faz 3: iki kademe var — "cok ucuz" ve "asagilama".
    var persona = c.PERSONALAR[araba.persona];
    var agir = T < p.taban * c.HAKARET_AGIR_ESIK;
    p.hakaretOldu = true;          // bundan sonra Nuri daha cabuk parlar (tasarim/05)
    p.sabir -= agir ? c.HAKARET_AGIR_SABIR : 2;
    p.karsi = G.yuvarla(Math.min(araba.istenenFiyat, p.karsi * c.HAKARET_KARSI_ARTIS));
    p.replik = { kim: "satici", metin: saticiReplik(p, araba, agir ? "agirHakaret" : "hakaret") };
    p.mesaj = agir ? "Satıcı bu teklifi hakaret saydı." : "Satıcı bu teklife bozuldu.";
    if (agir && persona && persona.gururlu) {
      p.sabir = 0;                 // gururlu satici tartismaz, kalkar
      p.mesaj = "Satıcı teklifi hakaret saydı ve kalktı.";
      return sabirKontrol(state, p, araba, true);   // son sozu hakarete verdigi cevap olsun
    }
    return sabirKontrol(state, p, araba);
  }

  function ortasiKabul(state) {
    var p = state.aktifPazarlik;
    if (!p || p.bitti || !p.ortaTeklif) return { hata: "Ortada bir teklif yok." };
    var araba = arabaBul(state, p.arabaId);
    var fiyat = p.ortaTeklif;
    p.ortaTeklif = null;
    gecmiseYaz(p, "satici", fiyat);
    return alisKapat(state, p, araba, fiyat);
  }

  function ortasiRed(state) {
    var p = state.aktifPazarlik;
    if (!p || p.bitti || !p.ortaTeklif) return { hata: "Ortada bir teklif yok." };
    var araba = arabaBul(state, p.arabaId);
    p.karsi = p.ortaTeklif;
    p.ortaTeklif = null;
    p.sabir -= 1;
    gecmiseYaz(p, "satici", p.karsi);
    p.replik = { kim: "satici", metin: saticiReplik(p, araba, "karsiTeklif", p.karsi) };
    p.mesaj = "Ortasını reddettin.";
    return sabirKontrol(state, p, araba);
  }

  // karar #13 / tasarim/03 §4b — "kalkiyoruz" blofu
  function masadanKalk(state) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "alis") return { hata: "Pazarlık yok." };
    if (p.kalkKullanildi) return { hata: "Bir kez kalktın, ikincisi yutmaz." };

    var araba = arabaBul(state, p.arabaId);
    p.kalkKullanildi = true;
    p.ortaTeklif = null;

    if (G.rng.sans(c.KALK_GERI_CAGIRMA[araba.saticiTipi])) {
      p.taban = p.taban * (1 - c.KALK_TABAN_INDIRIM);
      tabanSinirla(p, araba);
      p.karsi = G.yuvarla(Math.max(p.taban, p.karsi - (p.karsi - p.taban) * c.KALK_KARSI_ADIM));
      p.sabir = c.KALK_SABIR;
      gecmiseYaz(p, "satici", p.karsi);
      p.replik = { kim: "satici", metin: saticiReplik(p, araba, "kalkCagirdi") };
      p.mesaj = "Satıcı arkandan seslendi. Son şans: sabrı bitmek üzere.";
      return p;
    }

    p.replik = { kim: "satici", metin: saticiReplik(p, araba, "kalkBitti") };
    p.mesaj = "Blöf tutmadı, satıcı arkandan seslenmedi.";
    return saticiKalkti(state, p, araba);
  }

  // tasarim/05 — Nuri "Agiz" ve Drej "Hesap" (pazarlik basina bir kez)
  function yetenekKullan(state) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti) return { hata: "Pazarlık yok." };
    if (p.ortaTeklif) return { hata: "Önce ortasına cevap ver." };
    if (p.yetenekKullanildi) return { hata: "Bu yeteneği bir kez kullandın." };

    var karakter = G.karakterler.al(p.konusan);
    if (!karakter.yetenek) return { hata: karakter.ad + "'nun pazarlıkta yeteneği yok." };

    p.yetenekKullanildi = true;
    var araba = arabaBul(state, p.arabaId);

    if (karakter.anahtar === "nuri") {
      state.istatistik.agizKullanildi++;

      // Sinirlenirse masa dagilir, ertesi gun Nuri ablasinin yaninda
      if (G.rng.sans(G.karakterler.sinirlenmeOlasiligi(state, p))) {
        state.bayraklar.nuriYokGun = state.gun + 1;
        state.istatistik.nuriSinirlendi++;
        state.gunNotlari.push("Nuri sinirlendi, masa dağıldı. Yarın ablasının yanında.");
        p.ortakReplik = { kim: "nuri", metin: replikSec(R().nuri.sinirlendi, {}, null) };
        p.mesaj = "Nuri parladı, masa dağıldı. Yarın dükkânda yok.";

        if (p.tur === "alis") {
          p.replik = { kim: "satici", metin: saticiReplik(p, araba, "kalkis") };
          return saticiKalkti(state, p, araba);
        }
        var giden = musteriBul(state, p.musteriId);
        p.bitti = true;
        p.sonuc = "gitti";
        if (giden) {
          p.replik = { kim: "musteri", metin: musteriReplik(p, giden, "kalkis") };
          musteriSil(state, giden);
        }
        return p;
      }

      if (p.tur === "alis") {
        p.taban = p.taban * (1 - c.AGIZ_TABAN_INDIRIM);
        tabanSinirla(p, araba);
        p.mesaj = "Nuri ağzını açtı: satıcının tabanı biraz indi.";
      } else {
        p.tavan = G.yuvarla(p.tavan * (1 + c.AGIZ_TAVAN_ARTIS));
        p.mesaj = "Nuri ağzını açtı: müşteri biraz daha veriyor.";
      }
      p.ortakReplik = { kim: "nuri", metin: replikSec(R().nuri.agiz, {}, null) };
      return p;
    }

    // Drej "Hesap": tabani (satista tavani) +-%4 aralikla soyler
    state.istatistik.hesapKullanildi++;
    var hedef = p.tur === "alis" ? p.taban : p.tavan;
    // Satista karsidaki musteri, personasi yok: aralik sabit kalir
    var hesapPersona = p.tur === "alis" && araba ? c.PERSONALAR[araba.persona] : null;
    var hesapCarpani = (hesapPersona && hesapPersona.hesapCarpani) || 1;
    p.hesapAraligi = {
      // Faz 3: aralik personaya gore daralir ya da genisler — memur okunakli,
      // piyasaci blof yapar (js/config.js PERSONALAR.hesapCarpani)
      alt: G.yuvarla(hedef * (1 - c.HESAP_ARALIK * hesapCarpani)),
      ust: G.yuvarla(hedef * (1 + c.HESAP_ARALIK * hesapCarpani))
    };
    p.ortakReplik = {
      kim: "drej",
      metin: replikSec(R().drej.hesap, {
        alt: G.kisaFiyat(p.hesapAraligi.alt),
        ust: G.kisaFiyat(p.hesapAraligi.ust)
      }, null)
    };
    p.mesaj = (p.tur === "alis" ? "Satıcının tabanı" : "Müşterinin tavanı") + " aşağı yukarı " +
      G.paraYaz(p.hesapAraligi.alt) + " ile " + G.paraYaz(p.hesapAraligi.ust) + " arası.";
    return p;
  }

  // replikKoru: cagiran taraf repligi kendisi kurduysa uzerine yazilmaz.
  // Gururlu satici agir hakarete kalkiyor ama ekranda "kalkis" degil o hakareti
  // duydugu repligi gormek gerekiyor (Faz 3).
  function sabirKontrol(state, p, araba, replikKoru) {
    if (p.sabir <= 0) {
      if (!replikKoru) p.replik = { kim: "satici", metin: saticiReplik(p, araba, "kalkis") };
      return saticiKalkti(state, p, araba);
    }
    return p;
  }

  // Satici masadan kalkar: ilan bugun kapanir, %50 yarin geri doner
  function saticiKalkti(state, p, araba) {
    p.bitti = true;
    p.sonuc = "kalkis";
    p.ortakReplik = G.pazarlik.ortakYorumu(p.konusan, "kalkis");

    var i = state.ilanlar.indexOf(araba);
    if (i !== -1) state.ilanlar.splice(i, 1);

    if (G.rng.sans(C().GERI_DONME_OLASILIGI)) {
      araba.geriDonus = true;
      state.geriDonenler.push(araba);
    }
    state.istatistik.kalkanSatici++;
    return p;
  }

  function vazgec(state) {
    var p = state.aktifPazarlik;
    if (!p) return null;
    p.bitti = true;
    p.sonuc = p.sonuc || "vazgec";
    return p;
  }

  // Alis kapanisi: kasa ve kapasite kontrolu, noter + plaka, stoga giris
  function alisKapat(state, p, araba, fiyat) {
    var c = C();
    var toplam = fiyat + c.NOTER_PLAKA;

    if (state.stok.length >= c.KAPASITE) {
      p.mesaj = "Dükkânda yer yok ortak, önce bir araba satmalıyız.";
      return p;
    }
    if (toplam > state.kasa) {
      p.mesaj = "Kasada pere yok ortak. Noter ve plaka da " + G.paraYaz(c.NOTER_PLAKA) + ".";
      return p;
    }

    p.bitti = true;
    p.sonuc = "kabul";
    p.anlasmaFiyati = fiyat;
    p.replik = { kim: "satici", metin: saticiReplik(p, araba, "kabul") };
    p.ortakReplik = G.pazarlik.ortakYorumu(p.konusan, "kabul");

    state.kasa -= toplam;
    araba.alisFiyati = fiyat;
    araba.masraflar = araba.ekspertizMasrafi + c.NOTER_PLAKA;
    araba.ilanFiyati = G.yuvarla(fiyat * c.ILAN_FIYAT_ONERI);
    araba.stogaGirisGunu = state.gun;
    araba.gecmisKusurSayisi = G.ekspertiz.cikanKusurlar(araba).length;

    var i = state.ilanlar.indexOf(araba);
    if (i !== -1) state.ilanlar.splice(i, 1);
    if (state.sefer) {                       // Adim 18: seferden gelen araba
      G.sefer.ilanSil(state, araba.id);
      state.sefer.alinan++;
    }
    state.stok.push(araba);

    state.istatistik.alinan++;
    if (p.fazlaVerdik) {
      state.gunNotlari.push(R().gunNotu.fazlaVerdik + " " + G.araba.adi(araba) + " için " + G.paraYaz(fiyat) + ".");
      state.istatistik.fazlaVerdik++;
    } else {
      state.gunNotlari.push(G.araba.adi(araba) + " alındı: " + G.paraYaz(fiyat) + ".");
    }
    state.defter.push({
      gun: state.gun, tur: "alis", araba: G.araba.adi(araba), fiyat: fiyat, masraf: c.NOTER_PLAKA + araba.ekspertizMasrafi
    });
    return p;
  }

  // tasarim/06 madde 6 — pazarliksiz ilan: fiyat sabit, al ya da birak
  function dogrudanAl(state, arabaId) {
    var araba = arabaBul(state, arabaId);
    if (!araba) return { hata: "İlan bulunamadı." };
    if (!araba.pazarliksiz) return { hata: "Bu ilanda pazarlık var ortak." };

    var p = {
      tur: "alis",
      arabaId: araba.id,
      arabaAdi: G.araba.adi(araba),
      istenenFiyat: araba.istenenFiyat,
      konusan: "drej",
      taban: araba.istenenFiyat,
      karsi: araba.istenenFiyat,
      sabir: 1,
      baslangicSabir: 1,
      kullanilanKozlar: [],
      kalkKullanildi: true,
      yetenekKullanildi: true,
      hakaretOldu: false,
      hesapAraligi: null,
      ortaTeklif: null,
      teklif: araba.istenenFiyat,
      gecmis: [],
      bitti: false,
      sonuc: null,
      anlasmaFiyati: 0,
      fazlaVerdik: false,
      pazarliksiz: true,
      sonReplikMetni: null,
      mesaj: null
    };
    state.aktifPazarlik = p;
    gecmiseYaz(p, "satici", araba.istenenFiyat);
    return alisKapat(state, p, araba, araba.istenenFiyat);
  }

  // ---------- SATIS ----------

  // tasarim/04 §1 — musterinin algiladigi deger
  // Arabanin fiyat segmentine gore musteri butcesi carpani (config.SEGMENT_BUTCE)
  function segmentCarpani(deger) {
    var tablo = C().SEGMENT_BUTCE || [];
    for (var i = 0; i < tablo.length; i++) {
      if (deger <= tablo[i].ustDeger) return tablo[i].carpan;
    }
    return 1;
  }

  function algilananDeger(araba, durustluk) {
    var toplam = araba.piyasaDegeri;
    for (var i = 0; i < araba.kusurlar.length; i++) {
      var k = araba.kusurlar[i];
      if (!k.ortayaCikti) continue;
      // Gozle gorunen kusuru musteri her halukarda gorur
      if (k.musteriyeSoylendi || k.gorunurluk === "acik") toplam -= k.etki;
      else if (durustluk === undefined) toplam -= k.etki;   // secim henuz yapilmadi
    }
    return Math.round(toplam);
  }

  function saklananKusurlar(araba) {
    var liste = [];
    for (var i = 0; i < araba.kusurlar.length; i++) {
      var k = araba.kusurlar[i];
      if (k.ortayaCikti && !k.musteriyeSoylendi && k.gorunurluk !== "acik") liste.push(k);
    }
    return liste;
  }

  // tasarim/04 §2-3 — gorusme basi: kim gidiyor, durustluk secimi, musteri ekspertizi, butce
  // Faz 2 — musteri satis masasina kac sabirla oturur.
  // Sorunlu araba ve dusuk itibar sabri yer: "bu arabayi niye bu kadar savunuyorsun abi".
  function satisSabri(state, musteri, karakter, araba) {
    var c = C();
    var sabir = musteri.sabir + karakter.sabirBonusu;
    sabir -= Math.round(G.araba.kusurBaskisi(araba) * c.KUSUR_SABIR_ETKI);
    if (state.itibar < c.ITIBAR_SABIR_COK_DUSUK) sabir -= 2;
    else if (state.itibar < c.ITIBAR_SABIR_ESIK) sabir -= 1;
    return Math.max(c.SATIS_SABIR_MIN, sabir);
  }

  function satisBaslat(state, musteriId, durustluk, konusan) {
    var c = C();
    var musteri = musteriBul(state, musteriId);
    if (!musteri) return { hata: "Müşteri bulunamadı." };
    var araba = arabaBul(state, musteri.arabaId);
    if (!araba) return { hata: "Araba bulunamadı." };

    var tipAyar = c.MUSTERI_TIPLERI[musteri.tip];
    var i, k;
    var kmYakalandi = false;

    // Kro'nun gezintisini orttuysak, titiz musteri kilometreyi fark edebilir
    if (state.bayraklar.ortulenKm && musteri.tip === "titiz") {
      state.bayraklar.ortulenKm = false;
      if (G.rng.sans(c.ORTULEN_KM_FARK_OLASILIK)) {
        G.durum.itibarDegis(state, c.ORTULEN_KM_ITIBAR);
        kmYakalandi = true;
        state.gunNotlari.push("Titiz müşteri kilometredeki oynamayı fark etti: itibar " +
          c.ORTULEN_KM_ITIBAR + ".");
      }
    }

    // Kro gorusmeye girerse kusurlari durustce soyler (tasarim/05)
    var karakter = G.karakterler.al(konusan || "nuri");
    if (karakter.durustlukZorunlu) {
      durustluk = karakter.durustlukZorunlu;
      state.istatistik.kroSatisi++;
    }

    if (durustluk === "soyle") {
      for (i = 0; i < araba.kusurlar.length; i++) {
        if (araba.kusurlar[i].ortayaCikti) araba.kusurlar[i].musteriyeSoylendi = true;
      }
    }

    var p = {
      tur: "satis",
      arabaId: araba.id,
      arabaAdi: G.araba.adi(araba),
      musteriId: musteri.id,
      musteriAdi: musteri.isim,
      musteriTipi: musteri.tip,
      durustluk: durustluk,
      konusan: karakter.anahtar,
      takas: null,
      tavan: 0,
      karsi: 0,
      sabir: satisSabri(state, musteri, karakter, araba),   // ortak bonusu + kusur yuku + itibar
      tavizKullanildi: false,
      yetenekKullanildi: false,
      hakaretOldu: false,
      hesapAraligi: null,
      teklif: araba.ilanFiyati,
      gecmis: [],
      bitti: false,
      sonuc: null,
      anlasmaFiyati: 0,
      bulunanKusurlar: [],
      sonReplikMetni: null,
      mesaj: null
    };

    // Musteri ekspertizi
    var ekspertizYapar = true;
    if (musteri.ekspertizYok) ekspertizYapar = false;

    if (ekspertizYapar) {
      // a) Saklanan kusurlar yakalanabilir (tasarim/04 §3)
      var saklananlar = saklananKusurlar(araba);
      var yakalanan = [];
      for (i = 0; i < saklananlar.length; i++) {
        k = saklananlar[i];
        var olasilik = c.YAKALANMA_OLASILIKLARI[k.gorunurluk] || 0;
        if (musteri.tip === "titiz") olasilik += c.YAKALANMA_TITIZ_BONUS;
        if (G.rng.sans(olasilik)) yakalanan.push(k);
      }
      if (yakalanan.length > 0) {
        p.bitti = true;
        p.sonuc = "yakalandi";
        p.bulunanKusurlar = yakalanan;
        p.replik = {
          kim: "musteri",
          metin: musteriReplik(p, musteri, "yakalandi", undefined, G.kusurAdi(yakalanan[0].tip))
        };
        G.durum.itibarDegis(state, c.YAKALANMA_ITIBAR);
        musteriSil(state, musteri);
        state.istatistik.yakalanan++;
        state.gunNotlari.push(
          G.araba.adi(araba) + ": müşteri " + G.kusurAdi(yakalanan[0].tip) + " yakaladı, itibar düştü."
        );
        state.aktifPazarlik = p;
        return p;
      }

      // b) Oyuncunun da bilmedigi kusurlar cikabilir
      var seviye = c.EKSPERTIZ[tipAyar.ekspertiz];
      for (i = 0; i < araba.kusurlar.length; i++) {
        k = araba.kusurlar[i];
        if (k.ortayaCikti) continue;
        if (G.rng.sans(seviye[k.gorunurluk])) {
          k.ortayaCikti = true;
          k.musteriyeSoylendi = true;     // rapor musteride, saklanmis sayilmaz
          p.bulunanKusurlar.push(k);
          p.sabir -= 1;
        }
      }
    }

    // Sase uyumsuzlugu ortaya ciktiysa araba satilamaz (tasarim/04 §3)
    if (G.araba.satilamazMi(araba) && saseGoruldu(araba)) {
      p.bitti = true;
      p.sonuc = "sase";
      p.replik = { kim: "musteri", metin: "Abi şase numarası tutmuyor. Ben bunu alamam." };
      p.mesaj = "Şase uyumsuzluğu çıktı. Bu arabayı ancak araba pazarına hurda fiyatına verebilirsin.";
      musteriSil(state, musteri);
      state.aktifPazarlik = p;
      return p;
    }

    // Butce (tasarim/04 §2)
    var algilanan = algilananDeger(araba, durustluk);
    var butce = algilanan * G.rng.aralik(tipAyar.butceMin, tipAyar.butceMaks);
    butce *= segmentCarpani(araba.piyasaDegeri);       // Adim 17: segment marji
    butce *= G.trend.carpanlar(state, araba).butce;    // piyasa trendi (js/trend.js)
    if (state.itibar > c.ITIBAR_BUTCE_YUKSEK.esik) butce *= c.ITIBAR_BUTCE_YUKSEK.carpan;
    else if (state.itibar < c.ITIBAR_BUTCE_DUSUK.esik) butce *= c.ITIBAR_BUTCE_DUSUK.carpan;
    for (var j = 0; j < p.bulunanKusurlar.length; j++) {
      if (p.bulunanKusurlar[j].musteriyeSoylendi && durustluk === "sakla") butce -= p.bulunanKusurlar[j].etki;
    }

    // Adim 21: cekle odeme teklifi. Zorunlu degil — nakit satis her zaman acik.
    // Cek secilirse musteri ustune fark veriyor (cekeCevir), yoksa normal musteri.
    if (G.cek.teklifVarMi(musteri)) {
      p.cekTeklifi = true;
      p.cekRiski = musteri.cekRiski;
    }

    p.tavan = G.yuvarla(butce);
    p.karsi = G.yuvarla(p.tavan * G.rng.aralik(c.SATIS_ACILIS[0], c.SATIS_ACILIS[1]));
    p.teklif = araba.ilanFiyati;

    // Dusuk itibarda musteri kapidan govensiz giriyor (Faz 2)
    var acilisDurum = state.itibar < c.ITIBAR_GUVENSIZ_ESIK ? "guvensizAcilis" : "acilis";
    p.replik = { kim: "musteri", metin: musteriReplik(p, musteri, acilisDurum, p.karsi) };
    if (kmYakalandi) {
      p.mesaj = "Müşteri kilometreye dikkat çekti: \"Bu araba son bir ayda çok gezmiş abi.\"";
    }
    if (durustluk === "soyle" && G.ekspertiz.cikanKusurlar(araba).length > 0) {
      p.tesekkur = musteriReplik(p, musteri, "durustTesekkur");
    }
    gecmiseYaz(p, "musteri", p.karsi);

    state.aktifPazarlik = p;
    return p;
  }

  function saseGoruldu(araba) {
    for (var i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].tip === "sase" && araba.kusurlar[i].ortayaCikti) return true;
    }
    return false;
  }

  // tasarim/04 §4 — satis pazarligi (alisin aynasi)
  function satisTeklif(state, F) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "satis") return { hata: "Görüşme yok." };

    var musteri = musteriBul(state, p.musteriId);
    var araba = arabaBul(state, p.arabaId);
    F = G.yuvarla(F, c.TEKLIF_ADIMI);
    if (F <= 0) return { hata: "Fiyat sıfır olmaz." };
    p.teklif = F;
    gecmiseYaz(p, "sen", F);

    // Agzindan cikani baglar: musteri daha fazlasini verecek olsa bile satis oyuncunun
    // soyledigi fiyattan kapanir. Once karsi teklifden kapaniyordu; bedava pere oyunu
    // gereksiz kolaylastiriyordu (Eren'in 5. maddesi).
    if (F <= p.tavan) {
      return satisKapat(state, p, araba, musteri, F);
    }
    if (F <= p.tavan * c.KAZIK_ESIK) {
      p.karsi = G.yuvarla(p.karsi + (p.tavan - p.karsi) * c.SATIS_ADIM);
      p.sabir -= 1;
      gecmiseYaz(p, "musteri", p.karsi);
      p.replik = { kim: "musteri", metin: musteriReplik(p, musteri, "karsiTeklif", p.karsi) };
      p.mesaj = null;
      return musteriSabirKontrol(state, p, musteri);
    }

    p.sabir -= 2;
    p.hakaretOldu = true;
    p.replik = { kim: "musteri", metin: musteriReplik(p, musteri, "kazik") };
    p.mesaj = "Müşteri bu fiyata bozuldu.";
    return musteriSabirKontrol(state, p, musteri);
  }

  // tasarim/04 §4 — "Lastikler bizden"
  function taviz(state) {
    var c = C();
    var p = state.aktifPazarlik;
    if (!p || p.bitti || p.tur !== "satis") return { hata: "Görüşme yok." };
    if (p.tavizKullanildi) return { hata: "Bu tavizi verdin." };
    if (state.kasa < c.TAVIZ.bedel) return { hata: "Kasada pere yok ortak." };

    var araba = arabaBul(state, p.arabaId);
    var musteri = musteriBul(state, p.musteriId);
    p.tavizKullanildi = true;
    state.kasa -= c.TAVIZ.bedel;
    araba.masraflar += c.TAVIZ.bedel;
    p.sabir += c.TAVIZ.sabir;
    p.tavan += c.TAVIZ.tavan;
    p.replik = { kim: "musteri", metin: "Lastikler sizden mi? Tamam abi, o zaman konuşuruz." };
    p.mesaj = c.TAVIZ.etiket + ": " + G.paraYaz(c.TAVIZ.bedel) + " masraf, müşteri yumuşadı.";
    return p;
  }

  function musteriSabirKontrol(state, p, musteri) {
    if (p.sabir <= 0) {
      p.bitti = true;
      p.sonuc = "gitti";
      p.replik = { kim: "musteri", metin: musteriReplik(p, musteri, "kalkis") };
      if (G.rng.sans(C().MUSTERI_GERI_GELME)) {
        musteri.geriGelisGunu = state.gun + C().MUSTERI_GERI_GUN;
        state.geriGelenMusteriler.push(musteri);
      }
      musteriSil(state, musteri);
    }
    return p;
  }

  function musteriSil(state, musteri) {
    var i = state.musteriler.indexOf(musteri);
    if (i !== -1) state.musteriler.splice(i, 1);
  }

  // tasarim/04 §5 — para ve masraflar
  function satisKapat(state, p, araba, musteri, fiyat) {
    var c = C();
    p.bitti = true;
    p.sonuc = "satildi";
    p.anlasmaFiyati = fiyat;
    p.replik = { kim: "musteri", metin: musteriReplik(p, musteri, "kabul") };

    var kar = fiyat - araba.alisFiyati - araba.masraflar;
    if (p.takas) p.takasDegeri = p.takas.bicilenDeger;
    var vergiOrani = c.VERGI_ORANI;
    if (state.bayraklar.vergiIndirimi) {
      vergiOrani = c.VERGI_INDIRIMLI_ORAN;
      state.bayraklar.vergiIndirimi = false;
      state.gunNotlari.push("Müşavirin yolu işledi: bu satışta vergi %" +
        Math.round(c.VERGI_INDIRIMLI_ORAN * 100) + ".");
    }
    var vergi = kar > 0 ? Math.round(kar * vergiOrani) : 0;
    // Konsinyede satis bedelinin sahibin neti kadarlik kismi bize kalmaz (Adim 19)
    var sahibeOdenen = araba.konsinye ? araba.konsinye.sahipNet : 0;
    // Takasta musteri farkin kalanini oder, arabasi tezgaha girer (Adim 20)
    var takasDegeri = G.takas.satisaIsle(state, p);
    var nakit = fiyat - takasDegeri;

    // Cekle satista hicbir sey pesin donmez: vergi ve konsinye neti de vadeye kalir
    // (Adim 21). Cek yanarsa ikisi de odenmez, zaten para da gelmez.
    var cekeGiden = p.cekli
      ? G.cek.satisaIsle(state, p, musteri, nakit, vergi, sahibeOdenen) : 0;
    if (cekeGiden > 0) {
      state.kasa += nakit - cekeGiden;          // sadece Riza'nin aval payi gibi pesin kalemler
    } else {
      state.kasa += nakit - vergi - sahibeOdenen;
    }

    p.kar = kar;
    p.vergi = vergi;
    p.netKar = kar - vergi;

    // Itibar: durust satis +3 (tasarim/04 §6)
    if (p.durustluk === "soyle") {
      G.durum.itibarDegis(state, c.DURUST_ITIBAR);
      state.istatistik.durustSatis++;
    }

    // Saklanip yakalanmadiysa sikayet kartina zemin hazirlanir (tasarim/04 §3)
    var saklananlar = saklananKusurlar(araba);
    if (saklananlar.length > 0) {
      var toplam = G.araba.kusurToplami(saklananlar);
      var gun = state.gun + G.rng.tam(c.SIKAYET_GECIKME_MIN, c.SIKAYET_GECIKME_MAKS);
      state.bekleyenEtkiler.push({
        gun: gun,
        tur: "sikayet",
        araba: G.araba.adi(araba),
        etki: { kasa: -Math.round(toplam * c.SIKAYET_CARPAN), itibar: c.SIKAYET_ITIBAR }
      });
      state.istatistik.saklanan++;
    }

    var i = state.stok.indexOf(araba);
    if (i !== -1) state.stok.splice(i, 1);
    musteriSil(state, musteri);

    // Bu arabayi bekleyen baska musteriler de dusur
    for (var j = state.musteriler.length - 1; j >= 0; j--) {
      if (state.musteriler[j].arabaId === araba.id) state.musteriler.splice(j, 1);
    }

    // Belgesiz satista denetim riski (Adim 22)
    G.belge.denetimKontrol(state, araba);

    state.istatistik.satilan++;
    state.istatistik.toplamKar += p.netKar;
    if (araba.konsinye) {
      state.istatistik.konsinyeSatilan++;
      state.istatistik.konsinyeKomisyonu += p.netKar;
      p.konsinye = true;
    }
    if (p.netKar > state.istatistik.enIyiPazarlik) state.istatistik.enIyiPazarlik = p.netKar;

    state.gunNotlari.push(
      G.araba.adi(araba) + (araba.konsinye ? " konsinyeden satıldı: " : " satıldı: ") +
      G.paraYaz(fiyat) +
      (araba.konsinye ? " (komisyon " : " (net ") + G.paraYaz(p.netKar) + ")"
    );
    state.defter.push({
      gun: state.gun, tur: araba.konsinye ? "konsinye-satis" : "satis",
      araba: G.araba.adi(araba), fiyat: fiyat, masraf: vergi + sahibeOdenen, kar: p.netKar
    });
    return p;
  }

  // Sase cikmis arabayi araba pazarina ver (tasarim/04 §3)
  function hurdayaVer(state, arabaId) {
    var konsinyeArabasi = arabaBul(state, arabaId);
    if (konsinyeArabasi && konsinyeArabasi.konsinye) {
      return { hata: "Konsinye araba bizim değil, hurdaya veremeyiz." };
    }
    var c = C();
    var araba = arabaBul(state, arabaId);
    if (!araba) return { hata: "Araba bulunamadı." };
    var fiyat = G.yuvarla(araba.piyasaDegeri * c.SASE_HURDA_ORAN);
    var kar = fiyat - araba.alisFiyati - araba.masraflar;
    state.kasa += fiyat;

    var i = state.stok.indexOf(araba);
    if (i !== -1) state.stok.splice(i, 1);
    for (var j = state.musteriler.length - 1; j >= 0; j--) {
      if (state.musteriler[j].arabaId === araba.id) state.musteriler.splice(j, 1);
    }
    state.istatistik.satilan++;
    state.istatistik.toplamKar += kar;
    state.gunNotlari.push(G.araba.adi(araba) + " araba pazarına verildi: " + G.paraYaz(fiyat) + " (" + G.paraYaz(kar) + ")");
    state.defter.push({ gun: state.gun, tur: "hurda", araba: G.araba.adi(araba), fiyat: fiyat, masraf: 0, kar: kar });
    return { fiyat: fiyat, kar: kar };
  }

  // Nuri / Drej yorumu (pasif; aktif yetenekler Adim 7)
  function ortakYorumu(konusan, durum) {
    if (!konusan) return null;
    var liste = R()[konusan] && R()[konusan][durum];
    if (!liste) return null;
    return { kim: konusan, metin: replikSec(liste, {}, null) };
  }

  return {
    alisBaslat: alisBaslat,
    alisTeklif: alisTeklif,
    kozKullan: kozKullan,
    kozCelisiyorMu: kozCelisiyorMu,
    ortasiKabul: ortasiKabul,
    ortasiRed: ortasiRed,
    masadanKalk: masadanKalk,
    yetenekKullan: yetenekKullan,
    vazgec: vazgec,
    dogrudanAl: dogrudanAl,
    satisBaslat: satisBaslat,
    satisTeklif: satisTeklif,
    taviz: taviz,
    hurdayaVer: hurdayaVer,
    algilananDeger: algilananDeger,
    segmentCarpani: segmentCarpani,
    saklananKusurlar: saklananKusurlar,
    ruhHali: ruhHali,
    ortakYorumu: ortakYorumu,
    saticiRepligi: function (araba, durum) {     // sabah haberi gibi pazarlik disi yerler icin
      return saticiReplik(null, araba, durum);
    },
    arabaBul: arabaBul,
    musteriBul: musteriBul
  };
})();
