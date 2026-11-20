// gun.js — faz gecislerinin tek sahibi (tasarim/08).
// Faz zinciri: sabah (olay karti) -> mesai -> aksam (rapor) -> sizce -> (gun++) -> sabah
// 30. gunun aksamindan sonra Sizce sorulmaz, dogrudan oyun sonu gelir (tasarim/06).
// Kaynak: context/tasarim/01-oyun-dongusu.md
window.G = window.G || {};

G.gun = (function () {
  var C = function () { return G.config; };

  // ---- sabah ----
  function sabah(state) {
    var c = C();
    state.gunNotlari = [];
    state.sabahHaberleri = [];
    state.bugunGezilen = [];
    state.aktifPazarlik = null;
    state.gunBasiItibar = state.itibar;

    // Piyasa trendi: suresi dolduysa yenisi secilir, basladigi gun haber olur
    var yeniTrend = G.trend.sabahKontrol(state);
    if (yeniTrend) state.sabahHaberleri.push(yeniTrend.haber);

    // Gecikmeli etkiler (sikayet kayitlari sabah kartina donusur, burada islenmez)
    G.olaylar.bekleyenEtkileriIsle(state);

    // Konsinye suresi dolanlar sahibine gider (Adim 19)
    G.konsinye.sureKontrol(state);

    // Vadesi gelen cekler (Adim 21)
    G.cek.vadeKontrol(state);

    // Ticaret Mudurlugu yazisi (Adim 22)
    G.belge.yaziGeldiMi(state);

    // Sahte ilan donemi surdukce itibar her gun erir (tasarim/04 §6)
    if (state.bayraklar.sahteIlanGun > 0) {
      state.bayraklar.sahteIlanGun--;
      G.durum.itibarDegis(state, c.SAHTE_ILAN_ITIBAR);
      state.sabahHaberleri.push(
        "Sahte ilan hâlâ dolaşıyor: itibar " + c.SAHTE_ILAN_ITIBAR +
        (state.bayraklar.sahteIlanGun > 0 ? " (" + state.bayraklar.sahteIlanGun + " gün daha)" : " (bugün bitti)")
      );
    }

    if (state.bayraklar.nuriSakin > 0) state.bayraklar.nuriSakin--;

    // Nuri dun sinirlendiyse bugun ablasinin yaninda (tasarim/05)
    if (G.karakterler.nuriYokMu(state)) {
      state.sabahHaberleri.push("Nuri bugün ablasının yanında. Pazarlığa Drej girecek.");
    } else if (state.bayraklar.nuriYokGun === state.gun - 1 && state.gun > 1) {
      state.sabahHaberleri.push("Nuri döndü, gönlü yapılmış.");
    }

    // Eski ilanlar yaslanir, bir kismi satilir
    for (var i = state.ilanlar.length - 1; i >= 0; i--) {
      state.ilanlar[i].ilanYasi++;
      if (G.rng.sans(c.ILAN_SATILMA_OLASILIGI)) {
        state.ilanlar.splice(i, 1);
      }
    }

    // Dun masadan kalkip bugun donen saticilar
    while (state.geriDonenler.length > 0) {
      var donen = state.geriDonenler.pop();
      if (state.ilanlar.length < c.MAKS_ILAN) {
        state.ilanlar.push(donen);
        // Sabit cumle yerine saticinin kendi agzi (data/replikler.js geriDonus havuzu)
        state.sabahHaberleri.push(donen.marka + " " + donen.model + " satıcısı geri döndü: \"" +
          G.pazarlik.saticiRepligi(donen, "geriDonus") + "\"");
      }
    }

    // Yeni ilanlar
    var yeniSayi = G.rng.tam(c.GUNLUK_ILAN_MIN, c.GUNLUK_ILAN_MAKS);
    for (var j = 0; j < yeniSayi; j++) {
      if (state.ilanlar.length >= c.MAKS_ILAN) break;
      state.ilanlar.push(G.araba.ilanUret(state, "ilan"));
    }

    // Kro'nun getirdigi ilan (tasarim/05)
    var kroIlani = G.karakterler.kroSabah(state);
    if (kroIlani) {
      state.sabahHaberleri.push(
        G.rng.sec(G.data.replikler.kro.sabahIlani) + " (" + G.araba.adi(kroIlani) + ")"
      );
      if (G.karakterler.tuhaflikSezildiMi(kroIlani)) {
        state.sabahHaberleri.push("Drej: " + G.rng.sec(G.data.replikler.drej.tuhaflik));
      }
    }

    // Musteriler
    G.musteri.bekleyenleriEskit(state);
    var geri = G.musteri.geriGelenleriIsle(state);
    var gelen = G.musteri.musteriGelisleri(state);
    state.beklemeBonusu = 0;

    var k;
    for (k = 0; k < geri.length; k++) {
      state.sabahHaberleri.push(geri[k].isim + " geri geldi, arabayı yine soruyor.");
    }
    for (k = 0; k < gelen.length; k++) {
      state.sabahHaberleri.push(gelen[k].isim + " geldi (" + G.musteri.tipAdi(gelen[k].tip) + ").");
    }
    if (state.sabahHaberleri.length === 0) {
      state.sabahHaberleri.push(G.data.replikler.gunNotu.sakin);
    }

    state.aksiyon = c.GUNLUK_AKSIYON;

    // Sabah fazi: once hikaye sahnesi (varsa), sonra gunun olay karti
    G.olaylar.sabahKartiniHazirla(state);
    state.faz = "sabah";
    state.ekran = "olay";
    G.hikaye.sabah(state);          // sahne varsa ekrani "hikaye"ye alir, bitince "olay"a doner

    kaybettiMi(state);
    return state;
  }

  // ---- mesai ----
  function aksiyonHarca(state, adet) {
    var n = adet === undefined ? 1 : adet;
    if (state.aksiyon < n) return false;
    state.aksiyon -= n;
    return true;
  }

  // Ayni ilana ayni gun ikinci kez girmek bedava (tasarim/01: pazarlik ayni aksiyonun icinde)
  function ilanaGit(state, arabaId) {
    if (state.bitis) return { hata: "Oyun bitti ortak." };
    if (state.bugunGezilen.indexOf(arabaId) !== -1) return { tamam: true, bedava: true };
    if (state.aksiyon < 1) return { hata: "Bugün aksiyon hakkın kalmadı ortak." };
    state.aksiyon--;
    state.bugunGezilen.push(arabaId);
    return { tamam: true };
  }

  // ---- aksam ----
  function gunuBitir(state) {
    var c = C();

    // Aksamda cozulecek etkiler (ornek: dukkan Kro'ya emanet) rapordan once isler
    G.olaylar.aksamEtkileriIsle(state);

    // Kart ortada kaldiysa (oyuncu bakmadan gunu bitirdiyse) kart duser, etkisi islemez
    if (state.aktifKart) {
      state.aktifKart = null;
      state.gunNotlari.push("Sabah kartına bakılmadı.");
    }
    // Kullanilmayan her hak ertesi gun musteri sansina +%5 (tasarim/01)
    state.beklemeBonusu = state.aksiyon * c.BEKLEME_BONUSU;

    var rapor = {
      gun: state.gun,
      alis: 0, alisAdet: 0,
      satis: 0, satisAdet: 0,
      masraf: 0,
      vergi: 0,
      kar: 0,
      sabitGider: c.SABIT_GIDER,
      notlar: state.gunNotlari.slice(),
      beklemeBonusu: state.beklemeBonusu
    };

    for (var i = 0; i < state.defter.length; i++) {
      var d = state.defter[i];
      if (d.gun !== state.gun) continue;
      if (d.tur === "alis") {
        rapor.alis += d.fiyat;
        rapor.alisAdet++;
        rapor.masraf += d.masraf;
      } else {
        rapor.satis += d.fiyat;
        rapor.satisAdet++;
        rapor.vergi += d.masraf;
        rapor.kar += (d.kar || 0);
      }
    }

    // Gun sonunda itibar 50'den farkliysa 5 gunde bir 1 puan 50'ye yaklasir (tasarim/04 §6)
    if (state.gun % c.ITIBAR_DRIFT_GUN === 0 && state.itibar !== c.ITIBAR_HEDEF) {
      var yon = state.itibar > c.ITIBAR_HEDEF ? -1 : 1;
      G.durum.itibarDegis(state, yon * c.ITIBAR_DRIFT_MIKTAR);
      rapor.itibarKaymasi = yon * c.ITIBAR_DRIFT_MIKTAR;
    }

    rapor.itibarBasi = state.gunBasiItibar;
    rapor.itibarSon = state.itibar;

    state.kasa -= c.SABIT_GIDER;
    rapor.kasa = state.kasa;
    rapor.netVarlik = G.durum.netVarlik(state);
    rapor.gunlukNet = rapor.kar - c.SABIT_GIDER;

    if (rapor.gunlukNet < 0) rapor.drejYorumu = G.data.replikler.gunNotu.zarar;
    rapor.ozet = gunOzetKelimesi(state, rapor);

    state.sonRapor = rapor;
    state.faz = "aksam";
    state.ekran = "rapor";

    if (!kaybettiMi(state) && state.gun >= c.GUN_SAYISI) {
      bitir(state, "son");
    }
    return rapor;
  }

  // Akşam kapagindan sonra "Sizce?": yarinin karti onceden cekilir (tasarim/06)
  function raporKapat(state) {
    if (state.bitis) {
      state.ekran = "bitti";
      return state;
    }
    G.olaylar.yarinkiKartiCek(state);
    state.faz = "sizce";
    state.ekran = "sizce";
    return state;
  }

  // "Sizce?" cevabi: olasilik kaydirmasi kurulur ve yeni gun baslar
  function sizceSec(state, sira) {
    if (state.faz !== "sizce") return { hata: "Sizce fazı değil." };
    G.olaylar.sizceUygula(state, sira);
    state.gun++;
    sabah(state);
    return state;
  }

  // tasarim/07 — akşam kapaginin tek kelimelik basligi
  function gunOzetKelimesi(state, rapor) {
    var notlar = rapor.notlar.join(" ");
    if (state.kasa < 0) return "BATTIK";
    if (notlar.indexOf("Şikâyet") !== -1) return "ŞİKÂYET";
    if (notlar.indexOf("yakaladı") !== -1) return "YAKALANDIK";
    if (notlar.indexOf("Fazla verdik") !== -1) return "KAZIK";
    if (rapor.gunlukNet >= C().GUN_OZETI_BEREKET_ESIK) return "BEREKET";
    if (rapor.satisAdet === 0 && rapor.alisAdet === 0) return "SESSİZ";
    // Alis bir masraf degil, tezgaha mal girmesidir: o gunun hikayesi alistir
    if (rapor.satisAdet === 0 && rapor.alisAdet > 0) return "ALDIK";
    if (rapor.gunlukNet < 0) return "EKSİDEYİZ";
    return "SATTIK";
  }

  // ---- bitis ----
  function kaybettiMi(state) {
    if (state.bitis) return true;
    if (state.kasa < 0) { bitir(state, "batti"); return true; }
    if (state.itibar <= C().ITIBAR_MIN) { bitir(state, "itibarsiz"); return true; }
    return false;
  }

  // tasarim/01 — kazanma, kaybetme, unvan
  function bitir(state, tur) {
    var c = C();
    var netVarlik = G.durum.netVarlik(state);
    var stokDegeri = netVarlik - state.kasa;
    // Hedef bir sayi degil, dukkanin kendisi: mal sahibi otuz gun sure verdi (prolog).
    var basliklar = {
      batti: "Battık ortak. Dükkân elden gitti.",
      itibarsiz: "Kimse kapıdan girmiyor. Dükkân elden gitti.",
      son: netVarlik >= c.HEDEF_NET_VARLIK
        ? "Dükkân bizim ortak!"
        : "Otuz gün bitti. Kepengi başkası açacak."
    };
    state.bitis = {
      tur: tur,
      baslik: basliklar[tur] || "Oyun bitti.",
      netVarlik: netVarlik,
      kasa: state.kasa,
      stokDegeri: Math.round(stokDegeri),
      stokAdet: state.stok.length,
      hedef: c.HEDEF_NET_VARLIK,
      fark: netVarlik - c.HEDEF_NET_VARLIK,
      gun: state.gun,
      kazandi: tur === "son" && netVarlik >= c.HEDEF_NET_VARLIK,
      unvan: G.unvanBul(netVarlik),
      tohum: state.tohum
    };
    state.faz = "bitti";
    state.ekran = state.ekran === "rapor" ? "rapor" : "bitti";
  }

  function oyunBittiMi(state) {
    return !!state.bitis;
  }

  return {
    sabah: sabah,
    gunuBitir: gunuBitir,
    raporKapat: raporKapat,
    sizceSec: sizceSec,
    gunOzetKelimesi: gunOzetKelimesi,
    ilanaGit: ilanaGit,
    aksiyonHarca: aksiyonHarca,
    kaybettiMi: kaybettiMi,
    oyunBittiMi: oyunBittiMi
  };
})();
