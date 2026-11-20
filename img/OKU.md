# img/ — oyunun gorselleri

> 2026-11-20: gorseller su an uc kaynaktan geliyor, tarz birligi tamamlanmadi.
>
> | Kaynak | Hangileri |
> |---|---|
> | **Uretilmis 3D** (hedef tarz) | karakterlerin **hepsi** (`polis` dahil) · mekan: `galeri-onu` `sanayi-avlu` `gece-sanayi` `gece-sokak` |
> | **Dizi karesi** (Eren ekipten izin aldi) | araba govdesi: `sedan` `pickup` |
> | **Eski temiz fotograf** (tarz disi, degisecek) | mekan: `buro` `ev-sofra` `kahve` `lokanta` `galeri-ici` `ilan-sokak` `yol` `ekspertiz` `noter` |
>
> Kalan 9 mekan ayni 3D tarza gececek; uretim metinleri `kaynak/URETIM-PROMPTLARI.md`
> icinde. Sahnede en cok sirityanlar: **`buro`, `ev-sofra` ve `kahve`** — ucu de
> icinde insan olan ya da yakin plan fotograf, karakter PNG'si onune binince olcek
> tutmuyor. `ekspertiz` ve `noter` fotograflari bos on planli, idare ediyor.
>
> Dizi karesi eslemesi (hangi kare, hangi kutu) `araclar/dizi-gorselleri.py` icinde;
> 3D ile degistirilen hedefleri artik atliyor (`YERINE_3D`). Kaynak klasoru
> (`Masaustu/karakterler gercek`) **artik yerinde degil**, o betik su an sadece
> kayit amacli duruyor.

Oyun gorsel roman yapisinda: **arka plan fotografi** + onunde **seffaf karakter PNG'si**
+ konusma baloncugu. Dosyayi dogru adla buraya atmak yeter, kod degismez.

## Mekanlar  (`img/mekan/`)

    <mekan>.jpg   (yoksa .png, yoksa .webp, hicbiri yoksa mekan adi yazili yer tutucu)

| Dosya | Nerede gorunur |
|---|---|
| `galeri-onu` | Dukkan, musteri gorusmesi, satis, oyun sonu |
| `galeri-ici` | Defter *(pazarlik gecici olarak sanayi-avlu kullaniyor; kucuk/eski bir galeri ici fotografi gelince pazarlik buraya doner)* |
| `sanayi-avlu` | Pazarlik, araba detayi, sakin gun, Riza kartlari |
| `ilan-sokak` | Ilan listesi, Cuma karti |
| `ekspertiz` | Ekspertiz |
| `noter` | Alis kapanisi |
| `buro` | Mali musavir karti |
| `ev-sofra` | Abla karti |
| `kahve` | Sukru abi karti |
| `gece-sanayi` | Aksam raporu, "Sizce?", gece kartlari, batma sonu |
| `yol` | Ileride sehir disi seferler |

**Olcu:** yatay 16:9, en az 1600x900. Icinde insan olmasa daha iyi: karakterler ayri PNG olarak oniine biniyor.

## Karakterler  (`img/karakter/`)

    <kisi>-<ifade>.png   (yoksa .webp, yoksa <kisi>-normal.png, hicbiri yoksa sadece isim etiketi)

**Kisiler:** `nuri` `drej` `kro` `riza` `sukru` `abla` `satici` `musteri` `noter` `teknisyen` `musavir` `cuneyt` `polis`

**Ifadeler (ucu yeter):** `normal` · `sevincli` · `sinirli`

Ornek: `img/karakter/nuri-sinirli.png`, `img/karakter/satici-normal.png`

**Olcu ve bicim:** dikey PNG, **seffaf arka plan**, tam boy, figur alt kenara otursun.
Ham dosya ne kadar buyuk olursa olsun cikti en fazla **900 piksel boyunda** ve 256 renkli
yaziliyor (`araclar/gorsel-hazirla.py`, `KARAKTER_EN_COK_YUKSEKLIK`); karakter ekranda
~346 piksel gorunuyor, fazlasi sadece indirme boyutunu sisiriyor.
En az `<kisi>-normal.png` olsun; eksik ifade otomatik normale duser, o da yoksa sahnede
sadece isim etiketi ve baloncuk gorunur (oyun bozulmaz).

**Arka plan gomulu bir gorsel geldiginde:** `kaynak/portre-ham/` altina konur ve yerelde
u2netp modeliyle kesilip buraya seffaf olarak yazilir (bkz. `kaynak/OKU.md`).

## Arabalar  (`img/araba/`)

    <marka>-<model>.png   (yoksa .webp, yoksa <govde>.png, hicbiri yoksa sahnede araba cizilmez)

Araba; ilan detayinda, alis pazarliginda, musteri gorusmesinde ve satista
mekan fotografinin onunde, karakterlerin arkasinda durur. Ilan ve stok
kartlarinda da kucuk bir serit olarak cikar.

**Olcu ve bicim:** yatay PNG, **seffaf arka plan**, cikti en fazla **1200 piksel genis**
ve 256 renkli (`ARABA_EN_COK_GENISLIK`),
araba yandan ya da ceyrek acidan, tekerlekler alt kenara otursun.

