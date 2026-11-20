# -*- coding: utf-8 -*-
"""
gorsel-hazirla.py — ham gorselleri oyunun istedigi hale getirir.

Kullanim (proje kokunden):
    python araclar/gorsel-hazirla.py            → kaynak/ altindaki her seyi isler
    python araclar/gorsel-hazirla.py --liste    → sadece eksikleri yazar, dosyaya dokunmaz
    python araclar/gorsel-hazirla.py --zorla    → daha once uretilmis dosyalari da yeniden uretir
    python araclar/gorsel-hazirla.py --kirp drej-normal 430,0,780,881
                                                → inatci bir fotografta figurun etrafini elle ver
    python araclar/gorsel-hazirla.py --sadece araba
                                                → sadece araba (ya da karakter/mekan) isler

Ne yapar:
    kaynak/portre-ham/<ad>-<ifade>.*  →  img/karakter/<ad>-<ifade>.png   (arka plan silinir)
    kaynak/araba-ham/<anahtar>.*      →  img/araba/<anahtar>.png         (arka plan silinir)
    kaynak/mekan-ham/<mekan>.*        →  img/mekan/<mekan>.jpg           (16:9 kirpilir, 1600x900)

Arabalarda arka plan silindikten sonra plaka filigrani (HUM3D, 3DSQUIR gibi)
temizlenir: araclar/plaka-kutulari.json icindeki arama kutusunun icinde kalan koyu
harfler bulunup plakanin kendi renginden doldurulur. Listede olmayan fotografa
dokunulmaz.

Cikti olculeri ekranda gorunen boyuta gore sinirlanir (asagidaki iki sabit):
araba sahnede en fazla ~500x240 CSS pikseli, karakter ~346 piksel boyunda
cikiyor. Retina icin iki kati fazlasiyla yetiyor; daha buyugu sadece indirilen
dosyayi sisiriyor. Arabada kucultme plaka temizliginden SONRA yapilir, yoksa
filigran harfleri kucule kucule bulunamaz hale geliyor.

Arka plan silme yerelde yapilir: araclar/u2net.onnx (tam, ~176 MB) varsa o,
yoksa araclar/u2netp.onnx (kucuk, ~4,5 MB).
Figur genis bir karenin icinde kucuk kaliyorsa once figurun etrafi kirpilir,
sonra model ikinci kez calistirilir — yoksa model arka plandaki arabalari da seciyor.

Gereken paketler: pillow, numpy, onnxruntime (hepsi kurulu).
"""
import io
import json
import os
import sys

from PIL import Image, ImageFilter

try:
    import numpy as np
    import onnxruntime
    from scipy import ndimage
except ImportError as hata:                                   # pragma: no cover
    sys.exit("Eksik paket: %s  (pip install pillow numpy onnxruntime scipy)" % hata.name)

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Cikti olcu sinirlari. Sahnede araba en fazla ~500x240, karakter ~346 piksel
# yer kapliyor; bunlar onun iki kati. Buyutursen img/ klasoru ve yayimlanan
# surumun indirme boyutu dogrudan buyur.
ARABA_EN_COK_GENISLIK = 1200
KARAKTER_EN_COK_YUKSEKLIK = 900

# Tam model (u2net, ~176 MB) insan fotograflarinda belirgin olcude daha temiz kesiyor.
# Yoksa kucuk surume (u2netp, ~4,5 MB) duser.
# Karakterler icin insan segmentasyonu modeli, nesneler icin genel model.
# Ikisi de yoksa kucuk surume duser.
MODEL_INSAN = os.path.join(KOK, "araclar", "u2net_human_seg.onnx")
MODEL_TAM = os.path.join(KOK, "araclar", "u2net.onnx")
MODEL_KUCUK = os.path.join(KOK, "araclar", "u2netp.onnx")

KARAKTERLER = ["nuri", "drej", "kro", "riza", "sukru", "abla", "satici",
               "musteri", "noter", "teknisyen", "musavir", "cuneyt", "polis"]
