import * as THREE from "three";
import { M, box, boxes, wire, pulses, label, rng, V, COPPER, SILICON, clear, crosses } from "../common.js";

/* The three innermost layers: one FinFET transistor, the standard cells
 * built from them, and a CPU core built from those. */

/* ---------------------------------------------------------------- 0: transistor */
export function transistor() {
  const g = new THREE.Group();
  // Substrate and shallow-trench oxide.
  g.add(box(26, 3, 18, SILICON(), 0, -3, 0));
  // The cut face of the substrate, atom by atom: a diamond lattice in section.
  const atoms = [];
  for (let x = -12.6; x <= 12.6; x += 0.7) {
    for (let y = -2.8; y <= -0.2; y += 0.7) {
      atoms.push({ x, y, z: 9.02 });
      atoms.push({ x: x + 0.35, y: y + 0.35, z: 9.02 });
    }
  }
  const atomMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 8, 6), M(0x8fa2bd, { metal: 0.4, rough: 0.35 }), atoms.length);
  const am = new THREE.Matrix4();
  atoms.forEach((a, i) => atomMesh.setMatrixAt(i, am.makeTranslation(a.x, a.y, a.z)));
  g.add(atomMesh);
  g.add(box(26, 1.2, 18, M(0x9fb3c8, { rough: 0.2, metal: 0.1, opacity: 0.55 }), 0, 0, 0));
  // Three fins running along x.
  const finMat = M(0x5d6f8c, { metal: 0.3, rough: 0.35 });
  const fins = [-3.2, 0, 3.2];
  fins.forEach((z) => g.add(box(22, 3.4, 0.9, finMat, 0, 0, z)));
  // Source and drain: raised epitaxy on the fins, either side of the gate.
  const sd = M(0x9c6f7e, { metal: 0.25, rough: 0.45 });
  for (const x of [-6.5, 6.5]) {
    fins.forEach((z) => {
      const e = new THREE.Mesh(new THREE.OctahedronGeometry(1.35, 0), sd);
      e.scale.set(2.6, 1, 1.1);
      e.position.set(x, 3.1, z);
      g.add(e);
    });
  }
  // The gate wraps over all three fins, with spacers either side.
  const gateMat = M(0xc8a860, { metal: 0.85, rough: 0.32, emissive: 0xffc46a, ei: 0 });
  g.add(box(2.6, 5.2, 13, gateMat, 0, 0, 0));
  for (const x of [-1.75, 1.75]) g.add(box(0.8, 4.8, 13, M(0xe7ecf2, { rough: 0.4 }), x, 0, 0));
  // Contacts up to the first copper layer.
  const cu = COPPER();
  // Contacts, set back, and thin copper leaving towards the back.
  const w = M(0x8b949e, { metal: 0.8, rough: 0.3 });
  for (const x of [-6.5, 6.5]) {
    g.add(box(0.9, 3.2, 0.9, w, x, 3.6, -3.2));
    g.add(box(1.1, 0.5, 8, cu, x, 6.8, -6.5));
  }
  g.add(box(0.9, 2.2, 0.9, w, 0, 5.2, -5));
  g.add(box(1.1, 0.5, 5, cu, 0, 7.4, -7.3));

  // Electrons: they flow source -> drain through the fins while the gate is on.
  const flow = pulses(
    fins.map((z, i) => ({ pts: [V(-10, 1.9, z), V(10, 1.9, z)], speed: 6, count: 14, offset: i * 1.7 })),
    { size: 0.16, color: 0x6fe6ff, intensity: 2.5 }
  );
  g.add(flow.mesh);

  g.add(label("gate", V(0, 5.8, 6.8)), label("source", V(-6.5, 4.6, 4.6)), label("drain", V(6.5, 4.6, 4.6)), label("fin", V(-10.5, 2.4, 3.2)), label("silicon atoms, 0.235 nm apart", V(9, -1.4, 9.3)));

  let on = 1;
  return {
    id: "transistor",
    name: "Transistor",
    size: "about 50 nm",
    group: g,
    slot: null,
    view: { dir: V(0.85, 0.8, 1.45), dist: 3.1, center: V(0, 1.6, 0) },
    update(dt, t) {
      // The gate switches at 0.5 Hz: on, electrons flow; off, they stop.
      const target = Math.floor(t / 2.2) % 2 === 0 ? 1 : 0;
      on += (target - on) * Math.min(1, dt * 6);
      gateMat.emissiveIntensity = on * 0.35;
      flow.update(t * on + (1 - on) * Math.floor(t / 2.2) * 2.2);
      flow.mesh.visible = on > 0.05;
    },
  };
}

