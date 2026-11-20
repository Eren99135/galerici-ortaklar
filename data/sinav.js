// data/sinav.js — yetki belgesi sinavi soru havuzu (Adim 22, tasarim/14).
// Dizide 34. bolum: Drej 88, Nuri 60 aliyor; baraj %70.
// Sorular is guvenligi ve alim satim konularindan; dogru sik "dogru" alaninda.
window.G = window.G || {};
G.data = G.data || {};

G.data.sinavSorulari = [

  {
    id: "noter",
    soru: "İkinci el araç satışında devir işlemi nerede yapılır?",
    siklar: ["Noterde", "Galeride el sıkışarak", "Vergi dairesinde"],
    dogru: 0,
    aciklama: "Devir noterde yapılır; el sıkışmak satışı hukuken bitirmez."
  },
  {
    id: "garanti",
    soru: "İkinci el araç ticaretinde ayıplı maldan sorumluluk ne kadardır?",
    siklar: ["Hiç yok, araba ikinci el", "Satıştan sonra 1 yıl", "Sadece aynı gün"],
    dogru: 1,
    aciklama: "Ticari satışta bir yıllık ayıp sorumluluğu var; sakladığın kusur sana döner."
  },
  {
    id: "ekspertiz_rapor",
    soru: "Satıcının getirdiği ekspertiz raporuna nasıl bakılır?",
    siklar: ["Olduğu gibi kabul edilir", "Kendi ekspertizimizle doğrulanır", "Hiç bakılmaz"],
    dogru: 1,
    aciklama: "Raporu yaptıran kim ise sonucu da ona göre çıkabilir; kendi ekspertizin esastır."
  },
  {
    id: "kapora",
    soru: "Kapora alırken hangisi şarttır?",
    siklar: ["Sözlü anlaşma yeter", "Yazılı belge ve kimlik", "Sadece telefon numarası"],
    dogru: 1,
    aciklama: "Kaporanın yazılı belgesi yoksa uyuşmazlıkta elinde bir şey kalmaz."
  },
  {
    id: "yangin",
    soru: "Galeride yangın tüpü ne sıklıkla kontrol edilir?",
    siklar: ["Yılda bir", "Beş yılda bir", "Hiç gerekmez"],
    dogru: 0,
    aciklama: "Yangın tüplerinin yıllık kontrolü iş güvenliğinin temel maddesi."
  },
  {
    id: "lift",
    soru: "Araç liftinin altında çalışırken hangisi zorunludur?",
    siklar: ["Mekanik emniyet kilidi", "Sadece dikkatli olmak", "Lifti yarıya indirmek"],
    dogru: 0,
    aciklama: "Hidrolik kaçırabilir; mekanik kilit olmadan altına girilmez."
  },
  {
    id: "yagli_bez",
    soru: "Yağlı üstübü ve bezler nerede toplanır?",
    siklar: ["Normal çöpe", "Kapaklı metal kovada", "Avluda açıkta"],
    dogru: 1,
    aciklama: "Yağlı bez kendiliğinden tutuşabilir; kapaklı metal kovada toplanır."
  },
  {
    id: "fatura",
    soru: "Galeri bir aracı vatandaştan alıp sattığında vergi neye göre hesaplanır?",
    siklar: ["Satış bedelinin tamamına", "Alış ile satış arasındaki kâra", "Hiç vergi yok"],
    dogru: 1,
    aciklama: "Özel matrah: vergi kâr üzerinden hesaplanır."
  },
  {
    id: "tramer",
    soru: "Tramer kaydı neyi gösterir?",
    siklar: ["Aracın kilometresini", "Sigortaya bildirilen hasar tutarını", "Muayene tarihini"],
    dogru: 1,
    aciklama: "Tramer, sigortaya yansımış hasar kaydıdır; yansımayan hasar görünmez."
  },
  {
    id: "sase",
    soru: "Şase numarası ruhsatla uyuşmuyorsa ne yapılır?",
    siklar: ["Satışa devam edilir", "Alım yapılmaz, bildirilir", "Fiyattan düşülür"],
    dogru: 1,
    aciklama: "Şase uyumsuzluğu adli bir mesele; o araba alınmaz."
  },
  {
    id: "cek",
    soru: "Vadeli çekle satışta en temel kontrol hangisidir?",
    siklar: ["Çekin karekodunu sorgulamak", "Müşterinin arabasına bakmak", "Vadeyi uzatmak"],
    dogru: 0,
    aciklama: "Karekod sorgusu çekin geçmişini ve karşılıksız kaydını gösterir."
  },
  {
    id: "ilan",
    soru: "İlanda aracın hasar durumu nasıl belirtilmeli?",
    siklar: ["Boş bırakılır", "Olduğu gibi yazılır", "Her zaman boyasız yazılır"],
    dogru: 1,
    aciklama: "Yanıltıcı ilan hem cezaya hem iade talebine açık kapı bırakır."
  }
];
