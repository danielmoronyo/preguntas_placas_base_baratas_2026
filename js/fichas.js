/* =====================================================================
 *  SOCKET CERO · inventario del taller (fichas de cada placa)
 * ===================================================================== */
(function () {
  const { BOARDS, eur, icon, chip, esc } = SC;
  const TILT = [-0.7, 0.5, 0.35, -0.45];

  function ficha(b, i) {
    const specs = [
      ["Socket", b.socket],
      ["Formato", b.form],
      ["RAM", `${b.ramType} ${b.ramSlots}×${b.ramMaxGb / 2} GB · máx ${b.ramMaxGb} GB`],
      ["M.2", `${b.m2} · ${b.m2Note.split("·")[1]?.trim() ?? ""}`],
      ["SATA", `${b.sata} puertos`],
      ["LAN", `${b.lanMbps} Mbps`],
      ["USB trasero", `${b.usb3Rear} × 3.2 · ${b.usb2Rear} × 2.0`],
      ["Vídeo", b.maxDisplays],
      ["Garantía", b.warranty],
    ];
    return `<div class="reveal" style="transition-delay:${i * 90}ms">
      <article class="panel ficha">
        <span class="ficha-bar" style="background:${b.pcb}"></span>
        <div class="ficha-head" style="transform:rotate(${TILT[i]}deg)">
          <div>
            <div class="eyebrow">ficha ${String(i + 1).padStart(2, "0")}</div>
            <h3 class="ficha-model">${b.model}</h3>
            <div class="mono small t-dim45">${b.brand} · ${b.chipset}</div>
          </div>
          <div class="ficha-price">
            <div class="big">${eur(b.price)}</div>
            ${b.msrp ? `<div class="mono tiny t-dim4"><s>${eur(b.msrp)}</s> <span class="t-mint">-${SC.discount(b)}%</span></div>` : ""}
          </div>
        </div>

        <div class="ficha-art">
          <img src="${SC.boardImg(b)}" alt="Esquema de la ${esc(b.fullName)}" loading="lazy">
          <button type="button" class="zoom-btn" data-zoom="${b.id}">${icon("expand", 12)} ampliar</button>
        </div>

        <p class="ficha-hype">${esc(b.hype)}</p>

        <div class="ficha-pros">
          <ul>${b.good.map((g) => `<li class="t-dim75"><span class="t-mint">${icon("thumbUp", 13)}</span>${esc(g)}</li>`).join("")}</ul>
          <ul>${b.bad.map((g) => `<li class="t-dim6"><span class="t-hot">${icon("thumbDown", 13)}</span>${esc(g)}</li>`).join("")}</ul>
        </div>

        <dl class="ficha-specs">
          ${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>

        <div class="ficha-foot">
          <div class="chips">
            ${chip(b.ramType, b.ramType === "DDR5" ? "mint" : "muted")}
            ${chip(b.pcieGen === 4 ? "PCIe 4.0" : "PCIe 3.0", "copper")}
            ${chip("sin WiFi", "hot")}
          </div>
          <a class="link" href="${b.url}" target="_blank" rel="noreferrer noopener">ver en PcComponentes ${icon("external", 13)}</a>
        </div>
      </article>
    </div>`;
  }

  SC.initFichas = function (el) {
    el.innerHTML = `<div class="fichas-grid">${BOARDS.map(ficha).join("")}</div>
      <div class="notes">
        <span class="t-copper eyebrow-lg">Notas del taller</span>
        <span>· Las cuatro son Micro ATX: ninguna entra en una caja Mini-ITX.</span>
        <span>· Ninguna trae WiFi/Bluetooth: para eso va una M.2 2230 o un dongle USB.</span>
        <span>· Ninguna tiene 2.5 GbE ni dos ranuras M.2.</span>
      </div>`;
    el.addEventListener("click", (e) => {
      const z = e.target.closest("[data-zoom]");
      if (z) {
        SC.sound.play("click");
        SC.openZoom(SC.boardById(z.dataset.zoom));
      }
    });
    SC.observeReveal(el);
  };
})();
