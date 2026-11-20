# 08 — Teknik Mimari

## Kısıtlar (neden böyle)
- `index.html` çift tıklanınca (`file://`) çalışmalı. ES modülleri `file://` altında tarayıcılarda engellenir, bu yüzden **klasik script etiketleri** ve tek global isim alanı `window.G` kullanılır.
- Paket yöneticisi ve build yok.

## Dosya yapısı
```
galerici/
├── index.html
├── style.css
├── js/
│   ├── config.js      // G.config — tüm denge sayıları
│   ├── rng.js         // G.rng — tohumlu RNG (mulberry32)
│   ├── yardimci.js    // G.paraYaz, G.yuvarla, G.sec, G.aralik
│   ├── state.js       // G.state, yeniOyun(tohum), kaydet(), yukle()
│   ├── araba.js       // ilanUret, gercekDeger, kusurUret
│   ├── ekspertiz.js   // ekspertizYap(araba, seviye)
│   ├── pazarlik.js    // alisBaslat, alisTeklif, kozKullan; satisBaslat, satisTeklif
│   ├── musteri.js     // musteriGelisleri, musteriUret, durustlukSecimi
│   ├── karakterler.js // nuriAgiz, drejHesap, kroSabah
│   ├── olaylar.js     // kartCek, etkiUygula, bekleyenEtkileriIsle
│   ├── gun.js         // fazIlerle, sabah, aksam, oyunBittiMi
│   ├── ui.js          // tüm DOM; ekran çizimi ve olaylar
│   ├── sim.js         // denge simülasyonu (konsoldan çalışır)
│   └── test.js        // basit test koşucusu (test.html ile)
├── data/
│   ├── modeller.js
│   ├── kartlar.js
│   └── replikler.js
├── fonts/             // başlık ve gövde fontları (yerel, internetsiz çalışır)
├── img/               // mekân arka planları (Eren'in fotoğrafları gelene kadar boş; CSS gradyanı yer tutar)
├── test.html          // test.js'i çalıştırır, sonuçları sayfada listeler
└── context/ ...       // bu klasör
```

### İsim alanı kalıbı
Her dosya kendini `window.G` üzerine ekler; hiçbir dosya global değişken tanımlamaz.
```js
// config.js — ilk yüklenen dosya
window.G = window.G || {};
G.config = { GUN_SAYISI: 30, /* ... */ };

// data/modeller.js
G.data = G.data || {};
G.data.modeller = [ /* ... */ ];

// araba.js
G.araba = { ilanUret(state) { /* ... */ }, gercekDeger(araba) { /* ... */ } };
```

### Script sırası (index.html)
`config → rng → yardimci → data/* → state → araba → ekspertiz → pazarlik → musteri → karakterler → olaylar → gun → ui`
`sim.js` ve `test.js` sadece `test.html` içinde yüklenir.

## Sorumluluklar
- **Mantık modülleri** state'i alır, değiştirir ya da yeni değer döndürür; DOM'a ve `localStorage`'a dokunmaz. Bu sayede `sim.js` oyunu arayüzsüz oynatabilir.
- **ui.js** tek yönlü çalışır: kullanıcı aksiyonu → mantık fonksiyonu → `ciz()` (tüm ekranı state'ten yeniden çizer). Karmaşık kısmi güncelleme yok.
- **gun.js** faz geçişlerinin tek sahibidir.

## State şeması
```js
G.state = {
  surum: 1, tohum, rngDurum,
  gun, faz, aksiyon,
  kasa, itibar,
  ilanlar: [Araba], stok: [Araba], musteriler: [Musteri],
  aktifPazarlik: null | { tur: "alis"|"satis", arabaId, musteriId?, konusan, taban/tavan, karsi, sabir, kullanilanKozlar, yetenekKullanildi, gecmis: [] },
  yarinkiKart: null | kartId, sizceSecimi: null,
  bayraklar: { bedavaEkspertiz, bereket, nuriSakin: 0, nuriYok: false, kroYok: false, sahteIlanGun: 0, vergiIndirimi },
  bekleyenEtkiler: [{ gun, etki }],
  gunNotlari: [], defter: [], istatistik: {...}
}
```
- State JSON'a çevrilebilir olmalı. Kayıt anahtarı: `galerici_kayit_v1`. Şema değişirse `surum` artar; eski kayıt uyumsuzsa yeni oyun başlar.
- RNG durumu da kaydedilir; yüklenen oyun aynı şekilde devam eder.

## RNG
`mulberry32(tohum)` ve yardımcılar: `G.rng.sayi()` (0–1), `G.rng.aralik(min, max)`, `G.rng.tam(min, max)`, `G.rng.sec(dizi)`, `G.rng.agirlikliSec([{deger, agirlik}])`, `G.rng.sans(p)`.

## Test ve doğrulama
- `test.html`: Bağımsız küçük test koşucusu (`G.test("ad", () => G.esit(a, b))`). Kritik testler:
  - `03` §6 BMW senaryosu birebir sayılarla.
  - Aynı tohum → aynı ilk 5 günün ilanları.
  - Kayıt → yükle → state aynı.
  - `gercekDeger` ve vergi hesapları.
- `sim.js`: `G.sim.calistir({ oyun: 100, bot: "akilli" | "saf" | "hepSakla" | "hepSoyle" })`. Çıktı: ortalama net varlık, kazanma oranı, batma oranı, ortalama araba başı kâr.

## Hata yönetimi
- Kasa yetersizse alış butonu pasif; neden yazılı ("Kasada pere yok ortak").
- Beklenmedik durumda konsola `console.error` ve oyuncuya küçük bir uyarı; oyun çökmez.
