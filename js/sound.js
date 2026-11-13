/* =====================================================================
 *  SOCKET CERO · sintetizador lo-fi con Web Audio API
 *  Sin archivos de audio: todo procedural.
 * ===================================================================== */
(function () {
  let ctx = null;
  let muted = SC.store.get("sc0.muted") === "1";
  const listeners = [];

  function ac() {
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function blip(c, freq, at, dur, type, gain) {
    const osc = c.createOscillator();
    const g = c.createGain();
    const t = c.currentTime + at;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function play(voice) {
    if (muted) return;
    const c = ac();
    if (!c) return;
    switch (voice) {
      case "click":
        blip(c, 620, 0, 0.05, "square", 0.05);
        break;
      case "ok":
        blip(c, 660, 0, 0.09, "triangle", 0.09);
        blip(c, 990, 0.07, 0.1, "triangle", 0.08);
        blip(c, 1320, 0.15, 0.16, "sine", 0.07);
        break;
      case "bad":
        blip(c, 220, 0, 0.16, "sawtooth", 0.08);
        blip(c, 140, 0.1, 0.26, "square", 0.07);
        break;
      case "print":
        for (let i = 0; i < 6; i++) blip(c, 1500 + (i % 2) * 320, i * 0.035, 0.03, "square", 0.025);
        break;
      case "coin":
        blip(c, 1046, 0, 0.06, "square", 0.06);
        blip(c, 1568, 0.06, 0.14, "square", 0.05);
        break;
      case "start":
        [392, 523, 659, 784].forEach((f, i) => blip(c, f, i * 0.08, 0.16, "triangle", 0.07));
        break;
      case "over":
        [523, 392, 311, 196].forEach((f, i) => blip(c, f, i * 0.12, 0.3, "sawtooth", 0.06));
        break;
      case "tick":
        blip(c, 1800, 0, 0.025, "square", 0.03);
        break;
    }
  }

  SC.sound = {
    play,
    isMuted: () => muted,
    toggle() {
      muted = !muted;
      SC.store.set("sc0.muted", muted ? "1" : "0");
      listeners.forEach((fn) => fn(muted));
    },
    onChange: (fn) => listeners.push(fn),
  };
})();
