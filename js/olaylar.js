// olaylar.js — olay destesi, etki motoru, gecikmeli ve aksam etkileri.
// DOM'a dokunmaz. Kaynak: context/tasarim/06-olay-kartlari.md
window.G = window.G || {};

G.olaylar = (function () {
  var C = function () { return G.config; };

  function kartBul(id) {
    for (var i = 0; i < G.data.kartlar.length; i++) {
      if (G.data.kartlar[i].id === id) return G.data.kartlar[i];
    }
    return null;
  }

  // tasarim/06 — agirlikli cekim. Gizli kartlar destede degil, ayni kart art arda cikmaz,
  // tekrarYok karti bir kez cikar, kosulu saglanmayan kart atlanir.
  function kartCek(state) {
    var aday = [];
    for (var i = 0; i < G.data.kartlar.length; i++) {
      var k = G.data.kartlar[i];
      if (k.gizli || !k.agirlik || k.agirlik <= 0) continue;
      if (k.id === state.sonKartId) continue;
      if (k.tekrarYok && state.cikanKartlar.indexOf(k.id) !== -1) continue;
      if (k.kosul && !k.kosul(state)) continue;
      aday.push({ deger: k, agirlik: k.agirlik });
    }
    if (aday.length === 0) return kartBul("sakin");
    return G.rng.agirlikliSec(aday);
  }

  // Zamani gelmis sikayet varsa sabah karti onun yerine gecer (tasarim/06 madde 12)
  function bekleyenSikayetSirasi(state) {
    for (var i = 0; i < state.bekleyenEtkiler.length; i++) {
      var b = state.bekleyenEtkiler[i];
      if (b.tur === "sikayet" && b.gun <= state.gun) return i;
    }
    return -1;
  }

  // tasarim/06 — ertesi sabahin karti aksamdan onceden cekilir ("Sizce?" sorusu onun)
  function yarinkiKartiCek(state) {
    for (var i = 0; i < state.bekleyenEtkiler.length; i++) {
      var b = state.bekleyenEtkiler[i];
      if (b.tur === "sikayet" && b.gun <= state.gun + 1) {
        state.yarinkiKart = "sikayet";     // zamanlanmis kart cekilen kartin yerine gecer
        return state.yarinkiKart;
      }
    }
    state.yarinkiKart = kartCek(state).id;
    return state.yarinkiKart;
  }

  // "Sizce?" secimi: olasilik kaydirmasini kurar ve secimi ertesi sabaha not eder
  function sizceUygula(state, sira) {
    var kart = kartBul(state.yarinkiKart);
    if (!kart) return null;
    var secenek = kart.sizceSecenekleri[sira] || kart.sizceSecenekleri[0];
    state.sizceKaydirma = (secenek.kaydirma || 0) * C().SIZCE_KAYDIRMA;
    state.sizceSecimi = {
      kartId: kart.id,
      etkiAnahtari: secenek.etkiAnahtari,
      etiket: secenek.etiket,
      hatirlatma: secenek.hatirlatma || ""
    };
    state.istatistik.sizceSecimi++;
    return state.sizceSecimi;
  }

  // Sabah kartini hazirla: dun aksam cekilmis kart varsa o, yoksa desteden
  function sabahKartiniHazirla(state) {
    var sira = bekleyenSikayetSirasi(state);
    if (sira === -1 && state.yarinkiKart && state.yarinkiKart !== "sikayet") {
      state.aktifKart = { id: state.yarinkiKart };
      state.yarinkiKart = null;
      return state.aktifKart;
    }
    state.yarinkiKart = null;
    if (sira !== -1) {
      var b = state.bekleyenEtkiler.splice(sira, 1)[0];
      state.istatistik.sikayetGelen++;
      state.aktifKart = {
        id: "sikayet",
        diyalogKurulacak: true,
        ekMetin: b.araba + " için para geri isteniyor.",
        ekEtki: {
          kasa: b.etki.kasa,
          itibar: b.etki.itibar,
          not: "Şikâyet: " + b.araba + " için " + G.paraYaz(-b.etki.kasa) +
            " geri ödendi, itibar " + b.etki.itibar + "."
        }
      };
      kartDiyalogunuKur(state);
      return state.aktifKart;
    }
    var kart = kartCek(state);
    state.aktifKart = { id: kart.id };
    kartDiyalogunuKur(state);
    return state.aktifKart;
  }

  // Kartin replikleri varsa once onlar oynanir, secenekler sonra gorunur (Faz C)
  function kartDiyalogunuKur(state) {
    var ak = state.aktifKart;
    if (!ak) return;
    var kart = kartBul(ak.id);
    if (!kart || !kart.replikler || !kart.replikler.length) return;
    var sahne = G.sahne.kartSahnesi(kart.kategori);
    G.diyalog.kur(state, kart.replikler, {
      mekan: sahne.mekan, kisiler: sahne.kisiler, kaynak: "kart"
    });
  }

  function aktifKartTanimi(state) {
    return state.aktifKart ? kartBul(state.aktifKart.id) : null;
  }

  // Oyuncu kart seceneklerinden birini sectiginde
  function secenekSec(state, sira) {
    var ak = state.aktifKart;
    if (!ak) return { hata: "Ortada kart yok." };
    var kart = kartBul(ak.id);
    if (!kart) { state.aktifKart = null; return { hata: "Kart bulunamadı." }; }

    var secenek = kart.secenekler[sira] || kart.secenekler[0];
    if (state.diyalog && state.diyalog.kaynak === "kart") state.diyalog = null;

    state.sonKartId = kart.id;
    state.istatistik.kartSecimi++;
    if (state.cikanKartlar.indexOf(kart.id) === -1) state.cikanKartlar.push(kart.id);

    etkiUygula(state, kart.temelEtki);
    etkiUygula(state, ak.ekEtki);
    etkiUygula(state, secenek.etki);

    state.aktifKart = null;
    state.faz = "mesai";
    state.ekran = "dukkan";
    G.gun.kaybettiMi(state);       // sikayet kasayi eksiye dusurebilir
    return state;
  }

  // ---- etki motoru (etkiler veri, kod degil) ----

  // tasarim/06 — "Sizce?" secimi ertesi gunun kartindaki olasiligi +-%20 kaydirir.
  // Kaydirma ilk sans atisinda tukenir; gecikmeli/aksam etkilerinde kayda islenir.
  function sansDegeri(state, p) {
    var k = state.sizceKaydirma || 0;
    if (!k || p === undefined) return p;
    state.sizceKaydirma = 0;
    return G.kirp(p + k, 0, 1);
  }

  function notEkle(state, metin) {
    if (!metin) return;
    state.gunNotlari.push(metin);
    state.sabahHaberleri.push(metin);
  }

  function rastgeleStok(state) {
    if (state.stok.length === 0) return null;
    return state.stok[G.rng.tam(0, state.stok.length - 1)];
  }

  function kmEkle(state, km) {
    var araba = rastgeleStok(state);
    if (!araba) return;
    araba.km += km;
    notEkle(state, G.araba.adi(araba) + ": kilometre " + km + " arttı.");
  }

  // Kro bir stok arabasini piyasa x oran fiyatina satmis (tasarim/06 madde 9)
  function kroSatti(state, oran) {
    var c = C();
    var araba = rastgeleStok(state);
    if (!araba) {
      notEkle(state, "Kro: sinek bile uçmadı dayı.");
      return;
    }
    var fiyat = G.yuvarla(araba.piyasaDegeri * oran);
    var kar = fiyat - araba.alisFiyati - araba.masraflar;
    var vergi = kar > 0 ? Math.round(kar * c.VERGI_ORANI) : 0;
    state.kasa += fiyat - vergi;

    var i = state.stok.indexOf(araba);
    if (i !== -1) state.stok.splice(i, 1);
    for (var j = state.musteriler.length - 1; j >= 0; j--) {
      if (state.musteriler[j].arabaId === araba.id) state.musteriler.splice(j, 1);
    }
    state.istatistik.satilan++;
    state.istatistik.toplamKar += (kar - vergi);
    state.defter.push({
      gun: state.gun, tur: "satis", araba: G.araba.adi(araba),
      fiyat: fiyat, masraf: vergi, kar: kar - vergi
    });
    notEkle(state, "Kro " + G.araba.adi(araba) + " arabasını " + G.paraYaz(fiyat) +
      " fiyatına satmış (net " + G.paraYaz(kar - vergi) + ").");
  }

  // Olay kartinin listeye soktugu ilanlar
  function ilanEkle(state, tip) {
    var c = C();
    if (state.ilanlar.length >= c.MAKS_ILAN) {
      notEkle(state, "İlan listesi dolu, yeni ilana yer kalmadı.");
      return null;
    }
    var araba;
    if (tip === "riza") {
      araba = G.araba.ilanUret(state, "olay", "abartici");
      araba.riza = true;
      araba.sabirZorla = c.RIZA_SABIR;
    } else {
      araba = G.araba.ilanUret(state, "olay");
      araba.istenenFiyat = G.yuvarla(araba.piyasaDegeri * c.UCUZ_ILAN_ORAN);
      araba.pazarliksiz = true;
    }
    state.ilanlar.push(araba);
    return araba;
  }

  function gecikmeYaz(state, g) {
    var gun = state.gun + (g.gun !== undefined ? g.gun : G.rng.tam(g.gunMin, g.gunMaks));
    state.bekleyenEtkiler.push({
      gun: gun,
      tur: "olay",
      sans: sansDegeri(state, g.sans),
      etki: g.etki,
      bosNot: g.bosNot
    });
  }

  // Adim 19 — Riza'nin getirdigi araba dogrudan konsinye olarak tezgaha girer
  function rizaKonsinyesi(state) {
    if (state.stok.length >= C().KAPASITE) {
      notEkle(state, "Tezgâh dolu olduğu için Rıza arabayı geri götürdü.");
      return;
    }
    var araba = G.araba.ilanUret(state, "riza");
    araba.riza = true;
    araba.konsinyeMumkun = true;
    state.ilanlar.push(araba);
    G.ekspertiz.gozKontrol(araba);
    G.konsinye.kabulEt(state, araba.id);
  }

  function etkiUygula(state, etki) {
    if (!etki) return;

    if (etki.sans !== undefined) {
      if (G.rng.sans(sansDegeri(state, etki.sans))) etkiUygula(state, etki.evet);
      else etkiUygula(state, etki.hayir);
    }

    if (etki.kasa) state.kasa += etki.kasa;
    if (etki.itibar) G.durum.itibarDegis(state, etki.itibar);
    if (etki.aksiyon) state.aksiyon = Math.max(0, state.aksiyon + etki.aksiyon);
    if (etki.bayrak) state.bayraklar[etki.bayrak] = true;
    if (etki.sayac) state.bayraklar[etki.sayac.ad] = etki.sayac.deger;
    if (etki.kroYok) state.bayraklar.kroYokGun = state.gun + 1;
    if (etki.nuriYok) state.bayraklar.nuriYokGun = state.gun + 1;
    if (etki.sahteIlan) state.bayraklar.sahteIlanGun = etki.sahteIlan;
    if (etki.stokKm) kmEkle(state, etki.stokKm);
    if (etki.stokSat) kroSatti(state, etki.stokSat);
    if (etki.ilan) ilanEkle(state, etki.ilan.tip);
    if (etki.gecikme) gecikmeYaz(state, etki.gecikme);
    if (etki.aksamda) {
      var aksamEtki = etki.aksamda;
      if (aksamEtki.sans !== undefined) {
        var kaydirilmis = sansDegeri(state, aksamEtki.sans);
        if (kaydirilmis !== aksamEtki.sans) {
          aksamEtki = {
            sans: kaydirilmis, evet: aksamEtki.evet, hayir: aksamEtki.hayir
          };
        }
      }
      state.aksamEtkileri.push({ gun: state.gun, etki: aksamEtki });
    }
    if (etki.ozel === "rizaKonsinye") rizaKonsinyesi(state);
    if (etki.not) notEkle(state, etki.not);
  }

  // ---- gecikmeli etkiler (sabah) ----
  // Sikayet kayitlari burada islenmez; onlar sabah kartina donusur.
  function bekleyenEtkileriIsle(state) {
    for (var i = state.bekleyenEtkiler.length - 1; i >= 0; i--) {
      var b = state.bekleyenEtkiler[i];
      if (b.gun > state.gun || b.tur === "sikayet") continue;
      state.bekleyenEtkiler.splice(i, 1);
      if (b.sans !== undefined) {
        if (G.rng.sans(b.sans)) etkiUygula(state, b.etki);
        else notEkle(state, b.bosNot || "");
      } else {
        etkiUygula(state, b.etki);
      }
    }
  }

  // ---- aksam etkileri (gun sonunda cozulur) ----
  function aksamEtkileriIsle(state) {
    for (var i = state.aksamEtkileri.length - 1; i >= 0; i--) {
      var a = state.aksamEtkileri[i];
      if (a.gun > state.gun) continue;
      state.aksamEtkileri.splice(i, 1);
      etkiUygula(state, a.etki);
    }
  }

  return {
    kartBul: kartBul,
    kartCek: kartCek,
    yarinkiKartiCek: yarinkiKartiCek,
    sizceUygula: sizceUygula,
    sabahKartiniHazirla: sabahKartiniHazirla,
    kartDiyalogunuKur: kartDiyalogunuKur,
    aktifKartTanimi: aktifKartTanimi,
    secenekSec: secenekSec,
    etkiUygula: etkiUygula,
    bekleyenEtkileriIsle: bekleyenEtkileriIsle,
    aksamEtkileriIsle: aksamEtkileriIsle,
    ilanEkle: ilanEkle
  };
})();
