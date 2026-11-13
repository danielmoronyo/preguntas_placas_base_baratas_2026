/* =====================================================================
 *  SOCKET CERO · mini librería de gráficos en <canvas>
 *  Radar y barras agrupadas con animación, nitidez retina,
 *  redimensionado automático y tooltip al pasar el ratón.
 * ===================================================================== */
(function () {
  const MONO = "IBM Plex Mono, ui-monospace, monospace";
  const DISPLAY = "Chakra Petch, sans-serif";
  const ease = (t) => 1 - Math.pow(1 - t, 4); // easeOutQuart

  /** Base común: canvas dentro de un contenedor con tooltip. */
  function setup(host, draw, hitTest) {
    host.classList.add("chart-host");
    const cv = document.createElement("canvas");
    const tip = document.createElement("div");
    tip.className = "chart-tip";
    host.append(cv, tip);
    const ctx = cv.getContext("2d");
    const st = { w: 0, h: 0, progress: 1, hover: null };

    function size() {
      const r = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      st.w = r.width;
      st.h = r.height;
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      cv.style.width = r.width + "px";
      cv.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint();
    }
    function paint() {
      ctx.clearRect(0, 0, st.w, st.h);
      draw(ctx, st);
    }
    function animate(ms = 650) {
      const t0 = performance.now();
      const step = (now) => {
        st.progress = ease(Math.min(1, (now - t0) / ms));
        paint();
        if (st.progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    cv.addEventListener("mousemove", (e) => {
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const hit = hitTest(x, y, st);
      st.hover = hit ? hit.key : null;
      paint();
      if (hit) {
        tip.innerHTML = hit.html;
        tip.style.display = "block";
        const tw = tip.offsetWidth;
        const th = tip.offsetHeight;
        tip.style.left = Math.min(st.w - tw - 4, Math.max(4, x + 14)) + "px";
        tip.style.top = Math.min(st.h - th - 4, Math.max(4, y - th - 10)) + "px";
      } else tip.style.display = "none";
    });
    cv.addEventListener("mouseleave", () => {
      st.hover = null;
      tip.style.display = "none";
      paint();
    });
    new ResizeObserver(size).observe(host);
    size();
    return { st, paint, animate };
  }

  /* ------------------------------------------------------------------ */
  /*  Radar                                                              */
  /* ------------------------------------------------------------------ */
  SC.radarChart = function (host, { labels, max = 100 }) {
    let datasets = [];
    let geo = null;

    function draw(ctx, st) {
      const n = labels.length;
      const cx = st.w / 2;
      const cy = st.h / 2 + 4;
      const R = Math.max(40, Math.min(st.w / 2 - 70, st.h / 2 - 28));
      const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const pt = (i, v) => [cx + Math.cos(ang(i)) * R * (v / max), cy + Math.sin(ang(i)) * R * (v / max)];
      geo = { cx, cy, R, pt };

      // rejilla
      ctx.lineWidth = 1;
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const [x, y] = pt(i, (max * ring) / 4);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(43,112,89,0.35)";
        ctx.stroke();
      }
      for (let i = 0; i < n; i++) {
        const [x, y] = pt(i, max);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "rgba(43,112,89,0.4)";
        ctx.stroke();
        // etiquetas
        const [lx, ly] = pt(i, max * 1.13);
        ctx.fillStyle = "#e9f5ee";
        ctx.font = `10px ${MONO}`;
        const c = Math.cos(ang(i));
        ctx.textAlign = Math.abs(c) < 0.2 ? "center" : c > 0 ? "left" : "right";
        ctx.textBaseline = "middle";
        ctx.fillText(labels[i], lx, ly);
      }

      // series
      datasets.forEach((ds) => {
        const dim = st.hover && st.hover.ds !== ds.label;
        ctx.beginPath();
        ds.data.forEach((v, i) => {
          const [x, y] = pt(i, v * st.progress);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = ds.color + (dim ? "10" : "24");
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = ds.color + (dim ? "55" : "f2");
        ctx.stroke();
        ds.data.forEach((v, i) => {
          const [x, y] = pt(i, v * st.progress);
          const on = st.hover && st.hover.ds === ds.label && st.hover.i === i;
          ctx.beginPath();
          ctx.arc(x, y, on ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = ds.color;
          ctx.fill();
        });
      });
    }

    function hit(x, y) {
      if (!geo) return null;
      let best = null;
      datasets.forEach((ds) =>
        ds.data.forEach((v, i) => {
          const [px, py] = geo.pt(i, v);
          const d = Math.hypot(px - x, py - y);
          if (d < 10 && (!best || d < best.d)) best = { d, ds, i, v };
        }),
      );
      if (!best) return null;
      return {
        key: { ds: best.ds.label, i: best.i },
        html: `<b style="color:${best.ds.color}">${best.ds.label}</b><span>${labels[best.i]}: ${best.v}/100</span>`,
      };
    }

    const api = setup(host, draw, hit);
    return {
      update(next) {
        datasets = next;
        api.animate(620);
      },
    };
  };

  /* ------------------------------------------------------------------ */
  /*  Barras agrupadas                                                   */
  /* ------------------------------------------------------------------ */
  SC.barChart = function (host, { labels, series, max = 100, tooltipExtra }) {
    let rects = [];

    function draw(ctx, st) {
      const padL = 34;
      const padR = 10;
      const padT = 12;
      const padB = 30;
      const W = st.w - padL - padR;
      const H = st.h - padT - padB;
      const y = (v) => padT + H - (v / max) * H;

      // eje Y
      ctx.font = `10px ${MONO}`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let v = 0; v <= max; v += 20) {
        ctx.strokeStyle = "rgba(43,112,89,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, y(v) + 0.5);
        ctx.lineTo(padL + W, y(v) + 0.5);
        ctx.stroke();
        ctx.fillStyle = "rgba(233,245,238,0.47)";
        ctx.fillText(String(v), padL - 7, y(v));
      }

      const groupW = W / labels.length;
      const barArea = groupW * 0.7;
      const bw = barArea / series.length;
      rects = [];
      labels.forEach((lab, gi) => {
        const gx = padL + gi * groupW + (groupW - barArea) / 2;
        series.forEach((s, si) => {
          const v = s.data[gi] * st.progress;
          const x = gx + si * bw + 2;
          const w = bw - 4;
          const top = y(v);
          const on = st.hover && st.hover.g === gi;
          ctx.fillStyle = typeof s.fill === "function" ? s.fill(gi) : s.fill;
          ctx.globalAlpha = st.hover && !on ? 0.45 : 1;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(x, top, w, padT + H - top, [2, 2, 0, 0]) : ctx.rect(x, top, w, padT + H - top);
          ctx.fill();
          if (s.stroke) {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = s.stroke;
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          rects.push({ x, y: top, w, h: padT + H - top, gi, si });
        });
        ctx.fillStyle = "rgba(233,245,238,0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = `10px ${MONO}`;
        ctx.fillText(lab, padL + gi * groupW + groupW / 2, padT + H + 9);
      });
    }

    function hit(x, y, st) {
      const r = rects.find((r) => x >= r.x - 2 && x <= r.x + r.w + 2 && y >= Math.min(r.y, st.h - 40) - 4 && y <= r.y + r.h);
      if (!r) return null;
      const rows = series.map((s) => `<span>${s.label}: ${s.data[r.gi]}</span>`).join("");
      return {
        key: { g: r.gi },
        html: `<b style="font-family:${DISPLAY}">${labels[r.gi]}</b>${rows}${tooltipExtra ? tooltipExtra(r.gi) : ""}`,
      };
    }

    const api = setup(host, draw, hit);
    api.animate(700);
  };
})();
