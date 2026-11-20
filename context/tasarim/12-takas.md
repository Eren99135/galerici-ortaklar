# 12 — Takas

> Adım 20, 2026-11-19. Kaynak: `kaynaklar/dizi-bilgi.md` — "Takas: Araba karşılığı araba + nakit farkı". Dizide 43. bölümde kuryeci iki Clio'ya karşılık Mercedes'ini takasa veriyor.

## Ne işe yarıyor

Müşteri parayla değil arabayla geliyor. Karar senin: **onun arabasına kaç biçeceksin.** Biçtiğin değer düşükse müşteri bozulur, yüksekse zarar edersin — üstelik getirdiği arabanın kusurunu görmediysen ne kadar yüksek olduğunu bilmezsin bile.

## Akış

1. Müşterilerin %22'si yanında kendi arabasıyla gelir (`musteri.takasArabasi`). Tezgâh doluysa takaslı müşteri gelmez.
2. Takas arabası %65 ihtimalle "abartıcı" profilde üretilir — yani boyalı parça, tramer, değişen ihtimali yüksek. Göz kontrolü bedava yapılmış gelir.
3. Satış görüşmesinde **TAKAS TEKLİFİ** kutusu: arabanın adı, kilometresi, bilinen kusurları, dökümü, ekspertiz düğmeleri ve değer girişi. Ekspertiz görüşmenin içinde yapılır, ek aksiyon istemez; bedeli normaldeki gibidir.
4. Değer verince müşterinin beklentisiyle karşılaştırılır:
   - beklentinin üstü → **anlaşma**, sabır +1
   - `TAKAS_RED_ESIK` ile beklenti arası → **direnir**, sabır −1
   - altı → **bozulur**, sabır −2
5. Anlaşınca fiyat söylersin; `nakit fark = söylediğin fiyat − biçtiğin değer`. Kasaya fark girer, müşterinin arabası tezgâha girer, noter ödenir.
6. Müşterinin arabası seninkinden pahalıysa fark eksiye düşer — o zaman parayı sen ödersin. Kutuda kırmızı uyarıyla yazıyor.

## Sayılar (`js/config.js`)

| Ayar | Değer |
|---|---|
| `TAKAS_OLASILIK` | 0,22 |
| `TAKAS_ABARTICI_ORAN` | 0,65 |
| `TAKAS_BEKLENTI` | [0,88 , 0,98] — bilinen değere oran |
| `TAKAS_RED_ESIK` | 0,88 — beklentinin bu kadarının altı hakaret |
| `TAKAS_ANLASMA_SABIR` | +1 |

## Denge: beklenti neden bilinen değerin altında

İlk denemede beklenti [1,00 , 1,12] konmuştu ("herkes kendi arabasını temiz sanır"). Simülasyonda takas **hiç** yapılmadı: müşterinin istediği, arabanın satılabileceği fiyatın üstündeydi, yani takas her zaman zarardı. Ölü içerik.

Galericilik mantığı tersine çalışıyor: arabasını galeriye veren adam, zahmetten kurtulmak için kıymetinin altına razı olur. Marj oradan çıkar. Beklenti [0,88 , 0,98]'e çekilince takas canlandı.

**150 oyun:** takasçı bot %70, akıllı bot %62, oyun başına 1,8 takas. Fark hedef bandın içinde (≤%10). Takas kârlı ama şartı var: bot takas arabasına ekspertiz yaptırıyor. Yaptırmayan oyuncu gizli kusuru göremeden değer biçer ve fark kapanır.
