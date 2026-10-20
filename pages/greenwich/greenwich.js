// Page "Greenwich convention": the root axes of the rest frame of the mother 0, shown on a sphere of directions.
// The sphere carries a pale globe that is attached to the root axes. The Python core (alignment.greenwich) supplies the
// Greenwich angle chi and the momenta; the browser only draws and turns the globe by the fraction t*chi.
//
// Coordinates: world axes are the axes x', y', z after the root rotations and the boost (before Rz(-chi)). The momenta
// and the sphere's poles stay fixed; the globe and the root axes x, y turn by +chi about z, which is the same as
// expressing the momenta in the new axes by Rz(-chi).
import { LAND } from '../../render/world.js';
import { h, sym, mt, figureLabelPx, state, up, named } from '../../app/common.js';

const NS = 'http://www.w3.org/2000/svg';
const FONT = '"STIX Two Text","Latin Modern Roman",Georgia,serif';
const TEAL = '#0F7C8F', GREY = '#7C8A92', PURPLE = '#766094', RIM = '#9FB0B8', INK = '#26333C', LAND_COLOR = '#5A7D8C';
const VIEWBOX = [-1.33, -1.33, 2.66, 2.66];
const AXIS = 1.14;                                   // length of every axis, in units of the sphere radius
const SECONDS = 3.2;                                 // duration of the rotation
const GREENWICH_LAT = 51.48*Math.PI/180;
const smooth = x => { const t = Math.min(1, Math.max(0, x)); return t*t*(3-2*t); };
const r4 = x => Math.round(x*1e4)/1e4;
const el = (tag, attrs = {}, parent = null, text = null) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (text !== null) e.textContent = text;
  if (parent) parent.append(e);
  return e;
};
const escapeText = s => s.replace(/[_^{}\\~]/g, m => '\\'+m);
const bare = label => label.replace(/^\((.*)\)$/, '$1');

// ------------------------------------------------------------------ vectors and camera
const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const unit = a => { const n = Math.hypot(...a); return a.map(x => x/n); };
const rotz = (p, a) => { const c = Math.cos(a), s = Math.sin(a); return [c*p[0]-s*p[1], s*p[0]+c*p[1], p[2]]; };
// A camera is three rows (right, up, towards the viewer), each given in world coordinates.
const obliqueCamera = () => {
  const az = 20*Math.PI/180, el_ = 24*Math.PI/180, c = [Math.cos(el_)*Math.cos(az), Math.cos(el_)*Math.sin(az), Math.sin(el_)];
  const right = unit(cross([0, 0, 1], c));
  return [right, cross(c, right), c];
};
const topCamera = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];             // view along -z: x to the right, y up
const toCam = (M, p) => [dot(M[0], p), dot(M[1], p), dot(M[2], p)];
const mulRows = (A, B) => A.map(r => [0, 1, 2].map(j => r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
function rotateCamera(M, dyaw, dpitch) {
  const cy = Math.cos(dyaw), sy = Math.sin(dyaw), cx = Math.cos(dpitch), sx = Math.sin(dpitch);
  const N = mulRows([[1, 0, 0], [0, cx, -sx], [0, sx, cx]], mulRows([[cy, 0, sy], [0, 1, 0], [-sy, 0, cy]], M));
  const a = unit(N[0]), b = unit(N[1].map((x, i) => x-dot(N[1], a)*a[i]));
  return [a, b, cross(a, b)];
}

// ------------------------------------------------------------------ geometry on the sphere
/** Polyline in camera coordinates -> {front, back}: the parts with depth >= 0 and < 0, cut exactly at the horizon. */
function splitByDepth(points) {
  const front = [], back = [];
  let cur = null, curFront = null;
  for (let i = 0; i < points.length; i++) {
    const p = points[i], f = p[2] >= 0;
    if (cur === null) { cur = [p]; curFront = f; (f ? front : back).push(cur); continue; }
    if (f !== curFront) {
      const q = points[i-1], t = q[2]/(q[2]-p[2]), c = [q[0]+(p[0]-q[0])*t, q[1]+(p[1]-q[1])*t, 0];
      cur.push(c); cur = [c]; curFront = f; (f ? front : back).push(cur);
    }
    cur.push(p);
  }
  return { front, back };
}
const pathOf = poly => 'M'+poly.map(p => `${r4(p[0])} ${r4(-p[1])}`).join('L');
const sample = (n, from, to, f) => Array.from({ length: n+1 }, (_, k) => f(from+(to-from)*k/n));

// Land outlines as unit vectors in globe coordinates (x towards longitude 0 on the equator, z towards the north pole),
// with every edge subdivided along its great circle so that it follows the surface of the sphere.
const GLOBE_LAND = LAND.map(flat => {
  const pts = [];
  for (let i = 0; i < flat.length; i += 2) {
    const lon = flat[i]*Math.PI/180, lat = flat[i+1]*Math.PI/180;
    pts.push([Math.cos(lat)*Math.cos(lon), Math.cos(lat)*Math.sin(lon), Math.sin(lat)]);
  }
  const ring = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i+1) % pts.length], d = Math.acos(Math.min(1, Math.max(-1, dot(a, b))));
    const n = Math.max(1, Math.ceil(d/(2*Math.PI/180)));
    for (let k = 0; k < n; k++) {
      if (d < 1e-9) { ring.push(a); break; }
      const f = k/n, wa = Math.sin((1-f)*d)/Math.sin(d), wb = Math.sin(f*d)/Math.sin(d);
      ring.push([wa*a[0]+wb*b[0], wa*a[1]+wb*b[1], wa*a[2]+wb*b[2]]);
    }
  }
  return ring;
});

