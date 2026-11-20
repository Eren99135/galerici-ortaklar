@AGENTS.md

## Claude Code'a özel

- Birden fazla dosyaya dokunan işlerde önce plan modunda plan çıkar, Eren onaylayınca uygula.
- Context penceresini temiz tut: `context/` altındaki dosyaları sadece görev gerektirdiğinde oku. Hangisinin gerektiğine `context/00-HARITA.md` dosyasından bak.
- Oturum bitmeden `/oturum-sonu` komutunu çalıştır (ya da Eren hatırlatırsa aynısını yap): hafıza ve karar dosyaları güncellenir.
- Bir sonraki yol haritası adımına geçmek için `/sonraki-adim` komutu kullanılır.
- Eren dürüst geri bildirim ister. Bir tasarım fikri kötü görünüyorsa ya da denge bozuksa bunu açıkça söyle; sadece onaylama.
