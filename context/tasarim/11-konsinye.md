# 11 — Konsinye

> Adım 19, 2026-11-19. Kaynak: `kaynaklar/dizi-bilgi.md` — "Araba sahibinde kalır, galeri satar, komisyon alır (sahibine 1.050.000 net, ilan 1.150.000, komisyon 100.000)". Dizide 18. bölümde Drej konsinye mantığını görüyor, 32-33'te amcanın W124'ü konsinyeye alınıp 1.115.000'e satılıyor, galeriye 65.000 kalıyor.

## Ne işe yarıyor

Oyunda para kazanmanın tek yolu vardı: al, sat. Kasa daralınca yapacak bir şey kalmıyordu — simülasyonda sadece ucuz araba alan bot 30 günde ancak 5-6 araba alabiliyordu. Konsinye **sermaye bağlamadan** tezgâha araba koyma yolu. Karşılığı: marj dar, araba senin değil, süresi var.

## Akış

1. Bazı ilanlarda satıcı "satmam ama sen sat" der (`araba.konsinyeMumkun`). Dürüst satıcıda %30, abartıcıda %12, dolandırıcıda hiç.
2. İlan detayında **KONSİNYE TEKLİFİ** kutusu: sahibin istediği net, önerilen ilan fiyatı, tahmini komisyon, süre.
3. Ekspertizde kusur çıktıysa her kusur bir kez gösterilip net aşağı çekilebilir (`KONSINYE_KOZ_ORAN` kadarı düşer).
4. **Konsinye al** denince araba tezgâha girer: kasadan para çıkmaz, noter ödenmez, `alisFiyati = sahipNet` olur.
5. Satış normal akışın aynısı. Satılınca kasaya `fiyat − sahipNet − vergi` girer; kâr satırı artık komisyondur. Sahibin netinin altına satarsan farkı cebinden ödersin.
6. Süre `KONSINYE_SURE` gün. Son `KONSINYE_UYARI_GUN` günde sabah haberinde "sahibi arıyor" çıkar; süre dolunca sahibi arabayı alır, para hareketi olmaz.

**Sınırlar:** Tezgâh kapasitesini kullanır. Hurdaya verilemez (senin değil). Rıza'nın getirdiği konsinye bir olay kartı olarak da gelir (`riza_konsinye`).

## Net varlık

Konsinye araba varlık değildir; `netVarlik` ona `max(0, gerçekDeğer × NET_VARLIK_STOK_ORANI − sahipNet)` yazar. Çoğu zaman bu sıfır çıkar — yani komisyon ancak satış gerçekleşince varlığa girer. İlan fiyatına göre hesaplamadık, çünkü ilan fiyatını oyuncu kendi koyuyor; öyle olsaydı fiyatı şişirerek net varlık şişirilebilirdi.

## Sayılar (`js/config.js`)

| Ayar | Değer |
|---|---|
| `KONSINYE_OLASILIK` | dürüst 0,30 · abartıcı 0,12 · dolandırıcı 0 |
| `KONSINYE_NET` | [0,98 , 1,03] — sahibin neti, bilinen değere oran |
| `KONSINYE_KOZ_ORAN` | 0,5 |
| `KONSINYE_SURE` | 8 gün |
| `KONSINYE_UYARI_GUN` | 2 gün |

## Denge: `KONSINYE_NET` neden 1'in etrafında

Marjı belirleyen tek sayı bu ve üç kez ayarlandı (karar #23):

| `KONSINYE_NET` | Konsinyeci bot | Akıllı bot | Sonuç |
|---|---|---|---|
| 0,90-0,96 | %92 | %68 | Konsinye alımdan kârlı: baskın strateji |
| 0,95-1,00 | %90 | %66 | Hâlâ baskın — noter masrafı bile yok |
| 1,00-1,05 | %64 | %62 | Bot konsinyeyi hiç almıyor: ölü içerik |
| **0,98-1,03** | **%61** | **%62** | Oyunda 3,9 konsinye satışı, kazanma farkı yok |

Mantık şu: satıcı konsinyeye **galericinin vereceği fiyattan memnun olmadığı için** razı oluyor. O yüzden sahibin neti, alımda ödeyeceğin tabanın biraz üstünde olmalı. Komisyon böylece alım marjının yarısı kadar kalıyor; konsinyenin değeri kârda değil, **kasayı boşaltmamasında**.

Yan ölçüm: sadece ucuz araba alan bot konsinyeyle 5,98M'den 6,12M'ye çıktı ve 30 günde 3,2 konsinye sattı. Yani kasası dar oyuncu için gerçekten bir çıkış yolu.
