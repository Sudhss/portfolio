import * as THREE from "three";
import { M, box, boxes, pulses, label, rng, V, canvasTex } from "../common.js";

/* The datacenter hall. Four zones of racks are the intake pipeline I built
 * at ScholarRank (intake, queue, scoring, read replicas). A cluster in the
 * scoring zone fails every few seconds and Axios-Sovereign fixes it. The
 * laptop sits on the operator's desk at the front. Units: 1 = about 2.3 m. */

export function datacenter() {
  const g = new THREE.Group();
  const rand = rng(61);
  const RW = 0.24;
  const RD = 0.19;
  const RHt = 0.88;
  g.add(box(44, 0.2, 34, M(0x3a3f46, { rough: 0.8 }), 0, -0.2, 0.5));
  const tiles = canvasTex(256, 256, (c, w, h) => {
    c.fillStyle = "#454b53";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#353a41";
    c.lineWidth = 3;
    for (let x = 0; x <= w; x += 32) {
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.moveTo(0, x);
      c.lineTo(w, x);
      c.stroke();
    }
  });
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping;
  tiles.repeat.set(22, 17);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(44, 34).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tiles, roughness: 0.85 }));
  floor.position.set(0, 0.001, 0.5);
  g.add(floor);

  const zones = [
    { name: "intake", x0: -19, color: 0x2f6fcf },
    { name: "queue", x0: -8.5, color: 0xe0b23a },
    { name: "scoring", x0: 2, color: 0x39c0a8 },
    { name: "read replicas", x0: 12.5, color: 0xb070e0 },
  ];
  const racks = [];
  const leds = [];
  const clusterLeds = [];
  // The cluster that fails: scoring zone, two facing rows, eight racks each.
  const inCluster = (zi, row, k) => zi === 2 && (row === 6 || row === 7) && k >= 12 && k < 20;
  zones.forEach((zn, zi) => {
    for (let row = 0; row < 16; row += 1) {
      // Racks in facing pairs, a cold aisle between each pair.
      const z = -13 + Math.floor(row / 2) * 3.4 + (row % 2) * 0.62;
      const face = row % 2 ? -1 : 1;
      for (let k = 0; k < 34; k += 1) {
        const x = zn.x0 + k * 0.26;
        racks.push({ x, y: 0, z, w: RW, h: RHt, d: RD, color: 0xc4c8ce });
        for (let q = 0; q < 3; q += 1) {
          const led = { x, y: 0.1 + rand() * 0.68, z: z + face * (RD / 2 + 0.003), w: 0.1, h: 0.018, d: 0.004, color: zn.color };
          (inCluster(zi, row, k) ? clusterLeds : leds).push(led);
        }
      }
    }
    g.add(label(zn.name, V(zn.x0 + 4.4, 1.9, -14.2)));
  });
  // Every rack face: forty 1U servers, vents and a status light each.
  const bezels = canvasTex(64, 256, (c, w, h) => {
    c.fillStyle = "#16181d";
    c.fillRect(0, 0, w, h);
    for (let u = 0; u < 40; u += 1) {
      const y = 4 + u * 6.2;
      c.fillStyle = u % 7 === 3 ? "#262a31" : "#1f2228";
      c.fillRect(3, y, w - 6, 5);
      c.fillStyle = "#30343c";
      for (let x = 8; x < w - 18; x += 4) c.fillRect(x, y + 1.5, 2, 2);
      c.fillStyle = (u * 37) % 11 === 0 ? "#b59a2a" : "#2f7a4a";
      c.fillRect(w - 12, y + 1.5, 4, 2);
    }
  });
  const rackMat = new THREE.MeshStandardMaterial({ map: bezels, metalness: 0.4, roughness: 0.55 });
  g.add(boxes(racks, rackMat));
  // Light strips over the cold aisles, dim; cable ladders; sprinkler mains.
  const strips = [];
  const ladders = [];
  for (let row = 0; row < 8; row += 1) {
    const z = -13 + row * 3.4 + 0.31;
    strips.push({ x: 0, y: 2.1, z, w: 40, h: 0.03, d: 0.08 });
    for (let x = -19.5; x < 20; x += 0.5) ladders.push({ x, y: 1.25, z: z + 1.2, w: 0.04, h: 0.03, d: 0.5 });
    ladders.push({ x: 0, y: 1.25, z: z + 0.96, w: 40, h: 0.04, d: 0.03 }, { x: 0, y: 1.25, z: z + 1.44, w: 40, h: 0.04, d: 0.03 });
  }
  g.add(boxes(strips, M(0x9aa0a8, { emissive: 0xd8dde3, ei: 0.08 })));
  g.add(boxes(ladders, M(0x8a9098, { metal: 0.7, rough: 0.4 })));
  for (const z of [-15.8, 16.6]) g.add(box(44, 0.06, 0.06, M(0xa83a2c, { rough: 0.5 }), 0, 2.3, z));
  for (let i = 0; i < 7; i += 1) g.add(box(1.2, 1.2, 0.8, M(0xdfe3e7, { rough: 0.6 }), -18 + i * 6, 0, 16.3));
  g.add(boxes(leds, new THREE.MeshBasicMaterial({ color: 0x8a8a8a })));
  const clusterMat = new THREE.MeshBasicMaterial({ color: 0x2a8a7a });
  g.add(boxes(clusterLeds, clusterMat));
  // An outline round the cluster while it's failing.
  const cx = 2 + 15.5 * 0.26;
  const cz = -13 + 3 * 3.4 + 0.31;
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 1.1, 1.25)), new THREE.LineBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0 }));
  outline.position.set(cx, 0.55, cz);
  g.add(outline);
  const incident = label("healthy", V(cx, 1.5, cz), "left");
  incident.userData.stop = "axios";
  g.add(incident);

  // Overhead trays, traffic flowing through the pipeline.
  const trayMat = M(0xd9a23a, { metal: 0.6, rough: 0.4 });
  const flows = [];
  for (let row = 0; row < 8; row += 1) {
    const z = -13 + row * 3.4 + 0.31;
    g.add(box(40, 0.05, 0.3, trayMat, 0, 1.45, z));
    flows.push({ pts: [V(-19.5, 1.55, z), V(21, 1.55, z)], speed: 5 + rand() * 3, count: 5, offset: rand() * 40 });
  }
  for (const x of [-9, 1.5, 12]) {
    g.add(box(0.3, 0.05, 28, trayMat, x, 1.45, -1));
    flows.push({ pts: [V(x, 1.55, -13), V(x, 1.55, 12)], speed: 4, count: 6, offset: rand() * 20 });
  }
  const fl = pulses(flows, { size: 0.09, color: 0x9fd8ff, intensity: 2.6 });
  g.add(fl.mesh);
  for (let i = 0; i < 8; i += 1) g.add(box(1.2, 1.2, 0.8, M(0xdfe3e7, { rough: 0.6 }), -20 + i * 5.6, 0, -15.3));

  // The operator's desk at the front; the laptop layer supplies its top.
  const DESK = V(-15, 0.33, 14.2);
  const legM = M(0x2a2e35, { metal: 0.6, rough: 0.4 });
  for (const [dx, dz] of [[-0.28, -0.17], [0.28, -0.17], [-0.28, 0.17], [0.28, 0.17]]) g.add(box(0.025, 0.32, 0.025, legM, DESK.x + dx, 0, DESK.z + dz));
  const chair = new THREE.Group();
  chair.add(box(0.2, 0.02, 0.2, M(0x1c1f25, { rough: 0.7 }), 0, 0.2, 0), box(0.2, 0.25, 0.03, M(0x1c1f25, { rough: 0.7 }), 0, 0.22, 0.1), box(0.03, 0.2, 0.03, legM, 0, 0, 0));
  chair.position.set(DESK.x, 0, DESK.z + 0.36);
  g.add(chair);

  return {
    id: "datacenter",
    name: "Datacenter",
    size: "about 100 m",
    group: g,
    slot: { pos: DESK, scale: 1 / 230 },
    view: { dir: V(0.7, 0.85, 1.15), dist: 2.8, center: V(0, 0.4, 0) },
    focus: {
      axios: { center: V(cx, 0.5, cz), dir: V(0.55, 0.7, 1.1), dist: 0.55 },
    },
    update(dt, t) {
      fl.update(t);
      // Every 10 s: fails, agents argue, the fix runs, healthy again.
      const cyc = t % 10;
      const failing = cyc > 2.5 && cyc < 7.5;
      clusterMat.color.setHex(failing ? (Math.floor(t * 4) % 2 ? 0xc43a3a : 0x3a1010) : 0x2a8a7a);
      outline.material.opacity = failing ? 0.9 : cyc >= 7.5 && cyc < 8.5 ? 0.5 : 0;
      outline.material.color.setHex(cyc >= 7.5 ? 0x57ab5a : 0xff4d4d);
      const msg = cyc < 2.5 ? "scoring cluster: healthy" : cyc < 4 ? "incident: p99 latency over 2 s" : cyc < 5.8 ? "agents: debating the root cause" : cyc < 7.5 ? "fix: roll back, logged in Jira" : "resolved";
      if (incident.element.textContent !== msg) incident.element.textContent = msg;
      incident.element.classList.toggle("alert", failing);
    },
  };
}
