# Galerici Ortaklar

Sanayide ikinci el galeri işletme oyunu. Otuz gün, bir kasa, üç ortak: Nuri, Drej, Kro.
İlan bakarsın, arabayı ekspertizden geçirirsin, pazarlık edersin. Kusuru söylersen itibarın
artar ama para kaybedersin, saklarsan tersi olur. Otuzuncu günün sonunda dükkânın parasını
denkleştiremezsen kepengi başkası açar.

**Oyna:** https://eren99135.github.io/galerici-ortaklar/

@galericiortak dizisinden esinlenildi. Hayran yapımıdır, resmî bir bağı yoktur.

## Nasıl yapıldı

Saf HTML, CSS ve vanilla JavaScript. Framework yok, paket yok, build adımı yok.
`index.html` çift tıklanınca çalışır, internet gerektirmez.

```
index.html      oyun
test.html       testler (179 tane)
js/             oyun kodu
data/           model kataloğu, replikler, kartlar, trendler
img/            araba, karakter ve mekân görselleri
araclar/        doğrulama ve görsel hazırlama araçları
context/        tasarım dokümanları, kararlar, proje hafızası
sim.js          denge simülasyonu
```

Birkaç kural baştan beri değişmedi: oyun mantığı DOM'a dokunmaz (bütün DOM işi
`js/ui.js` içinde), denge sayıları `js/config.js` dışına yazılmaz, rastgelelik yalnızca
tohumlu RNG üzerinden gelir. Aynı tohum aynı oyunu verir.

## Doğrulama

```
node araclar/kos.js            # birim testler
node araclar/oyna.js           # 30 günlük otomatik arayüz oyunu
node araclar/ekran-supurge.js  # her ekranı çizdirip hata arar
node sim.js 400                # denge: 11 farklı bot stratejisi, 9 hedef
```

Denge simülasyonu akıllı botun %60-70 aralığında kazanmasını bekler. Saf oynayan bot
kaybetmeli, kusur saklayan bot söyleyenden geride kalmalı.

## Yayın

```
python araclar/paket.py   # yayin/ klasörü + itch.io için zip
```

Ayrıntı için `YAYIN.md`.