/* ---------------------------------------------------------------- 1: gates */
export function gates() {
  const g = new THREE.Group();
  const rand = rng(11);
  // A strip of standard cells: rows between power rails, poly gates across
  // active regions, copper above, signals running on the wires.
  const W = 34;
  const rows = 6;
  // The transistor spans 26 x 18; at 1/16 that's 1.6 x 1.1. Keep a margin clear.
  const SX = 0.2;
  const SZ = -0.6;
  const HW = 1.25;
  const HD = 0.95;
  const RH = 3.2; // row height
  g.add(box(W + 4, 0.6, rows * RH + 4, SILICON(), 0, -0.6, 0));
  const railMat = M(0xd8a064, { metal: 0.9, rough: 0.3 });
  const polyMat = M(0xc2606a, { rough: 0.5, metal: 0.1 });
  const activeMat = M(0x5d6f8c, { metal: 0.3, rough: 0.4 });
  const cellMats = [0x33405a, 0x3a3550, 0x2f4a4a, 0x40403a].map((c) => M(c, { rough: 0.6 }));
  const actives = [];
  const polys = [];
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    const z = -((rows - 1) * RH) / 2 + r * RH;
    // Power rails either side of the row.
    const rz = z - RH / 2;
    if (Math.abs(rz - SZ) > HD + 0.2) g.add(box(W, 0.18, 0.35, railMat, 0, 0.02, rz));
    else {
      g.add(box(W / 2 + SX - HW, 0.18, 0.35, railMat, (-W / 2 + SX - HW) / 2, 0.02, rz));
      g.add(box(W / 2 - SX - HW, 0.18, 0.35, railMat, (W / 2 + SX + HW) / 2, 0.02, rz));
    }
    let x = -W / 2 + 0.3;
    while (x < W / 2 - 1.2) {
      const w = [1.4, 2, 2.6, 3.4][Math.floor(rand() * 4)];
      if (x + w > W / 2) break;
      cells.push({ x: x + w / 2, z, w: w - 0.1, h: 0.05, d: RH - 0.5, y: 0.0, color: null });
      if (Math.abs(x + w / 2 - SX) > HW + w / 2 || Math.abs(z - SZ) > HD + RH / 2) g.add(box(w - 0.1, 0.04, RH - 0.5, cellMats[Math.floor(rand() * 4)], x + w / 2, 0.0, z));
      // Active strips (n and p) and poly fingers across them.
      for (const dz of [-0.6, 0.6]) actives.push({ x: x + w / 2, y: 0.04, z: z + dz, w: w - 0.5, h: 0.12, d: 0.5 });
      const fingers = Math.max(1, Math.round(w / 0.7) - 1);
      for (let k = 0; k < fingers; k += 1) polys.push({ x: x + 0.45 + (k * (w - 0.8)) / Math.max(1, fingers - 1 || 1), y: 0.05, z, w: 0.14, h: 0.2, d: RH - 1 });
      x += w;
    }
  }
  g.add(boxes(clear(actives, SX, SZ, HW, HD), activeMat), boxes(clear(polys, SX, SZ, HW, HD), polyMat));
  // Two metal layers: M1 along x, M2 along z, and vias where they meet.
  const m1 = [];
  const m2 = [];
  const vias = [];
  const lines = [];
  for (let i = 0; i < 26; i += 1) {
    const z = -((rows - 1) * RH) / 2 + Math.floor(rand() * rows) * RH + (rand() - 0.5) * 1.6;
    const x0 = -W / 2 + rand() * W * 0.7;
    const x1 = Math.min(W / 2 - 0.5, x0 + 3 + rand() * 10);
    m1.push({ x: (x0 + x1) / 2, y: 0.45, z, w: x1 - x0, h: 0.14, d: 0.18 });
    const zx = x1;
    const z2 = z + (rand() - 0.5) * 9;
    m2.push({ x: zx, y: 0.85, z: (z + z2) / 2, w: 0.2, h: 0.16, d: Math.abs(z2 - z) + 0.2 });
    vias.push({ x: zx, y: 0.45, z, w: 0.22, h: 0.4, d: 0.22 });
    lines.push({ pts: [V(x0, 0.6, z), V(zx, 0.6, z), V(zx, 1.05, z2)], speed: 4 + rand() * 4, count: 2, offset: rand() * 10 });
  }
  g.add(boxes(clear(m1, SX, SZ, HW, HD), COPPER()), boxes(clear(m2, SX, SZ, HW, HD), M(0xd9965a, { metal: 0.9, rough: 0.3 })), boxes(clear(vias, SX, SZ, HW, HD), M(0x9aa3ad, { metal: 0.8, rough: 0.3 })));
  const sig = pulses(lines.filter((l) => !crosses(l.pts, SX, SZ, HW, HD)), { size: 0.12, color: 0x7fe6ff, intensity: 2.6 });
  g.add(sig.mesh);

  // The socket for the transistor: a bare patch in the middle cell's active area.
  g.add(label("NAND2", V(0.2, 1.2, -1.4)), label("power rail", V(-12, 0.4, -((rows - 1) * RH) / 2 - RH / 2)), label("copper, layer 1", V(9, 0.9, 5)));
  return {
    id: "gates",
    name: "Logic gates",
    size: "about 1 µm",
    group: g,
    slot: { pos: V(SX, 0.2, SZ), scale: 1 / 16 },
    view: { dir: V(0.55, 1.1, 1.05), dist: 2.6, center: V(0, 0, 0) },
    update(dt, t) {
      sig.update(t);
    },
  };
}

