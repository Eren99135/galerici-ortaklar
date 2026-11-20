// data/rehber.js — baslangic rehberi ve her ekranin "?" yardim metni.
// Karar #15 + Adim 16: baloncukta en fazla 12 kelime (metin), uzun aciklama `yardim`
// alaninda durur ve o ekranin "?" kartinin sonuna eklenir.
// Adim koşullari gercek olaylara bagli: ilan fiyati adimi ancak araba alininca gelir.
window.G = window.G || {};
G.data = G.data || {};

var rehberYardimcilari = (function () {
  return {
    ekspertizYapildiMi: function (state) {
      var liste = state.ilanlar.concat(state.stok);
      for (var i = 0; i < liste.length; i++) {
        if (liste[i].ekspertizSeviyesi) return true;
      }
      return false;
    }
  };
})();

G.data.rehberAdimlari = [
  {
    id: "kart",
    kim: "drej",
    ifade: "normal",
    ekran: "olay",
    metin: "Gün kartla başlar. Oku, bir seçenek tıkla.",
    yardim: "Her gün bir olay kartıyla açılır. Bazı kartlarda seçim yaparsın; seçimin kasaya, itibara, aksiyon hakkına ya da sonraki günlere dokunabilir.",
    kosul: function (s) { return s.faz !== "sabah"; }
  },
  {
    id: "ilanlar",
    kim: "nuri",
    ifade: "normal",
    ekran: "dukkan",
    metin: "Tezgâh boş durmaz. İlanlara bak ortak.",
    yardim: "Günde üç aksiyon hakkın var. İlan listesine bakmak bedava, bir ilana girmek bir hak harcar. Aynı gün aynı ilana dönmek yine bedava.",
    kosul: function (s) { return s.ekran === "ilanlar" || s.bugunGezilen.length > 0; }
  },
  {
    id: "ilanaGit",
    kim: "drej",
    ifade: "normal",
    ekran: "ilanlar",
    metin: "Bir ilana gir. Göz kontrolü bedava.",
    yardim: "Göz kontrolü gözle görünen kusurları ortaya çıkarır. Tırnak içindeki cümle satıcının iddiasıdır, doğru olmak zorunda değil. Piyasanın çok altındaki ilandan şüphelen.",
    kosul: function (s) { return s.bugunGezilen.length > 0; }
  },
  {
    id: "ekspertiz",
    kim: "drej",
    ifade: "normal",
    ekran: "araba",
    metin: "Ekspertizsiz erebe alınmaz ortak.",
    yardim: "Normal ekspertiz 7.500 TL, gizli kusurun yarısını bulur. Premium 15.000 TL, neredeyse hepsini. Satıcının tanıdığı ekspertiz bedavadır ama neredeyse hiçbir şey bulmaz.",
    kosul: function (s) { return rehberYardimcilari.ekspertizYapildiMi(s) || s.istatistik.alinan > 0; }
  },
  {
    id: "konusan",
    kim: "nuri",
    ifade: "normal",
    ekran: "araba",
    metin: "Pazarlığa ben gireyim, satıcıyı ben yorarım.",
    yardim: "Nuri konuşursa satıcının sabrı +1 olur. Drej konuşursa kusurların TL toplamını görürsün ama sabır -1. Seçim her pazarlıkta yeniden yapılır.",
    kosul: function (s) { return s.aktifPazarlik !== null || s.istatistik.alinan > 0; }
  },
  {
    id: "koz",
    kim: "drej",
    ifade: "normal",
    ekran: "pazarlik",
    metin: "Çıkan kusuru yüzüne vur, taban insin.",
    yardim: "İddiasıyla çelişen kusur tabanı ciddi düşürür; baştan söylediği kusur az düşürür. Dolandırıcı kozu tanımaz, orada doğru hamle masadan kalkmaktır.",
    kosul: function (s) {
      var p = s.aktifPazarlik;
      return (p && (p.kullanilanKozlar.length > 0 || p.gecmis.length >= 2)) ||
        s.istatistik.alinan > 0 || s.istatistik.kalkanSatici > 0;
    }
  },
  {
    id: "teklif",
    kim: "nuri",
    ifade: "normal",
    ekran: "pazarlik",
    metin: "Rakamı söyle. İlk teklifte masa dağılmaz.",
    yardim: "Satıcının tabanı gizlidir, sadece ruh hâlini görürsün. İlk teklifin hakaret sayılmaz; sonrakilerde fazla kırarsan sabrı biter ve kalkar. İki rakam yakınsa ortasını söyler.",
    kosul: function (s) { return s.istatistik.alinan > 0 || s.istatistik.kalkanSatici > 0; }
  },
  {
    id: "ilanFiyati",
    kim: "drej",
    ifade: "normal",
    ekran: "dukkan",
    metin: "Aldığın arabaya ilan fiyatı koy.",
    yardim: "Düşük fiyat müşteriyi çabuk getirir ama kârı kemirir; yüksek fiyat arabayı tezgâhta bekletir. Fiyatı dükkân ekranından istediğin kadar değiştirebilirsin, hak harcamaz.",
    kosul: function (s) { return s.istatistik.alinan > 0 || s.gun > 3; }
  },
  {
    id: "gunuBitir",
    kim: "nuri",
    ifade: "normal",
    ekran: "dukkan",
    metin: "İşin bittiyse günü kapatalım.",
    yardim: "Gün bitince sabit gider 8.000 TL düşer. Kullanmadığın her aksiyon hakkı ertesi gün müşteri gelme şansına +%5 ekler.",
    kosul: function (s) { return s.faz === "aksam" || s.gun > 1; }
  },
  {
    id: "sizce",
    kim: "drej",
    ifade: "normal",
    ekran: "sizce",
    metin: "Yarına dair bir tahmin istiyorlar.",
    yardim: "Yarının kartı akşamdan çekilir ve soru o karta dairdir. Tahminin o kartın şansını ±%20 kaydırır; bazı kartlarda etkisi yoktur, sadece şaka sorusudur.",
    kosul: function (s) { return s.faz === "sizce" || s.gun > 1; }
  },
  {
    id: "musteri",
    kim: "drej",
    ifade: "normal",
    ekran: "dukkan",
    metin: "Müşteri geldi. Kusurları söyleyecek misin?",
    yardim: "Söylersen müşterinin bütçesi düşer ama satışta itibar +3. Saklarsan ekspertizde yakalanabilirsin (itibar -8) ya da günler sonra şikâyet gelir (para geri, itibar -12).",
    kosul: function (s) {
      return s.istatistik.satilan > 0 || s.istatistik.yakalanan > 0 || s.gun > 5;
    }
  }
];

