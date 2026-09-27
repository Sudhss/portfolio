import * as THREE from "three";
import { M, box, boxes, wire, pulses, label, rng, V, canvasTex, COPPER, GOLD, SILICON } from "../common.js";

/* The die (eight cores, cache, memory controllers, an interconnect ring),
 * and the board it sits on (package, memory, storage, and the chips that
 * are my projects, wired to the CPU). */

/** A floorplan drawn flat, for the seven cores that aren't the zoomed one. */
function coreTexture(seed) {
  const rand = rng(seed);
  return canvasTex(256, 176, (c, w, h) => {
    c.fillStyle = "#1c2330";
    c.fillRect(0, 0, w, h);
    const blocks = [["#3a4f7a", 70, 70, 70, 55], ["#4b3f6e", 145, 70, 50, 55], ["#2f5a5a", 70, 20, 70, 45], ["#5a4a32", 145, 20, 50, 45], ["#3d4450", 10, 20, 52, 130], ["#3d4450", 202, 20, 44, 130], ["#563a4a", 70, 130, 125, 36]];
    for (const [col, x, y, bw, bh] of blocks) {
      c.fillStyle = col;
      c.fillRect(x, y, bw, bh);
      for (let i = 0; i < (bw * bh) / 14; i += 1) {
        c.fillStyle = `rgba(255,255,255,${0.03 + rand() * 0.08})`;
        c.fillRect(x + rand() * bw, y + rand() * bh, 2, 2);
      }
    }
    c.strokeStyle = "rgba(210,140,70,0.7)";
    c.lineWidth = 2;
    c.strokeRect(1, 1, w - 2, h - 2);
  });
}

function sramTexture() {
  return canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#2a303a";
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        c.fillStyle = (x + y) % 8 ? "#3b4350" : "#343b47";
        c.fillRect(x, y, 3, 3);
      }
    }
    c.fillStyle = "rgba(0,0,0,0.35)";
    for (let x = 0; x < w; x += 64) c.fillRect(x, 0, 3, h);
  });
}

/* ---------------------------------------------------------------- 3: die */
export function die() {
  const g = new THREE.Group();
  const rand = rng(31);
  // The core layer's content spans ~44 x 30; at 1/16 that's 2.75 x 1.9.
  const CW = 2.9;
  const CD = 2.0;
  g.add(box(22, 0.5, 16, SILICON(), 0, -0.5, 0));
  // Seal ring around the edge.
  g.add(wire([[-10.7, 0, -7.7], [10.7, 0, -7.7], [10.7, 0, 7.7], [-10.7, 0, 7.7], [-10.7, 0, -7.7]], 0.25, 0.12, GOLD()));
  const cores = [];
  const tex = [coreTexture(1), coreTexture(2), coreTexture(3)];
  for (let r = 0; r < 2; r += 1) {
    for (let k = 0; k < 4; k += 1) {
      const x = -5.1 + k * 3.4;
      const z = r ? 4.4 : -4.4;
      cores.push(V(x, 0, z));
      if (r === 1 && k === 1) continue; // the real one goes here
      const m = new THREE.Mesh(new THREE.PlaneGeometry(CW, CD).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tex[(r + k) % 3], roughness: 0.5, metalness: 0.2 }));
      m.position.set(x, 0.02, z);
      g.add(m);
    }
  }
  // Shared L3 in the middle, memory controllers and I/O along the edges.
  const l3 = new THREE.Mesh(new THREE.PlaneGeometry(13.4, 4.4).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: sramTexture(), roughness: 0.45, metalness: 0.2 }));
  l3.position.set(0, 0.02, 0);
  g.add(l3);
  const phys = [];
  for (let i = 0; i < 24; i += 1) {
    const edge = i % 4;
    const t = -9 + (Math.floor(i / 4) / 5) * 18;
    const [x, z, w, d] = edge === 0 ? [t, -7.1, 1.6, 0.6] : edge === 1 ? [t, 7.1, 1.6, 0.6] : edge === 2 ? [-10.1, t * 0.7, 0.6, 1.4] : [10.1, t * 0.7, 0.6, 1.4];
    phys.push({ x, y: 0, z, w, h: 0.12, d, color: rand() > 0.5 ? 0x5a4a32 : 0x4a3a5a });
  }
  g.add(boxes(phys, M(0xffffff, { rough: 0.5, metal: 0.3 })));
  // The ring bus joining cores and cache, with packets on it.
  const ring = [V(-7.2, 0.2, -2.6), V(7.2, 0.2, -2.6), V(7.2, 0.2, 2.6), V(-7.2, 0.2, 2.6), V(-7.2, 0.2, -2.6)];
  g.add(wire(ring.map((p) => [p.x, 0.02, p.z]), 0.22, 0.1, COPPER()));
  const pk = pulses([{ pts: ring, speed: 4, count: 26 }, { pts: [...ring].reverse(), speed: 3, count: 18, offset: 2 }], { size: 0.12, color: 0xffd27a, intensity: 2.4 });
  g.add(pk.mesh);
  g.add(label("8 cores", V(-5.1, 0.6, -6)), label("L3 cache", V(-5, 0.5, 0)), label("ring bus", V(7.4, 0.5, -2.4)), label("memory controller", V(0, 0.4, 7.4)));
  return {
    id: "die",
    name: "Processor die",
    size: "about 2 cm",
    group: g,
    slot: { pos: cores[5].clone().add(V(-0.13, 0.03, 0.06)), scale: 1 / 16 },
    view: { dir: V(0.3, 1.3, 0.9), dist: 2.2, center: V(0, 0, 0) },
    update(dt, t) {
      pk.update(t);
    },
  };
}

