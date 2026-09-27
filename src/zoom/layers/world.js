import * as THREE from "three";
import { M, box, boxes, pulses, label, rng, V, fbm } from "../common.js";

/* The city (the datacenter is one roofless building; a rail network runs
 * through, with a line closed and trains rerouted round it) and the planet
 * (the city is one bright patch; cables, satellites, the night side lit). */

/** Lit windows on any box, from world position: no textures needed. */
function windowMaterial(base, lit = 0xffd89a) {
  const m = new THREE.MeshStandardMaterial({ color: base, roughness: 0.7, metalness: 0.1 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;\nvarying vec3 vWn;").replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (instanceMatrix * vec4(transformed, 1.0)).xyz;\nvWn = normalize(mat3(instanceMatrix) * objectNormal);");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying vec3 vWp;\nvarying vec3 vWn;\nfloat h21(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5);}`)
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          vec3 lp = vWp * 9.0;
          float side = step(abs(vWn.y), 0.5);
          vec2 cell = abs(vWn.x) > 0.5 ? lp.zy : lp.xy;
          vec2 f = fract(cell);
          float win = step(0.25, f.x) * step(f.x, 0.75) * step(0.3, f.y) * step(f.y, 0.8);
          float on = step(0.62, h21(floor(cell)));
          totalEmissiveRadiance += vec3(${new THREE.Color(lit).toArray().map((v) => v.toFixed(3)).join(",")}) * win * on * side * 0.28;
        }`
      );
  };
  return m;
}

/* ---------------------------------------------------------------- 7: city */
// The rail network: a loop round town, a line across it, and the detour
// round the closed section. Buildings keep clear of all of it.
const LOOP = [];
for (let i = 0; i <= 96; i += 1) {
  const a = (i / 96) * Math.PI * 2;
  LOOP.push([Math.cos(a) * 22, Math.sin(a) * 18]);
}
const LINES = [LOOP, [[-26, 3], [26, 3]], [[4, 3], [4, 8], [12, 8], [12, 3]]];
function nearRail(x, z, m) {
  for (const L of LINES) {
    for (let i = 1; i < L.length; i += 1) {
      const [ax, az] = L[i - 1];
      const [bx, bz] = L[i];
      const dx = bx - ax;
      const dz = bz - az;
      const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      if (Math.hypot(x - ax - dx * k, z - az - dz * k) < m) return true;
    }
  }
  return false;
}

/** Trains: a teal loco and grey cars that follow a polyline, turned along it. */
function trains(paths) {
  const g = new THREE.Group();
  const locoM = M(0x2fb3a4, { metal: 0.3, rough: 0.4, emissive: 0x2fb3a4, ei: 0.15 });
  const carM = M(0xd9dde2, { metal: 0.3, rough: 0.5, emissive: 0xffe0a0, ei: 0.08 });
  const list = [];
  for (const p of paths) {
    const lens = [0];
    for (let i = 1; i < p.pts.length; i += 1) lens.push(lens[i - 1] + p.pts[i].distanceTo(p.pts[i - 1]));
    const total = lens[lens.length - 1];
    for (let n = 0; n < p.count; n += 1) {
      const cars = [];
      for (let c = 0; c < 4; c += 1) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.34, 0.34).translate(0, 0.25, 0), c === 0 ? locoM : carM);
        g.add(m);
        cars.push(m);
      }
      list.push({ p, lens, total, cars, offset: (n / p.count) * total });
    }
  }
  const at = (tr, d, out) => {
    d = ((d % tr.total) + tr.total) % tr.total;
    let i = 1;
    while (i < tr.lens.length - 1 && tr.lens[i] < d) i += 1;
    const k = (d - tr.lens[i - 1]) / (tr.lens[i] - tr.lens[i - 1] || 1);
    return out.lerpVectors(tr.p.pts[i - 1], tr.p.pts[i], k);
  };
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  return {
    group: g,
    update(t) {
      for (const tr of list) {
        const head = t * tr.p.speed + tr.offset;
        tr.cars.forEach((m, c) => {
          const d = head - c * 1.05;
          at(tr, d, a);
          at(tr, d - 0.2, b);
          m.position.copy(a);
          m.rotation.y = -Math.atan2(a.z - b.z, a.x - b.x);
        });
      }
    },
  };
}

