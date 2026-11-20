// data/sefer.js — sehir disi sefer sehirleri (Adim 18, tasarim/10).
// Kaynak: kaynaklar/dizi-bilgi.md "Sehir disi seferler" ve ton-rehberi.md yemek kalibi.
// Alanlar:
//   yolMasrafi        : kasadan dusen yol parasi
//   indirim           : [min, maks] — istenen fiyattan dusulen oran
//   ilanSayisi        : sehirde kac ilan cikar
//   dolandiriciCarpani: satici tipi secimindeki dolandirici agirligi bu kadar katlanir
//   yemek             : bir kerelik mola; replikler en fazla 12 kelime
//   ipucu             : Kro'nun duydugu laf (12 kelime siniri)
window.G = window.G || {};
G.data = G.data || {};

G.data.sehirler = [

  {
    id: "izmit",
    ad: "İzmit",
    mesafe: 100,
    yolMasrafi: 25600,
    indirim: [0.06, 0.12],
    ilanSayisi: 3,
    dolandiriciCarpani: 1.5,
    ipucu: "Dayı İzmit'te bir tanıdık var, fiyatlar uygun.",
    yemek: {
      ad: "kavurma",
      bedel: 900,
      replikler: [
        { kim: "nuri", ifade: "sevincli", metin: "İzmit'e gelip kavurma yemeden dönülmez ortak." },
        { kim: "drej", ifade: "normal", metin: "Yol parası yetmiyordu, bir de kavurma." },
        { kim: "nuri", ifade: "sevincli", metin: "Aç karnına pazarlık olmaz. Otur şuraya." }
      ]
    }
  },

  {
    id: "inegol",
    ad: "İnegöl",
    mesafe: 160,
    yolMasrafi: 28800,
    indirim: [0.08, 0.14],
    ilanSayisi: 3,
    dolandiriciCarpani: 1.5,
    ipucu: "Dayı İnegöl'de bir Corolla var, piyasanın altında.",
    yemek: {
      ad: "İnegöl köfte",
      bedel: 1100,
      replikler: [
        { kim: "nuri", ifade: "sevincli", metin: "İnegöl'e geldik, köfte yemeden araba bakılmaz." },
        { kim: "drej", ifade: "normal", metin: "Bir porsiyon ortak, iki değil." },
        { kim: "nuri", ifade: "sevincli", metin: "Garson, iki porsiyon! Yazma deftere." }
      ]
    }
  },

  {
    id: "konya",
    ad: "Konya",
    mesafe: 258,
    yolMasrafi: 38400,
    indirim: [0.10, 0.16],
    ilanSayisi: 4,
    dolandiriciCarpani: 2,
    ipucu: "Dayı Konya'da ucuz bir Passat var, kaçmasın.",
    yemek: {
      ad: "etli ekmek",
      bedel: 1300,
      replikler: [
        { kim: "nuri", ifade: "sevincli", metin: "Konya'ya gelip etli ekmek yemeden dönülmez." },
        { kim: "drej", ifade: "normal", metin: "Bir metre söyledin ortak, rakamı gördüm." },
        { kim: "nuri", ifade: "sevincli", metin: "Ye de keyfin gelsin, pazarlık sonra." }
      ]
    }
  },

  {
    id: "gaziantep",
    ad: "Gaziantep",
    mesafe: 650,
    yolMasrafi: 51200,
    indirim: [0.12, 0.18],
    ilanSayisi: 4,
    dolandiriciCarpani: 2,
    ipucu: "Dayı Antep'te iki araba var, ikisi de temiz görünüyor.",
    yemek: {
      ad: "beyran ve şam tatlısı",
      bedel: 1600,
      replikler: [
        { kim: "nuri", ifade: "sevincli", metin: "Antep'e geldik. Sabah beyran, üstüne tatlı." },
        { kim: "drej", ifade: "normal", metin: "Ortak, biz araba almaya gelmiştik." },
        { kim: "nuri", ifade: "sevincli", metin: "Araba kaçmaz, bu sofra kaçar." }
      ]
    }
  },

  {
    id: "sanliurfa",
    ad: "Şanlıurfa",
    mesafe: 800,
    yolMasrafi: 57600,
    indirim: [0.12, 0.18],
    ilanSayisi: 4,
    dolandiriciCarpani: 2,
    ipucu: "Dayı Urfa'da yeşil bir Hilux var, boyasız diyorlar.",
    yemek: {
      ad: "Urfa sofrası",
      bedel: 1800,
      replikler: [
        { kim: "nuri", ifade: "sevincli", metin: "Urfa sofrası kurulmuş, kalkmak ayıp olur." },
        { kim: "drej", ifade: "normal", metin: "Hesabı ben ödüyorum, bilgin olsun ortak." },
        { kim: "nuri", ifade: "sevincli", metin: "Ödersin ödersin. Sonra arabaya bakarız." }
      ]
    }
  },

  {
    id: "diyarbakir",
    ad: "Diyarbakır",
    mesafe: 950,
    yolMasrafi: 60800,
    indirim: [0.12, 0.20],
    ilanSayisi: 4,
    dolandiriciCarpani: 2.5,
    ipucu: "Dayı Diyarbakır'da Megane ile Egea beraber satılıyor.",
    yemek: {
      ad: "ciğer",
      bedel: 1500,
      replikler: [
        { kim: "nuri", ifade: "sevincli", metin: "Diyarbakır'a gelip ciğer yemeyen pişman olur." },
        { kim: "drej", ifade: "normal", metin: "Sabahın köründe ciğer mi ortak?" },
        { kim: "nuri", ifade: "sevincli", metin: "Burada sabah böyle açılır. Otur bakalım." }
      ]
    }
  }
];
