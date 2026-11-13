/* =====================================================================
 *  SOCKET CERO · comparador de valor (radar, barras y tabla)
 * ===================================================================== */
(function () {
  const { BOARDS, eur, icon } = SC;

  const AXES = ["memoria", "almacenamiento", "expansion", "conectividad", "gaming"];
  const AXIS_LABELS = { memoria: "Memoria", almacenamiento: "Almacenamiento", expansion: "Expansión", conectividad: "E/S y red", gaming: "Gaming" };

  const avg = (b) => AXES.reduce((s, a) => s + b.scores[a], 0) / AXES.length;
  const round1 = (n) => Math.round(n * 10) / 10;

  const ROWS = [
    { label: "Precio", get: (b) => eur(b.price), best: (b) => b.price, dir: "low" },
    { label: "Socket", get: (b) => b.socket },
    { label: "Chipset", get: (b) => b.chipset },
    { label: "Formato", get: (b) => `${b.form} · ${b.dims}` },
    { label: "CPU soportadas", get: (b) => b.cpus },
    { label: "Memoria", get: (b) => `${b.ramType} · ${b.ramSlots} × DIMM · máx ${b.ramMaxGb} GB · ${b.ramMaxMhz} MHz` },
    { label: "ECC / XMP", get: (b) => `${b.ecc ? "ECC" : "sin ECC"} · ${b.xmp ? "XMP" : "sin perfil"}` },
    { label: "Ranuras", get: (b) => `${b.pcieX16} × PCIe ${b.pcieGen}.0 x16 · ${b.pcieX1} × x1` },
    { label: "Almacenamiento", get: (b) => `${b.m2} × M.2 (${b.m2Note}) · ${b.sata} × SATA 6G` },
    { label: "Red", get: (b) => `${b.lanChip} ${b.lanMbps} Mbps · WiFi ${b.wifi ? "sí" : "no"}` },
    { label: "Audio trasero", get: (b) => b.audio },
    { label: "USB panel", get: (b) => `${b.usb3Rear} × USB 3.2 Gen1 · ${b.usb2Rear} × USB 2.0` },
    { label: "Vídeo integrado", get: (b) => `${b.maxDisplays}${b.dp ? " · DisplayPort" : ""}${b.vga ? " · VGA" : ""}` },
    { label: "Garantía", get: (b) => b.warranty },
  ];

  function tableHtml() {
    const head = BOARDS.map(
      (b) => `<th><div class="row gap2"><span class="sw" style="background:${b.pcb}"></span><span class="th-model">${b.model}</span></div>
        <span class="mono tiny t-amber">${eur(b.price)}</span></th>`,
    ).join("");
    const body = ROWS.map((row) => {
      let bestIdx = -1;
      if (row.best) {
        const vals = BOARDS.map(row.best);
        bestIdx = vals.indexOf(row.dir === "low" ? Math.min(...vals) : Math.max(...vals));
      }
      const cells = BOARDS.map((b, i) => {
        const mark = row.best ? (bestIdx === i ? `<span class="t-mint">${icon("check", 13)}</span>` : `<span class="t-pcb">${icon("minus", 13)}</span>`) : "";
        return `<td><span class="cell">${mark}<span class="${row.best && bestIdx === i ? "t-solder" : ""}">${SC.esc(row.get(b))}</span></span></td>`;
      }).join("");
      return `<tr><td class="sticky-col">${row.label}</td>${cells}</tr>`;
    }).join("");
    return `<table class="comp-table"><thead><tr><th class="sticky-col">Atributo</th>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  SC.initComparador = function (el) {
    el.innerHTML = `<div class="comp-grid">
      <div class="panel pad">
        <div class="comp-head">
          <h3 class="h-small">Radar de bancada</h3>
          <div class="chips" data-ref="toggles">
            ${BOARDS.map((b) => `<button type="button" class="toggle on" data-id="${b.id}" style="--c:${b.pcb}">${b.model}</button>`).join("")}
          </div>
        </div>
        <div class="chart-box" data-ref="radar"></div>
        <p class="note">Puntuación propia 0-100 derivada de la ficha técnica de cada placa (no es un benchmark oficial).</p>
      </div>

      <div class="panel pad">
        <h3 class="h-small mb3">Prestaciones frente a precio</h3>
        <div class="legend">
          <span><i style="background:linear-gradient(90deg,${BOARDS.map((b) => b.pcb).join(",")})"></i>Prestaciones medias</span>
          <span><i class="legend-copper"></i>Valor (peso del precio)</span>
        </div>
        <div class="chart-box" data-ref="bars"></div>
        <p class="note">La barra cobriza aplica un 60 % de peso al precio: por eso la A520M K V2 gana en valor pese a perder en todo lo demás.</p>
      </div>

      <div class="panel ovh span2">
        <div class="panel-head"><span class="panel-kicker">Tabla comparativa completa</span></div>
        <div class="table-scroll">${tableHtml()}</div>
      </div>
    </div>`;

    /* radar con conmutadores */
    let active = BOARDS.map((b) => b.id);
    const radar = SC.radarChart(el.querySelector('[data-ref="radar"]'), { labels: AXES.map((a) => AXIS_LABELS[a]) });
    const refreshRadar = () => {
      radar.update(BOARDS.filter((b) => active.includes(b.id)).map((b) => ({ label: b.model, color: b.pcb, data: AXES.map((a) => b.scores[a]) })));
      el.querySelectorAll(".toggle").forEach((t) => t.classList.toggle("on", active.includes(t.dataset.id)));
    };
    el.querySelector('[data-ref="toggles"]').addEventListener("click", (e) => {
      const t = e.target.closest(".toggle");
      if (!t) return;
      const id = t.dataset.id;
      active = active.includes(id) ? (active.length > 1 ? active.filter((x) => x !== id) : active) : [...active, id];
      SC.sound.play("click");
      refreshRadar();
    });

    /* barras: prestaciones vs valor (se anima al entrar en pantalla) */
    const barsHost = el.querySelector('[data-ref="bars"]');
    const radarHost = el.querySelector('[data-ref="radar"]');
    const drawBars = () =>
      SC.barChart(barsHost, {
        labels: BOARDS.map((b) => b.model),
        series: [
          { label: "Prestaciones medias", data: BOARDS.map((b) => round1(avg(b))), fill: (i) => BOARDS[i].pcb + "cc" },
          { label: "Valor (peso del precio)", data: BOARDS.map((b) => round1(b.scores.precio * 0.6 + avg(b) * 0.4)), fill: "rgba(217,135,63,0.35)", stroke: "rgba(217,135,63,0.9)" },
        ],
        tooltipExtra: (i) => {
          const b = BOARDS[i];
          return `<span class="t-amber">${eur(b.price)}${b.msrp ? ` · oferta -${SC.discount(b)}%` : ""}</span>`;
        },
      });

    let drawn = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !drawn) {
          drawn = true;
          refreshRadar();
          drawBars();
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(radarHost);
  };
})();
