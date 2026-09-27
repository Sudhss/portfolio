import * as THREE from "three";
import { M, box, boxes, label, V, canvasTex } from "../common.js";

/* The laptop the board lives in, drawn as an exploded view: the keyboard
 * deck lifted off and set forward so the board shows in the chassis, the
 * lid open. The screen is live: Valence typing C++, or MoodMate chatting,
 * depending on the stop. Units are centimetres. */

const CODE = [
  [["#include ", "#dcbdfb"], ["<bits/stdc++.h>", "#dcbdfb"]],
  [["using namespace ", "#96d0ff"], ["std;", "#e6edf3"]],
  [],
  [["// longest increasing subsequence, O(n log n)", "#7d8590"]],
  [["int ", "#96d0ff"], ["main", "#8ddb8c"], ["() {", "#e6edf3"]],
  [["  int ", "#96d0ff"], ["n; cin >> n;", "#e6edf3"]],
  [["  vector", "#96d0ff"], ["<int> tails;", "#e6edf3"]],
  [["  for ", "#f69d50"], ["(int i = 0; i < n; ++i) {", "#e6edf3"]],
  [["    int ", "#96d0ff"], ["x; cin >> x;", "#e6edf3"]],
  [["    auto ", "#96d0ff"], ["it = ", "#e6edf3"], ["lower_bound", "#8ddb8c"], ["(tails.begin(), tails.end(), x);", "#e6edf3"]],
  [["    if ", "#f69d50"], ["(it == tails.end()) tails.", "#e6edf3"], ["push_back", "#8ddb8c"], ["(x);", "#e6edf3"]],
  [["    else ", "#f69d50"], ["*it = x;", "#e6edf3"]],
  [["  }", "#e6edf3"]],
  [["  cout ", "#96d0ff"], ["<< tails.", "#e6edf3"], ["size", "#8ddb8c"], ["() << ", "#e6edf3"], ["'\\n'", "#f69d50"], [";", "#e6edf3"]],
  [["}", "#e6edf3"]],
];
const CHARS = CODE.reduce((n, l) => n + l.reduce((m, [s]) => m + s.length, 0) + 1, 0);

const CHAT = [
  ["you", "my code passed the samples and failed on test 37"],
  ["MoodMate (sarcastic)", "Test 37 is where edge cases go to be discovered. Did you try n = 1, or is that beneath you?"],
  ["you", "ok switch to supportive"],
  ["MoodMate (supportive)", "You got 36 right. Check the n = 1 case and overflow on the sum: use long long. You're close."],
];

function drawValence(c, w, h, t) {
  c.fillStyle = "#0d1117";
  c.fillRect(0, 0, w, h);
  // Title bar and tabs.
  c.fillStyle = "#161b22";
  c.fillRect(0, 0, w, 44);
  c.fillStyle = "#e6edf3";
  c.font = "600 20px 'IBM Plex Sans', sans-serif";
  c.fillText("Valence", 18, 29);
  c.fillStyle = "#0d1117";
  c.fillRect(130, 8, 170, 36);
  c.fillStyle = "#e6edf3";
  c.font = "400 17px 'IBM Plex Mono', monospace";
  c.fillText("lis.cpp", 150, 32);
  c.fillStyle = "#7d8590";
  c.fillText("judge.cfg", 322, 32);
  // Code, typing: n characters so far, the caret after the last one.
  const n = Math.floor((t * 22) % (CHARS + 60));
  let left = n;
  c.font = "400 21px 'IBM Plex Mono', monospace";
  for (let i = 0; i < CODE.length && left >= 0; i += 1) {
    const line = CODE[i];
    const y = 88 + i * 31;
    const full = line.map(([s]) => s).join("");
    c.fillStyle = "#484f58";
    c.textAlign = "right";
    c.fillText(String(i + 1), 58, y);
    c.textAlign = "left";
    const upto = Math.min(full.length, left);
    let x = 78;
    let drawn = 0;
    for (const [seg, col] of line) {
      const part = seg.slice(0, Math.max(0, upto - drawn));
      c.fillStyle = col;
      c.fillText(part, x, y);
      x += c.measureText(seg).width;
      drawn += seg.length;
      if (drawn >= upto) break;
    }
    if (left <= full.length) {
      if (Math.floor(t * 2.5) % 2 === 0) {
        c.fillStyle = "#56d6c8";
        c.fillRect(78 + c.measureText(full.slice(0, upto)).width, y - 20, 3, 26);
      }
      break;
    }
    left -= full.length + 1;
  }
  // Judge panel.
  const px = w - 330;
  c.fillStyle = "#161b22";
  c.fillRect(px, 44, 330, h - 44);
  c.fillStyle = "#e6edf3";
  c.font = "600 18px 'IBM Plex Sans', sans-serif";
  c.fillText("Judge", px + 20, 80);
  const done = n > CHARS;
  const tests = ["sample 1", "sample 2", "n = 1", "n = 200000"];
  tests.forEach((name, i) => {
    const y = 120 + i * 40;
    c.fillStyle = "#7d8590";
    c.font = "400 17px 'IBM Plex Mono', monospace";
    c.fillText(name, px + 20, y);
    const k = done ? Math.min(1, (n - CHARS) / 12 - i) : 0;
    c.fillStyle = k >= 1 ? "#57ab5a" : "#484f58";
    c.fillText(k >= 1 ? `AC  ${[3, 2, 1, 41][i]} ms` : "...", px + 190, y);
  });
  c.fillStyle = "#7d8590";
  c.font = "400 15px 'IBM Plex Mono', monospace";
  c.fillText("g++ -O2 -std=c++17", px + 20, h - 30);
  // Status bar.
  c.fillStyle = "#1f6feb";
  c.fillRect(0, h - 26, w - 330, 26);
  c.fillStyle = "#ffffff";
  c.font = "400 14px 'IBM Plex Mono', monospace";
  c.fillText("C++  UTF-8  Ln 14  60 fps", 14, h - 8);
}

