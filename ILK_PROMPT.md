# İlk Prompt

Bu klasörü VS Code'da aç, terminalde `claude` yaz ve aşağıdaki mesajı olduğu gibi yapıştır.

---

```
Merhaba. Bu klasörde "Galerici" adında bir tarayıcı oyunu yapacağız. Kod henüz yok; sadece proje bağlamı hazır.

Önce şunları oku, başka hiçbir şeyi okuma:
1. CLAUDE.md (AGENTS.md'yi de içeri alıyor)
2. context/00-HARITA.md
3. context/hafiza.md
4. context/hedefler.md

Sonra bana şunları yaz:
- Projeyi 5 cümleyle kendi kelimelerinle özetle (ne yapıyoruz, his ne olmalı, teknik kısıtlar).
- Tasarımda gördüğün en riskli 2–3 nokta (belirsiz, çelişkili ya da dengesi bozulabilecek yerler). Dürüst ol; sadece onaylama.
- Adım 1 (İskelet) için kısa bir plan.

Kod yazmaya başlama. Planı onayladıktan sonra başlayacağız.
```

---

## Sonraki oturumlarda
- Bir adıma başlamak için: `/sonraki-adim`
- Oturumu kapatmadan önce: `/oturum-sonu`
- Yeni bir fikir çıktıysa: "Bunu kararlar.md'ye açık karar olarak ekle" de.
- Context dolmaya başlarsa (uzun oturum): `/oturum-sonu` çalıştır, sonra `/clear` ile temizleyip yeni oturumu `/sonraki-adim` ile başlat. Hafıza dosyası sayesinde hiçbir şey kaybolmaz.
