# 06 — Olay Kartları ve "Sizce?"

## Kart yapısı
```js
Kart = {
  id,                     // "riza_laf"
  baslik, metin,          // ekranda görünen
  sizceSorusu,            // bir önceki akşam sorulacak soru
  sizceSecenekleri: [{ etiket, etkiAnahtari }],  // ±%20 olasılık kaydırması
  secenekler: [{ etiket, etki }],                 // seçimsiz kartta tek "Tamam" seçeneği
  agirlik,                // destede çekilme ağırlığı
  kosul?,                 // (state) => bool; ör. stokta araba var mı
  tekrarYok?,             // bir kez çıktıysa bir daha çıkmaz
  gizli?                  // sadece tetiklenince desteye girer (Şikâyet)
}
```
- Etkiler veri olarak tanımlanır, kod olarak değil: `{ kasa: -10000, itibar: +3, bayrak: "bedavaEkspertiz" }`. Olasılıklı etkiler: `{ sans: 0.5, evet: {...}, hayir: {...} }`. Böylece yeni kart eklemek sadece `data/kartlar.js` dosyasına satır eklemektir.
- Gecikmeli etkiler `state.bekleyenEtkiler` listesine `{ gun, etki }` olarak yazılır.

## MVP kart listesi (12)
| # | id | Kart | Seçenekler ve etki |
|---|---|---|---|
| 1 | riza_laf | **Rıza laf soktu** | Tavlaya otur: %50 → itibar +3, %50 → −10.000 · Görmezden gel: etki yok |
| 2 | kro_gezinti | **Kro emanet arabayla gezmiş** (koşul: stok > 0) | Rastgele bir stok arabaya +30 km. Azarla: etki yok · Üstünü ört: bir sonraki titiz müşteri %50 fark eder → itibar −5 |
| 3 | sahte_ilan | **Sahte ilan (Cüneyt)** (koşul: stok > 0) | Her gün itibar −3. Polise git: 3 gün sonra biter · Kro yem olsun: %60 yarın biter, %40 Kro yarın işe gelmez ve sahte ilan 3 gün daha sürer |
| 4 | cuma | **Cuma çıkışı** | Sadaka ver: −5.000, itibar +2, sonraki alış pazarlığında taban −%2 ("bereket") · Verme: etki yok |
| 5 | musavir | **Mali müşavir** | Bilgi kartı. %50 sonraki satışın vergisi %15 |
| 6 | kro_teklif | **Kro ilanlara saçma teklif yağdırmış** | %30 biri tutar: piyasa × 0,80 fiyatlı bir ilan gelir, satıcı tipi rastgele, pazarlık yok (fiyat sabit, al ya da bırak) |
| 7 | sukru_cay | **Şükrü abinin bürosunda çay** | Sonraki normal ekspertiz bedava |
| 8 | abla | **Ablanın yemeği** | Nuri 3 gün boyunca sinirlenmez |
| 9 | kro_emanet | **Dükkân Kro'ya emanet** | Bugün 1 aksiyon eksik. Akşam %50 "sinek bile uçmadı", %50 Kro bir stok arabayı piyasa × 0,95'e satmış (koşul: stok > 0) |
| 10 | riza_araba | **Rıza'nın "boyasız" arabası** | Listeye Rıza'nın ilanı girer: abartıcı satıcı, sabır 5 |
| 11 | kro_kavga | **Kro–Rıza kavgası** | İtibar −5. Uzlaş: −15.000 · Mahkemeye kalsın: 5 gün sonra %50 −40.000 |
| 12 | sikayet | **Şikâyet** (gizli) | `04` §3. Sadece kusur saklanıp satış yapılınca, 3–7 gün sonrasına planlanır. Bu kart çekilmez, zamanı gelince sabah kartının yerine geçer |

Sakin günler için destede ağırlığı yüksek bir **"Sakin gün"** kartı da vardır: *"Bugün sanayide sinek bile uçmuyor."* Etkisi yok.

## "Sizce?" mekaniği
- Akşam raporundan sonra **ertesi sabahın kartı önceden çekilir** ve onun `sizceSorusu` gösterilir:
  *"Güncel kasa: 6.240.000 TL. Sizce Kro yarın dükkânı batırır mı?"*
