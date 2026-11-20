# -*- coding: utf-8 -*-
# kapak-uret.py — itch.io kapak gorseli (630x500) ve genis afis (1200x630) uretir.
#
# Kullanim:  python araclar/kapak-uret.py
#
# Kaynak: img/mekan/galeri-onu.jpg. Uzerine oyunun adi ve "Erebe gider, pere gelir."
# yazilir. Renkler style.css ile ayni (--sari, --gece).
# Cikti: tanitim/itch-kapak-630x500.jpg ve itch-afis-1200x630.jpg
#
# Ciktilar oyuna girmez, yalnizca magaza sayfasi ve README icindir; o yuzden img/ altinda
# degil. tanitim/ klasorune yazilir ve acik depoya da gider.

import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARKA = os.path.join(KOK, "img", "mekan", "galeri-onu.jpg")
HEDEF = os.path.join(KOK, "tanitim")

SARI = (246, 193, 42)
BEJ = (239, 230, 214)
GECE = (18, 22, 31)

BASLIK = ["GALERİCİ", "ORTAKLAR"]   # iki satir: kapak kare oldugu icin daha iri duruyor
ALT = "Erebe gider, pere gelir."

OLCULER = [("itch-kapak-630x500.jpg", 630, 500), ("itch-afis-1200x630.jpg", 1200, 630)]


def font(yol, boy):
    try:
        return ImageFont.truetype(yol, boy)
    except OSError:
        return ImageFont.load_default()


def kirp(resim, en, boy):
    """Ortadan, ustten biraz yukari bakacak sekilde kirpar (tabela gorunsun)."""
    oran = max(en / float(resim.width), boy / float(resim.height))
    yeni = resim.resize((int(resim.width * oran) + 1, int(resim.height * oran) + 1), Image.LANCZOS)
    x = (yeni.width - en) // 2
    y = int((yeni.height - boy) * 0.42)
    return yeni.crop((x, y, x + en, y + boy))


def perde(en, boy):
    """Alt tarafa karanlik gecis: yazi her zaman okunsun."""
    kat = Image.new("RGBA", (1, boy), (0, 0, 0, 0))
    piksel = kat.load()
    for y in range(boy):
        o = y / float(boy - 1)
        guc = 0.0 if o < 0.26 else (o - 0.26) / 0.74
        piksel[0, y] = GECE + (int(250 * (guc ** 1.2)),)
    return kat.resize((en, boy), Image.BILINEAR)


def golgeli_yaz(ciz, konum, metin, yazi_font, renk):
    x, y = konum
    ciz.text((x + max(2, yazi_font.size // 22), y + max(2, yazi_font.size // 20)),
             metin, font=yazi_font, fill=(0, 0, 0, 190))
    ciz.text((x, y), metin, font=yazi_font, fill=renk)


def kapak(en, boy):
    resim = kirp(Image.open(ARKA).convert("RGB"), en, boy).convert("RGBA")
    resim.alpha_composite(perde(en, boy))

    kat = Image.new("RGBA", (en, boy), (0, 0, 0, 0))
    ciz = ImageDraw.Draw(kat)

    kenar = int(en * 0.055)
    kullanilabilir = en - 2 * kenar

    # Baslik hep cerceveye sigsin: en uzun satira gore font kuculuyor.
    boyut = int(boy * 0.20)
    while boyut > 10:
        baslik_font = font("C:/Windows/Fonts/ariblk.ttf", boyut)
        enler = [ciz.textbbox((0, 0), s, font=baslik_font)[2] for s in BASLIK]
        if max(enler) <= kullanilabilir:
            break
        boyut -= 2

    alt_font = font("C:/Windows/Fonts/segoeui.ttf", int(boy * 0.055))
    satir_boy = int(boyut * 1.02)
    alt_kutu = ciz.textbbox((0, 0), ALT, font=alt_font)

    alt_y = boy - kenar - (alt_kutu[3] - alt_kutu[1]) - int(boy * 0.035)
    baslik_y = alt_y - len(BASLIK) * satir_boy - int(boy * 0.055)

    for i, satir in enumerate(BASLIK):
        golgeli_yaz(ciz, (kenar, baslik_y + i * satir_boy), satir, baslik_font, SARI)
    golgeli_yaz(ciz, (kenar, alt_y), ALT, alt_font, BEJ)

    resim.alpha_composite(kat)
    return resim.convert("RGB")


def main():
    if not os.path.exists(ARKA):
        sys.exit("arka plan resmi yok: " + ARKA)
    if not os.path.isdir(HEDEF):
        os.makedirs(HEDEF)

    for ad, en, boy in OLCULER:
        yol = os.path.join(HEDEF, ad)
        kapak(en, boy).save(yol, quality=88, optimize=True, progressive=True)
        print("  %-26s %d x %d  %5.1f KB" % (ad, en, boy, os.path.getsize(yol) / 1024.0))
    print("kapaklar tanitim/ altinda")


if __name__ == "__main__":
    main()
