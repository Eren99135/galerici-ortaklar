# -*- coding: utf-8 -*-
# ikon-uret.py — PWA ve favicon ikonlarini uretir.
#
# Kullanim:  python araclar/ikon-uret.py
#
# Kaynak: img/araba/tofas-sahin.png (kirmizi Sahin, arka plani zaten temiz).
# Zemin oyunun sari-turuncu tonu, altina yumusak bir golge konuyor.
# Siluet denendi ve birakildi: arabalarin hepsi 3/4 acidan, silueti 48 pikselde
# tanimsiz bir leke gibi duruyordu. Renkli araba sari zeminde daha iyi okunuyor.
#
# Cikti: img/ikon/ikon-{32,192,512}.png + ikon-maskable-512.png
# Betik bir kere calisir, ciktilar depoya girer.

import os
import sys

from PIL import Image, ImageDraw, ImageFilter

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARABA = os.path.join(KOK, "img", "araba", "tofas-sahin.png")
HEDEF = os.path.join(KOK, "img", "ikon")

SARI = (246, 193, 42)        # --sari
TURUNCU = (232, 138, 46)     # --turuncu

TUVAL = 512                  # Sahin 423 px genis; buyutmemek icin tuval 512
BOYLAR = [512, 192, 32]


def zemin():
    """Sariden turuncuya dikey gecis. Duz sari fazla yavan duruyor."""
    kat = Image.new("RGB", (1, TUVAL))
    piksel = kat.load()
    for y in range(TUVAL):
        o = y / float(TUVAL - 1)
        piksel[0, y] = tuple(int(SARI[i] + (TURUNCU[i] - SARI[i]) * o) for i in range(3))
    return kat.resize((TUVAL, TUVAL), Image.BILINEAR).convert("RGBA")


def arabayi_yerlestir(tuval, oran):
    """Arabayi tuvalin `oran` kadarina sigdirir, altina yumusak golge koyar."""
    araba = Image.open(ARABA).convert("RGBA")
    kutu = araba.getchannel("A").point(lambda d: 255 if d > 40 else 0).getbbox()
    if kutu is None:
        sys.exit("araba resminde saydam olmayan alan bulunamadi: " + ARABA)
    araba = araba.crop(kutu)

    en = int(TUVAL * oran)
    boy = max(1, int(araba.height * en / float(araba.width)))
    araba = araba.resize((en, boy), Image.LANCZOS)
    x = (TUVAL - en) // 2
    y = (TUVAL - boy) // 2

    golge = Image.new("RGBA", (TUVAL, TUVAL), (0, 0, 0, 0))
    ImageDraw.Draw(golge).ellipse(
        [x + en * 0.06, y + boy * 0.86, x + en * 0.94, y + boy * 1.10],
        fill=(60, 30, 0, 110))
    tuval.alpha_composite(golge.filter(ImageFilter.GaussianBlur(TUVAL * 0.022)))
    tuval.alpha_composite(araba, (x, y))
    return tuval


def ikon(oran):
    return arabayi_yerlestir(zemin(), oran)


def yaz(resim, ad, boy):
    yol = os.path.join(HEDEF, ad)
    resim.resize((boy, boy), Image.LANCZOS).convert("RGB").save(yol, optimize=True)
    print("  %-24s %d x %d  %5.1f KB" % (ad, boy, boy, os.path.getsize(yol) / 1024.0))


def main():
    if not os.path.exists(ARABA):
        sys.exit("kaynak resim yok: " + ARABA)
    if not os.path.isdir(HEDEF):
        os.makedirs(HEDEF)

    print("ikonlar uretiliyor (kaynak: img/araba/tofas-sahin.png)")
    normal = ikon(0.88)
    for boy in BOYLAR:
        yaz(normal, "ikon-%d.png" % boy, boy)

    # Maskable: Android ikonu daire/kare kirpabiliyor, araba kenarlardan uzak duracak.
    yaz(ikon(0.62), "ikon-maskable-512.png", 512)
    print("bitti")


if __name__ == "__main__":
    main()
