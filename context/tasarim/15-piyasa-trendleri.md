# 15 — Piyasa trendleri (haftalık piyasa haberleri)

4-5 gün süren kısa talep dalgaları. Amaç alım kararına bir sebep daha eklemek: "bugün
hangisi ucuz" sorusunun yanına "önümüzdeki birkaç gün ne gidecek" sorusu girsin.

## Katalog

`data/trendler.js` — altı trend. Her birinde hem kazanan hem kaybeden taraf var:

| id | haber | artan | azalan |
|---|---|---|---|
| `benzin` | benzine zam | hatchback, ucuz segment | suv, pickup |
| `bayram` | bayram öncesi | sedan, station | ticari, pickup |
| `insaat` | inşaat sezonu | ticari, pickup | hatchback, station |
| `faiz` | kredi faizi çıktı | ucuz segment | pahalı segment |
| `okul` | okullar açıldı | sedan, hatchback | pahalı segment |
| `tatil` | tatil sezonu | suv, station | hatchback, pahalı segment |

Hedef iki biçimde yazılır: gövde listesi (`govde`) ya da fiyat segmenti (`segment`:
ucuz / orta / pahali). Segment sınırları `config.SEGMENT_BUTCE` tablosundan okunur,
ayrı sabit yok.

**Her trendin kaybedeni olması şart.** İlk sürümde üç trendin `azalan` kümesi boştu;
o hâliyle trend talebi dağıtmıyor, piyasayı topyekûn şişiriyordu ve akıllı bot 400
oyunda %66'dan %82'ye çıkıyordu. Yeni trend eklerken kaybeden tarafı da yaz.

## Etki

Yalnızca satış tarafına işler:

- `js/musteri.js` → `gelmeOlasiligi` sonucu `TREND_GELME` ile çarpılır
- `js/pazarlik.js` → satış bütçesi `TREND_BUTCE` ile çarpılır (segment marjının ardından)

Alım tarafı kasıtlı olarak dışarıda: ilan üretimi ve satıcının tabanı değişmiyor. İki
sebebi var. Birincisi trend "ucuza al, pahalıya sat" diye çifte avantaja dönüşmesin.
İkincisi ilan üretimindeki RNG çekiliş sırası korunsun.

## RNG

Trend seçimi **ana akıştan çekmez**. `js/trend.js` içinde durum `G.rng.durumAl()` ile
saklanır, `state.tohum ^ trendSayaci` tohumuyla ayrı bir akış kurulur, seçim yapılır,
`G.rng.durumYaz()` ile eski durum geri konur. Böylece aynı tohumda ilanlar trend
öncesiyle birebir aynı kalır. Testle bağlı: "trend secimi ana RNG akisini kaydirmaz".

## Arayüz

- Trend başladığı gün sabah haberlerine haber cümlesi girer.
- Tezgâhta her gün `.trend-serit` görünür: etiket + kaç gün kaldığı.
- `sanayiden.com` ilan bandında etiket görünür, böylece oyuncu hangi ilana gireceğini
  ona göre seçebilir. Aynı bant şehir dışı seferde de kullanıldığı için orada da çıkar.

## Ölçülenler

400 oyunluk simülasyonda:

- Ortalama stokta kalma **2,85 gün**, trend süresi 4-5 gün. Alırken trendde olan
  arabaların **%72'si satarken hâlâ trendde**, %6'sı terse dönüyor. Yani alım anındaki
  bilgi satış anında büyük ölçüde geçerli.
- Trendi gören akıllı bot %69, görmeyen %68. Fark küçük ve bu kasıtlı.
- Botun trend ağırlığı 1,5'e çıkarılınca kazanma oranı **%63'e düşüyor**: trend uğruna
  daha kârlı ilanı feda etmek zarar ettiriyor.

**Tasarım sonucu:** trend bir eşitlik bozucudur. İki ilan benzer kâr vaat ediyorsa
trenddeki tercih edilir; trend, belirgin şekilde daha kârlı bir arabadan vazgeçmek için
yeterli sebep değildir. Arayüzün küçük bir etiketle yetinmesi, büyük bir uyarı
kullanmaması bu yüzden.
