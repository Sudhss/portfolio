import { stops, tour, edges, person, ratings } from "./content.js";

/* The page around the zoom. One live panel: when the tour moves, the panel
 * morphs into the next stop's text (every string scrambles and resolves
 * into its new words, and the panel reshapes to its new height) instead of
 * fading. Arrow keys, a scroll gesture or a swipe move one stop. Without
 * WebGL, every stop is simply shown in order. */

const byId = Object.fromEntries(stops.map((s) => [s.id, s]));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (v) => esc(typeof v === "function" ? v() : v);
const ext = (href, label, cls = "") => `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${label}</a>`;
const pad = (n) => String(n).padStart(2, "0");

let live = structuredClone(ratings);

function peaks(r) {
  return `<div class="peak"><span class="k">LeetCode</span><b>${r.leetcode.rating}</b><span>${esc(r.leetcode.badge)}, top ${r.leetcode.top}%<br>${r.leetcode.solved} solved</span>${ext(person.links.leetcode, "profile")}</div>
<div class="peak"><span class="k">CodeChef</span><b>${r.codechef.rating}</b><span>${r.codechef.stars} star, peak ${r.codechef.peak}<br>${r.codechef.solved} solved</span>${ext(person.links.codechef, "profile")}</div>
<div class="peak"><span class="k">Codeforces</span><b>${r.codeforces.rating}</b><span>${esc(r.codeforces.rank)}<br>peak ${r.codeforces.peak}</span>${ext(person.links.codeforces, "profile")}</div>`;
}

function section(s) {
  let h = "";
  if (s.body) h += s.body.map((p) => `<p>${text(p)}</p>`).join("");
  if (s.groups) h += `<dl class="groups">${s.groups.map(([g, items]) => `<dt>${esc(g)}</dt><dd>${items.map(esc).join(", ")}</dd>`).join("")}</dl>`;
  if (s.entries) {
    h += s.entries
      .map(
        (e) => `<div class="entry"><h3>${esc(e.head)}</h3>
${e.where || e.when ? `<p class="meta">${e.href ? ext(e.href, esc(e.where)) : esc(e.where || "")}${e.where && e.when ? ", " : ""}${esc(e.when || "")}</p>` : ""}
${e.text ? `<p>${esc(e.text)}</p>` : ""}${e.points ? `<ul>${e.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}${e.note ? `<p class="note">${esc(e.note)}</p>` : ""}</div>`
      )
      .join("");
  }
  if (s.project) {
    const p = s.project;
    h += `<p class="lede">${esc(p.line)}</p>${p.detail ? `<p class="note">${esc(p.detail)}</p>` : ""}<p class="tech">${p.tech.map(esc).join(" / ")}</p>
<p class="actions">${p.site ? ext(p.site, "Open the live site", "btn") : ""}${ext(p.repo, "Read the source", p.site ? "btn ghost" : "btn")}</p>`;
  }
  if (s.list) h += `<ul class="list">${s.list.map(([t, d, href]) => `<li>${ext(href, esc(t))}<span>${esc(d)}</span></li>`).join("")}</ul>`;
  if (s.cp) h += `<div class="peaks">${peaks(live)}</div>`;
  if (s.contact) {
    h += `<p class="email"><a href="mailto:${person.email}">${person.email}</a></p>
<p class="links">${ext(person.links.github, "GitHub")}${ext(person.links.linkedin, "LinkedIn")}${ext(person.links.instagram, "Instagram")}${ext(person.links.youtube, "YouTube")}${ext(person.resume, "Resume")}</p>
<form class="note-form" id="note-form">
  <div class="row"><label>Name<input name="name" required autocomplete="name" /></label><label>Email<input name="email" type="email" required autocomplete="email" /></label></div>
  <label>Message<textarea name="message" rows="3" required></textarea></label>
  <button class="btn" type="submit">Send</button>
  <p class="form-status" role="status" aria-live="polite"></p>
</form>`;
  }
  return h;
}

function panelInner(t, i, layer) {
  const inc = (t.include || []).map((id) => byId[id]);
  const title = t.title || inc[0]?.title || "";
  const kicker = layer ? `${layer.name}, ${layer.size}` : inc[0]?.kicker || "";
  let h = `<p class="kicker"><span>${pad(i + 1)}</span>${esc(kicker)}</p><h${t.hero ? 1 : 2}>${esc(title)}</h${t.hero ? 1 : 2}>`;
  if (t.body) h += t.body.map((p) => `<p class="lede">${text(p)}</p>`).join("");
  if (t.hero) {
    h += `<p class="actions hero-links">${ext(person.resume, "Resume", "btn")}${ext(person.links.github, "GitHub", "btn ghost")}${ext(person.links.linkedin, "LinkedIn", "btn ghost")}<a class="btn ghost" href="mailto:${person.email}">Email</a></p>`;
  }
  inc.forEach((s, k) => {
    const sub = t.title || k > 0;
    h += `<div class="part">${sub ? `<h3 class="sub">${esc(s.title)}</h3>` : ""}${section(s)}</div>`;
  });
  return h;
}

function wireForm(root) {
  const form = root.querySelector("#note-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = form.querySelector(".form-status");
    const btn = form.querySelector("button");
    btn.disabled = true;
    status.textContent = "Sending...";
    try {
      const res = await fetch(person.form, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = "Sent. I'll write back soon.";
    } catch {
      status.textContent = `That didn't go through. Email me instead: ${person.email}`;
    } finally {
      btn.disabled = false;
    }
  });
}

