# 03 — Ekspertiz ve Alış Pazarlığı

Oyunun kalbi burası. Hedef his: dizideki "1.850 → 1.800 → 1.500 → 1.720 → 1.650 → 1.550 → 1.575'te anlaştık" akışı.

## 1. Ekspertiz

| Seçenek | Bedel | Açık | Normal | Gizli |
|---|---|---|---|---|
| Göz kontrolü (her ilanda otomatik) | 0 | %100 | %30 | %0 |
| Normal ekspertiz | 7.500 | %100 | %100 | %50 |
| Premium ekspertiz | 15.000 | %100 | %100 | %95 |
| "Satıcının tanıdığı ekspertiz" | 0 | %100 | %20 | %0 |

- Her kusur için zar bir kez atılır. Daha iyi bir ekspertiz sonradan yaptırılırsa yalnızca ortaya çıkmamış kusurlar için tekrar atılır.
- **Tanıdık ekspertiz tuzağı:** Rapor "Temiz, sıfır gibi" der ama sadece yukarıdaki oranlarla bulur. Satıcı abartıcı ya da dolandırıcıysa bu seçeneği teklif eder. Drej pazarlıkta seçiliyse uyarır: *"Bizim ekspertize gidelim ortak."*
- Ekspertiz masrafı arabaya yazılır (alınırsa `masraflar`), alınmazsa boşa gider.
- Ortaya çıkmamış kusurlar arabayla birlikte stoğa girer ve satışta müşterinin ekspertizinde çıkabilir (bkz. `04`).

## 2. Satıcının gizli değerleri
```
taban  = istenenFiyat × r × (1 − 0,01 × floor(ilanYasi / 5))
r      : durust 0,93–0,97 · abartici 0,86–0,92 · dolandirici 0,90–0,95
sabir  : durust 4 · abartici 3 · dolandirici 5
karsi  : başlangıçta istenenFiyat
```
Dolandırıcı az kırar çünkü zaten ucuz göstermiştir; sabrı yüksektir çünkü parayı almak ister.

## 3. Kusuru yüzüne vurmak (koz)
Ortaya çıkmış her **kusur tipi** için bir buton çıkar: *"Şu boyalara ne diyeceksin?"*, *"Tramer kaydı ne abi?"* Aynı tipteki kusurlar (ör. 2 boyalı parça) tek koz sayılır ve etkileri toplanır. Her koz bir kez kullanılabilir.
- Kusur, satıcının iddiasıyla **çelişiyorsa** (boyasız dedi, boya çıktı): `taban −= etki × 0,8`, `karsi −= etki × 0,8`, sabır −1.
- Satıcı kusuru **zaten söylediyse**: `taban −= etki × 0,3`, sabır değişmez. Satıcı: *"Abi onu baştan söyledim, fiyata kattım."*
- Taban, gerçek değerin %80'inin altına düşmez (satıcı "o pereye vermem" der).
- **Dolandırıcı satıcı kozu tanımaz:** Taban değişmez, sabır −2 ("Ben bilmem abi, araba böyle aldım"). Ağır kusuru ortaya çıkmış bir dolandırıcı ilanının doğru hamlesi masadan kalkmaktır. *(Neden: 2026-11-18 simülasyonunda bu kural olmadan dolandırıcı ilanları, ekspertizden sonra en kârlı ilanlar çıktı: araba başı ortalama ~90 bin net kâr, normal ilanlarda ~35–45 bin. "Ucuz ilanın bir derdi vardır" dersi tersine dönüyordu.)*

## 4. Teklif turu
Oyuncu teklif `T` girer (10.000 TL katları; arayüz +/− butonları ve yazma alanı sunar).

