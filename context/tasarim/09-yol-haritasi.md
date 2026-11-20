# 09 — Yol Haritası

Kural: Bir seferde tek adım. Her adımın "Bitti" tanımı sağlanmadan sonrakine geçilmez. Her adım sonunda `hafiza.md` güncellenir.

## MVP

### Adım 1 — İskelet
- Dosya yapısı (`08`), config, rng, yardimci, state, kayıt/yükle.
- Ana ekran: Gün, Kasa, İtibar, aksiyon noktaları, "Günü bitir" (sabit gider düşer, gün ilerler).
- `test.html` + RNG ve kayıt testleri.
- **Bitti:** `index.html` çift tıklayınca açılıyor, günü bitirince kasa 8.000 düşüyor, sayfa yenilenince oyun kaldığı yerden devam ediyor, testler yeşil.

### Adım 2 — İlanlar
- Model kataloğu, kusur ve satıcı üretimi (`02`). İlan ekranı.
- **Bitti:** Her sabah 3–4 farklı ilan; aynı tohum aynı ilanları veriyor; konsoldan bir ilanın gerçek değeri ve kusurları görülebiliyor.

### Adım 3 — Ekspertiz
- Göz kontrolü, normal, premium, tanıdık ekspertiz (`03` §1). Araba detay ekranı.
- **Bitti:** Ekspertiz para düşüyor, kusurlar ortaya çıkıyor, "?" satırı doğru davranıyor.

### Adım 4 — Alış pazarlığı ⭐
- Taban, sabır, karşı teklif, hakaret, koz, kalkış, geri dönüş (`03` §2–4). Pazarlık ekranı ve teklif geçmişi. Basit replikler (`kaynaklar/ton-rehberi.md` kalıplarıyla).
- "Kim konuşuyor?" seçimi (Nuri/Drej) ve **sadece pasif etkileri** (Nuri sabır +1, Drej kusur toplamını görür, sabır −1) burada yapılır, çünkü BMW testi Nuri'nin pasifine dayanıyor. Aktif yetenekler (Ağız, Hesap) Adım 7'de.
- **Bitti:** BMW testi birebir geçiyor. Eren 5 pazarlık oynayıp "gerilim var" diyor. Stoğa giriş ve noter masrafı çalışıyor.

### Adım 5 — Satış
- İlan fiyatı, müşteri gelişi, müşteri tipleri, dürüstlük seçimi, müşteri ekspertizi, satış pazarlığı, taviz, vergi (`04`).
- **Bitti:** Bir arabayı alıp satıp kâr edebiliyorsun; saklanan kusur yakalanabiliyor.

> Yapıldı (2026-11-18): Adım 5 yazılırken Şikâyet'in altyapısı (`state.bekleyenEtkiler` + 3-7 gün sonra kasadan geri ödeme ve itibar cezası) öne alındı. Gerekçe: olay kartları olmadan "kusuru sakla" bedava bir strateji oluyor ve `04` §3'ün "saklamanın beklenen değeri hafif negatif" hedefi çalışmıyordu. Kartın ekranı ve metni Adım 8'de gelecek.

### Adım 6 — İtibar
- İtibar etkileri ve değişimleri (`04` §6).
- **Bitti:** İtibar düşünce müşteri gelişi gözle görülür azalıyor.

### Adım 7 — Karakterler
- Nuri'nin "Ağız" ve Drej'in "Hesap" aktif yetenekleri, Nuri'nin sinirlenmesi, Drej'in uyarıları; Kro'nun sabah ilanı ve satış yardımı (`05`). (Konuşan seçimi ve pasifler Adım 4'te yapıldı.)
- **Bitti:** Nuri sinirlenince ertesi gün yok; Drej'in hesap aralığı doğru tabanı kapsıyor.

### Adım 8 — Olay kartları
- Kart altyapısı (veri tabanlı etkiler, bekleyen etkiler), 12 kart + sakin gün, Şikâyet mekaniği (`06`).
- **Bitti:** 30 günde kartlar çeşitli çıkıyor; şikâyet zamanında geliyor.

### Adım 9 — Akşam raporu ve "Sizce?"
- Rapor ekranı, gün notları, Sizce sorusu ve etkisi.
- **Bitti:** Sizce sorusu ertesi günün kartıyla tutarlı.