// Her ekranin "?" yardimi
G.data.yardim = {
  dukkan: {
    baslik: "DÜKKÂN",
    satirlar: [
      "Üst barda gün, kasa, itibar ve kalan aksiyon hakkı durur.",
      "Tezgâh en fazla 4 araba tutar. İlan fiyatını buradan değiştirmek bedavadır.",
      "Müşteri şansı ilan fiyatına ve itibara bağlıdır; fiyatı düşürünce yükselir.",
      "Günü bitirmeden kalan her hak yarın müşteri şansına +%5 ekler."
    ]
  },
  ilanlar: {
    baslik: "İLANLAR",
    satirlar: [
      "Her sabah 3-4 yeni ilan gelir, listede en fazla 6 ilan durur.",
      "Tırnak içindeki cümle satıcının iddiasıdır; doğru olmak zorunda değil.",
      "Bir ilana girmek 1 hak harcar. Aynı gün aynı ilana dönmek bedavadır.",
      "Piyasanın belirgin altındaki fiyat genelde gizli bir kusur saklar."
    ]
  },
  araba: {
    baslik: "ARABA",
    satirlar: [
      "Rakam şeridi istenen fiyatı, kilometreyi ve bilinen kusurları gösterir.",
      "Kusur dökümünü \"Detay\" düğmesinden açabilirsin.",
      "Normal ekspertiz gizli kusurun %50'sini, premium %95'ini bulur.",
      "Satıcının tanıdığı ekspertiz bedavadır ama neredeyse hiçbir şey bulmaz."
    ]
  },
  olay: {
    baslik: "OLAY KARTI",
    satirlar: [
      "Gün bir kartla başlar. Bazı kartlarda seçim yaparsın.",
      "Seçimin kasaya, itibara, aksiyon hakkına ya da sonraki günlere dokunabilir.",
      "Dün akşam \"Sizce?\" sorusuna verdiğin cevap bu kartın şansını kaydırmış olabilir."
    ]
  },
  pazarlik: {
    baslik: "PAZARLIK",
    satirlar: [
      "Satıcının tabanı gizlidir; sadece ruh hâlini görürsün.",
      "Koz: ortaya çıkmış kusuru yüzüne vurur. Çelişen iddia tabanı ciddi düşürür.",
      "İlk teklifin hakaret sayılmaz; sonraki çok düşük teklifler sabrı iki yakar.",
      "\"Kalkıyoruz\" blöftür: satıcı arkandan seslenirse taban düşer, seslenmezse araba gider."
    ]
  },
  durustluk: {
    baslik: "DÜRÜSTLÜK SEÇİMİ",
    satirlar: [
      "Söyle: müşterinin bütçesi düşer ama satış olursa itibar +3.",
      "Sakla: bütçe yüksek kalır, ama ekspertiz bulursa pazarlık biter ve itibar -8.",
      "Yakalanmazsan bile günler sonra şikâyet gelebilir: para geri, itibar -12.",
      "Kro görüşmeye girerse kusurları kendisi söyler; saklama seçeneği kapanır."
    ]
  },
  satis: {
    baslik: "SATIŞ GÖRÜŞMESİ",
    satirlar: [
      "Müşterinin tavanı gizlidir. Tavanın az üstünde fiyat söylersen müşteri yükselir.",
      "Çok yüksek fiyat \"kazık\" sayılır, sabır iki düşer.",
      "\"Lastikler bizden\" tavizi 20.000 TL masrafla sabrı ve tavanı biraz artırır.",
      "Kâr = satış - alış - masraf. Pozitif kârın %20'si vergi olarak kesilir."
    ]
  },
  rapor: {
    baslik: "AKŞAM RAPORU",
    satirlar: [
      "Rakam şeridi kasayı, günün netini, net varlığı ve itibarı gösterir.",
      "Kalem kalem döküm \"Kasa dökümü\" düğmesinin altındadır.",
      "Başlıktaki tek kelime günün özetidir (BEREKET, KAZIK, EKSİDEYİZ...).",
      "İtibar 5 günde bir 50'ye doğru 1 puan kayar."
    ]
  },
  sizce: {
    baslik: "SİZCE?",
    satirlar: [
      "Yarının kartı çekildi; soru o karta dair.",
      "Tahminin kartın şansını ±%20 kaydırır. Bazı kartlarda etkisi yoktur.",
      "Seçimin ertesi sabah kart ekranında bir satırla anılır."
    ]
  },
  bitti: {
    baslik: "SONUÇ",
    satirlar: [
      "Net varlık = kasa + tezgâhtaki arabaların gerçek değerinin %90'ı.",
      "30. günün sonunda 7.500.000 TL ve üstü hedefi tutturur.",
      "Kasa eksiye düşerse ya da itibar sıfırlanırsa oyun o gün biter.",
      "Aynı tohumla tekrar oynarsan aynı ilanlar ve aynı kartlar gelir."
    ]
  },
  defter: {
    baslik: "DEFTER",
    satirlar: [
      "Bütün alış ve satışlar gün gün burada durur.",
      "Net kolonu satıştaki vergi sonrası kârı gösterir."
    ]
  }
};

