// data/replikler.js — oyun ici replikler (oyuncuya gorunen metin: duzgun Turkce).
// Ton kaynagi: context/kaynaklar/ton-rehberi.md (kaliplar ve tavirlar).
// Dizideki cumleler kopyalanmaz; ayni ruhta kendi repliklerimiz yazilir (kurallar.md).
// Yer tutucular: {fiyat}, {model}, {parca}, {tutar}
window.G = window.G || {};
G.data = G.data || {};

G.data.replikler = {

  // Faz 3 — satici personalarinin agzi. js/pazarlik.js saticiReplik() once buraya bakar,
  // burada o durum yoksa asagidaki satici[tip] havuzuna duser. Personalar: js/config.js
  // PERSONALAR, hangi modeli kim satiyor: data/modeller.js persona alani.
  saticiPersona: {

    // Agzi kalabalik, kusuru kucultur, rakip alici uydurur, egosu yuksek.
    piyasaci: {
      acilis: [
        "Hoş geldin abi, otur. {fiyat} diyorum, sorma gerisini.",
        "Bu {model} piyasada uçar abi. {fiyat}, bakan da çok.",
        "Sabah iki kişi aradı bunu. {fiyat} diyorum, acele etme.",
        "Ben bu işin içinde doğdum abi. {fiyat} dedim, doğru pere.",
        "{fiyat}. Konuşuruz tabii, ama bu erebe o pereyi hak ediyor."
      ],
      karsiTeklif: [
        "Olmaz öyle abi, olmaz. {fiyat} diyorum, bak dürüst konuşuyorum.",
        "Sen rakam biliyorsun ama piyasayı bilmiyorsun. {fiyat}.",
        "{fiyat} diyorum, karşı galeride bunun dengini bulamazsın.",
        "Bak {fiyat}. Ben sana baştan söyledim, pazarlık payı az.",
        "Dur dur, hesap öyle olmaz. {fiyat}, bu rakam gerçek."
      ],
      ortasi: [
        "Ortası {fiyat} abi, bak ben de adamım, sen de.",
        "{fiyat} diyorum, ikimiz de kazanalım. Lafı burada kesiyoruz.",
        "Gel {fiyat}, elini sıkayım da herkes duysun.",
        "Ortadan kesiyorum abi: {fiyat}. Ben hep böyle bitiririm işi.",
        "{fiyat}. Ne sen yan ne ben, gerisi boş laf."
      ],
      koz: [
        "Lokal o abi, lokal. Elini sür, belli bile değil.",
        "Sen ona bakma, her erebede var. Büyütülecek iş değil.",
        "Abi ben bunu kusur saymam, bunun adı bakım.",
        "Tamam var. Var da ne olacak, şasesi yerinde duruyor.",
        "Onu ekspertiz yazar, piyasa yazmaz. Fiyatta karşılığı yok abi."
      ],
      hakaret: [
        "Abi sen benimle oyun mu oynuyorsun, anlamadım.",
        "O pere bu erebenin lastiğine gider ancak.",
        "Yirmi yıldır bu sitedeyim, böyle rakam ilk duyuyorum.",
        "Kardeşim insaf, ben bu erebeye o pereyi veremem.",
        "Gülüyorum abi, kusura bakma. Bir daha düşün."
      ],
      agirHakaret: [
        "Sen kiminle konuştuğunu bilmiyorsun. Kalkıyorum abi.",
        "Bu laf bana ağır geldi. Kapatıyoruz bu işi.",
        "Yeter. Ben adamımı tanırım, sen müşteri değilsin.",
        "Kalk abi kalk. Bu erebe sana satılmaz.",
        "Yirmi yıllık adamı sazan belledin. Hadi hayırlısı."
      ],
      kabul: [
        "Helal olsun, {fiyat}. Elini sıkıyorum, hayırlı olsun.",
        "Oldu abi, {fiyat}. Bir çay içelim, sonra noter.",
        "{fiyat}. Gördün mü, iyi pazarlık yaptın abi.",
        "Tamam, {fiyat} olsun. Bu rakamı kimseye söylemeyeceksin.",
        "{fiyat}'e verdim, gönlüm razı. Güle güle kullan."
      ],
      kalkis: [
        "Olmadı abi, olmadı. Ben bunu yarın satarım zaten.",
        "Kalkalım. Senin pere benim erebeye yetmiyor.",
        "Boşa konuştuk abi, hayırlı olsun. Selam söyle.",
        "Ben müşteriye muhtaç değilim kardeşim. Hadi kolay gelsin.",
        "Bu iş burada bitti. Akşama bunun hastası gelir."
      ],
      kalkCagirdi: [
        "Dur abi dur, nereye? Otur, bir çay içelim.",
        "Otur otur, kızdın mı sen? Son bir rakam var.",
        "Gel abi gel, kapıdan çevirdim seni. Konuşalım.",
        "Durma öyle, otur. Senin yüzünü kırmayacağım, geç otur.",
        "Hop abi, acele etme. Sana özel bir rakam söyleyeceğim."
      ],
      kalkBitti: [
        "Git abi git. Bunun müşterisi kapıda bekliyor zaten.",
        "Yolun açık olsun. Ben bunu bekletmem, kapanır.",
        "Buyur. Zorla pazarlık olmaz, benden söylemesi.",
        "Hadi hayırlısı. Sen de bir ucuzunu bulursun belki.",
        "Peki. Akşam ararsan ben yine buradayım abi."
      ],
      geriDonus: [
        "Abi geldim işte, dün çok konuştum. Oturalım bir.",
        "Dünkü rakamın duruyor mu? Ben biraz düşündüm.",
        "Beni de inat tuttu abi, kusura bakma. Konuşalım.",
        "Sabah uyandım, aklımda sen vardın. Gel bitirelim.",
        "Karşı galeri de geldi ama ben sana satarım."
      ]
    },

    // Kisa, mesafeli, resmi. Pazarligi kucumser, ilan fiyatinda durur.
    elit: {
      acilis: [
        "Araç ilanda yazdığı gibidir. Fiyat {fiyat}, pazarlık düşünmüyorum.",
        "Buyurun bakın. {fiyat}, ilan fiyatıdır.",
        "{model} servis bakımlı. {fiyat} diyorum, rakam nettir.",
        "Merhaba. İsteyen {fiyat} verir, acelem yok.",
        "Fiyatı {fiyat}. Aracı görmeden konuşmayalım lütfen."
      ],
      karsiTeklif: [
        "{fiyat} diyebilirim. Daha aşağısı beni ilgilendirmiyor.",
        "Son olarak {fiyat}. Pazarlık sevmem, kusura bakmayın.",
        "{fiyat}. Bu rakamın altında satmam, zamanınızı almayayım.",
        "Peki, {fiyat} olsun. Burada bitiyor.",
        "{fiyat}'den aşağı inmem. Aracın karşılığı bu."
      ],
      ortasi: [
        "{fiyat} diyelim, konu kapansın.",
        "Ortası {fiyat}. Kabul ederseniz bugün noterde işlem yaparız.",
        "{fiyat} uygundur. Daha fazla pazarlık yapmayacağım.",
        "Son rakam {fiyat}. Düşünün, acele etmeyin.",
        "{fiyat}. Bu benim de size jestim olsun."
      ],
      koz: [
        "Hepsi serviste kayıtlıdır, dosyada duruyor. Fiyatım değişmez.",
        "Biliyorum. İlanda da yazıyor, saklamadım.",
        "Doğru tespit. Fiyatı etkilemiyor ama.",
        "Aracın yaşına göre normaldir. Rakam aynı kalıyor.",
        "O konuyu ekspertiz raporu açıkça yazmış. Devam edelim."
      ],
      hakaret: [
        "Böyle bir rakamı ciddiye alamam, kusura bakmayın.",
        "Yanlış ilana bakmışsınız galiba.",
        "Bu teklif aracın karşılığı değil. Konuyu kapatalım.",
        "Pazarlık yapıyoruz, pazar kurmuyoruz beyefendi.",
        "Hayır. Bu rakam konuşulmaz bile."
      ],
      agirHakaret: [
        "Bu kadar. İyi günler dilerim.",
        "Sizinle konuşmayı burada bitiriyorum.",
        "Aracım satılık, ama size değil. İyi akşamlar.",
        "Vaktimi boşa harcadınız. Buyurun.",
        "Teklifinizi duymadım sayıyorum. Kapıyı gösteriyorum, kusura bakmayın."
      ],
      kabul: [
        "{fiyat}. Noterde buluşuruz, evraklar hazır.",
        "Anlaştık. Ödeme banka üzerinden olacak.",
        "{fiyat} olsun. Hayırlı olsun, iyi günlerde kullanın.",
        "Tamam. Yarın sabah on, noterde.",
        "Elinizi sıkıyorum. {fiyat}, gerisi usulünce."
      ],
      kalkis: [
        "Olmadı. İyi günler.",
        "Ben satmıyorum, böyle olmuyor. Kolay gelsin.",
        "Aracı bekletirim, acelem yok. İyi akşamlar.",
        "Bu fiyata satmam. Konu kapandı.",
        "Buraya kadar. Teşekkür ederim, görüşürüz."
      ],
      kalkCagirdi: [
        "Bir saniye. Son bir rakam söyleyeceğim.",
        "Durun lütfen. Yeniden düşündüm.",
        "Beyefendi, dönün. Bir konu konuşacağım.",
        "Gitmeyin. Belki ortak bir rakam vardır.",
        "Oturun lütfen. Bu işi bugün bitirelim."
      ],
      kalkBitti: [
        "İyi günler dilerim.",
        "Buyurun. Kolay gelsin.",
        "Peki, görüşürüz.",
        "Anladım. İyi akşamlar.",
        "Teşekkür ederim, yolunuz açık olsun."
      ],
      geriDonus: [
        "Tekrar merhaba. Dünkü teklifiniz geçerli mi?",
        "Düşündüm. Bugün konuşabiliriz.",
        "Rahatsız ettim. Aracı hâlâ istiyorsanız oturalım.",
        "Dün acele ettim. Bugün daha sakin konuşalım.",
        "Rakamı bir daha değerlendirdim. Vaktiniz var mı?"
      ]
    },

    // Kuralci, belgeci, temkinli. Evrak ve bakim kaydi konusur, acele etmez.
    memur: {
      acilis: [
        "Bütün bakımları faturalı. {fiyat} istiyorum, ona göre.",
        "Her on binde yağını yaptırdım. Fiyat {fiyat}.",
        "Ruhsat, dosya, fatura hepsi burada. {fiyat} diyorum.",
        "{model} tek elden, hasar kaydı yok. {fiyat}.",
        "Acelem yok kardeşim. {fiyat}, evraklara bakabilirsiniz."
      ],
      karsiTeklif: [
        "{fiyat} olur. Bakım dosyasını incelerseniz anlarsınız.",
        "Kardeşim {fiyat} diyorum, hesabımı yaptım.",
        "{fiyat}. Ben bu arabaya iki yılda masraf bindirdim.",
        "Düşündüm, {fiyat}. Daha aşağısı bana göre değil.",
        "{fiyat} yazıyorum deftere. Siz de bir düşünün."
      ],
      ortasi: [
        "Ortası {fiyat}. Ben böyle hesapladım, uygunsa bitirelim.",
        "{fiyat} diyelim. Kâğıt üstünde ikimize de uyar.",
        "Hesabını yaptım: {fiyat}. Üstüne bir şey eklemem.",
        "{fiyat}. Acele etmeyin, düşünün, sonra cevap verin.",
        "Tam ortası {fiyat}. Bence doğru rakam bu."
      ],
      koz: [
        "Onu baştan söyledim, faturası da dosyada duruyor.",
        "Doğru. Yetkili servis yaptı, kaydı var.",
        "Gizlemedim kardeşim. Raporu ben de okudum.",
        "Var, evet. Ama usulünce yapılmış, belgesi burada.",
        "Onun karşılığını fiyattan düştüm zaten. Hesabı net."
      ],
      hakaret: [
        "Kardeşim bu rakam olmaz. Ben hesabımı biliyorum.",
        "Böyle teklif görmedim. Bir daha düşünün lütfen.",
        "Olmaz. Bu arabanın masrafı bile o kadar.",
        "Üzüldüm kardeşim, ciddi bulmadım bu teklifi.",
        "O fiyat benim aldığım fiyatın altında kalıyor."
      ],
      agirHakaret: [
        "Bu teklif ayıp oldu kardeşim, açık söylüyorum.",
        "Ben burada ciddi iş konuşuyorum. Böyle olmaz.",
        "Rakamı duydum, hiç hoş olmadı. Kalkalım isterseniz.",
        "Beni kandıracak adam gibi mi gördünüz?",
        "Bu rakam insafsız. Dosyayı kapatıyorum kardeşim."
      ],
      kabul: [
        "{fiyat}. Noterde işlem yapalım, evrakları getiriyorum.",
        "Anlaştık kardeşim, {fiyat}. Ödemeyi banka üzerinden alırım.",
        "Olur, {fiyat}. Dosyayı da size teslim ederim.",
        "{fiyat} olsun. Hayırlı olsun, iyi günlerde kullanın.",
        "Tamam. {fiyat}, sigortasını devretmeyi unutmayın."
      ],
      kalkis: [
        "Olmadı kardeşim. Ben bu rakamı bekleyebilirim.",
        "Anlaşamadık. Dosyayı toplayıp gidiyorum, kolay gelsin.",
        "Peki, hayırlı olsun. Başka müşteri de bakar.",
        "Bu fiyata vermem. Kusura bakmayın, iyi günler.",
        "Araba dursun, acelem yok. Selametle kardeşim."
      ],
      kalkCagirdi: [
        "Bir dakika kardeşim, dönün. Yeniden hesapladım.",
        "Durun, kalemle bir bakayım. Belki oluruz.",
        "Gitmeyin, oturun. Bir rakam daha söyleyeceğim.",
        "Kardeşim acele etmeyin. Üstüne düşündüm, konuşalım.",
        "Dönün lütfen. Yol da gelmişsiniz, boşa olmasın."
      ],
      kalkBitti: [
        "Kolay gelsin kardeşim. Hayırlı işler.",
        "Peki. Düşünürseniz numaram ilanda yazıyor.",
        "Yolunuz açık olsun. Ben dosyayı kaldırıyorum.",
        "İyi günler. Zorla iş olmaz.",
        "Olmadı demek. Selametle."
      ],
      geriDonus: [
        "Kardeşim, dünü bir daha hesapladım. Konuşalım mı?",
        "Rakamınızı not etmiştim. Hâlâ geçerli mi?",
        "Acele karar verdim dün. Bugün oturup bakalım.",
        "Eşim de uygun buldu. Dünkü fiyatta anlaşalım.",
        "Dosyayı yine getirdim. Teklifinizi tekrar dinlerim."
      ]
    },

    // Hesabini bilen, vakit kaybetmeyen. Rakam konusur, lafi uzatmaz.
    esnaf: {
      acilis: [
        "{fiyat}. Rakamı söyledim abi, vakit kaybetmeyelim.",
        "İşim var, kısa keselim. {fiyat}, bugün bitsin.",
        "Bu {model} bana ekmek verdi. {fiyat} istiyorum.",
        "{fiyat} diyorum. Beğendiysen konuşuruz, beğenmediysen kolay gelsin.",
        "Araba kapıda, {fiyat}. Bin, gez, gel."
      ],
      karsiTeklif: [
        "{fiyat}. Rakam bu, sen de rakam söyle.",
        "Olmaz abi. {fiyat} dedim, hesabım tutuyor.",
        "{fiyat}'e veriyorum. Lafı uzatmayalım, akşama işim var.",
        "Ortaya {fiyat} koyuyorum. Düşün, iki dakika bekliyorum.",
        "{fiyat}. Beş kuruş aşağısı benim zararım."
      ],
      ortasi: [
        "Ortası {fiyat}. Elini uzat, bitsin bu iş.",
        "{fiyat}. Ne sen yan ne ben, bugün kapatıyoruz.",
        "Böl ortadan, {fiyat}. Kalkmadan el sıkışalım.",
        "{fiyat} diyorum, son. Noteri bugüne alıyorum.",
        "Hadi {fiyat}, ikimiz de kazandık sayalım."
      ],
      koz: [
        "Biliyorum, çalışan araba abi. Fiyatına yansıttım.",
        "Yük taşıdı, yorulmuş. O yüzden bu rakam.",
        "Doğru. Masrafını sen yap, ben pereden düşerim.",
        "Abi onu söylemiştim. Fiyatta karşılığı var.",
        "Sayma tek tek, rakam konuş. Hesap orada."
      ],
      hakaret: [
        "Olmadı abi. Ciddi rakam söyle, konuşalım.",
        "Bu fiyata hurda alınır, araba alınmaz.",
        "Vaktim dar, oyun oynamıyoruz. Doğru rakam söyle.",
        "Abi o pere benim bu yılki lastik masrafım.",
        "Yok. Bir daha hesapla, sonra gel."
      ],
      agirHakaret: [
        "Abi şaka mı bu? Kalk, işime bakayım.",
        "Bu rakam adamın yüzüne söylenmez. Hadi eyvallah.",
        "Benim vaktim pere, sen onu çaldın. Kapatalım.",
        "Ekmeğimi küçük gördün. Konuşmayalım artık.",
        "Yok abi, bu kadarına gülerim. Hoşça kal."
      ],
      kabul: [
        "{fiyat}, oldu. Noteri arıyorum, bugün hallederiz.",
        "Elini sıkıyorum abi. {fiyat}, hayırlı olsun.",
        "Tamam {fiyat}. Ruhsatı alıp notere geçiyoruz.",
        "{fiyat}'e verdim. Bereketli olsun, iyi kazançlar.",
        "Oldu abi. {fiyat}, iki saatte işi bitirelim."
      ],
      kalkis: [
        "Olmadı. Kolay gelsin abi, işim var.",
        "Vakit kaybı oldu. Ben dükkâna döneyim.",
        "Bu pereye vermem. Hadi eyvallah.",
        "Anlaşamadık abi. Arabayı yine çalıştırırım.",
        "Kapattım bu konuyu. Selametle."
      ],
      kalkCagirdi: [
        "Dur abi, otur. Bir rakam daha var.",
        "Kalkma, kalkma. Bugün bitirmek istiyorum.",
        "Gel buraya, son rakamı söyleyeyim. Çabuk olsun.",
        "Abi dur, elini boş çevirmeyeyim. Oturalım.",
        "Hop, nereye? Bir şey söyleyeceğim, iki kelime."
      ],
      kalkBitti: [
        "Kolay gelsin abi. Benim işim başımda.",
        "Git hadi, ben de dükkânı açayım.",
        "Eyvallah. Rakam değişirse ararsın.",
        "Peki abi. Vakit ikimizin de parası.",
        "Hayırlı olsun. Ben müşterimi bulurum."
      ],
      geriDonus: [
        "Abi geldim. Dünkü rakamını bugün konuşalım.",
        "Hesabı akşam yaptım, senin rakam fena değil.",
        "Bugün bitirelim şu işi. Oturalım abi.",
        "Dün kalktın, ben pişman oldum. Söyle rakamı.",
        "Vakit kaybetmeyelim. Dünkü yerden devam edelim."
      ]
    },

    // Ilk arabasi, piyasayi bilmez, duygusal. Hikaye anlatir, kolay kirilir.
    caylak: {
      acilis: [
        "İlk arabam bu, {fiyat} dedim. Doğru mu bilmiyorum.",
        "Babam yardım etmişti alırken. {fiyat} yazdım ilana.",
        "{model}'i çok sevdim ama okul bitti. {fiyat}.",
        "{fiyat} dedim abi. Komşum çok dedi, siz bakın.",
        "Hiç pazarlık bilmem. {fiyat} diyorum, kusura bakma."
      ],
      karsiTeklif: [
        "{fiyat} olsa olur mu? Babama öyle söyleyeceğim.",
        "Bilmiyorum abi... {fiyat} diyelim mi?",
        "{fiyat} desem olur mu, ben de zorlanıyorum.",
        "Arkadaşım {fiyat} altına verme dedi. Ona göre.",
        "{fiyat}. Daha aşağısını söylerseniz üzülürüm abi."
      ],
      ortasi: [
        "Ortası {fiyat} mı? Öyle olsun, kabul.",
        "{fiyat} diyelim, ben uzatmayı sevmiyorum.",
        "Siz bilirsiniz ama {fiyat} bana doğru geldi.",
        "Tamam, {fiyat}. Ortasında buluşalım, gönlüm razı.",
        "{fiyat} olsun abi. Elimi sıkar mısınız?"
      ],
      koz: [
        "Haklısınız, onu ben bilmiyordum. Kusura bakmayın.",
        "Kardeşime vermiştim bir ara, o zaman olmuş.",
        "Gerçekten mi? Bana boyasız diye satmışlardı.",
        "Söylemeyi unuttum abi, yalan söylemek istemedim.",
        "Ufak bir şey sanmıştım. Ne kadar düşer?"
      ],
      hakaret: [
        "O kadar mı abi? Ben çok üzüldüm.",
        "Bu araba bana ondan pahalıya geldi, inanın.",
        "Olmaz ki. Ben zarara girerim o zaman.",
        "Babam duysa bana kızar. Olmaz abi.",
        "Hiç beklemiyordum bunu, moralim bozuldu."
      ],
      agirHakaret: [
        "Abi bu çok ayıp. Arabamı küçük gördünüz.",
        "Ben size güvendim, siz böyle konuştunuz.",
        "Gözüm gibi baktım bu arabaya. Yazık bana.",
        "Kalbim kırıldı abi. Satmasam daha iyi.",
        "Alay mı ediyorsunuz? Ağlayacağım neredeyse."
      ],
      kabul: [
        "{fiyat}. Oldu abi, hayırlı olsun. Elim titriyor.",
        "Tamam, {fiyat}. İlk satışım, heyecanlandım.",
        "{fiyat} olsun. Lütfen güzel bakın ona.",
        "Anlaştık. {fiyat}, noteri siz halledin, ben bilmiyorum.",
        "{fiyat}'e verdim abi. Ara sıra haber verirsiniz."
      ],
      kalkis: [
        "Olmadı abi. Ben biraz daha bekleyeyim.",
        "Vazgeçtim, satmasam daha iyi galiba.",
        "Kusura bakmayın, benim gönlüm razı olmadı.",
        "Babama bir danışayım, sonra ararım. Hayırlı olsun.",
        "Ben kalkıyorum abi. Kafam karıştı."
      ],
      kalkCagirdi: [
        "Abi dur, gitmeyin. Ne diyeceğimi şaşırdım.",
        "Bir dakika, lütfen. Belki anlaşırız.",
        "Durun, kızmayın. Ben yeniyim bu işte.",
        "Gitme abi. Dediğin rakama bakayım bir daha.",
        "Dur, dur. Yolu boşa gelmiş olmayın."
      ],
      kalkBitti: [
        "Tamam abi. Yine beklerim.",
        "Peki... Hayırlı olsun size.",
        "Üzüldüm ama olsun. İyi günler.",
        "Gidiyorsunuz demek. Ben yine ilana koyarım.",
        "Sağ olun yine de. Güle güle."
      ],
      geriDonus: [
        "Abi ben geldim. Dün yanlış konuştum, kusura bakmayın.",
        "Düşündüm, haklısınız biraz. Oturalım mı?",
        "Arkadaşlara sordum, sizin rakam iyiymiş. Satalım.",
        "Dün kalktınız ya, bütün gece düşündüm abi.",
        "Bana hâlâ o fiyatı verir misiniz?"
      ]
    },

    // Sabirli, lafi uzatir, araci isine gore anlatir: yuk tasir, yolu kaldirir.
    cifci: {
      acilis: [
        "Bu araba tarlaya da gitti, şehre de. {fiyat}.",
        "{fiyat} diyorum hacı abi. Acelem yok, otur konuşalım.",
        "Dört kış bu {model} ile yol açtım. {fiyat}.",
        "Yükü taşır, çamurdan çıkar. {fiyat} istiyorum, az bile.",
        "Oğlan traktör aldı, buna ihtiyaç kalmadı. {fiyat}."
      ],
      karsiTeklif: [
        "{fiyat} desem? Ben pazarlığa kızmam, konuşuruz.",
        "Dur hele, acele etme. {fiyat} diyorum hacı abi.",
        "Bu arazi görmüş ama hiç ağlatmadı. {fiyat}.",
        "{fiyat}. Sen de bir çay iç, düşün.",
        "Benim rakam {fiyat}. Yarın da aynı rakam."
      ],
      ortasi: [
        "Ortası {fiyat} olsun. Ne sen küs, ne ben.",
        "{fiyat} diyelim hacı abi. Bereket ikimize de yeter.",
        "Böl ortadan, {fiyat}. Elimi uzatıyorum, al.",
        "{fiyat}. Helal olsun, ortadan anlaştık diyelim.",
        "Ortası {fiyat}. Acele yok, düşün, çayını içeriz."
      ],
      koz: [
        "Çamurda çalıştı kardeşim, altı yenik olur elbet.",
        "Onu söyledim ya. Köy yolu affetmez, biliyorsun.",
        "Tarlaya giden araba cam gibi kalmaz hacı abi.",
        "Doğru, var. Ama motoru hiç ses etmedi.",
        "O izi römork yaptı. Yükü vardı, saklamadım."
      ],
      hakaret: [
        "Yok hacı abi, o pere bu arabaya olmaz.",
        "Bu araba bana yıllarca ekmek taşıdı, insaf.",
        "Acele ettin kardeşim. Bir daha düşün, otur.",
        "O rakama römork alınır, araba alınmaz.",
        "Gülümsedim ama kabul etmedim. Yukarı çık biraz."
      ],
      agirHakaret: [
        "Bu laf ağır oldu kardeşim. Emeğimi küçümsedin.",
        "Hacı abi, böyle rakam helal değil. Kalkayım.",
        "Ben sabırlı adamım ama bu teklif kırdı.",
        "Böyle konuşan adama araba satılmaz, kusura bakma.",
        "Yazık. Bu arabanın hakkını vermedin."
      ],
      kabul: [
        "{fiyat}. Helal olsun, hayırlı kazanç dilerim.",
        "Oldu hacı abi, {fiyat}. Bereketli olsun yolun.",
        "Elimi sıktın, {fiyat}. Söz senettir bizde.",
        "{fiyat} olsun. Yükü de taşır, güvenle kullan.",
        "Tamam kardeşim. {fiyat}, notere beraber gideriz."
      ],
      kalkis: [
        "Olmadı hacı abi. Araba kapımda dursun, acelem yok.",
        "Ben bekleyebilirim kardeşim. Kısmet başkasınaymış.",
        "Kalkalım. Hayra karşı, selametle.",
        "Bu pereye vermem. Köye döneyim ben.",
        "Anlaşamadık. Çayına sağ ol, yolun açık olsun."
      ],
      kalkCagirdi: [
        "Dur hele kardeşim, nereye? Otur bir.",
        "Hacı abi dur, çayını içmedin. Konuşalım biraz.",
        "Acele etme, gel otur. Bir rakam söyleyeceğim.",
        "Dur dur, bu yolu boşa gelmeyeceksin.",
        "Gelsene buraya. Senin dediğine yakın rakam var."
      ],
      kalkBitti: [
        "Yolun açık olsun kardeşim. Hayra karşı.",
        "Git hacı abi. Araba yerinde durur, ben beklerim.",
        "Kısmet değilmiş. Selametle.",
        "Peki. Fikrin değişirse köyden gelirim.",
        "Sağ ol, boşa yorulduk. Güle güle."
      ],
      geriDonus: [
        "Hacı abi, dün düşündüm. Bugün konuşalım mı?",
        "Köyde akşam hesapladım, senin rakam fena değil.",
        "Geldim yine. Acelem yok ama satmak isterim.",
        "Dünkü dediğin duruyor mu kardeşim?",
        "Hanım da satalım dedi. Oturalım hacı abi."
      ]
    }
  },

  satici: {
    durust: {
      agirHakaret: [
        "Bu teklif ayıp oldu abi. Arabayı küçümsedin.",
        "Böyle bir rakam duymadım. Hakaret gibi geldi.",
        "Ben seninle ciddi konuşuyorum, sen dalga geçiyorsun.",
        "Kusura bakma ama bu laf ağır kaçtı.",
        "Arabayı sevmediysen söyle, ucuzlatmaya çalışma."
      ],
      acilis: [
        "Arabayı gördün abi. {fiyat} diyorum, içinde hava yok.",
        "Bak kardeşim, neyi var neyi yok anlattım. Fiyat {fiyat}.",
        "Bu {model} benim gözüm gibi baktığım erebe. {fiyat}.",
        "Ne varsa söyledim abi, sürpriz çıkmaz. {fiyat} son."
      ,
        "Ben pazarlık bilmem abi, {fiyat} dedimse {fiyat}."
      ],
      karsiTeklif: [
        "O olmaz abi. {fiyat} diyorum, bak bu doğru pere.",
        "Biraz daha gelirsen anlaşırız. {fiyat}.",
        "Kardeşim ben bunu yoldan bulmadım. {fiyat}.",
        "Elimi uzattım, {fiyat} desem olur mu?"
      ,
        "Ortada bir yerde buluşalım abi: {fiyat}."
      ],
      hakaret: [
        "Abi sen benimle şaka mı yapıyorsun?",
        "O pereye bu erebe gitmez, kusura bakma.",
        "Bu teklifi duymadım sayıyorum.",
        "Kardeşim böyle bir rakam olur mu, insaf."
      ,
        "Yazık, boşuna yol gelmişsin."
      ],
      koz: [
        "Abi onu baştan söyledim, fiyata kattım zaten.",
        "Söyledim sana, saklamadım. O yüzden bu pere.",
        "Doğru, var. Gizlemedim ki abi.",
        "Onu konuştuk abi, baştan konuştuk."
      ,
        "Onu zaten fiyattan düştüm abi, bir daha düşemem."
      ],
      ortasi: [
        "Ortası {fiyat}. Ne sen yan ne ben.",
        "{fiyat} diyelim, elini sık gidelim.",
        "Bölüşelim abi, {fiyat}. Hayırlı olsun.",
        "Ortadan {fiyat}, bitsin bu iş."
      ,
        "Ne senin dediğin ne benim: {fiyat}."
      ],
      kabul: [
        "Hayırlı olsun abi. Noterde buluşuruz.",
        "Oldu. Güvenli ödeme, hepsi usulünce.",
        "Elini sıkıyorum. Güzel erebe aldın.",
        "Tamam kardeşim, yolun açık olsun."
      ,
        "Anahtarı uzatıyorum abi, kazasız belasız."
      ],
      kalkis: [
        "Sağ ol abi, bu iş olmayacak.",
        "Hayırlı olsun, başkasına bakın.",
        "Kusura bakma, ben bu pereye vermem.",
        "Kalkalım o zaman, hayra karşı."
      ,
        "Olmadı işte. Gönlünüzce bir erebe bulun."
      ],
      kalkCagirdi: [
        "Dur abi, otur. Bir daha konuşalım.",
        "Otur abi otur, yol boşa gitmesin.",
        "Bir dakika, acele etme. Son bir rakam söyleyeceğim."
      ,
        "Abi dur, kapıya kadar gitme. Konuşalım.",
        "Gitme abi, bir çay içelim, anlaşırız."
      ],
      kalkBitti: [
        "Yolun açık olsun abi, zorla iş olmaz.",
        "Peki, kısmet değilmiş.",
        "Buyur git abi, ben müşterimi beklerim."
      ,
        "Güle güle abi, kısmet değilmiş.",
        "Bu kadar abi. Selam söyle."
      ],
      geriDonus: [
        "Abi dünkü teklifin hâlâ geçerli mi?",
        "Düşündüm, senin dediğin perede konuşabiliriz.",
        "Dün kalktın ama bugün bir daha bakalım."
      ,
        "Dün gittin ya abi, düşündüm. Gel konuşalım.",
        "Arabayı hâlâ istiyorsan ben buradayım abi."
      ]
    },

    abartici: {
      agirHakaret: [
        "Sen bu arabaya bakmadın bile. O rakam nedir?",
        "Hakaret etme abi, bu erebe öyle araba değil.",
        "Böyle teklifi duyan güler, ben gülmüyorum.",
        "O parayı verene ben hurdasını veririm.",
        "Bu laftan sonra fiyatı yukarı yazarım haberin olsun."
      ],
      acilis: [
        "Boyasız, değişensiz, tramersiz. {fiyat}, hastası çok.",
        "Bu temizlikte {model} bulamazsın abi. {fiyat}.",
        "Sıfır gibi erebe. {fiyat} diyorum, az bile.",
        "Karşı galeri de soruyordu bunu. {fiyat}."
      ,
        "Bu erebe bir tane abi, bir tane. {fiyat}, bakan çok."
      ],
      karsiTeklif: [
        "Olmaz abi, böyle erebe gitmez. {fiyat}.",
        "Sen bir daha bak şu temizliğe. {fiyat}.",
        "Piyasada bunun dengi yok. {fiyat} diyorum.",
        "{fiyat} son, bak ben kendim kullandım."
      ,
        "Sen biraz daha gel, ben sana {fiyat} diyeyim."
      ],
      hakaret: [
        "Abi sen hurdacı mısın, galerici mi?",
        "O pereyle Clio alınmaz, bu {model} abi.",
        "Sen beni sazan mı belledin?",
        "Hadi hayırlı olsun, böyle teklif olmaz."
      ,
        "Yok artık abi, bu erebeye yazık."
      ],
      koz: [
        "Lokal o abi, lokal. Boya sayılmaz.",
        "Ufak sürtme, hepsinde var bu.",
        "Fabrikasyon o abi, çift kat atmışlar.",
        "Önemli değil ki, şasesi yerinde."
      ,
        "Abi o dediğin her arabada var, büyütme."
      ],
      ortasi: [
        "Ortası {fiyat}. Daha aşağı inmem abi.",
        "{fiyat} diyelim, bitsin.",
        "Gel {fiyat}'te el sıkışalım.",
        "Ortadan kesiyorum: {fiyat}."
      ,
        "{fiyat} olsun abi, ben zarar ediyorum ama olsun."
      ],
      kabul: [
        "Güzel erebe aldın abi, güle güle kullan.",
        "Oldu. Noteri bugün yapalım.",
        "Hayırlı olsun, zararlı çıkmadın.",
        "Al götür abi, ben de müşterimi buldum."
      ,
        "Hayırlı olsun, böyle erebeyi bir daha bulamazsın."
      ],
      kalkis: [
        "Yok abi, bu iş olmaz. Başkası alır.",
        "Kalk o zaman, bunun hastası gelir.",
        "Ben bu erebeyi yakmam, sağ ol.",
        "Vazgeçtim, konuşmayalım."
      ,
        "Ben bunu yarın bu pereye satarım abi, merak etme."
      ],
      kalkCagirdi: [
        "Otur abi otur, kızmaya ne var.",
        "Dur, kalkma. Senin için bir daha bakayım.",
        "Gel abi gel, boş yere kalkma."
      ,
        "Dur dur abi, kızma. Sana özel bir rakam söyleyeceğim.",
        "Gel otur abi, müşteri çok ama senin yüzünü kırmayayım."
      ],
      kalkBitti: [
        "Git abi, bunun hastası çoktur.",
        "Yolun açık olsun, ben bunu bekletmem.",
        "Buyur, zorla pazarlık olmaz."
      ,
        "Git abi git, akıllı adam bunu kapar zaten.",
        "Kısmet. Bu erebe başkasına nasip olacak."
      ],
      geriDonus: [
        "Abi dün kalktın ama bir daha konuşalım.",
        "Senin teklif duruyor mu hâlâ?",
        "Düşündüm, biraz esneyebilirim."
      ,
        "Dün gittin, bugün aklıma sen geldin abi. Konuşalım mı?",
        "Sana bir iyilik yapayım dedim abi, gel."
      ]
    },

    dolandirici: {
      agirHakaret: [
        "Bana bak, kiminle konuştuğunu bilmiyorsun galiba.",
        "Bu teklif hakaret. Burada işimiz bitti.",
        "Kalk git abi, seninle alışveriş olmaz.",
        "O rakamı bir daha söyleme, sinirlendim.",
        "Adamı enayi yerine koyma, kapı orada."
      ],
      acilis: [
        "Erebe kusursuz abi, {fiyat}. Acelem var, bugün bitsin.",
        "Boyasız değişensiz, kâğıdı tertemiz. {fiyat}.",
        "{fiyat} diyorum abi, piyasanın altında biliyorum. Pereye sıkıştım.",
        "Bu fiyata kaçırmazsın. {fiyat}, bugün noter."
      ,
        "Acelem var abi, {fiyat} diyorum. Kapora bile yeter."
      ],
      karsiTeklif: [
        "{fiyat} abi, altına inmem. Zaten ucuz veriyorum.",
        "Bu pere ucuz abi, bir daha bak. {fiyat}.",
        "{fiyat}. Başkası kapar yoksa.",
        "İndirecek yer yok abi, {fiyat}."
      ,
        "{fiyat} olsun abi, yeter ki bugün bitsin."
      ],
      hakaret: [
        "Abi boşuna konuşuyoruz o zaman.",
        "Bu fiyata kimse vermez, sen de bilirsin.",
        "Ciddi değilsin galiba.",
        "Hadi hayırlısı, başkası alır."
      ,
        "Abi vaktimi alma, işim var."
      ],
      koz: [
        "Ben bilmem abi, araba bana böyle geldi.",
        "Onu ben yapmadım, bana da böyle sattılar.",
        "Kâğıtta yok abi, kâğıda bak.",
        "Olabilir, ben fark etmedim. Fiyat aynı."
      ,
        "Rapor mu kâğıt mı? Boş ver abi, araba sağlam.",
        "Kâğıtta öyle görünüyordur, araba iyi abi."
      ],
      ortasi: [
        "Ortası {fiyat}, bitirelim abi.",
        "{fiyat} olsun, acelem var.",
        "Gel {fiyat}, imzayı atalım."
      ,
        "Ortası {fiyat}, imzayı atalım bitsin.",
        "{fiyat}. Kâğıt işini sonra hallederiz abi."
      ],
      kabul: [
        "Hayırlı olsun abi. Kâğıtları ben getiririm.",
        "Oldu, bugün bitirelim. Acelem var.",
        "Güzel, ben notere gidiyorum."
      ,
        "Tamam abi, kaporayı yolla, gerisini hallederim.",
        "Oldu. Noteri boş ver, ben bakarım."
      ],
      kalkis: [
        "Peki abi, başkasına veririm.",
        "Vakit kaybı oldu, sağ ol.",
        "Boşuna konuştuk, hayırlı olsun."
      ,
        "Kalkıyor musun? Zararın abi.",
        "Git abi, bunu kapan çok."
      ],
      kalkCagirdi: [
        "Dur abi, pere lazım bana. Konuşalım.",
        "Otur, otur. Bugün satmam lazım.",
        "Kalkma abi, bir rakam daha söyleyeyim."
      ,
        "Dur abi dur, sana başka bir rakam var.",
        "Gitme, sana özel yaparım."
      ],
      kalkBitti: [
        "Git abi, bunu bu pereye alan çok.",
        "Hayırlısı, başkası bakacak zaten.",
        "Peki, kısmet değil."
      ,
        "Yolun açık olsun abi.",
        "Boş yere konuşmuşuz."
      ],
      geriDonus: [
        "Abi hâlâ ister misin? Pere lazım bana.",
        "Dünkü konuşmayı bitirelim mi?",
        "Senin rakam duruyor mu?"
      ,
        "Hâlâ duruyor abi, bugün sana veririm.",
        "Dün olmadı, bugün olsun abi."
      ]
    }
  },

  musteri: {
    pazarlikci: {
      acilis: [
        "Abi {fiyat} veririm, peşin.",
        "Bende {fiyat} var, fazlası yok.",
        "{fiyat} desem, bugün notere gideriz.",
        "İlanlarda daha ucuzu var abi. {fiyat}."
      ,
        "Dolaşıyorum, bakıyorum abi. {fiyat} versem ne dersin?"
      ],
      karsiTeklif: [
        "Biraz daha kırarsan {fiyat}'e çıkarım.",
        "{fiyat} son sözüm abi.",
        "Zorlarsam {fiyat} olur, daha fazlası yok.",
        "{fiyat}, lastik masrafı da bende."
      ,
        "{fiyat}'den bir kuruş yukarı çıkmam abi."
      ],
      kazik: [
        "Abi kazık bu, kusura bakma.",
        "O pereyle sıfır alınır.",
        "Yok abi, o fiyata bakmam bile.",
        "Bu rakamı duymadım sayıyorum."
      ,
        "Abi bu fiyata sıfır alınır, insaf."
      ],
      kabul: [
        "Tamam abi, hayırlı olsun. Noteri konuşalım.",
        "Oldu, elini sıkıyorum.",
        "Anlaştık. Güvenli ödeme yapalım.",
        "Peki abi, alayım."
      ,
        "Anlaştık abi. Elini sıkayım."
      ],
      kalkis: [
        "Ben bir düşüneyim abi.",
        "Bir karşıya bakıp geleceğim.",
        "Olmadı abi, kolay gelsin.",
        "Eşime bir soralım, dönerim."
      ,
        "Başka yere bakarım, sağ ol abi."
      ]
    },
    aceleci: {
      acilis: [
        "Abi bugün almam lazım. {fiyat} veriyorum.",
        "İşim var, uzatmayalım. {fiyat}.",
        "{fiyat}, bugün noter bugün plaka.",
        "Çok bakmaya vaktim yok. {fiyat}?"
      ,
        "Bugün alacağım abi, uzatmayalım. {fiyat}?"
      ],
      karsiTeklif: [
        "{fiyat} olsun, bitsin bu iş.",
        "Son {fiyat} abi, yoksa gidiyorum.",
        "{fiyat} diyorum, kalkmak istemiyorum.",
        "Tamam {fiyat}, imza atalım."
      ,
        "{fiyat} diyorum abi, şimdi ödeyip gideyim."
      ],
      kazik: [
        "O pere fazla abi, kalkıyorum.",
        "Bu rakama olmaz, benim işim var.",
        "Yok abi, bu kadar beklemedim."
      ,
        "Acelem var ama enayi değilim abi.",
        "Bu rakam olmaz abi, işim gücüm var."
      ],
      kabul: [
        "Oldu abi, hemen bitirelim.",
        "Tamam, kâğıtları hazırla.",
        "Anlaştık, hayırlı olsun."
      ,
        "Tamam abi, parayı hemen yatırıyorum.",
        "Oldu, anahtarı ver. İşim var."
      ],
      kalkis: [
        "Ben başka yere bakıyorum abi.",
        "Vaktim yok, kusura bakma.",
        "Olmadı, kolay gelsin."
      ,
        "Boşa vakit kaybettik abi.",
        "Ben başkasına bakarım, acelem var."
      ]
    },
    titiz: {
      acilis: [
        "Ekspertizi okudum abi. {fiyat} veririm.",
        "Rapora göre {fiyat} eder bu.",
        "Her satırı inceledim. {fiyat}.",
        "{fiyat} diyorum, gerekçesi raporda."
      ,
        "Raporu okudum abi. Bence {fiyat} eder."
      ],
      karsiTeklif: [
        "{fiyat}'e çıkarım, bir kuruş fazla vermem.",
        "Rapordaki kalemleri düşünce {fiyat} oluyor.",
        "{fiyat} abi, hesabı önümde.",
        "Son {fiyat}. Fazlasının hesapta yeri yok."
      ,
        "Hesapladım abi: {fiyat}. Fazlası bana göre değil."
      ],
      kazik: [
        "Abi bu fiyat raporla uyuşmuyor.",
        "Bu rakam piyasanın üzerinde, almam.",
        "Böyle bir fiyat olmaz, hesaba sığmıyor."
      ,
        "Rakamlar tutmuyor abi, ben böyle alamam.",
        "Bu fiyat raporla çakışıyor abi."
      ],
      kabul: [
        "Tamam abi, rapor temiz, alıyorum.",
        "Anlaştık. Noterde görüşürüz.",
        "Oldu, doğru iş yaptın."
      ,
        "Rakam dürüst, alıyorum abi.",
        "Kâğıt tamam, rakam tamam. Anlaştık."
      ],
      kalkis: [
        "Ben bir düşünüp dönerim abi.",
        "Bir araç daha göreceğim.",
        "Şimdilik olmadı, teşekkür ederim."
      ,
        "Teşekkürler abi, ben bir düşüneyim.",
        "Bugünlük bu kadar, kusura bakma."
      ]
    }
  },

  // Tipe gore liste yoksa buraya dusulur
  musteriGenel: {
    // Faz 2: itibar dusukken musteri kapidan govensiz giriyor (js/pazarlik.js, acilisDurum).
    // {fiyat} acilis teklifi.
    guvensizAcilis: [
      "Senin hakkında bir şeyler duydum abi. {fiyat}.",
      "Önce bir baktıralım, sonra konuşuruz. {fiyat}.",
      "Buranın adı kötü çıkmış. {fiyat}, fazlası yok.",
      "Açıkçası çekinerek geldim. {fiyat} veririm.",
      "Söyleneni duydum, yine de geldim. {fiyat}.",
      "İş temizse {fiyat}, değilse hiç başlamayalım."
    ],
    durustTesekkur: [
      "Söylediğin için teşekkür ederim abi.",
      "Açık konuştun, ona güvendim.",
      "Saklamadın, o bile bir şey.",
      "Böylesi az kaldı abi, sağ ol."
    ,
      "Doğruyu söyleyen esnaf kalmış demek, sağ ol abi."
    ],
    yakalandi: [
      "Abi raporda {parca} çıktı, sen söylemedin.",
      "{parca} varmış. Ben böyle iş yapmam, kolay gelsin.",
      "Söylemediğin şeyi rapor söyledi abi. Hayırlı olsun.",
      "Bunu bana baştan deseydin konuşurduk. Kalkıyorum."
    ,
      "{parca} meselesini neden sakladın abi?"
    ],
    bilinmeyenKusur: [
      "Raporda {parca} çıkmış abi, haberin var mıydı?",
      "{parca} görünüyor raporda. Fiyat bunu görmeli.",
      "Burada {parca} yazıyor. Hesap değişti abi."
    ,
      "Rapor {parca} diyor abi, senin de haberin yokmuş.",
      "{parca} çıktı. İkimiz de şaşırdık abi."
    ]
  },

  nuri: {
    pazarlikGiris: [
      "Ben konuşurum ortak, sen hesabı tut.",
      "Bu erebeyi ben alırım, merak etme.",
      "Yeğen bir çay ver, abiyle konuşuyoruz.",
      "Sen bak, bu iş ağızla olur."
    ,
      "Bırak ortak, bu adam benden kaçamaz."
    ],
    kabul: [
      "Gelsin pereler gelsin!",
      "Gördün mü ortak, oldu bu iş.",
      "Dedim sana, bu erebe bize yakışır."
    ,
      "Erebe geldi ortak, deftere yaz!",
      "Ben demiştim, bu iş bizde biter."
    ],
    kalkis: [
      "Olmadı ortak, kalkalım.",
      "Zorla iş olmaz, başka erebe çok.",
      "Bırakalım, hayra karşı."
    ,
      "Kalk ortak, bu adamla olmaz.",
      "Masadan kalkmak da pazarlıktır ortak."
    ],
    agiz: [
      "Sen bana bir iyilik yap, ben sana iki abi.",
      "Hacı abi, elini boş çevirmem. Sen de beni boş çevirme.",
      "Bu erebeyi senden alırsam senin reklamını yaparım abi, müşterin de olur.",
      "Bak sana bir şey diyeyim: bugün bitsin, ikimiz de rahat edelim.",
      "Abi ben ağzımla iş yaparım, pazarlıkla değil. Gel şu rakamı bir yuvarlayalım."
    ],
    sinirlendi: [
      "Yeter! Ben bu masada oturmam.",
      "Kapat şunu, kalkıyorum. Bugün kimse bana bir şey söylemesin.",
      "Olmaz böyle! Ben gidiyorum, siz konuşun.",
      "Bu ne demek şimdi? Kalk Drej, gidiyoruz."
    ,
      "Tamam, bitti. Ben dışarı çıkıyorum."
    ]
  },

  drej: {
    pazarlikGiris: [
      "Önce ekspertiz ortak, sonra konuşuruz.",
      "Ben konuşurum ama hesapla konuşurum.",
      "Kâğıda bakmadan el sıkmayalım.",
      "Acele yok. Önce rakamı görelim."
    ,
      "Rakam neyse onu konuşalım ortak, hikâye dinlemeyelim."
    ],
    kusurToplami: [
      "Bu kusurlar deftere {tutar} yazıyor ortak.",
      "Hesapladım: içinde {tutar} zarar var.",
      "{tutar} eksi var bu erebede, ona göre konuş."
    ,
      "Kalemle topladım ortak: {tutar}.",
      "Bu erebenin görünmeyen faturası {tutar}."
    ],
    kabul: [
      "Fiyat tuttu ortak. Deftere yazdım.",
      "Oldu. Noteri usulünce yapalım.",
      "İdare eder. Masraf da var, unutma."
    ,
      "Yazdım ortak. Umarım bu sefer kârlı çıkarız.",
      "Tamam da masraflar da bizde kalmasın ortak."
    ],
    kalkis: [
      "İyi oldu ortak, o pere fazlaydı.",
      "Kalkmak da bir karardır.",
      "Boşa pere vermedik, bu da kâr."
    ,
      "İyi ki kalktık ortak, defter rahatladı.",
      "Her erebe alınmaz ortak."
    ],
    uyari: [
      "Tanıdık ekspertiz olmaz ortak, bizim ekspertize gidelim.",
      "O raporu o yazdırır, ona göre yazar. Bizimkine gidelim.",
      "Satıcının ekspertizi satıcının raporunu verir ortak."
    ,
      "Bu rapor bana bir şey anlatmıyor ortak.",
      "Kendi ekspertizimize gidelim, para değil akıl meselesi."
    ],
    hesap: [
      "Hesaba göre taban {alt} ile {ust} arası ortak.",
      "Bu adam {alt} ile {ust} arasında bir yerde kırar. Daha aşağısı hayal.",
      "Kalemi oynattım: {alt}–{ust}. Ortasını bulursan iş tamam.",
      "Benim defterim {alt} ile {ust} diyor ortak."
    ,
      "Kâğıda döktüm ortak: {alt}-{ust}. Gerisi şans."
    ],
    tuhaflik: [
      "Bu ilanda bir tuhaflık var ortak. Fiyat niye bu kadar ucuz?",
      "Kuro'nun bulduğu bu erebede bir iş var. Ekspertizi iyisinden yaptır.",
      "Ortak, bu rakam normal değil. Ucuzun bir derdi vardır."
    ,
      "Ortak, ucuz erebenin pahalı bir hikâyesi olur.",
      "Bu fiyat bana bir şey saklandığını söylüyor ortak."
    ]
  },

  kro: {
    sabahIlani: [
      "Dayı bu ilana bir bak, efso. Ama hemen aramamız lazım.",
      "Dayı ben buldum bunu, kimse görmeden kapalım.",
      "Dayı bak ne buldum. Fiyatına bakınca ben bile şaşırdım.",
      "Dayı bu ilan sabahtan beri duruyor, tuhaf."
    ,
      "Dayı bu ilan bomba, story'ye bile koyarım."
    ],
    satisGiris: [
      "Dayı ben konuşurum, müşteriyle iyi anlaşırım.",
      "Dayı bende bir şey var, insanlar bana güveniyor.",
      "Ben her şeyi açık söylerim dayı, öyle daha kolay satılıyor."
    ,
      "Dayı ben konuşayım, gençler beni anlıyor.",
      "Dayı müşteriyle aram iyidir, bırak beni."
    ],
    durustluk: [
      "Abi bak, arabanın şusu şusu var. Ben saklamam, sonra bana laf gelir.",
      "Abi raporu önüne koyuyorum, ne varsa orada. Sonra üzülmeyelim.",
      "Abi bunu söylemem lazım: şurada şu var. Fiyatı ona göre konuşalım."
    ,
      "Abi doğrusunu söyleyeyim: şuradaki kusur duruyor.",
      "Abi bakın, saklı bir şey yok. Hepsi raporda."
    ]
  },

  gunNotu: {
    fazlaVerdik: "Fazla verdik ortak.",
    zarar: "Eksideyiz ortak.",
    sakin: "Bugün sanayide sinek bile uçmuyor."
  },

  kapanis: "Erebe gider, pere gelir!"
};
