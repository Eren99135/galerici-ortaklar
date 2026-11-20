---
name: oyun-dogrulama
description: Galerici Ortaklar'da bir değişikliğin gerçekten çalıştığını doğrulama ritüeli.
  Kod, denge, metin ya da görsel değiştiren her işin sonunda kullan; ayrıca "test et",
  "ekran görüntüsü al", "çalışıyor mu" denildiğinde. Hangi koşucunun neyi yakaladığını,
  headless Chrome'un Windows'taki tuzaklarını ve neyin yeşil sayıldığını anlatır.
---

# Doğrulama ritüeli

Proje kökü `C:\Users\HP\galerici`. Sıra önemli: ucuz olandan pahalı olana.

## 1. Birim testler

```
node araclar/kos.js
```

`test.html` içindeki testleri tarayıcısız koşar. Şu an 156 test. **Sayı azalmamalı.** Bir
davranışı bilerek değiştirdiysen ilgili testi de güncelle; testi silmek değil, yeni davranışa
göre yazmak gerekir.

## 2. Otomatik oyun

```
node araclar/oyna.js
```

30 günlük oyunu DOM taklidiyle baştan sona oynar, bütün ekranları gezer, sonunda
`arayuz akisi sorunsuz` demeli. Çökme, eksik düğme, akış hatası yakalar.

**Göremediği şeyler:** üst üste binen öğe, kaydırma hatası, odak kaybı, CSS taşması, görsel
bozukluk. Gerçek tarayıcı değil. Arayüze dokunduysan 4. adımı atlama.

Yeni bir ekran ya da akış eklediyse `oyna.js` içine o yolu da ekle, yoksa hata sessizce geçer —
şehir dışı ilan hatası tam olarak böyle gözden kaçtı.

## 3. Denge

```
node sim.js 150
```

Dokuz bot profili, dokuz hedef. Çıktıyı `araclar/denge-baseline.txt` ile `diff`le.

- Görsel/arayüz/metin işinden sonra çıktı **birebir aynı** olmalı. Kaydıysa RNG akışı bozulmuştur:
  tohumlu RNG'de çekilişin **sırası** da önemlidir, sayısı yetmez. `ilanUret` içine çağrı
  eklerken yerine dikkat et.
- Yeni mekanik eklendiyse fark normaldir; ölçüt "dokuz hedef tutuyor".

`denge-bekcisi` alt ajanı bu adımı tek başına yapabilir.

## 4. Gözle bakmak

Arayüz ya da görsel değiştiyse zorunlu. Hazır deneme sayfaları (oyuna dahil değiller):

```
ilan-ekran.html      ilan listesi            deneme-ekran.html   alis pazarligi
sefer-ekran.html     sehir disi sefer        konsinye-ekran.html konsinye
takas-ekran.html     takas                   sinav-ekran.html    yetki belgesi sinavi
sahne-galeri.html    butun sahneler yan yana
```

Headless Chrome ile:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu `
  --hide-scrollbars --virtual-time-budget=4000 --window-size=1280,1500 `
  --screenshot="<cikti.png>" --allow-file-access-from-files `
  "file:///C:/Users/HP/galerici/<sayfa>.html"
```

**Windows tuzakları:**

- Pencere 500 pikselin altına inmiyor. `--window-size=400` versen de sayfa 504 px genişlikte
  çizilir, görüntü sadece kırpılır. Dar ekranı ölçmek için 380 px genişlikte bir `<iframe>`
  içeren ara sayfa kullan ve onun ekran görüntüsünü al.
- Bazen profil klasörü vermeden çıktı üretmiyor; üretmezse `--user-data-dir` ekle.
- CSS giriş animasyonunu ilk karesinde donduruyor: `opacity: 0`'dan başlayan öğe görüntüde yok
  sanılıyor. Bu yüzden giriş animasyonları `.55` opaklıktan başlıyor.

Ekran görüntüsünü **aç ve bak**. "Komut hata vermedi" doğrulama değildir.

## 5. Eren oynar

Denge ve his konusunda birinci kaynak `context/oyun-notlari.md`. Sayılar tutuyor diye oyun iyi
olmuyor; bir fazı kapatmadan önce Eren'in oynaması gerekiyor.

## Bitince

`context/hafiza.md` güncelle: durum, varsa yeni bilinen sorun, Günlük bölümüne tek satır.
Yeni bir karar alındıysa `context/kararlar.md` dosyasına ekle.
