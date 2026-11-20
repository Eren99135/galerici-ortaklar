# 01 — Oyun Döngüsü

## Özet
- **Tür:** Tek oyunculu, sıra tabanlı galeri işletme ve pazarlık oyunu.
- **Süre:** 30 oyun günü, bir oturumda yaklaşık 30–45 dakika.
- **Çekirdek döngü:** ilan → (ekspertiz) → pazarlık → noter → stok → müşteri → (dürüst ol / sakla) → satış

## Bir gün
Her gün dört fazdan oluşur:

1. **Sabah – Olay kartı:** Desteden bir kart çekilir. Bazı kartlarda seçim yapılır (bkz. `06`).
   Aynı fazda yeni ilanlar üretilir (3–4 adet + Kro'nun ilanı) ve stok için müşteri gelişleri hesaplanır (bkz. `04`).
2. **Mesai – 3 aksiyon hakkı.**
3. **Akşam – Kasa raporu:** O günün alışları, satışları, masrafları ve güncel kasa gösterilir. Sabit gider düşülür.
4. **"Sizce?":** Ertesi günün olayına dair bir ipucu ve tek soruluk bir seçim gelir (bkz. `06`).

### Faz durumu (state.faz)
`"sabah" → "mesai" → "aksam" → "sizce" → (gun++) → "sabah"`
30. günün akşamından sonra `"bitti"`.

## Aksiyonlar
| Aksiyon | Hak | Açıklama |
|---|---|---|
| İlana git | 1 | Göz kontrolü bedava. Ardından ekspertiz ve pazarlık aynı aksiyonun içinde yapılır. Pazarlıktan çıkınca hak harcanmış olur |
| Müşteriyle görüş | 1 | Bekleyen bir müşteriyle satış pazarlığı |
| İlan fiyatını güncelle | 0 | Stoktaki bir arabanın fiyatını değiştir |
| Günü bitir | – | Kalan hakları yakar. Kullanılmayan her hak ertesi gün müşteri gelme şansına +%5 ekler (dükkânda beklemek) |

## Kısıtlar
- **Dükkân kapasitesi:** En fazla 4 araba stokta.
- **Sabit gider:** 8.000 TL/gün, akşam düşer.
- **Bekleyen müşteri:** En fazla 3. Bekleyen müşteri 2 gün içinde görüşülmezse gider.
- **İlanlar:** Görüşülmeyen ilanın `ilanYasi` her gün +1 olur. %35 ihtimalle ilan satılır ve listeden düşer.

## Başlangıç ve bitiş
- **Başlangıç:** Kasa 6.000.000 TL, stok boş, itibar 50, gün 1.
- **Kazanma:** 30. günün sonunda **net varlık ≥ 7.500.000 TL** (karar #10; ilk taslakta 8 M'ydi).
  Net varlık = kasa + stoktaki arabaların gerçek değerinin %90'ı.
- **Kaybetme (anında):** Kasa < 0 → "Battık ortak." İtibar 0 → "Kimse kapıdan girmiyor."
- **Unvan:** Net varlık < 6,8 M → "Çırak" · 6,8–7,5 M → "Galerici" · 7,5–8,5 M → "Usta" · ≥ 8,5 M → "Sanayinin Kralı".

## Config anahtarları
`GUN_SAYISI, BASLANGIC_KASA, HEDEF_NET_VARLIK, GUNLUK_AKSIYON, KAPASITE, SABIT_GIDER, MAKS_MUSTERI, MUSTERI_BEKLEME_GUN, ILAN_SATILMA_OLASILIGI, BEKLEME_BONUSU, NET_VARLIK_STOK_ORANI`