// Live ratings from the GitHub profile's data.json.
const ratingsReady = fetch(ratings.source)
  .then((r) => (r.ok ? r.json() : null))
  .then((d) => {
    if (!d) return;
    if (d.leetcode) Object.assign(live.leetcode, { rating: d.leetcode.rating, badge: d.leetcode.badge || live.leetcode.badge, top: d.leetcode.topPercent, solved: d.leetcode.solved?.all ?? live.leetcode.solved });
    if (d.codechef) Object.assign(live.codechef, { rating: d.codechef.rating, stars: d.codechef.stars, peak: d.codechef.maxRating, solved: d.codechef.solved ?? live.codechef.solved });
    if (d.codeforces) Object.assign(live.codeforces, { rating: d.codeforces.rating, rank: d.codeforces.rank.replace(/\b\w/g, (c) => c.toUpperCase()), peak: d.codeforces.maxRating });
  })
  .catch(() => {});

/* ---- the morph -------------------------------------------------------- */

const GLYPHS = "abcdefghijklmnopqrstuvwxyz0123456789";
function textNodes(root) {
  const out = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  while (w.nextNode()) out.push(w.currentNode);
  return out;
}

/**
 * Morph `el` into new HTML: old strings are paired with new ones in reading
 * order, and each resolves character by character through scrambled
 * letters, left to right with a little stagger; the panel's height eases
 * from old to new at the same time.
 */
