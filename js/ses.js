// ses.js — sifir dosya, saf Web Audio API ile fiziksel modellemeli ses efektleri.
// Harici ses dosyasi yoktur; tarayici desteklemezse veya Node'da calisirsa sessizce gecer.
// DOM'a dokunmaz. Acik/kapali bilgisi localStorage'da tutulur.
window.G = window.G || {};

G.ses = (function () {
  var ANAHTAR = "galerici_ses_acik";
  var ctx = null;
  var gurultuBuf = null;
  var acik = yukle();

  function yukle() {
    try {
      if (typeof localStorage === "undefined") return true;
      var v = localStorage.getItem(ANAHTAR);
      if (v === "0" || v === "false") return false;
      return true;
    } catch (e) {
      return true;
    }
  }

  function kaydet() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(ANAHTAR, acik ? "1" : "0");
      }
    } catch (e) {}
  }

  function baglam() {
    if (!acik) return null;
    if (ctx) {
      if (ctx.state === "suspended" && typeof ctx.resume === "function") {
        try { ctx.resume(); } catch (e) {}
      }
      return ctx;
    }
    try {
      var Ctor = (typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext);
      if (!Ctor) return null;
      ctx = new Ctor();
      return ctx;
    } catch (e) {
      return null;
    }
  }

  // Tek seferlik 1 saniyelik beyaz gurultu tamponu (her seste yeniden uretilmez)
  function gurultuAl(c) {
    if (gurultuBuf && gurultuBuf.sampleRate === c.sampleRate) return gurultuBuf;
    var ornek = Math.floor(c.sampleRate * 1.0);
    var buf = c.createBuffer(1, ornek, c.sampleRate);
    var veri = buf.getChannelData(0);
    var tohum = 1337;
    for (var i = 0; i < ornek; i++) {
      tohum = (tohum * 16807) % 2147483647;
      veri[i] = (tohum / 1073741824) - 1;
    }
    gurultuBuf = buf;
    return buf;
  }

  // Temel osilator parcasi
  function ton(c, tip, fBas, fBit, sure, hacim, gecikme, atak) {
    var t0 = c.currentTime + (gecikme || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = tip || "sine";
    osc.frequency.setValueAtTime(fBas, t0);
    if (fBit && fBit !== fBas) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, fBit), t0 + sure);
    }
    var a = atak || 0.005;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(hacim || 0.12, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + sure + 0.03);
  }

  // Filtreli gurultu parcasi (kagit, ahsap darbe, mandal, kapi carpmasi icin)
  function darbe(c, filtreTip, fBas, fBit, q, sure, hacim, gecikme, atak) {
    var t0 = c.currentTime + (gecikme || 0);
    var src = c.createBufferSource();
    src.buffer = gurultuAl(c);
    var flt = c.createBiquadFilter();
    flt.type = filtreTip || "bandpass";
    flt.frequency.setValueAtTime(fBas, t0);
    if (fBit && fBit !== fBas) {
      flt.frequency.exponentialRampToValueAtTime(Math.max(40, fBit), t0 + sure);
    }
    if (q) flt.Q.setValueAtTime(q, t0);

    var g = c.createGain();
    var a = atak || 0.003;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(hacim || 0.14, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + sure);

    src.connect(flt);
    flt.connect(g);
    g.connect(c.destination);
    src.start(t0, Math.min(0.5, (t0 * 0.37) % 0.5), sure + 0.03);
    src.stop(t0 + sure + 0.04);
  }

  // ---- Oyun olaylari ----

  // 1. Teklif tiki: mekanik tus / masa tiki (bip degil, dogal tikirti)
  function tikla() {
    var c = baglam(); if (!c) return;
    try {
      darbe(c, "highpass", 2200, 1400, 1.2, 0.018, 0.11, 0, 0.001);
      ton(c, "sine", 420, 160, 0.028, 0.09, 0, 0.002);
    } catch (e) {}
  }

  // 2. Para / Kar: iki hizli banknot sayma hışırtısı + ince kasa/madeni tinlamasi
  function para() {
    var c = baglam(); if (!c) return;
    try {
      // Banknot cirpma (iki hizli kagit tiki)
      darbe(c, "bandpass", 2600, 4200, 2.2, 0.048, 0.13, 0, 0.006);
      darbe(c, "bandpass", 2900, 4600, 2.2, 0.052, 0.15, 0.065, 0.006);
      // Kasa mandali + ince metalik cinlama (harmonik katmanli)
      darbe(c, "highpass", 3600, 2800, 1.0, 0.022, 0.09, 0.13, 0.002);
      ton(c, "sine", 2093, 2093, 0.26, 0.075, 0.13, 0.003);
      ton(c, "sine", 3136, 3136, 0.20, 0.045, 0.135, 0.003);
      ton(c, "sine", 4186, 4186, 0.15, 0.025, 0.14, 0.003);
    } catch (e) {}
  }

  // 3. Zarar / Ceza: agir tok darbe + boguk dusus
  function zarar() {
    var c = baglam(); if (!c) return;
    try {
      darbe(c, "lowpass", 420, 160, 1.4, 0.14, 0.18, 0, 0.004);
      ton(c, "triangle", 155, 82, 0.22, 0.15, 0, 0.008);
      ton(c, "sine", 118, 62, 0.28, 0.14, 0.08, 0.01);
    } catch (e) {}
  }

  // 4. Noter damgasi: ahsap/kaucuk damganin masadaki kagida "TAK" vurusu + kaldirma sesi
  function damga() {
    var c = baglam(); if (!c) return;
    try {
      // Kagit-masa temasi (keskin orta-frekans darbe)
      darbe(c, "bandpass", 1050, 480, 1.1, 0.038, 0.24, 0, 0.001);
      // Masanin tok govde titresimi
      ton(c, "sine", 148, 48, 0.11, 0.24, 0, 0.002);
      darbe(c, "lowpass", 360, 140, 1.0, 0.095, 0.20, 0.003, 0.002);
      // Damga kagittan kalkarken hafif kagit surtunmesi
      darbe(c, "bandpass", 1800, 900, 1.8, 0.032, 0.055, 0.085, 0.008);
    } catch (e) {}
  }

  // 5. Kapi / Masadan kalkti: once metal mandal, sonra tok ahsap/araba kapisi carpmasi + kasa titremesi
  function kapi() {
    var c = baglam(); if (!c) return;
    try {
      // Mandal sesi
      darbe(c, "bandpass", 2800, 1900, 3.0, 0.022, 0.12, 0, 0.001);
      // Ana kapi carpmasi
      ton(c, "sine", 112, 36, 0.19, 0.28, 0.025, 0.002);
      darbe(c, "lowpass", 440, 110, 1.2, 0.17, 0.26, 0.025, 0.002);
      // Kisa cerceve sarsintisi
      darbe(c, "bandpass", 640, 340, 2.0, 0.055, 0.08, 0.075, 0.004);
    } catch (e) {}
  }

  // 6. Ekspertiz: boya olcum cihazi (mikron olcer) cift olcum sinyali + kisa rapor kagidi sesi
  function ekspertiz() {
    var c = baglam(); if (!c) return;
    try {
      // Cihaz temas tiki + mikron olcer bipi
      darbe(c, "highpass", 3000, 2000, 1.0, 0.012, 0.07, 0, 0.001);
      ton(c, "sine", 2480, 2480, 0.052, 0.065, 0.01, 0.003);
      ton(c, "sine", 2960, 2960, 0.068, 0.065, 0.085, 0.003);
      // Rapor fis kagidi cekilme hisirtisi
      darbe(c, "bandpass", 2100, 4200, 1.6, 0.095, 0.09, 0.16, 0.018);
    } catch (e) {}
  }

  // 7. Sabah karti: kalin karton kartin masaya kayarak acilmasi
  function kart() {
    var c = baglam(); if (!c) return;
    try {
      darbe(c, "bandpass", 1300, 3400, 1.5, 0.105, 0.14, 0, 0.022);
      ton(c, "sine", 220, 130, 0.045, 0.05, 0.06, 0.005);
    } catch (e) {}
  }

  function acikMi() { return acik; }

  function ayarla(deger) {
    acik = !!deger;
    kaydet();
    return acik;
  }

  function degistir() {
    return ayarla(!acik);
  }

  return {
    tikla: tikla,
    para: para,
    zarar: zarar,
    damga: damga,
    kapi: kapi,
    ekspertiz: ekspertiz,
    kart: kart,
    acikMi: acikMi,
    ayarla: ayarla,
    degistir: degistir
  };
})();