/** Fills one ring (camera coordinates) inside the disc of the sphere: the visible part is kept, and wherever the ring
 *  disappears behind the horizon the outline follows the rim of the disc (the shorter way) to the point where it returns. */
function clipRing(ring) {
  const start = ring.findIndex(p => p[2] >= 0);
  if (start < 0) return '';
  const seq = ring.slice(start).concat(ring.slice(0, start)), n = seq.length, out = [seq[0]];
  const horizon = (a, b) => { const t = a[2]/(a[2]-b[2]), x = a[0]+(b[0]-a[0])*t, y = a[1]+(b[1]-a[1])*t, l = Math.hypot(x, y) || 1; return [x/l, y/l, 0]; };
  let exitPoint = null;
  for (let i = 0; i < n; i++) {
    const a = seq[i], b = seq[(i+1) % n], av = a[2] >= 0, bv = b[2] >= 0, closing = i === n-1;
    if (av && bv) { if (!closing) out.push(b); }
    else if (av) { exitPoint = horizon(a, b); out.push(exitPoint); }
    else if (bv) {
      const enter = horizon(a, b);
      let a1 = Math.atan2(exitPoint[1], exitPoint[0]), da = Math.atan2(enter[1], enter[0])-a1;
      while (da > Math.PI) da -= 2*Math.PI;
      while (da <= -Math.PI) da += 2*Math.PI;
      const steps = Math.max(1, Math.ceil(Math.abs(da)/(4*Math.PI/180)));
      for (let k = 1; k < steps; k++) out.push([Math.cos(a1+da*k/steps), Math.sin(a1+da*k/steps), 0]);
      out.push(enter);
      if (!closing) out.push(b);
    }
  }
  return pathOf(out)+'Z';
}