function createMorph(el) {
  let raf = 0;
  return function morph(html, { dur = 900 } = {}) {
    cancelAnimationFrame(raf);
    const before = textNodes(el).map((n) => n.nodeValue);
    const h0 = el.offsetHeight;
    el.innerHTML = html;
    el.scrollTop = 0;
    const nodes = textNodes(el);
    const after = nodes.map((n) => n.nodeValue);
    const h1 = el.scrollHeight > el.clientHeight ? el.clientHeight : el.offsetHeight;
    // Reshape.
    el.style.transition = "none";
    el.style.height = `${h0}px`;
    el.getBoundingClientRect();
    el.style.transition = `height ${dur * 0.7}ms cubic-bezier(.3,.7,.2,1)`;
    el.style.height = `${h1}px`;
    setTimeout(() => (el.style.height = ""), dur * 0.72);
    // Strings: start as the old one, end as the new one.
    const jobs = nodes.map((n, i) => ({ n, from: before[i] || "", to: after[i], delay: Math.min(0.35, i * 0.018) }));
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      for (const j of jobs) {
        const k = Math.max(0, Math.min(1, (p - j.delay) / (1 - j.delay)));
        if (k >= 1) {
          if (j.n.nodeValue !== j.to) j.n.nodeValue = j.to;
          continue;
        }
        const len = Math.round(j.from.length + (j.to.length - j.from.length) * Math.min(1, k * 1.6));
        const done = Math.floor(j.to.length * k * k);
        let s = "";
        for (let c = 0; c < len; c += 1) {
          const target = j.to[c] ?? "";
          if (c < done) s += target;
          else if (target === " " || (!target && j.from[c] === " ")) s += " ";
          else if (c > done + 22 && j.from[c]) s += j.from[c];
          else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        j.n.nodeValue = s;
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  };
}

/* ---- the scale readout ------------------------------------------------- */

// Roughly how many transistors are in view, and how wide the view is,
// interpolated in log space along the zoom. Estimates.
const TRANSISTORS = [1, 80, 4e8, 1.6e10, 1e12, 1.2e12, 4e17, 2e19, 1e22];
const WIDTHS = [6e-8, 2e-6, 3e-3, 2.5e-2, 3.2e-1, 6e-1, 1.2e2, 3e4, 2.6e7];
const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
function logAt(table, z) {
  const i = Math.max(0, Math.min(table.length - 2, Math.floor(z)));
  const k = Math.max(0, Math.min(1, z - i));
  return Math.exp(Math.log(table[i]) + (Math.log(table[i + 1]) - Math.log(table[i])) * k);
}
function sci(v) {
  if (v < 1000) return String(Math.round(v));
  let e = Math.floor(Math.log10(v));
  let m = (v / 10 ** e).toFixed(1);
  if (m === "10.0") {
    m = "1.0";
    e += 1;
  }
  return `${m} × 10${String(e).split("").map((d) => SUP[+d]).join("")}`;
}
function metres(v) {
  for (const [u, n] of [[1e3, "km"], [1, "m"], [1e-2, "cm"], [1e-3, "mm"], [1e-6, "µm"], [1e-9, "nm"]]) {
    if (v < u) continue;
    const m = v / u;
    const e = Math.floor(Math.log10(m));
    return `${m >= 100 ? Math.round(m / 10 ** (e - 1)) * 10 ** (e - 1) : m.toPrecision(2)} ${n}`;
  }
  return `${(v * 1e9).toPrecision(2)} nm`;
}

/* ---- start ------------------------------------------------------------ */

const panelsEl = document.getElementById("panels");

function renderAll(layers) {
  const byName = layers ? Object.fromEntries(layers.map((L) => [L.id, L])) : {};
  panelsEl.innerHTML = tour.map((t, i) => `<article class="panel${t.hero ? " hero" : ""}" id="${t.id}">${panelInner(t, i, byName[t.layer])}</article>`).join("");
  wireForm(panelsEl);
}

function webglOK() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

async function start() {
  const { buildLayers } = await import("./zoom/layers/index.js");
  const { createEngine } = await import("./zoom/engine.js");
  await document.fonts.ready;
  const layers = buildLayers();
  const byName = Object.fromEntries(layers.map((L) => [L.id, L]));
  const index = Object.fromEntries(layers.map((L, i) => [L.id, i]));
  const stopsZ = tour.map((t) => ({ id: t.id, z: index[t.layer], focus: t.focus }));

  // The words first, so there's something to read while the shaders compile.
  const panel = document.createElement("article");
  panel.className = "panel live";
  panelsEl.innerHTML = "";
  panelsEl.appendChild(panel);
  document.body.classList.add("live");
  const morph = createMorph(panel);
  const html = (i) => panelInner(tour[i], i, byName[tour[i].layer]);
  function show(i) {
    panel.classList.toggle("hero", !!tour[i].hero);
    morph(html(i));
    wireForm(panel);
  }
  show(0);
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));

  const engine = createEngine(document.getElementById("world"), document.getElementById("labels"), layers, stopsZ);
  if (import.meta.env.DEV) window.__zoom = { engine, layers };
  ratingsReady.then(() => engine.stop === tour.findIndex((t) => t.id === "cp") && show(engine.stop));

  const count = document.getElementById("count");
  const prompt = document.getElementById("prompt");
  const edge = document.getElementById("edge");
  let edgeTimer = 0;
  let moved = false;
  let keysUsed = false;

  function say(msg) {
    edge.textContent = msg;
    edge.classList.add("on");
    clearTimeout(edgeTimer);
    edgeTimer = setTimeout(() => edge.classList.remove("on"), 4200);
  }
  function step(d, via) {
    const next = engine.stop + d;
    if (next < 0) return say(edges.start);
    if (next >= tour.length) return say(edges.end);
    engine.go(next);
    show(next);
    count.textContent = `${pad(next + 1)} / ${pad(tour.length)}`;
    if (via === "keys") keysUsed = true;
    if (!moved) {
      moved = true;
      // Scrolled instead of using the keys: keep a small reminder that the keys are smoother.
      if (via === "keys") prompt.classList.add("gone");
      else prompt.classList.add("small");
    } else if (keysUsed) prompt.classList.add("gone");
    if (next === tour.length - 1) setTimeout(() => engine.stop === next && say(edges.end), 2600);
  }

  // Wheel: one gesture, one stop. A gesture ends after 160 ms of quiet, so a
  // trackpad's inertia can't skip stops; a long panel scrolls itself first.
  let acc = 0;
  let lastWheel = 0;
  let armed = true;
  addEventListener(
    "wheel",
    (e) => {
      const p = e.target.closest?.(".panel");
      if (p && p.scrollHeight > p.clientHeight + 2) {
        const atTop = p.scrollTop <= 0;
        const atEnd = p.scrollTop + p.clientHeight >= p.scrollHeight - 2;
        if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atTop)) return;
      }
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 160) {
        armed = true;
        acc = 0;
      }
      lastWheel = now;
      if (!armed) return;
      acc += e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      if (Math.abs(acc) > 24) {
        step(Math.sign(acc), "wheel");
        armed = false;
      }
    },
    { passive: false }
  );
  let lastKey = 0;
  addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea")) return;
    const fwd = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key);
    const back = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
    if (!fwd && !back) return;
    e.preventDefault();
    if (e.repeat && performance.now() - lastKey < 450) return;
    lastKey = performance.now();
    step(fwd ? 1 : -1, "keys");
  });
  let ty = null;
  addEventListener("touchstart", (e) => (ty = e.touches.length === 1 && !e.target.closest(".panel") ? e.touches[0].clientY : null), { passive: true });
  addEventListener(
    "touchend",
    (e) => {
      if (ty == null) return;
      const dy = ty - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 45) step(Math.sign(dy), "touch");
      ty = null;
    },
    { passive: true }
  );
  document.querySelectorAll(".ctl").forEach((b) => b.addEventListener("click", () => step(Number(b.dataset.dir), "keys")));
  document.addEventListener("visibilitychange", () => engine.pause(document.hidden));

  // The readout follows the camera; written only when it changes.
  const hudCount = document.getElementById("hud-count");
  const hudSize = document.getElementById("hud-size");
  let last = "";
  (function hud() {
    const z = engine.z;
    const c = sci(logAt(TRANSISTORS, z));
    const s = metres(logAt(WIDTHS, z));
    if (c + s !== last) {
      last = c + s;
      hudCount.textContent = c;
      hudSize.textContent = s;
    }
    requestAnimationFrame(hud);
  })();
}

if (webglOK()) {
  start().catch((e) => {
    console.error(e);
    renderAll(null);
    document.body.classList.remove("live");
    document.body.classList.add("still");
  });
} else {
  renderAll(null);
  document.body.classList.add("still");
}
