// Figures 9.1 and 9.2 of the FAQ (card 9, two-particle systems), after the TikZ figures of the author (RevisionOfScatteringTheory.tex "TwoParticleShell", main.tex "TwoParticlesCMSystem").
// Figure 9.1: the mass shells of two particles for motion along z: (a) and (b) the hyperbola E = sqrt(p_z^2 + m^2) of each particle, (c) the surface E_a + E_b over the two momenta in the
// oblique projection (a, b, c) -> (a + 0.8 s b, c + 0.6 s b), s = 0.3, as in the static figure 4.1 (surfaceStatic). Panel (c) is a scene that can be turned, as figure 4.1 (figures_shell.js):
// dragging turns it, a double click gives back the starting view and a button turns it slowly. PAIR_INTERACTIVE = false gives back the static panel. Figure 9.2: the pair in its rest-frame, the relative momentum and its direction. No numerical values.
import { h } from '../../app/common.js';
import { canvas, svgEl, f, INK, GUIDE, ACCENT, PATH_I, PATH_II, DEG } from './figure_kit.js';
import { turnable, axes, vectorWithShadow, SHELL_SPIN } from './figures_shell.js';

const range = (from, to, n) => Array.from({ length: n+1 }, (_, i) => from+(to-from)*i/n);
const MA = 0.2, MB = 0.4;                                                    // the two masses in the units of the drawing

// ------------------------------------------------------------------ figure 9.1 (a) and (b): the hyperbola of one particle
function hyperbola(tag, momentum, energy, mass, massName, color) {
  const u = 125, W = 250, H = 215, o = { x: 125, y: 172 }, c = canvas(W, H, 360);
  const X = x => o.x+u*x, Y = y => o.y-u*y, P = (x, y) => ({ x: X(x), y: Y(y) });
  c.label(6, 12, tag, { align: 'left', color: INK });
  c.line(P(0, 0), P(1, 0), { arrow: true }); c.line(P(0, 0), P(0, 1), { arrow: true });
  c.line(P(0, 0), P(-1, 0), { dash: true, width: 1.2 }); c.line(P(0, 0), P(0, -0.2), { dash: true, width: 1.2 });
  c.path(range(-0.8, 0.8, 80).map(x => P(x, Math.sqrt(x*x+mass*mass))), { color, width: 1.8, opacity: .6 });
  const px = 0.3, tip = P(px, Math.sqrt(px*px+mass*mass));
  c.line(P(0, 0), tip, { color: ACCENT, width: 2.2, arrow: true });
  c.line(tip, P(px, 0), { dash: true, width: 1.2 });
  c.cross(P(0, mass), 4.5, { color });
  c.label(X(0)-14, Y(mass)+11, massName, { color });
  c.label(X(1)+4, Y(0)+13, momentum, { align: 'right' }); c.label(X(0)-8, Y(1)-3, energy, { align: 'right' });
  return c.root;
}

