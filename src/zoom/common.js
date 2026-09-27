import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

/* Shared pieces for the layers. */

export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function noise(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, o = 5) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < o; i += 1) {
    s += a * noise(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

const cache = new Map();
/** Physically-ish materials, shared. */
export function M(color, { metal = 0, rough = 0.6, emissive = 0x000000, ei = 0, opacity = 1, flat = false, side = THREE.FrontSide } = {}) {
  const k = [color, metal, rough, emissive, ei, opacity, flat, side].join("|");
  if (!cache.has(k)) {
    cache.set(k, new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, emissive, emissiveIntensity: ei, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, flatShading: flat, side }));
  }
  return cache.get(k);
}

export const COPPER = () => M(0xc9793e, { metal: 0.9, rough: 0.32 });
export const GOLD = () => M(0xd4af6a, { metal: 0.95, rough: 0.28 });
export const SILICON = () => M(0x2b3547, { metal: 0.25, rough: 0.45 });

/** Box whose bottom sits at y = 0. */
export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0);
  const m = new THREE.Mesh(g, material);
  m.position.set(x, y, z);
  return m;
}

/**
 * Many boxes in one draw call. items: [{x, y, z, w, h, d, color?}]
 * (y is the bottom).
 */
export function boxes(items, material) {
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const inst = new THREE.InstancedMesh(geo, material, items.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const c = new THREE.Color();
  items.forEach((it, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.ry || 0);
    m.compose(p.set(it.x, it.y || 0, it.z), q, s.set(it.w, it.h, it.d));
    inst.setMatrixAt(i, m);
    if (it.color != null) inst.setColorAt(i, c.set(it.color));
  });
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  return inst;
}

/** A straight or orthogonal wire as a thin box chain. pts: [[x,y,z], ...] */
export function wire(pts, width, height, material) {
  const items = [];
  for (let i = 1; i < pts.length; i += 1) {
    const [x0, y0, z0] = pts[i - 1];
    const [x1, , z1] = pts[i];
    const dx = x1 - x0;
    const dz = z1 - z0;
    const len = Math.hypot(dx, dz);
    items.push({ x: (x0 + x1) / 2, y: y0, z: (z0 + z1) / 2, w: len + width, h: height, d: width, ry: -Math.atan2(dz, dx) });
  }
  return items.length ? boxes(items, material) : new THREE.Group();
}

/**
 * Glowing pulses running along polylines. lines: [{pts: Vector3[], speed,
 * count, color?}]. One instanced mesh for all of them.
 */
export function pulses(lines, { size = 0.08, color = 0x7fe6ff, intensity = 3 } = {}) {
  // Signals read as lit, not as lamps: intensity is capped low.
  intensity = Math.min(1.25, 0.45 * intensity);
  const total = lines.reduce((n, l) => n + (l.count || 1), 0);
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  mat.color.multiplyScalar(intensity);
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 8, 6), mat, total);
  inst.frustumCulled = false;
  const tracks = lines.map((l) => {
    const lens = [0];
    for (let i = 1; i < l.pts.length; i += 1) lens.push(lens[i - 1] + l.pts[i].distanceTo(l.pts[i - 1]));
    return { ...l, lens, total: lens[lens.length - 1] };
  });
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  function at(t, s) {
    const d = ((s % t.total) + t.total) % t.total;
    let i = 1;
    while (i < t.lens.length - 1 && t.lens[i] < d) i += 1;
    const k = (d - t.lens[i - 1]) / (t.lens[i] - t.lens[i - 1] || 1);
    return p.lerpVectors(t.pts[i - 1], t.pts[i], k);
  }
  function update(time) {
    let n = 0;
    for (const t of tracks) {
      const c = t.count || 1;
      for (let j = 0; j < c; j += 1) {
        at(t, time * (t.speed || 1) + (j / c) * t.total + (t.offset || 0));
        m.makeTranslation(p.x, p.y, p.z);
        inst.setMatrixAt(n, m);
        n += 1;
      }
    }
    inst.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { mesh: inst, update };
}

/** A small callout label anchored in 3D. */
export function label(text, pos, cls = "") {
  const el = document.createElement("div");
  el.className = `tag ${cls}`;
  el.textContent = text;
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  return o;
}

/** A canvas texture drawn by a function. */
export function canvasTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** Drop box items whose footprint touches a socket (centre cx, cz; half sizes hw, hd). */
export function clear(items, cx, cz, hw, hd) {
  return items.filter((it) => Math.abs(it.x - cx) > hw + it.w / 2 || Math.abs(it.z - cz) > hd + it.d / 2);
}
/** Does a polyline pass through the socket? */
export function crosses(pts, cx, cz, hw, hd) {
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    for (let k = 0; k <= 20; k += 1) {
      const x = a.x + ((b.x - a.x) * k) / 20;
      const z = a.z + ((b.z - a.z) * k) / 20;
      if (Math.abs(x - cx) < hw && Math.abs(z - cz) < hd) return true;
    }
  }
  return false;
}
