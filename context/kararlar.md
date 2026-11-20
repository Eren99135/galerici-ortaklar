# Kararlar

Bir şeyi değiştirmeden önce buraya bak. Yeni bir karar alındığında en alta ekle: tarih, karar, neden. Eski kararı değiştiriyorsan silme; "Değiştirildi → #N" notu düş.

## Alınmış kararlar

| # | Tarih | Karar | Neden |
|---|---|---|---|
| 1 | 2026-11-18 | Oyun tarayıcıda, saf HTML/CSS/JS ile yapılacak | Kurulum yok, çift tıklayınca açılır, Eren kodu okuyabilir |
| 2 | 2026-11-18 | Önce MVP: tek araba alım-satım döngüsü + itibar + olay kartları | Dosyadaki her mekaniği bir anda koymak projeyi bitirmez |
| 3 | 2026-11-18 | 30 günlük oyun, başlangıç 6.000.000 TL, hedef net varlık 8.000.000 TL | Dizideki kasa aralığına (3,5–7,3 M) yakın ve oturum süresi makul. Denge testinde değişebilir |
| 4 | 2026-11-18 | Pazarlıkta satıcının taban fiyatı ve sabrı gizli; ruh hâli metinle gösterilir | Bulmaca hissi korunsun |
| 5 | 2026-11-18 | Kusuru saklamanın beklenen değeri hafif negatif olacak | Dizinin "dürüstlük kazandırır" mesajı |
| 6 | 2026-11-18 | Tüm rastgelelik tohumlu RNG ile | Denge testi ve hata ayıklama tekrarlanabilir olsun |
| 7 | 2026-11-18 | Proje bağlamı CLAUDE.md + AGENTS.md + haritalı `context/` klasörüyle yönetilecek | Tek dev dosya yerine ihtiyaç kadar okuma, token tasarrufu |
| 8 | 2026-11-18 | Oyun bir **karar ve yönetim oyunu** olarak kalır (menü ve kart tabanlı). Gezilebilir 2D dünya MVP'de yok; MVP sonrası seçenek olarak duruyor | Eren karar oyunundan memnun; gezilebilir dünya yapım süresini kabaca ikiye katlar ve grafik ihtiyacı doğurur |
| 10 | 2026-11-18 | Kazanma hedefi 8 M → **7,5 M**. Dolandırıcı satıcı kozları tanımaz (`tasarim/03` §3) | Kaba simülasyon: iyi oynayan biri 30 günde ~36–42 araba çevirip araba başı ~40–55 bin net kâr ederse 7,2–8,1 M'de bitiriyor; 8 M hedefi neredeyse imkânsızdı. Dolandırıcı ilanları da kozla en kârlı ilanlara dönüşüyordu. Değiştirildi: #3'ün hedef kısmı |
| 9 | 2026-11-18 | Görsel stil dizinin Instagram kapak şablonunu taşır: sarı etiket, büyük beyaz başlık, kırmızı soru bandı, gece/sıcak iç mekân paleti (ayrıntı `tasarim/07`). Dizinin görselleri ve karakter tasarımları kopyalanmaz | Eren "videolara benzerse memnunum" dedi; A4 kapandı |
| 11 | 2026-11-18 | Oyunun adı **Galerici Ortaklar** | Eren böyle istedi; dizinin hesabıyla (@galericiortak) aynı ağızda |
| 12 | 2026-11-18 | Proje `C:\Users\HP\galerici` klasöründe ve git açık | OneDrive senkronu `.git` klasörüyle çakışabiliyor; her adım commit'lenince bozulan bir şey geri alınabiliyor. A4 kapandı |
| 13 | 2026-11-18 | Pazarlığa iki transkript bulgusu eklendi: "ortası" kapanışı ve "kalkıyoruz" blöfü (`tasarim/03` §4 ve §4b). Kro'nun alış pazarlığında araya girmesi eklenmedi | Dizinin pazarlık ritmi bu ikisinden geliyor. Kro'nun araya girmesi oyuncunun elinde olmayan bir ceza olurdu. A5'in 1. ve 2. maddesi kapandı, kalan 6 madde açık |
| 14 | 2026-11-18 | **Her karar anının kendi sahne görseli olacak.** Görseller oyuna özgü SVG çizimler (`js/sahne.js`); `img/` klasörüne sahne anahtarıyla aynı adda dosya konunca kodu değiştirmeden onun yerine geçer. Karakter künyesi `tasarim/07`'de: Nuri göbekli, ön saçı açık, gür bıyıklı, gömlekli; Drej uzun, ince, yorgun, gözlüklü; Kro keko ceketli, jöleli saçlı. Dizinin çizimleri, kareleri ve karakter tasarımları kopyalanmaz (karar #9 geçerli) | Eren'in oyun notlarındaki en önemli istek: "her karar anında arkaplanda bomboş sadece yazılar olacağına o anlar ile ilgili resimler olsun". SVG seçildi çünkü hemen geliyor, internetsiz çalışıyor, dosya küçük ve telif sorunu yok. Foto takası Eren kendi fotoğraflarını çektikçe sahneleri tek tek gerçek görsele çevirebilsin diye |
| 15 | 2026-11-18 | İlk iki günü elinden tutan **başlangıç rehberi** (11 adım, `data/rehber.js`) ve her ekranda **"?" yardım kartı** | Eren: "oyun biraz zor olduğu için başlangıçta neyi nasıl yapmalıyım şeklinde anlatıcı bi tutorial olsun". Rehber kapatılabilir ve kayda giriyor, tekrar açılabiliyor |
| 16 | 2026-11-18 | **Bölümlü ana hikâye Adım 14 olarak sıraya girdi** (prolog: galerinin miras kalması, belirli günlerde 8-10 sahne, final). Denge (Adım 11) ve cila (Adım 12) onun arkasına kaydı | Eren: "başlangıçtan itibaren sürükleyen bir hikayesi olsun ve oyun bu hikayeyi anlatsın... dizideki gibi olsun akış". Oyun notları tasarımın önünde gelir (`00-HARITA.md`), bu yüzden sıra değişti |
| 17 | 2026-11-18 | **Oyun görsel roman yapısına geçti.** Kodla çizilen SVG sahneler bırakıldı. Her ekranda: arka plan görseli (`img/mekan/<mekan>.jpg`) + önünde karakter PNG'si (`img/karakter/<kisi>-<ifade>.png`) + karakterin yanından çıkan konuşma baloncuğu. Görsel yoksa yer tutucu (mekân adı + renkli siluet) gösterilir. **Baloncukta en fazla 12 kelime**, anlatıcı metni yok; fiyat/kusur/kasa kenarda kısa rakam, detay tıklayınca açılır | Eren çizimleri beğenmedi ("aşırı kötü") ve oyunu fazla yazı dolu buldu ("football manager gibi"). Dosya adı kuralı sayesinde görsel atıldığı an kod değişmeden yerine oturuyor. Karar #14'ün SVG kısmı iptal, foto takası mantığı korundu |
| 18 | 2026-11-18 | Oyunun **gizli (private) bir demo linki** yayınlandı: https://claude.ai/artifact/J4Cc3xhVU285mm6k1u57GY — sadece Eren'in hesabı açabiliyor, paylaşırsa başkası da açar. Sayfanın altına "hayran yapımı, resmî değil" satırı eklendi | Eren demo istedi. Karar #1'deki "yayınlanmayacak" maddesi herkese açık yayın, mağaza ve para kazanma içindir; kendine özel link onu bozmuyor. Not satırı, link paylaşılırsa dizinin resmî işi sanılmasın diye |
| 19 | 2026-11-18 | **Pazarlıkta iki yumuşatma:** (a) oyuncunun bir pazarlıktaki **ilk teklifi hakaret sayılmaz** — tabanın %85'inin altında olsa bile normal karşı teklif gibi işlenir, sabır sadece 1 düşer; ikinci tekliften itibaren eski kural geçerli. (b) **Oyunun ilk iki gününde Nuri sinirlenmez** (`NURI_SAKIN_GUN: 2`) | Eren oynarken ilk teklifte masanın dağılmasını haksız buldu; oyuncu daha tabanın nerede olduğunu bilmiyor. Nuri'nin ilk günlerde masayı dağıtması da öğrenmeyi cezalandırıyordu |