// ------------------------------------------------------------------ the panel
export function buildGreenwichPanel(payload) {
  const data = payload.greenwich;
  const vectors = data.vectors;
  const chi = data.chi, defined = data.defined;
  const ref = vectors[0], dec = vectors.find(v => v.role === 'decay');
  const pmax = Math.max(...vectors.map(v => Math.hypot(v.preliminary[0], v.preliminary[1], v.pz)), 1e-12);
  const scale = .92/pmax;                                          // momentum -> drawing units
  const run = { t: 0, frame: 0 };
  const cam = { M: obliqueCamera(), name: 'oblique' };
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const svg = el('svg', { class: 'greenwich-svg', viewBox: VIEWBOX.join(' '), role: 'img', tabindex: 0, preserveAspectRatio: 'xMidYMid meet',
                          'aria-label': 'Sphere of directions in the rest frame of the mother with the root axes before and after the Greenwich rotation' });
  let fs = .1;                                       // label size in drawing units: the same pixel size as in the other figures
  const readout = h('div', { class: 'greenwich-readout' });
  const caption = h('p', { class: 'greenwich-caption' });

  // ---------------------------------------------------------------- drawing
  const arrowHead = (parent, x1, y1, x2, y2, color, opacity) => {
    const dx = x2-x1, dy = y2-y1, len = Math.hypot(dx, dy);
    if (len < .07) return;
    const ux = dx/len, uy = dy/len, hl = .085, hw = .034, bx = x2-hl*ux, by = y2-hl*uy;
    el('path', { d: `M${r4(x2)} ${r4(y2)}L${r4(bx-hw*uy)} ${r4(by+hw*ux)}L${r4(bx+hw*uy)} ${r4(by-hw*ux)}Z`, fill: color, 'fill-opacity': opacity }, parent);
  };
  /** Arrow from the centre to a point in camera coordinates (y up). An arrow along the line of sight shows as a circle with a dot or a cross. */
  const arrow = (parent, tip, color, width, dash, opacity) => {
    const x = tip[0], y = -tip[1];
    if (Math.hypot(x, y) < .05) {
      el('circle', { cx: 0, cy: 0, r: .055, fill: tip[2] > 0 ? 'none' : '#fff', stroke: color, 'stroke-width': width, 'stroke-opacity': opacity, 'vector-effect': 'non-scaling-stroke' }, parent);
      if (tip[2] > 0) el('circle', { cx: 0, cy: 0, r: .02, fill: color, 'fill-opacity': opacity }, parent);
      else el('path', { d: 'M-.039 -.039L.039 .039M.039 -.039L-.039 .039', stroke: color, 'stroke-width': width, 'stroke-opacity': opacity, 'vector-effect': 'non-scaling-stroke' }, parent);
      return;
    }
    el('path', { d: `M0 0L${r4(x)} ${r4(y)}`, stroke: color, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-opacity': opacity,
                 fill: 'none', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }, parent);
    arrowHead(parent, 0, 0, x, y, color, opacity);
  };
  const line = (parent, pts, color, width, dash, opacity, extra = {}) => {
    for (const poly of pts) if (poly.length > 1) el('path', { d: pathOf(poly), fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-opacity': opacity,
                                                             'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke', ...extra }, parent);
  };
  const label = (parent, x, y, color, size, anchor, content, opts = {}) => {
    const t = el('text', { x: r4(x), y: r4(-y), 'font-size': size, fill: color, 'text-anchor': anchor, 'font-family': FONT, 'font-style': opts.style || 'normal',
                           'font-weight': opts.weight || 400, 'fill-opacity': opts.opacity ?? 1, stroke: '#fff', 'stroke-width': size*.22, 'stroke-opacity': .9,
                           'paint-order': 'stroke', 'stroke-linejoin': 'round' }, parent);
    for (const [part, kind] of content) el('tspan', kind === 'sub' ? { 'font-size': size*.72, dy: size*.2 } : kind === 'i' ? { 'font-style': 'italic' } : {}, t, part);
    return t;
  };
  const pLabel = (parent, tip, v, opacity, weight) => {
    const x = tip[0], y = tip[1], l = Math.hypot(x, y) || 1, ux = x/l, uy = y/l;
    label(parent, x+ux*.05+(ux < -.25 ? -.01 : .01), y+uy*.06, v.color, fs*1.1, ux < -.25 ? 'end' : ux > .25 ? 'start' : 'middle',
          [['p', 'i'], [bare(v.label), 'sub']], { opacity, weight });
  };

  function draw() {
    fs = figureLabelPx(svg.clientWidth)/((svg.clientWidth || 460)/VIEWBOX[2]);
    const M = cam.M, th = run.t*chi, toC = p => toCam(M, p), onGlobe = p => toC(rotz(p, th));
    const gBack = el('g'), gLand = el('g'), gFront = el('g'), gText = el('g');
    const layer = z => z >= 0 ? gFront : gBack, fade = z => z >= 0 ? 1 : .5;

    // sphere and fixed equator (the xy plane)
    const equator = splitByDepth(sample(120, 0, 2*Math.PI, a => toC([Math.cos(a), Math.sin(a), 0])));
    line(gBack, equator.back, RIM, 1, '3 3', .8);
    line(gFront, equator.front, '#8FA3AD', 1.5, null, .95);

    // the xz plane of the root axes (it contains the zero meridian and turns with them): a faint grey disc, bounded by the rim of the sphere
    el('path', { d: pathOf(sample(120, 0, 2*Math.PI, a => onGlobe([Math.cos(a), 0, Math.sin(a)])))+'Z', fill: '#7F939E', 'fill-opacity': .17, stroke: 'none' }, gFront);

    // land and graticule, attached to the globe
    el('path', { d: GLOBE_LAND.map(ring => clipRing(ring.map(onGlobe))).join(''), fill: LAND_COLOR, 'fill-opacity': .17, 'fill-rule': 'evenodd',
                 stroke: LAND_COLOR, 'stroke-opacity': .5, 'stroke-width': .7, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }, gLand);
    for (let lon = 30; lon < 360; lon += 30) {
      const a = lon*Math.PI/180;
      line(gLand, splitByDepth(sample(60, -Math.PI/2, Math.PI/2, l => onGlobe([Math.cos(l)*Math.cos(a), Math.cos(l)*Math.sin(a), Math.sin(l)]))).front, '#B7C6CD', .8, null, .8);
    }
    for (const lat of [-60, -30, 30, 60]) {
      const l = lat*Math.PI/180;
      line(gLand, splitByDepth(sample(90, 0, 2*Math.PI, a => onGlobe([Math.cos(l)*Math.cos(a), Math.cos(l)*Math.sin(a), Math.sin(l)]))).front, '#B7C6CD', .8, null, .8);
    }

    // meridian of the first daughter of the reference topology (fixed): wide translucent band with a thin line
    if (defined) {
      const phi = Math.atan2(ref.preliminary[1], ref.preliminary[0]);
      const m = splitByDepth(sample(90, -Math.PI/2, Math.PI/2, l => toC([Math.cos(l)*Math.cos(phi), Math.cos(l)*Math.sin(phi), Math.sin(l)])));
      line(gFront, m.front, ref.color, 8, null, .26);
      line(gFront, m.front, ref.color, 1.3, null, .95);
      line(gBack, m.back, ref.color, 6, null, .13);
      line(gBack, m.back, ref.color, 1, '2 3', .6);
    }
    // zero meridian of the globe (turns with it)
    const zero = splitByDepth(sample(90, -Math.PI/2, Math.PI/2, l => onGlobe([Math.cos(l), 0, Math.sin(l)])));
    line(gFront, zero.front, TEAL, 2.4, null, 1);
    line(gBack, zero.back, TEAL, 1.2, '4 3', .55);
    // the observatory
    const obs = onGlobe([Math.cos(GREENWICH_LAT), 0, Math.sin(GREENWICH_LAT)]);
    if (obs[2] > 0) {
      el('circle', { cx: r4(obs[0]), cy: r4(-obs[1]), r: .03, fill: TEAL, stroke: '#fff', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }, gFront);
      label(gText, obs[0]+.045, obs[1]+.05, TEAL, fs*.92, 'start', [['Greenwich', 'i']], { opacity: .9 });
    }

    // angle chi between x' and x, in the equatorial plane
    if (defined && Math.abs(th) > 1e-3) {
      const arc = splitByDepth(sample(40, 0, th, a => toC([.3*Math.cos(a), .3*Math.sin(a), 0])));
      line(gFront, arc.front, PURPLE, 2, null, 1); line(gBack, arc.back, PURPLE, 1.4, null, .5);
      const m = toC([.4*Math.cos(th/2), .4*Math.sin(th/2), 0]);
      label(gText, m[0], m[1]-.03, PURPLE, fs*1.2, 'middle', [[run.t >= .999 ? 'χ' : 'tχ', 'i']], { opacity: fade(m[2]) });
    }

    // axes: x', y' before the rotation, x, y after it, z fixed
    const axes = [[[AXIS, 0, 0], 'x′', GREY, 1.1, '4 4', .9, false], [[0, AXIS, 0], 'y′', GREY, 1.1, '4 4', .9, false],
                  [rotz([AXIS, 0, 0], th), 'x', TEAL, 2.4, null, 1, true], [rotz([0, AXIS, 0], th), 'y', TEAL, 2.4, null, 1, true],
                  [[0, 0, AXIS], 'z', INK, 2, null, 1, true]];
    for (const [v, name, color, width, dash, opacity, strong] of axes) {
      const tip = toC(v), o = fade(tip[2]);
      arrow(layer(tip[2]), tip, color, width, dash, opacity*o);
      if (strong) {                                                                     // the axes go on, dotted, on the opposite side
        const opposite = toC(v.map(x => -x)), oo = fade(opposite[2]);
        line(layer(opposite[2]), [[[0, 0, 0], opposite]], color, 1.4, '1.5 4.5', .75*oo);
      }
      const l = Math.hypot(tip[0], tip[1]), ux = l > .05 ? tip[0]/l : .6, k = l > .05 ? (l+.09)/l : 1;       // a label beyond the tip, or beside the dot of an end-on axis
      label(gText, l > .05 ? tip[0]*k : .1, l > .05 ? tip[1]*k : .1, color, fs*(strong ? 1.45 : 1.15), ux < -.3 ? 'end' : ux > .3 ? 'start' : 'middle', [[name, 'i']], { weight: strong ? 700 : 400, opacity: o });
    }

    // momenta (thick: first daughter of the reference topology; dashed: first daughter of the decay topology; thin: final states)
    const order = { final: 0, decay: 1, reference: 2 };
    for (const v of [...vectors].sort((a, b) => order[a.role]-order[b.role])) {
      const P = [v.preliminary[0]*scale, v.preliminary[1]*scale, v.pz*scale], tip = toC(P), strong = v.role !== 'final', o = fade(tip[2]);
      if (strong && Math.abs(P[2]) > 1e-6) {               // projection onto the xy plane
        const foot = toC([P[0], P[1], 0]);
        line(gFront, [[tip, foot]], v.color, 1.1, '1.5 3.5', .75*o);
        line(gFront, [[[0, 0, 0], foot]], v.color, 1, '4 3', .55*o);
        el('circle', { cx: r4(foot[0]), cy: r4(-foot[1]), r: .017, fill: v.color, 'fill-opacity': .8*o }, gFront);
      }
      arrow(layer(tip[2]), tip, v.color, v.role === 'reference' ? 3 : strong ? 2.6 : 1.5, v.role === 'decay' ? '6 4' : null, (strong ? 1 : .85)*o);
      pLabel(gText, tip, v, o, strong ? 700 : 400);
    }
    el('circle', { cx: 0, cy: 0, r: .022, fill: INK }, gFront);

    const disc = el('circle', { cx: 0, cy: 0, r: 1, fill: '#F5F9FA', stroke: RIM, 'stroke-width': 1.3, 'vector-effect': 'non-scaling-stroke' });
    svg.replaceChildren(el('rect', { x: VIEWBOX[0], y: VIEWBOX[1], width: VIEWBOX[2], height: VIEWBOX[3], fill: '#fff' }), disc, gBack, gLand, gFront, gText);
    updateReadout();
  }

  // ---------------------------------------------------------------- text and readout
  const wrap = a => { while (a > Math.PI) a -= 2*Math.PI; while (a <= -Math.PI) a += 2*Math.PI; return a; };
  const azimuth = (v, rot) => wrap(Math.atan2(v.preliminary[1], v.preliminary[0])-rot);
  function updateReadout() {                                         // no numbers: the picture speaks for itself; only an undefined angle is reported
    readout.replaceChildren(...(defined ? [] : [h('div', { class: 'selection-box' }, mt('The transverse momentum of the first reference daughter vanishes: the Greenwich $x$ axis is not defined for this event, and the preliminary $x$ axis is retained.'))]));
  }
  function updateCaption() {
    caption.replaceChildren(...(cam.name === 'top'
      ? [h('b', {}, mt('Top view: projection onto the $xy$ plane. ')), ...mt('The view runs along the $z$ axis, so each arrow appears as its transverse momentum ($p_x$, $p_y$); the azimuth is the angle from the $x$ axis to this projection. The $z$ components are not visible.')]
      : mt('Oblique view of the sphere of directions in the rest frame of $0_{@{p}}$ (north pole: $+z$). Drag to rotate the view, or choose the top view.')));
    for (const b of viewButtons) b.setAttribute('aria-pressed', String(b.dataset.view === cam.name));
  }
  const setCamera = (M, name) => { cam.M = M; cam.name = name; updateCaption(); draw(); };

  // ---------------------------------------------------------------- animation: one button, always from the beginning
  function stop() { if (run.frame) cancelAnimationFrame(run.frame); run.frame = 0; }
  function start() {
    stop();
    run.t = 0; draw();
    if (reduced || !defined) { run.t = 1; draw(); return; }
    let t0 = null;
    const tick = now => {
      if (t0 === null) t0 = now;                                    // first frame timestamp = start
      const x = Math.min(1, (now-t0)/1000/SECONDS);
      run.t = smooth(x); draw();
      run.frame = x < 1 ? requestAnimationFrame(tick) : 0;
    };
    run.frame = requestAnimationFrame(tick);
  }

  let lastWidth = 0;
  new ResizeObserver(() => { if (svg.clientWidth && Math.abs(svg.clientWidth-lastWidth)/Math.max(lastWidth, 1) > .02) { lastWidth = svg.clientWidth; draw(); } }).observe(svg);

  // ---------------------------------------------------------------- camera control
  let drag = null;
  svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX-drag.x, dy = e.clientY-drag.y; drag = { x: e.clientX, y: e.clientY };
    setCamera(rotateCamera(cam.M, dx*.008, dy*.008), 'free');
  });
  const release = () => { drag = null; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', release); svg.addEventListener('pointercancel', release);
  svg.addEventListener('dblclick', () => setCamera(obliqueCamera(), 'oblique'));
  svg.addEventListener('keydown', e => {
    const k = { ArrowLeft: [-.09, 0], ArrowRight: [.09, 0], ArrowUp: [0, -.09], ArrowDown: [0, .09] }[e.key];
    if (k) { e.preventDefault(); setCamera(rotateCamera(cam.M, k[0], k[1]), 'free'); }
  });
  const viewButtons = [
    h('button', { type: 'button', 'data-view': 'oblique', title: 'Oblique view of the sphere', text: 'Oblique view', onclick: () => setCamera(obliqueCamera(), 'oblique') }),
    h('button', { type: 'button', 'data-view': 'top', title: 'View along the z axis: projection onto the xy plane', onclick: () => setCamera(topCamera(), 'top') }, ['Top view (', ...mt('$xy$'), ' plane)'])];

  // ---------------------------------------------------------------- explanation
  const I = data.reference_label, first = data.reference_first_label;
    const link = (page, text) => h('button', { type: 'button', class: 'link-button', text, onclick: () => state.showPage(page) });
  const nm = label => named(label, label.startsWith('('));                         // a particle 1_p or an intermediate state (1 2)_i
  const bx = markup => h('span', { class: 'selection-inline' }, sym(markup));       // what depends on the event stands in a small box, as on the page Next step
  // the Euler rotations are a prerequisite of this page; they are explained as a foldout of the page "Amplitude construction"
  const prerequisite = h('p', { class: 'small prerequisite-note' }, ['Prerequisite: the Euler rotations, explained on the page ', h('button', { type: 'button', class: 'link-button', text: 'Amplitude construction', onclick: () => state.showEuler() }), '.']);
  const heading3 = (...nodes) => h('h3', {}, nodes);
  const textBlocks = [
    heading3('The problem: the axes of the rest frame'),
    h('p', {}, mt('The rest frame of the particle $0_{@{p}}$ is chosen such that its $z$ axis coincides with the direction of motion of $0_{@{p}}$ in the laboratory frame. This choice, however, says nothing about the orientation of the $x$ and $y$ axes of this rest frame; it only fixes the $xy$ plane. Without a further choice, the azimuth $φ$ has no zero.')),
    heading3('An analogy: the zero meridian on Earth'),
    h('p', {}, mt('A similar problem of an unambiguous choice of axes exists on a larger scale in the navigation on Earth: The $z$ axis of the Earth coordinate system is given by the rotation axis of the Earth, which roughly coincides with the axis through the poles of the Earth’s magnetic field.')),
    h('p', {}, mt('To determine an azimuth, however, an unambiguous choice of the $x$ axis is missing. In the reference frame of the Earth this axis can be chosen arbitrarily, because the Earth (to first approximation a sphere) has no further distinguished point that could dictate a choice.')),
    h('p', {}, mt('The International Meridian Conference of 1884 in Washington therefore decided that the zero meridian should pass through the observatory in Greenwich, London.')),
    heading3('The same problem for the particle ', sym('0_{@{p}}')),
    h('p', {}, mt('If we freeze the rest frame of the particle $0_{@{p}}$ in time, it likewise has no distinguished axes from which a zero meridian for the measurement of the azimuth $φ$ could be chosen.')),
    h('p', {}, mt('The situation is different if we look at the same system after the decay: now many axes, that is, momentum directions, are available for such a choice. Like the International Meridian Conference, which also had to decide between competing proposals, we fix the zero meridian arbitrarily.')),
    h('div', { class: 'greenwich-rule' }, [
      heading3('The Greenwich choice'),
      h('p', {}, [h('b', { text: 'The reference topology fixes the Greenwich choice. ' }),
        ...mt('We take the reference particle of the reference decay, here the first daughter '), bx(nm(first)), ...mt(' of the reference topology '), bx(up(I)),
        ...mt(', as the specification of the zero meridian: its momentum is to have only a $z$ and a '), h('b', { text: 'positive' }),
        ...mt(' $x$ component. The $y$ axis follows from the choice of a right-handed coordinate system.')]),
      h('p', {}, mt('It does not matter whether this reference particle is stable or a resonance that decays further. Every further decay chain then takes this “Greenwich choice” as the starting point of its decay parametrisation.')),
      h('p', {}, [...mt('The Greenwich angle $χ$ is the azimuth of '), bx(`p_{${escapeText(bare(first))}}`),
        ...mt(' before this choice; the step $R_z(−χ)$ of the root transformation changes to axes that are turned by $χ$ about $z$ (a coordinate system is parametrised with the negative angle). In the figure the momenta stay, and the axes and the globe turn.')]),
      heading3('Different reference topologies'),
      h('p', {}, mt('The choice belongs to the reference topology. A different reference topology for the same event has, in general, another first daughter and therefore another Greenwich angle.')),
      h('p', {}, mt('The two sets of root axes differ only by a rotation about $z$ by the difference of the two angles: the $z$ axis, the handedness and the physical event do not change, and in the convention used here (third Euler angle zero) the frames further down the decay chain, whose angles are measured in their parent frames, remain the same. Only the azimuths measured in the root frame shift, and the phase convention of the spin states of particle $0$ changes.')),
      h('p', {}, mt('Amplitudes that are added coherently must therefore all be built with the same reference topology, that is, with the same root axes.')),
      h('p', {}, data.same_topology ? mt('In this event the decay topology is the reference topology, so its first daughter lies in the $xz$ plane.')
        : [...mt('The decay topology '), bx(up(data.decay_label)), ...mt(' does not choose its own $x$ axis: its first daughter '), bx(nm(data.decay_first_label)), ...mt(' generally has a nonzero azimuth in these axes. '),
           ...(payload.alignment ? ['The page ', link('next', 'Next step'), ' shows how its helicity frames are compared with those of the reference topology.'] : [])])])];
  const controls = h('div', { class: 'transport-controls greenwich-controls' }, [
    h('button', { type: 'button', class: 'primary-small', disabled: !defined, title: defined ? 'Turn the axes and the globe by χ; each click starts again from the beginning' : 'The Greenwich angle is not defined for this event',
                  text: 'Start animation', onclick: start })]);

  const root = h('div', { class: 'page-body greenwich-box' }, [
    h('h2', {}, ['Greenwich convention: the reference topology ', h('span', { class: 'sym' }, I), ' fixes the root axes']),
    prerequisite,
    h('div', { class: 'next-grid' }, [
      h('div', { class: 'greenwich-text next-text' }, textBlocks),
      h('div', { class: 'next-figure' }, [
        h('div', { class: 'next-fig-main greenwich-figure' }, [svg, h('div', { class: 'toolbar-buttons' }, viewButtons), caption]),
        h('div', { class: 'next-fig-side greenwich-side' }, [controls, readout])])])]);
  updateCaption(); draw();
  return { root, draw, stop };
}
