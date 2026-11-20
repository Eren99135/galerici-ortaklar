# 07 — Ekranlar, Arayüz ve Ton

## Görsel yön: dizinin kapak şablonu (karar #9)
Oyun, dizinin Instagram kapaklarının görsel dilini taşır. Kapak şablonu (2026-11-18'de profilden gözlemlendi):
- Sarı hap biçiminde etiket: **"PART 45"**
- Altında büyük, beyaz, kalın, büyük harfli tek kelimelik başlık, koyu gölgeli: **"BELKEMİĞİ"**
- Altında kırmızı bant, içinde beyaz büyük harfli soru: **"YEĞEN NASIL SIYRILACAK?"**
- En altta siyah şerit.
- Arka plan: gerçekçi Türkiye mekânları (noter, gece galeri önü, sanayi). Sıcak iç mekân ışığı ya da gece sodyum lambası tonları.

### Palet (başlangıç değerleri; `style.css` içinde `:root` değişkenleri)
| Token | Renk | Kullanım |
|---|---|---|
| `--sari` | `#F6C12A` | Gün etiketi, ana buton, kasa vurgusu |
| `--kirmizi` | `#C8202E` | Soru bandı, uyarılar, zarar |
| `--yesil` | `#3FA34D` | Kâr, kabul |
| `--gece` | `#12161F` | Ana zemin |
| `--komur` | `#0B0B0D` | Alt şeritler, üst bar |
| `--bej` | `#EFE6D6` | Kart yüzeyleri (sıcak iç mekân hissi) |
| `--turuncu` | `#E88A2E` | Gece lambası vurgusu, gerginlik göstergesi |
| `--beyaz` | `#FFFFFF` | Başlıklar (koyu gölgeyle) |

### Tipografi
- **Başlık:** Çok kalın, büyük harf, sıkışık bir sans-serif; kapaklardaki gibi koyu gölgeli. Türkçe karakterleri (İ, Ş, Ğ) doğru göstermeli.
- **Gövde:** Okunaklı sans-serif.
- Fontlar proje klasörüne konur (ör. `fonts/`), internet olmadan da çalışsın.

### Şablonun oyundaki karşılıkları
- **Akşam raporu ve "Sizce?" ekranı = kapak.** Sarı etiket "GÜN 12", büyük beyaz başlık günün özeti tek kelimeyle ("KAZIK", "BEREKET", "EKSİDEYİZ"), kırmızı bantta "Sizce?" sorusu, alt şeritte güncel kasa. Oyunun imza ekranı bu olur.
- **Olay kartları:** Aynı şablonun küçük hali: sarı etiket kartın kategorisi ("RIZA", "KRO", "BÜROKRASİ"), başlık, kırmızı bantta seçim sorusu.
- **Kasa ve sayılar:** Büyük, beyaz, gölgeli; kâr yeşil, zarar kırmızı.
- **Mekân arka planları:** Her ekranın arkasında bulanık, karartılmış bir mekân görseli (dükkân, ekspertiz, noter, kahve). Üstteki kartlar okunaklı kalsın diye arka plan %40–60 karartılır.

### Görseller ve karakterler (telif sınırı)
- Dizinin karakter tasarımları ve görselleri o hesabın emeğidir; oyuna **kopyalanmaz**, ekran görüntüsü kullanılmaz. Karakterlerin benzerini üretmeye de çalışılmaz.
- **Mekân arka planları:** Eren'in kendi çektiği sanayi, galeri, noter fotoğrafları (en kişisel seçenek) ya da lisansı serbest fotoğraflar. Fotoğraf gelene kadar CSS gradyanı yer tutucusu kullanılır.
- **Karakter portreleri:** Oyuna özgü, sade karikatür figürler (aşağıdaki künye). Dizinin karakter tasarımları kopyalanmaz, ekran görüntüsü kullanılmaz.
- **Karakter renkleri:** Nuri `--sari` (hardal), Drej `--bej` üstüne lacivert, Kro `--turuncu`, Rıza `--kirmizi`.
- **Araba görselleri:** MVP'de model adı + renge göre boyanan tek bir araba silueti (CSS/SVG).

### Görsel roman yapısı (Adım 15, karar #17)

Kodla çizilen sahneler bırakıldı. Her ekranın üstünde bir **sahne** var:

```
arka plan görseli  +  önünde karakter PNG'leri  +  konuşan karakterin baloncuğu
```

- Konuşan karakter tam parlaklıkta ve %4 büyük; diğerleri hafif karartılır (`brightness(.72)`).
- **Siluet ve "portre" modu yok (Adım 16):** karakter görseli bulunamazsa figür çizilmez, yerinde sadece isim etiketi durur; konuşma baloncuğu zaten konuşanın adını taşır. Bulunamayan görsel bir kez denenir, sonraki çizimlerde istenmez.
- Karakterler üç konumda durur: `sol` · `orta` · `sag`.
- Baloncuk konuşanın üstünde çıkar, **en fazla 12 kelime** (test bunu zorluyor).
- Tıklayınca sıradaki replik gelir (`js/diyalog.js` kuyruğu); diyalog bitince ekranın
  düğmeleri (kart seçenekleri, teklif kutusu) görünür.

**Dosya adı kuralı** — görsel atıldığı an kod değişmeden yerine oturur:

| Ne | Yol | Yedek zinciri |
|---|---|---|
| Mekân | `img/mekan/<mekan>.jpg` | `.png` → `.webp` → gradyan + mekân adı yer tutucusu |
| Karakter | `img/karakter/<kisi>-<ifade>.png` | `.webp` → `<kisi>-normal.png` → sadece isim etiketi |

**Mekânlar (11):** galeri-onu · galeri-ici · sanayi-avlu · ilan-sokak · ekspertiz · noter · buro · ev-sofra · kahve · gece-sanayi · yol
**Karakterler (13):** nuri · drej · kro · riza · sukru · abla · satici · musteri · noter · teknisyen · musavir · cuneyt · polis
**İfadeler (3):** normal · sevincli · sinirli  *(eski adlar — kizgin, sasirmis, uzgun, kurnaz — otomatik bu üçüne düşer)*

Ölçüler ve kural `img/OKU.md` dosyasında; `sahne-galeri.html` hangi dosyanın gerektiğini tek sayfada gösterir.

**Karakter görünümü (Eren'in tarifi, görselleri üretirken esas alınır):** Nuri göbekli, ön saçı açık, gür bıyıklı, gömlekli; Drej uzun, ince, yorgun, gözlüklü; Kro keko ceketli, jöleli saçlı. Dizinin kendi çizimleri kullanılmaz (karar #9).

### Başlangıç rehberi (Adım 13, karar #15)

- Üst barın altında bant: `ADIM 3/11` + o adımın repliği (Drej kuralı anlatır, Nuri acele ettirir) + "Kapat".
- Adımlar `data/rehber.js` içinde veri: `{id, kim, ekran, metin, kosul(state)}`. Koşul sağlanınca kendiliğinden ilerler.
- Üst barda "?" butonu o ekranın yardım kartını açar (11 ekran için metin, aynı dosyada).
- Rehber kapatılabilir, kayda girer, yardım kartından "Rehberi yeniden aç" ile geri gelir.

### Diğer
- Masaüstü öncelikli ama telefonda da kırılmasın (en dar 380 px). Kapak şablonu dikey ekranda da çalışacak şekilde ortalanır.

## Ekranlar
1. **Dükkân (ana ekran)**
   - Üst bar: Gün x/30 · Kasa · İtibar (çubuk) · Kalan aksiyon (3 nokta).
   - Stok: en fazla 4 kart (model, alış, ilan fiyatı, bilinen kusur sayısı, "müşteri bekliyor" rozeti).
   - Bekleyen müşteriler listesi.
   - Butonlar: İlanlara bak · Günü bitir.
2. **İlanlar:** Günün ilanları kart halinde. Kro'nun getirdiği ilanda "Kro buldu" etiketi. Kartta satıcının iddiası tırnak içinde.
3. **Araba detayı:** Bilgiler, göz kontrolü sonucu, ekspertiz butonları ve fiyatları. Kusur listesi: bulunanlar açık, bulunmayanlar "?" satırı olarak (kaç tane olduğu da bilinmez; sadece "Başka bir şey var mı, bilmiyoruz" satırı).
4. **Pazarlık:** Sol: satıcının replik balonu + ruh hâli göstergesi. Orta: teklif geçmişi (dizi ritmi). Sağ/alt: teklif kutusu (+/− 10.000, 50.000), koz butonları, karakter yetenek butonu, "Vazgeç".
5. **Satış görüşmesi:** Önce dürüstlük seçimi (iki büyük buton), sonra pazarlık ekranının aynısı ters yönde.
6. **Olay kartı:** Ekran ortasında büyük kart, başlık, metin, seçenek butonları.
7. **Akşam raporu:** Gelir/gider dökümü, günün notları ("Fazla verdik ortak"), güncel kasa büyük punto, en altta **"Erebe gider, pere gelir!"**
8. **Sizce?:** Rapordan sonra kart gibi açılır; soru + iki seçenek.
9. **Oyun sonu:** Net varlık, unvan, istatistikler (alınan/satılan araba, toplam kâr, yakalanan dolandırıcı, saklanan kusur, en iyi pazarlık). "Yeni oyun" ve "Aynı tohumla tekrar".

Ayrıca: köşede küçük **"Defter"** butonu: o güne kadarki alış-satış listesi (ilk sürümde basit tablo).

## Ton ve diyalog
- **Ayrıntılı kaynak: `kaynaklar/ton-rehberi.md`** (karakter kalıpları, pazarlık dili, ritüeller). Replik yazmadan önce oku.
- Dil: günlük, esnaf ağzı, kısa cümleler. "Erebe", "pere", "ortak", "kuro", "abi", "dayı".
- Replikler `data/replikler.js` içinde, yapı:
```js
replikler.satici[tip][durum] = ["...", "...", "..."]
// durum: acilis | karsiTeklif | hakaret | koz | kabul | kalkis | geriDonus
replikler.musteri[tip][durum] = [...]
replikler.nuri[durum], replikler.drej[durum], replikler.kro[durum]
```
- Her durum için en az 3, mümkünse 5 varyasyon. Aynı replik art arda gelmez.
- Replik içinde yer tutucular: `{fiyat}`, `{model}`, `{parca}`. Ör. *"Abi {model} bu, {fiyat} az bile."*
- Dizideki replikler birebir kopyalanmaz; aynı ruhta yenileri yazılır.

## Erişilebilirlik ve kullanılabilirlik
- Her önemli aksiyon klavyeyle yapılabilir (Enter = teklif ver).
- Para her yerde `1.575.000 TL` biçiminde.
- Geri alınamaz aksiyonlarda (alış onayı, günü bitir) tek satırlık onay.