## Açık kararlar (Eren karar verecek)

| # | Soru | Varsayılan (karar verilene kadar) |
|---|---|---|
| A1 | 30 gün ve 8 M hedefi doğru tempo mu, yoksa sonsuz mod da olsun mu? | 30 gün |
| A2 | Pazarlıkta Drej'in tahmini dışında bir ipucu olsun mu? | Hayır, sadece ruh hâli metni |
| A3 | Nuri'nin sinirlenme ihtimali (%20) dizideki gibi mi? | %20, oynayınca bakılır |
| A5 | `kaynaklar/dizi-bilgi.md` → "Transkriptten çıkan oyun bulguları" listesinin kalan maddeleri (Kro araya girer, Rıza müşteri kapar, sadaka ritüeli, başlangıç rakamları) tasarıma eklensin mi? | Hayır; onaylanan madde ilgili tasarım dosyasına işlenir. 1. ve 2. madde karar #13 ile girdi. **Çek tuzağı ve sorgu adımı Adım 21'de girdi**, kalan 4 madde açık |

Eren bir açık kararı cevapladığında: satırı "Alınmış kararlar" tablosuna taşı ve ilgili tasarım dosyasını güncelle.

## 20. Denge: alış marjı dar kaldığı için müşteri bütçesi ve satıcı tabanı açıldı (2026-11-19)