function drawMoodMate(c, w, h, t) {
  c.fillStyle = "#111318";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#1a1d24";
  c.fillRect(0, 0, 260, h);
  c.fillStyle = "#e6edf3";
  c.font = "600 22px 'IBM Plex Sans', sans-serif";
  c.fillText("MoodMate", 24, 44);
  c.font = "400 15px 'IBM Plex Mono', monospace";
  c.fillStyle = "#7d8590";
  c.fillText("llama3 via Ollama, offline", 24, 70);
  ["sarcastic", "honest", "supportive", "neutral"].forEach((m, i) => {
    const on = (i === 0 && t % 16 < 8) || (i === 2 && t % 16 >= 8);
    c.fillStyle = on ? "#d49a3a" : "#262a33";
    c.fillRect(24, 110 + i * 46, 212, 34);
    c.fillStyle = on ? "#120c04" : "#a9b4c1";
    c.font = "500 16px 'IBM Plex Sans', sans-serif";
    c.fillText(m, 38, 133 + i * 46);
  });
  c.fillStyle = "#7d8590";
  c.font = "400 14px 'IBM Plex Mono', monospace";
  c.fillText("memory: sqlite, 212 notes", 24, h - 30);
  // The conversation, revealed over time.
  const shown = Math.floor((t % 16) / 3.4) + 1;
  let y = 60;
  c.font = "400 18px 'IBM Plex Sans', sans-serif";
  CHAT.slice(0, shown).forEach(([who, msg]) => {
    const me = who === "you";
    const words = msg.split(" ");
    const lines = [];
    let line = "";
    for (const wd of words) {
      if (c.measureText(line + " " + wd).width > 560) {
        lines.push(line.trim());
        line = wd;
      } else line += " " + wd;
    }
    lines.push(line.trim());
    const bw = Math.max(...lines.map((l) => c.measureText(l).width)) + 36;
    const bh = lines.length * 26 + 22;
    const x = me ? w - 40 - bw : 300;
    c.fillStyle = "#7d8590";
    c.font = "400 13px 'IBM Plex Mono', monospace";
    c.fillText(who, x, y - 8);
    c.fillStyle = me ? "#1f6feb" : "#262a33";
    c.fillRect(x, y, bw, bh);
    c.fillStyle = "#e6edf3";
    c.font = "400 18px 'IBM Plex Sans', sans-serif";
    lines.forEach((l, i) => c.fillText(l, x + 18, y + 30 + i * 26));
    y += bh + 40;
  });
}

