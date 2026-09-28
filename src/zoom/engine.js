import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";

/* Powers of ten.
 *
 * One continuous zoom through nested layers, each built inside a socket of
 * the one above: a transistor inside a gate, gates inside a core, ... a
 * laptop on a desk in a datacenter, the datacenter in a city, the city on a
 * planet.
 *
 * Every layer has its own coordinates, content about R units across, and a
 * `slot` where its child sits (position P, scale s). Zoom z runs from 0
 * (innermost) to N-1; z = i frames layer i. For z in [i, i+1] the camera
 * works in layer i+1's coordinates, flying out from the child with distance
 * interpolated in log space, so every 10x takes the same time.
 *
 * Only four layers are drawn at once (grandchild, child, base, parent), all
 * relative to the base, so nothing needs more precision than a float.
 *
 * The page moves between *stops*: a layer, and optionally a `focus` shot
 * inside it (a centre, distance and direction in that layer's coordinates).
 * Near a stop the camera blends from the zoom path into the stop's shot. */

export const R = 10;

const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (k) => k * k * (3 - 2 * k);
const Z = new THREE.Vector3(0, 0, 1);

export function createEngine(canvas, labelRoot, layers, stops) {
  const N = layers.length;
  // A plain depth buffer: each view spans about 10^4 in depth at most, and
  // a logarithmic one would cost early-z on every pixel.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0x05070b, 1);

  const labels = new CSS2DRenderer({ element: labelRoot });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);


  // The light rig rides with the camera, so every layer is lit the same way.
  const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x1a1410, 0.9);
  const key = new THREE.DirectionalLight(0xfff2e0, 2.2);
  const rim = new THREE.DirectionalLight(0x7fb4ff, 0.8);
  scene.add(hemi, key, key.target, rim, rim.target);

  const holders = layers.map((L) => {
    const h = new THREE.Group();
    h.add(L.group);
    h.visible = false;
    scene.add(h);
    return h;
  });
  const tags = layers.map((L) => {
    const list = [];
    L.group.traverse((o) => o.isCSS2DObject && list.push(o));
    return list;
  });

  const st = {
    stop: 0,
    z: stops[0].z,
    time: 0,
    yaw: 0,
    pitch: 0,
    yawT: 0,
    pitchT: 0,
    // The shot inside the current stop's layer, eased in that layer's coordinates.
    shotLayer: -1,
    shotC: new THREE.Vector3(),
    shotD: 1,
    shotDir: new THREE.Vector3(0, 0, 1),
  };

  let fit = 1;
  // Keep the subject clear of the text panel by shifting the image centre.
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    labels.setSize(w, h);
    camera.aspect = w / h;
    // Put the subject where the text isn't: right of the panel on desktop
    // and on phones held sideways, above the sheet on phones held upright.
    const sideways = h < 560 && w < 1200;
    const narrow = w < 820 || sideways;
    camera.fov = narrow && !sideways ? 56 : 38;
    const ox = !narrow || sideways ? -w * (sideways ? 0.24 : 0.17) : 0;
    const oy = narrow && !sideways ? h * 0.21 : 0;
    camera.setViewOffset(w, h, ox, oy, w, h);
    // Tall, narrow screens can't fit a wide subject at desktop distances.
    fit = w / h < 1 ? Math.min(1.9, 0.8 / (w / h)) : 1;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const rest = (L) => ({ c: (L.view.center || new THREE.Vector3()).clone(), d: (L.view.dist || 2.4) * R, dir: L.view.dir.clone().normalize() });
  function shotOf(stop) {
    const L = layers[stop.z];
    const f = stop.focus && L.focus?.[stop.focus];
    if (!f) return rest(L);
    return { c: f.center.clone(), d: f.dist * R, dir: f.dir.clone().normalize() };
  }

  function place(i, pos, scale) {
    const h = holders[i];
    h.visible = true;
    h.position.copy(pos);
    h.scale.setScalar(scale);
  }

  const q1 = new THREE.Quaternion();
  const q2 = new THREE.Quaternion();
  const tmp = new THREE.Vector3();

  function frame(dt) {
    st.time += dt;
    const target = stops[st.stop];
    st.z = damp(st.z, target.z, 2.1, dt);
    if (Math.abs(st.z - target.z) < 1e-4) st.z = target.z;
    st.yaw = damp(st.yaw, st.yawT, 4, dt);
    st.pitch = damp(st.pitch, st.pitchT, 4, dt);
    if (!st.dragging) {
      st.yawT = damp(st.yawT, 0, 0.5, dt);
      st.pitchT = damp(st.pitchT, 0, 0.5, dt);
    }

    // The stop's shot, eased inside its own layer.
    const want = shotOf(target);
    if (st.shotLayer !== target.z) {
      const r0 = rest(layers[target.z]);
      st.shotC.copy(r0.c);
      st.shotD = r0.d;
      st.shotDir.copy(r0.dir);
      st.shotLayer = target.z;
    }
    const k = 1 - Math.exp(-2.4 * dt);
    st.shotC.lerp(want.c, k);
    st.shotD = Math.exp(Math.log(st.shotD) + (Math.log(want.d) - Math.log(st.shotD)) * k);
    q1.setFromUnitVectors(Z, st.shotDir);
    q2.setFromUnitVectors(Z, want.dir);
    st.shotDir.copy(Z).applyQuaternion(q1.slerp(q2, k)).normalize();

    const z = clamp(st.z, 0, N - 1);
    const B = z >= N - 1 ? N - 1 : Math.floor(z) + 1;
    const f = z >= N - 1 ? 1 : z - Math.floor(z);
    const base = layers[B];
    const child = layers[B - 1];

    holders.forEach((h) => (h.visible = false));
    place(B, new THREE.Vector3(), 1);
    if (child) {
      place(B - 1, base.slot.pos, base.slot.scale);
      const g = layers[B - 2];
      if (g) place(B - 2, base.slot.pos.clone().addScaledVector(child.slot.pos, base.slot.scale), base.slot.scale * child.slot.scale);
    }
    const parent = layers[B + 1];
    if (parent) {
      const s = 1 / parent.slot.scale;
      place(B + 1, parent.slot.pos.clone().multiplyScalar(-s), s);
    }

    // Zoom path: from framing the child to framing the base.
    let center;
    let dist;
    let dir;
    const rB = rest(base);
    if (child) {
      const rC = rest(child);
      const cA = base.slot.pos.clone().addScaledVector(rC.c, base.slot.scale);
      const dA = rC.d * base.slot.scale;
      dist = Math.exp(Math.log(dA) + (Math.log(rB.d) - Math.log(dA)) * f);
      const w = clamp((dist - dA) / (rB.d - dA), 0, 1);
      center = cA.lerp(rB.c, w);
      q1.setFromUnitVectors(Z, rC.dir);
      q2.setFromUnitVectors(Z, rB.dir);
      dir = Z.clone().applyQuaternion(q1.slerp(q2, smooth(f)));
    } else {
      center = rB.c.clone();
      dist = rB.d;
      dir = rB.dir.clone();
    }

    // Blend into the stop's shot as we arrive at its layer.
    const L = target.z;
    const near = 1 - clamp(Math.abs(z - L) / 0.6, 0, 1);
    if (near > 0 && (L === B || L === B - 1)) {
      const sc = L === B ? 1 : base.slot.scale;
      const off = L === B ? tmp.set(0, 0, 0) : base.slot.pos;
      const sC = st.shotC.clone().multiplyScalar(sc).add(off);
      const sD = st.shotD * sc;
      const w = smooth(near);
      center.lerp(sC, w);
      dist = Math.exp(Math.log(dist) + (Math.log(sD) - Math.log(dist)) * w);
      q1.setFromUnitVectors(Z, dir.normalize());
      q2.setFromUnitVectors(Z, st.shotDir);
      dir = Z.clone().applyQuaternion(q1.slerp(q2, w));
    }

    dir.applyEuler(new THREE.Euler(st.pitch, st.yaw, 0, "YXZ"));
    dist *= fit;
    camera.position.copy(center).addScaledVector(dir, dist);
    camera.up.set(0, 1, 0);
    if (Math.abs(dir.y) > 0.985) camera.up.set(0, 0, -1);
    camera.lookAt(center);
    camera.near = dist * 0.012;
    camera.far = dist * 160;
    camera.updateProjectionMatrix();

    key.position.copy(camera.position).add(tmp.set(dist * 0.6, dist * 1.2, dist * 0.4));
    key.target.position.copy(center);
    rim.position.copy(center).add(tmp.set(-dist, dist * 0.3, -dist));
    rim.target.position.copy(center);

    const ctx = { z, stop: target, time: st.time };
    for (let i = 0; i < N; i += 1) {
      const show = holders[i].visible && Math.abs(z - i) < 0.2;
      tags[i].forEach((o) => {
        const on = show && (!o.userData.stop || o.userData.stop === target.id);
        if (o.visible !== on || o.userData.shown !== on) {
          o.visible = on;
          o.userData.shown = on;
          o.element.style.display = on ? "" : "none";
        }
      });
      if (holders[i].visible) layers[i].update?.(dt, st.time, ctx);
    }
    renderer.render(scene, camera);
    labels.render(scene, camera);
  }

  // Warm-up: compile every shader, upload every buffer and texture now,
  // so no frame after a keypress ever does first-time GPU work. Culling is
  // switched off for the one draw, or anything outside the start view would
  // still be uploaded late.
  holders.forEach((h) => (h.visible = true));
  const culled = [];
  scene.traverse((o) => {
    if (o.isMesh || o.isLine || o.isPoints) {
      culled.push([o, o.frustumCulled]);
      o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) for (const k of ["map", "emissiveMap", "normalMap", "roughnessMap"]) if (m?.[k]) renderer.initTexture(m[k]);
    }
  });
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  culled.forEach(([o, f]) => (o.frustumCulled = f));
  holders.forEach((h) => (h.visible = false));

  let last = performance.now();
  let running = true;
  function loop(now) {
    if (!running) return;
    frame(Math.min(0.05, (now - last) / 1000));
    last = now;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  canvas.addEventListener("pointerdown", (e) => {
    st.dragging = { x: e.clientX, y: e.clientY, yaw: st.yawT, pitch: st.pitchT };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!st.dragging) return;
    st.yawT = clamp(st.dragging.yaw - (e.clientX - st.dragging.x) * 0.004, -0.9, 0.9);
    st.pitchT = clamp(st.dragging.pitch - (e.clientY - st.dragging.y) * 0.003, -0.5, 0.5);
  });
  const end = () => (st.dragging = null);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  return {
    go(i) {
      st.stop = clamp(i, 0, stops.length - 1);
    },
    get stop() {
      return st.stop;
    },
    /** How settled the camera is at the current stop (1 = arrived). */
    get arrived() {
      return 1 - clamp(Math.abs(st.z - stops[st.stop].z) / 0.35, 0, 1);
    },
    get z() {
      return st.z;
    },
    pause(p) {
      running = !p;
      if (running) {
        last = performance.now();
        requestAnimationFrame(loop);
      }
    },
    camera,
    scene,
  };
}