| Durum | Sonuç |
|---|---|
| `T ≥ karsi` | Kabul, `karsi` fiyatından anlaşılır (oyuncu fazlasını vermez) |
| `T ≥ taban` | Kabul, `T` fiyatından anlaşılır. `T > taban × 1,04` ise akşam raporunda "Fazla verdik ortak" notu |
| `T < taban` ve `karsi − T ≤ taban × 0,03` ve `orta = yuvarla((T + karsi) / 2) ≥ taban` | **Ortası** (karar #13): satıcı ortayı teklif eder, *"Ortası bu abi, ne sen yan ne ben."* Oyuncu kabul ederse `orta` fiyatından anlaşma; reddederse `karsi = orta`, sabır −1 ve tur normal akışa döner |
| `taban × 0,85 ≤ T < taban` | Karşı teklif: `karsi = max(taban, karsi − (karsi − taban) × 0,4)`, 10.000'e yuvarlanır. Sabır −1 |
| `T < taban × 0,85` | "Hakaret": sabır −2, `karsi = min(istenenFiyat, karsi × 1,01)`. **Karar #19: oyuncunun o pazarlıktaki ilk teklifi bu dala girmez**, normal karşı teklif gibi işlenir (sabır −1) |
| sabır ≤ 0 | Satıcı masadan kalkar. İlan bugün kapanır; %50 ihtimalle yarın geri gelir: *"Abi dünkü teklifin hâlâ geçerli mi?"* Geri dönen satıcının tabanı %2 düşük, sabrı 2'dir |

Kabul olduğunda: kapasite ve kasa kontrol edilir, noter + plaka (12.000) eklenir, araba stoğa girer.

**Gösterim:** Taban ve sabır sayı olarak gösterilmez. Ruh hâli metni gösterilir:
- sabır ≥ 3 → "Sakin" · 2 → "Gerginleşiyor" · 1 → "Kalkmak üzere"
Satıcının her repliği `replikler.js` içinden duruma ve satıcı tipine göre seçilir.

**Teklif geçmişi** ekranda listelenir: *"Sen: 1.500.000 → Satıcı: 1.720.000"* — dizinin ritmi buradan gelir.


## 4b. "Kalkıyoruz" blöfü (karar #13)

Pazarlık ekranında bir **Kalk** butonu var, pazarlık başına bir kez. Dizideki "kalkıyoruz" blöfünün karşılığı: alıcı masadan kalkar, satıcı çoğu zaman arkasından seslenir.

- Satıcı geri çağırma şansı (`KALK_GERI_CAGIRMA`): dürüst 0,40 · abartıcı 0,65 · dolandırıcı 0,55.
  Dolandırıcı parayı almak istediği için ortanın üstünde, dürüst satıcı fiyatına güvendiği için en düşük.
- **Çağırırsa:** *"Otur abi otur."* `taban −%3`, `karsi = max(taban, karsi − (karsi − taban) × 0,5)`, sabır **1'e sabitlenir** (son şans). Taban alt sınırı (§3) burada da geçerli.
- **Çağırmazsa:** pazarlık biter, §4'ün kalkış kuralı işler (ilan bugün kapanır, %50 yarın döner).

İkinci kez kalkmak yutmaz; buton bir kez kullanılır.

> Risk dengesi: blöf tutarsa ortalama %3 taban indirimi kazanılır, tutmazsa araba gider. Sabır 1'e indiği için çağırdıktan sonra tek teklif hakkı kalır. Denge testinde (Adım 11) "her pazarlıkta kalk" botu, hiç kalkmayan bottan daha iyi olmamalı; olursa ilk ayar `KALK_GERI_CAGIRMA` oranlarını düşürmek olur.

## 5. Kim konuşuyor?
Pazarlık başında Nuri ya da Drej seçilir (ayrıntı `05-karakterler.md`).
- **Nuri:** başlangıç sabrı +1. Yetenek "Ağız": taban −%3, ama %20 ihtimalle Nuri sinirlenir ve masa dağılır.
- **Drej:** ortaya çıkan kusurların toplam etkisini TL olarak görür, başlangıç sabrı −1. Yetenek "Hesap": tabanı ±%4 aralıkla tahmin eder.

## 6. Örnek akış (kontrol senaryosu)
BMW 3.20i, abartıcı satıcı ("boyasız, tramersiz"), istenen 1.850.000, r = 0,90 → taban 1.665.000. Nuri konuşuyor → sabır 3 + 1 = 4.
Normal ekspertiz: 2 boyalı parça (2 × 26.250 = 52.500) + 85.000 tramer (etki 51.000).

| Adım | Taban | Karşı | Sabır |
|---|---|---|---|
| Başlangıç | 1.665.000 | 1.850.000 | 4 |
| Koz: boyalar (çelişiyor, −42.000) | 1.623.000 | 1.808.000 | 3 |
| Koz: tramer (çelişiyor, −40.800) | 1.582.200 | 1.767.200 | 2 |
| Teklif 1.500.000 → karşı teklif | 1.582.200 | 1.690.000 | 1 |
| Teklif 1.590.000 → **kabul** | | | |

Sonuç 1.590.000; dizideki 1.575.000'e yakın. Oyuncu burada 1.580.000 teklif etseydi (tabanın hemen altı) sabır bitecek ve satıcı kalkacaktı. Pazarlığın gerilimi bu: tabanın ne kadar yakınındasın, bilmiyorsun.

**Pazarlık kodu bu senaryoyla birim test edilir:** sabit girdilerle tablodaki sayılar birebir çıkmalı.

> Denge notu: Sabır çabuk tükeniyor olabilir. Oynayınca sıkıcı ya da cezalandırıcı gelirse ilk ayar `KOZ_SABIR_MALIYETI` (1 → 0,5) olur. Sonuç `hafiza.md` → Öğrenilenler'e yazılır.

## Config anahtarları
`EKSPERTIZ, TABAN_R, SABIR, ILAN_YASI_INDIRIM, KOZ_CELISKI_ORAN, KOZ_SOYLENMIS_ORAN, KOZ_SABIR_MALIYETI, TABAN_ALT_SINIR, HAKARET_ESIK, KARSI_ADIM, FAZLA_VERDIK_ESIK, GERI_DONME_OLASILIGI, NOTER_PLAKA, TEKLIF_ADIMI, ORTASI_ESIK, KALK_GERI_CAGIRMA, KALK_TABAN_INDIRIM, KALK_KARSI_ADIM, KALK_SABIR, DOLANDIRICI_KOZ_SABIR, HAKARET_KARSI_ARTIS, GERI_DONUS_TABAN, GERI_DONUS_SABIR, ILAN_YASI_ADIM`
