// data/trendler.js — haftalik piyasa haberleri: 4-5 gun suren mini trendler.
// Kaynak: context/tasarim/15-piyasa-trendleri.md
//
// Alanlar:
//   id      : kayitta ve testte kullanilan anahtar
//   haber   : trend basladigi gun sabah haberlerine giren cumle (esnaf agzi, kisa)
//   etiket  : tezgah seridinde ve ilan bandinda gorunen kisa yazi
//   artan   : talebin yukseldigi hedefler
//   azalan  : talebin dustugu hedefler (bos olabilir)
//
// Hedef iki bicimde yazilir:
//   govde listesi  -> { govde: ["hatchback", "suv"] }
//   fiyat segmenti -> { segment: ["ucuz"] }      (ucuz / orta / pahali)
// Segment sinirlari config.SEGMENT_BUTCE tablosundan okunur, ayri sayi yok.
window.G = window.G || {};
G.data = G.data || {};

G.data.trendler = [
  {
    id: "benzin",
    haber: "Benzine zam geldi. Millet küçük araba soruyor.",
    etiket: "ekonomik araba revaçta",
    artan: { govde: ["hatchback"], segment: ["ucuz"] },
    azalan: { govde: ["suv", "pickup"] }
  },
  {
    id: "bayram",
    haber: "Bayram yaklaştı. Aile arabası arayan çok.",
    etiket: "aile sedanı aranıyor",
    artan: { govde: ["sedan", "station"] },
    azalan: { govde: ["ticari", "pickup"] }
  },
  {
    id: "insaat",
    haber: "İnşaat sezonu açıldı. Kamyonet soran eksik olmuyor.",
    etiket: "ticari ve pickup revaçta",
    artan: { govde: ["ticari", "pickup"] },
    azalan: { govde: ["hatchback", "station"] }
  },
  {
    id: "faiz",
    haber: "Kredi faizi çıktı. Herkes bütçesini aşağı çekti.",
    etiket: "ucuz kasalar gidiyor",
    artan: { segment: ["ucuz"] },
    azalan: { segment: ["pahali"] }
  },
  {
    id: "okul",
    haber: "Okullar açıldı. Servise, şehir içine araba lazım.",
    etiket: "şehir içi araba aranıyor",
    artan: { govde: ["sedan", "hatchback"] },
    azalan: { segment: ["pahali"] }
  },
  {
    id: "tatil",
    haber: "Tatil sezonu başladı. Yola çıkacak araba soruyorlar.",
    etiket: "SUV ve station revaçta",
    artan: { govde: ["suv", "station"] },
    azalan: { govde: ["hatchback"], segment: ["pahali"] }
  }
];
