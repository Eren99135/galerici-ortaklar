// data/kartlar.js — olay destesi (tasarim/06). Yeni kart eklemek = buraya bir satir eklemek.
// Adim 15 Faz C: her kartin anlatici metni yerine karakterlerin agzindan kisa replikler
// (`replikler`) gosteriliyor. `metin` alani destede ozet olarak duruyor, ekranda cikmiyor.
// Etkiler VERI olarak yazilir, kod olarak degil. js/olaylar.js bunlari uygular.
//
// Etki anahtarlari:
//   kasa, itibar, aksiyon      -> sayi, dogrudan eklenir
//   not                        -> gun notuna ve sabah seridine yazilacak metin
//   bayrak                     -> bayraklar[ad] = true  (bedavaEkspertiz, bereket, vergiIndirimi, ortulenKm)
//   sayac: {ad, deger}         -> bayraklar[ad] = deger (nuriSakin gibi)
//   kroYok / nuriYok: true     -> o kisi yarin yok
//   sahteIlan: gun             -> sahte ilan donemi (her sabah itibar -3)
//   ilan: {tip}                -> listeye ilan ekler ("riza" | "ucuz")
//   stokKm: km                 -> rastgele bir stok arabasina km ekler
//   stokSat: oran              -> Kro bir stok arabasini piyasa x oran fiyatina satar
//   gecikme: {gun, sans, etki, bosNot}  -> bekleyenEtkiler listesine yazar
//   aksamda: etki              -> bugunun aksam raporunda cozulur
//   sans + evet + hayir        -> olasilikli etki (ic ice yazilabilir)
window.G = window.G || {};
G.data = G.data || {};