/* ---------------------------------------------------------------- 2: core */
export function core() {
  const g = new THREE.Group();
  const rand = rng(21);
  // Floorplan blocks: each is a field of standard cells (tiny boxes) in its
  // own tint, with an SRAM-regular texture for the caches.
  const blocks = [
    { name: "ALU", x: -2, z: 1, w: 12, d: 9, color: 0x3a4f7a },
    { name: "register file", x: 9.5, z: 1, w: 9, d: 9, color: 0x4b3f6e, regular: true },
    { name: "decoder", x: -2, z: -8.5, w: 12, d: 8, color: 0x2f5a5a },
    { name: "scheduler", x: 9.5, z: -8.5, w: 9, d: 8, color: 0x5a4a32 },
    { name: "L1 data", x: -13.5, z: -3.5, w: 8, d: 20, color: 0x3d4450, regular: true },
    { name: "L1 instr.", x: 18.5, z: -3.5, w: 7, d: 20, color: 0x3d4450, regular: true },
    { name: "branch predictor", x: 3.5, z: 10.5, w: 23, d: 7, color: 0x563a4a },
  ];
  g.add(box(44, 0.8, 30, SILICON(), 2, -0.8, -1));
  const cells = [];
  const c = new THREE.Color();
  for (const b of blocks) {
    const step = b.regular ? 0.5 : 0.62;
    for (let x = -b.w / 2 + step / 2; x < b.w / 2; x += step) {
      for (let z = -b.d / 2 + step / 2; z < b.d / 2; z += step) {
        const h = b.regular ? 0.12 : 0.05 + rand() * 0.25;
        c.set(b.color).offsetHSL(0, 0, (rand() - 0.5) * (b.regular ? 0.03 : 0.12));
        cells.push({ x: b.x + x, y: 0, z: b.z + z, w: step * (b.regular ? 0.8 : 0.5 + rand() * 0.4), h, d: step * 0.8, color: c.getHex() });
      }
    }
    g.add(label(b.name, V(b.x - b.w / 2 + 1.2, 0.6, b.z - b.d / 2 + 0.8), "left"));
  }
  // Leave the gates' socket clear: a patch in the ALU.
  const sock = V(-2, 0, 1);
  const kept = cells.filter((it) => Math.abs(it.x - sock.x) > 1.4 || Math.abs(it.z - sock.z) > 1.1);
  g.add(boxes(kept, M(0xffffff, { rough: 0.55, metal: 0.2 })));
  // Global buses between blocks, with data moving on them.
  const busMat = COPPER();
  const routes = [
    [[-13.5, 0.5, 6.5], [-2, 0.5, 6.5], [-2, 0.5, 4.5]],
    [[-2, 0.5, -4.5], [-2, 0.5, -3.5]],
    [[3.9, 0.5, 1], [5, 0.5, 1]],
    [[9.5, 0.5, -4.5], [9.5, 0.5, -3.5]],
    [[14, 0.5, -3], [18.5, 0.5, -3]],
    [[-9.5, 0.5, -10], [-8, 0.5, -10]],
    [[3.5, 0.5, 7], [3.5, 0.5, 5.5]],
  ];
  const lines = [];
  routes.forEach((r) => {
    for (let k = -2; k <= 2; k += 1) {
      const pts = r.map(([x, y, z]) => [x + (r[0][2] === r[1][2] ? 0 : k * 0.28), y, z + (r[0][2] === r[1][2] ? k * 0.28 : 0)]);
      g.add(wire(pts, 0.14, 0.12, busMat));
      lines.push({ pts: pts.map(([x, y, z]) => V(x, y + 0.2, z)), speed: 3 + rand() * 3, count: 2, offset: rand() * 5 });
    }
  });
  const data = pulses(lines, { size: 0.09, color: 0xffd27a, intensity: 2.4 });
  g.add(data.mesh);
  // Pipeline stages light up in order: fetch, decode, schedule, execute.
  const stageMats = ["L1 instr.", "decoder", "scheduler", "ALU"].map((n) => {
    const b = blocks.find((q) => q.name === n);
    const m = new THREE.MeshBasicMaterial({ color: 0x7fe6ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(b.w, b.d).rotateX(-Math.PI / 2), m);
    p.position.set(b.x, 0.45, b.z);
    g.add(p);
    return m;
  });
  return {
    id: "core",
    name: "CPU core",
    size: "about 2 mm",
    group: g,
    slot: { pos: sock.clone().setY(0.02), scale: 1 / 16 },
    view: { dir: V(0.35, 1.25, 0.95), dist: 2.35, center: V(2, 0, -1) },
    update(dt, t) {
      data.update(t);
      stageMats.forEach((m, i) => {
        const ph = (t * 1.6 - i * 0.5) % 2;
        m.opacity = Math.max(0, 0.18 - Math.abs(ph - 0.25) * 0.4);
      });
    },
  };
}
