// Figure 4.1 of the FAQ (card 4, mass shell), the version that can be turned: the hyperboloid E^2 - p_x^2 - p_y^2 = m^2 and the sphere of the three-momenta at a fixed energy.
// The drawing follows the TikZ figure "OnShellFigures" of the author (RevisionOfScatteringTheory.tex), but both panels are three-dimensional scenes in an orthographic view
// that is redrawn when the figure is dragged (each panel has its own view), and that can turn slowly by itself (the button below the panels). A double click on a panel
// gives back the starting view (the same view as in figures_frames.js: z up, x towards the viewer and to the left, y to the right). No numerical values are shown.
// The static version of 3 November 2026 is kept in figures_shell_static.js; SHELL_INTERACTIVE in figures.js chooses between the two.
import { h } from '../../app/common.js';
import { canvas, svgEl, f, INK, GUIDE, ACCENT, DEG } from './figure_kit.js';

const W = 290, S = 105;                                                   // the size of a panel (pixels of the drawing) and the pixels per unit
const AZ0 = 32, EL0 = 18;                                                 // the starting view in degrees
const SPIN = 22;                                                          // degrees per second of the slow turn
const range = (from, to, n) => Array.from({ length: n+1 }, (_, i) => from+(to-from)*i/n);
const dot3 = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

/** A panel with a scene that can be turned. `build(api, view)` draws the scene with api.P (a point of the scene on the drawing), api.poly, api.line, api.fill and api.text; the scene is
 *  drawn again whenever the view changes. `center` is the point about which the scene turns. Returns { root, render, view, state }. */
function turnable(tag, center, build) {
  const c = canvas(W, W, 360);
  c.root.classList.add('turnable');
  const view = { az: AZ0, el: EL0 }, state = { dragging: false };
  const labels = new Map();
  c.label(6, 14, tag, { align: 'left', color: INK });                    // fixed texts are drawn once
  const render = () => {
    [...c.svg.children].filter(e => e.tagName !== 'defs').forEach(e => e.remove());
    const az = view.az*DEG, el = view.el*DEG;
    const right = [-Math.sin(az), Math.cos(az), 0], up = [-Math.sin(el)*Math.cos(az), -Math.sin(el)*Math.sin(az), Math.cos(el)];
    const P = (x, y, z) => { const q = [x-center[0], y-center[1], z-center[2]]; return { x: W/2+S*dot3(q, right), y: W/2-S*dot3(q, up) }; };
    const api = {
      P,
      poly: (pts, o) => c.path(pts.map(p => P(...p)), o),
      line: (a, b, o) => c.line(P(...a), P(...b), o),
      fill: (pts, { color = INK, opacity = .06 } = {}) => svgEl('path', { d: pts.map((p, i) => { const q = P(...p); return `${i ? 'L' : 'M'}${f(q.x)} ${f(q.y)}`; }).join('')+'Z', fill: color, 'fill-opacity': opacity, stroke: 'none' }, c.svg),
      cross: p => c.cross(P(...p)),
      /** A text at an unchanging place of the drawing (pixels), made once. */
      fixed: (key, x, y, tex, o = {}) => { if (!labels.has(key)) labels.set(key, c.label(x, y, tex, { align: 'left', ...o })); },
      /** A text at the point p of the scene, moved by (dx, dy) pixels; `away` moves it by that many pixels away from the middle of the drawing instead. */
      text: (key, p, tex, { dx = 0, dy = 0, away = 0, color = null } = {}) => {
        const q = P(...p), mx = q.x-W/2, my = q.y-W/2, n = Math.hypot(mx, my) || 1;
        const x = q.x+dx+away*mx/n, y = q.y+dy+away*my/n;
        let node = labels.get(key);
        if (!node) { node = c.label(x, y, tex, { color }); labels.set(key, node); }
        node.style.left = `${f(x/W*100)}%`; node.style.top = `${f(y/W*100)}%`;
      }
    };
    build(api);
  };
  // dragging turns the scene: to the right about the vertical axis, down about the horizontal axis
  const svg = c.svg;
  let last = null;
  svg.addEventListener('pointerdown', e => { state.dragging = true; last = { x: e.clientX, y: e.clientY }; try { svg.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer has no capture */ } c.root.classList.add('dragging'); });
  svg.addEventListener('pointermove', e => {
    if (!state.dragging) return;
    view.az -= (e.clientX-last.x)*0.6; view.el = Math.max(-89, Math.min(89, view.el+(e.clientY-last.y)*0.5));
    last = { x: e.clientX, y: e.clientY };
    render();
  });
  const stop = () => { state.dragging = false; c.root.classList.remove('dragging'); };
  svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
  svg.addEventListener('dblclick', () => { view.az = AZ0; view.el = EL0; render(); });
  render();
  return { root: c.root, render, view, state };
}

/** The three axes with arrowheads (positive halves) and the negative halves dashed, with their names. */
function axes(api, names, down) {
  const tips = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  tips.forEach((t, k) => { api.line([0, 0, 0], t, { arrow: true }); api.text(`axis${k}`, t, names[k], { away: 13 }); });
  api.line([0, 0, 0], [-1, 0, 0], { dash: true, width: 1.2 }); api.line([0, 0, 0], [0, -1, 0], { dash: true, width: 1.2 }); api.line([0, 0, 0], [0, 0, -down], { dash: true, width: 1.2 });
}

