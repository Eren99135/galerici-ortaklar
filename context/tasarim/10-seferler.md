# 10 — Şehir dışı seferler

> Adım 18, 2026-11-19. Kaynak: `kaynaklar/dizi-bilgi.md` (Şehir dışı seferler), `kaynaklar/ton-rehberi.md` (yemek kalıbı). Dizide 23. bölüm Antep seferi, 29'da Konya'daki Passat tuzağı, 35'te Diyarbakır, 46'da Urfa'daki Hilux.

## Ne işe yarıyor

Oyun hep aynı avluda geçmesin. Sefer üç şey getiriyor: günü tümden riske atma kararı, piyasanın altında ama tekin olmayan ilanlar, ve dizinin yemek molası sahnesi.

## Akış

1. Dükkân ekranında **"Şehir dışına çık"**. Koşul sağlanmıyorsa düğme pasif, altında sebebi yazıyor.
2. Üç şehir kartı: mesafe, yol masrafı, Kro'nun duyduğu ipucu, beklenen indirim, ilan sayısı, mola yemeği.
3. Şehir seçilince yol masrafı kasadan düşer, **günün kalan aksiyonları biter**, yerine sefere özel **2 pazarlık hakkı** gelir. Dükkân Kro'ya emanet kalır, o gün satış yok.
4. Şehirde 3-4 ilan. Aynı ilana dönmek bedava, yeni ilana gitmek bir hak yer.
5. **Yemek molası** bir kez: küçük bir bedel, üç replik, kalan pazarlıklarda satıcı sabrı +1.
6. **"Dönüyoruz"** — alınan arabalar tezgâha girer, ekran dükkâna döner, gün akşama gider.

## Sayılar (`js/config.js`)

| Ayar | Değer | Ne yapar |
|---|---|---|
| `SEFER_SECENEK` | 3 | Kaç şehir önerilir |
| `SEFER_PAZARLIK` | 2 | Seferde kaç ilana gidilir |
| `SEFER_BEKLEME` | 5 | İki sefer arası en az kaç gün |
| `SEFER_SON_GUN` | 2 | Son kaç günde sefer kapalı |
| `SEFER_EN_AZ_KASA` | 300.000 | Bunun altında sefere çıkılmaz |
| `SEFER_ABARTICI_CARPAN` | 1,3 | Seferde abartıcı satıcı ağırlığı |
| `SEFER_SATILMIS_OLASILIK` | 0,25 | İlanlardan biri biz varmadan satılmış olabilir |
| `SEFER_YEMEK_SABIR` | 1 | Yemek molasından sonra sabır bonusu |

## Şehirler (`data/sefer.js`)

| Şehir | km | Yol | İndirim | Dolandırıcı | Mola |
|---|---|---|---|---|---|
| İzmit | 100 | 25.600 | %6-12 | ×1,5 | kavurma |
| İnegöl | 160 | 28.800 | %8-14 | ×1,5 | İnegöl köfte |
| Konya | 258 | 38.400 | %10-16 | ×2 | etli ekmek |
| Gaziantep | 650 | 51.200 | %12-18 | ×2 | beyran ve şam tatlısı |
| Şanlıurfa | 800 | 57.600 | %12-18 | ×2 | Urfa sofrası |
| Diyarbakır | 950 | 60.800 | %12-20 | ×2,5 | ciğer |

Uzak şehir daha ucuz ama daha riskli ve yol parası yüksek.

## Denge

Sefer bedava para olmamalı. `sim.js` içindeki **seferci** bot, koşul uygun olduğu her gün sefere çıkar; hedef, onunla akıllı bot arasındaki kazanma farkının %10'un altında kalması.

İlk ölçümde fark %20'ydi (seferci %82, akıllı %62; 30 günde 8,6 sefer). Bekleme 3 günden 5 güne çıkarıldı ve yol masrafları %60 artırıldı. Şimdi 150 oyunda akıllı %63, seferci %61, sefer sayısı 5,7. Seferin medyanı biraz yüksek, kazanma oranı aynı: yani sefer daha oynak bir yol, daha kârlı bir yol değil.

## Mekân görselleri

Sefer ekranları `yol` ve `sanayi-avlu` fotoğraflarını kullanıyor. Yemek sahnesi yeni `lokanta` anahtarını kullanıyor; `img/mekan/lokanta.jpg` gelene kadar gradyan yer tutucu görünüyor (mevcut davranış, oyun bozulmuyor).