**Durum:** Adım 11'de `sim.js` ile ölçüldü. Eski sayılarla iyi oynayan bir bot 30 günde 6,0M → 6,2M'de kalıyordu; hedef 7,5M hiçbir oyunda tutmuyordu. Sorun kâr marjıydı: satıcının tabanı arabanın bilinen değerinin %94-98'i, müşterinin tavanı ise %102-110'u. Aradaki fark ekspertiz (7.500 TL), sabit gider (günde 8.000 TL) ve %20 vergiyle eriyordu.

**Karar:** Hedef (7,5M) ve başlangıç kasası (6M) değişmedi — karar #10 duruyor. Bunun yerine iki sayı açıldı:

| Sayı | Önce | Sonra |
|---|---|---|
| `TABAN_R.durust` | 0,93-0,97 | 0,91-0,95 |
| `TABAN_R.abartici` | 0,86-0,92 | 0,84-0,90 |
| `TABAN_R.dolandirici` | 0,90-0,95 | 0,88-0,93 |
| `MUSTERI_TIPLERI.pazarlikci` bütçe | 1,02-1,06 | 1,085-1,135 |
| `MUSTERI_TIPLERI.aceleci` bütçe | 1,05-1,10 | 1,115-1,175 |
| `MUSTERI_TIPLERI.titiz` bütçe | 1,03-1,08 | 1,095-1,155 |

**Neden bu ikisi:** Galerici arabayı piyasanın altına alıp üstüne satar; marj oradan çıkmalı. Aksiyon sayısını artırmak günü uzatırdı, sabit gideri düşürmek dükkânın baskısını yok ederdi, hedefi düşürmek de "otuz günde yüzde yirmi beş" sözünü bozardı.