IFADELER = ["normal", "sevincli", "sinirli"]
MEKANLAR = ["galeri-onu", "galeri-ici", "sanayi-avlu", "ilan-sokak", "ekspertiz",
            "noter", "buro", "ev-sofra", "kahve", "gece-sanayi", "yol", "lokanta"]
GOVDELER = ["sedan", "hatchback", "station", "suv", "pickup", "ticari", "klasik"]

RESIM_UZANTILARI = (".png", ".jpg", ".jpeg", ".webp", ".bmp")

_oturumlar = {}


# ----------------------------------------------------------------- arka plan

def model_yolu(insanMi):
    adaylar = ([MODEL_INSAN, MODEL_TAM, MODEL_KUCUK] if insanMi
               else [MODEL_TAM, MODEL_INSAN, MODEL_KUCUK])
    for yol in adaylar:
        if os.path.exists(yol):
            return yol
    sys.exit("Model yok. araclar/ altina u2net_human_seg.onnx, u2net.onnx ya da u2netp.onnx koy.")


def oturum(insanMi=True):
    yol = model_yolu(insanMi)
    if yol not in _oturumlar:
        print("  model: " + os.path.basename(yol))
        _oturumlar[yol] = onnxruntime.InferenceSession(yol, providers=["CPUExecutionProvider"])
    return _oturumlar[yol]


def maske_uret(resim, insanMi=True):
    o = oturum(insanMi)
    giris = o.get_inputs()[0].name
    kucuk = resim.convert("RGB").resize((320, 320), Image.LANCZOS)
    x = np.array(kucuk, dtype=np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], dtype=np.float32)) / \
        np.array([0.229, 0.224, 0.225], dtype=np.float32)
    x = x.transpose(2, 0, 1)[None, ...]

    cikti = o.run(None, {giris: x})[0][0][0]
    cikti = (cikti - cikti.min()) / (cikti.max() - cikti.min() + 1e-8)
    return Image.fromarray((cikti * 255).astype(np.uint8), mode="L").resize(resim.size, Image.LANCZOS)


def kaba_kutu(maske, esik=0.25):
    """Maskedeki EN BUYUK baglantili bolgeyi saran dikdortgen.

    Genis bir fotografta model arka plandaki arabalari da secebiliyor; butun
    guclu piksellerin sinirini almak o yuzden kareyi dolduruyordu. Bagli bolge
    etiketleyip en buyugunu secince figur tek basina kaliyor."""
    d = np.array(maske, dtype=np.float32) / 255.0
    guclu = d > esik
    if not guclu.any():
        return None, None

    etiketli, adet = ndimage.label(guclu)
    if adet == 0:
        return None, None
    boyutlar = ndimage.sum(guclu, etiketli, range(1, adet + 1))
    enBuyuk = int(np.argmax(boyutlar)) + 1
    dilimler = ndimage.find_objects((etiketli == enBuyuk).astype(np.int32))[0]

    kutu = (int(dilimler[1].start), int(dilimler[0].start),
            int(dilimler[1].stop), int(dilimler[0].stop))
    # Sadece en buyuk bolgeyi birak: arka plandaki diger lekeler maskeden silinir
    temiz = np.where(etiketli == enBuyuk, np.array(maske, dtype=np.uint8), 0)
    return kutu, Image.fromarray(temiz.astype(np.uint8), mode="L")


