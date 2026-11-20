# Yayın

Oyun iki yerde duruyor:

| nerede | adres | ne zaman güncellenir |
|---|---|---|
| GitHub Pages | https://eren99135.github.io/galerici-ortaklar/ | `git push` sonrası kendiliğinden |
| itch.io | (sayfa açıldıktan sonra buraya yazılacak) | zip elle yüklendiğinde |

Paketi kuran komut tek:

```
python araclar/paket.py
```

`yayin/` klasörünü sıfırdan kurar ve `yayin/galerici-ortaklar.zip` üretir. Yayına giren
yollar `araclar/paket.py` içindeki `YOLLAR` listesinde. Oyuna yeni bir klasör eklenirse
(ses dosyaları gibi) hem oraya hem `.github/workflows/pages.yml` içine eklenmeli.

Yerelde denemek için:

```
python -m http.server --directory yayin 8000
```

## GitHub Pages

Depo: `Eren99135/galerici-ortaklar`, açık. `main` dalına her push'ta
`.github/workflows/pages.yml` çalışır, yalnızca oynanabilir paketi `_site/` altına
kopyalayıp yayınlar. `context/`, `araclar/`, `test.html` ve deneme sayfaları depoda
görünür ama yayına girmez.

Yerel geliştirme deposu ayrı duruyor ve tüm geçmişi orada. GitHub'daki depo bu klasörün
anlık görüntüsü: `kaynak/` altındaki ham görseller, ONNX modelleri ve commit geçmişi
dışarıda, commit e-postası `Eren99135@users.noreply.github.com`.

Güncellemeyi tek komut yapar:

```
python araclar/github-gonder.py "ne degisti"
python araclar/github-gonder.py --kuru "ne degisti"   # once neyin gideceğini gör
```

Betik `.github-depo/` altındaki klonu (ilk çalışmada kendisi indirir) proje klasörüyle
eşitler, commit'ler ve push eder. Push olunca Pages iş akışı kendiliğinden çalışır, adres
birkaç dakika içinde yeni sürümü gösterir. `.github-depo/` ve `yayin/` yerel depoda
`.gitignore` içinde.

## itch.io

Yükleme adımını Eren yapıyor, hesap gerekiyor.

1. https://itch.io/game/new
2. **Title:** Galerici Ortaklar
3. **Project URL:** `galerici-ortaklar`
4. **Kind of project:** HTML
5. **Uploads:** `yayin/galerici-ortaklar.zip` yüklenir, yanındaki
   **"This file will be played in the browser"** işaretlenir.
6. **Embed options:** genişlik 1100, yükseklik 760, **Mobile friendly** açık (Orientation:
   default), **Fullscreen button** açık, **Automatically start on page load** kapalı.
7. **Genre:** Simulation · **Tags:** aşağıda.
8. **Kapak görseli:** `tanitim/itch-kapak-630x500.jpg` (tam ölçüsünde). Geniş afiş isteyen
   yerler için `tanitim/itch-afis-1200x630.jpg`.
9. **Ekran görüntüleri:** `tanitim/ekran-dukkan.jpg`, `ekran-ilanlar.jpg`,
   `ekran-pazarlik.jpg`, `ekran-satis.jpg`. Dördünü de yükle, sıralama bu olsun.
   Kapak `python araclar/kapak-uret.py` ile üretiliyor; ekran görüntüleri elle alındı,
   yenisi gerekirse tekrar çekilmesi lazım.
10. Visibility önce **Draft**, kendi hesabından bir kere oynayıp sonra **Public**.

### Sayfa metni (olduğu gibi yapıştırılabilir)

> **Erebe gider, pere gelir.**
>
> Nuri'nin dayısı galeriyi üçüne bıraktı: tezgâhtaki arabalar, defter, kepenk anahtarı.
> Bırakamadığı tek şey dükkânın kendisiydi. Mal sahibi satışa çıkardı ve bir fiyat
> söyledi: yedi buçuk milyon, otuz gün süre. Kasada altı milyon var.
>
> Otuz gün boyunca sanayide galerici olacaksın. İlanlara bakarsın, arabayı ekspertizden
> geçirirsin, satıcıyla pazarlık edersin. Sonra müşteri gelir ve asıl soru orada çıkar:
> arabanın kusurunu söyleyecek misin?
>
> Söylersen itibarın artar, cebin azalır. Saklarsan bugün kazanırsın, yarın kapına
> şikâyetçi gelir. Oyun bu iki tarafı da ödüllendirir, ikisini birden değil.
>
> **Ne var içinde**
>
> - 49 araba modeli, gizli kusurlar, değişen parça ve boya geçmişi
> - Her gün değişen piyasa: benzine zam gelir ekonomik araba aranır, inşaat sezonunda
>   kamyonet gider
> - Şehir dışı sefer, konsinye satış, takas, çek, noter, belge işleri
> - Üç ortağın kendi karakteri: Nuri hesabı tutar, Drej ağzını kullanır, Kro ilanı bulur
> - Otuzuncu günde galeri karnesi ve aynı tohumla yeniden oynama
>
> Tarayıcıda çalışır, kurulum istemez, telefona ana ekran kısayolu olarak eklenebilir ve
> çevrimdışı oynanır.
>
> @galericiortak dizisinden esinlenen bir hayran yapımıdır, resmî bir bağı yoktur.

### Etiketler

`turkish` `management` `simulation` `negotiation` `business` `trading` `singleplayer`
`text-based` `pixel-free` `turkce`

### Kısa tanıtım (itch.io "Short description", 150 karakter sınırı)

> Sanayide galerici olduğun otuz gün. Araba al, kusurunu söyle ya da sakla, pazarlık et,
> dükkânın parasını denkleştir.
