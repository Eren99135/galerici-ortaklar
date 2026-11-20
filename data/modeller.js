// data/modeller.js — model katalogu (tasarim/02). Degerler temiz hali icin, yil araliginin ortasina gore.
// govde: sahnede ve ilan kartinda gorsel secmeye yarar (img/araba/<govde>.png yedegi).
// renk : modelin img/araba/<anahtar>.png fotografindaki renk. Ilanda bu yazar, boylece
//        "gumus Corsa" yazip kirmizi araba cikmaz. Fiyata etkisi yok (bkz. js/araba.js).
// persona: bu modeli satan tipik kisi (Faz 3). Satici tipinin ustune biner: pazarlikta
//        ne kadar kirildigini, sabrini ve agzini belirler. Tanimlar js/config.js PERSONALAR.
//        Her ilanda cikmaz; PERSONA_SADAKAT olasiligiyla bu, kalaninda rastgele baskasi.
//        sedan · hatchback · station · suv · pickup · ticari · klasik
// kmEtkisiz: 2005 oncesi ve klasiklerde km piyasa degerini bozmasin diye (bkz. js/araba.js).
window.G = window.G || {};
G.data = G.data || {};

G.data.modeller = [

  // ---- Eski kasa, ucuz: sanayinin ekmek kapisi ----
  { marka: "Tofaş",    model: "Şahin",        deger: 285000,  yilMin: 1996, yilMaks: 2001, govde: "sedan", renk: "kırmızı", persona: "piyasaci",     kmEtkisiz: true, not: "eski kasa" },
  { marka: "Tofaş",    model: "Doğan SLX",    deger: 320000,  yilMin: 1994, yilMaks: 2000, govde: "sedan", renk: "beyaz", persona: "piyasaci",     kmEtkisiz: true, not: "eski kasa" },
  { marka: "Renault",  model: "Broadway",     deger: 265000,  yilMin: 1993, yilMaks: 1998, govde: "sedan", renk: "gri", persona: "piyasaci",     kmEtkisiz: true, not: "eski kasa" },
  { marka: "Fiat",     model: "Tempra",       deger: 300000,  yilMin: 1995, yilMaks: 1999, govde: "sedan", renk: "mavi", persona: "piyasaci",     kmEtkisiz: true, not: "eski kasa" },
  { marka: "Opel",     model: "Astra",        deger: 455000,  yilMin: 2002, yilMaks: 2007, govde: "hatchback", renk: "gümüş", persona: "piyasaci", kmEtkisiz: true },
  { marka: "Mercedes", model: "W124",         deger: 1100000, yilMin: 1990, yilMaks: 1995, govde: "klasik", renk: "gri", persona: "elit",    kmEtkisiz: true, not: "klasik" },

  // ---- Orta yas ----
  { marka: "Renault",  model: "Symbol",       deger: 605000,  yilMin: 2010, yilMaks: 2015, govde: "sedan", renk: "beyaz", persona: "memur" },
  { marka: "Hyundai",  model: "Accent Era",   deger: 555000,  yilMin: 2008, yilMaks: 2012, govde: "sedan", renk: "gümüş", persona: "memur" },
  { marka: "Fiat",     model: "Linea",        deger: 700000,  yilMin: 2012, yilMaks: 2016, govde: "sedan", renk: "gri", persona: "memur" },
  { marka: "Peugeot",  model: "301",          deger: 800000,  yilMin: 2016, yilMaks: 2020, govde: "sedan", renk: "gümüş", persona: "memur" },
  { marka: "Citroën",  model: "C-Elysée",     deger: 820000,  yilMin: 2017, yilMaks: 2021, govde: "sedan", renk: "füme", persona: "memur" },
  { marka: "Honda",    model: "City",         deger: 810000,  yilMin: 2015, yilMaks: 2019, govde: "sedan", renk: "mavi", persona: "memur" },
  { marka: "Audi",     model: "A6",           deger: 850000,  yilMin: 2009, yilMaks: 2012, govde: "sedan", renk: "siyah", persona: "elit",     not: "eski kasa" },

  // ---- Guncel binek ----
  { marka: "Dacia",    model: "Sandero",      deger: 855000,  yilMin: 2015, yilMaks: 2019, govde: "hatchback", renk: "mavi", persona: "caylak" },
  { marka: "Renault",  model: "Clio",         deger: 950000,  yilMin: 2017, yilMaks: 2021, govde: "hatchback", renk: "beyaz", persona: "caylak" },
  { marka: "Opel",     model: "Corsa",        deger: 955000,  yilMin: 2016, yilMaks: 2020, govde: "hatchback", renk: "kırmızı", persona: "caylak" },
  { marka: "Hyundai",  model: "i20",          deger: 985000,  yilMin: 2017, yilMaks: 2021, govde: "hatchback", renk: "mavi", persona: "caylak" },
  { marka: "Fiat",     model: "Egea",         deger: 1030000, yilMin: 2018, yilMaks: 2022, govde: "sedan", renk: "gri", persona: "memur" },
  { marka: "Ford",     model: "Focus",        deger: 1050000, yilMin: 2014, yilMaks: 2018, govde: "sedan", renk: "beyaz", persona: "memur" },
  { marka: "VW",       model: "Polo",         deger: 1055000, yilMin: 2017, yilMaks: 2021, govde: "hatchback", renk: "beyaz", persona: "caylak" },
  { marka: "Toyota",   model: "Yaris",        deger: 1100000, yilMin: 2018, yilMaks: 2022, govde: "hatchback", renk: "gri", persona: "memur" },
  { marka: "VW",       model: "Golf",         deger: 1200000, yilMin: 2015, yilMaks: 2020, govde: "hatchback", renk: "mavi", persona: "piyasaci" },
  { marka: "Renault",  model: "Fluence",      deger: 880000,  yilMin: 2013, yilMaks: 2016, govde: "sedan", renk: "beyaz", persona: "memur" },
  { marka: "Renault",  model: "Megane",       deger: 1250000, yilMin: 2016, yilMaks: 2021, govde: "sedan", renk: "bordo", persona: "memur" },
  { marka: "Toyota",   model: "Corolla",      deger: 1250000, yilMin: 2017, yilMaks: 2021, govde: "sedan", renk: "beyaz", persona: "memur" },
  { marka: "Honda",    model: "Civic",        deger: 1300000, yilMin: 2017, yilMaks: 2021, govde: "sedan", renk: "kırmızı", persona: "piyasaci" },
  { marka: "VW",       model: "Passat",       deger: 1350000, yilMin: 2015, yilMaks: 2019, govde: "sedan", renk: "gümüş", persona: "elit" },
  { marka: "Škoda",    model: "Octavia",      deger: 1400000, yilMin: 2016, yilMaks: 2020, govde: "hatchback", renk: "mavi", persona: "memur" },
  { marka: "Seat",     model: "Leon FR",      deger: 1550000, yilMin: 2018, yilMaks: 2022, govde: "hatchback", renk: "kırmızı", persona: "piyasaci" },
  { marka: "Opel",     model: "Insignia",     deger: 1150000, yilMin: 2014, yilMaks: 2018, govde: "sedan", renk: "bordo", persona: "elit" },
  { marka: "VW",       model: "Passat Variant", deger: 1420000, yilMin: 2016, yilMaks: 2019, govde: "station", renk: "gümüş", persona: "elit" },
  { marka: "Ford",     model: "Mondeo",       deger: 1180000, yilMin: 2014, yilMaks: 2018, govde: "station", renk: "lacivert", persona: "memur" },

  // ---- SUV ----
  { marka: "Dacia",    model: "Duster",       deger: 1350000, yilMin: 2018, yilMaks: 2022, govde: "suv", renk: "kahverengi", persona: "cifci" },
  { marka: "Nissan",   model: "Qashqai",      deger: 1450000, yilMin: 2016, yilMaks: 2020, govde: "suv", renk: "mavi", persona: "cifci" },
  { marka: "Hyundai",  model: "Tucson",       deger: 1700000, yilMin: 2018, yilMaks: 2021, govde: "suv", renk: "füme", persona: "cifci" },
  { marka: "Peugeot",  model: "3008",         deger: 1800000, yilMin: 2018, yilMaks: 2021, govde: "suv", renk: "mavi", persona: "cifci" },

  // ---- Ticari ----
  { marka: "Renault",  model: "Kangoo",       deger: 785000,  yilMin: 2015, yilMaks: 2019, govde: "ticari", renk: "gri", persona: "esnaf" },
  { marka: "Fiat",     model: "Doblò",        deger: 900000,  yilMin: 2016, yilMaks: 2020, govde: "ticari", renk: "beyaz", persona: "esnaf" },
  { marka: "Ford",     model: "Transit Connect", deger: 955000, yilMin: 2014, yilMaks: 2018, govde: "ticari", renk: "gümüş", persona: "esnaf" },
  { marka: "VW",       model: "Caddy",        deger: 1150000, yilMin: 2015, yilMaks: 2019, govde: "ticari", renk: "gümüş", persona: "esnaf" },
  { marka: "Mercedes", model: "Vito",         deger: 1900000, yilMin: 2016, yilMaks: 2019, govde: "ticari", renk: "gümüş", persona: "esnaf" },

  // ---- Pickup ----
  { marka: "Nissan",   model: "Navara",       deger: 1700000, yilMin: 2017, yilMaks: 2021, govde: "pickup", renk: "kahverengi", persona: "cifci" },
  { marka: "Toyota",   model: "Hilux",        deger: 1900000, yilMin: 2017, yilMaks: 2021, govde: "pickup", renk: "gümüş", persona: "cifci" },
  { marka: "Ford",     model: "Ranger",       deger: 1950000, yilMin: 2018, yilMaks: 2022, govde: "pickup", renk: "mavi", persona: "cifci" },

  // ---- Ust segment ----
  { marka: "Škoda",    model: "Superb",       deger: 1600000, yilMin: 2017, yilMaks: 2020, govde: "sedan", renk: "kahverengi", persona: "elit" },
  { marka: "BMW",      model: "3.20i",        deger: 1750000, yilMin: 2015, yilMaks: 2019, govde: "sedan", renk: "siyah", persona: "elit" },
  { marka: "Audi",     model: "A4",           deger: 1850000, yilMin: 2016, yilMaks: 2019, govde: "sedan", renk: "gri", persona: "elit" },
  { marka: "Mercedes", model: "C180",         deger: 1900000, yilMin: 2015, yilMaks: 2019, govde: "sedan", renk: "beyaz", persona: "elit" },
  { marka: "BMW",      model: "5.20i",        deger: 2000000, yilMin: 2014, yilMaks: 2017, govde: "sedan", renk: "gümüş", persona: "elit" }
];

// Musteri isimleri (olay ve gorusme metinleri icin)
G.data.musteriIsimleri = [
  "Hasan abi", "Selim", "Tuncay abi", "Fikret", "Nazmi abi", "Ercan",
  "Vedat", "Orhan abi", "Sinan", "Kadir abi", "Levent", "Ismail abi",
  "Burhan", "Taner", "Yavuz abi", "Cemil", "Ozkan", "Murat abi"
];
