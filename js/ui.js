/* =====================================================================
 *  SOCKET CERO · utilidades de interfaz compartidas
 * ===================================================================== */
(function () {
  /* ---------- almacenamiento local tolerante a fallos ---------- */
  SC.store = {
    get(k) {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* sin almacenamiento: no pasa nada */
      }
    },
    num(k) {
      return Number(SC.store.get(k) || 0);
    },
  };

  SC.esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  SC.fmtInt = (n) => n.toLocaleString("es-ES");

  SC.$ = (sel, root = document) => root.querySelector(sel);
  SC.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- piezas de marcado ---------- */
  SC.chip = (content, tone = "muted", extra = "") => `<span class="chip chip-${tone} ${extra}">${content}</span>`;

  SC.stat = (label, value, tone = "solder", attrs = "") =>
    `<div class="stat"><span class="stat-label">${label}</span><span class="stat-value t-${tone}" ${attrs}>${value}</span></div>`;

  SC.fuses = (n, size = 17) =>
    `<span class="fuses" title="Fusibles restantes">${[0, 1, 2]
      .map((i) => SC.icon("zap", size, i < n ? "fuse-on" : "fuse-off"))
      .join("")}</span>`;

  /** Chispas de soldadura al acertar: se insertan en un contenedor posicionado. */
  SC.sparks = (host, color = "#38e0a6") => {
    if (!host) return;
    const box = document.createElement("span");
    box.className = "sparks";
    box.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("span");
      const size = 2 + Math.random() * 3.4;
      p.className = "spark";
      p.style.cssText = `width:${size}px;height:${size}px;background:${color};box-shadow:0 0 8px ${color};animation-delay:${(
        Math.random() * 0.18
      ).toFixed(2)}s;--dx:${((Math.random() * 2 - 1) * 110).toFixed(0)}px;--dy:${((Math.random() * 2 - 1) * 74).toFixed(0)}px`;
      box.appendChild(p);
    }
    host.appendChild(box);
    setTimeout(() => box.remove(), 1100);
  };

  /* ---------- aparición al hacer scroll ---------- */
  SC.observeReveal = (root = document) => {
    const els = SC.$$(".reveal:not(.is-in)", root);
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((e) => io.observe(e));
  };

  /* ---------- carta de placa (Taller) ---------- */
  SC.boardCard = ({ board: b, state = "idle", disabled, hotkey, reqs, showAnalysis }) => {
    const yn = (v) => (v ? "sí" : "no");
    let analysis = "";
    if (showAnalysis && reqs && reqs.length) {
      const fails = reqs.filter((r) => !r.test(b));
      analysis = `<ul class="bc-analysis">
        ${reqs
          .map((r) => {
            const ok = r.test(b);
            return `<li><span class="mark ${ok ? "ok" : "ko"}">${ok ? "✓" : "✕"}</span><span class="${ok ? "t-dim7" : "t-hot"} trunc">${SC.esc(r.tag)}</span></li>`;
          })
          .join("")}
        <li class="bc-verdict">${
          fails.length === 0 ? '<span class="t-mint">Cumple el pedido completo</span>' : `<span class="t-hot">Falla: ${SC.esc(fails[0].tag)}</span>`
        }</li>
      </ul>`;
    }
    const overlay =
      state === "correct"
        ? `<span class="bc-overlay"><span class="bc-badge ok">${SC.icon("check", 30)}</span></span>`
        : state === "wrong"
          ? `<span class="bc-overlay"><span class="bc-badge ko">${SC.icon("x", 30)}</span></span>`
          : "";

    return `<button type="button" class="board-card is-${state}" data-board="${b.id}" ${disabled ? "disabled" : ""}>
      <span class="bc-topbar"></span>
      ${disabled ? "" : '<span class="bc-scan"><span></span></span>'}
      <div class="bc-head">
        <div class="minw0">
          <div class="eyebrow">${b.brand}</div>
          <div class="bc-model trunc">${b.model}</div>
        </div>
        <div class="bc-price">
          <div class="num">${SC.eur(b.price).replace(" €", "")}</div>
          <div class="sub">€ IVA inc.</div>
        </div>
      </div>
      <div class="bc-art">
        <img src="${SC.boardImg(b)}" alt="Esquema de la ${SC.esc(b.fullName)}" draggable="false">
        ${hotkey ? `<kbd class="bc-key">${hotkey}</kbd>` : ""}
        ${overlay}
      </div>
      <div class="chips bc-chips">
        ${SC.chip(`${SC.icon("cpu", 11)} ${b.socket}`, "copper")}
        ${SC.chip(`${SC.icon("memory", 11)} ${b.ramType} · ${b.ramMaxGb} GB`)}
        ${SC.chip(`${SC.icon("drive", 11)} ${b.m2}× M.2 · ${b.sata}× SATA`)}
        ${SC.chip(`${SC.icon("wifiOff", 11)} sin WiFi`, "hot")}
      </div>
      <div class="bc-specs">
        <span><i>x16</i> PCIe ${b.pcieGen}.0</span>
        <span><i>x1</i> ×${b.pcieX1}</span>
        <span class="${b.dp ? "t-mint" : ""}"><i>DP</i> ${yn(b.dp)}</span>
        <span class="${b.vga ? "t-mint" : ""}"><i>VGA</i> ${yn(b.vga)}</span>
        <span class="${b.ecc ? "t-mint" : ""}"><i>ECC</i> ${yn(b.ecc)}</span>
        <span><i>vídeo</i> ${b.maxDisplays}</span>
      </div>
      ${analysis}
    </button>`;
  };

  /* ---------- vista ampliada de la ilustración ---------- */
  SC.openZoom = (b) => {
    const wrap = document.createElement("div");
    wrap.className = "modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.innerHTML = `<div class="modal-box anim-rise">
        <div class="modal-head">
          <div><div class="eyebrow t-copper">${b.brand}</div><h3 class="display h-modal">${SC.esc(b.fullName)}</h3></div>
          ${SC.chip(`${SC.icon("zoom", 11)} vista ampliada`, "amber")}
        </div>
        <img class="modal-art" src="${SC.boardImg(b)}" alt="Esquema de la ${SC.esc(b.fullName)}">
        <p class="mono small t-dim5">${SC.esc(b.m2Note)} · ${b.dims} · ${SC.esc(b.maxDisplays)}</p>
        <button type="button" class="btn btn-ghost btn-sm modal-close">${SC.icon("x", 13)} Cerrar <span class="kbd-hint">[Esc]</span></button>
      </div>`;
    const close = () => {
      wrap.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => e.key === "Escape" && close();
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest(".modal-close")) close();
    });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(wrap);
    SC.$(".modal-close", wrap).focus();
  };

  /* ---------- sección activa (para atajos de teclado y menú) ---------- */
  SC.activeSection = "inicio";
  SC.isTyping = (e) => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
})();