/* ---------------------------------------------------------------- 4: board */
export function board(projects) {
  const g = new THREE.Group();
  const rand = rng(41);
  // The die spans ~22 x 16; at 1/16 it's 1.4 x 1.0, on a package ~ 3.4 across.
  g.add(box(46, 0.5, 32, M(0x14271f, { rough: 0.75 }), 0, -0.5, 0)); // PCB
  // The PCB's own artwork: dense routing, vias, silkscreen, drawn once.
  const art = canvasTex(2048, 1424, (c, w, h) => {
    const r2 = rng(97);
    c.fillStyle = "#15291f";
    c.fillRect(0, 0, w, h);
    c.lineCap = "round";
    for (let i = 0; i < 900; i += 1) {
      c.strokeStyle = r2() > 0.25 ? "rgba(52, 96, 66, 0.9)" : "rgba(170, 120, 60, 0.55)";
      c.lineWidth = 1.5 + r2() * 2.5;
      let x = r2() * w;
      let y = r2() * h;
      c.beginPath();
      c.moveTo(x, y);
      for (let k = 0; k < 3; k += 1) {
        if (k % 2) y += (r2() - 0.5) * 260;
        else x += (r2() - 0.5) * 260;
        c.lineTo(x, y);
        if (r2() > 0.6) {
          x += 30 * Math.sign(r2() - 0.5);
          y += 30 * Math.sign(r2() - 0.5);
          c.lineTo(x, y);
        }
      }
      c.stroke();
    }
    for (let i = 0; i < 1400; i += 1) {
      const x = r2() * w;
      const y = r2() * h;
      c.fillStyle = "#b98a4a";
      c.beginPath();
      c.arc(x, y, 3.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#0b140f";
      c.beginPath();
      c.arc(x, y, 1.3, 0, Math.PI * 2);
      c.fill();
    }
    c.strokeStyle = "rgba(230, 230, 220, 0.55)";
    c.fillStyle = "rgba(230, 230, 220, 0.6)";
    c.font = "500 15px 'IBM Plex Mono', monospace";
    c.lineWidth = 1.5;
    for (let i = 0; i < 160; i += 1) {
      const x = r2() * w;
      const y = r2() * h;
      c.strokeRect(x, y, 16 + r2() * 30, 10 + r2() * 16);
      c.fillText(`${["R", "C", "L", "Q", "U", "D"][Math.floor(r2() * 6)]}${Math.floor(r2() * 900) + 10}`, x, y - 4);
    }
    for (const [x, y] of [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]]) {
      c.fillStyle = "#c9a060";
      c.beginPath();
      c.arc(x, y, 22, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#05070b";
      c.beginPath();
      c.arc(x, y, 12, 0, Math.PI * 2);
      c.fill();
    }
  });
  const pcbTop = new THREE.Mesh(new THREE.PlaneGeometry(46, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: art, roughness: 0.7, metalness: 0.1 }));
  pcbTop.position.y = 0.002;
  g.add(pcbTop);
  const pkg = V(-6, 0, 0);
  g.add(box(3.6, 0.2, 3.6, M(0x3d5a3a, { rough: 0.6 }), pkg.x, 0, pkg.z)); // package substrate
  g.add(box(4.6, 0.15, 4.6, M(0x7c858f, { metal: 0.7, rough: 0.35 }), pkg.x, -0.1, pkg.z)); // socket frame
  // Memory: soldered down beside the socket, as in a laptop.
  for (let i = 0; i < 8; i += 1) g.add(box(1.6, 0.35, 2.4, M(0x191b20, { rough: 0.4 }), pkg.x + 4.6 + (i % 2) * 2, 0, pkg.z - 4.2 + Math.floor(i / 2) * 2.8));
  // VRM: inductors and capacitors around the socket.
  const parts = [];
  for (let i = 0; i < 10; i += 1) parts.push({ x: pkg.x - 3.8, y: 0, z: -4.5 + i, w: 0.8, h: 0.6, d: 0.8, color: 0x3b3f47 });
  for (let i = 0; i < 14; i += 1) parts.push({ x: pkg.x - 2.4 + (i % 7) * 0.7, y: 0, z: i < 7 ? -3.4 : 3.4, w: 0.35, h: 0.9, d: 0.35, color: 0x2a2c33 });
  g.add(boxes(parts, M(0xffffff, { rough: 0.5, metal: 0.3 })));
  // Hundreds of passives scattered across the board, clear of the big parts.
  const smd = [];
  const busy = [[pkg.x, pkg.z, 3.2, 3.2], [pkg.x + 5.6, pkg.z, 2.6, 5.6], [8, -10, 3, 2.2], [13, 3, 2.9, 2.2], [7, 11, 3.3, 2.2], [-14, 10, 2.8, 2.1], [17, -6, 2.8, 2.1], [-14, -10, 4.4, 1.5]];
  for (let i = 0; i < 700; i += 1) {
    const x = (rand() - 0.5) * 44;
    const z = (rand() - 0.5) * 30;
    if (busy.some(([bx, bz, hw, hd]) => Math.abs(x - bx) < hw && Math.abs(z - bz) < hd)) continue;
    const big = rand() > 0.85;
    smd.push({ x, y: 0, z, w: big ? 0.6 : 0.3, h: big ? 0.3 : 0.12, d: big ? 0.35 : 0.16, ry: rand() > 0.5 ? Math.PI / 2 : 0, color: rand() > 0.45 ? 0xb9926a : 0x1d1f24 });
  }
  g.add(boxes(smd, M(0xffffff, { rough: 0.45, metal: 0.25 })));

  // The project chips, each wired back to the CPU.
  const chips = [
    { key: "valence", label: "VALENCE", x: 8, z: -10, w: 5, d: 3.2 },
    { key: "minisql", label: "MINI SQL", x: 13, z: 3, w: 4.6, d: 3.2 },
    { key: "chromium", label: "MINI CHROMIUM", x: 7, z: 11, w: 5.4, d: 3.2 },
    { key: "moodmate", label: "MOODMATE", x: -14, z: 10, w: 4.4, d: 3 },
    { key: "educred", label: "EDUCRED", x: 17, z: -6, w: 4.4, d: 3 },
  ];
  const lines = [];
  chips.forEach((c, ci) => {
    const top = canvasTex(512, 340, (x, w, h) => {
      x.fillStyle = "#1a1c22";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#e9e4d8";
      x.font = "600 64px 'IBM Plex Mono', monospace";
      x.textAlign = "center";
      x.fillText(c.label, w / 2, h / 2 + 10);
      x.font = "400 30px 'IBM Plex Mono', monospace";
      x.fillStyle = "#8b949e";
      x.fillText(`U${ci + 2}  rev. 2026`, w / 2, h / 2 + 64);
      x.beginPath();
      x.arc(34, 34, 12, 0, Math.PI * 2);
      x.fill();
    });
    const chip = box(c.w, 0.5, c.d, M(0x1a1c22, { rough: 0.4 }), c.x, 0, c.z);
    g.add(chip);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(c.w, c.d).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: top, roughness: 0.5 }));
    face.position.set(c.x, 0.51, c.z);
    g.add(face);
    const legs = [];
    for (let k = 0; k < Math.round(c.w / 0.45); k += 1) {
      for (const s of [-1, 1]) legs.push({ x: c.x - c.w / 2 + 0.25 + k * 0.45, y: 0, z: c.z + s * (c.d / 2 + 0.15), w: 0.16, h: 0.12, d: 0.34 });
    }
    g.add(boxes(legs, M(0xc0c6cc, { metal: 0.9, rough: 0.3 })));
    // Eight-trace bus from the package to the chip, orthogonal.
    for (let k = -3; k <= 3; k += 1) {
      const off = k * 0.22;
      const mx = (pkg.x + c.x) / 2 + off;
      const pts = [[pkg.x + Math.sign(c.x - pkg.x) * 2, 0.01, pkg.z + off], [mx, 0.01, pkg.z + off], [mx, 0.01, c.z + off], [c.x - Math.sign(c.x - pkg.x) * (c.w / 2 + 0.1), 0.01, c.z + off]];
      g.add(wire(pts, 0.1, 0.05, COPPER()));
      if (k % 2 === 0) lines.push({ pts: pts.map(([x, y, z]) => V(x, 0.12, z)), speed: 5 + rand() * 2, count: 1, offset: rand() * 20 });
    }
    g.add(label(projects[c.key] || c.label, V(c.x, 0.9, c.z - c.d / 2 - 0.6)));
  });
  // Storage and a few more parts so it reads as a real board.
  g.add(box(8, 0.2, 2.2, M(0x1e2a44, { rough: 0.5 }), -14, 0, -10));
  g.add(label("NVMe", V(-14, 0.5, -11.4)));
  const sig = pulses(lines, { size: 0.12, color: 0x6fe6ff, intensity: 2.6 });
  g.add(sig.mesh);
  g.add(label("CPU", V(pkg.x, 0.6, pkg.z - 2.6)), label("memory", V(pkg.x + 5.6, 0.8, pkg.z - 6)));
  return {
    id: "board",
    name: "The board",
    size: "about 30 cm",
    group: g,
    slot: { pos: pkg.clone().setY(0.22), scale: 1 / 16 },
    view: { dir: V(0.35, 1.3, 0.95), dist: 3.5, center: V(0, 0, 0) },
    focus: {
      bench: { center: V(12, 0, 2.5), dir: V(0.25, 1.25, 0.9), dist: 2.1 },
    },
    update(dt, t) {
      sig.update(t);
    },
  };
}