export function city() {
  const g = new THREE.Group();
  const rand = rng(71);
  // The datacenter spans ~44 x 32; at 1/16, 2.75 x 2.0: one big building.
  const DC = V(4.4, 0, -4.4); // a block centre: streets run between blocks, not through this one
  const ground = new THREE.Mesh(new THREE.CircleGeometry(34, 64).rotateX(-Math.PI / 2), M(0x3c4a3a, { rough: 0.95 }));
  ground.position.y = -0.02;
  g.add(ground);
  // A river curving through.
  const river = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 70, 1, 40).rotateX(-Math.PI / 2), M(0x2c5a7a, { rough: 0.2, metal: 0.3 }));
  const rp = river.geometry.attributes.position;
  for (let i = 0; i < rp.count; i += 1) rp.setX(i, rp.getX(i) + Math.sin(rp.getZ(i) * 0.12) * 6 - 13);
  river.position.y = 0.005;
  g.add(river);
  // Streets on a grid; blocks of towers between them.
  const street = 1.1;
  const blockW = 3.3;
  const pitch = blockW + street;
  const blds = [];
  const roads = [];
  const parks = [];
  for (let gx = -7; gx <= 7; gx += 1) {
    for (let gz = -7; gz <= 7; gz += 1) {
      const cx = gx * pitch;
      const cz = gz * pitch;
      const r = Math.hypot(cx, cz);
      if (r > 31) continue;
      if (Math.abs(cx - (Math.sin(cz * 0.12) * 6 - 13)) < 3) continue; // river
      if (Math.abs(cx - DC.x) < 2.6 && Math.abs(cz - DC.z) < 2.4) continue; // datacenter lot
      if (Math.abs(cx + 9) < 3 && Math.abs(cz - 13) < 3) continue; // campus
      // Some blocks are parks.
      if (rand() < 0.1 && r > 6) {
        parks.push({ cx, cz });
        continue;
      }
      const n = 2 + Math.floor(rand() * 3);
      const tall = Math.max(0.3, 5.5 * Math.exp(-r / 12) + rand() * 1.5);
      for (let k = 0; k < n; k += 1) {
        const w = 0.7 + rand() * 1.1;
        const d = 0.7 + rand() * 1.1;
        blds.push({ x: cx + (rand() - 0.5) * (blockW - w), y: 0, z: cz + (rand() - 0.5) * (blockW - d), w, h: tall * (0.4 + rand() * 0.8), d, color: [0x5a6272, 0x6b7280, 0x7a7466, 0x4f5866][Math.floor(rand() * 4)] });
      }
    }
  }
  // Streets stop at the edge of town (a circle), so the planet never sees a grid.
  for (let i = -8; i <= 8; i += 1) {
    const o = i * pitch + pitch / 2;
    const half = Math.sqrt(Math.max(0, 32 * 32 - o * o));
    if (half < 1) continue;
    roads.push({ x: o, y: 0, z: 0, w: street * 0.8, h: 0.01, d: half * 2, color: 0x2a2d33 });
    roads.push({ x: 0, y: 0, z: o, w: half * 2, h: 0.01, d: street * 0.8, color: 0x2a2d33 });
  }
  g.add(boxes(roads, M(0xffffff, { rough: 0.9 })));
  const inDetour = (b) => b.x > 3 && b.x < 13 && b.z > 2 && b.z < 9;
  const kept = blds.filter((b) => !nearRail(b.x, b.z, Math.max(b.w, b.d) / 2 + 0.7) && !inDetour(b));
  g.add(boxes(kept, windowMaterial(0xffffff)));
  // Rooftops: plant rooms, water tanks, the odd antenna.
  const roofs = [];
  for (const b of kept) {
    if (b.h < 1.2) continue;
    roofs.push({ x: b.x + (rand() - 0.5) * b.w * 0.4, y: b.h, z: b.z + (rand() - 0.5) * b.d * 0.4, w: b.w * 0.4, h: 0.12 + rand() * 0.18, d: b.d * 0.35, color: 0x6b7280 });
    if (b.h > 3 && rand() > 0.5) roofs.push({ x: b.x, y: b.h, z: b.z, w: 0.04, h: 0.5 + rand() * 0.6, d: 0.04, color: 0x9aa3ad });
  }
  g.add(boxes(roofs, M(0xffffff, { rough: 0.6, metal: 0.3 })));
  // Parks: grass and trees.
  const trees = [];
  for (const pk of parks) {
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(blockW, blockW).rotateX(-Math.PI / 2), M(0x3f6a34, { rough: 0.95 }));
    lawn.position.set(pk.cx, 0.004, pk.cz);
    g.add(lawn);
    for (let k = 0; k < 14; k += 1) trees.push(V(pk.cx + (rand() - 0.5) * (blockW - 0.4), 0, pk.cz + (rand() - 0.5) * (blockW - 0.4)));
  }
  const treeMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 0.5, 6).translate(0, 0.3, 0), M(0x3d6b35, { rough: 0.9, flat: true }), Math.max(1, trees.length));
  trees.forEach((t, i) => treeMesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(t.x, 0, t.z)));
  treeMesh.count = trees.length;
  g.add(treeMesh);
  // Traffic: headlights one way, tail lights the other.
  const cars = [];
  const carsB = [];
  for (let i = -6; i <= 6; i += 2) {
    const x = i * pitch + pitch / 2;
    cars.push({ pts: [V(x - 0.15, 0.06, -30), V(x - 0.15, 0.06, 30)], speed: 3, count: 7, offset: rand() * 60 });
    carsB.push({ pts: [V(x + 0.15, 0.06, 30), V(x + 0.15, 0.06, -30)], speed: 3, count: 7, offset: rand() * 60 });
  }
  const head = pulses(cars, { size: 0.07, color: 0xfff1c9, intensity: 3 });
  const tail = pulses(carsB, { size: 0.07, color: 0xff5a4a, intensity: 3 });
  g.add(head.mesh, tail.mesh);

  // The datacenter: walls, no roof, cooling towers.
  const wallM = M(0xcfd4da, { rough: 0.6 });
  g.add(box(3.1, 0.35, 0.1, wallM, DC.x, 0, DC.z - 1.1), box(3.1, 0.35, 0.1, wallM, DC.x, 0, DC.z + 1.1), box(0.1, 0.35, 2.3, wallM, DC.x - 1.5, 0, DC.z), box(0.1, 0.35, 2.3, wallM, DC.x + 1.5, 0, DC.z));
  for (let i = 0; i < 4; i += 1) g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.6, 12).translate(DC.x - 1.1 + i * 0.7, 0.3, DC.z + 1.5), M(0xe3e6ea, { rough: 0.6 })));

  // Campus.
  const campus = [];
  for (let i = 0; i < 6; i += 1) campus.push({ x: -9 + (i % 3) * 1.4 - 1.4, y: 0, z: 13 + Math.floor(i / 3) * 1.6 - 0.8, w: 1.1, h: 0.7 + (i === 1 ? 1.4 : 0), d: 0.9, color: 0xd6c7a8 });
  g.add(boxes(campus, windowMaterial(0xffffff, 0xfff0d0)));
  g.add(box(0.5, 3.2, 0.5, M(0xcdb991, { rough: 0.7 }), -9, 0, 12.1), new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 4).translate(-9, 3.55, 12.1), M(0x8a3b2c, { rough: 0.7 })));
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.17, 20), M(0xfff6e0, { emissive: 0xfff0c8, ei: 0.3 }));
  clock.position.set(-9, 2.8, 12.36);
  g.add(clock);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.6).rotateX(-Math.PI / 2).translate(-9, 0.01, 15.9), M(0x4f7a3a, { rough: 0.9 })));

  // Rail: a loop and a cross line. One segment is closed; trains detour.
  const railM = M(0x9aa3ad, { metal: 0.7, rough: 0.35 });
  const loop = LOOP.map(([x, z]) => V(x, 0.08, z));
  const cross = [V(-26, 0.08, 3), V(26, 0.08, 3)];
  const drawRail = (pts, color = null) => {
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const len = a.distanceTo(b);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.16), color ? M(color, { emissive: color, ei: 0.3 }) : railM);
      m.position.copy(a).lerp(b, 0.5);
      m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
      g.add(m);
    }
  };
  drawRail(loop);
  drawRail(cross);
  const closed = [V(4, 0.1, 3), V(12, 0.1, 3)];
  drawRail(closed, 0xff4d4d);
  const rail = trains([
    { pts: loop, speed: 2.6, count: 4 },
    { pts: [V(-26, 0.08, 3), V(4, 0.08, 3), V(4, 0.08, 8), V(12, 0.08, 8), V(12, 0.08, 3), V(26, 0.08, 3)], speed: 3.4, count: 5 },
  ]);
  g.add(rail.group);
  drawRail([V(4, 0.08, 3), V(4, 0.08, 8), V(12, 0.08, 8), V(12, 0.08, 3)]);

  const tRail = label("line closed: trains rerouted round it", V(8, 0.5, 2.2));
  tRail.userData.stop = "railflow";
  const tCampus = label("NIET, Greater Noida", V(-9, 2.6, 13));
  tCampus.userData.stop = "education";
  g.add(label("the datacenter", V(DC.x, 0.9, DC.z - 1.4)), tRail, tCampus);
  return {
    id: "city",
    name: "City",
    size: "about 10 km",
    group: g,
    slot: { pos: DC.clone().setY(0.01), scale: 1 / 16 },
    view: { dir: V(0.5, 1.0, 1.1), dist: 3.3, center: V(0, 0, 0) },
    focus: {
      railflow: { center: V(6, 0, 5), dir: V(0.25, 1.25, 0.85), dist: 1.9 },
      education: { center: V(-9, 0.5, 13.5), dir: V(0.5, 0.75, 1.0), dist: 0.75 },
    },
    update(dt, t) {
      head.update(t);
      tail.update(t);
      rail.update(t);
    },
  };
}