- İki seçenek sunulur (ör. "Kro'ya güven" / "Dükkânı kilitle"). Seçim o kartın olasılıklı etkilerini ±%20 kaydırır ya da küçük bir maliyetle riski azaltır.
- Sakin gün kartının sorusu bir şaka sorusudur (etkisiz): *"Sizce Nuri bu hafta tavlada Rıza'yı yener mi?"*
- **Olasılıklı etkisi olmayan kartlar** (Abla, Şükrü abi gibi): `sizceSecenekleri` iki tatlı-etkisiz seçenektir; seçim sadece ertesi sabahki kart metninde bir satırla anılır ("Dün Kro'ya güvenmiştin...").
- **Zamanlanmış kart** (Şikâyet) ertesi güne denk geliyorsa önceden çekilen kartın yerine o geçer; Sizce sorusu tehditkâr ama belirsiz olur: *"Sizce dün satılan erebeden ses çıkar mı?"*
- **30. günün akşamı** Sizce sorulmaz; doğrudan oyun sonu ekranına geçilir.

## Uygulama notları (2026-11-18, Adım 8)

- Kartın `temelEtki` alanı eklendi: seçimden bağımsız işleyen etki (Kro'nun +30 km'si, Kro–Rıza kavgasının itibar −5'i) buraya yazılır, seçeneklerin etkisi onun üstüne biner.
- Etki anahtarları `data/kartlar.js` başında listeli: `kasa, itibar, aksiyon, not, bayrak, sayac, kroYok, nuriYok, sahteIlan, ilan, stokKm, stokSat, gecikme, aksamda, sans/evet/hayir`. Yeni kart yazmak için kod değişmez.
- `aksamda` etkisi akşam raporundan hemen önce çözülür; "dükkân Kro'ya emanet" kartının akşam sürprizi böyle çalışıyor.
- Oyuncu karta bakmadan günü bitirirse (arayüzde mümkün değil, ama durum güvenliği için) kart düşer ve **etkisi işlemez**; akşam raporuna "Sabah kartına bakılmadı" notu girer.
- `sizceSorusu` ve `sizceSecenekleri` bütün kartlarda yazılı durumda, ama "Sizce?" ekranı Adım 9'da gelecek. Şimdilik hiçbir yerde gösterilmiyor.
- "Sizce?" seçenekleri iki alan kazandı (2026-11-18, Adım 9): `kaydirma` (0, 1 ya da −1; `SIZCE_KAYDIRMA` ile çarpılır ve kartın `sans` değerine eklenir — işaret, kartın `evet` dalını ne yöne ittiğine göre yazılır) ve `hatirlatma` (ertesi sabah kart ekranında görünen tek satır). `etkiAnahtari` seçeneğin kimliği olarak kaldı.
- Kaydırma **ilk zar atışında tükenir**. Kartın olasılığı gecikmeli ya da akşam etkisindeyse (mahkeme, dükkânın Kro'ya emaneti) kaydırma o kayda işlenir, zar günler sonra atılsa da tahmin işe yarar.
- Olasılığı olmayan kartlarda (Abla, Şükrü abi, Cuma, Rıza'nın arabası, sakin gün) `kaydirma` sıfırdır; seçim sadece ertesi sabahki hatırlatma satırında anılır. Tasarımın "tatlı-etkisiz seçenek" kuralı budur.
- İlan listesi doluysa kartın getirdiği ilan (Rıza'nın arabası, Kro'nun tuttuğu teklif) eklenmez; not olarak bildirilir.

## Ağırlıklar (başlangıç)
Sakin gün 4 · diğer kartlar 1–2 · Kro kartları toplam ağırlığı en fazla %35. Aynı kart art arda iki gün çıkmaz.

## Config / data
Kartlar `data/kartlar.js` içinde. Olasılık ve tutarlar kart tanımında durur; genel ayarlar (`SIZCE_KAYDIRMA`, `SAKIN_GUN_AGIRLIK`) config'te.

## Sonradan eklenen kartlar

| Kart | Kategori | Nereden |
|---|---|---|
| SEN SAT, KOMİSYON SENİN | RIZA | Adım 19, konsinye: Rıza arabasını bırakır |
| HIZ CEZASI | POLİS | Dizide 19. bölüm: Kro emanet arabayla gece gezer, ceza gelir |

**HIZ CEZASI:** Tezgâhta araba varsa ve gün 4'ü geçtiyse çıkar. Peşin ödersen cezanın dörtte üçü (`HIZ_CEZASI_ERKEN`), itiraz edersen %35 ihtimalle silinir, tutmazsa 4 gün sonra tam tutar kasadan düşer. Polis karakterinin oyundaki tek görünme yeri burası.