// ------------------------------------------------------------------ figure 9.1 (c): the energy of the pair over the two momenta
function surfaceStatic() {
  const S = 0.3, u = 125, W = 360, H = 292, o = { x: 168, y: 238 }, c = canvas(W, H, 440);
  const P = (a, b, cc) => ({ x: o.x+u*(a+0.8*S*b), y: o.y-u*(cc+0.6*S*b) });
  const Etot = (pa, pb) => Math.sqrt(pa*pa+MA*MA)+Math.sqrt(pb*pb+MB*MB);               // the surface over (p_b along a, p_a along b)
  c.label(6, 12, '\\textbf{(c)}', { align: 'left', color: INK });
  c.line(P(0, 0, 0), P(1, 0, 0), { arrow: true }); c.line(P(0, 0, 0), P(0, -1, 0), { arrow: true }); c.line(P(0, 0, 0), P(0, 0, 1.55), { arrow: true });
  c.line(P(0, 0, 0), P(-1, 0, 0), { dash: true, width: 1.2 }); c.line(P(0, 0, 0), P(0, 1, 0), { dash: true, width: 1.2 }); c.line(P(0, 0, 0), P(0, 0, -0.2), { dash: true, width: 1.2 });
  const pt = (r, t) => P(r*Math.sin(t*DEG), r*Math.cos(t*DEG), Etot(r*Math.cos(t*DEG), r*Math.sin(t*DEG)));
  for (let r = 0.15; r <= 0.9001; r += 0.15) c.path(range(0, 360, 90).map(t => pt(r, t)), { color: INK, width: 0.9, opacity: .15 });
  for (let t = 0; t < 360; t += 15) c.path(range(0, 0.9, 30).map(r => pt(r, t)), { color: INK, width: 0.9, opacity: .15 });
  // the two single-particle hyperbolas on the surface
  c.path(range(-0.8, 0.8, 80).map(x => P(0, x, Math.sqrt(x*x+MA*MA))), { color: PATH_II, width: 1.8, opacity: .6 });
  c.path(range(-0.8, 0.8, 80).map(x => P(x, 0, Math.sqrt(x*x+MB*MB))), { color: PATH_I, width: 1.8, opacity: .6 });
  // one point of the surface with the projections onto the axes
  const tp = pt(0.7, 120), a = 0.7*Math.sin(120*DEG), b = 0.7*Math.cos(120*DEG);
  c.line(P(0, 0, 0), tp, { color: ACCENT, width: 2.4, arrow: true });
  c.line(tp, P(a, b, 0), { dash: true, width: 1.2 }); c.line(P(a, b, 0), P(a, 0, 0), { dash: true, width: 1.2 }); c.line(P(a, b, 0), P(0, b, 0), { dash: true, width: 1.2 });
  c.cross(P(0, 0, MA), 4.5, { color: PATH_II }); c.cross(P(0, 0, MB), 4.5, { color: PATH_I }); c.cross(P(0, 0, MA+MB), 4.5, { color: INK });
  const e = P(0, 0, 0);
  c.label(P(1, 0, 0).x+6, P(1, 0, 0).y+11, 'p_{b,z}', { align: 'left' }); c.label(P(0, -1, 0).x-8, P(0, -1, 0).y+12, 'p_{a,z}', { align: 'right' });
  c.label(P(0, 0, 1.55).x+8, P(0, 0, 1.55).y-2, 'E_a^{[F]}+E_b^{[F]}', { align: 'left' });
  c.label(P(0, 0, MA).x-12, P(0, 0, MA).y+1, 'm_a', { align: 'right', color: PATH_II }); c.label(P(0, 0, MB).x-12, P(0, 0, MB).y, 'm_b', { align: 'right', color: PATH_I });
  c.label(P(0, 0, MA+MB).x-12, P(0, 0, MA+MB).y-2, 'm_a+m_b', { align: 'right', color: INK });
  return c.root;
}

// ------------------------------------------------------------------ figure 9.1 (c) that can be turned
/** The scene: the world axes are p_{b,z}, p_{a,z} and the energy of the pair. */
const surfaceTurnable = () => turnable('\\textbf{(c)}', [0, 0, 0.7], api => {
  const Etot = (pa, pb) => Math.sqrt(pa*pa+MA*MA)+Math.sqrt(pb*pb+MB*MB);
  const pt = (r, t) => { const pb = r*Math.sin(t*DEG), pa = r*Math.cos(t*DEG); return [pb, pa, Etot(pa, pb)]; };
  const mesh = pts => api.poly(pts, { color: INK, width: 0.9, opacity: .15 });
  for (let r = 0.15; r <= 0.9001; r += 0.15) mesh(range(0, 360, 90).map(t => pt(r, t)));
  for (let t = 0; t < 360; t += 15) mesh(range(0, 0.9, 30).map(r => pt(r, t)));
  axes(api, ['p_{b,z}', 'p_{a,z}', 'E_a^{[F]}+E_b^{[F]}'], 0.2, 1.55);
  api.poly(range(-0.8, 0.8, 80).map(x => [0, x, Math.sqrt(x*x+MA*MA)]), { color: PATH_II, width: 1.8, opacity: .6 });      // the hyperbolas of (a) and (b) on the surface
  api.poly(range(-0.8, 0.8, 80).map(x => [x, 0, Math.sqrt(x*x+MB*MB)]), { color: PATH_I, width: 1.8, opacity: .6 });
  vectorWithShadow(api, pt(0.7, 120), '');
  api.cross([0, 0, MA], { color: PATH_II }); api.cross([0, 0, MB], { color: PATH_I }); api.cross([0, 0, MA+MB], { color: INK });
  api.text('ma', [0, 0, MA], 'm_a', { dx: -26, dy: 8, color: PATH_II }); api.text('mb', [0, 0, MB], 'm_b', { dx: -27, dy: 0, color: PATH_I });
  api.text('mab', [0, 0, MA+MB], 'm_a+m_b', { dx: -42, dy: -8, color: INK });
}, { w: 360, h: 330, s: 112, maxWidth: 440 });

const PAIR_INTERACTIVE = true;

