# Context Haritası

Bu dosya `context/` klasörünün içindekiler tablosudur. Amaç: ajan her şeyi okumak yerine **sadece işine yarayanı** okusun, token harcanmasın.

## Her oturumda okunur
| Dosya | İçerik |
|---|---|
| `hafiza.md` | Projenin şu anki durumu, son oturumda ne yapıldı, sıradaki adım, öğrenilen dersler |

## Oyun oynanmaya başladıktan sonra her oturumda okunur
| Dosya | İçerik |
|---|---|
| `oyun-notlari.md` | Eren'in oynayış notları: ne eğlenceli, ne sıkıcı, hangi hata. Denge kararlarında birinci kaynak |

## İhtiyaç olunca okunur
| Dosya | Ne zaman oku |
|---|---|
| `hedefler.md` | Kapsam tartışmasında, "bunu eklesek mi?" sorusunda, oyunun hissini değerlendirirken |
| `kararlar.md` | Bir şeyi değiştirmeden önce: daha önce karar verilmiş mi? Açık kararlar listesi de burada |
| `kurallar.md` | Kod yazmadan önce bir kez; yeni dosya ya da yeni sistem eklerken |
| `kaynaklar/dizi-bilgi.md` | Diyalog, karakter, olay kartı yazarken; dizideki bir sahneyi oyuna taşırken |
| `kaynaklar/ton-rehberi.md` | **Her replik, diyalog, olay kartı metni yazılırken.** Karakterlerin konuşma kalıpları, pazarlık dili, ritüeller |
| `kaynaklar/video-linkleri.md` | Part 1–46 reel linkleri. Bir bölümün aslına bakmak gerektiğinde |

## Tasarım dosyaları (`tasarim/`)
| Dosya | Hangi işte gerekir |
|---|---|
| `01-oyun-dongusu.md` | Gün akışı, aksiyonlar, kapasite, başlangıç/bitiş, skor |
| `02-arabalar-ve-kusurlar.md` | İlan üretimi, model kataloğu, kusur tipleri, satıcı tipleri |
| `03-ekspertiz-ve-pazarlik.md` | Ekspertiz seçenekleri, alış pazarlığı formülleri |
| `04-satis-ve-itibar.md` | Müşteri gelişi, dürüstlük seçimi, satış pazarlığı, masraflar, itibar |
| `05-karakterler.md` | Nuri, Drej, Kro yetenekleri ve yan karakterlerin oyundaki rolü |
| `06-olay-kartlari.md` | Olay destesi, kart yapısı, "Sizce?" mekaniği |
| `07-ekranlar-ve-ton.md` | Ekranlar, arayüz akışı, diyalog dili |
| `08-teknik-mimari.md` | Dosya yapısı, modüllerin sorumlulukları, veri yapıları, kayıt |
| `09-yol-haritasi.md` | Adım adım geliştirme sırası, her adımın "bitti" tanımı, MVP sonrası |

## Görev → dosya kısayolu
- "İskeleti kur" → `kurallar.md`, `tasarim/08`, `tasarim/09`
- "Pazarlığı yap" → `tasarim/02`, `tasarim/03`, `tasarim/05`
- "Satışı yap" → `tasarim/04`
- "Olay kartlarını yaz" → `tasarim/06`, `kaynaklar/dizi-bilgi.md`, `kaynaklar/ton-rehberi.md`
- "Replik yaz" → `kaynaklar/ton-rehberi.md`, `tasarim/07`
- "Arayüzü güzelleştir" → `tasarim/07`, `kurallar.md`
- "Denge ayarı" → `tasarim/03`, `tasarim/04`, `tasarim/09` (simülasyon), `hedefler.md`
- `tasarim/10-seferler.md` — şehir dışı seferler (Adım 18)
- `tasarim/11-konsinye.md` — konsinye: komisyonla satış (Adım 19)
- `araclar/OKU.md` — araçlar: görsel hazırlama (arka plan silme, 16:9 kırpma) ve doğrulama koşucuları (`kos.js`, `oyna.js`)
- `tasarim/12-takas.md` — takas: araba karşılığı araba + nakit fark (Adım 20)
- `tasarim/13-cek-ve-aval.md` — vadeli çek, çek sorgusu, aval (Adım 21)
- `tasarim/14-yetki-belgesi.md` — sınav, baraj, belgesiz satış cezası (Adım 22)
- `tasarim/15-piyasa-trendleri.md` — 4-5 günlük piyasa trendleri: katalog, etki, RNG yan akışı
