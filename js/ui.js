// ui.js — butun DOM isi burada (kurallar.md 3). Tek yon: aksiyon -> mantik -> ciz().
// Kaynak: context/tasarim/07-ekranlar-ve-ton.md
window.G = window.G || {};

G.ui = (function () {
  var kap = null;
  var C = function () { return G.config; };
  var S = function () { return G.state; };

  // ---------- kucuk yardimcilar ----------

  function kacis(metin) {
    return String(metin === undefined || metin === null ? "" : metin)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function kmYaz(km) {
    return G.paraYaz(km).replace(" TL", " km");
  }

  function buton(is, etiket, ek, pasif) {
    return '<button class="btn ' + (ek || "") + '" data-is="' + is + '"' +
      (pasif ? " disabled" : "") + ">" + kacis(etiket) + "</button>";
  }

  function butonVeri(is, veri, etiket, ek, pasif) {
    var veriler = "";
    for (var anahtar in veri) {
      if (veri.hasOwnProperty(anahtar)) veriler += ' data-' + anahtar + '="' + kacis(veri[anahtar]) + '"';
    }
    return '<button class="btn ' + (ek || "") + '" data-is="' + is + '"' + veriler +
      (pasif ? " disabled" : "") + ">" + kacis(etiket) + "</button>";
  }

  function balon(kim, metin, ad) {
    if (!metin) return "";
    return '<div class="balon ' + kim + '"><span class="balon-ad">' + kacis(ad || "") + '</span>' +
      kacis(metin) + "</div>";
  }

  function etiketSerit(metin) {
    return '<div class="etiket">' + kacis(metin) + "</div>";
  }

  function kirmiziBant(metin) {
    return '<div class="bant">' + kacis(metin) + "</div>";
  }

  // Adim 6: itibar sayisi yerine sanayideki adimiz
  function itibarSozu(itibar) {
    if (itibar >= 80) return "adımız iyi";
    if (itibar >= 60) return "işler yolunda";
    if (itibar >= 40) return "idare eder";
    if (itibar >= 20) return "adımız bozuldu";
    return "kapıdan giren yok";
  }

  // Adim 6: musteri gelme sansini oyuncuya gosterelim ki itibarin etkisi gorunsun
  function sansSozu(p) {
    if (p >= 0.55) return "yüksek";
    if (p >= 0.35) return "iyi";
    if (p >= 0.18) return "orta";
    if (p > 0.05) return "düşük";
    return "yok gibi";
  }

  // Adim 13: her kapagin arkasinda o ana ait sahne (karar #14)
  function sahneKapak(sinif, anahtar, veri, ic, baloncuklar) {
    var s = S();
    var v = {};
    for (var anah in (veri || {})) {
      if (veri.hasOwnProperty(anah)) v[anah] = veri[anah];
    }
    // Rehberde konusan bu ekrandaysa sahnede gorunsun (Adim 16)
    var rAdim = G.rehber.suAnki(s);
    if (rAdim && rAdim.ekran === s.ekran && !v.ekKisi) {
      v.ekKisi = rAdim.kim;
      v.ekIfade = rAdim.ifade || "normal";
    }
    var sahne;
    if (typeof anahtar === "string") {
      sahne = G.sahne.hazir(anahtar, v);
    } else {
      // Nesne olarak gelen sahnelerde (or. ekranOlay -> kartSahnesi) de rehber karakteri eklensin
      sahne = {
        mekan: anahtar.mekan,
        konusan: anahtar.konusan,
        isik: anahtar.isik,
        araba: anahtar.araba,
        kisiler: (anahtar.kisiler || []).slice()
      };
      if (v.ekKisi) {
        var varMi = false;
        for (var k = 0; k < sahne.kisiler.length; k++) {
          if (sahne.kisiler[k].kim === v.ekKisi) varMi = true;
        }
        if (!varMi) {
          var dolu = sahne.kisiler.map(function (x) { return x.konum; });
          var bosKonum = dolu.indexOf("sol") === -1 ? "sol" : (dolu.indexOf("orta") === -1 ? "orta" : "sag");
          sahne.kisiler.push({ kim: v.ekKisi, konum: bosKonum, ifade: v.ekIfade || "normal" });
        }
        sahne.isik = v.ekKisi;
      }
    }
    return '<div class="kapak ' + sinif + '">' +
      G.sahne.ciz(sahne, baloncuklar || "") +
      '<div class="kapak-ic">' + ic + "</div>" +
      "</div>";
  }

  // Karar ekranlarinda baslik tek satir olsun ki ekran sigsin
  function tekSatirBaslik(etiket, baslik, ek) {
    return '<div class="tek-satir">' +
      '<span class="etiket">' + kacis(etiket) + "</span>" +
      "<b>" + kacis(baslik) + "</b>" +
      (ek ? '<span class="kucuk">' + kacis(ek) + "</span>" : "") +
      "</div>";
  }

  // Replik sahnedeki karakterin yanindan ciksin (karar #17)
  var sonKasa = null;          // ustbardaki kasa vurgusu icin
  var sonBaloncuk = null;      // baloncuk giris animasyonu icin

  function baloncuk(konum, sinif, ad, metin, ek) {
    if (!metin) return "";
    var yeniMi = metin !== sonBaloncuk;    // ayni replik tekrar cizilince animasyon oynamasin
    sonBaloncuk = metin;
    return '<div class="baloncuk ' + konum + " " + sinif + (ek ? " " + ek : "") +
      (yeniMi ? " yeni" : "") + '">' +
      (ad ? '<span class="kim">' + kacis(ad) + "</span>" : "") +
      kacis(metin) + "</div>";
  }

  // Sahneye konacak araba bilgisi (Adim 17). Gorsel yoksa sahne eskisi gibi cizilir.
  function sahneArabasi(araba) {
    if (!araba) return null;
    return { anahtar: G.sahne.arabaAnahtari(araba), govde: araba.govde || "sedan" };
  }

  // Ilan ve stok kartindaki kucuk araba seridi
  function kartArabaSeridi(araba) {
    var bilgi = sahneArabasi(araba);
    if (!bilgi) return "";
    var katman = G.sahne.ciz({ mekan: "", araba: bilgi });
    var bas = katman.indexOf('<div class="sahne-araba"');
    if (bas === -1) return "";                       // hicbir gorsel yok, serit cizilmez
    var son = katman.indexOf("</div>", katman.indexOf("<img", bas)) + 6;
    var ic = katman.slice(katman.indexOf("<img", bas), son - 6);
    return '<div class="kart-araba">' + ic + "</div>";
  }

  // Sahnede kimin hangi konumda durdugunu bul (baloncugu oraya koymak icin)
  function konumBul(sahne, kim) {
    var kisiler = (sahne && sahne.kisiler) || [];
    for (var i = 0; i < kisiler.length; i++) {
      if (kisiler[i].kim === kim) return kisiler[i].konum || "orta";
    }
    return "orta";
  }

  // Diyalog surerken sahneye tiklanabilir katman ve "Devam" gostergesi
  function diyalogKatmani(s) {
    return '<button class="diyalog-tiklama" data-is="diyalogIlerle" aria-label="Devam"></button>' +
      '<span class="devam-isaret">Devam ▸</span>';
  }

  // Rehber adimi bu ekrandaysa onu da karakterin agzindan ver
  function rehberBaloncugu(ekran, konum) {
    var s = S();
    var adim = G.rehber.suAnki(s);
    if (!adim || adim.ekran !== ekran) return "";
    var kim = G.karakterler.al(adim.kim);
    return baloncuk(konum || "sol", kim.anahtar, kim.ad, adim.metin, "rehber");
  }

  function rehberBandi() {
    var s = S();
    // Hikaye sahnesi, giris ve ogretici kapanisi oynarken rehber susar
    if (s.ekran === "hikaye" || s.ekran === "giris" ||
        s.ekran === "kimKimdir" || s.ekran === "tutorialBitti") return "";
    var adim = G.rehber.suAnki(s);
    if (!adim) return "";
    var kim = G.karakterler.al(adim.kim);
    var ilerleme = G.rehber.ilerleme(s);
    var ayniEkran = adim.ekran === s.ekran;
    return '<div class="rehber-bant ' + kim.renkSinifi + '">' +
      '<span class="rehber-etiket">ADIM ' + ilerleme.adim + "/" + ilerleme.toplam + "</span>" +
      '<span class="rehber-metin">' +
        (ayniEkran ? "<b>" + kacis(kim.ad) + "</b> anlatıyor &#8595;"
                   : "<b>" + kacis(kim.ad) + ":</b> " + kacis(adim.metin)) +
      "</span>" +
      buton("rehberKapat", "Kapat", "ince rehber-kapat") +
      "</div>";
  }

  function yardimKarti() {
    var s = S();
    var r = G.rehber.durum(s);
    if (!r.acikYardim) return "";
    var y = G.rehber.yardim(r.acikYardim);
    if (!y) return "";
    var h = '<div class="kutu yardim-kart"><div class="bolum-baslik">' + kacis(y.baslik) + " &middot; NASIL OYNANIR</div>";
    for (var i = 0; i < y.satirlar.length; i++) h += "<div>&middot; " + kacis(y.satirlar[i]) + "</div>";

    // Rehberin bu ekrana ait uzun aciklamalari (Adim 16)
    var adimlar = G.rehber.adimlar();
    for (var j = 0; j < adimlar.length; j++) {
      if (adimlar[j].ekran === r.acikYardim && adimlar[j].yardim) {
        h += '<div class="yardim-rehber"><b>' + kacis(G.karakterler.al(adimlar[j].kim).ad) + ":</b> " +
          kacis(adimlar[j].yardim) + "</div>";
      }
    }
    h += '<div class="btn-satir">' + buton("yardimKapat", "Anladım", "sari-btn");
    h += buton("kimKimdir", "Hikâye ve karakterler", "ince");   // Faz 4
    if (!r.acik) h += buton("rehberAc", "Rehberi yeniden aç", "ince");
    h += "</div>";
    // Bastan baslamak her ekrandan ulasilabilsin: alt seritteki dugmeyi aramak zor (2026-11-19)
    h += '<div class="yardim-sifirla">' +
      buton("sifirla", "Oyunu baştan başlat", "kirmizi-btn") +
      '<div class="kucuk">Kayıt silinir, birinci günden başlanır.</div>' +
      "</div></div>";
    return h;
  }

  // Faz B: sayisal bilgi kenarda kisa dursun
  function rakamSeridi(ogeler) {
    var h = '<div class="rakam-serit">';
    for (var i = 0; i < ogeler.length; i++) {
      var o = ogeler[i];
      if (!o) continue;
      h += '<span class="rakam-oge ' + (o.sinif || "") + '"><i>' + kacis(o.etiket) + "</i><b>" +
        kacis(o.deger) + "</b></span>";
    }
    return h + "</div>";
  }

  // Detayi isteyen tiklayip acsin
  function detayAcikMi(anahtar) {
    var s = S();
    return !!(s.detay && s.detay[anahtar]);
  }

  function detayDugmesi(anahtar, etiket) {
    return butonVeri("detay", { anahtar: anahtar },
      (etiket || "Detay") + (detayAcikMi(anahtar) ? " ▲" : " ▼"), "ince detay-btn");
  }

  function detayIcerik(anahtar, ic) {
    if (!ic || !detayAcikMi(anahtar)) return "";
    return '<div class="kutu detay-ic">' + ic + "</div>";
  }

  function detayKutusu(anahtar, ic, etiket) {
    if (!ic) return "";
    return '<div class="detay">' + detayDugmesi(anahtar, etiket) + detayIcerik(anahtar, ic) + "</div>";
  }

  function paraSinif(sayi) {
    return sayi > 0 ? "kar" : (sayi < 0 ? "zarar" : "");
  }

  // ---------- ust bar ----------

  function ustBar() {
    var s = S();
    var c = C();
    var noktalar = "";
    for (var i = 0; i < c.GUNLUK_AKSIYON; i++) {
      noktalar += '<span class="nokta ' + (i < s.aksiyon ? "dolu" : "") + '"></span>';
    }
    var itibarYuzde = Math.round((s.itibar / c.ITIBAR_MAKS) * 100);

    // Kasa degistiyse bir kerelik vurgu ve fark rozeti (Adim 12)
    var kasaSinifi = "", farkRozeti = "";
    if (sonKasa !== null && s.kasa !== sonKasa) {
      var fark = s.kasa - sonKasa;
      kasaSinifi = fark > 0 ? " kasa-artti" : " kasa-azaldi";
      farkRozeti = '<span class="kasa-fark' + kasaSinifi + '">' +
        (fark > 0 ? "+" : "−") + kacis(G.paraYaz(Math.abs(fark))) + "</span>";
    }
    sonKasa = s.kasa;
    return '' +
      '<div class="ustbar">' +
        '<div class="ustbar-sol">' +
          '<span class="gun-etiket">GÜN ' + s.gun + "/" + c.GUN_SAYISI + "</span>" +
        "</div>" +
        '<div class="ustbar-orta">' +
          '<div class="kasa' + kasaSinifi + '">' + kacis(G.paraYaz(s.kasa)) + "</div>" +
          farkRozeti +
        "</div>" +
        '<div class="ustbar-sag">' +
          (G.belge.belgeliMi(s) ? '<span class="belge-rozet" title="Yetki belgesi">BELGE</span>' : "") +
          '<div class="itibar-kutu"><span class="kucuk">itibar ' + s.itibar + "</span>" +
            '<div class="itibar-cubuk"><i style="width:' + itibarYuzde + '%"></i></div></div>' +
          '<div class="noktalar">' + noktalar + "</div>" +
          (G.ses ? butonVeri("sesDegistir", {}, G.ses.acikMi() ? "🔊" : "🔇", "ince ses-btn" + (G.ses.acikMi() ? "" : " kapali")) : "") +
          butonVeri("yardim", { ekran: s.ekran }, "?", "ince yardim-btn") +
        "</div>" +
      "</div>";
  }

  // ---------- dukkan ----------

  function stokKarti(araba) {
    var s = S();
    var kusurlar = G.ekspertiz.cikanKusurlar(araba);
    var bekleyen = 0, i;
    for (i = 0; i < s.musteriler.length; i++) {
      if (s.musteriler[i].arabaId === araba.id) bekleyen++;
    }
    var saseCikti = false;
    for (i = 0; i < araba.kusurlar.length; i++) {
      if (araba.kusurlar[i].tip === "sase" && araba.kusurlar[i].ortayaCikti) saseCikti = true;
    }

    var konsinyeMi = G.konsinye.konsinyeMi(araba);
    var govde = '' +
      kartArabaSeridi(araba) +
      (konsinyeMi ? etiketSerit("KONSİNYE") : "") +
      '<div class="kart-baslik">' + kacis(G.araba.adi(araba)) + "</div>" +
      '<div class="kucuk">' + kacis(araba.renk) + " · " + kacis(kmYaz(araba.km)) + "</div>" +
      (konsinyeMi
        ? '<div class="satir"><span>Sahibine net</span><b>' +
            kacis(G.paraYaz(araba.konsinye.sahipNet)) + "</b></div>" +
          '<div class="satir"><span>Kalan süre</span><b>' +
            G.konsinye.kalanGun(s, araba) + " gün</b></div>" +
          '<div class="satir"><span>Bu fiyata komisyon</span><b class="kar">' +
            kacis(G.paraYaz(G.konsinye.komisyon(araba, araba.ilanFiyati))) + "</b></div>"
        : '<div class="satir"><span>Alış</span><b>' + kacis(G.paraYaz(araba.alisFiyati)) + "</b></div>" +
          '<div class="satir"><span>Masraf</span><b>' + kacis(G.paraYaz(araba.masraflar)) + "</b></div>") +
      '<div class="satir"><span>Bilinen kusur</span><b>' + kusurlar.length + "</b></div>" +
      '<div class="satir"><span>İlan fiyatı</span><b>' + kacis(G.paraYaz(araba.ilanFiyati)) + "</b></div>" +
      '<div class="satir"><span>Müşteri şansı (günlük)</span><b>' +
        kacis(sansSozu(G.musteri.gelmeOlasiligi(s, araba))) + " · %" +
        Math.round(G.musteri.gelmeOlasiligi(s, araba) * 100) + "</b></div>" +
      '<div class="fiyat-duzenle">' +
        '<input type="text" inputmode="numeric" value="' + kacis(rakamYaz(araba.ilanFiyati)) +
          '" id="ilanfiyat-' + araba.id + '" aria-label="İlan fiyatı">' +
        butonVeri("ilanFiyatiKaydet", { araba: araba.id }, "Fiyatı güncelle", "ince") +
      "</div>";

    if (bekleyen > 0) {
      govde += '<div class="rozet">' + bekleyen + " müşteri bekliyor</div>";
    }
    if (saseCikti) {
      govde += '<div class="uyari">Şase uyumsuz: satılamaz.</div>' +
        butonVeri("hurda", { araba: araba.id }, "Araba pazarına ver (%" +
          Math.round(C().SASE_HURDA_ORAN * 100) + ")", "kirmizi-btn");
    }
    return '<div class="kart stok-kart">' + govde + "</div>";
  }

  function musteriSatiri(m) {
    var s = S();
    var araba = G.pazarlik.arabaBul(s, m.arabaId);
    if (!araba) return "";
    var kalan = C().MUSTERI_BEKLEME_GUN - (s.gun - m.gelisGunu);
    return '<div class="musteri-satir">' +
      "<div><b>" + kacis(m.isim) + "</b> <span class=\"kucuk\">(" + kacis(G.musteri.tipAdi(m.tip)) + ")</span><br>" +
      '<span class="kucuk">' + kacis(G.araba.adi(araba)) + " · " + kalan + " gün bekler</span></div>" +
      butonVeri("musteriyeGit", { musteri: m.id }, "Görüş (1 hak)", "sari-btn", s.aksiyon < 1) +
      "</div>";
  }

  function ekranDukkan() {
    var s = S();
    var i, h = "";

    var stokSahne = [];
    for (i = 0; i < s.stok.length; i++) {
      stokSahne.push({ model: s.stok[i].model, renk: s.stok[i].renk });
    }
    var rehberAdimi = G.rehber.suAnki(s);
    h += sahneKapak("dukkan-kapak", "dukkan", {
      aksam: s.faz === "aksam",
      isik: rehberAdimi && rehberAdimi.ekran === "dukkan" ? rehberAdimi.kim : null
    },
      tekSatirBaslik("GÜN " + s.gun + "/" + C().GUN_SAYISI, "Tezgâh",
        s.stok.length + "/" + C().KAPASITE + " araba" +
        (G.konsinye.stoktakiSayi(s) ? " (" + G.konsinye.stoktakiSayi(s) + " konsinye)" : "") +
        " · " + s.musteriler.length + " müşteri · " + s.aksiyon + " hak"),
      rehberBaloncugu("dukkan")
    );

    h += trendSeridi(s);

    h += '<div class="serit-haber">';
    for (i = 0; i < s.sabahHaberleri.length; i++) {
      h += '<div class="sirali" style="--sira:' + i + '">· ' + kacis(s.sabahHaberleri[i]) + "</div>";
    }
    h += "</div>";

    h += rakamSeridi([
      { etiket: "Tezgâh", deger: s.stok.length + "/" + C().KAPASITE },
      { etiket: "Müşteri", deger: String(s.musteriler.length) },
      { etiket: "Net varlık", deger: G.paraYaz(G.durum.netVarlik(s)), sinif: "vurgu" },
      { etiket: "Hedefe", deger: G.paraYaz(C().HEDEF_NET_VARLIK - G.durum.netVarlik(s)) },
      { etiket: "İtibar", deger: itibarSozu(s.itibar) }
    ]);
    h += '<div class="bolum-baslik">TEZGÂH</div>';
    if (s.stok.length === 0) {
      h += '<div class="bos">Tezgâh boş ortak. İlanlara bakalım.</div>';
    } else {
      h += '<div class="kart-liste">';
      for (i = 0; i < s.stok.length; i++) h += stokKarti(s.stok[i]);
      h += "</div>";
    }

    if (s.cekler.length) {
      h += '<div class="bolum-baslik">BEKLEYEN ÇEKLER</div>';
      for (var ci = 0; ci < s.cekler.length; ci++) {
        var cek = s.cekler[ci];
        h += '<div class="satir cek-satir"><span>' + kacis(cek.musteri) + " · " +
          kacis(cek.araba) + " · " + (cek.vadeGun - s.gun) + " gün" +
          (cek.aval ? " · avalli" : "") + '</span><b>' +
          kacis(G.paraYaz(cek.tutar)) + "</b></div>";
      }
    }

    h += '<div class="bolum-baslik">BEKLEYEN MÜŞTERİ</div>';
    if (s.musteriler.length === 0) {
      h += '<div class="bos">Kapıdan giren yok.</div>';
    } else {
      for (i = 0; i < s.musteriler.length; i++) h += musteriSatiri(s.musteriler[i]);
    }

    var belgeEngeli = G.belge.engel(s);
    var seferEngeli = G.sefer.engel(s);
    h += '<div class="ana-butonlar">' +
      buton("ilanlar", "İlanlara bak", "sari-btn") +
      (G.belge.belgeliMi(s) ? "" :
        buton("sinavSecim", "Yetki belgesi sınavı", "ince", !!belgeEngeli)) +
      buton("seferSecim", "Şehir dışına çık", "ince", !!seferEngeli) +
      buton("defter", "Defter", "ince") +
      buton("gunuBitir", "Günü bitir", "kirmizi-btn") +
      "</div>";
    if (seferEngeli) h += '<div class="kucuk serit-not">Şehir dışı: ' + kacis(seferEngeli) + "</div>";
    if (!G.belge.belgeliMi(s)) {
      h += '<div class="kucuk serit-not uyari-not">Yetki belgen yok: her satışta %' +
        Math.round(C().BELGESIZ_DENETIM * 100) + ' denetim riski, ceza ' +
        kacis(G.paraYaz(C().BELGESIZ_CEZA)) + "." +
        (belgeEngeli ? " (" + kacis(belgeEngeli) + ")" : "") + "</div>";
    }
    return h;
  }

  // ---------- ilanlar ----------

  // Piyasa trendi: tezgahta her gun gorunen serit (js/trend.js)
  function trendSeridi(s) {
    var t = G.trend.aktif(s);
    if (!t) return "";
    var kalan = G.trend.kalanGun(s);
    return '<div class="trend-serit">' +
      '<span class="trend-rozet">PİYASA</span>' +
      '<span class="trend-etiket">' + kacis(t.etiket) + "</span>" +
      '<span class="trend-kalan">' + kalan + " gün" + "</span>" +
      "</div>";
  }

  // Ilan sitesi bandi: oyunun kendi ilan sitesi (gercek bir markanin adi/logosu degil)
  function ilanBandi(adet, yer) {
    var t = G.trend.aktif(S());
    return '<div class="ilan-bant">' +
      '<div class="ilan-bant-ust">' +
        '<span class="ilan-logo">sanayiden<b>.com</b></span>' +
        '<span class="ilan-yol">Vasıta &rsaquo; Otomobil &rsaquo; ' + kacis(yer) + "</span>" +
        '<span class="ilan-sayi">' + adet + " ilan</span>" +
      "</div>" +
      '<div class="ilan-filtre">' +
        '<span class="ilan-arama">marka, model ara…</span>' +
        (t ? '<span class="ilan-trend">▲ ' + kacis(t.etiket) + "</span>" : "") +
        '<span class="ilan-sirala">Sıralama: en yeni ilan</span>' +
      "</div>" +
      "</div>";
  }

  function ilanYasiYaz(gun) {
    if (!gun) return "bugün";
    if (gun === 1) return "dün";
    return gun + " gün önce";
  }

  // Ilan listesi satiri (ilanlar ekrani ve sehir disi sefer ayni satiri kullanir)
  function ilanSatiri(araba) {
    var s = S();
    var iddia = [];
    if (araba.iddia.boyasiz) iddia.push("boyasız");
    if (araba.iddia.degisensiz) iddia.push("değişensiz");
    iddia.push(araba.iddia.tramer > 0 ? "tramer " + G.kisaFiyat(araba.iddia.tramer) : "tramersiz");
    // Seferdeyken gunluk aksiyon sifirdir (sefer gunu yer, js/sefer.js), hak seferin
    // kendi butcesinden dusulur. Buna bakmayinca sehirdeki ilanlarin hepsi pasif kaliyordu.
    var seferde = G.sefer.acikMi(s);
    var gezildi = seferde
      ? s.sefer.gezilen.indexOf(araba.id) !== -1
      : s.bugunGezilen.indexOf(araba.id) !== -1;
    var kalanHak = seferde ? s.sefer.kalanPazarlik : s.aksiyon;

    var etiketler = "" +
      (araba.kaynak === "kro" ? etiketSerit("KRO BULDU") : "") +
      (araba.riza ? etiketSerit("RIZA'NIN ARABASI") : "") +
      (araba.pazarliksiz ? etiketSerit("PAZARLIK YOK") : "") +
      (araba.geriDonus ? etiketSerit("GERİ DÖNDÜ") : "");

    var ozet = kmYaz(araba.km) + " · " + araba.renk + (araba.not ? " · " + araba.not : "");

    return '<div class="ilan-satir">' +
      '<div class="ilan-foto">' + kartArabaSeridi(araba) + "</div>" +
      '<div class="ilan-orta">' +
        '<div class="ilan-baslik">' + kacis(G.araba.adi(araba)) + "</div>" +
        '<div class="ilan-ozet">' + kacis(ozet) + "</div>" +
        (etiketler ? '<div class="ilan-etiketler">' + etiketler + "</div>" : "") +
        '<div class="iddia">&ldquo;' + kacis(iddia.join(", ")) + ' abi&rdquo;</div>' +
        (G.karakterler.tuhaflikSezildiMi(araba)
          ? '<div class="uyari">Drej: ' + kacis(G.data.replikler.drej.tuhaflik[0]) + "</div>" : "") +
      "</div>" +
      '<div class="ilan-sag">' +
        '<div class="ilan-fiyat">' + kacis(G.paraYaz(araba.istenenFiyat)) + "</div>" +
        '<div class="ilan-yer">' + kacis(araba.sehir || "Sanayi Sitesi") + "</div>" +
        '<div class="ilan-tarih">' + kacis(ilanYasiYaz(araba.ilanYasi)) + "</div>" +
        butonVeri("ilanaGit", { araba: araba.id }, gezildi ? "İlana dön (bedava)" : "İlana git (1 hak)",
          "sari-btn", !gezildi && kalanHak < 1) +
      "</div>" +
      "</div>";
  }

  function ekranIlanlar() {
    var s = S();
    var h = sahneKapak("ilanlar-kapak", "ilanlar", { adet: s.ilanlar.length },
      tekSatirBaslik("GÜN " + s.gun, "İlanlar", s.ilanlar.length + " ilan · " + s.aksiyon + " hak"),
      rehberBaloncugu("ilanlar")
    );
    h += ilanBandi(s.ilanlar.length, "Sanayi Sitesi");
    if (s.ilanlar.length === 0) {
      h += '<div class="bos">Bugün ilan yok.</div>';
    } else {
      h += '<div class="ilan-liste">';
      for (var i = 0; i < s.ilanlar.length; i++) h += ilanSatiri(s.ilanlar[i]);
      h += "</div>";
    }
    h += '<div class="ana-butonlar">' + buton("dukkan", "Dükkâna dön", "ince") + "</div>";
    return h;
  }

  // ---------- yetki belgesi sinavi (Adim 22) ----------

  function ekranSinav() {
    var s = S();
    var sinav = s.sinav;
    if (!sinav) return ekranDukkan();
    var kim = G.karakterler.al(sinav.kim);

    if (sinav.bitti) {
      var h2 = sahneKapak("sinav-kapak", "sinav", { isik: sinav.kim },
        tekSatirBaslik("SINAV", sinav.gecti ? "Geçtik" : "Kaldık",
          sinav.puan + " puan · baraj " + C().SINAV_BARAJ),
        baloncuk("orta", sinav.kim, kim.ad,
          sinav.gecti ? "Belge cebimde ortak." : "Bu sefer olmadı, gireriz yine.")
      );
      h2 += '<div class="kutu sonuc">' +
        kirmiziBant(sinav.gecti ? "YETKİ BELGESİ ALINDI" : "BARAJ TUTMADI") +
        '<div class="buyuk-sayi">' + sinav.puan + "</div>" +
        '<div class="satir"><span>Doğru</span><b>' + sinav.dogru + "/" +
          sinav.sorular.length + "</b></div>" +
        (sinav.gecti
          ? '<div class="satir"><span>İtibar</span><b class="kar">+' + C().BELGE_ITIBAR + "</b></div>"
          : '<div class="uyari">' + C().SINAV_BEKLEME + " gün sonra tekrar girebilirsin.</div>") +
        "</div>" +
        '<div class="ana-butonlar">' + buton("sinavKapat", "Dükkâna dön", "sari-btn") + "</div>";
      return h2;
    }

    var soru = G.belge.suAnkiSoru(s);
    if (!soru) return ekranDukkan();

    var h = sahneKapak("sinav-kapak", "sinav", { isik: sinav.kim },
      tekSatirBaslik("SINAV", kim.ad + " giriyor",
        (sinav.sira + 1) + "/" + sinav.sorular.length + " soru"),
      baloncuk("orta", sinav.kim, kim.ad,
        sinav.kim === "drej" ? "Bir şıkkı eledim ortak." : "Ağızla olmuyor bu iş.")
    );

    h += '<div class="kutu sinav-kutu">' +
      '<div class="bolum-baslik">SORU ' + (sinav.sira + 1) + "</div>" +
      '<p class="kart-metin">' + kacis(soru.tanim.soru) + "</p>" +
      '<div class="btn-satir dikey">';
    for (var i = 0; i < soru.tanim.siklar.length; i++) {
      if (i === soru.elenen) continue;                  // Drej eledi
      h += butonVeri("sinavCevap", { sik: i }, soru.tanim.siklar[i], "ince");
    }
    h += "</div>";
    if (soru.elenen >= 0) {
      h += '<div class="kucuk">Drej bir şıkkı eledi.</div>';
    }
    h += "</div>";
    return h;
  }

  function ekranSinavSecim() {
    var s = S();
    var h = sahneKapak("sinav-kapak", "sinav", { isik: "sukru", konusan: "sukru" },
      tekSatirBaslik("GÜN " + s.gun, "Yetki belgesi",
        C().SINAV_SORU + " soru · baraj " + C().SINAV_BARAJ),
      baloncuk("sol", "sukru", "Şükrü abi", "Belgesiz iş yapan bir gün yanar evladım.")
    );
    h += '<div class="kutu">' +
      '<div class="bolum-baslik">SINAVA KİM GİRSİN?</div>' +
      '<div class="satir"><span>Harç</span><b>' + kacis(G.paraYaz(C().SINAV_BEDEL)) + "</b></div>" +
      '<div class="satir"><span>Soru</span><b>' + C().SINAV_SORU + " soru · baraj " +
        C().SINAV_BARAJ + "</b></div>" +
      '<div class="satir"><span>Kalırsan</span><b>' + C().SINAV_BEKLEME + " gün sonra tekrar</b></div>" +
      '<div class="btn-satir">' +
        butonVeri("sinavBaslat", { kim: "drej" }, "Drej girsin", "mavi-btn") +
        butonVeri("sinavBaslat", { kim: "nuri" }, "Nuri girsin", "sari-btn",
          G.karakterler.nuriYokMu(s)) +
      "</div>" +
      '<div class="kucuk">Drej her soruda bir yanlış şıkkı eler. Nuri elemez; ' +
      'ağzıyla götürmeye çalışır.</div>' +
      "</div>";
    h += '<div class="ana-butonlar">' + buton("dukkan", "Vazgeç", "ince") + "</div>";
    return h;
  }

  // ---------- sehir disi sefer (Adim 18) ----------

  function sehirKarti(sehir) {
    var s = S();
    return '<div class="kart sehir-kart">' +
      '<div class="kart-baslik">' + kacis(sehir.ad) + "</div>" +
      '<div class="kucuk">' + sehir.mesafe + " km · yol " + kacis(G.paraYaz(sehir.yolMasrafi)) + "</div>" +
      '<div class="iddia">&ldquo;' + kacis(sehir.ipucu) + '&rdquo;</div>' +
      '<div class="satir"><span>Beklenen indirim</span><b>%' +
        Math.round(sehir.indirim[0] * 100) + "-" + Math.round(sehir.indirim[1] * 100) + "</b></div>" +
      '<div class="satir"><span>İlan</span><b>' + sehir.ilanSayisi + "</b></div>" +
      '<div class="satir"><span>Mola</span><b>' + kacis(sehir.yemek.ad) + "</b></div>" +
      butonVeri("seferBaslat", { sehir: sehir.id }, "Yola çık", "sari-btn",
        s.kasa < sehir.yolMasrafi) +
      "</div>";
  }

  function ekranSeferSecim() {
    var s = S();
    var sehirler = G.sefer.secenekler(s);
    var h = sahneKapak("sefer-kapak", "yol", { isik: "kro" },
      tekSatirBaslik("GÜN " + s.gun, "Şehir dışı", "bir gün sürer"),
      baloncuk("sol", "kro", "Kro", "Dayı şehir dışında ucuz araba var.")
    );
    h += '<div class="bolum-baslik">NEREYE GİDİYORUZ?</div>';
    h += '<div class="kart-liste">';
    for (var i = 0; i < sehirler.length; i++) h += sehirKarti(sehirler[i]);
    h += "</div>";
    h += '<div class="uyari">Sefer günün tamamını alır: bugün dükkânda satış yok, ' +
      'şehirde en fazla ' + C().SEFER_PAZARLIK + ' ilana gidilir.</div>';
    h += '<div class="ana-butonlar">' + buton("dukkan", "Vazgeç, dükkânda kalalım", "ince") + "</div>";
    return h;
  }

  function ekranSefer() {
    var s = S();
    var sefer = s.sefer;
    if (!sefer) return ekranDukkan();
    var sehir = G.sefer.sehirBul(sefer.sehirId);

    var h = sahneKapak("sefer-kapak", "sanayi-avlu", { isik: "nuri" },
      tekSatirBaslik(G.buyukHarf(sefer.sehirAdi), "Sefer",
        sefer.kalanPazarlik + " pazarlık hakkı"),
      baloncuk("sol", "nuri", "Nuri",
        sefer.yemekYapildi ? "Karnımız tok, şimdi iş konuşalım." : "Geldik ortak. Bakalım ne varmış.")
    );

    h += rakamSeridi([
      { etiket: "Şehir", deger: sefer.sehirAdi },
      { etiket: "Yol", deger: G.paraYaz(sefer.yolMasrafi) },
      { etiket: "Pazarlık hakkı", deger: String(sefer.kalanPazarlik), sinif: "vurgu" },
      { etiket: "Alınan", deger: String(sefer.alinan) },
      { etiket: "Kasa", deger: G.paraYaz(s.kasa) }
    ]);

    h += ilanBandi(sefer.ilanlar.length, sefer.sehirAdi);
    if (sefer.ilanlar.length === 0) {
      h += '<div class="bos">Burada iş kalmadı ortak, dönelim.</div>';
    } else {
      h += '<div class="ilan-liste">';
      for (var i = 0; i < sefer.ilanlar.length; i++) h += ilanSatiri(sefer.ilanlar[i]);
      h += "</div>";
    }

    h += '<div class="ana-butonlar">' +
      (sefer.yemekYapildi
        ? ""
        : butonVeri("seferYemek", {}, "Mola: " + sehir.yemek.ad + " (" +
            G.paraYaz(sehir.yemek.bedel) + ")", "sari-btn", s.kasa < sehir.yemek.bedel)) +
      buton("seferDon", "Dönüyoruz", "kirmizi-btn") +
      "</div>";
    return h;
  }

  function ekranYemek() {
    var s = S();
    if (!G.diyalog.acikMi(s)) {
      s.ekran = "sefer";
      return ekranSefer();
    }
    var satir = G.diyalog.suAnki(s);
    var sahne = G.diyalog.sahne(s);
    var sehir = s.sefer ? G.sefer.sehirBul(s.sefer.sehirId) : null;
    return sahneKapak("olay-kapak yemek-kapak", sahne, {},
      etiketSerit("MOLA") +
      "<h2>" + kacis(sehir ? sehir.yemek.ad : "Mola") + "</h2>",
      baloncuk(konumBul(sahne, satir.kim), satir.kim,
        G.sahne.karakterBilgi(satir.kim).ad, satir.metin) + diyalogKatmani(s)
    );
  }

  // ---------- araba detayi ----------

  function kusurSatiri(k) {
    var etiket = G.kusurAdi(k.tip) + (k.parca ? " — " + k.parca : "") +
      (k.tutar ? " (" + G.paraYaz(k.tutar) + ")" : "");
    return '<div class="satir kusur"><span>' + kacis(etiket) + "</span><b class=\"zarar\">-" +
      kacis(G.paraYaz(k.etki)) + "</b></div>";
  }

  function ekranAraba() {
    var s = S();
    var araba = G.pazarlik.arabaBul(s, s.acikArabaId);
    if (!araba) return ekranDukkan();

    var cikanlar = G.ekspertiz.cikanKusurlar(araba);
    var h = "";

    h += sahneKapak("", araba.ekspertizSeviyesi ? "ekspertiz" : "araba", {
      model: araba.model, renk: araba.renk, saticiTipi: araba.saticiTipi,
      kusurSayisi: cikanlar.length, araba: sahneArabasi(araba)
    },
      tekSatirBaslik(araba.riza ? "RIZA" : (araba.kaynak === "kro" ? "KRO BULDU" : "İLAN"),
        G.araba.adi(araba), araba.renk + " · " + kmYaz(araba.km)),
      rehberBaloncugu("araba")
    );

    var kusurDokum = "";
    for (var i = 0; i < cikanlar.length; i++) kusurDokum += kusurSatiri(cikanlar[i]);
    if (cikanlar.length) {
      kusurDokum += '<div class="satir toplam"><span>Toplam</span><b class="zarar">-' +
        kacis(G.paraYaz(G.araba.kusurToplami(cikanlar))) + "</b></div>";
    }
    kusurDokum += '<div class="satir bilinmeyen"><span>Başka bir şey var mı, bilmiyoruz.</span><b>?</b></div>';

    h += rakamSeridi([
      { etiket: "İsteniyor", deger: G.paraYaz(araba.istenenFiyat), sinif: "vurgu" },
      { etiket: "Km", deger: kmYaz(araba.km) },
      { etiket: "Bilinen kusur", deger: cikanlar.length ? cikanlar.length + " adet" : "yok",
        sinif: cikanlar.length ? "zarar" : "" },
      { etiket: "Değer kaybı", deger: cikanlar.length ? "-" + G.paraYaz(G.araba.kusurToplami(cikanlar)) : "—",
        sinif: cikanlar.length ? "zarar" : "" }
    ]);
    h += detayKutusu("araba", kusurDokum, "Kusur dökümü");
    if (G.ekspertizSema) h += G.ekspertizSema.ciz(araba);

    h += '<div class="kutu"><div class="bolum-baslik">EKSPERTİZ</div>';
    if (araba.ekspertizSeviyesi) {
      h += '<div class="kucuk">Yapılan: ' + kacis(C().EKSPERTIZ[araba.ekspertizSeviyesi].ad) + "</div>";
    }
    h += '<div class="btn-satir">' +
      butonVeri("ekspertiz", { araba: araba.id, seviye: "normal" },
        "Normal · " + G.paraYaz(s.bayraklar.bedavaEkspertiz ? 0 : C().EKSPERTIZ.normal.bedel), "",
        araba.ekspertizSeviyesi === "normal" || araba.ekspertizSeviyesi === "premium") +
      butonVeri("ekspertiz", { araba: araba.id, seviye: "premium" },
        "Premium · " + G.paraYaz(C().EKSPERTIZ.premium.bedel), "",
        araba.ekspertizSeviyesi === "premium");
    if (G.ekspertiz.tanidikTeklifVarMi(araba)) {
      h += butonVeri("ekspertiz", { araba: araba.id, seviye: "tanidik" }, "Satıcının tanıdığı · bedava", "ince");
    }
    h += "</div>";
    if (G.ekspertiz.tanidikTeklifVarMi(araba)) {
      h += '<div class="kucuk">Satıcı kendi ekspertizini öneriyor.</div>';
    }
    h += "</div>";

    // Adim 19: konsinye teklifi
    if (G.konsinye.teklifVarMi(araba)) {
      var net = G.konsinye.netHesapla(araba);
      var tahminiIlan = G.yuvarla(net * C().ILAN_FIYAT_ONERI);
      h += '<div class="kutu konsinye-kutu">' +
        '<div class="bolum-baslik">KONSİNYE TEKLİFİ</div>' +
        balon("satici", "Satmam abi ama sen sat. Bana net " + G.paraYaz(net) + ".", "Satıcı") +
        '<div class="satir"><span>Sahibine net</span><b>' + kacis(G.paraYaz(net)) + "</b></div>" +
        '<div class="satir"><span>Önerilen ilan fiyatı</span><b>' + kacis(G.paraYaz(tahminiIlan)) + "</b></div>" +
        '<div class="satir"><span>Tahmini komisyon</span><b class="kar">' +
          kacis(G.paraYaz(tahminiIlan - net)) + "</b></div>" +
        '<div class="satir"><span>Süre</span><b>' + C().KONSINYE_SURE + " gün</b></div>" +
        '<div class="kucuk">Kasadan para çıkmaz, noter sahibinde. Araba senin değil: ' +
        'süre dolunca geri alır, hurdaya veremezsin.</div>';

      var kozlar = G.ekspertiz.cikanKusurlar(araba);
      if (kozlar.length) {
        h += '<div class="btn-satir">';
        var oynanan = araba.konsinyeKozlari || [];
        var gorulenTip = {};
        for (var kz = 0; kz < kozlar.length; kz++) {
          var tip = kozlar[kz].tip;
          if (gorulenTip[tip]) continue;
          gorulenTip[tip] = 1;
          h += butonVeri("konsinyeKoz", { araba: araba.id, tip: tip },
            "Göster: " + G.kusurAdi(tip), "ince", oynanan.indexOf(tip) !== -1);
        }
        h += "</div>";
      }

      h += '<div class="btn-satir">' +
        butonVeri("konsinyeAl", { araba: araba.id }, "Konsinye al", "sari-btn",
          s.stok.length >= C().KAPASITE) +
        "</div></div>";
    }

    if (araba.pazarliksiz) {
      h += '<div class="kutu"><div class="bolum-baslik">AL YA DA BIRAK</div>' +
        '<div class="kucuk">Bu ilanda pazarlık yok, fiyat sabit: ' +
        kacis(G.paraYaz(araba.istenenFiyat)) + " + noter " + kacis(G.paraYaz(C().NOTER_PLAKA)) + ".</div>" +
        '<div class="btn-satir">' +
        butonVeri("dogrudanAl", { araba: araba.id }, "Al, bitsin", "sari-btn") +
        "</div></div>";
      h += '<div class="ana-butonlar">' + buton("ilanlar", "İlanlara dön", "ince") + "</div>";
      return h;
    }

    var pers = personaBilgi(araba);
    if (pers) {
      h += '<div class="kutu"><div class="bolum-baslik">SATICI</div>' +
        '<div class="kart-metin">' + kacis(G.buyukHarf(pers.ad)) + "</div>" +
        '<div class="kucuk">' + kacis(pers.tanim) + "</div></div>";
    }

    h += '<div class="kutu"><div class="bolum-baslik">KİM KONUŞACAK?</div>';
    var konusanlar = G.karakterler.alistaKonusanlar(s);
    h += '<div class="btn-satir">';
    for (var ki = 0; ki < konusanlar.length; ki++) {
      var kk = konusanlar[ki];
      h += butonVeri("pazarlikBaslat", { araba: araba.id, konusan: kk.anahtar },
        kk.ad + " konuşsun", kk.renkSinifi + "-btn");
    }
    h += "</div>";
    h += '<div class="kucuk">Nuri: satıcının sabrı +1, yeteneği "Ağız" (taban -%' +
      Math.round(C().AGIZ_TABAN_INDIRIM * 100) + ', %' + Math.round(C().NURI_SINIR_OLASILIK * 100) +
      ' ihtimalle sinirlenir ve masa dağılır).<br>Drej: kusur toplamını TL görür, sabır -1, yeteneği "Hesap" (tabanı ±%' +
      Math.round(C().HESAP_ARALIK * 100) + ' aralıkla söyler).</div>';
    if (G.karakterler.nuriYokMu(s)) {
      h += '<div class="uyari">Nuri bugün ablasının yanında, pazarlığa giremez.</div>';
    }
    if (G.karakterler.uyariVarMi("drej", araba)) {
      h += balon("drej", G.rng.sec(G.data.replikler.drej.uyari), "Drej");
    }
    if (G.karakterler.tuhaflikSezildiMi(araba)) {
      h += balon("drej", G.data.replikler.drej.tuhaflik[0], "Drej");
    }
    h += "</div>";

    h += '<div class="ana-butonlar">' + buton("ilanlar", "İlanlara dön", "ince") + "</div>";
    return h;
  }

  // ---------- olay karti (Adim 8) ----------

  function ekranHikaye() {
    var s = S();
    if (!G.diyalog.acikMi(s)) {
      s.ekran = "olay";
      return ekranOlay();
    }
    var satir = G.diyalog.suAnki(s);
    var sahne = G.diyalog.sahne(s);
    var baslik = s.aktifHikaye ? s.aktifHikaye.baslik : "HİKÂYE";
    return sahneKapak("olay-kapak hikaye-kapak", sahne, {},
      etiketSerit("HİKÂYE") + "<h2>" + kacis(baslik) + "</h2>",
      baloncuk(konumBul(sahne, satir.kim), satir.kim,
        G.sahne.karakterBilgi(satir.kim).ad, satir.metin) + diyalogKatmani(s)
    );
  }

  function ekranOlay() {
    var s = S();
    var ak = s.aktifKart;
    if (!ak) return ekranDukkan();
    var kart = G.olaylar.aktifKartTanimi(s);
    if (!kart) return ekranDukkan();

    var diyalogda = G.diyalog.acikMi(s) && s.diyalog.kaynak === "kart";
    var sahne = diyalogda ? G.diyalog.sahne(s) : G.sahne.kartSahnesi(kart.kategori);
    var ustKatman;

    if (diyalogda) {
      var satir = G.diyalog.suAnki(s);
      ustKatman = baloncuk(konumBul(sahne, satir.kim), satir.kim,
        G.sahne.karakterBilgi(satir.kim).ad, satir.metin) + diyalogKatmani(s);
    } else {
      var rAdim = G.rehber.suAnki(s);
      var rKonum = "sol";
      if (rAdim && rAdim.ekran === "olay") {
        var rVar = false;
        for (var rk = 0; rk < (sahne.kisiler || []).length; rk++) {
          if (sahne.kisiler[rk].kim === rAdim.kim) { rKonum = sahne.kisiler[rk].konum; rVar = true; break; }
        }
        if (!rVar) {
          var rDolu = (sahne.kisiler || []).map(function (x) { return x.konum; });
          rKonum = rDolu.indexOf("sol") === -1 ? "sol" : (rDolu.indexOf("orta") === -1 ? "orta" : "sag");
        }
      }
      ustKatman = rehberBaloncugu("olay", rKonum);
    }

    var h = sahneKapak("olay-kapak", sahne, {},
      etiketSerit(kart.kategori) +
      "<h2>" + kacis(kart.baslik) + "</h2>" +
      (!diyalogda && kart.secenekler.length > 1 ? kirmiziBant("NE YAPALIM?") : ""),
      ustKatman
    );

    if (diyalogda) return h;

    h += '<div class="kutu">';
    if (s.sizceSecimi && s.sizceSecimi.kartId === kart.id && s.sizceSecimi.hatirlatma) {
      h += '<div class="hatirlatma">' + kacis(s.sizceSecimi.hatirlatma) + "</div>";
    }
    if (ak.ekMetin) h += '<div class="uyari">' + kacis(ak.ekMetin) + "</div>";
    if (!kart.replikler || !kart.replikler.length) {
      h += '<p class="kart-metin">' + kacis(kart.metin) + "</p>";
    }

    h += '<div class="btn-satir">';
    for (var i = 0; i < kart.secenekler.length; i++) {
      h += butonVeri("olaySecim", { sira: i }, kart.secenekler[i].etiket,
        i === 0 ? "sari-btn" : "ince");
    }
    h += "</div></div>";
    return h;
  }

  // ---------- pazarlik ----------

  function gecmisListesi(p) {
    var h = '<div class="gecmis">';
    for (var i = 0; i < p.gecmis.length; i++) {
      var g = p.gecmis[i];
      var kim = g.kim === "sen" ? "Sen" : (g.kim === "satici" ? "Satıcı" : "Müşteri");
      h += '<div class="gecmis-satir ' + g.kim + '"><span>' + kim + "</span><b>" +
        kacis(G.paraYaz(g.fiyat)) + "</b></div>";
    }
    h += "</div>";
    return h;
  }

  // Rakam kutuda noktali gorunur: 1.150.000
  function rakamYaz(sayi) {
    return G.paraYaz(sayi).replace(" TL", "");
  }

  function teklifKutusu(p, isAdi) {
    var adim = C().TEKLIF_ADIMI, buyuk = C().TEKLIF_BUYUK_ADIM;
    return '<div class="teklif-kutu">' +
      '<div class="teklif-satir">' +
        butonVeri("teklifDegis", { miktar: -buyuk }, "-" + (buyuk / 1000) + "b", "ince") +
        butonVeri("teklifDegis", { miktar: -adim }, "-" + (adim / 1000) + "b", "ince") +
        '<input type="text" inputmode="numeric" id="teklif" value="' + rakamYaz(p.teklif) +
          '" aria-label="Teklif"><span class="teklif-birim">TL</span>' +
        butonVeri("teklifDegis", { miktar: adim }, "+" + (adim / 1000) + "b", "ince") +
        butonVeri("teklifDegis", { miktar: buyuk }, "+" + (buyuk / 1000) + "b", "ince") +
      "</div>" +
      buton(isAdi, isAdi === "teklifVer" ? "Teklifi ver" : "Fiyatı söyle", "sari-btn genis") +
      "</div>";
  }

  function kozButonlari(p, araba) {
    var cikanlar = G.ekspertiz.cikanKusurlar(araba);
    var tipler = [];
    for (var i = 0; i < cikanlar.length; i++) {
      if (tipler.indexOf(cikanlar[i].tip) === -1) tipler.push(cikanlar[i].tip);
    }
    if (tipler.length === 0) return "";
    var h = '<div class="bolum-baslik">KOZLAR</div><div class="btn-satir">';
    for (var j = 0; j < tipler.length; j++) {
      var tip = tipler[j];
      var kullanildi = p.kullanilanKozlar.indexOf(tip) !== -1;
      h += butonVeri("koz", { tip: tip }, G.kusurAdi(tip) + (kullanildi ? " ✓" : ""), "koz-btn", kullanildi);
    }
    h += "</div>";
    return h;
  }

  // Adim 7: karakterin aktif yetenegi
  function yetenekButonu(p) {
    var karakter = G.karakterler.al(p.konusan);
    if (!karakter.yetenek) return "";
    return buton("yetenek", karakter.ad + ": " + karakter.yetenek.ad + (p.yetenekKullanildi ? " ✓" : ""),
      karakter.renkSinifi + "-btn", p.yetenekKullanildi);
  }

  function hesapSatiri(p) {
    if (!p.hesapAraligi) return "";
    return '<div class="mesaj">Drej hesapladı &mdash; ' +
      (p.tur === "alis" ? "satıcının tabanı" : "müşterinin tavanı") + ": " +
      kacis(G.paraYaz(p.hesapAraligi.alt)) + " &ndash; " + kacis(G.paraYaz(p.hesapAraligi.ust)) + "</div>";
  }

  // Faz 3: satici tiplemesi oyuncuya gorunur olmali, yoksa pazarligi etkiledigi hissedilmez
  function personaBilgi(araba) {
    if (!araba || !araba.persona) return null;
    return C().PERSONALAR[araba.persona] || null;
  }

  function personaSerit(araba) {
    var p = personaBilgi(araba);
    return p ? { etiket: "Tipleme", deger: p.ad } : { etiket: "Tipleme", deger: "—" };
  }

  function ekranPazarlik() {
    var s = S();
    var p = s.aktifPazarlik;
    if (!p) return ekranDukkan();
    var araba = G.pazarlik.arabaBul(s, p.arabaId);
    var karakter = G.karakterler.al(p.konusan);
    var h = "";

    var ruh = p.sabir <= 1 ? "kizgin" : (p.sabir === 2 ? "gergin" : "sakin");
    h += sahneKapak("kucuk-kapak", p.sonuc === "kabul" ? "noter" : "pazarlik", {
      saticiTipi: araba ? araba.saticiTipi : "durust",
      ruh: ruh,
      araba: sahneArabasi(araba),
      konusan: p.konusan,
      isik: p.ortakReplik ? p.ortakReplik.kim : "satici"
    },
      tekSatirBaslik(p.sonuc === "kabul" ? "NOTER" : "PAZARLIK", p.arabaAdi,
        "konuşan " + karakter.ad),
      baloncuk("sag", "satici", "Satıcı",
        p.replik ? p.replik.metin : "",
        "gec" + (ruh === "kizgin" ? " kizgin" : "")) +
      (p.ortakReplik
        ? baloncuk("sol", p.ortakReplik.kim,
            G.karakterler.al(p.ortakReplik.kim).ad, p.ortakReplik.metin)
        : rehberBaloncugu("pazarlik"))
    );

    var cikanlar = araba ? G.ekspertiz.cikanKusurlar(araba) : [];
    h += rakamSeridi([
      { etiket: "İlanda", deger: G.paraYaz(p.istenenFiyat) },
      { etiket: "Satıcının rakamı", deger: G.paraYaz(p.karsi), sinif: "vurgu" },
      { etiket: "Satıcı", deger: G.pazarlik.ruhHali(p.sabir), sinif: ruh },
      personaSerit(araba),
      karakter.kusurToplamiGorur && cikanlar.length
        ? { etiket: "Kusur (Drej)", deger: "-" + G.paraYaz(G.araba.kusurToplami(cikanlar)), sinif: "zarar" }
        : { etiket: "Bilinen kusur", deger: cikanlar.length ? cikanlar.length + " adet" : "yok" }
    ]);
    if (p.mesaj) h += '<div class="mesaj kisa">' + kacis(p.mesaj) + "</div>";

    if (p.bitti) {
      h += '<div class="kutu sonuc">';
      if (p.sonuc === "kabul") {
        h += kirmiziBant("ANLAŞTIK") +
          '<div class="buyuk-sayi">' + kacis(G.paraYaz(p.anlasmaFiyati)) + "</div>" +
          '<div class="kucuk">Noter + plaka ' + kacis(G.paraYaz(C().NOTER_PLAKA)) + " ayrıca düştü.</div>";
        if (p.fazlaVerdik) h += '<div class="uyari">' + kacis(G.data.replikler.gunNotu.fazlaVerdik) + "</div>";
      } else if (p.sonuc === "kalkis") {
        h += kirmiziBant("SATICI KALKTI") + '<div class="kucuk">İlan bugün kapandı.</div>';
      } else {
        h += kirmiziBant("PAZARLIK BİTTİ");
      }
      h += "</div>" + '<div class="ana-butonlar">' + buton("dukkan", "Dükkâna dön", "sari-btn") + "</div>";
      return h;
    }

    if (p.ortaTeklif) {
      h += '<div class="kutu orta-teklif">' +
        kirmiziBant("ORTASI: " + G.paraYaz(p.ortaTeklif)) +
        '<div class="btn-satir">' +
          buton("ortasiKabul", "El sıkış", "sari-btn") +
          buton("ortasiRed", "Olmaz", "ince") +
        "</div></div>";
    } else {
      h += '<div class="eylem-serit">';
      h += '<div class="kutu">' + (araba ? kozButonlari(p, araba) : "") +
        teklifKutusu(p, "teklifVer") + "</div>";
      h += '<div class="ana-butonlar ince-satir">' +
        yetenekButonu(p) +
        detayDugmesi("pazarlik", "Teklif geçmişi") +
        buton("kalk", "Kalkıyoruz", "kirmizi-btn", p.kalkKullanildi) +
        buton("vazgec", "Vazgeç", "ince") +
        "</div>";
      h += "</div>";
    }
    h += detayIcerik("pazarlik", hesapSatiri(p) + gecmisListesi(p));
    return h;
  }

  // ---------- satis ----------

  function ekranDurustluk() {
    var s = S();
    var m = G.pazarlik.musteriBul(s, s.acikMusteriId);
    if (!m) return ekranDukkan();
    var araba = G.pazarlik.arabaBul(s, m.arabaId);
    var cikanlar = G.ekspertiz.cikanKusurlar(araba);
    var h = "";

    h += sahneKapak("kucuk-kapak", "musteri", {
      musteriTipi: m.tip, konusan: s.satisKonusan || "nuri", isik: "musteri",
      araba: sahneArabasi(araba)
    },
      tekSatirBaslik("MÜŞTERİ", m.isim,
        G.musteri.tipAdi(m.tip) + " · " + G.araba.adi(araba) + " · " + G.paraYaz(araba.ilanFiyati)),
      baloncuk("sol", "musteri", m.isim, "Şu arabaya bakmaya geldim abi.") +
      rehberBaloncugu("durustluk")
    );

    // Adim 7: once kim gidecek, sonra durustluk secimi
    h += '<div class="kutu"><div class="bolum-baslik">KİM GÖRÜŞECEK?</div><div class="btn-satir">';
    var gidenler = G.karakterler.satistaKonusanlar(s);
    for (var gi = 0; gi < gidenler.length; gi++) {
      var gk = gidenler[gi];
      h += butonVeri("satisKonusan", { konusan: gk.anahtar },
        gk.ad + (s.satisKonusan === gk.anahtar ? " ✓" : ""),
        gk.renkSinifi + "-btn" + (s.satisKonusan === gk.anahtar ? "" : " soluk"));
    }
    h += "</div>";
    var secili = G.karakterler.al(s.satisKonusan || "nuri");
    h += '<div class="kucuk">' + kacis(secili.ad) + ": " +
      (secili.anahtar === "nuri" ? "müşterinin sabrı +1, yeteneği Ağız (tavan +%" +
          Math.round(C().AGIZ_TAVAN_ARTIS * 100) + ")."
       : secili.anahtar === "drej" ? "sabır -1 ama kusur toplamını görür, yeteneği Hesap (müşterinin tavanını ±%" +
          Math.round(C().HESAP_ARALIK * 100) + " söyler)."
       : "müşterinin sabrı +1, ama kusurları dürüstçe söyler; saklama seçeneği kapanır.") + "</div>";
    if (G.karakterler.nuriYokMu(s)) {
      h += '<div class="uyari">Nuri bugün ablasının yanında.</div>';
    }
    h += "</div>";

    h += '<div class="kutu">';
    h += kirmiziBant("KUSURLARI SÖYLEYECEK MİSİN?");
    if (cikanlar.length === 0) {
      h += '<div class="kucuk">Bildiğimiz bir kusur yok. Söylenecek bir şey de yok.</div>';
    } else {
      for (var i = 0; i < cikanlar.length; i++) h += kusurSatiri(cikanlar[i]);
    }
    if (secili.durustlukZorunlu) {
      h += balon("kro", G.rng.sec(G.data.replikler.kro.durustluk), "Kro");
      h += '<div class="btn-satir">' +
        butonVeri("satisBaslat", { durustluk: "soyle", konusan: secili.anahtar },
          "Kro ile görüş (söyler)", "yesil-btn") + "</div>";
      h += '<div class="kucuk">Kro kusurları saklamaz; onun yanında saklama seçeneği yok.</div>';
    } else {
      h += '<div class="btn-satir">' +
        butonVeri("satisBaslat", { durustluk: "soyle", konusan: secili.anahtar }, "Söyle", "yesil-btn") +
        butonVeri("satisBaslat", { durustluk: "sakla", konusan: secili.anahtar }, "Sakla", "kirmizi-btn") +
        "</div>";
      h += '<div class="kucuk">Söylersen bütçe düşer ama itibar +' + C().DURUST_ITIBAR +
        '. Saklarsan ekspertizde çıkabilir (itibar ' + C().YAKALANMA_ITIBAR +
        ') ya da sonra şikâyet gelir (itibar ' + C().SIKAYET_ITIBAR + ').</div>';
    }
    h += "</div>";
    h += '<div class="ana-butonlar">' + buton("dukkan", "Vazgeç", "ince") + "</div>";
    return h;
  }

  // Adim 20: musterinin getirdigi araba ve ona bicilen deger
  function takasKutusu(s, p, m) {
    if (!m || !G.takas.teklifVarMi(m)) return "";
    var araba = m.takasArabasi;
    var cikanlar = G.ekspertiz.cikanKusurlar(araba);
    var onerilen = G.yuvarla(G.araba.bilinenDeger(araba) * 0.92, C().TEKLIF_ADIMI);

    var dokum = "";
    for (var i = 0; i < cikanlar.length; i++) dokum += kusurSatiri(cikanlar[i]);
    if (cikanlar.length) {
      dokum += '<div class="satir toplam"><span>Toplam</span><b class="zarar">-' +
        kacis(G.paraYaz(G.araba.kusurToplami(cikanlar))) + "</b></div>";
    } else {
      dokum += '<div class="satir"><span>Gözle bakınca bir şey görünmüyor.</span><b>?</b></div>';
    }

    return '<div class="kutu takas-kutu">' +
      '<div class="bolum-baslik">TAKAS TEKLİFİ</div>' +
      balon("musteri", "Benim arabayı da al abi, farkı veririm.", kacis(m.isim)) +
      '<div class="satir"><span>Getirdiği araba</span><b>' +
        kacis(G.araba.adi(araba)) + "</b></div>" +
      '<div class="satir"><span>Kilometre</span><b>' + kacis(kmYaz(araba.km)) + "</b></div>" +
      '<div class="satir"><span>Bilinen kusur</span><b class="' +
        (cikanlar.length ? "zarar" : "") + '">' +
        (cikanlar.length ? cikanlar.length + " adet" : "yok") + "</b></div>" +
      detayKutusu("takas", dokum, "Takas arabasının dökümü") +
      '<div class="kucuk">Ekspertiz bu arabaya da yapılabilir; görüşmenin içinde, ek hak istemez.</div>' +
      '<div class="btn-satir">' +
        butonVeri("ekspertiz", { araba: araba.id, seviye: "normal" },
          "Normal · " + G.paraYaz(C().EKSPERTIZ.normal.bedel), "ince",
          araba.ekspertizSeviyesi === "normal" || araba.ekspertizSeviyesi === "premium") +
        butonVeri("ekspertiz", { araba: araba.id, seviye: "premium" },
          "Premium · " + G.paraYaz(C().EKSPERTIZ.premium.bedel), "ince",
          araba.ekspertizSeviyesi === "premium") +
      "</div>" +
      '<div class="satir"><span>Şu anki fiyatınla nakit fark</span><b class="' +
        ((p.teklif - onerilen) >= 0 ? "kar" : "zarar") + '">' +
        kacis(G.paraYaz(p.teklif - onerilen)) + "</b></div>" +
      ((p.teklif - onerilen) < 0
        ? '<div class="uyari">Bu değeri verirsen fark cebimizden çıkar: arabası bizimkinden pahalı.</div>'
        : "") +
      '<div class="fiyat-duzenle">' +
        '<input type="text" inputmode="numeric" value="' + kacis(rakamYaz(onerilen)) +
          '" id="takas-deger" aria-label="Takasa biçilen değer">' +
        butonVeri("takasKabul", {}, "Bu değeri ver", "sari-btn") +
      "</div>" +
      '<div class="btn-satir">' + butonVeri("takasVazgec", {}, "Takas istemiyoruz", "ince") + "</div>" +
      "</div>";
  }

  // Adim 21: cekle odemek isteyen musteri
  function cekKutusu(s, p, m) {
    if (!m || !G.cek.teklifVarMi(m)) return "";
    var c = C();
    var yanik = G.cek.karsiliksizOlasilik(m.cekRiski);

    return '<div class="kutu cek-kutu">' +
      '<div class="bolum-baslik">ÇEKLE ÖDEME</div>' +
      balon("musteri", "Pazarlık yok abi, üstüne fark veriyorum. Çekle olur mu?", kacis(m.isim)) +
      balon("drej", "Pazarlık etmeyen, ekspertiz istemeyen müşteri ortak. Dikkat.", "Drej") +
      '<div class="satir"><span>Vade</span><b class="' +
        (s.gun + m.cekVade > C().GUN_SAYISI ? "zarar" : "") + '">' + m.cekVade +
        " gün · " + (s.gun + m.cekVade) + ". gün</b></div>" +
      (s.gun + m.cekVade > C().GUN_SAYISI
        ? '<div class="uyari">Vade otuzuncu günü aşıyor: bu çek hiç tahsil edilmez.</div>'
        : "") +
      '<div class="satir"><span>Üstüne verdiği</span><b class="kar">%' +
        Math.round(m.cekPrim * 100) + "</b></div>" +
      '<div class="satir"><span>Çek riski</span><b class="' +
        (m.cekSorgulandi ? (m.cekRiski === "dusuk" ? "kar" : "zarar") : "") + '">' +
        (m.cekSorgulandi
          ? kacis(G.cek.riskSozu(m.cekRiski)) + " · karşılıksız %" + Math.round(yanik * 100)
          : "bilinmiyor") + "</b></div>" +
      (m.cekAval
        ? '<div class="satir"><span>Rıza aval verdi</span><b>payı %' +
            Math.round(c.AVAL_PAY * 100) + ", yanarsa %" +
            Math.round(c.AVAL_KARSILAMA * 100) + ' karşılar</b></div>'
        : "") +
      '<div class="btn-satir">' +
        butonVeri("cekSorgula", {}, "Karekodu okut · " + G.paraYaz(c.CEK_SORGU_BEDEL),
          "ince", m.cekSorgulandi) +
        butonVeri("cekAval", {}, "Rıza aval versin", "ince", m.cekAval) +
      "</div>" +
      '<div class="btn-satir">' +
        (p.cekli
          ? butonVeri("cekNakde", {}, "Çeki bırak, nakit konuşalım", "ince")
          : butonVeri("cekKabul", {}, "Çekle sat · tavan +%" +
              Math.round(m.cekPrim * 100), "sari-btn")) +
      "</div>" +
      '<div class="kucuk">Nakit satış her zaman açık: çeki almazsan müşteri normal fiyattan alır. ' +
      'Çeki alırsan üstüne fark verir ama para vade gününde girer; karşılıksız çıkarsa ' +
      'itibar düşer ve icra masrafı çıkar.</div>' +
      "</div>";
  }

  function ekranSatis() {
    var s = S();
    var p = s.aktifPazarlik;
    if (!p) return ekranDukkan();
    var araba = G.pazarlik.arabaBul(s, p.arabaId);
    var m = G.pazarlik.musteriBul(s, p.musteriId);
    var h = "";

    var satisSahnesi = p.sonuc === "yakalandi" ? "yakalandi" : "satis";
    h += sahneKapak("kucuk-kapak", satisSahnesi, {
      musteriTipi: p.musteriTipi,
      araba: sahneArabasi(G.pazarlik.arabaBul(s, p.arabaId)),
      konusan: p.konusan,
      isik: p.sonuc === "satildi" ? p.konusan : "musteri"
    },
      tekSatirBaslik(p.sonuc === "yakalandi" ? "YAKALANDIK" : "GÖRÜŞME", p.arabaAdi,
        (p.durustluk === "soyle" ? "söyledik" : "sakladık") + " · " + G.karakterler.al(p.konusan).ad),
      baloncuk("sol", "musteri", p.musteriAdi, p.replik ? p.replik.metin : "", "gec") +
      (p.tesekkur ? "" : "") +
      (p.sonuc === "satildi"
        ? baloncuk("sag", p.konusan, G.karakterler.al(p.konusan).ad,
            G.data.replikler.kapanis)
        : baloncuk("sag", p.konusan, G.karakterler.al(p.konusan).ad,
            p.ortakReplik ? p.ortakReplik.metin : ""))
    );

    // Kutu once icerigiyle kurulur: bos kutu yazilirsa sahnenin altinda bos bir bej
    // serit kaliyor. Musterinin ruh hali burada degil, asagidaki rakam seridinde.
    var satisKutusu = "";
    var satisKarakter = G.karakterler.al(p.konusan);
    if (satisKarakter.kusurToplamiGorur && araba) {
      var satisCikan = G.ekspertiz.cikanKusurlar(araba);
      if (satisCikan.length > 0) {
        satisKutusu += balon("drej", G.replikDoldur(G.data.replikler.drej.kusurToplami[0],
          { tutar: G.paraYaz(G.araba.kusurToplami(satisCikan)) }), "Drej");
      }
    }
    if (satisKutusu) h += '<div class="kutu pazarlik-kutu">' + satisKutusu + "</div>";

    var satisDokum = "";
    if (p.bulunanKusurlar && p.bulunanKusurlar.length > 0 && p.sonuc !== "yakalandi") {
      for (var i = 0; i < p.bulunanKusurlar.length; i++) {
        satisDokum += '<div class="satir"><span>Müşterinin ekspertizi buldu: ' +
          kacis(G.kusurAdi(p.bulunanKusurlar[i].tip)) +
          (p.bulunanKusurlar[i].parca ? " (" + kacis(p.bulunanKusurlar[i].parca) + ")" : "") + "</span></div>";
      }
    }
    satisDokum += hesapSatiri(p);
    if (p.gecmis.length) satisDokum += gecmisListesi(p);

    if (!p.bitti) {
      h += rakamSeridi([
        { etiket: "İlan fiyatı", deger: araba ? G.paraYaz(araba.ilanFiyati) : "—" },
        { etiket: "Müşterinin rakamı", deger: G.paraYaz(p.karsi), sinif: "vurgu" },
        { etiket: "Müşteri", deger: G.pazarlik.ruhHali(p.sabir),
          sinif: p.sabir <= 1 ? "kizgin" : (p.sabir === 2 ? "gergin" : "sakin") },
        { etiket: "Kusurlar", deger: p.durustluk === "soyle" ? "söylendi" : "saklandı",
          sinif: p.durustluk === "soyle" ? "kar" : "zarar" }
      ]);
    }
    if (p.mesaj) h += '<div class="mesaj kisa">' + kacis(p.mesaj) + "</div>";

    if (p.bitti) {
      h += '<div class="kutu sonuc">';
      if (p.sonuc === "satildi") {
        h += kirmiziBant("SATTIK") +
          '<div class="buyuk-sayi">' + kacis(G.paraYaz(p.anlasmaFiyati)) + "</div>" +
          '<div class="satir"><span>' + (p.konsinye ? "Komisyon" : "Kâr") + '</span><b class="' + paraSinif(p.kar) + '">' + kacis(G.paraYaz(p.kar)) + "</b></div>" +
          '<div class="satir"><span>Vergi</span><b class="zarar">-' + kacis(G.paraYaz(p.vergi)) + "</b></div>" +
          (p.takasDegeri
            ? '<div class="satir"><span>Takasa verilen</span><b class="zarar">-' +
                kacis(G.paraYaz(p.takasDegeri)) + "</b></div>" +
              '<div class="satir"><span>Nakit alınan</span><b>' +
                kacis(G.paraYaz(p.anlasmaFiyati - p.takasDegeri)) + "</b></div>"
            : "") +
          '<div class="satir toplam"><span>Net</span><b class="' + paraSinif(p.netKar) + '">' +
            kacis(G.paraYaz(p.netKar)) + "</b></div>" +
          (p.cekli
            ? '<div class="uyari">Para çekle alındı: vade gününde kasaya girecek.</div>'
            : "") +
          '<div class="kapanis">' + kacis(G.data.replikler.kapanis) + "</div>";
      } else if (p.sonuc === "yakalandi") {
        h += kirmiziBant("YAKALANDIK") +
          '<div class="uyari">Müşteri sakladığımız kusuru buldu. İtibar ' + C().YAKALANMA_ITIBAR + ".</div>";
      } else if (p.sonuc === "sase") {
        h += kirmiziBant("ŞASE TUTMUYOR");
      } else {
        h += kirmiziBant("MÜŞTERİ GİTTİ");
      }
      h += "</div>" + '<div class="ana-butonlar">' + buton("dukkan", "Dükkâna dön", "sari-btn") + "</div>";
      return h;
    }

    h += cekKutusu(s, p, m);
    h += takasKutusu(s, p, m);
    if (p.takas) {
      h += '<div class="kutu takas-kutu">' +
        '<div class="bolum-baslik">TAKAS TAMAM</div>' +
        '<div class="satir"><span>' + kacis(p.takas.arabaAdi) + '</span><b>' +
          kacis(G.paraYaz(p.takas.bicilenDeger)) + "</b></div>" +
        '<div class="kucuk">Söylediğin fiyattan bu değer düşülecek, kalanı nakit.</div>' +
        "</div>";
    }

    h += '<div class="eylem-serit">';
    h += '<div class="kutu">' + teklifKutusu(p, "fiyatSoyle") + "</div>";
    h += '<div class="ana-butonlar ince-satir">' +
      yetenekButonu(p) +
      buton("taviz", C().TAVIZ.etiket, "ince", p.tavizKullanildi) +
      detayDugmesi("satis", "Görüşme dökümü") +
      buton("vazgecSatis", "Bitir", "ince") +
      "</div>";
    h += "</div>";
    h += detayIcerik("satis", satisDokum);
    return h;
  }

  // ---------- aksam raporu ----------

  function ekranRapor() {
    var s = S();
    var r = s.sonRapor;
    if (!r) return ekranDukkan();
    var h = "";

    h += sahneKapak("rapor-kapak", "aksam", { ozet: r.ozet, isik: r.satisAdet > 0 ? "nuri" : "drej" },
      etiketSerit("GÜN " + r.gun) +
      "<h2>" + kacis(r.ozet || "KASA") + "</h2>" +
      kirmiziBant("GÜNÜN NETİ: " + G.paraYaz(r.gunlukNet)) +
      '<div class="buyuk-sayi">' + kacis(G.paraYaz(r.kasa)) + "</div>" +
      '<div class="kucuk">kasa</div>',
      baloncuk("sol", "drej", "Drej",
        r.drejYorumu || (r.satisAdet > 0 ? "Kasaya pere girdi ortak, deftere yazdım." : "Bugün sakindi. Masraf işliyor ama.")) +
      (r.satisAdet > 0
        ? baloncuk("sag", "nuri", "Nuri", G.data.replikler.kapanis)
        : rehberBaloncugu("rapor"))
    );

    h += rakamSeridi([
      { etiket: "Kasa", deger: G.paraYaz(r.kasa), sinif: "vurgu" },
      { etiket: "Günün neti", deger: G.paraYaz(r.gunlukNet), sinif: paraSinif(r.gunlukNet) },
      { etiket: "Net varlık", deger: G.paraYaz(r.netVarlik) },
      { etiket: "İtibar", deger: (r.itibarBasi === undefined ? String(s.itibar) : r.itibarBasi + " → " + r.itibarSon) }
    ]);

    var raporDokum = '<div class="kutu">' +
      '<div class="satir"><span>Alış (' + r.alisAdet + ")</span><b class=\"zarar\">-" + kacis(G.paraYaz(r.alis)) + "</b></div>" +
      '<div class="satir"><span>Satış (' + r.satisAdet + ')</span><b class="kar">' + kacis(G.paraYaz(r.satis)) + "</b></div>" +
      '<div class="satir"><span>Masraf (ekspertiz, noter)</span><b class="zarar">-' + kacis(G.paraYaz(r.masraf)) + "</b></div>" +
      '<div class="satir"><span>Vergi</span><b class="zarar">-' + kacis(G.paraYaz(r.vergi)) + "</b></div>" +
      '<div class="satir"><span>Sabit gider</span><b class="zarar">-' + kacis(G.paraYaz(r.sabitGider)) + "</b></div>" +
      '<div class="satir toplam"><span>Günün neti</span><b class="' + paraSinif(r.gunlukNet) + '">' +
        kacis(G.paraYaz(r.gunlukNet)) + "</b></div>" +
      '<div class="satir"><span>Net varlık</span><b>' + kacis(G.paraYaz(r.netVarlik)) + "</b></div>" +
      '<div class="satir"><span>İtibar</span><b>' + (r.itibarBasi === undefined ? s.itibar :
        r.itibarBasi + " → " + r.itibarSon + " (" + itibarSozu(r.itibarSon) + ")") + "</b></div>" +
      (r.itibarKaymasi ? '<div class="kucuk">Sanayi unutuyor: itibar ' +
        (r.itibarKaymasi > 0 ? "+" : "") + r.itibarKaymasi + " ile 50'ye yaklaştı.</div>" : "") +
      "</div>";

    // Gunun notlari: ilk ikisi disarida, gerisi detayda
    var notlar = r.notlar.slice();
    if (notlar.length === 0) {
      h += '<div class="serit-haber"><div>· ' + kacis(G.data.replikler.gunNotu.sakin) + "</div></div>";
    } else {
      h += '<div class="serit-haber">';
      for (var i = 0; i < notlar.length && i < 2; i++) {
        h += '<div class="sirali" style="--sira:' + i + '">· ' + kacis(notlar[i]) + "</div>";
      }
      if (notlar.length > 2) h += '<div class="kucuk">+' + (notlar.length - 2) + " not daha, detayda</div>";
      h += "</div>";
      if (notlar.length > 2) {
        var kalanNot = "";
        for (var j = 2; j < notlar.length; j++) kalanNot += "<div>· " + kacis(notlar[j]) + "</div>";
        raporDokum += '<div class="kutu">' + kalanNot + "</div>";
      }
    }
    if (r.beklemeBonusu > 0) {
      h += '<div class="kucuk orta">Dükkânda bekledik: yarın müşteri şansı +%' +
        Math.round(r.beklemeBonusu * 100) + "</div>";
    }
    h += detayKutusu("rapor", raporDokum, "Kasa dökümü");
    h += '<div class="kapanis orta">' + kacis(G.data.replikler.kapanis) + "</div>";

    h += '<div class="ana-butonlar">' +
      buton("raporKapat", s.bitis ? "Sonucu gör" : "Sizce?", "sari-btn") + "</div>";
    return h;
  }

  // ---------- "Sizce?" (Adim 9) ----------

  function ekranSizce() {
    var s = S();
    var kart = G.olaylar.kartBul(s.yarinkiKart);
    if (!kart) return ekranDukkan();

    var h = sahneKapak("sizce-kapak", "gece", {},
      etiketSerit("GÜN " + s.gun + " · AKŞAM") +
      "<h2>SİZCE?</h2>" +
      kirmiziBant(kart.sizceSorusu) +
      '<div class="buyuk-sayi">' + kacis(G.paraYaz(s.kasa)) + "</div>" +
      '<div class="kucuk">güncel kasa</div>',
      rehberBaloncugu("sizce")
    );

    h += '<div class="kutu"><div class="btn-satir">';
    for (var i = 0; i < kart.sizceSecenekleri.length; i++) {
      h += butonVeri("sizceSec", { sira: i }, kart.sizceSecenekleri[i].etiket,
        i === 0 ? "sari-btn" : "ince");
    }
    h += "</div>";
    h += '<div class="kucuk">Tahminin yarının işine dokunabilir. Doğru tahmin şansı ' +
      Math.round(C().SIZCE_KAYDIRMA * 100) + " puan oynatır.</div>";
    h += "</div>";
    return h;
  }

  // ---------- oyun sonu ----------

  function ekranBitti() {
    var s = S();
    var b = s.bitis;
    var ist = s.istatistik;
    var h = "";

    var bitisSahne = (b.tur === "batti" || b.tur === "itibarsiz") ? "bitis-batti"
      : (b.kazandi ? "bitis-kazandi" : "bitis-son");
    var bitisStok = [];
    for (var bi = 0; bi < s.stok.length; bi++) {
      bitisStok.push({ model: s.stok[bi].model, renk: s.stok[bi].renk });
    }
    h += sahneKapak("bitis-kapak" + (b.kazandi ? " kazandi" : ""), bitisSahne, { stok: bitisStok },
      etiketSerit("GÜN " + b.gun + " · SON") +
      "<h2>" + kacis(G.buyukHarf(b.unvan)) + "</h2>" +
      kirmiziBant(b.baslik) +
      '<div class="buyuk-sayi">' + kacis(G.paraYaz(b.netVarlik)) + "</div>" +
      '<div class="kucuk">net varlık &middot; hedef ' + kacis(G.paraYaz(b.hedef)) + "</div>"
    );

    h += '<div class="kutu"><div class="bolum-baslik">HESAP</div>' +
      '<div class="satir"><span>Kasa</span><b>' + kacis(G.paraYaz(b.kasa)) + "</b></div>" +
      '<div class="satir"><span>Tezgâhtaki ' + b.stokAdet + ' araba (%' +
        Math.round(C().NET_VARLIK_STOK_ORANI * 100) + ')</span><b>' +
        kacis(G.paraYaz(b.stokDegeri)) + "</b></div>" +
      '<div class="satir toplam"><span>Net varlık</span><b>' + kacis(G.paraYaz(b.netVarlik)) + "</b></div>" +
      '<div class="satir"><span>Hedefe göre</span><b class="' + paraSinif(b.fark) + '">' +
        (b.fark >= 0 ? "+" : "") + kacis(G.paraYaz(b.fark)) + "</b></div>" +
      "</div>";

    if (b.tur === "batti") {
      h += '<div class="kutu"><div class="uyari">Kasa eksiye düştü. ' + b.gun +
        ". günde dükkân kapandı.</div></div>";
    } else if (b.tur === "itibarsiz") {
      h += '<div class="kutu"><div class="uyari">İtibar sıfırlandı: ' + b.gun +
        ". günde kimse kapıdan girmedi.</div></div>";
    }

    h += '<div class="kutu"><div class="bolum-baslik">DEFTERİN SONU</div>' +
      '<div class="satir"><span>Alınan araba</span><b>' + ist.alinan + "</b></div>" +
      '<div class="satir"><span>Satılan araba</span><b>' + ist.satilan + "</b></div>" +
      '<div class="satir"><span>Toplam net kâr</span><b class="' + paraSinif(ist.toplamKar) + '">' +
        kacis(G.paraYaz(ist.toplamKar)) + "</b></div>" +
      '<div class="satir"><span>En iyi pazarlık</span><b class="' + paraSinif(ist.enIyiPazarlik) + '">' +
        kacis(G.paraYaz(ist.enIyiPazarlik)) + "</b></div>" +
      '<div class="satir"><span>Yakaladığımız dolandırıcı</span><b>' + ist.yakalananDolandirici + "</b></div>" +
      '<div class="satir"><span>Sakladığımız kusur</span><b>' + ist.saklanan + "</b></div>" +
      '<div class="satir"><span>Dürüst satış</span><b>' + ist.durustSatis + "</b></div>" +
      '<div class="satir"><span>Yakalandık</span><b>' + ist.yakalanan + "</b></div>" +
      '<div class="satir"><span>Gelen şikâyet</span><b>' + ist.sikayetGelen + "</b></div>" +
      (s.cekler && s.cekler.length
        ? '<div class="satir"><span>Tahsil edilmemiş çek</span><b class="zarar">' +
            kacis(G.paraYaz(G.cek.bekleyenToplam(s))) + " (" + s.cekler.length +
            " adet)</b></div>"
        : "") +
      '<div class="satir"><span>Görülen hikâye sahnesi</span><b>' + ist.hikayeSahnesi +
        "/" + G.hikaye.toplam() + "</b></div>" +
      '<div class="satir"><span>Masadan kalkan satıcı</span><b>' + ist.kalkanSatici + "</b></div>" +
      '<div class="satir"><span>Nuri kaç kez sinirlendi</span><b>' + ist.nuriSinirlendi + "</b></div>" +
      "<div class=\"satir\"><span>Kro'nun getirdiği ilan</span><b>" + ist.kroIlani + "</b></div>" +
      '<div class="satir"><span>İtibar</span><b>' + s.itibar + " · " + kacis(itibarSozu(s.itibar)) + "</b></div>" +
      "</div>";

    if (G.karne) {
      h += G.karne.ciz(s);
    } else {
      h += '<div class="kutu"><div class="kucuk">Bu oyunun tohumu: <b>' + b.tohum +
        "</b> — aynı tohumla aynı ilanlar ve aynı kartlar gelir.</div></div>";
    }

    h += '<div class="ana-butonlar">' +
      buton("yeniOyun", "Yeni oyun", "sari-btn") +
      butonVeri("ayniTohum", { tohum: b.tohum }, "Aynı tohumla tekrar", "ince") +
      buton("defter", "Defteri gör", "ince") +
      "</div>";
    return h;
  }

  // ---------- defter ----------

  function ekranDefter() {
    var s = S();
    var h = sahneKapak("kucuk-kapak", "defter", {},
      tekSatirBaslik("KAYIT", "Defter", s.defter.length + " kayıt")
    );
    if (s.defter.length === 0) {
      h += '<div class="bos">Defter boş ortak.</div>';
    } else {
      if (G.grafik) h += G.grafik.ciz(s);
      h += '<table class="defter"><tr><th>Gün</th><th>İş</th><th>Araba</th><th>Fiyat</th><th>Net</th></tr>';
      for (var i = s.defter.length - 1; i >= 0; i--) {
        var d = s.defter[i];
        var tur = d.tur === "alis" ? "Alış" : (d.tur === "satis" ? "Satış" : "Pazar");
        h += "<tr><td>" + d.gun + "</td><td>" + tur + "</td><td>" + kacis(d.araba) + "</td><td>" +
          kacis(G.paraYaz(d.fiyat)) + '</td><td class="' + paraSinif(d.kar || 0) + '">' +
          (d.kar === undefined ? "—" : kacis(G.paraYaz(d.kar))) + "</td></tr>";
      }
      h += "</table>";
    }
    h += '<div class="ana-butonlar">' +
      (s.bitis ? buton("bitisEkrani", "Sonuca dön", "ince") : buton("dukkan", "Dükkâna dön", "ince")) +
      "</div>";
    return h;
  }

  // Ogretici acikken her ekranin ustunde duran serit
  function tutorialBandi() {
    var s = S();
    if (!G.durum.tutorialAktifMi(s)) return "";
    return '<div class="tutorial-bant">' +
      '<span class="etiket">ÖĞRETİCİ</span>' +
      '<span class="tutorial-metin">Gün ' + s.gun + " / " + s.tutorial.bitisGun +
      " &middot; burada kaybettiğin gerçek değil</span>" +
      butonVeri("tutorialBitir", {}, "Bitir, oyuna başla", "ince") +
      "</div>";
  }

  // Ogretici suresi dolunca cikan kapanis
  function ekranTutorialBitti() {
    var s = S();
    var h = sahneKapak("giris-kapak", "giris", {},
      etiketSerit("ÖĞRETİCİ BİTTİ") + "<h2>SIRA SENDE</h2>"
    );
    h += '<div class="kutu giris-metin">' +
      "<p>İlanı gördün, ekspertizi yaptırdın, pazarlığı denedin. Buradaki kasa ve itibar " +
      "sayılmıyor; oyun birinci günden temiz başlayacak.</p>" +
      "<p>Unutma: günde üç aksiyon hakkın var, kusuru saklamak kısa vadede kazandırır ama " +
      "itibarı düşürür, ve her satıcı aynı ağızdan konuşmaz.</p>" +
      '<div class="giris-hedef">' + kacis(G.data.hikayeOzeti.hedefCumlesi) + "</div></div>";
    h += '<div class="ana-butonlar">' + buton("tutorialBitir", "Oyuna başla", "sari-btn") + "</div>";
    return h;
  }

  // ---------- Faz 4: giris, hikaye ve karakterler ----------

  function karakterKarti(k) {
    return '<div class="kart tanitim-kart">' +
      '<div class="tanitim-foto">' +
        '<img class="tanitim-img" alt="" src="img/karakter/' + kacis(k.anahtar) + '-normal.png" ' +
        'onerror="this.remove()">' +
      "</div>" +
      '<div class="kart-baslik">' + kacis(k.ad) + "</div>" +
      '<div class="kucuk">' + kacis(k.rol) + "</div>" +
      '<div class="kart-metin">' + kacis(k.metin) + "</div>" +
      "</div>";
  }

  // Yeni oyunun en basi: dukkanin hikayesi, ortaklar ve ogretici secimi
  function ekranGiris() {
    var ozet = G.data.hikayeOzeti;
    var h = sahneKapak("giris-kapak", "giris", {},
      etiketSerit("BAŞLARKEN") + "<h2>" + kacis(ozet.baslik) + "</h2>"
    );

    h += '<div class="kutu giris-metin">';
    for (var i = 0; i < ozet.satirlar.length; i++) {
      h += "<p>" + kacis(ozet.satirlar[i]) + "</p>";
    }
    h += '<div class="giris-hedef">' + kacis(ozet.hedefCumlesi) + "</div></div>";

    h += '<div class="bolum-baslik">ORTAKLAR</div><div class="kart-liste">';
    var liste = G.data.karakterTanitim;
    for (var j = 0; j < liste.length; j++) {
      if (liste[j].rol !== "Ortak" && liste[j].rol !== "Yeğen") continue;
      h += karakterKarti(liste[j]);
    }
    h += "</div>";

    h += '<div class="kutu"><div class="bolum-baslik">NASIL BAŞLAYALIM?</div>' +
      '<div class="kart-metin">İlk kez oynuyorsan öğretici oynanış iki günde ilanı, ekspertizi, ' +
      "pazarlığı ve satışı elinden tutarak gösterir. Kaybettiğin gerçek olmaz; bitince oyun " +
      "birinci günden temiz başlar.</div>" +
      '<div class="ana-butonlar">' +
      buton("tutorialBasla", "Öğreticiyle başla", "sari-btn") +
      buton("girisGec", "Doğrudan başla", "ince") +
      "</div></div>";
    return h;
  }

  function ekranKimKimdir() {
    var ozet = G.data.hikayeOzeti;
    var h = sahneKapak("giris-kapak", "giris", {},
      etiketSerit("HİKÂYE") + "<h2>" + kacis(ozet.baslik) + "</h2>"
    );
    h += '<div class="kutu giris-metin">';
    for (var i = 0; i < ozet.satirlar.length; i++) h += "<p>" + kacis(ozet.satirlar[i]) + "</p>";
    h += '<div class="giris-hedef">' + kacis(ozet.hedefCumlesi) + "</div></div>";

    h += '<div class="bolum-baslik">KİM KİMDİR</div><div class="kart-liste">';
    var liste = G.data.karakterTanitim;
    for (var j = 0; j < liste.length; j++) h += karakterKarti(liste[j]);
    h += "</div>";
    h += '<div class="ana-butonlar">' + buton("dukkan", "Dükkâna dön", "ince") + "</div>";
    return h;
  }

  // ---------- cizim ----------

  var basaKaydir = false;          // yeni oyun/sifirlama sonrasi tepeye don
  var sonCizilenEkran = null;      // Faz 5: gecis animasyonu sadece ekran degisince oynasin

  function ciz() {
    var s = S();
    if (!s) return;
    G.rehber.ilerlet(s);

    // Cizim sayfayi bastan yaziyor; kaydirma ve odak geri verilsin (Adim 16)
    var kaydirma = (window.scrollY || 0) ||
      (document.documentElement ? document.documentElement.scrollTop : 0) || 0;
    var odakId = document.activeElement ? document.activeElement.id : null;
    var imlec = null;
    if (odakId === "teklif" && document.activeElement.selectionStart !== undefined) {
      imlec = document.activeElement.selectionStart;
    }

    // Ogretici suresi dolduysa once kapanis ekrani (Faz 4)
    if (G.durum.tutorialBittiMi(s) && s.ekran !== "tutorialBitti") s.ekran = "tutorialBitti";

    var govde;
    switch (s.ekran) {
      case "giris": govde = ekranGiris(); break;
      case "tutorialBitti": govde = ekranTutorialBitti(); break;
      case "kimKimdir": govde = ekranKimKimdir(); break;
      case "ilanlar": govde = ekranIlanlar(); break;
      case "araba": govde = ekranAraba(); break;
      case "olay": govde = ekranOlay(); break;
      case "hikaye": govde = ekranHikaye(); break;
      case "sinav": govde = ekranSinav(); break;
      case "sinavSecim": govde = ekranSinavSecim(); break;
      case "seferSecim": govde = ekranSeferSecim(); break;
      case "sefer": govde = ekranSefer(); break;
      case "yemek": govde = ekranYemek(); break;
      case "pazarlik": govde = ekranPazarlik(); break;
      case "durustluk": govde = ekranDurustluk(); break;
      case "satis": govde = ekranSatis(); break;
      case "rapor": govde = ekranRapor(); break;
      case "sizce": govde = ekranSizce(); break;
      case "bitti": govde = ekranBitti(); break;
      case "defter": govde = ekranDefter(); break;
      default: govde = ekranDukkan();
    }
    var ekranDegisti = s.ekran !== sonCizilenEkran;
    sonCizilenEkran = s.ekran;
    kap.innerHTML = ustBar() + tutorialBandi() + rehberBandi() +
      '<div class="icerik' + (ekranDegisti ? " gecis" : "") + '">' +
      yardimKarti() + govde + "</div>" + altSerit();

    if (basaKaydir) {
      basaKaydir = false;
      if (window.scrollTo) window.scrollTo(0, 0);
    } else if (kaydirma && window.scrollTo) {
      window.scrollTo(0, kaydirma);
    }
    if (odakId) {
      var geriOdak = document.getElementById(odakId);
      if (geriOdak) {
        geriOdak.focus();
        if (imlec !== null && geriOdak.setSelectionRange) {
          try { geriOdak.setSelectionRange(imlec, imlec); } catch (hata) { /* onemsiz */ }
        }
      }
    }
    G.durum.kaydet();
  }

  function altSerit() {
    return '<div class="altserit">' + kacis(C().OYUN_ADI) +
      ' <span class="kucuk">· ' + kacis(G.data.replikler.kapanis) + "</span>" +
      '<button class="btn ince sag" data-is="sifirla">Oyunu sıfırla</button></div>';
  }

  function uyar(metin) {
    var s = S();
    if (s.aktifPazarlik && !s.aktifPazarlik.bitti) s.aktifPazarlik.mesaj = metin;
    else s.sabahHaberleri.unshift(metin);
  }

  // ---------- olaylar ----------

  function teklifOkuDOM() {
    var kutu = document.getElementById("teklif");
    if (!kutu) return null;
    var rakamlar = String(kutu.value).replace(/[^0-9]/g, "");
    if (!rakamlar) return null;
    var deger = parseInt(rakamlar, 10);
    return isNaN(deger) ? null : deger;
  }

  function tiklama(olay) {
    var dugme = olay.target.closest ? olay.target.closest("button[data-is]") : null;
    if (!dugme || dugme.disabled) return;
    var s = S();
    var is = dugme.getAttribute("data-is");
    var p = s.aktifPazarlik;
    var sonuc;

    // Oyun bittiyse tezgah kapali: sadece sonuc, defter ve yeni oyun
    if (s.bitis && ["yeniOyun", "ayniTohum", "sifirla", "defter", "bitisEkrani", "raporKapat"].indexOf(is) === -1) {
      s.ekran = "bitti";
      ciz();
      return;
    }

    switch (is) {
      case "dukkan":
        s.ekran = "dukkan"; s.aktifPazarlik = null; s.acikMusteriId = null;
        break;

      case "ilanlar":
        s.ekran = "ilanlar";
        break;

      case "defter":
        s.ekran = "defter";
        break;

      case "bitisEkrani":
        s.ekran = "bitti";
        break;

      case "detay":
        if (!s.detay) s.detay = {};
        var detayAnahtar = dugme.getAttribute("data-anahtar");
        s.detay[detayAnahtar] = !s.detay[detayAnahtar];
        break;

      case "yardim":
        G.rehber.yardimAc(s, dugme.getAttribute("data-ekran") || s.ekran);
        break;

      case "yardimKapat":
        G.rehber.yardimKapat(s);
        break;

      case "rehberKapat":
        G.rehber.kapat(s);
        break;

      case "rehberAc":
        G.rehber.ac(s);
        G.rehber.yardimKapat(s);
        break;

      case "ilanaGit":
        sonuc = G.sefer.acikMi(s)
          ? G.sefer.ilanaGit(s, dugme.getAttribute("data-araba"))
          : G.gun.ilanaGit(s, dugme.getAttribute("data-araba"));
        if (sonuc.hata) { uyar(sonuc.hata); break; }
        s.acikArabaId = dugme.getAttribute("data-araba");
        var ilan = G.pazarlik.arabaBul(s, s.acikArabaId);
        if (ilan) G.ekspertiz.gozKontrol(ilan);
        s.ekran = "araba";
        break;

      case "ekspertiz":
        var hedef = G.pazarlik.arabaBul(s, dugme.getAttribute("data-araba"));
        sonuc = G.ekspertiz.ekspertizYap(s, hedef, dugme.getAttribute("data-seviye"));
        if (sonuc.hata) uyar(sonuc.hata);
        else if (G.ses) G.ses.ekspertiz();
        break;

      case "sinavSecim":
        if (!G.belge.girebilirMi(s)) { uyar(G.belge.engel(s)); break; }
        s.ekran = "sinavSecim";
        break;

      case "sinavBaslat":
        sonuc = G.belge.sinavBaslat(s, dugme.getAttribute("data-kim"));
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "sinavCevap":
        sonuc = G.belge.cevapla(s, parseInt(dugme.getAttribute("data-sik"), 10));
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "sinavKapat":
        G.belge.kapat(s);
        break;

      case "cekKabul":
        sonuc = G.cek.cekeCevir(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "cekNakde":
        sonuc = G.cek.nakdeDon(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "cekSorgula":
        sonuc = G.cek.sorgula(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "cekAval":
        sonuc = G.cek.avalIste(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "takasKabul":
        var takasKutu = document.getElementById("takas-deger");
        var takasDeger = takasKutu
          ? parseInt(String(takasKutu.value).replace(/[^0-9]/g, ""), 10) : NaN;
        if (isNaN(takasDeger) || takasDeger <= 0) { uyar("Rakam gir ortak."); break; }
        sonuc = G.takas.kabulEt(s, takasDeger);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "takasVazgec":
        G.takas.vazgec(s);
        break;

      case "konsinyeAl":
        sonuc = G.konsinye.kabulEt(s, dugme.getAttribute("data-araba"));
        if (sonuc && sonuc.hata) { uyar(sonuc.hata); break; }
        s.acikArabaId = null;
        s.ekran = G.sefer.acikMi(s) ? "sefer" : "dukkan";
        break;

      case "konsinyeKoz":
        sonuc = G.konsinye.kozOyna(s, dugme.getAttribute("data-araba"),
          dugme.getAttribute("data-tip"));
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "seferSecim":
        if (G.sefer.gidebilirMi(s)) s.ekran = "seferSecim";
        else uyar(G.sefer.engel(s));
        break;

      case "seferBaslat":
        sonuc = G.sefer.baslat(s, dugme.getAttribute("data-sehir"));
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "seferYemek":
        sonuc = G.sefer.yemek(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "seferDon":
        G.sefer.don(s);
        break;

      case "diyalogIlerle":
        var hikayedeydi = !!(s.diyalog && s.diyalog.kaynak === "hikaye");
        G.diyalog.ilerle(s);
        if (hikayedeydi && !G.diyalog.acikMi(s)) {
          G.hikaye.bitir(s);
          G.olaylar.kartDiyalogunuKur(s);   // hikaye sahnesi kartin diyalogunu ezmisti, geri kur
        }
        break;

      case "olaySecim":
        G.olaylar.secenekSec(s, parseInt(dugme.getAttribute("data-sira"), 10));
        if (G.ses) G.ses.kart();
        break;

      case "dogrudanAl":
        sonuc = G.pazarlik.dogrudanAl(s, dugme.getAttribute("data-araba"));
        if (sonuc && sonuc.hata) { uyar(sonuc.hata); break; }
        if (sonuc && sonuc.bitti) {
          s.ekran = "pazarlik";
          if (G.ses && sonuc.sonuc === "alindi") G.ses.damga();
        }
        else if (sonuc && sonuc.mesaj) { uyar(sonuc.mesaj); s.aktifPazarlik = null; }
        break;

      case "pazarlikBaslat":
        G.pazarlik.alisBaslat(s, dugme.getAttribute("data-araba"), dugme.getAttribute("data-konusan"));
        s.ekran = "pazarlik";
        break;

      case "teklifDegis":
        if (p) {
          var simdi = teklifOkuDOM();
          if (simdi === null) simdi = p.teklif;
          p.teklif = Math.max(C().TEKLIF_ADIMI, simdi + parseInt(dugme.getAttribute("data-miktar"), 10));
        }
        break;

      case "teklifVer":
        var t = teklifOkuDOM();
        if (t === null) { uyar("Rakam gir ortak."); break; }
        sonuc = G.pazarlik.alisTeklif(s, t);
        if (G.ses && sonuc) {
          if (sonuc.sonuc === "alindi") G.ses.damga();
          else if (sonuc.sonuc === "kalkti") G.ses.kapi();
          else G.ses.tikla();
        }
        break;

      case "koz":
        sonuc = G.pazarlik.kozKullan(s, dugme.getAttribute("data-tip"));
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        else if (G.ses) G.ses.tikla();
        break;

      case "ortasiKabul":
        G.pazarlik.ortasiKabul(s);
        if (G.ses) G.ses.damga();
        break;

      case "ortasiRed":
        G.pazarlik.ortasiRed(s);
        break;

      case "yetenek":
        sonuc = G.pazarlik.yetenekKullan(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "satisKonusan":
        s.satisKonusan = dugme.getAttribute("data-konusan");
        break;

      case "kalk":
        sonuc = G.pazarlik.masadanKalk(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        break;

      case "seferePazarlikBitti":
        s.ekran = "sefer";
        break;

      case "vazgec":
        G.pazarlik.vazgec(s);
        s.aktifPazarlik = null;
        s.ekran = "ilanlar";
        break;

      case "ilanFiyatiKaydet":
        var arabaId = dugme.getAttribute("data-araba");
        var kutu = document.getElementById("ilanfiyat-" + arabaId);
        var araba = G.pazarlik.arabaBul(s, arabaId);
        if (araba && kutu) {
          var yeni = parseInt(String(kutu.value).replace(/[^0-9]/g, ""), 10);
          if (!isNaN(yeni) && yeni > 0) araba.ilanFiyati = G.yuvarla(yeni, C().TEKLIF_ADIMI);
        }
        break;

      case "musteriyeGit":
        if (s.aksiyon < 1) { uyar("Bugün aksiyon hakkın kalmadı ortak."); break; }
        s.aksiyon--;
        s.acikMusteriId = dugme.getAttribute("data-musteri");
        if (!s.satisKonusan || !G.karakterler.kullanilabilir(s, s.satisKonusan)) {
          s.satisKonusan = G.karakterler.nuriYokMu(s) ? "drej" : "nuri";
        }
        s.ekran = "durustluk";
        break;

      case "satisBaslat":
        G.pazarlik.satisBaslat(s, s.acikMusteriId, dugme.getAttribute("data-durustluk"),
          dugme.getAttribute("data-konusan") || s.satisKonusan);
        s.ekran = "satis";
        break;

      case "fiyatSoyle":
        var f = teklifOkuDOM();
        if (f === null) { uyar("Rakam gir ortak."); break; }
        sonuc = G.pazarlik.satisTeklif(s, f);
        if (G.ses && sonuc) {
          if (sonuc.sonuc === "satildi") {
            if ((sonuc.netKar || 0) >= 0) G.ses.para(); else G.ses.zarar();
          } else if (sonuc.sonuc === "kalkti") G.ses.kapi();
          else G.ses.tikla();
        }
        break;

      case "taviz":
        sonuc = G.pazarlik.taviz(s);
        if (sonuc && sonuc.hata) uyar(sonuc.hata);
        else if (G.ses) G.ses.tikla();
        break;

      case "vazgecSatis":
        G.pazarlik.vazgec(s);
        s.aktifPazarlik = null;
        s.ekran = "dukkan";
        break;

      case "hurda":
        G.pazarlik.hurdayaVer(s, dugme.getAttribute("data-araba"));
        if (G.ses) G.ses.zarar();
        break;

      case "sesDegistir":
        if (G.ses) {
          var acildi = G.ses.degistir();
          if (acildi) G.ses.tikla();
        }
        break;

      case "tohumKopyala":
        var tKod = dugme.getAttribute("data-tohum") || String(s.tohum || "");
        if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
          try { navigator.clipboard.writeText(tKod); } catch (e) {}
        }
        uyar("Tohum kopyalandı: #" + tKod);
        break;

      case "tohumlaBaslat":
        var tGirdi = document.getElementById("tohumGirdi");
        var tSayi = tGirdi ? parseInt(String(tGirdi.value).replace(/[^0-9]/g, ""), 10) : NaN;
        if (isNaN(tSayi) || tSayi <= 0) tSayi = s.tohum;
        G.durum.yeniOyun(tSayi);
        basaKaydir = true;
        break;

      case "gunuBitir":
        G.gun.gunuBitir(s);
        break;

      case "raporKapat":
        G.gun.raporKapat(s);
        break;

      case "sizceSec":
        G.gun.sizceSec(s, parseInt(dugme.getAttribute("data-sira"), 10));
        break;

      case "girisGec":
        s.ekran = s.girisSonrasi || "dukkan";
        s.girisSonrasi = null;
        basaKaydir = true;
        break;

      case "tutorialBasla":
        G.durum.tutorialBaslat();
        basaKaydir = true;
        break;

      case "tutorialBitir":
        G.durum.tutorialBitir();
        basaKaydir = true;
        break;

      case "kimKimdir":
        s.ekran = "kimKimdir";
        basaKaydir = true;
        break;

      case "yeniOyun":
        G.durum.yeniOyun(null);
        basaKaydir = true;
        break;

      case "ayniTohum":
        G.durum.yeniOyun(parseInt(dugme.getAttribute("data-tohum"), 10));
        basaKaydir = true;
        break;

      case "sifirla":
        G.durum.kaydiSil();
        G.durum.yeniOyun(null);
        basaKaydir = true;
        break;
    }
    if (!s.bitis && G.gun.kaybettiMi(s) && s.ekran !== "rapor") s.ekran = "bitti";
    ciz();
  }

  function tusBasma(olay) {
    if (olay.key !== "Enter") return;
    var kutu = document.getElementById("teklif");
    if (!kutu || document.activeElement !== kutu) return;
    var s = S();
    if (!s.aktifPazarlik || s.aktifPazarlik.bitti) return;
    olay.preventDefault();
    var deger = parseInt(kutu.value, 10);
    if (isNaN(deger)) return;
    if (s.aktifPazarlik.tur === "alis") G.pazarlik.alisTeklif(s, deger);
    else G.pazarlik.satisTeklif(s, deger);
    ciz();
  }

  function baslat() {
    kap = document.getElementById("uygulama");
    if (!kap) {
      console.error("#uygulama bulunamadi.");
      return;
    }
    if (!G.durum.yukle()) {
      G.durum.yeniOyun(null);
      // Ilk acilis: once hikaye ve ortaklar. Giris kapaninca oyunun kendi ekranina
      // (prolog sahnesine) donulsun diye nereye donecegi saklaniyor (Faz 4).
      G.state.girisSonrasi = G.state.ekran;
      G.state.ekran = "giris";
    }
    kap.addEventListener("click", tiklama);
    document.addEventListener("keydown", tusBasma);
    ciz();
  }

  return { baslat: baslat, ciz: ciz };
})();

document.addEventListener("DOMContentLoaded", function () {
  G.ui.baslat();
});
