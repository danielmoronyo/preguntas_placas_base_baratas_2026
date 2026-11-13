/* =====================================================================
 *  SOCKET CERO · segundo modo: duelo de fichas
 * ===================================================================== */
(function () {
  const { eur, icon, chip, stat, fmtInt } = SC;
  const DUEL_TIME = 12;

  const S = {
    duel: SC.makeDuel(),
    phase: "ready", // ready | live | reveal | over
    time: DUEL_TIME,
    score: 0,
    streak: 0,
    lives: 3,
    picked: null,
    rounds: 0,
    best: 0,
  };
  let root;
  let raf = 0;
  let timer = 0;
  const play = (v) => SC.sound.play(v);

  const fmt = (v) => (S.duel.attr.format ? S.duel.attr.format(v) : `${v}${S.duel.attr.unit}`);
  const tone = (pct) => (pct > 50 ? "bg-mint" : pct > 25 ? "bg-amber" : "bg-hot");

  function header() {
    return `<div class="panel-head">
      <span class="row gap2"><span class="t-copper">${icon("swords", 15)}</span><span class="panel-kicker">Duelo de fichas</span></span>
      <span class="row gap5">
        ${stat("Puntos", fmtInt(S.score), "mint")}
        ${stat("Racha", `×${S.streak}`, S.streak >= 3 ? "amber" : "solder")}
        ${SC.fuses(S.lives, 15)}
      </span>
    </div>`;
  }

  function sideHtml(side) {
    const d = S.duel;
    const b = side === "a" ? d.a : d.b;
    const reveal = S.phase === "reveal" || S.phase === "over";
    const win = reveal && (d.winner === side || d.winner === "tie");
    const chose = S.picked === side;
    return `<div class="duel-side ${reveal ? (win ? "win" : "lose") : ""} ${side === "b" ? "side-b" : ""}">
      <div class="duel-side-head">
        <div><div class="eyebrow">${b.brand}</div><div class="duel-model">${b.model}</div></div>
        <span class="mono bold t-amber">${eur(b.price)}</span>
      </div>
      <img class="duel-art" src="${SC.boardImg(b)}" alt="Esquema de la ${b.fullName}" draggable="false">
      <div class="duel-val">
        <span class="eyebrow">${d.attr.label}</span>
        <span class="duel-num ${reveal ? (win ? "t-mint" : "t-dim5") : "t-dim25"}">${reveal ? fmt(b[d.attr.key]) : "???"}</span>
      </div>
      <button type="button" class="btn ${chose ? "btn-primary" : "btn-ghost"} btn-sm btn-block mt3" data-pick="${side}" ${S.phase !== "live" ? "disabled" : ""}>
        Gana ${side === "a" ? "izquierda" : "derecha"} <span class="kbd-hint">[${side === "a" ? "←" : "→"}]</span>
      </button>
    </div>`;
  }

  function render() {
    if (S.phase === "ready") {
      root.innerHTML = `<div class="panel ovh">${header()}
        <div class="duel-ready">
          <div>
            <h3 class="duel-title">Dos placas, un dato, <span class="t-amber">doce segundos</span>.</h3>
            <p class="body-txt">Se sortean dos de las cuatro placas y un atributo de su ficha técnica. Decide cuál gana —o si empatan— antes de que la
              soldadura se enfríe. Con la memoria entrenada esto vuela.</p>
            <div class="row gap3 wrap mt4">
              <button type="button" class="btn btn-primary" data-act="start">${icon("trophy", 14)} Empezar duelo</button>
              <span class="mono tiny t-dim4">← izquierda · E empate · derecha →</span>
            </div>
          </div>
          <div class="attr-box">
            <div class="eyebrow mb2">Atributos en juego</div>
            <div class="chips">${["Precio", "RAM máxima", "MHz", "SATA", "PCIe x1", "Generación x16", "M.2", "DIMM", "USB 3.2", "Red"]
              .map((a) => chip(a))
              .join("")}</div>
            <p class="mono tiny t-dim45 mt3">Récord local: <span class="t-amber">${fmtInt(S.best)}</span> pts</p>
          </div>
        </div>
      </div>`;
      return;
    }

    const d = S.duel;
    const pct = (S.time / DUEL_TIME) * 100;
    const reveal = S.phase === "reveal" || (S.phase === "over" && S.picked !== undefined);
    let explain = "";
    if (reveal) {
      const good = S.picked === d.winner;
      const win = d.winner === "a" ? d.a : d.b;
      explain = `<p class="feedback ${good ? "good" : "bad"} anim-print mt4">
        ${fmt(d.a[d.attr.key])} vs ${fmt(d.b[d.attr.key])} ·
        ${
          d.winner === "tie"
            ? "empate técnico, las cuatro placas son del mismo escalón"
            : `gana ${win.model} (${d.attr.dir === "low" ? "mejor precio" : "dato mayor"})`
        }${S.picked === null ? " · tiempo agotado" : ""}
      </p>`;
    }
    const over =
      S.phase === "over"
        ? `<div class="over-box">
            <div><div class="over-title">Sin fusibles</div>
              <p class="mono small t-dim6">${S.rounds} duelos · ${fmtInt(S.score)} pts · récord ${fmtInt(Math.max(S.best, S.score))}</p></div>
            <button type="button" class="btn btn-danger" data-act="start">${icon("trophy", 14)} Revancha <span class="kbd-hint">[espacio]</span></button>
          </div>`
        : "";

    root.innerHTML = `<div class="panel ovh">${header()}
      <div class="pad4">
        <div class="timebar thin mb4"><div class="timebar-fill ${tone(pct)}" data-ref="bar" style="width:${pct}%"></div></div>
        <div class="duel-q">
          <span class="t-copper">${icon("sort", 15)}</span>
          <p>¿Quién gana en <span class="t-amber">${d.attr.label}</span>?</p>
        </div>
        <div class="duel-grid">
          ${sideHtml("a")}
          <div class="duel-mid">
            <button type="button" class="btn ${S.picked === "tie" ? "btn-amber" : "btn-ghost"}" data-pick="tie" ${S.phase !== "live" ? "disabled" : ""}>Empate</button>
            <span class="mono tiny t-dim35">[E] o [↓]</span>
          </div>
          ${sideHtml("b")}
        </div>
        ${explain}
        ${over}
      </div>
    </div>`;
  }

  function paintTime() {
    const bar = root.querySelector('[data-ref="bar"]');
    if (!bar) return;
    const pct = (S.time / DUEL_TIME) * 100;
    bar.style.width = pct + "%";
    bar.className = "timebar-fill " + tone(pct);
  }

  function startClock() {
    cancelAnimationFrame(raf);
    const t0 = performance.now();
    let lastWhole = DUEL_TIME;
    const loop = () => {
      if (S.phase !== "live") return;
      S.time = Math.max(0, DUEL_TIME - (performance.now() - t0) / 1000);
      paintTime();
      const w = Math.ceil(S.time);
      if (w !== lastWhole) {
        lastWhole = w;
        if (w <= 4 && w > 0) play("tick");
      }
      if (S.time <= 0) return answer(null);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function nextDuel() {
    S.duel = SC.makeDuel(S.duel.key);
    S.picked = null;
    S.time = DUEL_TIME;
    S.rounds += 1;
    S.phase = "live";
    render();
    startClock();
  }

  function answer(choice) {
    if (S.phase !== "live") return;
    cancelAnimationFrame(raf);
    const good = choice === S.duel.winner;
    S.picked = choice;
    S.phase = "reveal";

    if (good) {
      S.score += 60 + Math.round(S.time * 9) + S.streak * 12;
      S.streak += 1;
      play("ok");
      render();
      timer = setTimeout(nextDuel, 1900);
      return;
    }

    S.streak = 0;
    S.lives = Math.max(0, S.lives - 1);
    play(S.lives <= 0 ? "over" : "bad");
    render();
    timer = setTimeout(() => {
      if (S.lives <= 0) {
        if (S.score > SC.store.num("sc0.bestDuel")) SC.store.set("sc0.bestDuel", String(S.score));
        S.phase = "over";
        render();
        S.best = Math.max(S.best, S.score);
      } else nextDuel();
    }, 1900);
  }

  function start() {
    clearTimeout(timer);
    Object.assign(S, { score: 0, streak: 0, lives: 3, rounds: 1, time: DUEL_TIME, duel: SC.makeDuel(), picked: null, phase: "live" });
    render();
    play("start");
    startClock();
  }

  function onKey(e) {
    if (SC.activeSection !== "duelo" || SC.isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector(".modal")) return;
    if (S.phase === "ready" || S.phase === "over") {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        start();
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      answer("a");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      answer("b");
    } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "e") {
      e.preventDefault();
      answer("tie");
    } else if (e.code === "Space") e.preventDefault();
  }

  SC.initDuelo = function (el) {
    root = el;
    S.best = SC.store.num("sc0.bestDuel");
    render();
    root.addEventListener("click", (e) => {
      const p = e.target.closest("[data-pick]");
      if (p && !p.disabled) return answer(p.dataset.pick);
      const a = e.target.closest('[data-act="start"]');
      if (a) start();
    });
    window.addEventListener("keydown", onKey);
  };
})();
