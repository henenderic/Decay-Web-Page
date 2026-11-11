// Figure 6.1 of the FAQ (card 6, rest-frames): the four steps from rest to the direction of flight.
// It draws axes in one view (z up, x towards the viewer and to the left, y to the right, orthographic; the x axis is less foreshortened than in the Euler figures); the labels are KaTeX text in boxes
// that lie over the drawing and are placed by its coordinates (figure_kit.js, as in figures.js). The figure shows no numerical values: the angles are drawn for the sake of the picture.
import { h } from '../../app/common.js';
import { canvas, INK, GUIDE, ACCENT, DEG } from './figure_kit.js';

// ------------------------------------------------------------------ the view and small vector helpers
export const AZ = 32*DEG, EL = 18*DEG;
const RIGHT = [-Math.sin(AZ), Math.cos(AZ), 0];
const UP = [-Math.sin(EL)*Math.cos(AZ), -Math.sin(EL)*Math.sin(AZ), Math.cos(EL)];
export const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const add = (a, b) => a.map((x, i) => x+b[i]);
export const scale = (a, s) => a.map(x => x*s);
export const column = (M, j) => [M[0][j], M[1][j], M[2][j]];
export const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/** The point P of space on the drawing: origin o (pixels), s pixels per unit. */
export const project = (P, o, s) => ({ x: o.x+s*dot(P, RIGHT), y: o.y-s*dot(P, UP) });

/** The three axes of the frame whose axes are the columns of R, from the origin o. `names` puts the labels x, y, z at their ends. */
export function triad(c, o, s, R, { color = GUIDE, width = 1.5, names = true, dash = false, arrow = true, length = 1.15 } = {}) {
  ['x', 'y', 'z'].forEach((name, j) => {
    const tip = project(scale(column(R, j), length), o, s);
    c.line(o, tip, { color, width, dash, arrow });
    if (names) {
      const dx = tip.x-o.x, dy = tip.y-o.y, d = Math.hypot(dx, dy);
      c.label(tip.x+dx/d*10, tip.y+dy/d*10, name, { color });
    }
  });
}

// ------------------------------------------------------------------ figure 6.1
const THETA = 48*DEG, PHI = 58*DEG, LEN = .9;

/** One of the four parts of figure 6.1 (k = 0 ... 3): the particle at rest and after B_z, R_y and R_z. The axes of the starting frame stay in place. */
function stepPanel(k) {
  const W = 260, H = 190, o = { x: 96, y: 132 }, s = 100;
  const c = canvas(W, H, 360);
  const P = a => project(a, o, s);
  triad(c, o, s, I3, { color: GUIDE });
  const tags = ['\\textbf{(a)}\\;\\text{at rest}', '\\textbf{(b)}\\;B_z(\\eta_0)', '\\textbf{(c)}\\;R_y(\\vartheta_0)', '\\textbf{(d)}\\;R_z(\\varphi_0)'];
  c.label(6, 14, tags[k], { align: 'left', color: INK });
  if (k === 0) {
    c.dot(o, 4.5);
    c.label(o.x+10, o.y+20, '(m_0,\\vec 0)', { align: 'left', color: ACCENT });
    return c.root;
  }
  const dir = k === 1 ? [0, 0, 1] : k === 2 ? [Math.sin(THETA), 0, Math.cos(THETA)] : [Math.sin(THETA)*Math.cos(PHI), Math.sin(THETA)*Math.sin(PHI), Math.cos(THETA)];
  const tip3 = scale(dir, LEN), tip = P(tip3);
  const arc = (a, b, r, t0, t1) => Array.from({ length: 25 }, (_, i) => P(add(scale(a, r*Math.cos(t0+(t1-t0)*i/24)), scale(b, r*Math.sin(t0+(t1-t0)*i/24)))));
  const arcLabel = (a, b, r, t, tex) => { const p = P(add(scale(a, r*Math.cos(t)), scale(b, r*Math.sin(t)))); c.label(p.x, p.y, tex, { color: ACCENT }); };
  const ez = [0, 0, 1], ex = [1, 0, 0], ey = [0, 1, 0];
  if (k === 2) {
    c.path(arc(ez, ex, .42, 0, THETA), { arrow: true });
    arcLabel(ez, ex, .6, THETA/2, '\\vartheta_0');
  }
  if (k === 3) {
    const foot = P([tip3[0], tip3[1], 0]), h3 = [Math.cos(PHI), Math.sin(PHI), 0];
    c.line(o, foot, { dash: true }); c.line(foot, tip, { dash: true });
    c.path(arc(ez, h3, .42, 0, THETA), { arrow: true });
    arcLabel(ez, h3, .6, THETA/2, '\\vartheta_0');
    c.path(arc(ex, ey, .5, 0, PHI), { arrow: true });
    arcLabel(ex, ey, .7, PHI/2, '\\varphi_0');
  }
  c.line(o, tip, { color: ACCENT, width: 2.6, arrow: true });
  const away = { x: tip.x-o.x, y: tip.y-o.y }, d = Math.hypot(away.x, away.y);
  c.label(tip.x+away.x/d*13+(k === 1 ? 12 : k === 3 ? 12 : 4), tip.y+away.y/d*13, '\\vec p_0', { color: ACCENT });
  return c.root;
}

export const figure61 = () => h('div', { class: 'faq-grid' }, [0, 1, 2, 3].map(stepPanel));