def arka_plani_kaldir(kaynak, hedef, en_cok_yukseklik=1200, esik=18, yumusat=1.2,
                      elleKirp=None, insanMi=True):
    resim = Image.open(kaynak).convert("RGBA")
    if elleKirp:
        resim = resim.crop(elleKirp)             # figur kalabalik bir karedeyse elle sinirla
    maske = maske_uret(resim, insanMi)

    kutu, temiz = kaba_kutu(maske)
    if temiz is not None:
        maske = temiz
    if kutu:
        gen, yuk = kutu[2] - kutu[0], kutu[3] - kutu[1]
        kaplama = (gen * yuk) / float(resim.size[0] * resim.size[1])
        if kaplama < 0.75:                       # figur kareyi doldurmuyorsa once kirp, sonra tekrar bak
            # Dikeyde kirpmiyoruz: ilk gecis cogu zaman sadece govdeyi guclu
            # buluyor, dikey kirpinca bacaklar gidiyor. Sorun yatayda (yandaki
            # arabalar, insanlar), o yuzden sadece x ekseninde sinirliyoruz.
            pay_x = int(gen * 0.18) + 12
            resim = resim.crop((max(0, kutu[0] - pay_x), 0,
                                min(resim.size[0], kutu[2] + pay_x), resim.size[1]))
            maske = maske_uret(resim, insanMi)
            ikinciKutu, ikinciTemiz = kaba_kutu(maske)
            if ikinciTemiz is not None:
                maske = ikinciTemiz

    dizi = np.array(maske, dtype=np.float32)
    dizi = np.clip((dizi - esik) * (255.0 / (255.0 - esik)), 0, 255)
    maske = Image.fromarray(dizi.astype(np.uint8), mode="L").filter(ImageFilter.GaussianBlur(yumusat))

    resim.putalpha(maske)
    sinir = resim.getbbox()
    if sinir:
        resim = resim.crop(sinir)
    if resim.size[1] > en_cok_yukseklik:
        oran = en_cok_yukseklik / float(resim.size[1])
        resim = resim.resize((max(1, int(resim.size[0] * oran)), en_cok_yukseklik), Image.LANCZOS)

    resim.save(hedef, "PNG", optimize=True)
    return resim.size


# ----------------------------------------------------------------- plaka

PLAKA_DOSYA = os.path.join(KOK, "araclar", "plaka-kutulari.json")
_plakaKutulari = None


def plaka_kutulari():
    """araclar/plaka-kutulari.json — <anahtar>: [sol, ust, sag, alt], oransal."""
    global _plakaKutulari
    if _plakaKutulari is None:
        if os.path.exists(PLAKA_DOSYA):
            veri = json.loads(io.open(PLAKA_DOSYA, encoding="utf-8").read())
            _plakaKutulari = veri.get("kutular", veri)
        else:
            _plakaKutulari = {}
    return _plakaKutulari


