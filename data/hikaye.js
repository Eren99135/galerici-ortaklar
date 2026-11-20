// data/hikaye.js — ana hikaye sahneleri (Adim 14).
// Belirli gunlerin sabahinda, olay kartindan ONCE oynar. Her replik en fazla 12 kelime.
// Sahne alanlari: {id, gun, baslik, mekan, kisiler, replikler, etki?, kapanis?}
//   kisiler : sahnede kimler duracak ({kim, konum})
//   etki    : olaylar.js'in etki motoruna verilir (kasa, itibar, bayrak, not...)
//   kapanis : sadece final sahnesinde; hedefe gore degisen replikler
window.G = window.G || {};
G.data = G.data || {};

G.data.hikaye = [

  {
    id: "prolog",
    gun: 1,
    baslik: "ORTAKLAR",
    mekan: "galeri-onu",
    kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "drej", konum: "sag" }],
    replikler: [
      { kim: "nuri", ifade: "normal", metin: "Dayımın galerisi bize kaldı ortak." },
      { kim: "drej", ifade: "normal", metin: "Galeri kaldı da dükkân kalmadı. Kiracıyız." },
      { kim: "nuri", ifade: "normal", metin: "Mal sahibi satıyor. Önce bize sordu." },
      { kim: "drej", ifade: "normal", metin: "Yedi buçuk istiyor. Kasada altı var, borç yok." },
      { kim: "nuri", ifade: "normal", metin: "Otuz gün süre verdi. Sonra ilana çıkıyor." },
      { kim: "drej", ifade: "normal", metin: "Yani ya dükkânı alırız ya kepengi başkası açar." },
      { kim: "nuri", ifade: "sevincli", metin: "Erebe gider, pere gelir. Başlayalım." }
    ]
  },

  {
    id: "riza_tanisma",
    gun: 4,
    baslik: "KARŞI GALERİ",
    mekan: "sanayi-avlu",
    kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "riza", konum: "sag" }],
    replikler: [
      { kim: "riza", ifade: "normal", metin: "Dayının yerini siz mi devraldınız?" },
      { kim: "riza", ifade: "normal", metin: "Bu avlu acemi kaldırmaz Nuri." },
      { kim: "nuri", ifade: "sinirli", metin: "Sen tezgâhına bak, biz hallederiz." },
      { kim: "riza", ifade: "normal", metin: "Bakarım. Batarsanız dükkânı ben alırım." }
    ]
  },

  {
    id: "kro_ise_basliyor",
    gun: 7,
    baslik: "YEĞEN İŞ BAŞINDA",
    mekan: "galeri-onu",
    kisiler: [{ kim: "abla", konum: "sol" }, { kim: "kro", konum: "orta" }, { kim: "nuri", konum: "sag" }],
    replikler: [
      { kim: "abla", ifade: "normal", metin: "Nuri, şu çocuğa bir iş ver." },
      { kim: "kro", ifade: "sevincli", metin: "Dayı ilanları ben tararım, sosyal medyayı bilirim." },
      { kim: "nuri", ifade: "normal", metin: "Tamam ama arabalara dokunmak yok." },
      { kim: "kro", ifade: "sevincli", metin: "Söz dayı. Sabah sekizde buradayım." }
    ],
    etki: { not: "Kro işe başladı: sabahları ilan getirecek." }
  },

  {
    id: "cuneyt_duyuldu",
    gun: 10,
    baslik: "SANAYİDE BİR ADAM",
    mekan: "kahve",
    kisiler: [{ kim: "sukru", konum: "sol" }, { kim: "drej", konum: "sag" }],
    replikler: [
      { kim: "sukru", ifade: "normal", metin: "Cüneyt diye biri türedi evlat." },
      { kim: "sukru", ifade: "normal", metin: "Başkasının arabasını kendi ilanında satıyor." },
      { kim: "drej", ifade: "sinirli", metin: "Bizim fotoğraflar da dolaşıyor olabilir." },
      { kim: "sukru", ifade: "normal", metin: "Gözünüzü açın. Kapora isteyene inanmayın." }
    ]
  },

  {
    id: "sukru_ogut",
    gun: 13,
    baslik: "ESNAF AKLI",
    mekan: "kahve",
    kisiler: [{ kim: "sukru", konum: "sol" }, { kim: "nuri", konum: "sag" }],
    replikler: [
      { kim: "sukru", ifade: "normal", metin: "Otur evladım. Bir şey söyleyeceğim." },
      { kim: "sukru", ifade: "normal", metin: "Kusuru saklayan bir kere satar." },
      { kim: "sukru", ifade: "normal", metin: "Söyleyen ömür boyu satar." },
      { kim: "nuri", ifade: "normal", metin: "Not aldım Şükrü abi." }
    ]
  },

  {
    id: "riza_teklif",
    gun: 16,
    baslik: "ORTAK OLALIM",
    mekan: "galeri-onu",
    kisiler: [{ kim: "riza", konum: "sol" }, { kim: "nuri", konum: "orta" }, { kim: "drej", konum: "sag" }],
    replikler: [
      { kim: "riza", ifade: "normal", metin: "Dükkânın yarısını alayım, ortak olalım." },
      { kim: "drej", ifade: "normal", metin: "Yarısı dediğin bizim emeğimiz Rıza." },
      { kim: "nuri", ifade: "sinirli", metin: "Dayımın tabelası satılık değil." },
      { kim: "riza", ifade: "normal", metin: "Peki. Teklifim ay sonuna kadar geçerli." }
    ]
  },

  {
    id: "kriz",
    gun: 19,
    baslik: "DEFTER AĞLIYOR",
    mekan: "galeri-ici",
    kisiler: [{ kim: "drej", konum: "sol" }, { kim: "nuri", konum: "sag" }],
    replikler: [
      { kim: "drej", ifade: "sinirli", metin: "Ortak, rakamlara bak. Böyle gitmez." },
      { kim: "nuri", ifade: "normal", metin: "Panik yok. On bir gün daha var." },
      { kim: "drej", ifade: "normal", metin: "Sabit gider her gün sekiz bin." },
      { kim: "nuri", ifade: "normal", metin: "O zaman tezgâhı boş bırakmayacağız." }
    ]
  },

  {
    id: "cuneyt_gitti",
    gun: 22,
    baslik: "KAPORA PEŞİNDE",
    mekan: "gece-sanayi",
    kisiler: [{ kim: "cuneyt", konum: "sol" }, { kim: "drej", konum: "sag" }],
    replikler: [
      { kim: "cuneyt", ifade: "normal", metin: "Araba sizde kalsın, kaporayı bana yollayın." },
      { kim: "drej", ifade: "sinirli", metin: "Noter olmadan tek kuruş yok." },
      { kim: "cuneyt", ifade: "normal", metin: "Zararınıza olur. Başkası kapar." },
      { kim: "drej", ifade: "normal", metin: "Kapsın. Biz kâğıtsız iş yapmayız." }
    ],
    etki: { itibar: 2, not: "Cüneyt'in oyununa gelmedik: sanayide konuşuldu, itibar +2." }
  },

  {
    id: "son_duzluk",
    gun: 26,
    baslik: "SON DÜZLÜK",
    mekan: "galeri-onu",
    kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "drej", konum: "orta" }, { kim: "kro", konum: "sag" }],
    replikler: [
      { kim: "drej", ifade: "normal", metin: "Dört gün kaldı ortak. Hesabı yaptım." },
      { kim: "nuri", ifade: "normal", metin: "Tezgâhtaki arabalar da varlık sayılıyor." },
      { kim: "kro", ifade: "sevincli", metin: "Dayı son bir efso ilan bulurum." },
      { kim: "nuri", ifade: "sevincli", metin: "Bul yeğen. Son düzlükteyiz." }
    ]
  },

  {
    id: "final",
    gun: 30,
    baslik: "OTUZUNCU GÜN",
    mekan: "galeri-onu",
    kisiler: [{ kim: "nuri", konum: "sol" }, { kim: "drej", konum: "orta" }, { kim: "kro", konum: "sag" }],
    replikler: [
      { kim: "drej", ifade: "normal", metin: "Son gün ortak. Akşam mal sahibi geliyor." },
      { kim: "nuri", ifade: "normal", metin: "Bugün ne satarsak dükkâna yazılır." },
      { kim: "drej", ifade: "normal", metin: "Yedi buçuğu bulursak kepenk bizim." },
      { kim: "kro", ifade: "sevincli", metin: "Dayı ben çayları söyledim bile." }
    ]
  }
];
