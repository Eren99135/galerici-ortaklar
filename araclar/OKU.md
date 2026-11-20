# araclar/ — görsel hazırlama ve doğrulama araçları

## Doğrulama (Node, tarayıcısız)

```
node araclar/kos.js            # test.html'deki bütün testler (şu an 179)
node araclar/oyna.js           # 30 günlük otomatik oyun, gerçek akışı gezer
node araclar/ekran-supurge.js  # her ekranı tek tek çizdirir: çökme, boş gövde, undefined, NaN
node sim.js 400                # denge simülasyonu, dokuz hedefi kontrol eder
```

`oyna.js` oyunu gerçek akışıyla oynar ama bazı ekranlara hiç uğramaz; `ekran-supurge.js` ekran
listesini elle tutar ve hepsini sırayla çizdirir. Yeni bir ekran eklendiğinde o listeye de ekle.

Denge ölçümünde **400 oyun** kullan: 150 oyunda hedefler gürültüden sınırın üstüne çıkabiliyor
(2026-11-19'da konsinyeci ve takasçı böyle yanlış alarm verdi).

`kos.js` ve `oyna.js` oyunu DOM taklidiyle çalıştırır; tarayıcı açmadan
çökme, eksik düğme ve akış hatası yakalar. Görsel bir değişiklikten sonra
bunlar yetmez, headless Chrome ile ekran görüntüsü alıp gözle bakmak şart.

## Yayın paketi

```
python araclar/paket.py       # yayin/ klasörü + itch.io için zip (8,1 MB)
python araclar/ikon-uret.py   # PWA ve favicon ikonları (bir kere çalışır)
```

`paket.py` yalnızca oynanabilir yolları kopyalar: `index.html`, `style.css`,
`manifest.json`, `sw.js`, `js/`, `data/`, `img/`. `js/test.js` dışarıda kalır. Oyuna yeni
bir klasör eklenirse `paket.py` içindeki `YOLLAR` listesine **ve**
`.github/workflows/pages.yml` içine eklenmeli, yoksa yayında eksik çıkar.

`ikon-uret.py` Şahin resmini sarı zemine oturtup `img/ikon/` altına 32/192/512 ve maskable
ikonları yazar. Çıktılar depoda, betiği yalnızca ikon değişecekse tekrar çalıştır.

```
python araclar/github-gonder.py "ne degisti"   # acik depoyu gunceller, Pages yenilenir
```

`github-gonder.py` `.github-depo/` altındaki klonu proje klasörüyle eşitler; `kaynak/`,
`yayin/`, ONNX dosyaları ve zip'ler dışarıda kalır. `--kuru` ile önce neyin gideceğini
gösterir.

Yayın adresleri ve itch.io adımları `YAYIN.md` dosyasında.

## Görsel hazırlama

Oyun kodu buraya bakmaz. Burası ham fotoğrafları oyunun istediği hale getiren araç.

## Kullanım

```
python araclar/gorsel-hazirla.py              # kaynak/ altındaki her şeyi işler
python araclar/gorsel-hazirla.py --liste      # sadece eksikleri yazar, dosyaya dokunmaz
python araclar/gorsel-hazirla.py --zorla      # daha önce üretilmişleri de yeniden üretir
python araclar/gorsel-hazirla.py --sadece araba   # sadece arabalar (ya da karakter / mekan)
python araclar/gorsel-hazirla.py --kirp drej-normal 430,0,780,881
                                              # inatçı bir karede figürün etrafını elle ver
```

## Ne nereye

| Ham dosya | Oyundaki yeri | Ne yapılır |
|---|---|---|
| `kaynak/portre-ham/<ad>-<ifade>.*` | `img/karakter/<ad>-<ifade>.png` | arka plan silinir, en çok 900 px boy, 256 renk |
| `kaynak/araba-ham/<anahtar>.*` | `img/araba/<anahtar>.png` | arka plan silinir, plaka temizlenir, en çok 1200 px en, 256 renk |
| `kaynak/mekan-ham/<mekan>.*` | `img/mekan/<mekan>.jpg` | 16:9 kırpılır, 1600×900 |

**Çıktı ölçüsü neden sınırlı:** araba sahnede en fazla ~500×240, karakter ~346 piksel
görünüyor. Sınırlar (`ARABA_EN_COK_GENISLIK`, `KARAKTER_EN_COK_YUKSEKLIK`) bunun iki
katı. Renk indirgemesi fotoğrafik render'ı 900 KB'dan 160 KB'a indiriyor ve sahne
ölçeğinde fark etmiyor. Arabada küçültme **plaka temizliğinden sonra** yapılır; önce
yapılırsa filigran harfleri küçülüp bulunamaz hale geliyor.

Ham dosyanın adı ne ise çıktının adı da o olur. Dosya adları ASCII: `nuri-sinirli`, `galeri-ici`, `vw-passat`. Tam liste `img/OKU.md` içinde.

## Plaka filigranları

Araba fotoğraflarının çoğu 3D model vitrini render'ı; plakalarda `HUM3D`, `3DSQUIR`
gibi filigranlar var. Arka plan silindikten sonra bunlar temizleniyor.

`araclar/plaka-kutulari.json` her fotoğraf için bir **arama kutusu** tutuyor:
`<anahtar>: [sol, üst, sağ, alt]`, oransal (0-1), `img/araba/<anahtar>.png` ölçüsüne göre.
Kutu plakanın tam sınırı olmak zorunda değil; içindeki koyu harf lekeleri bulunup
çevresindeki plaka renginden dolduruluyor, yani plakanın perspektifi, gölgesi ve
parlaması yerinde kalıyor, sadece yazı gidiyor.

Listede olmayan fotoğrafa dokunulmuyor (plakası görünmeyenler ve dizi karesinden
kesilen `sedan` ile `pickup` böyle). Yeni bir fotoğrafta filigran varsa kutusunu
dosyaya ekleyip `--sadece araba --zorla` ile yeniden üret.

Sonuç her zaman gözle kontrol edilir: bazı plakalarda yazının bir kısmı siliniyor,
kalan kısım bulanık bir leke olarak duruyor. Oyun ölçeğinde fark edilmiyor.

## Modeller

Depoda tutulmaz (`.gitignore`), gerekince indirilir:

| Dosya | Ne için | Boyut | Adres |
|---|---|---|---|
| `u2net_human_seg.onnx` | karakterler (insan) | 176 MB | `https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx` |
| `u2net.onnx` | arabalar, nesneler | 176 MB | `.../v0.0.0/u2net.onnx` |
| `u2netp.onnx` | ikisi de yoksa yedek | 4,5 MB | `.../v0.0.0/u2netp.onnx` |

İnsan modeli belirgin biçimde daha iyi: genel model geniş bir karede arkadaki arabaları da figür sanıyor.

## Nasıl çalışıyor

1. Model maskeyi üretir.
2. Maskedeki **en büyük bağlantılı bölge** seçilir; arkadaki ayrı lekeler (park hâlindeki arabalar gibi) düşer.
3. Figür kareyi doldurmuyorsa **yalnızca yatayda** kırpılır ve model ikinci kez çalıştırılır. Dikeyde kırpmıyoruz: ilk geçiş çoğu zaman sadece gövdeyi güçlü buluyor, dikey kırpınca bacaklar gidiyor.
4. Maske yumuşatılır, saydamlık uygulanır, boş kenarlar atılır, boy en fazla 1200 piksele iner.

Çıktı her zaman gözle kontrol edilir. Bir fotoğraf inatçıysa `--kirp` ile figürün etrafını elle vermek en hızlı yol.
