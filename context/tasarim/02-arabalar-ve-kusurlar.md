# 02 — Arabalar, Kusurlar, Satıcılar

## Veri yapısı
```js
Araba = {
  id,                    // "a17"
  marka, model, yil, km, renk,
  piyasaDegeri,          // temiz haliyle değeri (TL)
  kusurlar: [Kusur],
  iddia: { boyasiz: bool, degisensiz: bool, tramer: number },  // satıcının söylediği
  saticiTipi: "durust" | "abartici" | "dolandirici",
  istenenFiyat,
  ilanYasi,              // gün
  kaynak: "ilan" | "kro" | "olay",
  // stoğa girince eklenir:
  alisFiyati, masraflar, ilanFiyati, stogaGirisGunu
}

Kusur = {
  tip,                   // "boya" | "degisen" | "tramer" | "lastik" | "motor" | "agirHasar" | "sase"
  parca,                 // "sol ön çamurluk" vb. (tramer/motor için boş olabilir)
  etki,                  // TL değer kaybı
  gorunurluk: "acik" | "normal" | "gizli",
  ortayaCikti: bool,     // oyuncu biliyor mu
  musteriyeSoylendi: bool
}

gercekDeger(araba) = piyasaDegeri − Σ etki   // fonksiyon, alan olarak saklanmaz
```

## Model kataloğu
Temiz piyasa değerleri. Her ilanda ±%8 oynar.

| Model | Değer | Yıl aralığı | Model | Değer | Yıl aralığı |
|---|---|---|---|---|---|
| Fiat Egea | 1.030.000 | 2018–2022 | Toyota Corolla | 1.250.000 | 2017–2021 |
| Renault Clio | 950.000 | 2017–2021 | Honda Civic | 1.300.000 | 2017–2021 |
| Renault Megane | 1.250.000 | 2016–2021 | Seat Leon FR | 1.550.000 | 2018–2022 |
| VW Golf | 1.200.000 | 2015–2020 | BMW 3.20i | 1.750.000 | 2015–2019 |
| VW Passat | 1.350.000 | 2015–2019 | Toyota Hilux | 1.900.000 | 2017–2021 |
| Audi A6 (eski kasa) | 850.000 | 2009–2012 | Mercedes W124 (klasik) | 1.100.000 | 1990–1995 |

- Değer, yıl aralığının ortası için verilmiştir. Her yıl farkı ±%3.
- Beklenen km = (2026 − yıl) × 15.000. Her 20.000 km sapma ∓%1. W124'te km etkisi yok.
- Sonuç 10.000 TL'ye yuvarlanır.

## Kusur tipleri
| Tip | Etki | Görünürlük | Adet / olasılık |
|---|---|---|---|
| boya | piyasa × %1,5 | normal | 0–4 parça |
| degisen | piyasa × %3 | normal | 0–2 parça |
| tramer | tramer tutarı × 0,6 | normal | 20.000–120.000, 10.000'e yuvarlı |
| lastik | 20.000 sabit | acik | %15 |
| motor | piyasa × %8 | gizli | |
| agirHasar | piyasa × %25 | gizli | |
| sase | arabayı satılamaz yapar | gizli | Sadece dolandırıcıda, %40 |

Parça listesi: kaput, tavan, bagaj kapağı, sol/sağ ön çamurluk, sol/sağ arka çamurluk, sol/sağ ön kapı, sol/sağ arka kapı.

## Satıcı tipleri
| Tip | Oran | İddia | İstenen fiyat | Kusur profili |
|---|---|---|---|---|
| durust | %40 | Gerçeği söyler | gerçek değer × 1,03–1,08 | 0–2 boya, %20 tramer, gizli kusur yok |
| abartici | %45 | "Boyasız, değişensiz, tramer yok" | piyasa × 1,00–1,08 | 1–4 boya, %40 değişen, %60 tramer, %20 motor |
| dolandirici | %15 | Her şey mükemmel | piyasa × 0,82–0,90 | En az bir ağır gizli kusur (agirHasar ya da sase) + abartıcı profili |

**Tasarım kuralı:** Piyasanın belirgin altındaki ilan şüphelidir. Oyuncu bunu zamanla öğrenmeli; arayüz bunu açıkça söylemez.

## İlan üretimi
- Her sabah 3–4 yeni ilan üretilir. Listede en fazla 6 ilan durur.
- İlan kartında görünenler: marka/model, yıl, km, renk, istenen fiyat ve satıcının iddiası ("Boyasız, tramersiz abi").
- `iddia`, satıcı tipine göre doldurulur. Dürüst satıcı bilinen kusurları sayar.

## Config anahtarları
`MODELLER, FIYAT_OYNAMA, YIL_ETKISI, KM_ADIM, KM_ETKISI, KUSUR_ETKILERI, SATICI_ORANLARI, SATICI_FIYAT_ARALIKLARI, GUNLUK_ILAN_MIN/MAKS, MAKS_ILAN`

## Katalog ve segment marjı (Adım 17, 2026-11-19)

Katalog 12 modelden **49 modele** çıktı: 285.000 TL'lik Şahin'den 2.000.000 TL'lik 5.20i'ye kadar. Her kayıtta bir `govde` alanı var (`sedan` · `hatchback` · `station` · `suv` · `pickup` · `ticari` · `klasik`); sahnedeki ve karttaki araba görselini o seçiyor. 2005 öncesi modellerde `kmEtkisiz: true` — yoksa beklenen kilometre `(2026 − yıl) × 15.000` ile 450 bine çıkıp piyasa değerini bozuyor.

**Segment marjı (karar #21):** müşteri bütçesi arabanın fiyat segmentine göre çarpanla düzeltilir (`SEGMENT_BUTCE`):

| Piyasa değeri | Çarpan |
|---|---|
| ≤ 600.000 | 1,09 |
| ≤ 1.200.000 | 1,03 |
| üstü | 0,975 |

Sebep: marj yüzdesi her arabada aynı olunca "kasanın yettiği en pahalı arabayı al" baskın strateji oluyordu; simülasyonda akıllı bot %93 kazanıyordu. Ucuz arabanın yüzdesel marjının yüksek olması hem gerçeğe uygun hem de "bugün hangi arabaya gideyim" sorusunu gerçek bir karara çeviriyor.
