// The STATIC version of figure 4.1 (state of 3 November 2026), kept so that the page can go back to it: set SHELL_INTERACTIVE = false in figures.js. The version that can be turned is figures_shell.js.
// Figure 4.1 of the FAQ (card 4, mass shell): the hyperboloid E^2 - p_x^2 - p_y^2 = m^2 and the sphere of the three-momenta at a fixed energy. The drawing follows the TikZ figure
// "OnShellFigures" of the author (RevisionOfScatteringTheory.tex): both panels use the same oblique projection (a, b, c) -> (a + 0.8 s b, c + 0.6 s b) with s = 0.3, where a is the
// axis to the right, b the axis towards the viewer and c the axis upwards. No numerical values are shown.
import { h } from '../../app/common.js';
import { canvas, INK, GUIDE, ACCENT, DEG } from './figure_kit.js';

const S = 0.3, U = 130;                                           // the shear of the projection and the pixels per unit
const xy = (a, b, c) => ({ x: a+0.8*S*b, y: c+0.6*S*b });         // the point in the units of the drawing (y upwards)
const range = (from, to, n) => Array.from({ length: n+1 }, (_, i) => from+(to-from)*i/n);

/** A panel of 2.2 x 2.2 units; `top` is the height of its upper edge above the origin of the axes. */
function panel(tag, top, draw) {
  const W = Math.round(2.2*U), c = canvas(W, W, 360);
  const o = { x: 1.1*U, y: top*U };
  const P = (a, b, cc) => { const q = xy(a, b, cc); return { x: o.x+U*q.x, y: o.y-U*q.y }; };
  const mesh = (points, opacity, width = 1.1) => c.path(points, { color: INK, width, opacity });
  c.label(6, 14, tag, { align: 'left', color: INK });
  draw(c, P, mesh);
  return c.root;
}

/** The three axes with arrowheads, their negative halves dashed, and the labels. */
function axes(c, P, { names, down }) {
  const tips = [P(1, 0, 0), P(0, -1, 0), P(0, 0, 1)];
  tips.forEach(tip => c.line(P(0, 0, 0), tip, { arrow: true }));
  c.line(P(0, 0, 0), P(-1, 0, 0), { dash: true, width: 1.2 }); c.line(P(0, 0, 0), P(0, 1, 0), { dash: true, width: 1.2 }); c.line(P(0, 0, 0), P(0, 0, -down), { dash: true, width: 1.2 });
  c.label(tips[0].x+13, tips[0].y, names[0]); c.label(tips[1].x-9, tips[1].y+11, names[1]); c.label(tips[2].x, tips[2].y-12, names[2]);
}

/** Dashed projections of the point (a, b, cc) onto the axes. */
function projections(c, P, [a, b, cc]) {
  c.line(P(a, b, cc), P(a, b, 0), { dash: true, width: 1.2 });
  c.line(P(a, b, 0), P(a, 0, 0), { dash: true, width: 1.2 });
  c.line(P(a, b, 0), P(0, b, 0), { dash: true, width: 1.2 });
}

/** (a) The mass shell for motion in the xy plane: a hyperboloid around the energy axis. */
const hyperboloid = () => panel('\\textbf{(a)}\\;p_z=0', 1.5, (c, P, mesh) => {
  const m2 = 0.05, E = r => Math.sqrt(m2+r*r);
  axes(c, P, { names: ['p_y', 'p_x', 'E'], down: 0.4 });
  for (let r = 0; r <= 1.0001; r += 0.1) mesh(range(0, 360, 80).map(t => P(r*Math.cos(t*DEG), r*Math.sin(t*DEG), E(r))), .22);      // the rings of equal |p|
  for (let phi = 0; phi < 360; phi += 15) mesh(range(0, 1, 30).map(r => P(r*Math.cos(phi*DEG), r*Math.sin(phi*DEG), E(r))), .22);       // the meridians
  const py = -0.2, px = -0.3, tip = P(py, px, E(Math.hypot(px, py)));
  projections(c, P, [py, px, E(Math.hypot(px, py))]);
  c.line(P(0, 0, 0), tip, { color: ACCENT, width: 2.6, arrow: true });
  c.label(tip.x-13, tip.y+11, '\\vec p', { color: ACCENT });
  const rest = P(0, 0, Math.sqrt(m2));
  c.cross(rest);
  c.label(rest.x+13, rest.y+10, 'm');
  c.label(P(-0.78, 0, 0.6).x, P(-0.78, 0, 0.6).y, 'p^2=m^2', { color: INK });
});

/** (b) The allowed three-momenta at a fixed energy: a sphere. */
const sphere = () => panel('\\textbf{(b)}\\;E\\text{ fixed}', 1.1, (c, P, mesh) => {
  const r = 0.7;
  axes(c, P, { names: ['p_y', 'p_x', 'p_z'], down: 1 });
  mesh(range(0, 360, 160).map(t => P(r*Math.cos(t*DEG), r*Math.sin(t*DEG), 0)), .22);                                // the three great circles
  mesh(range(0, 360, 160).map(t => P(r*Math.cos(t*DEG), 0, r*Math.sin(t*DEG))), .22);
  mesh(range(0, 360, 160).map(t => P(0, r*Math.cos(t*DEG), r*Math.sin(t*DEG))), .22);
  for (let h3 = -0.6; h3 <= 0.6001; h3 += 0.2) {                                                                       // the circles of latitude
    const rh = Math.sqrt(r*r-h3*h3);
    mesh(range(0, 360, 160).map(t => P(rh*Math.cos(t*DEG), rh*Math.sin(t*DEG), h3)), .14, 1);
  }
  for (let phi = 0; phi < 360; phi += 30) mesh(range(-90, 90, 100).map(t => P(r*Math.cos(phi*DEG)*Math.cos(t*DEG), r*Math.sin(phi*DEG)*Math.cos(t*DEG), r*Math.sin(t*DEG))), .14, 1);
  const v = [-0.5, -0.3873, 0.3], tip = P(...v);
  projections(c, P, v);
  c.line(P(0, 0, 0), tip, { color: ACCENT, width: 2.6, arrow: true });
  c.label(tip.x+12, tip.y-11, '\\vec p', { color: ACCENT });
  // two short pieces of the sphere at the tip, one along the meridian and one across it
  c.path(range(20, 30, 10).map(t => P(-0.791*r*Math.cos(t*DEG), -0.613*r*Math.cos(t*DEG), r*Math.sin(t*DEG))), { color: ACCENT, width: 2.4 });
  c.path(range(350, 360, 10).map(t => P(r*(-0.714*Math.cos(t*DEG)+0.604*Math.sin(t*DEG)), r*(-0.553*Math.cos(t*DEG)-0.786*Math.sin(t*DEG)), r*0.429*Math.cos(t*DEG))), { color: ACCENT, width: 2.4 });
  [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]].forEach(d => c.cross(P(...d.map(x => x*r))));      // where the axes meet the sphere
  c.label(P(-0.6, 0, 0.5).x, P(-0.6, 0, 0.5).y, '\\sqrt{E^2-m^2}', { color: INK });
});

export const figure41 = () => h('div', { class: 'faq-grid' }, [hyperboloid(), sphere()]);
