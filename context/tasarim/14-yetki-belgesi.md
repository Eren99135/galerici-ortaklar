# 14 — Yetki belgesi

> Adım 22, 2026-11-19. Kaynak: `kaynaklar/dizi-bilgi.md` — "Galericilik için sınav gerekir (iş güvenliği + alım satım soruları, %70 baraj). Belgesiz satış cezası ~400.000 TL." Dizide 34. bölüm: Drej 88, Nuri 60 alıyor.

## Ne işe yarıyor

Oyun belgesiz başlıyor. Belge almak bir gün ve 15.000 TL yiyor; almamak her satışta ceza riski demek. Sınav, oyuncunun kendi bildiğini sınadığı tek yer — rakamla değil, cevapla geçiliyor.

## Akış

1. **5. gün** Ticaret Müdürlüğü yazısı sabah haberi olarak gelir: belgesiz satışta 400.000 ceza var.
2. Dükkânda **"Yetki belgesi sınavı"** düğmesi. Harç 15.000, bir aksiyon.
3. **Kim girecek?**
   - **Drej:** her soruda bir yanlış şık elenir (üç şıktan ikisi kalır).
   - **Nuri:** eleme yok. Dizideki 88/60 farkının karşılığı.
4. 12 soruluk havuzdan 5 soru çıkar, her birinde 3 şık. **Baraj %70** — 5 soruda 4 doğru.
5. Geçersen belge alınır, itibar +5, üst barda BELGE rozeti çıkar. Kalırsan 4 gün sonra tekrar.
6. **Belgesiz satış:** yasak değil ama her satışta %12 ihtimalle denetim gelir; 1-3 gün sonra 400.000 ceza kasadan düşer ve itibar −4 olur.

## Sorular

`data/sinav.js` — noter devri, ayıplı maldan sorumluluk, satıcının ekspertiz raporu, kapora belgesi, yangın tüpü kontrolü, lift emniyet kilidi, yağlı bez, özel matrah vergisi, tramer kaydı, şase uyumsuzluğu, çek karekodu, ilan dürüstlüğü. Her sorunun bir `aciklama` alanı var: cevap verince öğretici bilgi görünsün diye.

## Sayılar (`js/config.js`)

| Ayar | Değer |
|---|---|
| `SINAV_BEDEL` | 15.000 |
| `SINAV_SORU` / `SINAV_BARAJ` | 5 soru / %70 |
| `SINAV_BEKLEME` | 4 gün |
| `BELGE_YAZI_GUN` | 5 |
| `BELGE_ITIBAR` | +5 |
| `BELGESIZ_DENETIM` | 0,12 |
| `BELGESIZ_CEZA` / `BELGESIZ_ITIBAR` | 400.000 / −4 |

## Denge

Belgesiz oynayan bot 30 günde ortalama **2,8 denetim** yiyor — yani 1,1 milyon ceza. 150 oyunda belgesiz bot %11 kazanıyor ve 6,54M'de bitiriyor; sınava giren bot %62 ve 7,75M. Sınavın 15.000'lik harcı, cezanın beklenen değerinin yanında hiç kalıyor.

Bu kasıtlı: dizideki mesaj da bu. Belge, "istersen al" değil, "almazsan yanarsın" kalemi. Yine de oyuncu ilk günlerde belgesiz satabiliyor; risk hemen gerçekleşmiyor, denetim 1-3 gün gecikmeli geliyor.
