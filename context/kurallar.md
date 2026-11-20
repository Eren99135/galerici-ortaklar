# Kurallar

## Kod kuralları
1. **Teknoloji:** Saf HTML + CSS + vanilla JavaScript. npm, framework, bundler yok. Dış kütüphane gerekirse önce Eren'e sor.
2. **Çalıştırma:** `index.html` dosyası çift tıklanınca açılmalı. ES modülleri `file://` altında çalışmadığı için klasik `<script>` etiketleri ve tek bir global isim alanı (`window.G`) kullanılır. Script sırası `index.html` içinde sabittir (bkz. `tasarim/08`).
3. **Ayrım:** Oyun mantığı (`araba.js`, `pazarlik.js` vb.) DOM'a dokunmaz; saf fonksiyonlardır, girdi alır ve sonuç döndürür. DOM sadece `ui.js` içindedir.
4. **Sayılar:** Bütün denge sayıları `config.js` içindedir. Mantık dosyasında `0.85` gibi çıplak bir sayı görürsen config'e taşı.
5. **Rastgelelik:** Sadece `G.rng` kullanılır. `Math.random()` yasak.
6. **Durum:** Oyunun tüm durumu tek bir `state` nesnesindedir. JSON'a çevrilebilir olmalı (fonksiyon, DOM referansı, döngüsel referans yok).
7. **Kayıt:** `localStorage`, her zaman try/catch içinde. Kayıt bozuksa oyun yeni oyunla açılır, çökmez.
8. **İsimlendirme:** Türkçe, ASCII, camelCase: `gercekDeger`, `saticiTipi`, `pazarlikBaslat`. Dosya adları küçük harf.
9. **Para:** TL tam sayı olarak tutulur. Gösterimde `1.575.000 TL` biçimi kullanılır (tek bir `paraYaz()` yardımcı fonksiyonu).
10. **Sadelik:** Eren kodu okuyacak. Akıllıca ama anlaşılmaz tek satırlar yerine açık kod yaz. Önemli formüllerin üstüne tasarım dosyasındaki bölümü yorum olarak yaz (ör. `// tasarim/03 §4.3`).

## Çalışma kuralları
- Bir seferde tek yol haritası adımı. Bitmeden diğerine geçme.
- Tasarımda olmayan bir mekanik ekleme. Gerekli görürsen öner, onay al, `kararlar.md` dosyasına yaz.
- Tasarımla kod çelişirse tasarım dosyası esastır. Tasarım yanlışsa önce tasarımı güncelle, sonra kodu.
- Her adım sonunda: tarayıcıda aç, konsolu kontrol et, `hafiza.md` dosyasını güncelle.

## Metin ve ton kuralları
- Oyun içi her metin Türkçe, günlük, esnaf ağzı. "Erebe", "pere", "ortak", "kuro", "abi", "dayı".
- Karakterler kendi seslerini korur (bkz. `tasarim/05` ve `tasarim/07`).
- Dizideki replikler birebir kopyalanmaz; aynı ruhta yeni replikler yazılır.
- Sayılar oyuncuya gösterilirken her zaman TL biçiminde.

## Context dosyalarını güncelleme kuralları
- `hafiza.md` her oturum sonunda güncellenir. Kısa tutulur; eski günlük kayıtları birkaç satırlık özete indirilir.
- `kararlar.md` sadece ekleme yapılarak büyür.
- Bir tasarım dosyası değişirse `hafiza.md` günlüğüne "tasarim/0X güncellendi: ..." yazılır.
