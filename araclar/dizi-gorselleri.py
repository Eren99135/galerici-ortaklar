# -*- coding: utf-8 -*-
"""Dizinin gercek karelerinden oyunun gorsellerini uretir.

Kaynak: GALERICI_KARELER ortam degiskeninin gosterdigi klasor (191 kare)
Cikti : kaynak/portre-ham  ve  kaynak/mekan-ham  (sonra gorsel-hazirla.py isler)
"""
import os
import shutil
import sys
from PIL import Image

# 2026-11-20: asagidaki hedefler uretilmis 3D gorsellerle degistirildi. Bu betik
# calisinca ham dosyalarini dizi karesiyle ezmesin diye atlaniyor. Bir gorsel
# 3D tarza gecince adini buraya ekle; eski hali gercekten geri gerekiyorsa
# `python araclar/dizi-gorselleri.py --hepsi` calistir.
YERINE_3D = {
    "nuri-normal", "nuri-sevincli", "nuri-sinirli",
    "drej-normal", "drej-sinirli", "kro-normal", "riza-normal",
    "satici-normal", "musteri-normal", "cuneyt-normal",
    "galeri-onu",
}

HEPSI = "--hepsi" in sys.argv


def atla(ad):
    if HEPSI or ad not in YERINE_3D:
        return False
    print("  atlandi  %-18s (uretilmis 3D gorsel kullaniliyor)" % ad)
    return True

# Dizi kareleri kisiye ozel bir klasorde duruyor, yolu koda gomulu degil:
#   Windows : set GALERICI_KARELER=D:\...\karakterler gercek
#   bash    : export GALERICI_KARELER=/d/.../karakterler\ gercek
KAYNAK = os.environ.get("GALERICI_KARELER", "")
PROJE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORTRE_HAM = os.path.join(PROJE, "kaynak", "portre-ham")
MEKAN_HAM = os.path.join(PROJE, "kaynak", "mekan-ham")

if not KAYNAK or not os.path.isdir(KAYNAK):
    sys.exit("dizi karelerinin klasoru bulunamadi.\n"
             "GALERICI_KARELER ortam degiskenini 191 karenin durdugu klasore ayarla.")

dosyalar = sorted(f for f in os.listdir(KAYNAK) if f.lower().endswith((".png", ".jpg", ".jpeg")))

# (hedef ad, kare no, kutu: sol/ust/sag/alt oran)
KARAKTERLER = [
    ("nuri-normal",       66, (0.48, 0.00, 1.00, 1.00)),
    ("nuri-sevincli",    101, (0.00, 0.00, 0.56, 1.00)),
    ("nuri-sinirli",     108, (0.00, 0.00, 0.56, 1.00)),
    ("drej-normal",       66, (0.00, 0.00, 0.50, 1.00)),
    ("drej-sinirli",      97, (0.42, 0.00, 1.00, 1.00)),
    ("kro-normal",        11, (0.00, 0.00, 1.00, 1.00)),
    ("sukru-normal",     163, (0.00, 0.00, 0.52, 1.00)),
    ("abla-normal",      156, (0.40, 0.00, 1.00, 1.00)),
    ("riza-normal",       46, (0.00, 0.00, 0.58, 1.00)),
    ("satici-normal",    130, (0.55, 0.00, 1.00, 1.00)),
    ("musteri-normal",   100, (0.60, 0.00, 1.00, 1.00)),
    ("teknisyen-normal",  68, (0.00, 0.00, 0.55, 1.00)),
    ("musavir-normal",   176, (0.00, 0.00, 0.50, 1.00)),
    ("noter-normal",      70, (0.00, 0.06, 0.30, 1.00)),
    ("cuneyt-normal",    175, (0.50, 0.00, 1.00, 1.00)),
]

