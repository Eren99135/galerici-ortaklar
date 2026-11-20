# -*- coding: utf-8 -*-
# github-gonder.py — acik depoyu (Eren99135/galerici-ortaklar) gunceller.
#
# Kullanim:
#   python araclar/github-gonder.py "commit mesaji"
#   python araclar/github-gonder.py --kuru "mesaj"     # degisecekleri goster, gonderme
#
# Neden boyle: GitHub'daki depo gelistirme deposunun anlik goruntusu. Yerel depoda
# 40+ commit ve kaynak/ altinda 38 MB ham gorsel var, bunlar disari cikmiyor (karar #36).
# Bu betik proje klasorunu .github-depo/ altindaki klona yansitir, commit'ler ve push eder.
# Push edilince GitHub Actions Pages'i kendiliginden yeniler.
#
# .github-depo/ .gitignore'da; yerel depoya girmez.

import os
import shutil
import subprocess
import sys

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KLON = os.path.join(KOK, ".github-depo")
UZAK = "https://github.com/Eren99135/galerici-ortaklar.git"

# Klona kopyalanmayacaklar. Liste karar #36 ile ayni olmali.
DISARIDA = {".git", ".github-depo", "kaynak", "yayin", "__pycache__"}


def disarida_mi(goreli):
    parcalar = goreli.replace("\\", "/").split("/")
    if parcalar[0] in DISARIDA:
        return True
    ad = parcalar[-1]
    return ad.endswith(".onnx") or ad.endswith(".zip")


def git(*args, **kw):
    sonuc = subprocess.run(["git", "-C", KLON] + list(args),
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
    if sonuc.returncode and not kw.get("hatayiYut"):
        sys.exit("git %s basarisiz:\n%s%s" % (" ".join(args), sonuc.stdout, sonuc.stderr))
    return (sonuc.stdout or "") + (sonuc.stderr or "")


def klonu_hazirla():
    if os.path.isdir(os.path.join(KLON, ".git")):
        git("fetch", "origin")
        git("reset", "--hard", "origin/main")
        return
    print("klon yok, indiriliyor: " + UZAK)
    subprocess.run(["git", "clone", UZAK, KLON], check=True)
    git("config", "user.name", "Eren")
    git("config", "user.email", "Eren99135@users.noreply.github.com")


def yansit():
    """Proje klasorunu klona kopyalar, klonda kalan fazlalik dosyalari siler."""
    istenen = set()
    for kok, klasorler, adlar in os.walk(KOK):
        goreli_kok = os.path.relpath(kok, KOK)
        if goreli_kok == ".":
            goreli_kok = ""
        klasorler[:] = [k for k in klasorler if not disarida_mi(os.path.join(goreli_kok, k))]
        for ad in adlar:
            goreli = os.path.join(goreli_kok, ad) if goreli_kok else ad
            if disarida_mi(goreli):
                continue
            istenen.add(goreli.replace("\\", "/"))
            hedef = os.path.join(KLON, goreli)
            klasor = os.path.dirname(hedef)
            if klasor and not os.path.isdir(klasor):
                os.makedirs(klasor)
            shutil.copy2(os.path.join(KOK, goreli), hedef)

    for kok, klasorler, adlar in os.walk(KLON):
        if ".git" in klasorler:
            klasorler.remove(".git")
        for ad in adlar:
            goreli = os.path.relpath(os.path.join(kok, ad), KLON).replace("\\", "/")
            if goreli.split("/")[0] == ".git":
                continue
            if goreli not in istenen:
                os.remove(os.path.join(KLON, goreli))


def main():
    kuru = "--kuru" in sys.argv
    mesaj = " ".join(a for a in sys.argv[1:] if a != "--kuru").strip()
    if not mesaj:
        sys.exit('kullanim: python araclar/github-gonder.py "commit mesaji"')

    klonu_hazirla()
    yansit()
    git("add", "-A")

    degisen = git("status", "--short")
    if not degisen.strip():
        print("degisiklik yok, gonderilecek bir sey bulunamadi")
        return
    print(degisen)

    if kuru:
        print("--kuru: commit ve push yapilmadi")
        return

    git("-c", "core.safecrlf=false", "commit", "-m", mesaj)
    print(git("push", "origin", "main"))
    print("gonderildi. Pages birkac dakika icinde yenilenir:")
    print("  https://eren99135.github.io/galerici-ortaklar/")


if __name__ == "__main__":
    main()