export function figure91() {
  const hyper = [hyperbola('\\textbf{(a)}', 'p_{a,z}', 'E_a^{[F]}', MA, 'm_a', PATH_II), hyperbola('\\textbf{(b)}', 'p_{b,z}', 'E_b^{[F]}', MB, 'm_b', PATH_I)];
  if (!PAIR_INTERACTIVE) return h('div', { class: 'faq-grid' }, [...hyper, h('div', { style: 'grid-column:1 / -1;width:100%;max-width:440px;margin:0 auto' }, [surfaceStatic()])]);
  const panel = surfaceTurnable();
  const note = h('span', { class: 'faq-turn-note', text: 'Drag panel (c) to turn it, double-click to go back to the starting view.' });
  let spinning = false, t0 = 0;
  const tick = now => {
    if (!spinning) return;
    const dt = Math.min(0.1, (now-t0)/1000); t0 = now;
    if (!panel.state.dragging) { panel.view.az -= SHELL_SPIN*dt; panel.render(); }
    requestAnimationFrame(tick);
  };
  const button = h('button', { type: 'button', class: 'faq-turn-button', text: 'Turn slowly', 'aria-pressed': 'false',
    onclick: () => { spinning = !spinning; button.setAttribute('aria-pressed', String(spinning)); button.textContent = spinning ? 'Stop turning' : 'Turn slowly'; if (spinning) { t0 = performance.now(); requestAnimationFrame(tick); } } });
  return h('div', { class: 'faq-turnable' }, [h('div', { class: 'faq-grid' }, [...hyper, h('div', { style: 'grid-column:1 / -1;width:100%;max-width:440px;margin:0 auto' }, [panel.root])]), h('div', { class: 'faq-turn-controls' }, [button, note])]);
}

// ------------------------------------------------------------------ figure 9.2: the pair in its rest-frame
export function figure92() {
  const u = 135, W = 400, H = 305, o = { x: 150, y: 160 }, c = canvas(W, H, 440);
  const P = (x, y) => ({ x: o.x+u*x, y: o.y-u*y });
  const poly = (pts, color, opacity) => svgEl('polygon', { points: pts.map(p => `${f(p.x)},${f(p.y)}`).join(' '), fill: color, 'fill-opacity': opacity, stroke: 'none' }, c.svg);
  poly([P(-0.9, -0.3), P(0.6, -0.3), P(1.8, 0.6), P(0.3, 0.6)], PATH_II, .09);                // the xy plane
  poly([P(-0.2, -0.8), P(0.2, -0.64), P(0.2, 0.8), P(-0.2, 0.64)], ACCENT, .07);              // the plane through the z axis and the relative momentum
  c.line(P(0, 0), P(1, 0), { arrow: true }); c.line(P(0, 0), P(0, 1), { arrow: true }); c.line(P(0, 0), P(0.8, 0.6), { arrow: true });
  c.line(P(0, 0), P(-0.5, 0), { dash: true, width: 1.2 }); c.line(P(0, 0), P(0, -0.5), { dash: true, width: 1.2 }); c.line(P(0, 0), P(-0.4, -0.3), { dash: true, width: 1.2 });
  c.label(P(1, 0).x+10, P(1, 0).y, 'x'); c.label(P(0, 1).x-10, P(0, 1).y-2, 'z'); c.label(P(0.8, 0.6).x+12, P(0.8, 0.6).y, 'y');
  c.line(P(0.2, 0.8), P(0.2, 0.08), { dash: true, width: 1.2 }); c.line(P(0, 0), P(1, 0.4), { dash: true, width: 1.2 });
  c.line(P(0, 0), P(0.2, 0.8), { color: ACCENT, width: 2.8, arrow: true });
  c.line(P(0, 0), P(-0.2, -0.8), { color: PATH_I, width: 2.8, arrow: true });
  c.label(P(0.2, 0.8).x+34, P(0.2, 0.8).y+2, '\\vec q_R', { color: ACCENT }); c.label(P(0.2, 0.8).x-4, P(0.2, 0.8).y-14, 'a_\\mathrm p', { color: ACCENT });
  c.label(P(-0.2, -0.8).x-36, P(-0.2, -0.8).y-2, '-\\vec q_R', { color: PATH_I }); c.label(P(-0.2, -0.8).x+2, P(-0.2, -0.8).y+14, 'b_\\mathrm p', { color: PATH_I });
  // the azimuth in the xy plane and the polar angle against the z axis
  c.path(range(0, 21.8, 20).map(t => P(-0.6+0.9*Math.cos(t*DEG), 0.27*Math.sin(t*DEG))), { color: ACCENT, width: 1.6, arrow: true });
  c.label(P(0.42, 0.06).x, P(0.42, 0.06).y+10, '\\varphi', { color: ACCENT });
  const dirP = { x: 0.2/Math.hypot(0.2, 0.8), y: 0.8/Math.hypot(0.2, 0.8) }, r = 0.32;
  c.path(range(0, 1, 16).map(t => { const a = Math.PI/2*(1-t)+Math.atan2(dirP.y, dirP.x)*t; return P(r*Math.cos(a), r*Math.sin(a)); }), { color: ACCENT, width: 1.6, arrow: true });
  c.label(P(0.1, 0.42).x, P(0.1, 0.42).y-6, '\\vartheta', { color: ACCENT });
  return c.root;
}
