---
name: oyun-tonu
description: Galerici Ortaklar'ın içine girecek her Türkçe metnin kuralları — satıcı ve
  müşteri replikleri, ortakların sözleri, olay kartı metinleri, hikâye sahneleri, ekran
  başlıkları, düğme yazıları. Oyuna metin yazarken, var olan metni değiştirirken ya da
  yeni bir replik grubu eklerken kullan. Oyun dışı yazılar (rapor, e-posta) için değil,
  onlar için insan-uslubu yeteneği var.
---

# Oyun içi metin

## Tonun kaynağı burada, ezberden yazma

`context/kaynaklar/ton-rehberi.md` — dizinin 46 bölümünden çıkarılmış ağız: esnaf kelimeleri
(erebe, pere, tezgah, ölücü, sazan, hasta), hitaplar (ortak, dayı, Kuro, hacı abi), pazarlık
taktikleri, kapanış kalıpları, satışın ritüeli. **Metin yazmadan önce aç ve oku.**

`context/kaynaklar/dizi-bilgi.md` — kim kimdir, aralarındaki ilişki, dizideki olaylar.
`context/tasarim/05-karakterler.md` — karakterlerin oyundaki rolü.

Dizinin cümleleri kopyalanmaz; kalıpları ve tavrı kullanılarak yeni replik yazılır. Dizinin
imza nidaları (ton rehberinde ★ ile işaretli) az ve yerinde kullanılır, her sahneye serpilmez.

## Sayılabilir kurallar

- Bir replik **en fazla 12 kelime**. Baloncuk küçük. Tahmin etme, say.
- Cümleler kısa ve tek nefeslik; çoğu 3-10 kelime.
- Rakamlar esnaf gibi kısaltılır: "650 son söz", "ortası 600". "1.575.000 TL teklif ediyorum" değil.
- Her durum için **en az üç varyant**. Aynı cümleyi iki kez duyan oyuncu oyunu kapatır.
- Düz tırnak kullan, kıvrık tırnak değil. Emoji yok. Başlıkta her kelimeyi büyük yazma.

## Nereye yazılır

| Dosya | İçinde ne var |
|---|---|
| `data/replikler.js` | satıcı (tipe göre), müşteri (tipe göre), nuri / drej / kro |
| `data/kartlar.js` | sabah olay kartları |
| `data/hikaye.js` | ana hikâye sahneleri, prolog, final |
| `data/rehber.js` | rehber balonları ve "?" yardım metinleri |
| `data/sefer.js` | şehirler, yemek molası replikleri, Kro'nun ipucu |
| `data/sinav.js` | yetki belgesi sınavı soruları |

Kod içi anahtarlar ASCII ve Türkçesiz (`durust`, `abartici`, `piyasaci`); **metnin kendisi**
tam Türkçe yazılır, kısaltılmaz.

## Yapay zekâ kokusu

Oyun metninde zaten ölümcül ama yine de: önem şişirmesi ("kritik öneme sahip"), negatif
paralellik ("sadece X değil aynı zamanda Y"), üçleme (üç sıfat yan yana), cümle sonu
-arak/-erek kuyruğu, "Sonuç olarak" diye başlayan kapanış, muğlak atıf ("uzmanlara göre"),
boşluklu em dash. Bunların hiçbiri bu oyunun ağzında yok.

## Sınır

Küfür, hakaret, etnik ya da bölgesel aşağılama yok. Sanayi ağzı ile kabalık ayrı şeyler;
dizinin tonu şakacı ve sıcak, aşağılayıcı değil.

## Yazdıktan sonra

1. Anahtarın gerçekten nerede kullanıldığını koddan doğrula (`js/pazarlik.js` içindeki
   `saticiReplik` / `musteriReplik` çağrıları). İsimden tahmin etmek yanlış yere yazdırır.
2. `node araclar/kos.js` — bozuk JS bütün oyunu çökertir, testler yakalar.
3. `node araclar/oyna.js` — çıktıdaki replik örneklerine bak.
