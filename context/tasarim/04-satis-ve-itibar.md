# 04 — Satış, Masraflar, İtibar

## 1. İlan ve müşteri gelişi
- Araba stoğa girince oyuncu bir ilan fiyatı koyar. Varsayılan öneri: alış fiyatı × 1,08.
- Her sabah stoktaki her araba için müşteri gelme olasılığı:
```
algilananDeger = piyasaDegeri − Σ etki (yalnızca musteriyeSoylendi == true olan kusurlar)
                 // dürüstlük seçimi henüz yapılmadıysa: ortaya çıkmış kusurların hepsi söylenecekmiş gibi hesaplanır
itibarCarpani  = 0,6 + itibar / 125            // itibar 50 → 1,0 · 100 → 1,4
p = 0,35 × (algilananDeger / ilanFiyati)^4 × itibarCarpani + beklemeBonusu
p = min(p, 0,9)
```
- Gelen müşteri "bekleyen müşteriler" listesine girer (en fazla 3; 2 gün bekler).

## 2. Müşteri
```js
Musteri = { id, isim, tip: "pazarlikci" | "aceleci" | "titiz", arabaId, butce, sabir, gelisGunu }
```
| Tip | Oran | Bütçe | Sabır | Ekspertiz |
|---|---|---|---|---|
| pazarlikci | %45 | algılanan × 1,02–1,06 | 4 | Normal |
| aceleci | %30 | algılanan × 1,05–1,10 | 2 | %30 hiç yaptırmaz, kalan normal |
| titiz | %25 | algılanan × 1,03–1,08 | 3 | Her zaman premium |

İtibar etkisi: itibar > 70 → bütçe +%3, itibar < 30 → bütçe −%5.

## 3. Dürüstlük seçimi
Görüşme başında sorulur: **"Kusurları söyleyecek misin?"** (Kro konuşuyorsa bu seçim otomatik "söyle" olur; bkz. `05`.)

- **Söyle:** Bilinen tüm kusurlar `musteriyeSoylendi = true`. Bütçe yeniden hesaplanır (düşer). Müşterinin ekspertizi sadece oyuncunun da bilmediği kusurları bulabilir. Satış olursa itibar +3.
- **Sakla:** Bütçe söylenmemiş kusurlar hesaba katılmadan kalır (yüksek). Satış pazarlığından önce müşterinin ekspertizi yapılır. Saklanan her kusur için bulunma olasılığı:
  normal %70 · gizli %40 · titiz müşteride +%25 · aceleci ekspertizsizse %0.
  - **Bulunursa:** Pazarlık bozulur, müşteri gider, itibar −8 ("Galeride yalan var" dedikodusu).
  - **Bulunmazsa:** Satış devam eder ama desteye gizlice bir **Şikâyet kartı** eklenir. Kart 3–7 gün sonra çıkar: geri ödeme = saklanan kusurların etkisi × 1,5 ve itibar −12.

**Oyuncunun da bilmediği kusur** (ekspertiz yaptırmadan alınmış araba) müşterinin ekspertizinde çıkarsa: bütçe o kusurun etkisi kadar düşer, müşteri sabrı −1. İtibar değişmez (bilmiyordun). Şase uyumsuzluğu çıkarsa araba satılamaz: tek çıkış yolu araba pazarına %55 fiyatla elden çıkarmaktır.

**Denge hedefi:** Saklamanın beklenen değeri hafif negatif olmalı. Denge testinde "her zaman sakla" botu, "her zaman söyle" botundan ortalamada daha kötü bitirmeli.

## 4. Satış pazarlığı
Alış pazarlığının tersidir.
```
musteriTavan = butce
musteriAcilis = butce × 0,88–0,93 (10.000'e yuvarlı)
```
- Oyuncu fiyat `F` söyler.
- `F ≤ musteriTeklif` → anlaşma `musteriTeklif` üzerinden olur (müşteri zaten o kadar vermeye razı; oyuncu kendi aleyhine pere kaybetmez). Alıştaki `T ≥ karsi` kuralının aynası.
- `F ≤ tavan` → kabul.
- `tavan < F ≤ tavan × 1,10` → müşteri yükselir: `teklif = teklif + (tavan − teklif) × 0,4`, sabır −1.
- `F > tavan × 1,10` → "Kazık" tepkisi: sabır −2.
- Sabır 0 → müşteri gider: *"Ben bi düşüneyim abi."* %30 ihtimalle 2 gün sonra geri gelir.

**Taviz butonu "Lastikler bizden":** 20.000 TL masraf karşılığında müşteri sabrı +1 ve tavan +10.000. Görüşme başına bir kez.

## 5. Para ve masraflar
| Kalem | Tutar | Ne zaman |
|---|---|---|
| Ekspertiz | 7.500 / 15.000 | Alışta |
| Noter + plaka | 12.000 | Her alışta |
| Satış vergisi (oyun basitleştirmesi) | Pozitif kârın %20'si | Her satışta |
| Sabit gider | 8.000/gün | Akşam |
| Olay masrafları | Değişken | Kartla |

`kar = satisFiyati − alisFiyati − masraflar` · Araba başına hedef kâr: 30.000–150.000 TL (dizideki ölçek).

## 6. İtibar (0–100, başlangıç 50)
| Olay | Değişim |
|---|---|
| Dürüst satış | +3 |
| Saklanan kusur yakalandı | −8 |
| Şikâyet kartı | −12 |
| Sahte ilan dönemi (çözülene kadar) | −3/gün |
| Hayır işi | +2 |
| Kro–Rıza kavgası | −5 |
| Gün sonunda itibar 50'den farklıysa | 50'ye doğru 1 puan yaklaşır (sadece 5 günde bir) |

Etkileri: müşteri gelme olasılığı (§1) ve müşteri bütçesi (§2).

## Config anahtarları
`ILAN_FIYAT_ONERI, MUSTERI_P_TABAN, MUSTERI_P_US, MUSTERI_P_MAKS, MUSTERI_TIPLERI, DURUST_ITIBAR, YAKALANMA_OLASILIKLARI, YAKALANMA_ITIBAR, SIKAYET_GECIKME, SIKAYET_CARPAN, SIKAYET_ITIBAR, SATIS_ACILIS, SATIS_ADIM, KAZIK_ESIK, GERI_GELME, TAVIZ, VERGI_ORANI, SASE_HURDA_ORAN, ITIBAR_*`
