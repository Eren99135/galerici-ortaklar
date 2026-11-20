// config.js — butun denge sayilari burada. Mantik dosyalarinda ciplak sayi olmaz.
// Kaynak: context/tasarim/01-04, kararlar #3 ve #10.
window.G = window.G || {};

G.config = {
  // ---- tasarim/01 Oyun dongusu ----
  OYUN_ADI: "Galerici Ortaklar",
  GUN_SAYISI: 30,
  BASLANGIC_KASA: 6000000,
  BASLANGIC_ITIBAR: 50,
  HEDEF_NET_VARLIK: 7500000,        // karar #10
  GUNLUK_AKSIYON: 3,
  KAPASITE: 4,
  SABIT_GIDER: 8000,
  MAKS_MUSTERI: 3,
  MUSTERI_BEKLEME_GUN: 2,
  ILAN_SATILMA_OLASILIGI: 0.35,
  BEKLEME_BONUSU: 0.05,             // kullanilmayan her aksiyon icin musteri sansi
  NET_VARLIK_STOK_ORANI: 0.90,
  UNVANLAR: [
    { esik: 8500000, ad: "Sanayinin Krali" },
    { esik: 7500000, ad: "Usta" },
    { esik: 6800000, ad: "Galerici" },
    { esik: -Infinity, ad: "Cirak" }
  ],

  // ---- tasarim/02 Arabalar ve kusurlar ----
  FIYAT_OYNAMA: 0.08,               // her ilanda +-%8
  YIL_ETKISI: 0.03,                 // yil basina +-%3
  KM_YILLIK: 15000,                 // beklenen km = (2026 - yil) * bu
  KM_ADIM: 20000,
  KM_ETKISI: 0.01,                  // her KM_ADIM sapmada -+%1
  SIMDIKI_YIL: 2026,
  YUVARLAMA: 10000,
  KUSUR_ETKILERI: {
    boya: 0.015,                    // piyasa x
    degisen: 0.03,                  // piyasa x
    tramer: 0.6,                     // tramer tutari x
    lastik: 20000,                   // sabit TL
    motor: 0.08,                     // piyasa x
    agirHasar: 0.25,                 // piyasa x
    sase: 0.45                       // piyasa x (araba satilamaz, hurda cikisi %55)
  },
  TRAMER_MIN: 20000,
  TRAMER_MAKS: 120000,
  LASTIK_OLASILIGI: 0.15,
  PARCALAR: [
    "kaput", "tavan", "bagaj kapagi",
    "sol on camurluk", "sag on camurluk",
    "sol arka camurluk", "sag arka camurluk",
    "sol on kapi", "sag on kapi",
    "sol arka kapi", "sag arka kapi"
  ],
  // Faz 3 — satici personalari (Eren'in 12. maddesi).
  // Persona satici tipinin (durust/abartici/dolandirici) yerine gecmez, ustune biner:
  // tipi ne kadar olasi oldugunu, pazarlikta ne kadar kirildigini, sabrini, dusuk itibara
  // tahammulunu ve kiminle iyi anlastigini belirler.
  //   tabanCarpani     : satici tabanini carpar. 1'in ustu "kirmiyor", alti "kiriliyor".
  //   sabirEk          : pazarlik sabrina eklenir
  //   itibarDuyarlilik : itibar ITIBAR_SABIR_ESIK altindaysa sabirdan bu kadar duser
  //   tipAgirlik       : satici tipi cekilisinde bu persona icin agirlik carpanlari
  //   gururlu          : agir hakarete masadan kalkarak cevap verir
  //   hesapCarpani     : Drej'in "Hesap" araligini carpar. Memur ve kurumsal okunakli
  //                      (dar aralik), piyasaci blof yapar (genis aralik)
  //   ortak            : hangi ortakla konusulursa sabra ne eklenir (Faz 3, madde 3)
  PERSONALAR: {
    piyasaci: {
      ad: "piyasacı", tanim: "Ağzı kalabalık, lafı uzatır, kusuru küçültür",
      tabanCarpani: 0.995, sabirEk: 1, itibarDuyarlilik: 1,
      tipAgirlik: { durust: 0.6, abartici: 1.4, dolandirici: 1.5 },
      gururlu: true, hesapCarpani: 1.6,
      ortak: { nuri: 1, drej: -1, kro: 0 }
    },
    elit: {
      ad: "kurumsal", tanim: "Mesafeli, fiyat kırmaz, adı kötüye çıkmışla oturmaz",
      tabanCarpani: 1.02, sabirEk: -1, itibarDuyarlilik: 3,
      tipAgirlik: { durust: 1.4, abartici: 0.9, dolandirici: 0.5 },
      gururlu: true, hesapCarpani: 0.7,
      ortak: { nuri: -1, drej: 1, kro: -2 }
    },
    memur: {
      ad: "memur", tanim: "Kuralcı, temkinli, belgesi tam, fiyatta esnemez",
      tabanCarpani: 1.01, sabirEk: 0, itibarDuyarlilik: 1,
      tipAgirlik: { durust: 1.5, abartici: 0.9, dolandirici: 0.4 },
      gururlu: false, hesapCarpani: 0.7,
      ortak: { nuri: 0, drej: 1, kro: -1 }
    },
    esnaf: {
      ad: "esnaf", tanim: "Hesabını bilir, çabuk karar verir, vakit kaybetmez",
      tabanCarpani: 0.99, sabirEk: -1, itibarDuyarlilik: 0,
      tipAgirlik: { durust: 1.1, abartici: 1.1, dolandirici: 0.8 },
      gururlu: false, hesapCarpani: 1.0,
      ortak: { nuri: 1, drej: 0, kro: 1 }
    },
    caylak: {
      ad: "çaylak", tanim: "İlk arabası, piyasayı bilmez, duygusal davranır",
      tabanCarpani: 0.98, sabirEk: 1, itibarDuyarlilik: 0,
      tipAgirlik: { durust: 1.4, abartici: 1.0, dolandirici: 0.5 },
      gururlu: false, hesapCarpani: 1.2,
      ortak: { nuri: 1, drej: -1, kro: 1 }
    },
    cifci: {
      ad: "çiftçi", tanim: "Sabırlı, lafı uzatır, aracı işine göre konuşur",
      tabanCarpani: 1.00, sabirEk: 2, itibarDuyarlilik: 0,
      tipAgirlik: { durust: 1.2, abartici: 1.0, dolandirici: 0.7 },
      gururlu: false, hesapCarpani: 1.3,
      ortak: { nuri: 0, drej: 0, kro: 1 }
    }
  },
  // Modelin kendi personasi bu olasilikla cikar, kalaninda rastgele baska biri satiyordur.
  PERSONA_SADAKAT: 0.72,

  // Faz 4 — ogretici oynanis (madde 8). Gercek oyunun kendisi oynatilir; fark su:
  // tohum sabit, ilk ilan affedici, rehber acik ve sonunda oyun temiz basliyor.
  TUTORIAL_TOHUM: 20261119,
  TUTORIAL_GUN: 2,                  // bu gun bitince ogretici kapanir
  TUTORIAL_ILAN_INDIRIM: 0.92,      // ilk ilan piyasanin altinda: ilk alis kolay olsun

  SATICI_ORANLARI: { durust: 0.40, abartici: 0.45, dolandirici: 0.15 },
  // durust satici GERCEK degerin ustune ister, digerleri PIYASA degerinin ustune
  SATICI_FIYAT: {
    durust: { taban: "gercek", min: 1.03, maks: 1.08 },
    abartici: { taban: "piyasa", min: 1.00, maks: 1.08 },
    dolandirici: { taban: "piyasa", min: 0.82, maks: 0.90 }
  },
  KUSUR_PROFILI: {
    durust: { boyaMin: 0, boyaMaks: 2, degisenOlasilik: 0, tramerOlasilik: 0.20, motorOlasilik: 0 },
    abartici: { boyaMin: 1, boyaMaks: 4, degisenOlasilik: 0.40, tramerOlasilik: 0.60, motorOlasilik: 0.20 },
    dolandirici: { boyaMin: 1, boyaMaks: 4, degisenOlasilik: 0.40, tramerOlasilik: 0.60, motorOlasilik: 0.20 }
  },
  DEGISEN_MIN: 1,
  DEGISEN_MAKS: 2,
  SASE_OLASILIGI: 0.40,             // dolandiricida; kalan %60 agir hasar
  GUNLUK_ILAN_MIN: 3,
  GUNLUK_ILAN_MAKS: 4,
  MAKS_ILAN: 6,
  // Polis: Kro'nun hiz cezasi (dizide 19. bolum)
  HIZ_CEZASI: 9500,
  HIZ_CEZASI_ERKEN: 0.75,           // pesin odemede dortte uc
  HIZ_ITIRAZ_SANS: 0.35,            // itiraz tutarsa ceza silinir
  HIZ_ITIRAZ_GECIKME: [3, 5],       // tutmazsa kac gun sonra tam tutar

  // Adim 22 — yetki belgesi (tasarim/14): sinav, baraj, belgesiz satis cezasi
  SINAV_BEDEL: 15000,
  SINAV_SORU: 5,
  SINAV_BARAJ: 70,                  // yuzde
  SINAV_BEKLEME: 4,                 // kalinca kac gun sonra tekrar
  BELGE_YAZI_GUN: 5,                // Ticaret Mudurlugu yazisi bu gun gelir
  BELGE_ITIBAR: 5,
  BELGESIZ_DENETIM: 0.12,           // her belgesiz satista denetim ihtimali
  BELGESIZ_CEZA: 400000,
  BELGESIZ_ITIBAR: -4,

  // Adim 21 — cek ve aval (tasarim/13): vadeli odeme, karsiliksiz cikma riski
  CEK_OLASILIK: 0.14,               // musterinin cekle odemek istemesi
  CEK_PRIM: [0.07, 0.13],           // cekle alan piyasanin ustune fark verir
  CEK_VADE: [4, 9],                 // kac gun sonra odenecek
  CEK_RISK_ORANLARI: { dusuk: 0.45, orta: 0.35, yuksek: 0.20 },
  CEK_KARSILIKSIZ: { dusuk: 0.04, orta: 0.30, yuksek: 0.70 },
  CEK_SORGU_BEDEL: 5000,            // Kro karekodu okutur, riski gosterir
  CEK_YANIK_ITIBAR: -6,
  ICRA_MASRAFI: 25000,
  AVAL_PAY: 0.12,                   // Riza aval verirse satistan aldigi pay
  AVAL_KARSILAMA: 0.50,             // cek yanarsa zararin ne kadarini karsilar

  // Adim 20 — takas (tasarim/12): musteri parayla degil arabayla gelir
  TAKAS_OLASILIK: 0.22,             // musterinin yaninda arabasiyla gelme ihtimali
  TAKAS_ABARTICI_ORAN: 0.65,        // takas arabasinin "abartici" profilde uretilme orani
  TAKAS_BEKLENTI: [0.90, 1.00],     // galeriye verirken kiymetinin altina razi olur
  TAKAS_RED_ESIK: 0.88,             // bunun altinda bicersen musteri bozulur
  TAKAS_ANLASMA_SABIR: 1,           // takas anlasinca musteri rahatlar

  // Adim 19 — konsinye (tasarim/11): araba sahibinde kalir, komisyon alinir
  KONSINYE_OLASILIK: { durust: 0.30, abartici: 0.12, dolandirici: 0 },
  KONSINYE_NET: [0.98, 1.03],       // sahibin istedigi net, bilinen degere oran
  KONSINYE_KOZ_ORAN: 0.5,           // kozla netten dusulen kusur payi
  KONSINYE_SURE: 8,                 // kac gun tezgahta kalir
  KONSINYE_UYARI_GUN: 2,            // kac gun kala sahibi aramaya baslar

  // Adim 18 — sehir disi seferler (tasarim/10)
  SEFER_SECENEK: 3,                 // gunde kac sehir onerilir
  SEFER_PAZARLIK: 2,                // seferde kac ilana gidilebilir
  SEFER_BEKLEME: 5,                 // iki sefer arasi en az kac gun
  SEFER_SON_GUN: 2,                 // son kac gunde sefere cikilmaz
  SEFER_EN_AZ_KASA: 300000,         // bu kasanin altinda sefere cikilmaz
  SEFER_ABARTICI_CARPAN: 1.3,       // seferde abartici satici agirligi
  SEFER_SATILMIS_OLASILIK: 0.25,    // ilanlardan biri biz varmadan satilmis olabilir
  SEFER_YEMEK_SABIR: 1,             // yemek molasindan sonra pazarlikta sabir +1

  // Yedek renk listesi: data/modeller.js icinde renk yazmayan bir model gelirse kullanilir.
  // Kataloga renk eklendi (Adim 23), normalde buraya dusulmuyor.
  RENKLER: ["beyaz", "siyah", "gri", "lacivert", "mavi", "kırmızı", "gümüş", "füme",
            "bordo", "kahverengi", "bej"],

  // ---- tasarim/03 Ekspertiz ve alis pazarligi ----
  EKSPERTIZ: {
    goz:      { ad: "Goz kontrolu", bedel: 0,     acik: 1.00, normal: 0.30, gizli: 0.00 },
    normal:   { ad: "Normal ekspertiz", bedel: 7500,  acik: 1.00, normal: 1.00, gizli: 0.50 },
    premium:  { ad: "Premium ekspertiz", bedel: 15000, acik: 1.00, normal: 1.00, gizli: 0.95 },
    tanidik:  { ad: "Saticinin tanidigi ekspertiz", bedel: 0, acik: 1.00, normal: 0.20, gizli: 0.00 }
  },
  TABAN_R: {
    durust: [0.91, 0.95],
    abartici: [0.84, 0.90],
    dolandirici: [0.88, 0.93]
  },
  SABIR: { durust: 4, abartici: 3, dolandirici: 5 },
  ILAN_YASI_INDIRIM: 0.01,          // her 5 gun ilan yasi icin taban -%1
  ILAN_YASI_ADIM: 5,
  KOZ_CELISKI_ORAN: 0.8,
  KOZ_SOYLENMIS_ORAN: 0.3,
  KOZ_SABIR_MALIYETI: 1,
  DOLANDIRICI_KOZ_SABIR: 2,         // dolandirici kozu tanimaz, sadece sinirlenir
  TABAN_ALT_SINIR: 0.80,            // taban, gercek degerin %80'inin altina inmez
  HAKARET_ESIK: 0.85,
  HAKARET_ILK_TEKLIF_MUAF: true,    // karar #19: ilk teklif hakaret sayilmaz
  KARSI_ADIM: 0.4,
  HAKARET_KARSI_ARTIS: 1.01,
  // Faz 3 (madde 4): hakaretin ikinci kademesi. Tabanin bu kadar altindaki teklif
  // "cok ucuz" degil, dogrudan asagilama sayilir; gururlu persona masadan kalkar.
  HAKARET_AGIR_ESIK: 0.62,
  HAKARET_AGIR_SABIR: 3,
  FAZLA_VERDIK_ESIK: 1.04,
  GERI_DONME_OLASILIGI: 0.5,
  GERI_DONUS_TABAN: 0.98,
  GERI_DONUS_SABIR: 2,
  NOTER_PLAKA: 12000,
  TEKLIF_ADIMI: 10000,
  TEKLIF_BUYUK_ADIM: 50000,
  // karar #13 — transkript bulgusu 1: pazarlik "ortasi"yla biter
  ORTASI_ESIK: 0.03,
  // karar #13 — transkript bulgusu 2: "kalkiyoruz" blofu
  KALK_GERI_CAGIRMA: { durust: 0.40, abartici: 0.65, dolandirici: 0.55 },
  KALK_TABAN_INDIRIM: 0.03,
  KALK_KARSI_ADIM: 0.5,
  KALK_SABIR: 1,

  // ---- tasarim/04 Satis, masraflar, itibar ----
  ILAN_FIYAT_ONERI: 1.08,
  MUSTERI_P_TABAN: 0.35,
  MUSTERI_P_US: 4,
  MUSTERI_P_MAKS: 0.9,
  ITIBAR_CARPAN_TABAN: 0.6,
  ITIBAR_CARPAN_BOLEN: 125,
  MUSTERI_TIPLERI: {
    pazarlikci: { oran: 0.45, butceMin: 1.059, butceMaks: 1.109, sabir: 4, ekspertiz: "normal", ekspertizYokOlasilik: 0 },
    aceleci:    { oran: 0.30, butceMin: 1.089, butceMaks: 1.149, sabir: 2, ekspertiz: "normal", ekspertizYokOlasilik: 0.30 },
    titiz:      { oran: 0.25, butceMin: 1.069, butceMaks: 1.129, sabir: 3, ekspertiz: "premium", ekspertizYokOlasilik: 0 }
  },
  // Faz 2 — kusur yuku: musterinin gordugu kusurlarin agirligi (0 temiz .. 1 hurda gibi).
  // Her kusur piyasa degerine oranla bir "bozma payi" uretir, paylar carpimsal birikir.
  // Boylece iki kucuk kusur bir agir kusura esit olmaz ve toplam 1'i gecmez.
  KUSUR_YUK_CARPAN: 2.6,            // etki/piyasa oranini bozma payina cevirir
  KUSUR_YUK_TAVAN: 0.55,            // tek bir kusurun en fazla bozabilecegi oran
  // Yuk dogrudan degil, karesi uygulanir: tek boyali kapi pazari soğutmaz, ama
  // ustuste binen kusurlar hizla cezalandirir. "Cok sorunlu araba zor satilsin" maddesi
  // bunu istiyordu, "her araba biraz daha zor satilsin" degil.
  KUSUR_YUK_US: 2,
  KUSUR_GELME_ETKI: 0.95,           // baski musteri gelme olasiligini bu kadar kisar
  KUSUR_SABIR_ETKI: 2,              // baski 1'e yakinsa musteri iki sabir eksik oturur

  // Faz 2 — itibarin satis masasina etkisi
  ITIBAR_SABIR_ESIK: 35,            // altinda musteri bir sabir eksik gelir
  ITIBAR_SABIR_COK_DUSUK: 20,       // altinda iki eksik
  ITIBAR_EKSPERTIZ_ESIK: 40,        // altinda musteri ekspertizden vazgecmez
  ITIBAR_GUVENSIZ_ESIK: 35,         // altinda musteri govensiz agizla acar
  SATIS_SABIR_MIN: 1,               // sabir bunun altina inmez, yoksa gorusme hic baslamaz

  // Adim 17 — segment marji: ucuz arabanin yuzdesel kari yuksek, pahalininki dusuk.
  // Boylece "en pahaliyi al" baskin strateji olmaktan cikar, hangi arabaya gidecegin karar olur.
  SEGMENT_BUTCE: [
    { ustDeger: 600000,    carpan: 1.09 },
    { ustDeger: 1200000,   carpan: 1.03 },
    { ustDeger: 99000000,  carpan: 0.975 }
  ],
  ITIBAR_BUTCE_YUKSEK: { esik: 70, carpan: 1.03 },
  ITIBAR_BUTCE_DUSUK: { esik: 30, carpan: 0.95 },

  // ---- piyasa trendleri (data/trendler.js) ----
  // 4-5 gun suren mini talep dalgalari. Etki kasitli olarak kucuk: trend
  // "hangi arabayi alayim" sorusuna bir sebep daha eklesin, tek basina
  // kazandiran bir dugme olmasin. Sadece satis tarafina isliyor.
  TREND_SURE_MIN: 4,
  TREND_SURE_MAKS: 5,
  // Makas genis, orta nokta sabit: her trendin hem kazanani hem kaybedeni var
  // (data/trendler.js), yani toplam talep sismiyor — ama dogru tarafta olmak
  // fark ediyor. Carpanlari buyutmek kazanma oranini sismiyor, sadece "hangi
  // arabayi alayim" sorusunu gercek bir karar haline getiriyor.
  TREND_GELME: { artan: 1.18, azalan: 0.74 },   // musteri gelme olasiligi carpani
  TREND_BUTCE: { artan: 1.012, azalan: 0.978 }, // musteri butcesi carpani
  DURUST_ITIBAR: 3,
  YAKALANMA_OLASILIKLARI: { normal: 0.70, gizli: 0.40, acik: 0.90 },
  YAKALANMA_TITIZ_BONUS: 0.25,
  YAKALANMA_ITIBAR: -8,
  SIKAYET_GECIKME_MIN: 3,
  SIKAYET_GECIKME_MAKS: 7,
  SIKAYET_CARPAN: 1.5,
  SIKAYET_ITIBAR: -12,
  SATIS_ACILIS: [0.88, 0.93],
  SATIS_ADIM: 0.4,
  KAZIK_ESIK: 1.10,
  MUSTERI_GERI_GELME: 0.30,
  MUSTERI_GERI_GUN: 2,
  TAVIZ: { bedel: 20000, sabir: 1, tavan: 10000, etiket: "Lastikler bizden" },
  VERGI_ORANI: 0.20,
  SASE_HURDA_ORAN: 0.55,
  ITIBAR_MIN: 0,
  ITIBAR_MAKS: 100,
  // Adim 6 — itibarin kendi hareketi (tasarim/04 §6)
  ITIBAR_HEDEF: 50,
  ITIBAR_DRIFT_GUN: 5,              // her 5 gunde bir 50'ye dogru 1 puan
  ITIBAR_DRIFT_MIKTAR: 1,
  SAHTE_ILAN_ITIBAR: -3,            // sahte ilan donemi, cozulene kadar gunluk
  HAYIR_ISI_ITIBAR: 2,
  KRO_KAVGA_ITIBAR: -5,

  // ---- Adim 7: karakterler (tasarim/05) ----
  AGIZ_TABAN_INDIRIM: 0.03,         // Nuri "Agiz": alista taban -%3
  AGIZ_TAVAN_ARTIS: 0.03,           // satista tavan +%3
  NURI_SINIR_OLASILIK: 0.20,        // acik karar A3: %20
  NURI_SAKIN_GUN: 2,                // karar #19: ilk iki gun Nuri sinirlenmez
  NURI_SINIR_OLASILIK_KIZGIN: 0.40, // hakaret ya da kazik turundan sonra
  HESAP_ARALIK: 0.04,               // Drej "Hesap": +-%4 aralik
  KRO_SABAH_OLASILIK: 0.50,         // Kro sabah ekstra ilan getirir
  KRO_FIRSAT_ORANI: 0.60,           // getirdigi ilanin gercek firsat olma orani
  KRO_FIRSAT_FIYAT: [0.90, 0.95],   // firsat ilaninda piyasa carpani
  KRO_SATIS_SABIR: 1,               // Kro gorusmeye girerse musteri sabri +1
  DREJ_TUHAFLIK_OLASILIK: 0.40,     // Kro'nun dolandirici ilanini sezme sansi

  // ---- Adim 8: olay kartlari (tasarim/06) ----
  SAKIN_GUN_AGIRLIK: 4,
  SIZCE_KAYDIRMA: 0.20,            // "Sizce?" secimi olasiligi bu kadar kaydirir
  GUN_OZETI_BEREKET_ESIK: 50000,   // akşam kapaginda "BEREKET" yazacak gunluk net
  BEREKET_INDIRIM: 0.02,           // Cuma karti: sonraki alista taban -%2
  VERGI_INDIRIMLI_ORAN: 0.15,      // Mali musavir karti
  RIZA_SABIR: 5,                   // Riza'nin ilani kolay kalkmaz
  UCUZ_ILAN_ORAN: 0.80,            // Kro'nun tuttugu teklif: piyasa x 0,80, pazarliksiz
  ORTULEN_KM_FARK_OLASILIK: 0.50,  // ortulen kilometreyi titiz musteri fark eder
  ORTULEN_KM_ITIBAR: -5,

  // ---- kayit ----
  KAYIT_ANAHTARI: "galerici_kayit_v14",
  SURUM: 14
};