### Adım 10 — Oyun sonu
- Kazanma/kaybetme, unvan, istatistik, yeni oyun / aynı tohum.
- **Bitti:** Baştan sona bir oyun oynanabiliyor.

### Adım 11 — Denge ✔ (2026-11-19, Eren'in onayı bekleniyor)
- `sim.js`: dört bot (akıllı, saf, hep sakla, hep söyle), `node sim.js 100`. Tek oyunun defteri `node sim.js <tohum> <bot> --iz`.
- Ölçüm sonucu iki sayı açıldı (karar #20): satıcı tabanı −%2, müşteri bütçesi +%6.
- **Durum (100'er oyun):** akıllı %67 kazanıyor, saf %0, hep sakla (5,6M) < hep söyle (7,8M). Üç hedef de tutuyor.
- **Kalan:** Eren iki tam oyun oynayıp onaylayacak.

### Adım 12 — Cilalama ✔ (2026-11-19)
- Replik çeşitliliği: 64 havuzun hepsi en az 5 seçenek, toplam 316 replik. İki test bunu ve yer tutucuları ( `{fiyat} {model} {parca} {tutar} {alt} {ust}` ) koruyor.
- Küçük hareketler: kasa değişince rakam vurgulanıyor ve farkı (`+120.000`) yukarı süzülen bir rozet gösteriyor; konuşma baloncuğu replik değiştiğinde giriyor. `prefers-reduced-motion` ile hepsi kapanıyor.
- Karakter ölçeği düzeldi: boy sahnenin yüksekliğinden alınıyor, genişlik orandan geliyor. Önce geniş duran bir kesim (Nuri) ince duranın (Drej) yarısı kadar görünüyordu.
- Ses yok (karar #4).

## Eren'in oyun notlarından çıkan adımlar

MVP bitip Eren oynadıktan sonra (`oyun-notlari.md`, 2026-11-18) üç istek geldi ve sıraya girdi. Kararlar #14-16. Adım 11 (denge) ve 12 (cila) bunların arkasına kaydı.

### Adım 13 — Sahne görselleri + başlangıç rehberi ✔ (2026-11-18)
- `js/sahne.js`: 26 sahne, ortak yapı taşları (avlu, iç mekân, masa, çay, lamba, araba silueti, karakterler), `img/` foto takası.
- `js/rehber.js` + `data/rehber.js`: 11 adımlık rehber, 11 ekran için "?" yardımı.
- **Bitti:** her ekranda o ana ait sahne çıkıyor, rehber ilk iki günü anlatıyor, testler yeşil.

### Adım 14 — Hikâye ✔ (2026-11-19)
- `data/hikaye.js`: 10 sahne, belirli günlerin sabahında oynar — prolog (1), Rıza ile tanışma (4), Kro işe başlar (7), Cüneyt duyulur (10), Şükrü'nün öğüdü (13), Rıza'nın ortaklık teklifi (16), kriz (19), kapora oyunu (22), son düzlük (26), otuzuncu gün (30).
- `js/hikaye.js`: sahne diyalog motoruna verilir, bitince gündeki olay kartına geçilir; sahnenin `etki` alanı olay motoruna işlenir. Rehber hikâye oynarken susar.
- **Bitti:** 30 günlük oyunda on sahnenin hepsi çıkıyor, oyun sonu ekranı kaç sahne görüldüğünü yazıyor, 105 test yeşil.

### Adım 17 — Araba çeşitliliği ve arabanın sahnede görünmesi ✔ (2026-11-19)
- Katalog 12 → 49 model, `govde` alanı, 2005 öncesine `kmEtkisiz`.
- `js/sahne.js`: araba katmanı ve `arabaAnahtari()` dosya adı üretici (`VW Passat` → `vw-passat`).
- İlan detayı, alış pazarlığı, müşteri ve satış ekranlarında araba sahnede; ilan ve stok kartlarında şerit.
- Segment marjı (karar #21) ile denge yeniden tuttu: 150 oyunda akıllı bot %63.
- **Bitti:** görsel yokken oyun eskisi gibi, `img/araba/` dolunca kendiliğinden devreye giriyor.

### Adım 18 — Şehir dışı seferler ✔ (2026-11-19)
- `data/sefer.js` + `js/sefer.js`: 6 şehir, yol masrafı, indirimli ama riskli ilanlar, yemek molası. Ayrıntı: `tasarim/10-seferler.md`.
- Sefer günü yer: kalan aksiyonlar biter, yerine 2 pazarlık hakkı gelir, o gün satış yok.
- Denge: `sim.js`'e seferci bot eklendi; 150 oyunda akıllı %63, seferci %61.
- **Bitti:** sefer bedava para değil, oynak bir yol.

### Adım 19 — Konsinye ✔ (2026-11-19)
- `js/konsinye.js`: araba sahibinde kalır, tezgâha girer, satılınca komisyon kalır. Kasadan para çıkmaz, noter ödenmez, süre 8 gün.
- Ekspertizde çıkan kusur sahibine gösterilip net aşağı çekilebilir. Rıza'nın getirdiği konsinye ayrı bir olay kartı.
- Denge (karar #23): `KONSINYE_NET` 0,98-1,03'e oturdu; konsinyeci bot %61, akıllı bot %62. Ayrıntı: `tasarim/11-konsinye.md`.
- **Bitti:** konsinye kârda değil, kasayı boşaltmamakta avantajlı; kasası dar oyuncunun çıkış yolu.

### Adım 20 — Takas ✔ (2026-11-19)
- Müşterilerin %22'si yanında arabasıyla geliyor; satış görüşmesinde ona değer biçiliyor, fark nakit alınıyor.
- Takas arabası çoğunlukla "abartıcı" profilde: ekspertiz yaptırmayan yanılır. Ayrıntı: `tasarim/12-takas.md`.
- Denge: beklenti [1,00-1,12] iken takas hiç yapılmıyordu; [0,88-0,98]'e çekildi. 150 oyunda takasçı %70, akıllı %62.
- **Bitti:** takas kârlı ama ekspertiz şartıyla.

### Adım 21 — Çek ve aval ✔ (2026-11-19)
- Müşterilerin %14'ü vadeli çekle ödemek istiyor; çek zorunlu değil, nakit satış her zaman açık. Alırsan tavan %7-13 yükseliyor, para vade gününde giriyor.
- Karekod sorgusu riski açıyor, Rıza aval veriyor (pay karşılığı, zararın yarısını karşılıyor). Ayrıntı: `tasarim/13-cek-ve-aval.md`.
- Denge: çek önce zorunluydu ve akıllı botu %62'den %26'ya düşürüyordu; seçeneğe çevrildi. Vadesi 30. günü aşan çek uyarısı eklendi.
- **Bitti:** 150 oyunda akıllı %63, sorgulayan %58, kör çekçi %37.

### Adım 22 — Yetki belgesi ✔ (2026-11-19)
- Oyun belgesiz başlıyor; 5. günde Ticaret Müdürlüğü yazısı geliyor. Sınav 15.000 harç + bir aksiyon, 12 soruluk havuzdan 5 soru, baraj %70.
- Sınava Drej girerse her soruda bir yanlış şık eleniyor, Nuri girerse elenmiyor (dizideki 88/60). Ayrıntı: `tasarim/14-yetki-belgesi.md`.
- Belgesiz satışta %12 denetim riski, 400.000 ceza, itibar −4.
- **Bitti:** 150 oyunda belgesiz bot %11 (6,54M), sınava giren %62 (7,75M).

## MVP sonrası (sıra Eren'in tercihine göre)
1. **Konsinye:** Araba sahibinde kalır, komisyon alınır; Kemal hikâyesiyle bağlanır.
3. **Takas** ve **kapalı zarf** (Rıza'ya karşı).
4. **Çek ve aval** riski.
5. **Yetki belgesi sınavı** (mini quiz, %70 baraj) ve belgesiz satış cezası.
6. **Tavla / okey** mini oyunları (Rıza'ya karşı).
7. **Hikâye zincirleri:** Cüneyt'in sahte ilanları, ikiz Leon, bagajdaki torba (çok günlük olaylar).
8. Dükkân geliştirmeleri (kamera: değiştirilme olaylarını yakalar, kapasite artışı).
