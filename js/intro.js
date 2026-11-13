/* =====================================================================
 *  SOCKET CERO · portada
 * ===================================================================== */
(function () {
  const { BOARDS, eur, icon, chip, esc } = SC;

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function ticketHtml(t) {
    return `<div class="paper anim-print">
      <div class="paper-head">
        <span class="paper-name">${esc(t.client.name)}</span>
        <span class="mono tiny">muestra #${String(t.id).padStart(3, "0")}</span>
      </div>
      <p class="paper-role">${esc(t.client.role)} · ${esc(t.client.mood)}</p>
      <ul class="paper-reqs">${t.reqs.map((r) => `<li><span class="arrow">›</span><span>${esc(r.client)}</span></li>`).join("")}</ul>
      <div class="paper-foot">${
        t.answer ? '<span class="ink-ok">solución única en la bancada</span>' : '<span class="ink-ko">ninguna placa vale · rechazar</span>'
      }</div>
    </div>`;
  }

  SC.initIntro = function (root) {
    const cheapest = BOARDS.reduce((a, b) => (b.price < a.price ? b : a));
    const dearest = BOARDS.reduce((a, b) => (b.price > a.price ? b : a));

    root.innerHTML = `<div class="intro-grid">
      <div>
        <div class="chips anim-rise" style="animation-delay:40ms">
          ${chip(`${icon("radio", 11)} turno abierto 24 h`, "mint")}
          ${chip("4 placas · PcComponentes", "copper")}
          ${chip("Categoría: Placas base · orden ↑ precio")}
        </div>

        <h1 class="hero-title anim-rise">
          <span class="t-solder">Socket</span>
          <span class="stroke-copper">cero</span>
          <span class="t-mint">el taller de las baratas</span>
        </h1>

        <p class="hero-lede anim-rise" style="animation-delay:100ms">
          Cuatro placas base son las más baratas ahora mismo del catálogo de PcComponentes: de la
          <span class="mono t-amber">${cheapest.model}</span> a ${eur(cheapest.price)} hasta la
          <span class="mono t-amber">${dearest.model}</span> a ${eur(dearest.price)}. Todas Micro ATX, todas sin WiFi, todas con una
          sola ranura M.2. Tu trabajo: colocar la correcta en cada pedido antes de que se agote el soldador.
        </p>

        <div class="hero-actions anim-rise" style="animation-delay:160ms">
          <button type="button" class="btn btn-primary btn-lg" data-go="taller">${icon("arrowRight", 16)} Entrar al taller</button>
          <button type="button" class="btn btn-ghost btn-lg" data-go="duelo">${icon("gauge", 16)} Duelo de fichas</button>
        </div>

        <dl class="hero-stats anim-rise">
          ${[
            ["board", "placas en bancada", "4"],
            ["cpu", "sockets distintos", "2"],
            ["memory", "DDR5 disponibles", "1"],
            ["radio", "con WiFi", "0"],
          ]
            .map(
              ([ic, k, v]) => `<div class="hero-stat"><dt><span class="t-copper">${icon(ic, 14)}</span>${k}</dt><dd>${v}</dd></div>`,
            )
            .join("")}
        </dl>
      </div>

      <div class="intro-side anim-rise" style="animation-delay:240ms">
        <div class="intro-glow anim-float"></div>
        <div class="printer-bar">
          <span class="eyebrow">impresora de pedidos</span>
          <span class="online"><span class="dot led"></span> en línea</span>
        </div>
        <div id="sample-ticket"></div>
        <div class="board-list">
          ${BOARDS.map(
            (b, i) => `<button type="button" class="board-row" data-go="fichas">
              <span class="mono tiny t-dim3">${String(i + 1).padStart(2, "0")}</span>
              <span class="board-row-bar" style="background:${b.pcb}"></span>
              <span class="minw0 grow">
                <span class="board-row-name trunc">${b.fullName}</span>
                <span class="board-row-sub">${b.socket} · ${b.ramType} · ${b.m2}× M.2 · ${b.sata}× SATA</span>
              </span>
              <span class="board-row-price">${eur(b.price)}</span>
            </button>`,
          ).join("")}
        </div>
        <div class="panel method-note">
          Método: se listó la categoría <span class="t-dim8">Placas base</span> de PcComponentes ordenada por precio más
          bajo y se tomaron las cuatro primeras con ficha pública. Los precios de la web fluctúan: el juego usa los de la captura.
        </div>
      </div>
    </div>`;

    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-go]");
      if (!t) return;
      SC.sound.play("click");
      go(t.dataset.go);
    });

    // ticket de muestra rotativo
    const samples = Array.from({ length: 6 }, (_, k) => SC.makeTicket(k === 5));
    const host = SC.$("#sample-ticket", root);
    let i = 0;
    const show = () => (host.innerHTML = ticketHtml(samples[i++ % samples.length]));
    show();
    setInterval(show, 3400);
  };
})();