# (hedef ad, kare no) — 16:9 kirpma gorsel-hazirla.py'de yapiliyor
# Not: sanayi-avlu, ekspertiz, noter, buro, gece-sanayi ve ilan-sokak icin dizi karesi
# kullanilmiyor. Bunlar dikey reel kareleri; karakterler kareyi doldurdugu icin
# yuzleri disarida birakan bir kirpma cikmiyor. O bes mekanda onceki temiz
# fotograflar duruyor.
MEKANLAR = [
    # (ad, kare, kutu) — kutu, karedeki buyuk karakterleri disarida birakmak icin
    ("galeri-onu",   113, (0.00, 0.00, 1.00, 1.00)),   # temiz vitrin
    ("yol",            3, (0.00, 0.00, 1.00, 1.00)),   # yolda pickup
    ("galeri-ici",    50, (0.00, 0.00, 1.00, 0.38)),   # ic mekan, ust yari
    ("lokanta",       22, (0.00, 0.52, 1.00, 1.00)),   # sofra, yuzler disarida
    ("kahve",        131, (0.22, 0.45, 0.80, 1.00)),   # cay masasi
    ("ev-sofra",     141, (0.10, 0.48, 0.95, 1.00)),   # ev sofrasi
]


# (hedef ad, kare, kutu) — arabanin kadrajdaki yeri
ARABALAR = [
    ("pickup",     3, (0.02, 0.12, 0.99, 0.97)),
    ("sedan",    126, (0.16, 0.24, 0.97, 0.97)),
    ("hatchback", 39, (0.00, 0.46, 0.60, 0.99)),
]


def kare(no):
    return os.path.join(KAYNAK, dosyalar[no])


def main():
    for klasor in (PORTRE_HAM, MEKAN_HAM):
        if not os.path.isdir(klasor):
            os.makedirs(klasor)

    print("Karakter kareleri kirpiliyor...")
    for ad, no, kutu in KARAKTERLER:
        if atla(ad):
            continue
        im = Image.open(kare(no)).convert("RGB")
        g, y = im.size
        kirpik = im.crop((int(kutu[0] * g), int(kutu[1] * y),
                          int(kutu[2] * g), int(kutu[3] * y)))
        # Kucuk kareler: kesimden once iki kat buyut, maske daha temiz cikiyor
        if kirpik.size[1] < 800:
            oran = 900.0 / kirpik.size[1]
            kirpik = kirpik.resize((int(kirpik.size[0] * oran), 900), Image.LANCZOS)
        hedef = os.path.join(PORTRE_HAM, ad + ".png")
        kirpik.save(hedef, "PNG")
        print("  #%-3d -> %-18s %dx%d" % (no, ad, kirpik.size[0], kirpik.size[1]))

    print("\nAraba kareleri kirpiliyor...")
    araba_ham = os.path.join(PROJE, "kaynak", "araba-ham")
    if not os.path.isdir(araba_ham):
        os.makedirs(araba_ham)
    for ad, no, kutu in ARABALAR:
        if atla(ad):
            continue
        im = Image.open(kare(no)).convert("RGB")
        g, y = im.size
        kirpik = im.crop((int(kutu[0] * g), int(kutu[1] * y),
                          int(kutu[2] * g), int(kutu[3] * y)))
        if kirpik.size[0] < 900:
            oran = 1000.0 / kirpik.size[0]
            kirpik = kirpik.resize((1000, int(kirpik.size[1] * oran)), Image.LANCZOS)
        kirpik.save(os.path.join(araba_ham, ad + ".png"), "PNG")
        print("  #%-3d -> %-12s %dx%d" % (no, ad, kirpik.size[0], kirpik.size[1]))

    print("\nMekan kareleri kopyalaniyor...")
    for ad, no, kutu in MEKANLAR:
        if atla(ad):
            continue
        im = Image.open(kare(no)).convert("RGB")
        g, y = im.size
        kirpik = im.crop((int(kutu[0] * g), int(kutu[1] * y),
                          int(kutu[2] * g), int(kutu[3] * y)))
        hedef = os.path.join(MEKAN_HAM, ad + ".png")
        kirpik.save(hedef, "PNG")
        print("  #%-3d -> %-14s %dx%d" % (no, ad, kirpik.size[0], kirpik.size[1]))


if __name__ == "__main__":
    main()