G.data.kartlar = [

  {
    id: "sakin",
    kategori: "SANAYİ",
    baslik: "SAKİN GÜN",
    metin: "Çay demlendi, tezgâh silindi, kapıdan kimse geçmedi. Bugün sanayide sinek bile uçmuyor.",
    replikler: [
      { kim: "nuri", ifade: "normal", metin: "Çay demlendi, tezgâh silindi." },
      { kim: "drej", ifade: "normal", metin: "Kapıdan kimse geçmedi ortak." },
      { kim: "nuri", ifade: "normal", metin: "Sabret. Galerici sabreder." }
    ],
    agirlik: 4,
    secenekler: [
      { etiket: "Tamam", etki: {} }
    ],
    sizceSorusu: "Sizce Nuri bu hafta tavlada Rıza'yı yener mi?",
    sizceSecenekleri: [
      { etiket: "Yener, formda", etkiAnahtari: "sakaBir", kaydirma: 0,
        hatirlatma: "Dün akşam Nuri'nin tavlasına güvenmiştin." },
      { etiket: "Yenemez, zar tutmaz", etkiAnahtari: "sakaIki", kaydirma: 0,
        hatirlatma: "Dün akşam Nuri'nin zarına güvenmemiştin." }
    ]
  },

  {
    id: "riza_laf",
    kategori: "RIZA",
    baslik: "LAF ARASINDA",
    metin: "Rıza kapının önünde: \"Hayırdır, tezgâh yine bomboş mu?\" Tavlayı da koltuğunun altına almış.",
    replikler: [
      { kim: "riza", ifade: "normal", metin: "Hayırdır Nuri, tezgâh yine bomboş?" },
      { kim: "nuri", ifade: "sinirli", metin: "Sen kendi avluna bak Rıza." },
      { kim: "riza", ifade: "normal", metin: "Tavlayı getirdim. Oturur musun?" }
    ],
    agirlik: 2,
    secenekler: [
      {
        etiket: "Tavlaya otur",
        etki: {
          sans: 0.5,
          evet: { itibar: 3, not: "Rıza'yı tavlada yendik, akşama kadar sanayide konuşuldu." },
          hayir: { kasa: -10000, not: "Tavlada kaybettik, Rıza'nın çayını da biz ödedik." }
        }
      },
      { etiket: "Görmezden gel", etki: { not: "Rıza'ya bakmadık, laf havada kaldı." } }
    ],
    sizceSorusu: "Sizce yarın Rıza kapıya dayanır mı?",
    sizceSecenekleri: [
      { etiket: "Dayanır, o durmaz", etkiAnahtari: "hazirOl", kaydirma: 1,
        hatirlatma: "Dün Rıza'nın geleceğini söylemiştin, hazırlıklıydık." },
      { etiket: "Bugün işi var", etkiAnahtari: "aldirma", kaydirma: -1,
        hatirlatma: "Dün Rıza'yı beklemiyordun, hazırlıksız yakalandık." }
    ]
  },

  {
    id: "kro_gezinti",
    kategori: "KRO",
    baslik: "GECE GEZİNTİSİ",
    metin: "Kro emanet arabayla gece gezmiş. Sabah depo yarım, koltuk arkaya yatık: \"Dayı ben sadece kontrol ettim.\"",
    replikler: [
      { kim: "kro", ifade: "normal", metin: "Dayı yemin ederim sadece kontrol ettim." },
      { kim: "nuri", ifade: "sinirli", metin: "Depo yarım, koltuk arkaya yatık!" },
      { kim: "drej", ifade: "normal", metin: "Arabaya otuz kilometre bindi ortak." }
    ],
    agirlik: 2,
    kosul: function (state) { return state.stok.length > 0; },
    temelEtki: { stokKm: 30, not: "Stoktaki bir arabaya 30 km bindi." },
    secenekler: [
      { etiket: "Azarla", etki: { not: "Kro fırçayı yedi, bir şey değişmedi." } },
      {
        etiket: "Üstünü ört",
        etki: { bayrak: "ortulenKm", not: "Kilometreyi sessizce geçtik. Titiz bir müşteri fark edebilir." }
      }
    ],
    sizceSorusu: "Sizce Kro yarın anahtarlara yine uzanır mı?",
    sizceSecenekleri: [
      { etiket: "Anahtarları kilitle", etkiAnahtari: "kilit", kaydirma: 0,
        hatirlatma: "Dün anahtarları kilitlemiştin. Kro yine bir yolunu bulmuş." },
      { etiket: "Kro'ya güven", etkiAnahtari: "guven", kaydirma: 0,
        hatirlatma: "Dün Kro'ya güvenmiştin." }
    ]
  },

  {
    id: "sahte_ilan",
    kategori: "DOLANDIRICI",
    baslik: "SAHTE İLAN",
    metin: "Bizim arabanın fotoğrafı başka bir ilanda, fiyat yarısı. Arayanlar kapora istendiğini söylüyor. Cüneyt yine iş başında.",
    replikler: [
      { kim: "drej", ifade: "sinirli", metin: "Bizim arabanın fotoğrafı başka ilanda." },
      { kim: "cuneyt", ifade: "normal", metin: "Kapora yatırın, araba sizin olsun." },
      { kim: "drej", ifade: "normal", metin: "Cüneyt yine iş başında. Ne yapıyoruz?" }
    ],
    agirlik: 1,
    kosul: function (state) { return state.stok.length > 0; },
    secenekler: [
      {
        etiket: "Polise git",
        etki: { sahteIlan: 3, not: "Dilekçe verildi. İlan üç günde kapanacak, o zamana kadar itibar erir." }
      },
      {
        etiket: "Kro yem olsun",
        etki: {
          sans: 0.6,
          evet: { sahteIlan: 1, not: "Kro yem oldu, adam korkup ilanı yarın siliyor." },
          hayir: { sahteIlan: 4, kroYok: true, not: "Plan ters gitti: Kro yarın işe gelmiyor, ilan da dört gün daha duruyor." }
        }
      }
    ],
    sizceSorusu: "Sizce sahte ilan yarın kapanır mı?",
    sizceSecenekleri: [
      { etiket: "Kapanır", etkiAnahtari: "umut", kaydirma: 1,
        hatirlatma: "Dün bu işin kolay kapanacağını söylemiştin." },
      { etiket: "Uzar bu iş", etkiAnahtari: "karamsar", kaydirma: -1,
        hatirlatma: "Dün uzayacağını söylemiştin, Drej de sana katılmıştı." }
    ]
  },

  {
    id: "cuma",
    kategori: "CUMA",
    baslik: "CUMA ÇIKIŞI",
    metin: "Cami çıkışı kalabalık. Kapının yanında askıda ekmek defteri duruyor, Nuri cebine davranıyor.",
    replikler: [
      { kim: "nuri", ifade: "normal", metin: "Cami çıkışı kalabalık. Askıda ekmek var." },
      { kim: "drej", ifade: "normal", metin: "Kasa dar ortak, sen bilirsin." }
    ],
    agirlik: 2,
    secenekler: [
      {
        etiket: "Sadaka ver",
        etki: { kasa: -5000, itibar: 2, bayrak: "bereket", not: "Gizlice verildi. Nuri: bereket olsun ortak." }
      },
      { etiket: "Bu hafta geç", etki: { not: "Bu hafta elimiz dar, geçtik." } }
    ],
    sizceSorusu: "Sizce bereket tutar mı?",
    sizceSecenekleri: [
      { etiket: "Tutar", etkiAnahtari: "umut", kaydirma: 0,
        hatirlatma: "Dün bereketin tutacağını söylemiştin." },
      { etiket: "Pazarlık pazarlıktır", etkiAnahtari: "karamsar", kaydirma: 0,
        hatirlatma: "Dün bereket işine pek inanmamıştın." }
    ]
  },

  {
    id: "musavir",
    kategori: "BÜROKRASİ",
    baslik: "MALİ MÜŞAVİR",
    metin: "Müşavir dosyayı açtı: \"Bu satışı doğru kalemden gösterirsek vergide avantaj var.\" Drej kulak kesildi.",
    replikler: [
      { kim: "musavir", ifade: "normal", metin: "Bu satışı doğru kalemden gösterelim." },
      { kim: "drej", ifade: "normal", metin: "Vergide avantaj mı var yani?" }
    ],
    agirlik: 2,
    secenekler: [
      {
        etiket: "Dinle",
        etki: {
          sans: 0.5,
          evet: { bayrak: "vergiIndirimi", not: "Yol bulundu: sonraki satışta vergi %15." },
          hayir: { not: "Müşavir uzun konuştu, elimize bir şey geçmedi." }
        }
      }
    ],
    sizceSorusu: "Sizce müşavirin dediği iş görür mü?",
    sizceSecenekleri: [
      { etiket: "Görür", etkiAnahtari: "umut", kaydirma: 1,
        hatirlatma: "Dün müşavirin işini göreceğini söylemiştin." },
      { etiket: "Kâğıt üstünde kalır", etkiAnahtari: "karamsar", kaydirma: -1,
        hatirlatma: "Dün müşavire güvenmemiştin." }
    ]
  },

  {
    id: "kro_teklif",
    kategori: "KRO",
    baslik: "TEKLİF YAĞMURU",
    metin: "Kro gece boyu ilanlara teklif yazmış. Hepsi piyasanın çok altında: \"Dayı birisi tutarsa köşeyi döneriz.\"",
    replikler: [
      { kim: "kro", ifade: "sevincli", metin: "Dayı gece boyu ilanlara teklif yazdım." },
      { kim: "nuri", ifade: "sinirli", metin: "Hepsi piyasanın çok altında Kuro!" },
      { kim: "kro", ifade: "sevincli", metin: "Biri tutarsa köşeyi döneriz dayı." }
    ],
    agirlik: 1,
    secenekler: [
      {
        etiket: "Bakalım ne olacak",
        etki: {
          sans: 0.3,
          evet: {
            ilan: { tip: "ucuz" },
            not: "Birisi dönmüş: pazarlıksız, sabit fiyatlı bir ilan listede. Al ya da bırak."
          },
          hayir: { not: "Kimse dönmedi. Drej rahatladı." }
        }
      }
    ],
    sizceSorusu: "Sizce o tekliflerden biri tutar mı?",
    sizceSecenekleri: [
      { etiket: "Tutar", etkiAnahtari: "umut", kaydirma: 1,
        hatirlatma: "Dün o tekliflerden birinin tutacağını söylemiştin." },
      { etiket: "Kimse dönmez", etkiAnahtari: "karamsar", kaydirma: -1,
        hatirlatma: "Dün kimsenin dönmeyeceğini söylemiştin." }
    ]
  },

  {
    id: "sukru_cay",
    kategori: "ŞÜKRÜ ABİ",
    baslik: "BÜRODA ÇAY",
    metin: "Şükrü abi çağırdı, çay söyledi: \"Evlat, ucuz erebenin pahalı bir hikâyesi vardır. Bir sonraki ekspertiz benden.\"",
    replikler: [
      { kim: "sukru", ifade: "normal", metin: "Otur evladım, bir çay iç." },
      { kim: "sukru", ifade: "normal", metin: "Ucuz erebenin pahalı bir hikâyesi vardır." },
      { kim: "nuri", ifade: "normal", metin: "Dinliyoruz Şükrü abi." }
    ],
    agirlik: 2,
    secenekler: [
      { etiket: "Çayı iç, dersi al", etki: { bayrak: "bedavaEkspertiz", not: "Sonraki normal ekspertiz Şükrü abiden." } }
    ],
    sizceSorusu: "Sizce Şükrü abinin dediği çıkar mı?",
    sizceSecenekleri: [
      { etiket: "Çıkar, hep çıkıyor", etkiAnahtari: "umut", kaydirma: 0,
        hatirlatma: "Dün Şükrü abinin dediğinin çıkacağını söylemiştin." },
      { etiket: "Bu kez şaşar", etkiAnahtari: "karamsar", kaydirma: 0,
        hatirlatma: "Dün Şükrü abinin bu kez şaşacağını söylemiştin." }
    ]
  },

  {
    id: "abla",
    kategori: "ABLA",
    baslik: "ABLANIN SOFRASI",
    metin: "Abla hepsini yemeğe çağırdı. Nuri'nin tabağını ayrı koydu: \"Bu çocuk sana emanet, sen de bu evin direğisin.\"",
    replikler: [
      { kim: "abla", ifade: "sevincli", metin: "Elinizi yıkayın, sofra hazır." },
      { kim: "abla", ifade: "normal", metin: "Bu çocuk sana emanet Nuri." },
      { kim: "nuri", ifade: "sevincli", metin: "Başüstüne abla." }
    ],
    agirlik: 1,
    tekrarYok: true,
    secenekler: [
      { etiket: "Sofraya otur", etki: { sayac: { ad: "nuriSakin", deger: 3 }, not: "Nuri üç gün kimseye parlamayacak." } }
    ],
    sizceSorusu: "Sizce Nuri bu hafta kimseye parlamaz mı?",
    sizceSecenekleri: [
      { etiket: "Parlamaz", etkiAnahtari: "umut", kaydirma: 0,
        hatirlatma: "Dün Nuri'nin sakin kalacağını söylemiştin." },
      { etiket: "İlk lafta parlar", etkiAnahtari: "karamsar", kaydirma: 0,
        hatirlatma: "Dün Nuri'nin ilk lafta parlayacağını söylemiştin." }
    ]
  },

  {
    id: "kro_emanet",
    kategori: "KRO",
    baslik: "DÜKKÂN EMANET",
    metin: "Noterde iş var, dükkân Kro'ya kaldı. \"Söz dayı, hiçbir şeye dokunmam.\"",
    replikler: [
      { kim: "nuri", ifade: "normal", metin: "Noterde işim var. Dükkân sana emanet." },
      { kim: "kro", ifade: "sevincli", metin: "Söz dayı, hiçbir şeye dokunmam." },
      { kim: "drej", ifade: "normal", metin: "İşte bundan korkuyorum ortak." }
    ],
    agirlik: 1,
    kosul: function (state) { return state.stok.length > 0; },
    temelEtki: { aksiyon: -1, not: "Yarım gün noterde geçti: bugün bir aksiyon eksik." },
    secenekler: [
      {
        etiket: "Mecbur, emanet",
        etki: {
          aksamda: {
            sans: 0.5,
            evet: { stokSat: 0.95 },
            hayir: { not: "Kro: sinek bile uçmadı dayı, valla bekledim." }
          }
        }
      }
    ],
    sizceSorusu: "Sizce Kro yarın dükkânı batırır mı?",
    sizceSecenekleri: [
      { etiket: "Kro'ya güven", etkiAnahtari: "guven", kaydirma: 1,
        hatirlatma: "Dün Kro'ya güvenip dükkânı ona bırakmıştın." },
      { etiket: "Dükkânı kilitle", etkiAnahtari: "kilit", kaydirma: -1,
        hatirlatma: "Dün tedbiri elden bırakmamıştın." }
    ]
  },

  {
    id: "riza_araba",
    kategori: "RIZA",
    baslik: "BOYASIZ DİYOR",
    metin: "Rıza kendi arabasını bize sıkıştırmaya çalışıyor: \"Boyasız, değişensiz, kardeşim sana veriyorum.\" Drej gözlüğünü çıkardı.",
    replikler: [
      { kim: "riza", ifade: "normal", metin: "Boyasız, değişensiz. Kardeşim sana veriyorum." },
      { kim: "drej", ifade: "normal", metin: "Rıza'nın boyasızı hep boyalı çıkar." }
    ],
    agirlik: 2,
    secenekler: [
      { etiket: "Bir bakalım", etki: { ilan: { tip: "riza" }, not: "Rıza'nın arabası ilan listesinde. Sabrı boldur, kolay kalkmaz." } },
      { etiket: "Kalsın", etki: { not: "Rıza'nın arabasına bakmadık." } }
    ],
    sizceSorusu: "Sizce Rıza'nın arabası gerçekten boyasız mı?",
    sizceSecenekleri: [
      { etiket: "Ekspertize bak", etkiAnahtari: "kilit", kaydirma: 0,
        hatirlatma: "Dün Rıza'nın sözüne değil rapora bakacağını söylemiştin." },
      { etiket: "Rıza'ya inan", etkiAnahtari: "guven", kaydirma: 0,
        hatirlatma: "Dün Rıza'ya inanmıştın. Drej hâlâ gülüyor." }
    ]
  },

  {
    id: "kro_kavga",
    kategori: "KRO",
    baslik: "AVLUDA KAVGA",
    metin: "Kro ile Rıza avluda birbirine girmiş. Bir cam kırık, sanayi seyrediyor: \"Dayı o başlattı, ben anahtar paramı istedim.\"",
    replikler: [
      { kim: "kro", ifade: "sinirli", metin: "Dayı o başlattı! Anahtar paramı istedim." },
      { kim: "riza", ifade: "sinirli", metin: "Camı kim ödeyecek Nuri?" },
      { kim: "nuri", ifade: "sinirli", metin: "Bütün sanayi bizi seyretti." }
    ],
    agirlik: 1,
    temelEtki: { itibar: -5, not: "Avluda kavga: sanayide adımız konuşuluyor." },
    secenekler: [
      { etiket: "Uzlaş", etki: { kasa: -15000, not: "Cam parası verildi, el sıkışıldı." } },
      {
        etiket: "Mahkemeye kalsın",
        etki: {
          gecikme: {
            gun: 5,
            sans: 0.5,
            etki: { kasa: -40000, not: "Mahkeme Rıza'yı haklı buldu: 40.000 ödendi." },
            bosNot: "Mahkeme düştü, kimse bir şey ödemedi."
          },
          not: "Kâğıda döküldü. Beş gün sonra belli olacak."
        }
      }
    ],
    sizceSorusu: "Sizce mahkeme kimi haklı bulur?",
    sizceSecenekleri: [
      { etiket: "Bizi", etkiAnahtari: "umut", kaydirma: -1,
        hatirlatma: "Dün mahkemenin bizi haklı bulacağını söylemiştin." },
      { etiket: "Rıza'yı", etkiAnahtari: "karamsar", kaydirma: 1,
        hatirlatma: "Dün mahkemenin Rıza'yı haklı bulacağını söylemiştin." }
    ]
  },

  {
    id: "sikayet",
    kategori: "ŞİKÂYET",
    baslik: "KAPIDA ŞİKÂYET",
    metin: "Sattığımız araba kapıda. Alan adam ekspertiz raporunu masaya koydu: \"Bunu bana söylemediniz.\"",
    replikler: [
      { kim: "musteri", ifade: "sinirli", metin: "Bunu bana söylemediniz abi." },
      { kim: "musteri", ifade: "sinirli", metin: "Raporu getirdim. Paramı geri istiyorum." },
      { kim: "drej", ifade: "normal", metin: "Deftere yazdım ortak. Eksideyiz." }
    ],
    agirlik: 0,
    gizli: true,
    secenekler: [
      { etiket: "Parayı geri ver", etki: {} }
    ],
    sizceSorusu: "Sizce dün satılan erebeden ses çıkar mı?",
    sizceSecenekleri: [
      { etiket: "Çıkmaz", etkiAnahtari: "umut", kaydirma: 0,
        hatirlatma: "Dün o erebeden ses çıkmaz demiştin." },
      { etiket: "Çıkar", etkiAnahtari: "karamsar", kaydirma: 0,
        hatirlatma: "Dün ses çıkacağını sezmiştin." }
    ]
  },

  // Adim 19 — konsinye: Riza arabayi birakir, komisyonu bolusuruz
  {
    id: "riza_konsinye",
    kategori: "RIZA",
    baslik: "SEN SAT, KOMİSYON SENİN",
    metin: "Rıza bir araba getirdi: \"Benim müşterim yok, senin tezgâh işliyor. Sen sat, bana net ver.\"",
    replikler: [
      { kim: "riza", ifade: "normal", metin: "Benim tezgâh durgun, seninki işliyor." },
      { kim: "riza", ifade: "normal", metin: "Sen sat, bana net ver. Üstü senin." },
      { kim: "drej", ifade: "normal", metin: "Rıza'nın arabası ortak. Dikkatli bak." }
    ],
    agirlik: 2,
    kosul: function (state) {
      return state.stok.length < G.config.KAPASITE && state.gun > 3;
    },
    secenekler: [
      {
        etiket: "Tezgâha koy",
        etki: { ozel: "rizaKonsinye" },
        sonuc: "Araba tezgâha kondu: sahibine net ödenecek, üstü bize kalacak."
      },
      {
        etiket: "Kendi arabana kendin bak",
        etki: { itibar: -1 },
        sonuc: "Rıza arabayı geri götürdü. \"Sen bilirsin\" dedi."
      }
    ],
    sizceSorusu: "Sizce Rıza'nın bıraktığı erebe tezgâhta kaç gün durur?",
    sizceSecenekleri: [
      { etiket: "Çabuk gider", etkiAnahtari: "umut", kaydirma: 0,
        hatirlatma: "Rıza'nın erebesi çabuk gider demiştin." },
      { etiket: "Elde kalır", etkiAnahtari: "karamsar", kaydirma: 0,
        hatirlatma: "Rıza'nın erebesinin elde kalacağını sezmiştin." }
    ]
  },

  // Polis: yegen emanet arabayla gece gezdi, ceza geldi (dizide 19. bolum)
  {
    id: "hiz_cezasi",
    kategori: "POLİS",
    baslik: "HIZ CEZASI",
    metin: "Tezgâhtaki arabaya hız cezası gelmiş. Tarih, Kro'nun gece gezdiği gün.",
    replikler: [
      { kim: "polis", ifade: "normal", metin: "Bu araç sizin üzerinize kayıtlı abi." },
      { kim: "kro", ifade: "normal", metin: "Dayı yemin ederim yavaş gidiyordum." },
      { kim: "nuri", ifade: "sinirli", metin: "Yavaş gidene radar ceza yazmaz Kuro!" }
    ],
    agirlik: 2,
    kosul: function (state) {
      return state.stok.length > 0 && state.gun > 4;
    },
    secenekler: [
      {
        etiket: "Peşin öde (indirimli)",
        etki: { kasa: -Math.round(9500 * 0.75) },
        sonuc: "Ceza peşin ödendi, dörtte üçü yetti."
      },
      {
        etiket: "İtiraz edelim",
        etki: {
          sans: 0.35,
          evet: { not: "İtiraz tuttu: radar kalibrasyonu geçersizmiş, ceza silindi." },
          hayir: {
            gecikme: { gun: 4, tur: "ceza", etki: { kasa: -9500, not: "İtiraz tutmadı, ceza tam tutardan ödendi." } }
          }
        },
        sonuc: "Dilekçe verildi. Birkaç gün içinde belli olur."
      }
    ],
    sizceSorusu: "Sizce yeğenin cezasına itiraz tutar mı?",
    sizceSecenekleri: [
      { etiket: "Tutar", etkiAnahtari: "umut", kaydirma: 0,
        hatirlatma: "İtirazın tutacağını söylemiştin." },
      { etiket: "Tutmaz", etkiAnahtari: "karamsar", kaydirma: 0,
        hatirlatma: "İtirazın tutmayacağını sezmiştin." }
    ]
  }
];