def plaka_yazisini_sil(yol, anahtar):
    """Plakadaki filigran yazisini siler, dosyanin uzerine yazar. Silinen piksel doner.

    Kutu plakanin tam siniri olmak zorunda degil: icindeki koyu harf lekeleri
    bulunur ve cevresindeki plaka renginden doldurulur, yani plakanin perspektifi,
    golgesi ve parlamasi yerinde kalir."""
    kutu = plaka_kutulari().get(anahtar)
    if not kutu:
        return 0

    resim = Image.open(yol).convert("RGBA")
    W, H = resim.size
    k = (max(0, int(kutu[0] * W)), max(0, int(kutu[1] * H)),
         min(W, int(kutu[2] * W)), min(H, int(kutu[3] * H)))
    if k[2] - k[0] < 8 or k[3] - k[1] < 5:
        return 0

    a = np.array(resim.crop(k)).astype(np.float32)
    gri = a[:, :, :3].mean(2)
    saydam = a[:, :, 3] > 200
    kh, kw = gri.shape
    if not saydam.any():
        return 0

    taban = np.percentile(gri[saydam], 88)          # plakanin acik rengi
    karanlik = (gri < taban - max(38.0, taban * 0.22)) & saydam
    et, adet = ndimage.label(karanlik)
    if adet == 0:
        return 0

    tut = np.zeros_like(karanlik)
    for i, sl in enumerate(ndimage.find_objects(et)):
        if sl is None:
            continue
        y0, y1 = sl[0].start, sl[0].stop
        x0, x1 = sl[1].start, sl[1].stop
        h, g = y1 - y0, x1 - x0
        if h < 2 or g < 1:
            continue
        if not (0.08 * kh <= h <= 0.78 * kh):                 # harf boyu
            continue
        if g < 0.010 * kw:
            continue
        if x0 == 0 or y0 == 0 or x1 >= kw or y1 >= kh:        # kutunun kenarina degiyor: plaka disi
            continue
        # Harfler cogu zaman plakanin koyu cercevesine birlesip tek parca oluyor;
        # kenara degmiyorsa genis parcayi da kabul et.
        if g > 0.42 * kw and not (g <= 0.92 * kw and h <= 0.55 * kh):
            continue
        if (et[y0:y1, x0:x1] == (i + 1)).sum() < 5:
            continue
        tut |= (et == (i + 1))

    if not tut.any():
        return 0

    maske = ndimage.binary_dilation(tut, iterations=2) & saydam
    if maske.all():
        return 0

    _, idx = ndimage.distance_transform_edt(maske, return_distances=True, return_indices=True)
    yeni = a.copy()
    for kanal in range(3):
        kat = yeni[:, :, kanal]
        kat[maske] = kat[idx[0][maske], idx[1][maske]]        # en yakin harf olmayan piksel
        yeni[:, :, kanal] = kat

    duz = Image.fromarray(yeni.astype(np.uint8), "RGBA")
    yum = np.array(duz.filter(ImageFilter.GaussianBlur(1.1))).astype(np.float32)
    birlesik = np.array(duz).astype(np.float32)
    genis = ndimage.binary_dilation(maske, iterations=1)
    for kanal in range(3):
        birlesik[:, :, kanal] = np.where(genis, yum[:, :, kanal], birlesik[:, :, kanal])

    resim.paste(Image.fromarray(birlesik.astype(np.uint8), "RGBA"), (k[0], k[1]))
    resim.save(yol, "PNG", optimize=True)
    return int(maske.sum())


def son_hali_yaz(yol, en_cok_genislik=None, en_cok_yukseklik=None):
    """Dosyayi yerinde olcusune sigdirir ve 256 renkli PNG olarak yazar.

    Boyutun buyuk kismi burada gidiyor: fotografik bir araba renderi tam renkli
    PNG olarak 900 KB, 256 renkli olarak 160 KB. Oyun arabayi ekranda ~500 piksel
    genisliginde gosterdigi icin aradaki fark gorunmuyor; %100 yakinlastirinca
    govdede hafif bir benek olusuyor, sahne olceginde kayboluyor. Kenarlardaki
    yumusak alfa korunuyor (palette 256 girdinin ~90'i ara alfa degerine gidiyor).
    """
    resim = Image.open(yol).convert("RGBA")
    g, y = resim.size
    oran = 1.0
    if en_cok_genislik and g > en_cok_genislik:
        oran = min(oran, en_cok_genislik / float(g))
    if en_cok_yukseklik and y > en_cok_yukseklik:
        oran = min(oran, en_cok_yukseklik / float(y))
    if oran < 1.0:
        resim = resim.resize((max(1, int(round(g * oran))), max(1, int(round(y * oran)))),
                             Image.LANCZOS)
    resim.quantize(colors=256, method=Image.FASTOCTREE).save(yol, optimize=True)
    return resim.size


def arabayi_hazirla(kaynak, hedef):
    """Arka plani siler, plaka filigranini temizler, sonra olcuyu ve renk sayisini sinirlar."""
    arka_plani_kaldir(kaynak, hedef, insanMi=False)
    silinen = plaka_yazisini_sil(hedef, tabanAd(hedef))
    if silinen:
        print("      plaka yazisi silindi (%d piksel)" % silinen)
    # Kucultme ve renk indirgeme en sona: plaka harfleri tam cozunurlukte aranir.
    return son_hali_yaz(hedef, en_cok_genislik=ARABA_EN_COK_GENISLIK,
                        en_cok_yukseklik=ARABA_EN_COK_GENISLIK)