/* ---------------------------------------------------------------- 8: planet */
const planetVert = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
void main() {
  vN = normalize(position);
  vP = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * viewMatrix * vec4(vP, 1.0);
}`;
const planetFrag = /* glsl */ `
uniform vec3 uSun;
uniform float uTime;
varying vec3 vN;
varying vec3 vP;
float h(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
float n3(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm3(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*n3(p); p*=2.03; a*=0.5; } return s; }
float fbm3c(vec3 p){ float s=0.0,a=0.5; for(int i=0;i<3;i++){ s+=a*n3(p); p*=2.03; a*=0.5; } return s * 1.14; }
void main() {
  vec3 n0 = normalize(vN);
  // The city sits at the top of the sphere; tilt the geography so that's a
  // warm latitude (about 28 degrees north), not the pole.
  float ca = cos(1.08), sa = sin(1.08);
  vec3 n = vec3(n0.x, ca * n0.y - sa * n0.z, sa * n0.y + ca * n0.z);
  float land = fbm3(n * 2.2 + 3.1) + 0.4 * smoothstep(0.9, 0.99, n0.y); // land under the city
  float isLand = smoothstep(0.52, 0.535, land);
  float lat = abs(n.y);
  vec3 ocean = mix(vec3(0.02, 0.11, 0.24), vec3(0.05, 0.22, 0.36), smoothstep(0.35, 0.52, land));
  vec3 ground = mix(vec3(0.16, 0.26, 0.12), vec3(0.45, 0.38, 0.24), smoothstep(0.56, 0.7, land));
  ground = mix(ground, vec3(0.92), smoothstep(0.86, 0.95, lat) * (1.0 - smoothstep(0.97, 0.995, n.y)));
  vec3 col = mix(ocean, ground, isLand);
  float dayK = dot(n0, normalize(uSun));
  float lit = smoothstep(-0.15, 0.3, dayK);
  col *= 0.15 + 0.95 * lit;
  // Night side: city lights on land.
  float city = step(0.78, n3(n * 60.0)) * step(0.6, n3(n * 7.0)) * isLand;
  col += vec3(1.0, 0.75, 0.4) * city * (1.0 - lit) * 0.55;
  // Clouds.
  float cl = smoothstep(0.55, 0.75, fbm3c(n * 4.0 + vec3(uTime * 0.01, 0.0, 0.0)));
  col = mix(col, vec3(1.0) * (0.2 + 0.9 * lit), cl * 0.55);
  // Ocean glint.
  vec3 v = normalize(cameraPosition - vP);
  vec3 hv = normalize(normalize(uSun) + v);
  col += (1.0 - isLand) * (1.0 - cl) * pow(max(dot(n0, hv), 0.0), 60.0) * 0.6 * lit;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
const atmoFrag = /* glsl */ `
uniform vec3 uSun;
varying vec3 vN;
varying vec3 vP;
void main() {
  vec3 v = normalize(cameraPosition - vP);
  float rim = pow(1.0 - abs(dot(normalize(vN), v)), 3.0);
  float lit = smoothstep(-0.4, 0.4, dot(normalize(vN), normalize(uSun)));
  gl_FragColor = vec4(vec3(0.3, 0.55, 1.0) * rim * (0.15 + 0.6 * lit), rim * 0.8);
  #include <colorspace_fragment>
}`;

export function planet() {
  const g = new THREE.Group();
  const PR = 10;
  const C0 = V(0, -PR, 0);
  const uniforms = { uSun: { value: V(0.95, 0.3, 0.55).normalize() }, uTime: { value: 0 } };
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(PR, 160, 120), new THREE.ShaderMaterial({ uniforms, vertexShader: planetVert, fragmentShader: planetFrag }));
  sphere.position.copy(C0);
  // Sink it a hair so the city patch sits on top at the pole.
  sphere.position.y -= 0.004;
  g.add(sphere);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(PR * 1.035, 96, 64), new THREE.ShaderMaterial({ uniforms, vertexShader: planetVert, fragmentShader: atmoFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide }));
  atmo.position.copy(C0);
  g.add(atmo);
  // Undersea cables: great-circle arcs between land points, with traffic.
  const rand = rng(81);
  const onSphere = (lat, lon, lift = 0) => {
    const a = (lat * Math.PI) / 180;
    const b = (lon * Math.PI) / 180;
    return V(Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)).multiplyScalar(PR + lift).add(C0);
  };
  const hubs = [[88, 0], [40, -74], [51, 0], [35, 139], [1, 103], [-33, 151], [-23, -46], [19, 72], [25, 55], [37, -122]];
  const arcs = [];
  const arcMat = new THREE.LineBasicMaterial({ color: 0x3fb8ff, transparent: true, opacity: 0.35 });
  for (let i = 0; i < hubs.length; i += 1) {
    for (let k = 0; k < 2; k += 1) {
      const j = (i + 1 + Math.floor(rand() * (hubs.length - 1))) % hubs.length;
      const a = onSphere(...hubs[i]).sub(C0);
      const b = onSphere(...hubs[j]).sub(C0);
      const pts = [];
      for (let s = 0; s <= 48; s += 1) {
        const p = a.clone().lerp(b, s / 48).normalize();
        const lift = Math.sin((s / 48) * Math.PI) * 1.4 + 0.05;
        pts.push(p.multiplyScalar(PR + lift).add(C0));
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), arcMat));
      arcs.push({ pts, speed: 3 + rand() * 2, count: 2, offset: rand() * 30 });
    }
  }
  const traffic = pulses(arcs, { size: 0.07, color: 0x9fe0ff, intensity: 3 });
  g.add(traffic.mesh);
  // Satellites.
  const sats = [];
  for (let i = 0; i < 6; i += 1) {
    const s = new THREE.Group();
    s.add(box(0.12, 0.1, 0.1, M(0xd4af6a, { metal: 0.9, rough: 0.3 }), 0, -0.05, 0));
    s.add(box(0.5, 0.01, 0.14, M(0x2a3f7a, { metal: 0.5, rough: 0.3 }), 0, 0, 0));
    s.userData = { r: PR * (1.25 + rand() * 0.35), tilt: rand() * Math.PI, speed: 0.1 + rand() * 0.15, ph: rand() * 6.28 };
    g.add(s);
    sats.push(s);
  }
  // Orbit rings for the satellites, and a moon.
  const ringMat = new THREE.LineBasicMaterial({ color: 0x6f8aa8, transparent: true, opacity: 0.18 });
  sats.forEach((s) => {
    const u = s.userData;
    const pts = [];
    for (let i = 0; i <= 96; i += 1) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(V(Math.cos(a) * u.r, Math.sin(a) * u.r * Math.cos(u.tilt), Math.sin(a) * u.r * Math.sin(u.tilt)).add(C0));
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  });
  const moon = new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 32), M(0x9a9894, { rough: 0.95 }));
  moon.position.copy(C0).add(V(-34, 14, -46));
  g.add(moon);

  // Stars, far behind.
  const starPos = [];
  for (let i = 0; i < 2500; i += 1) {
    const v = V(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize().multiplyScalar(260 + rand() * 60);
    starPos.push(v.x, v.y, v.z);
  }
  const stars = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3)), new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true }));
  g.add(stars);

  g.add(label("Greater Noida", V(0, 0.8, 0)), label("undersea cables", onSphere(10, 60, 1.2)));
  return {
    id: "planet",
    name: "Planet",
    size: "12,742 km",
    group: g,
    slot: { pos: V(0, 0, 0), scale: 1 / 44 },
    view: { dir: V(0.05, 0.62, 1.0), dist: 3.4, center: C0.clone().add(V(0, 2, 0)) },
    focus: {
      cables: { center: C0.clone(), dir: V(-0.7, 0.25, 1.0), dist: 3.1 },
      home: { center: C0.clone().add(V(0, 4, 0)), dir: V(0.3, 0.9, 1.0), dist: 2.4 },
    },
    update(dt, t) {
      uniforms.uTime.value = t;
      traffic.update(t);
      sats.forEach((s) => {
        const u = s.userData;
        const a = t * u.speed + u.ph;
        s.position.set(Math.cos(a) * u.r, Math.sin(a) * u.r * Math.cos(u.tilt), Math.sin(a) * u.r * Math.sin(u.tilt)).add(C0);
        s.lookAt(C0);
      });
    },
  };
}
