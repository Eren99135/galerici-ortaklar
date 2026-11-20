# AGENTS.md — Galerici Ortaklar

> Bu dosya hangi yapay zekâ ajanı kullanılırsa kullanılsın (Claude Code, Codex vb.) ilk okunacak dosyadır. Kısa tutulur. Ayrıntılar `context/` klasöründedir ve **sadece gerektiğinde** okunur.

## Proje tek cümlede
**Galerici Ortaklar**: @galericiortak dizisinden esinlenen, tarayıcıda oynanan, sıra tabanlı bir galeri işletme ve pazarlık oyunu. Önce Eren'in kendisi oynaması için yapıldı, artık yayında: GitHub Pages'te https://eren99135.github.io/galerici-ortaklar/ ve itch.io'da. Yayın işleri `YAYIN.md` dosyasında (karar #36).

## Oturum başında
1. `context/00-HARITA.md` dosyasını oku. Hangi dosyanın ne zaman okunacağını orası söyler.
2. `context/hafiza.md` dosyasını oku. Proje nerede kaldı, sıradaki adım ne, orada yazar.
3. Göreve göre, haritadan **yalnızca ilgili** tasarım dosyalarını aç. Hepsini birden okuma.

## Değişmez kurallar (özet; tamamı `context/kurallar.md`)
- Saf HTML + CSS + vanilla JS. Framework, paket ve build adımı yok. `index.html` çift tıklanınca çalışmalı.
- Oyun mantığı DOM'a dokunmaz. Bütün DOM işi `js/ui.js` içindedir.
- Bütün denge sayıları `js/config.js` içindedir. Koda sabit sayı gömülmez.
- Rastgelelik sadece tohumlu RNG (`js/rng.js`) üzerinden yapılır. `Math.random()` kullanılmaz.
- Oyun içi metinler Türkçedir. Kod içi isimler Türkçe ve ASCII olur (ör. `pazarlik`, `gercekDeger`).
- Her adımın sonunda oyun açılabilir ve oynanabilir durumda olmalı.

## Çalışma döngüsü
1. **Planla:** Ne yapacağını kısa bir listeyle söyle ve onay al.
2. **Yap:** Bir seferde tek bir yol haritası adımı uygula.
3. **Doğrula:** Tarayıcıda aç, konsolda hata olmadığını kontrol et, ilgili senaryoyu dene.
4. **Kaydet:** `context/hafiza.md` dosyasını güncelle. Yeni bir karar alındıysa `context/kararlar.md` dosyasına ekle.

## Klasör haritası
```
index.html              → oyun (çift tıklanınca açılır)
test.html               → testler (hepsi yeşil olmalı)
style.css               → görsel stil
js/                     → oyun kodu (config, rng, araba, pazarlik, musteri, gun, ui ...)
data/                   → model kataloğu ve replikler
AGENTS.md / CLAUDE.md   → giriş kapısı (bu dosya)
ILK_PROMPT.md           → Eren'in Claude Code'a ilk yapıştıracağı mesaj
context/00-HARITA.md    → context klasörünün içindekiler tablosu
context/hedefler.md     → neyi neden yapıyoruz, "iyi" ne demek
context/kararlar.md     → alınmış ve açık kararlar
context/kurallar.md     → kod, tasarım ve ton kuralları
context/hafiza.md       → durum, ilerleme günlüğü, öğrenilenler
context/oyun-notlari.md → Eren'in oynayış notları (denge ve his için birinci kaynak)
context/tasarim/        → oyun tasarımı, konu konu bölünmüş
context/kaynaklar/      → ham kaynak notları (dizi bilgisi, Part 1–46 video linkleri)
```
