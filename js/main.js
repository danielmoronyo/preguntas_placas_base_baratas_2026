/* =====================================================================
 *  SOCKET CERO · arranque de la página
 * ===================================================================== */
(function () {
  const { BOARDS, eur, $, $$ } = SC;
  const SECTIONS = ["inicio", "taller", "duelo", "fichas", "comparador"];

  /* ---------- ticker de precios ---------- */
  function ticker() {
    const item = (b) => `<span class="tick-item">
      <span class="tick-dot" style="background:${b.pcb}"></span>
      <span class="t-dim7">${b.fullName}</span>
      <span class="t-amber">${eur(b.price)}</span>
      ${b.msrp ? `<span class="t-mint">-${SC.discount(b)}%</span>` : ""}
      <span class="t-dim3">envío gratis · cod. ${b.code}</span>
      <span class="t-copper">/</span>
    </span>`;
    $("#ticker").innerHTML = [...BOARDS, ...BOARDS].map(item).join("");
  }

  /* ---------- fuentes en el pie ---------- */
  function sources() {
    $("#sources").innerHTML = BOARDS.map(
      (b) => `<li><a class="link" href="${b.url}" target="_blank" rel="noreferrer noopener">${b.fullName}</a>
        — ${eur(b.price)} · ${b.ramType} · ${b.socket} · cod. ${b.code}</li>`,
    ).join("");
  }

  /* ---------- botón de sonido ---------- */
  function soundButton() {
    const btn = $("#sound-btn");
    const paint = () => {
      const m = SC.sound.isMuted();
      btn.innerHTML = SC.icon(m ? "mute" : "volume", 15);
      btn.classList.toggle("is-muted", m);
      btn.setAttribute("aria-label", m ? "Activar sonido" : "Silenciar");
      btn.title = m ? "Activar sonido" : "Silenciar";
    };
    btn.addEventListener("click", () => {
      SC.sound.toggle();
      SC.sound.play("click");
    });
    SC.sound.onChange(paint);
    paint();
  }

  /* ---------- iconos del menú ---------- */
  function navIcons() {
    $$("[data-icon]").forEach((el) => (el.innerHTML = SC.icon(el.dataset.icon, Number(el.dataset.size || 14))));
  }

  /* ---------- sección activa: resalta el menú y dirige el teclado ---------- */
  function trackSections() {
    const setActive = (id) => {
      SC.activeSection = id;
      $$(".nav-link").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
    };
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((id) => obs.observe(document.getElementById(id)));
    // al pulsar dentro de un juego, ese juego recibe el teclado
    ["taller", "duelo"].forEach((id) => document.getElementById(id).addEventListener("pointerdown", () => setActive(id)));
  }

  document.addEventListener("DOMContentLoaded", () => {
    navIcons();
    ticker();
    sources();
    soundButton();
    SC.initIntro($("#intro-root"));
    SC.initTaller($("#taller-root"));
    SC.initDuelo($("#duelo-root"));
    SC.initFichas($("#fichas-root"));
    SC.initComparador($("#comparador-root"));
    SC.observeReveal();
    trackSections();
  });
})();
