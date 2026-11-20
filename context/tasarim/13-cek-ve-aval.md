# 13 — Çek ve aval

> Adım 21, 2026-11-19. Kaynak: dizideki Kemal hikâyesi (17-28. bölümler). Çekle alan pazarlık etmez, ekspertiz istemez, üstüne fark verir; çekleri karşılıksız çıkar. Rıza Civic çekine aval verdiği için borç ona kalır.

## Ne işe yarıyor

Peşin para yerine vadeli ödeme. Üstüne fark alıyorsun ama parayı vade gününe kadar görmüyorsun — ve görmeyebilirsin de. Karar bilgiyle yönetiliyor: çeki sorgularsan riski bilirsin.

## Akış

1. Müşterilerin %14'ü çekle ödemek ister (`musteri.odeme === "cek"`). Bu müşteri ekspertiz istemez.
2. **Çek zorunlu değil.** Teklifi almazsan satış normal fiyattan nakit sürer. Alırsan tavan `CEK_PRIM` kadar (%7-13) yükselir.
3. **Karekod sorgusu** (`CEK_SORGU_BEDEL`, 5.000 TL): Kro okutur, risk görünür olur — düşük, orta, yüksek. Sorgulamazsan risk "bilinmiyor" kalır.
4. **Aval:** Rıza imza atar, satıştan `AVAL_PAY` (%12) alır; çek yanarsa zararın `AVAL_KARSILAMA` (%50) kadarını karşılar. Sorgulanmış yüksek riskli çeke aval vermez: *"Ben aradaki köprüyüm abi."*
5. Satış kapanınca kasaya hiçbir şey girmez: çek `state.cekler` listesine düşer. **Vergi ve konsinye neti de vadeye kalır** — para gelmeden gider yazılmaz.
6. Vade günü sabah: ya `tutar − vergi − konsinye neti` kasaya girer, ya karşılıksız çıkar. Karşılıksızda itibar `CEK_YANIK_ITIBAR` (−6), defterde "karşılıksız" satırı, 2-4 gün sonra icra masrafı (`ICRA_MASRAFI`).

## Sayılar (`js/config.js`)

| Ayar | Değer |
|---|---|
| `CEK_OLASILIK` | 0,14 |
| `CEK_PRIM` | [0,07 , 0,13] |
| `CEK_VADE` | [4 , 9] gün |
| `CEK_RISK_ORANLARI` | düşük 0,45 · orta 0,35 · yüksek 0,20 |
| `CEK_KARSILIKSIZ` | düşük 0,04 · orta 0,30 · yüksek 0,70 |
| `CEK_SORGU_BEDEL` | 5.000 |
| `AVAL_PAY` / `AVAL_KARSILAMA` | 0,12 / 0,50 |

## Denge: iki hata, iki düzeltme

**1. Çek zorunlu olmamalı.** İlk sürümde çekçi müşteri sadece çekle alıyordu; çeki istemeyen oyuncu müşteriyi kaybediyordu. Simülasyonda akıllı botun kazanma oranı %62'den **%26'ya** düştü — çek, temkinli oyuncudan müşteri çalıyordu. Çek, nakit satışın üstüne bir seçenek hâline getirildi: almazsan normal fiyattan satarsın, alırsan prim alırsın.

**2. Vade oyunu aşabiliyor.** 30 günlük oyunda 27. gün alınan 9 gün vadeli çek hiç tahsil edilmiyor. Ekranda vade günü yazıyor ve otuzuncu günü aşıyorsa kırmızı uyarı çıkıyor; bot da bunu hesaba katıyor.

**150 oyun sonucu:** akıllı %63, çek sorgulayan %58, kör çekçi %37 (7,17M; sorgulayan 7,67M). Yani çek, sorgulanınca yönetilebilir bir risk; sorgulanmadan alınınca kayıp.