def karakteri_hazirla(kaynak, hedef):
    """Arka plani siler; karakterler arabadan daha kisa bir sinirla yazilir."""
    arka_plani_kaldir(kaynak, hedef, en_cok_yukseklik=KARAKTER_EN_COK_YUKSEKLIK)
    return son_hali_yaz(hedef, en_cok_yukseklik=KARAKTER_EN_COK_YUKSEKLIK)


# ----------------------------------------------------------------- mekan

def mekani_hazirla(kaynak, hedef, genislik=1600, yukseklik=900):
    """16:9 orana kirpar, ortadan hizalar, jpg olarak yazar."""
    resim = Image.open(kaynak).convert("RGB")
    hedef_oran = genislik / float(yukseklik)
    oran = resim.size[0] / float(resim.size[1])

    if oran > hedef_oran:                        # cok genis: yanlardan kirp
        yeni_genislik = int(resim.size[1] * hedef_oran)
        sol = (resim.size[0] - yeni_genislik) // 2
        resim = resim.crop((sol, 0, sol + yeni_genislik, resim.size[1]))
    elif oran < hedef_oran:                      # cok uzun: ustten/alttan kirp (ust tarafa agirlik)
        yeni_yukseklik = int(resim.size[0] / hedef_oran)
        ust = int((resim.size[1] - yeni_yukseklik) * 0.35)
        resim = resim.crop((0, ust, resim.size[0], ust + yeni_yukseklik))

    resim = resim.resize((genislik, yukseklik), Image.LANCZOS)
    resim.save(hedef, "JPEG", quality=88, optimize=True)
    return resim.size


# ----------------------------------------------------------------- tarama

def ham_dosyalar(klasor):
    yol = os.path.join(KOK, klasor)
    if not os.path.isdir(yol):
        return []
    return sorted(
        os.path.join(yol, ad) for ad in os.listdir(yol)
        if ad.lower().endswith(RESIM_UZANTILARI)
    )


def tabanAd(yol):
    return os.path.splitext(os.path.basename(yol))[0].lower()


def klasoru_isle(ham_klasor, hedef_klasor, uzanti, islev, zorla):
    hedef_dizin = os.path.join(KOK, hedef_klasor)
    if not os.path.isdir(hedef_dizin):
        os.makedirs(hedef_dizin)

    islenen, atlanan = [], []
    for kaynak in ham_dosyalar(ham_klasor):
        ad = tabanAd(kaynak)
        hedef = os.path.join(hedef_dizin, ad + uzanti)
        if os.path.exists(hedef) and not zorla:
            atlanan.append(ad)
            continue
        olcu = islev(kaynak, hedef)
        boyut = os.path.getsize(hedef) // 1024
        islenen.append(ad)
        print("  %-28s -> %s/%s%s   %dx%d  %d KB" %
              (os.path.basename(kaynak), hedef_klasor, ad, uzanti, olcu[0], olcu[1], boyut))
    return islenen, atlanan


def var_mi(klasor, ad, uzantilar):
    for u in uzantilar:
        if os.path.exists(os.path.join(KOK, klasor, ad + u)):
            return True
    return False