**Sonuç (100'er oyun):** akıllı bot %67 kazanıyor, saf bot %0 (50 oyunda itibarsız bitiyor), hep saklayan bot ortalama 5,6M ile hep söyleyenin 7,8M'sinin çok altında.

## 21. Araba çeşitliliği ve segment marjı (2026-11-19)

**Durum:** Katalogda 12 model vardı, ilanlar tekrar ediyordu. Eren hem çeşitlilik hem de "pazarlığa gidilen arabanın sahnede görünmesi" istedi.

**Karar:**
1. Katalog 49 modele çıktı, fiyat aralığı 285.000 – 2.000.000 TL. Her modele `govde` alanı eklendi.
2. Sahneye araba katmanı girdi: `img/araba/<marka>-<model>.png` → `<govde>.png` → hiçbir şey. Karakterlerdeki kuralın aynısı; görsel yoksa oyun eskisi gibi görünür.
3. **Segment marjı:** müşteri bütçesi ucuz arabada ×1,09, orta segmentte ×1,03, pahalı arabada ×0,975.

**Segment marjının sebebi:** katalog genişleyince simülasyon iki uç gösterdi. Bot en ucuz ilanı seçerken kazanma oranı %33'e düştü (ucuz arabanın marjı bir aksiyona değmiyordu), en pahalıyı seçmeye başlayınca %93'e çıktı (mutlak marj büyüktü, risk aynıydı). Yüzdesel marjı segmentle değiştirince ikisi de baskın olmaktan çıktı; 150 oyunda akıllı bot %63.

**Ölçülen:** sadece ucuz araba alan bot 30 günde 6,7 araba alıp 5,98M ile bitiriyor — kazanmıyor ama batmıyor da. Yani ucuz araba, kasası daralan oyuncunun ayakta kalma seçeneği; ana strateji değil.

## 22. Sefer bedava para olmamalı (2026-11-19)

**Durum:** Adım 18'de şehir dışı seferler eklendi. İlk ayarlarla (3 gün bekleme, 16-38 bin yol masrafı) simülasyondaki seferci bot 30 günde 8,6 sefere çıkıp %82 kazanıyordu; aynı mantıkla oynayan ama sefere çıkmayan bot %62'deydi. Sefer, oyunun geri kalanını gölgeliyordu.

**Sebep:** Oyunda darboğaz alım tarafında. Normal gün ~1,5 alış veriyor, sefer 2 alış veriyor — üstüne ilanlar %12-18 ucuz. Yani sefer hem daha çok hem daha ucuz araba demekti.

**Karar:** Seferin kârını kısmak yerine sıklığını ve giriş bedelini değiştirdik: `SEFER_BEKLEME` 3 → 5 gün, yol masrafları %60 arttı (25.600 - 60.800 TL). İndirim ve pazarlık hakkı aynı kaldı, çünkü seferin cazibesi oradan geliyor.

**Sonuç:** 150 oyunda akıllı %63, seferci %61, sefer sayısı 5,7. Sefercinin medyanı biraz yüksek ama kazanma oranı aynı — sefer artık daha kârlı bir yol değil, daha oynak bir yol.

## 23. Konsinyenin marjı alım marjının yarısı kadar (2026-11-19)

**Durum:** Adım 19'da konsinye eklendi. Marjı belirleyen tek sayı `KONSINYE_NET` (sahibin istediği netin bilinen değere oranı). İlk denemede 0,90-0,96 kondu; simülasyonda konsinyeci bot %92 kazandı, aynı mantıkla oynayan ama konsinye almayan bot %68'de kaldı.

**Sebep:** O aralıkta sahibin neti, galericinin pazarlıkla ödeyeceği tabanın (bilinen değerin %94-98'i) altında kalıyordu. Yani konsinye "aynı marj, üstelik sermaye bağlamadan ve noter ödemeden" demekti — alımın her açıdan üstünde.

**Karar:** `KONSINYE_NET` 0,98-1,03. Satıcı konsinyeye, galericinin vereceği fiyatı beğenmediği için razı olur; o yüzden sahibin neti tabanın biraz üstünde olmalı. 1,00-1,05 denendi, bu sefer bot konsinyeyi hiç almadı (ölü içerik).

**Sonuç (150 oyun):** akıllı %62, konsinyeci %61, oyun başına 3,9 konsinye satışı. Konsinyenin değeri kârda değil, kasayı boşaltmamasında. Sadece ucuz araba alan bot konsinyeyle 5,98M'den 6,12M'ye çıktı.

## 24. Görseller dizinin kendi karelerinden (2026-11-19)

**Durum:** Eren diziyi yapan ekiple konuştu, oyunu onlara sunacak ve karelerin kullanımı için izin aldı. 191 kare masaüstünde (`karakterler gerçek`).

**Karar:** Karakterlerin tamamı ve mekânların bir kısmı dizi karelerinden kesilecek. Eşleme kodda değil, ayrı bir araçta durur (`araclar/dizi-gorselleri.py`): hangi kare, hangi kırpma kutusu. Böylece bir kare beğenilmezse tek satır değişip iki komutla yenilenir.

**Sınır:** Mekânda ölçüt çözünürlük değil, **arka planda karakterin kendisi olmaması**. Dikey reel karelerinde karakterler kareyi doldurduğu için ekspertiz, noter, büro, gece-sanayi, ilan-sokak ve sanayi-avlu dizi karesinden yapılamadı; o altısında önceki temiz fotoğraflar duruyor.

**Yan karar:** Oyunun altındaki "hayran yapımı, resmî değil" satırı kaldırıldı.

## 25. Kusur yükü fiyata değil, trafiğe ve sabra işler (2026-11-19)

Eren'in 2. maddesi: "çok sorunlu araç zor satılsın". Önce kusurun müşteri bütçesini de kısmasını
denedim, denge çöktü (akıllı bot %62 → %41) çünkü neredeyse her arabanın bir kusuru var; o kısıntı
"çok sorunlu araba zor satılsın" değil "her araba biraz daha az kazandırsın" demeye geliyordu.
Üstelik algılanan değer kusuru zaten düşürüyor, ikinci kez düşürmek çifte sayım.

Karar: kusur yükü **fiyata dokunmaz**. İki yere işler: müşteri gelme olasılığı ve satış masasındaki
sabır. Yük, kusurların piyasa değerine oranından çarpımsal birikimle hesaplanır (`1 - Π(1 - pay)`),
oyunda kullanılan hâli ise **karesi** (`KUSUR_YUK_US`). Kare almak kasıtlı: tek boyalı kapı pazarı
soğutmasın, üst üste binen kusurlar hızla cezalandırsın.

Ölçülen sonuç: 1 boyalı parça trafiğin %100'ü, 3 boya + tramer %96'sı, ağır hasar %71'i,
ağır hasar + 4 boya + motor %54'ü ve bir sabır eksiği. Dokuz denge hedefi tutuyor, akıllı bot %62.

Saklanan kusur yük üretmez — müşteri bilmediği kusurdan ürkmez, bedeli zaten sonradan şikâyet
olarak dönüyor.

## 26. Düşük itibar masaya üç yerden oturur (2026-11-19)

Eren'in 11. maddesi. İtibar zaten gelme olasılığını ve müşteri bütçesini değiştiriyordu; bunlar
oyunda hissedilmiyordu çünkü ikisi de perde arkasında. Eklenenler görünür olanlar:

- İtibar 35'in altında müşteri bir, 20'nin altında iki sabır eksik oturuyor.
- İtibar 40'ın altında nakit müşteri ekspertizden vazgeçmiyor, yani kusur saklamak zorlaşıyor.
  (Çekle ödeyen müşteri ayrı mekanik, o zaten ekspertiz istemiyor; kural onu kapsamıyor.)
- İtibar 35'in altında müşteri güvensiz bir ağızla açıyor (`guvensizAcilis` replikleri).

Sabır `SATIS_SABIR_MIN` altına inmiyor, yoksa görüşme hiç başlamadan bitiyor.

## 27. Satıcı persona'sı tipin yerine geçmez, üstüne biner (2026-11-19)

Eren'in 12. maddesi: araç modeline göre satıcı tiplemeleri. Mevcut `saticiTipi`
(dürüst/abartıcı/dolandırıcı) **kaldırılmadı**; persona onun üstüne bindi, çünkü tip "bu adam
kusuru saklıyor mu" sorusunu cevaplıyor, persona ise "nasıl biri" sorusunu. İkisi farklı eksen.

Altı persona `js/config.js` içinde `PERSONALAR` tablosunda: piyasacı, kurumsal, memur, esnaf,
çaylak, çiftçi. Her biri beş şeyi oynatıyor: satıcı tipi çekilişindeki ağırlıklar (`tipAgirlik`),
pazarlık tabanı (`tabanCarpani`), sabır (`sabirEk`), düşük itibara tahammül (`itibarDuyarlilik`)
ve hangi ortakla iyi anlaştığı (`ortak`). Ayrıca `gururlu` olanlar ağır hakarete masadan kalkıyor,
`hesapCarpani` Drej'in aralığını daraltıp genişletiyor.

49 modelin her birine `data/modeller.js` içinde bir persona yazıldı ama her ilanda çıkmıyor:
`PERSONA_SADAKAT` (%72) olasılıkla modelin kendi tiplemesi, kalanında rastgele biri. Aynı Şahin'i
her seferinde aynı tip insan satmasın diye.

**Denge dersi:** `tabanCarpani` ilk turda 0,96-1,04 aralığındaydı ve dengeyi bozdu — ama beklediğim
yerden değil. Akıllı bot %64'te kaldı, buna karşılık seferci %63'ten %79'a, takasçı %67'den %77'ye
çıktı. Sebep: taban farkı *varyans* yaratıyor ve varyans **çok ilana bakanı** ödüllendiriyor;
seferci günde 3-4 ilan fazla görüyor, dolayısıyla ucuz tiplemeye denk gelme şansı artıyor.
Aralık yarıya indirilince (0,98-1,02) dokuz hedef de tuttu. Ders: bir sayıya varyans eklerken
"ortalaması nötr mü" yetmiyor, "kim daha çok zar atıyor" diye de sormak gerekiyor.

Tipleme oyuncuya görünür: ilan detayında kısa tanımıyla, pazarlık şeridinde adıyla. Görünmezse
pazarlığı etkilediği hissedilmiyor, madde de karşılanmıyor.

## 28. Hakaretin iki kademesi var (2026-11-19)

Eren'in 4. maddesi "çok ucuz teklif verince satıcı sinirlensin" diyordu; tek kademe vardı
(tabanın %85 altı → sabır -2). İkinci kademe eklendi: tabanın %62 altı artık "aşağılama"
sayılıyor, sabır -3 gidiyor ve `gururlu` persona (piyasacı, kurumsal) tartışmadan kalkıyor.
Böylece "düşük teklif" ile "adamı aşağılamak" arasında oyuncunun hissedeceği bir fark oluyor.

## 29. Hedefin sebebi: dükkânın mülkü satılıyor (2026-11-19)

Eren'in 7. maddesi "neden 7,5 milyon" diye soruyordu. Seçilen premise: dayı galeriyi bıraktı ama
dükkân kiracıydılar; mal sahibi satışa çıkardı, ilk alım hakkını onlara verdi, otuz gün süre tanıdı.
7.500.000 TL dükkânın fiyatı. Mevcut "kasada altı milyon var, borç yok" cümlesiyle çelişmiyor ve
baskıyı aileden değil dışarıdan getiriyor.

Prolog yedi repliğe çıktı, 30. gün sahnesi ve bitiş başlıkları buna bağlandı: hedefi tutturunca
"Dükkân bizim ortak!", tutturamayınca "Otuz gün bitti. Kepengi başkası açacak."

## 30. Öğretici ayrı bir senaryo değil, gerçek oyunun kendisi (2026-11-19)

Eren'in 8. maddesi 2-3 günlük bir tutorial istiyordu. Ayrı bir sahte akış yazmak yerine gerçek oyun
sabit tohumla (`TUTORIAL_TOHUM`) başlatılıyor, ilk ilan affedici hale getiriliyor (dürüst satıcı,
gizli kusur yok, fiyat piyasanın altında), rehber açık tutuluyor ve üstte "burada kaybettiğin
gerçek değil" bandı duruyor. Süre dolunca kapanış ekranı çıkıyor ve `yeniOyun` çağrılıp her şey
temizleniyor.

Gerekçe: öğrettiğin şey oyunun kendisi oluyor, ikinci bir akışı bakımı gerekmiyor, ve mevcut
11 adımlı rehber zaten bu işi yapıyordu — eksik olan çerçeveydi.

## 31. Persona ağırlıkları şehir dışında devreye girmez (2026-11-19)

Faz 3'ten kalan bir yan etki 400 oyunluk ölçümde çıktı: seferci bot akıllı bottan 13 puan öne
geçmişti. Sebep, `sehirIlanlari` şehrin dolandırıcı çarpanını yükseltirken persona'nın `tipAgirlik`
değerlerinin (memur 0,4 — kurumsal 0,5) bu riski seyreltmesiydi; sefer tasarlandığından güvenli
hale gelmişti. Karar #22 "sefer bedava para olmamalı" diyordu.

Çözüm: şehir dışındaki ilanlarda persona tip ağırlıkları uygulanmıyor — tanımadığın şehirde
satıcının kim olduğunu bilmiyorsun. Fark cerrahi: sefere çıkmayan botların sayıları birebir aynı
kaldı. Sefer farkı 13'ten 7'ye indi.

**Ölçüm dersi:** 150 oyunluk koşuda konsinyeci 13, takasçı 13 görünüyordu; 400 oyunda ikisi de
9 ve 8'e indi, yani gürültüydü. Sefer ise iki örneklemde de yüksek kaldı. Bir hedef sınırda
görünüyorsa sayıyı değiştirmeden önce örneklemi büyüt.

## 32. Tempo bekleme eklemeden kurulur (2026-11-19)

Eren'in 9. maddesi "bir tuşa dokununca hemen bir şeyler oluyor, her şey aşırı hızlı" diyordu.
Araya zorunlu bekleme koymadım: oyuncuyu bekletmek tempo değil, gecikme olur ve ikinci oynayışta
sinir bozar. Bunun yerine olayların **görünme sırası** ayrıldı:

- Ekran değişince içerik kısa bir yumuşamayla yerine oturuyor. Her çizimde değil, sadece ekran
  değiştiğinde (`js/ui.js`, `sonCizilenEkran`) — yoksa her tıklamada sayfa titriyor.
- Pazarlıkta önce senin rakamın oturuyor, karşı tarafın cevabı 0,32 saniye sonra geliyor.
  "Tıkla, her şey aynı anda olsun" hissini kıran şey bu.
- Sabah haberleri ve akşam notları sırayla beliriyor, hepsi birden değil.

Hepsi `prefers-reduced-motion` altında kapanıyor.

Not: "genel tempo/süre" ifadesi oyunun uzunluğu (30 gün, günde 3 aksiyon) olarak da okunabilir.
Bu fazda arayüz temposu olarak ele alındı; oyun uzunluğu Eren oynadıktan sonra ayrıca konuşulacak.

## 33. Replik havuzu eksikse boş baloncuk değil, en yakın duruma düşülür (2026-11-19)

Faz 6 süpürmesinde çıktı: `agirHakaret` repliği sadece persona havuzlarına yazılmıştı, üç satıcı
tipinin (dürüst/abartıcı/dolandırıcı) genel havuzlarında yoktu. Persona alanı olmayan bir araba —
yani Faz 3'ten **önce kaydedilmiş bir oyun** — ağır hakarette boş baloncuk gösteriyordu. Testçilerin
tarayıcısında bu kayıtlardan var.

İki katmanlı çözüldü: (1) `saticiReplik` artık havuz boşsa en yakın duruma düşüyor
(`agirHakaret → hakaret`, `geriDonus → acilis`, `kalkCagirdi/kalkBitti → kalkis`,
`ortasi → karsiTeklif`), son çare `karsiTeklif`. (2) Üç satıcı tipine de `agirHakaret` havuzu
yazıldı.

Testle bağlandı: 3 tip × 7 persona durumu × 11 durum kombinasyonunun hiçbiri boş dönmüyor, ve
persona alanı olmayan eski kayıt pazarlığı çökertmiyor.

**Ders:** yeni bir replik durumu eklerken onu sadece yeni havuza yazmak yetmiyor; ya eski havuzlara
da yazılacak ya da düşülecek bir yedek tanımlanacak. Boş baloncuk sessiz bir hata, test etmezsen
görünmüyor.


## 34. Görsel çıktıları ekrandaki boyuta göre sınırlanır (2026-11-20)

**Durum:** `img/` klasörü 41,3 MB'a çıkmıştı, 31,9 MB'ı arabalardı. Dosyalar 2200-2300 piksel
genişliğindeydi; oyun arabayı sahnede en fazla ~500×240 CSS pikseli gösteriyor. Yerelde fark
etmiyor ama yayımlanan test sürümünü açan biri bütün bu yükü indiriyor.

**Karar:** `gorsel-hazirla.py` çıktıyı iki sınırla yazıyor — araba en çok 1200 piksel genişlikte
(`ARABA_EN_COK_GENISLIK`), karakter en çok 900 piksel boyunda (`KARAKTER_EN_COK_YUKSEKLIK`) — ve
ikisi de 256 renkli PNG olarak kaydediliyor. Mekânlar 1600×900 JPEG olarak kalıyor, onlar zaten
sorun değildi.

**Ölçülen:** 41,3 MB → 7,7 MB. Arabada tam renkli PNG 900 KB, 256 renkli 160 KB. Fark sadece
%100 yakınlaştırınca gövdede hafif bir benek olarak görünüyor; sahnede araba 2,4 kat küçültülerek
çizildiği için kayboluyor. Kesim kenarlarındaki yumuşak alfa korunuyor (palet girdilerinin ~90'ı
ara alfa değerine gidiyor), yani figürler sert kenarlı olmuyor.

**Sıra önemli:** küçültme ve renk indirgeme **plaka temizliğinden sonra** yapılıyor. Önce
yapılırsa filigran harfleri küçülüyor ve `plaka_yazisini_sil` içindeki harf boyu ölçütleri onları
bulamıyor.

**Neden webp değil:** webp q88 biraz daha küçük (127 KB) ama karakterlerin yedek zinciri
(`js/sahne.js`, `karakterYolu`) sadece `.png` deniyor; biçim değiştirmek sahne kodunu da
değiştirmek demekti. Palet PNG aynı kazancı kod değişikliği olmadan veriyor.

## 35. Piyasa trendi bir eşitlik bozucudur, strateji değil (2026-11-20)

**Durum:** Haftalık piyasa haberleri eklendi: 4-5 gün süren trendler ilgili gövde/segmentte
müşteri gelme olasılığını ve bütçesini oynatıyor (`data/trendler.js`, `js/trend.js`,
`tasarim/15`). Soru şuydu: etki ne kadar olmalı?

**Ölçüm sırası (hepsi 400 oyun):**

| Ayar | Akıllı bot | Not |
|---|---|---|
| Trend öncesi | %66 | eski baseline |
| artan 1.25 / azalan 0.85, üç trendin kaybedeni yok | %82 | piyasa topyekûn şişti |
| katalog simetrik, artan 1.14 / azalan 0.86 | %70 | bandın sınırı |
| artan 1.18 / azalan 0.74, bot ağırlığı 1.5 | %63 | bot trend uğruna kârlı ilanı feda etti |
| artan 1.18 / azalan 0.74, bot ağırlığı 1.06 | %69 | kabul edilen ayar |

**İlk hata kataloğdaydı, sayılarda değil.** Altı trendin üçünde `azalan` kümesi boştu;
trend talebi dağıtmıyor, ekliyordu. Her trende kaybeden taraf yazılınca %82 kendiliğinden
%70'e indi. Yeni trend eklerken kaybedeni de yaz.

**İkinci ders ölçü aletiyle ilgili.** Botun trend ağırlığı 1,15'ken seçimi hiç değişmiyordu
(trendli ve trendsiz bot ikisi de %68), 1,5'e çıkarınca kazanma oranı %63'e düştü. Yani
trendin ekonomik değeri, ilanlar arası kâr farkının yanında küçük. Doğru ağırlık 1,06:
benzer kârlı iki ilandan trenddekini seç, ama belirgin şekilde daha kârlı bir arabadan
trend için vazgeçme.

**Karar:** `TREND_GELME` { artan 1.18, azalan 0.74 }, `TREND_BUTCE` { artan 1.012,
azalan 0.978 }. Trendi gören bot %69, görmeyen %68 — fark küçük ve kasıtlı. Arayüz de buna
göre: küçük bir etiket, büyük bir uyarı değil.

**Zamanlama tutuyor:** ortalama stokta kalma 2,85 gün, trend 4-5 gün. Alırken trendde olan
arabaların %72'si satarken hâlâ trendde, %6'sı terse dönüyor. Yani ilan bandındaki etiket
oyuncuyu yanlış yönlendirmiyor.

**RNG:** trend seçimi yan akıştan yapılıyor (`durumAl` / `tohumla` / `durumYaz`), ana akış
kaymıyor. Testle bağlandı.

## 36. Oyun yayına çıkıyor: itch.io oyuncu için, Pages kalıcı link için (2026-11-20)

Oyun şimdiye kadar iki yerde oynanıyordu: yerelde `index.html` ve Claude artifact linki.
Artifact bir test aracı, kalıcı yayın adresi değil.

**Kanallar.** itch.io oyuncu ve geri bildirim için (oyun sayfası, yorum, devlog),
GitHub Pages değişmeyen link için. İkisi de aynı pakete bakıyor: `python araclar/paket.py`
`yayin/` klasörünü ve itch.io'nun istediği zip'i kuruyor. Ayrıntı `YAYIN.md` dosyasında.

**Masaüstü exe elendi.** Tauri ya da Electron ile exe çıkarmak mümkün ama oyun zaten
`file://` altında çift tıklanınca açılıyor; exe'nin kattığı tek şey ikon ve pencere
başlığı olurdu, karşılığında Rust kurulumu ya da 120 MB paket geliyordu.

**PWA önbelleği "önce ağ".** `sw.js` yalnızca `img/` isteklerinde önce önbelleğe bakıyor
(ağırlık orada, 7,7 MB), geri kalan her şeyde önce ağa gidiyor. Klasik PWA tuzağı
oyuncunun eski sürümde takılı kalmasıdır; önce-ağ dediğimizde her açılışta son sürüm
geliyor, internet yoksa son çalışan sürüm önbellekten açılıyor. Precache listesi
tutulmuyor: tutulsaydı `index.html` içindeki script sırası ikinci bir yerde daha yazılı
olurdu ve biri unutulduğunda çevrimdışı oyun sessizce bozulurdu.

**Service worker kaydı `js/pwa.js` içinde** ve yalnızca `https` ya da `localhost` altında
çalışıyor. `file://` altında hiçbir şey yapmıyor, yani "`index.html` çift tıklanınca
çalışmalı" kuralı duruyor.

**GitHub'a geçmişsiz tek commit gitti.** Pages ücretsiz hesapta açık depo istiyor; mevcut
deponun 39 commit'i Eren'in gerçek e-posta adresini taşıyor ve `kaynak/` altında 38 MB ham
görsel var. Bu yüzden GitHub'daki depo şu anın anlık görüntüsü, commit e-postası
`Eren99135@users.noreply.github.com`. Geliştirme yerel depoda, tüm geçmişiyle sürüyor.

**Ölçülen:** yayın paketi 122 dosya / 8,1 MB, zip 7,8 MB. Sunucu kapatılıp sayfa yeniden
açıldığında oyun önbellekten eksiksiz açılıyor (ekran görüntüsüyle doğrulandı).
