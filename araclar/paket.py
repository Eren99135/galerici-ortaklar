# -*- coding: utf-8 -*-
# paket.py — oynanabilir paketi kurar ve itch.io icin zip uretir.
#
# Kullanim:  python araclar/paket.py
#
# Cikti:
#   yayin/                      oynanabilir dosyalar (sunucuya atilabilir)
#   yayin/galerici-ortaklar.zip itch.io'ya yuklenecek dosya
#
# Zip'in kokunde index.html durur, itch.io'nun istedigi bicim budur.
# yayin/ ve zip .gitignore'da, depoya girmez.
#
# Yayina giren yollar asagidaki YOLLAR listesinde. Oyuna yeni bir klasor eklenirse
# (ornegin ses dosyalari) buraya da eklenmeli, yoksa yayinda eksik cikar.

import os
import shutil
import sys
import zipfile

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKTI = os.path.join(KOK, "yayin")
ZIP_ADI = "galerici-ortaklar.zip"

YOLLAR = ["index.html", "style.css", "manifest.json", "sw.js", "js", "data", "img"]

# Oyunda yuklenmeyen dosyalar: testler yalnizca test.html icin lazim.
ATLA = {"js/test.js"}


def goreli(yol):
    return os.path.relpath(yol, CIKTI).replace("\\", "/")


def kopyala():
    if os.path.isdir(CIKTI):
        shutil.rmtree(CIKTI)
    os.makedirs(CIKTI)

    for ad in YOLLAR:
        kaynak = os.path.join(KOK, ad)
        if not os.path.exists(kaynak):
            sys.exit("eksik yol: " + ad + "  (paket.py YOLLAR listesine bak)")
        hedef = os.path.join(CIKTI, ad)
        if os.path.isdir(kaynak):
            shutil.copytree(kaynak, hedef)
        else:
            shutil.copy2(kaynak, hedef)

    for ad in ATLA:
        yol = os.path.join(CIKTI, ad.replace("/", os.sep))
        if os.path.exists(yol):
            os.remove(yol)


def dosyalar():
    liste = []
    for kok, _klasorler, adlar in os.walk(CIKTI):
        for ad in adlar:
            tam = os.path.join(kok, ad)
            if goreli(tam) != ZIP_ADI:
                liste.append(tam)
    liste.sort()
    return liste


def zip_yap(liste):
    yol = os.path.join(CIKTI, ZIP_ADI)
    with zipfile.ZipFile(yol, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for tam in liste:
            z.write(tam, goreli(tam))
    return yol


def main():
    kopyala()
    liste = dosyalar()
    if not any(goreli(t) == "index.html" for t in liste):
        sys.exit("zip kokunde index.html yok, itch.io kabul etmez")

    yol = zip_yap(liste)
    toplam = sum(os.path.getsize(t) for t in liste)

    print("yayin paketi hazir")
    print("  klasor : yayin/            %d dosya, %.1f MB" % (len(liste), toplam / 1048576.0))
    print("  zip    : yayin/%s  %.1f MB" % (ZIP_ADI, os.path.getsize(yol) / 1048576.0))
    print()
    print("itch.io  : yayin/%s dosyasini yukle, 'browser'da oynanir' isaretle" % ZIP_ADI)
    print("yerel dene: python -m http.server --directory yayin 8000")


if __name__ == "__main__":
    main()