def eksikleri_yaz():
    print("\n--- EKSIK GORSELLER ---")

    eksik_karakter = []
    for kisi in KARAKTERLER:
        for ifade in IFADELER:
            if not var_mi("img/karakter", "%s-%s" % (kisi, ifade), (".png", ".webp")):
                eksik_karakter.append("%s-%s" % (kisi, ifade))
    temel = [a for a in eksik_karakter if a.endswith("-normal")]
    print("\nKarakter (oncelik: once -normal olanlar)")
    print("  eksik normal : " + (", ".join(temel) if temel else "yok, hepsi tamam"))
    print("  eksik ifade  : %d dosya" % (len(eksik_karakter) - len(temel)))

    eksik_mekan = [m for m in MEKANLAR if not var_mi("img/mekan", m, (".jpg", ".png", ".webp"))]
    print("\nMekan")
    print("  eksik: " + (", ".join(eksik_mekan) if eksik_mekan else "yok, hepsi tamam"))

    eksik_govde = [g for g in GOVDELER if not var_mi("img/araba", g, (".png", ".webp"))]
    print("\nAraba govdesi (bunlar gelince butun arabalar gorunur)")
    print("  eksik: " + (", ".join(eksik_govde) if eksik_govde else "yok, hepsi tamam"))

    print("""
Nereye konacak:
  kaynak/portre-ham/nuri-normal.jpg     (karakter, arka plan silinecek)
  kaynak/mekan-ham/lokanta.jpg          (mekan, 16:9 kirpilacak)
  kaynak/araba-ham/sedan.png            (araba, arka plan silinecek)
Sonra: python araclar/gorsel-hazirla.py
""")


def elleKirpIsle():
    """--kirp <ad> <sol,ust,sag,alt>"""
    i = sys.argv.index("--kirp")
    if len(sys.argv) < i + 3:
        sys.exit("Kullanim: --kirp <dosya-adi> <sol,ust,sag,alt>")
    ad = sys.argv[i + 1].lower()
    try:
        kutu = tuple(int(p) for p in sys.argv[i + 2].split(","))
        if len(kutu) != 4:
            raise ValueError
    except ValueError:
        sys.exit("Kirpma kutusu dort sayi olmali: sol,ust,sag,alt")

    for klasor, hedefKlasor in (("kaynak/portre-ham", "img/karakter"),
                                ("kaynak/araba-ham", "img/araba")):
        for kaynak in ham_dosyalar(klasor):
            if tabanAd(kaynak) != ad:
                continue
            hedef = os.path.join(KOK, hedefKlasor, ad + ".png")
            olcu = arka_plani_kaldir(kaynak, hedef, elleKirp=kutu)
            print("%s -> %s/%s.png   %dx%d" % (os.path.basename(kaynak), hedefKlasor, ad,
                                               olcu[0], olcu[1]))
            return
    sys.exit("Ham dosya bulunamadi: " + ad)


def main():
    if "--kirp" in sys.argv:
        elleKirpIsle()
        return
    zorla = "--zorla" in sys.argv
    if "--liste" in sys.argv:
        eksikleri_yaz()
        return

    sadece = None
    if "--sadece" in sys.argv:
        i = sys.argv.index("--sadece")
        if len(sys.argv) < i + 2 or sys.argv[i + 1] not in ("araba", "karakter", "mekan"):
            sys.exit("Kullanim: --sadece araba | karakter | mekan")
        sadece = sys.argv[i + 1]

    isler = [
        ("karakter", "Karakterler (kaynak/portre-ham -> img/karakter)",
         "kaynak/portre-ham", "img/karakter", ".png", karakteri_hazirla),
        ("araba", "Arabalar (kaynak/araba-ham -> img/araba)",
         "kaynak/araba-ham", "img/araba", ".png", arabayi_hazirla),
        ("mekan", "Mekanlar (kaynak/mekan-ham -> img/mekan)",
         "kaynak/mekan-ham", "img/mekan", ".jpg", mekani_hazirla),
    ]

    print("Ham gorseller isleniyor...")
    for tur, baslik, hamKlasor, hedefKlasor, uzanti, islev in isler:
        if sadece and sadece != tur:
            continue
        print("")
        print(baslik)
        islenen, atlanan = klasoru_isle(hamKlasor, hedefKlasor, uzanti, islev, zorla)
        if not islenen and not atlanan:
            print("  (ham dosya yok)")
        elif atlanan:
            print("  atlandi (zaten var): " + ", ".join(atlanan))

    eksikleri_yaz()


if __name__ == "__main__":
    main()