export function laptop() {
  const g = new THREE.Group();
  const alu = M(0xb4bac2, { metal: 0.85, rough: 0.32 });
  const dark = M(0x2a2e35, { metal: 0.5, rough: 0.45 });

  // The desk.
  const wood = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = "#3b2a1f";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i += 1) {
      c.strokeStyle = `rgba(${90 + (i % 7) * 6},${60 + (i % 5) * 4},40,0.25)`;
      c.lineWidth = 1 + (i % 3);
      c.beginPath();
      const y = (i / 90) * h;
      c.moveTo(0, y);
      c.bezierCurveTo(w * 0.3, y + 8, w * 0.6, y - 8, w, y + 3);
      c.stroke();
    }
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  wood.repeat.set(2, 1.4);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(140, 3, 90).translate(0, -1.5, 0), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.7 }));
  g.add(desk);

  // Chassis: a tray, open on top, so the board shows.
  const BW = 34;
  const BD = 23;
  g.add(box(BW, 0.4, BD, alu, 0, 0, 0));
  g.add(box(BW, 1.6, 0.4, alu, 0, 0, -BD / 2 + 0.2), box(BW, 1.6, 0.4, alu, 0, 0, BD / 2 - 0.2), box(0.4, 1.6, BD, alu, -BW / 2 + 0.2, 0, 0), box(0.4, 1.6, BD, alu, BW / 2 - 0.2, 0, 0));
  // Battery cells along the front, a fan at the back corner.
  for (let i = 0; i < 3; i += 1) g.add(box(8.5, 0.7, 4.5, M(0x1c1f25, { rough: 0.6 }), -10 + i * 10, 0.4, 8.4));
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.8, 24).translate(12.5, 0.8, -8), dark);
  g.add(fan);

  // Keyboard deck, exploded: lifted and pulled forward, with assembly lines.
  const deck = new THREE.Group();
  deck.add(box(BW, 0.5, BD, alu, 0, 0, 0));
  const keys = [];
  const rows = [14, 14, 13, 12, 11];
  rows.forEach((n, r) => {
    for (let k = 0; k < n; k += 1) keys.push({ x: -13.6 + k * 2.08 + r * 0.5, y: 0.5, z: -9 + r * 2.1, w: 1.8, h: 0.35, d: 1.8 });
  });
  keys.push({ x: 0, y: 0.5, z: 1.6, w: 11, h: 0.35, d: 1.8 }); // space
  deck.add(boxes(keys, M(0x1b1d22, { rough: 0.55 })));
  deck.add(box(11, 0.06, 6.5, M(0xa9afb7, { metal: 0.7, rough: 0.25 }), 0, 0.5, 6.8)); // trackpad
  deck.position.set(0, 4.5, BD + 5);
  g.add(deck);
  const guide = new THREE.LineDashedMaterial({ color: 0x6f7c8b, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0.8 });
  for (const [x, z] of [[-BW / 2, -BD / 2], [BW / 2, -BD / 2], [-BW / 2, BD / 2], [BW / 2, BD / 2]]) {
    const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x, 1.6, z), V(x, 4.5, z + BD + 5)]), guide);
    ln.computeLineDistances();
    g.add(ln);
  }

  // The lid, open about 105 degrees, and the live screen.
  const lid = new THREE.Group();
  lid.position.set(0, 1.6, -BD / 2);
  lid.rotation.x = -0.26;
  lid.add(box(BW, BD, 0.6, alu, 0, 0, -0.3));
  const bezel = box(BW - 0.6, BD - 0.6, 0.05, M(0x08090b, { rough: 0.3 }), 0, 0.3, 0.02);
  lid.add(bezel);
  const scr = document.createElement("canvas");
  // Drawn at 1280 x 820 in canvas units, stored at 0.75x, and only while
  // you're near the laptop, 12 times a second: each upload is the cost.
  scr.width = 960;
  scr.height = 615;
  const ctx = scr.getContext("2d");
  ctx.scale(0.75, 0.75);
  const tex = new THREE.CanvasTexture(scr);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const SW = BW - 2;
  const SH = SW * (615 / 960);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  screen.position.set(0, 1.1 + SH / 2, 0.08);
  lid.add(screen);
  g.add(lid);

  // A mug, because nobody writes an editor without one.
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(4, 3.6, 9, 24, 1, true).translate(0, 4.5, 0), M(0xe8e2d6, { rough: 0.5 }));
  mug.material.side = THREE.DoubleSide;
  mug.position.set(28, 0, 6);
  g.add(mug, box(7.2, 0.3, 7.2, M(0x2a1a10, { rough: 0.3 }), 28, 7.5, 6));

  g.add(label("the board", V(-12, 3, 2)), label("keyboard deck, lifted off", V(BW / 2 + 1, 5.2, BD + 5), "left"));

  // Where the screen is, for the camera.
  lid.updateMatrixWorld(true);
  const screenC = screen.getWorldPosition(new THREE.Vector3());
  const screenN = V(0, 0, 1).applyQuaternion(lid.quaternion);

  let mode = "valence";
  let lastDraw = -1;
  let lastKey = "";
  return {
    id: "laptop",
    name: "Laptop",
    size: "about 35 cm",
    group: g,
    // The board spans ~46 x 32; the tray's inside is 33 x 22.
    slot: { pos: V(0, 0.75, 0.6), scale: 0.64 },
    view: { dir: V(0.55, 0.75, 1.2), dist: 6.2, center: V(0, 6, 4) },
    focus: {
      valence: { center: screenC, dir: screenN.clone().add(V(0.18, 0.1, 0)), dist: 5.4 },
      moodmate: { center: screenC, dir: screenN.clone().add(V(-0.12, 0.08, 0)), dist: 5.4 },
    },
    update(dt, t, { stop, z }) {
      if (stop?.focus === "moodmate") mode = "moodmate";
      else if (stop?.focus === "valence") mode = "valence";
      if (Math.abs(z - 5) > 0.7) return; // too far away to read it
      if (t - lastDraw < 1 / 12) return;
      // Redraw (and re-upload) only when what's on screen would change.
      const key = mode === "valence" ? `v${Math.floor((t * 22) % (CHARS + 60))}${Math.floor(t * 2.5) % 2}` : `m${Math.floor((t % 16) / 3.4)}${t % 16 < 8}`;
      if (key === lastKey) return;
      lastKey = key;
      lastDraw = t;
      if (mode === "valence") drawValence(ctx, 1280, 820, t);
      else drawMoodMate(ctx, 1280, 820, t);
      tex.needsUpdate = true;
    },
  };
}
