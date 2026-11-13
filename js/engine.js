/* =====================================================================
 *  SOCKET CERO · motor del juego
 *  Cada requisito es una prueba real sobre la ficha técnica de la placa.
 *  El generador garantiza una única solución… o ninguna (en cuyo caso
 *  hay que rechazar el pedido).
 * ===================================================================== */
(function () {
  const BOARDS = SC.BOARDS;

  const REQUIREMENTS = [
    { id: "am4", client: "«Tengo el Ryzen 5 5600 en un cajón, no me compro otro.»", tag: "Socket AM4", test: (b) => b.socket === "AM4" },
    { id: "lga1700", client: "«Viene con un i5-12400F suelto: necesito LGA 1700.»", tag: "Socket LGA 1700", test: (b) => b.socket === "LGA 1700" },
    { id: "ddr4", client: "«Tengo dos DDR4 de 8 GB, no quiero tirarlas.»", tag: "DDR4", test: (b) => b.ramType === "DDR4" },
    { id: "ddr5", client: "«Los módulos que ya pago son DDR5-4800.»", tag: "DDR5", test: (b) => b.ramType === "DDR5" },
    { id: "ram128", client: "«Quiero llegar a 128 GB algún día, sin cambiar placa.»", tag: "128 GB de RAM", test: (b) => b.ramMaxGb >= 128 },
    { id: "mhz5000", client: "«Por debajo de 5000 MHz de memoria no me lo vendas.»", tag: "RAM ≥ 5000 MHz", test: (b) => b.ramMaxMhz >= 5000 },
    { id: "sata4", client: "«Cuatro discos mecánicos: necesito 4 SATA.»", tag: "4 × SATA", test: (b) => b.sata >= 4 },
    { id: "sata2max", client: "«Solo voy a montar 2 discos, con 2 SATA voy sobrado.»", tag: "≤ 2 × SATA", test: (b) => b.sata <= 2 },
    { id: "dp", client: "«El monitor del taller solo tiene DisplayPort.»", tag: "DisplayPort", test: (b) => b.dp },
    { id: "vga", client: "«El proyector del almacén es VGA, no lo actualizo.»", tag: "Salida VGA", test: (b) => b.vga },
    { id: "dual", client: "«Dos monitores desde la gráfica integrada, sin nada más.»", tag: "2 salidas de vídeo", test: (b) => b.hdmi && b.dp },
    { id: "pcie4", client: "«La gráfica es PCIe 4.0: la ranura x16 ha de ser Gen4.»", tag: "PCIe 4.0 x16", test: (b) => b.pcieGen >= 4 },
    { id: "x1two", client: "«Capturadora y tarjeta de sonido: piden dos ranuras x1.»", tag: "2 × PCIe x1", test: (b) => b.pcieX1 >= 2 },
    { id: "budget50", client: "«50 € duros. Ni uno más, que esto es para el teletrabajo.»", tag: "Presupuesto ≤ 50 €", test: (b) => b.price <= 50 },
    { id: "budget56", client: "«Máximo 56 € para la placa, luego no hay fondo.»", tag: "Presupuesto ≤ 56 €", test: (b) => b.price <= 56 },
    { id: "asus", client: "«Solo ASUS, todo el taller es de esa marca.»", tag: "Marca ASUS", test: (b) => b.brand === "ASUS" },
    { id: "gigabyte", client: "«Solo Gigabyte, que repito los frontales de caja.»", tag: "Marca Gigabyte", test: (b) => b.brand === "Gigabyte" },
    { id: "ecc", client: "«NAS con ZFS: quiero memoria con corrección de errores.»", tag: "RAM ECC", test: (b) => b.ecc },
    {
      id: "cheapest",
      client: "«Lo más barato que exista para montar un Ryzen de oficina.»",
      tag: "La más barata · AM4",
      test: (b) => b.price === Math.min(...BOARDS.map((x) => x.price)) && b.socket === "AM4",
    },
    {
      id: "amd-ddr5",
      client: "«AM4 con DDR5 y disipador de 40 mm, es para un mini-ITX.»",
      tag: "AM4 + DDR5",
      impossible: true,
      test: (b) => b.socket === "AM4" && b.ramType === "DDR5",
    },
  ];

  const TRAMPAS = [
    { id: "budget60", client: "«Presupuesto de 60 € y quiero DDR5, hazme números.»", tag: "DDR5 por menos de 60 €", impossible: true, test: (b) => b.ramType === "DDR5" && b.price <= 60 },
    { id: "wifi", client: "«WiFi 6 integrado, del cable no quiero ni hablar.»", tag: "WiFi integrado", impossible: true, test: (b) => b.wifi },
    { id: "bt", client: "«Bluetooth para el mando del salón, obligatorio.»", tag: "Bluetooth", impossible: true, test: (b) => b.bluetooth },
    { id: "atx", client: "«La caja es una ATX de torre alta: nada de micro ATX.»", tag: "Formato ATX", impossible: true, test: (b) => b.form === "ATX" },
    { id: "itx", client: "«Montaje en 3 litros: solo cabe una Mini-ITX.»", tag: "Formato Mini-ITX", impossible: true, test: (b) => b.form === "Mini-ITX" },
    { id: "dimm4", client: "«Cuatro zócalos DIMM, no negocio esa cifra.»", tag: "4 × DIMM", impossible: true, test: (b) => b.ramSlots >= 4 },
    { id: "m2two", client: "«Dos ranuras M.2 para RAID de SSD NVMe.»", tag: "2 × M.2", impossible: true, test: (b) => b.m2 >= 2 },
    { id: "25gbe", client: "«Red 2.5 GbE para el servidor de ficheros.»", tag: "LAN 2.5 GbE", impossible: true, test: (b) => b.lanMbps >= 2500 },
    { id: "usb320", client: "«Quiero USB 3.2 Gen 2x2 a 20 Gbps en el panel trasero.»", tag: "USB 20 Gbps", impossible: true, test: (b) => b.usb3Rear >= 4 },
  ];

  const FILLERS = [
    { id: "m2", client: "«Un SSD M.2 NVMe para el sistema, como todo el mundo.»", tag: "1 × M.2", test: (b) => b.m2 >= 1 },
    { id: "gbe", client: "«Puerto de red RJ-45 para el router del local.»", tag: "Gigabit LAN", test: (b) => b.lanMbps >= 1000 },
    { id: "usb3", client: "«Al menos un USB 3.2 atrás para el pendrive del técnico.»", tag: "USB 3.2", test: (b) => b.usb3Rear >= 1 },
    { id: "xmp", client: "«Que acepte el perfil XMP de la memoria, no me seas tímido.»", tag: "Perfil XMP", test: (b) => b.xmp },
  ];

  const CLIENTS = [
    { name: "Marta", role: "reparaciones de barrio", mood: "con prisa" },
    { name: "Iker", role: "setup 1440p de salón", mood: "tacaño" },
    { name: "Nati", role: "despacho de la gestoría", mood: "con 4 discos viejos" },
    { name: "Elías", role: "NAS casero con ZFS", mood: "neurótico con los datos" },
    { name: "Suki", role: "reventa de segunda mano", mood: "al céntimo" },
    { name: "Damián", role: "taller de impresión 3D", mood: "con monitores raros" },
    { name: "Carmen", role: "colegio de infantil", mood: "sin red de cable" },
    { name: "Óscar", role: "edición en 4K", mood: "con DDR5 ya pagada" },
  ];

  const rnd = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rnd(arr.length)];
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let ticketSeq = 0;

  /** Genera un pedido. answer = id de la placa correcta, o null si hay que rechazar. */
  function makeTicket(forceTrap = false) {
    const trap = forceTrap || Math.random() < 0.22;

    if (trap) {
      const trapReq = pick(TRAMPAS);
      const extra = Math.random() < 0.75 ? pick(REQUIREMENTS.filter((r) => !r.impossible)) : null;
      const reqs = extra ? [trapReq, extra] : [trapReq];
      const ok = BOARDS.filter((b) => reqs.every((r) => r.test(b)));
      if (ok.length === 0) {
        return { id: ++ticketSeq, client: pick(CLIENTS), reqs, answer: null, rejected: true };
      }
    }

    // Pedido normal: recortar candidatos hasta dejar 1 con al menos 2 requisitos.
    for (let attempt = 0; attempt < 60; attempt++) {
      const target = pick(BOARDS);
      const pool = shuffle(REQUIREMENTS.filter((r) => !r.impossible && r.test(target)));
      const chosen = [];
      let candidates = [...BOARDS];
      for (const req of pool) {
        if (candidates.length === 1 && chosen.length >= 2) break;
        if (chosen.length >= 3) break;
        const next = candidates.filter(req.test);
        if (next.length === 0 || next.length === candidates.length) continue;
        chosen.push(req);
        candidates = next;
      }
      if (candidates.length === 1 && candidates[0].id === target.id) {
        if (chosen.length < 2) {
          const extra = pool.find((r) => !chosen.includes(r));
          if (extra) chosen.push(extra);
        }
        if (chosen.length < 3 && Math.random() < 0.4) {
          const filler = pick(FILLERS.filter((f) => !chosen.some((c) => c.id === f.id)));
          if (filler) chosen.push(filler);
        }
        return { id: ++ticketSeq, client: pick(CLIENTS), reqs: chosen, answer: target.id, rejected: false };
      }
    }

    const t = pick(BOARDS);
    const solo = REQUIREMENTS.find((r) => !r.impossible && r.test(t));
    return { id: ++ticketSeq, client: pick(CLIENTS), reqs: [solo], answer: t.id, rejected: false };
  }

  /* ---------------- Duelo de fichas ---------------- */
  const DUEL_ATTRS = [
    { key: "price", label: "Precio", unit: "€", dir: "low", format: (v) => v.toFixed(2).replace(".", ",") + " €" },
    { key: "ramMaxGb", label: "RAM máxima", unit: " GB", dir: "high" },
    { key: "ramMaxMhz", label: "Frecuencia de RAM", unit: " MHz", dir: "high" },
    { key: "sata", label: "Puertos SATA", unit: "", dir: "high" },
    { key: "pcieX1", label: "Ranuras PCIe x1", unit: "", dir: "high" },
    { key: "pcieGen", label: "Generación del x16", unit: ".0", dir: "high" },
    { key: "m2", label: "Ranuras M.2", unit: "", dir: "high" },
    { key: "ramSlots", label: "Zócalos DIMM", unit: "", dir: "high" },
    { key: "usb3Rear", label: "USB 3.2 traseros", unit: "", dir: "high" },
    { key: "lanMbps", label: "Ancho de red", unit: " Mbps", dir: "high" },
  ];

  function makeDuel(lastPairKey) {
    for (let i = 0; i < 30; i++) {
      const a = pick(BOARDS);
      const b = pick(BOARDS.filter((x) => x.id !== a.id));
      const attr = pick(DUEL_ATTRS);
      const key = `${a.id}-${b.id}-${attr.key}`;
      if (key === lastPairKey) continue;
      const va = a[attr.key];
      const vb = b[attr.key];
      const winner = va === vb ? "tie" : (va > vb) === (attr.dir === "high") ? "a" : "b";
      if (winner === "tie" && i < 22 && Math.random() < 0.8) continue; // el empate debe ser la excepción
      return { a, b, attr, winner, key };
    }
    return { a: BOARDS[0], b: BOARDS[1], attr: DUEL_ATTRS[1], winner: "tie", key: "fallback" };
  }

  /* ---------------- Puntuación ---------------- */
  const ROUND_TIME = 22; // segundos por pedido

  function scoreFor({ timeLeft, streak, nReqs, trap }) {
    const base = trap ? 180 : 120;
    const timeBonus = Math.round(timeLeft * 12);
    const precision = (nReqs - 1) * 45;
    const streakMul = 1 + Math.min(streak, 8) * 0.15;
    return Math.round((base + timeBonus + precision) * streakMul);
  }

  Object.assign(SC, { REQUIREMENTS, TRAMPAS, FILLERS, CLIENTS, DUEL_ATTRS, ROUND_TIME, makeTicket, makeDuel, scoreFor, shuffle });
})();