### Durum: 49 modelin de kendi fotografi var

2026-11-19: katalogdaki 49 modelin hepsine kendi fotografi kondu
(`kaynak/araba-ham/` altindaki ham dosyalardan, `gorsel-hazirla.py` ile kesildi).
Govde dosyalarindan elimizde `sedan.png` ve `pickup.png` var; `hatchback`,
`station`, `suv`, `ticari`, `klasik` yok ama her modelin kendi fotografi
durdugu icin sahnede bir fark yaratmiyorlar. Kataloga fotografsiz yeni bir
model eklenirse yedek zinciri devreye girer.

### Plaka ve renk

Fotograflardaki plaka filigranlari (`HUM3D`, `3DSQUIR`) `gorsel-hazirla.py` icinde
temizleniyor; kutular `araclar/plaka-kutulari.json` dosyasinda (bkz. `araclar/OKU.md`).

Her modelin fotografindaki renk `data/modeller.js` icinde `renk` alanina yazildi.
Ilanda o renk gorunur. Bir modelin fotografini degistirirsen rengini de guncelle,
yoksa ilanda "gumus" yazip kirmizi araba cikar.

### Govde yedegi

Her govde tipinin fotografi yok. Yoksa en yakinina duser (`js/sahne.js`):

    hatchback → sedan      station → sedan      klasik → sedan
    suv       → pickup     ticari  → pickup

Dizi karelerinden `sedan` ve `pickup` kesildi. Su an her modelin kendi
fotografi oldugu icin bu zincire dusulmuyor.

### Sonra: modelin kendi fotografi

Model dosyasi konuldugu anda kendiliginden devreye girer, kod degismez.
Ornek: `img/araba/vw-passat.png` → Passat pazarliginda Passat gorunur.

**sedan** (`img/araba/sedan.png` yedegiyle calisir)

- `renault-broadway.png` — Renault Broadway
- `tofas-sahin.png` — Tofaş Şahin
- `fiat-tempra.png` — Fiat Tempra
- `tofas-dogan-slx.png` — Tofaş Doğan SLX
- `hyundai-accent-era.png` — Hyundai Accent Era
- `renault-symbol.png` — Renault Symbol
- `fiat-linea.png` — Fiat Linea
- `peugeot-301.png` — Peugeot 301
- `honda-city.png` — Honda City
- `citroen-c-elysee.png` — Citroën C-Elysée
- `audi-a6.png` — Audi A6
- `renault-fluence.png` — Renault Fluence
- `fiat-egea.png` — Fiat Egea
- `ford-focus.png` — Ford Focus
- `opel-insignia.png` — Opel Insignia
- `renault-megane.png` — Renault Megane
- `toyota-corolla.png` — Toyota Corolla
- `honda-civic.png` — Honda Civic
- `vw-passat.png` — VW Passat
- `skoda-superb.png` — Škoda Superb
- `bmw-3-20i.png` — BMW 3.20i
- `audi-a4.png` — Audi A4
- `mercedes-c180.png` — Mercedes C180
- `bmw-5-20i.png` — BMW 5.20i

**hatchback** (`img/araba/hatchback.png` yedegiyle calisir)

- `opel-astra.png` — Opel Astra
- `dacia-sandero.png` — Dacia Sandero
- `renault-clio.png` — Renault Clio
- `opel-corsa.png` — Opel Corsa
- `hyundai-i20.png` — Hyundai i20
- `vw-polo.png` — VW Polo
- `toyota-yaris.png` — Toyota Yaris
- `vw-golf.png` — VW Golf
- `skoda-octavia.png` — Škoda Octavia
- `seat-leon-fr.png` — Seat Leon FR

**station** (`img/araba/station.png` yedegiyle calisir)

- `ford-mondeo.png` — Ford Mondeo
- `vw-passat-variant.png` — VW Passat Variant

**suv** (`img/araba/suv.png` yedegiyle calisir)

- `dacia-duster.png` — Dacia Duster
- `nissan-qashqai.png` — Nissan Qashqai
- `hyundai-tucson.png` — Hyundai Tucson
- `peugeot-3008.png` — Peugeot 3008

**pickup** (`img/araba/pickup.png` yedegiyle calisir)

- `nissan-navara.png` — Nissan Navara
- `toyota-hilux.png` — Toyota Hilux
- `ford-ranger.png` — Ford Ranger

**ticari** (`img/araba/ticari.png` yedegiyle calisir)

- `renault-kangoo.png` — Renault Kangoo
- `fiat-doblo.png` — Fiat Doblò
- `ford-transit-connect.png` — Ford Transit Connect
- `vw-caddy.png` — VW Caddy
- `mercedes-vito.png` — Mercedes Vito

**klasik** (`img/araba/klasik.png` yedegiyle calisir)

- `mercedes-w124.png` — Mercedes W124

**Arka plani gomulu bir fotograf geldiginde:** `kaynak/araba-ham/` altina konur ve
`python araclar/gorsel-hazirla.py` calistirilir; kesilmis hali buraya yazilir.

## Not

Buraya sadece hakki sende olan gorseller konur: kendi urettiklerin, kendi cektiklerin
ya da lisansi serbest gorseller.