/** The vector from the origin to the point v with its shadow in the plane of the first two axes (a grey arrow, with a dashed line from the tip down to the tip of the shadow) and the
 *  dashed lines of the shadow to the axes. */
function vectorWithShadow(api, v, name) {
  const [x, y, z] = v;
  api.line([x, y, z], [x, y, 0], { dash: true, width: 1.2 });
  api.line([x, y, 0], [x, 0, 0], { dash: true, width: 1.2 });
  api.line([x, y, 0], [0, y, 0], { dash: true, width: 1.2 });
  api.line([0, 0, 0], [x, y, 0], { color: GUIDE, width: 2.2, arrow: true, opacity: .4 });     // the shadow of the arrow, see-through
  api.line([0, 0, 0], v, { color: ACCENT, width: 2.6, arrow: true });
  api.text('vec', v, name, { away: 12, color: ACCENT });
}

/** (a) The mass shell for motion in the xy plane: a hyperboloid around the energy axis. The world axes are p_x, p_y and E. */
const hyperboloid = () => turnable('\\textbf{(a)}\\;p_z=0', [0, 0, 0.5], api => {
  const m2 = 0.05, E = r => Math.sqrt(m2+r*r), mesh = (pts, opacity) => api.poly(pts, { color: INK, width: 1.1, opacity });
  for (let r = 0; r <= 1.0001; r += 0.1) mesh(range(0, 360, 80).map(t => [r*Math.cos(t*DEG), r*Math.sin(t*DEG), E(r)]), .22);        // the rings of equal |p|
  for (let phi = 0; phi < 360; phi += 15) mesh(range(0, 1, 30).map(r => [r*Math.cos(phi*DEG), r*Math.sin(phi*DEG), E(r)]), .22);   // the meridians
  axes(api, ['p_x', 'p_y', 'E'], 0.4);
  const px = 0.3, py = 0.2;
  vectorWithShadow(api, [px, py, E(Math.hypot(px, py))], '\\vec p');
  const rest = [0, 0, Math.sqrt(m2)];                                                          // the particle at rest: the lowest point of the shell
  api.cross(rest);
  api.text('rest', rest, 'm', { dx: 18, dy: 12 });
  api.fixed('shell', 6, 36, 'p^2=m^2', { color: INK });                                       // the same place for every view, below the tag
});

/** (b) The allowed three-momenta at a fixed energy: a sphere. The world axes are p_x, p_y and p_z. */
const sphere = () => turnable('\\textbf{(b)}\\;E\\text{ fixed}', [0, 0, 0], api => {
  const r = 0.7, mesh = (pts, opacity, width = 1.1) => api.poly(pts, { color: INK, width, opacity });
  const on = (lat, lon) => [r*Math.cos(lat*DEG)*Math.cos(lon*DEG), r*Math.cos(lat*DEG)*Math.sin(lon*DEG), r*Math.sin(lat*DEG)];
  api.fill(range(0, 360, 120).map(t => [r*Math.cos(t*DEG), r*Math.sin(t*DEG), 0]), { color: INK, opacity: .08 });                // the circle in the plane of p_x and p_y
  mesh(range(0, 360, 160).map(t => [r*Math.cos(t*DEG), r*Math.sin(t*DEG), 0]), .22);                                           // the three great circles
  mesh(range(0, 360, 160).map(t => [r*Math.cos(t*DEG), 0, r*Math.sin(t*DEG)]), .22);
  mesh(range(0, 360, 160).map(t => [0, r*Math.cos(t*DEG), r*Math.sin(t*DEG)]), .22);
  for (let z = -0.6; z <= 0.6001; z += 0.2) {                                                                                   // the circles of latitude
    const rh = Math.sqrt(r*r-z*z);
    mesh(range(0, 360, 160).map(t => [rh*Math.cos(t*DEG), rh*Math.sin(t*DEG), z]), .14, 1);
  }
  for (let lon = 0; lon < 360; lon += 30) mesh(range(-90, 90, 100).map(t => on(t, lon)), .14, 1);                             // the meridians
  axes(api, ['p_x', 'p_y', 'p_z'], 1);
  const v = [0.3873, 0.5, 0.3];
  vectorWithShadow(api, v, '\\vec p');
  api.fixed('radius', 6, 36, '\\lvert\\vec p\\rvert=\\sqrt{E^2-m^2}', { color: INK });
});

/** Figure 4.1: the two panels, a button that turns both slowly, and a hint. */
export function figure41() {
  const panels = [hyperboloid(), sphere()];
  const note = h('span', { class: 'faq-turn-note', text: 'Drag a panel to turn it, double-click to go back to the starting view.' });
  let spinning = false, t0 = 0;
  const tick = now => {
    if (!spinning) return;
    const dt = Math.min(0.1, (now-t0)/1000); t0 = now;
    panels.forEach(p => { if (!p.state.dragging) { p.view.az -= SPIN*dt; p.render(); } });
    requestAnimationFrame(tick);
  };
  const button = h('button', { type: 'button', class: 'faq-turn-button', text: 'Turn slowly', 'aria-pressed': 'false',
    onclick: () => { spinning = !spinning; button.setAttribute('aria-pressed', String(spinning)); button.textContent = spinning ? 'Stop turning' : 'Turn slowly'; if (spinning) { t0 = performance.now(); requestAnimationFrame(tick); } } });
  return h('div', { class: 'faq-turnable' }, [h('div', { class: 'faq-grid' }, panels.map(p => p.root)), h('div', { class: 'faq-turn-controls' }, [button, note])]);
}