// ---------------------------------------------------------------- Faz 4: hikaye ve karakterler
// Oyunun en basinda gosterilen giris ekrani ve "?" altindaki "Kim kimdir" sayfasi buradan okur.

G.data.hikayeOzeti = {
  baslik: "ORTAKLAR MOTORS",
  satirlar: [
    "Nuri'nin dayısı galeriyi onlara bıraktı: tezgâhtaki arabalar, defter, kepenk anahtarı.",
    "Bırakamadığı tek şey dükkânın kendisiydi. Orası kiracıydılar ve mal sahibi satışa çıkardı.",
    "Adam önce onlara sordu: yedi buçuk milyon, otuz gün süre. Kasada altı milyon var, borç yok.",
    "Otuz gün sonunda parayı bulamazlarsa kepengi başkası açacak."
  ],
  hedefCumlesi: "Otuz günde net varlığı 7.500.000 TL'ye çıkar, dükkânı satın al."
};

G.data.karakterTanitim = [
  { anahtar: "nuri", ad: "Nuri", rol: "Ortak",
    metin: "Dayısının galerisini devralan adam. Ağzıyla satar, kapıdan gireni tanır, çabuk parlar. Masada tavanı açar ama hakaret duyarsa masayı dağıtır." },
  { anahtar: "drej", ad: "Drej", rol: "Ortak",
    metin: "Defteri tutan ortak. Kuralcı, hesapçı, acelesi yok. Kusuru ve rakamı görür; karşı taraf soru yağmurundan sıkılır." },
  { anahtar: "kro", ad: "Kro", rol: "Yeğen",
    metin: "Çırak. Çay getirir, ilan bulur, bazen başa iş açar. Görüşmeye girerse kusurları olduğu gibi söyler: itibar kazanırsın, pere kaybedersin." },
  { anahtar: "riza", ad: "Rıza", rol: "Karşı galeri",
    metin: "Sanayideki rakip. Bazen fırsat getirir, bazen tuzak. Teklifini dinlemeden kapatma." },
  { anahtar: "sukru", ad: "Şükrü abi", rol: "Esnafın aklı",
    metin: "Sanayinin en eskisi. Kahvede oturur, iki laf eder, o iki laf çoğu zaman tutar." },
  { anahtar: "abla", ad: "Abla", rol: "Nuri'nin ablası",
    metin: "Sofrayı kurar, hesabı sorar. Nuri sinirlendiği günün ertesinde onun yanındadır." },
  { anahtar: "cuneyt", ad: "Cüneyt", rol: "Derevci",
    metin: "Sanayide adı dolaşan adam. Kâğıdı düzgün, arabası değil. Kapora isterse iki kere düşün." },
  { anahtar: "musavir", ad: "Mali müşavir", rol: "Bürokrasi",
    metin: "Vergiyi, belgeyi ve yetki belgesini hatırlatan kişi. Can sıkar, para kazandırır." },
  { anahtar: "noter", ad: "Noter", rol: "Devir",
    metin: "Sözlü iş yapılmaz. Alış da satış da onun masasında bağlanır." },
  { anahtar: "teknisyen", ad: "Ekspertizci", rol: "Ekspertiz",
    metin: "Boyayı, değişeni, tramerini söyler. Parasını verirsen daha derine bakar." },
  { anahtar: "satici", ad: "Satıcı", rol: "Karşı taraf",
    metin: "Her ilanın arkasında bir tipleme var: piyasacı, kurumsal, memur, esnaf, çaylak, çiftçi. Kimin karşısında olduğun pazarlığı değiştirir." },
  { anahtar: "musteri", ad: "Müşteri", rol: "Kapıdan giren",
    metin: "Pazarlıkçı, aceleci ya da titiz olur. İtibarın düşükse daha çabuk şüphelenir." },
  { anahtar: "polis", ad: "Polis", rol: "Ceza",
    metin: "Kro'nun hız cezası, denetim ve belgesiz satışın bedeli bu kapıdan gelir." }
];

