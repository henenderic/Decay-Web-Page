// Figure 7.1 of the FAQ (card 7, spin and helicity): the building of a helicity state in three steps. (a) The state at rest with the spin projection m_j = lambda on z. (b) After the
// boost B_z(eta) it moves along z and the spin projection is unchanged. (c) After the rotation R(phi, theta, 0) the momentum and the spin point into the direction (phi, theta), and
// the projection on this direction is still lambda. The view and the axes are those of figure 6.1 (figures_frames.js). The spin is a hollow block arrow (the helicity arrow of the
// author, Vorlagen/Helizitaetspfeil.png), the momentum a thin arrow. The angles are drawn for the sake of the picture, no numerical value is shown.
import { h } from '../../app/common.js';
import { canvas, svgEl, f, INK, GUIDE, ACCENT, PATH_II, DEG } from './figure_kit.js';
import { project, triad, scale, add, I3 } from './figures_frames.js';

const THETA = 48*DEG, PHI = 58*DEG;

/** A hollow block arrow from p to q (pixels): a shaft and a head, white inside, the colour on the outline. */
function blockArrow(c, p, q, { color = PATH_II, shaft = 5.5, head = 12, headLength = 17 } = {}) {
  const dx = q.x-p.x, dy = q.y-p.y, L = Math.hypot(dx, dy), u = { x: dx/L, y: dy/L }, n = { x: -u.y, y: u.x };
  const at = (along, side) => `${f(p.x+u.x*along+n.x*side)},${f(p.y+u.y*along+n.y*side)}`;
  const pts = [at(0, shaft), at(L-headLength, shaft), at(L-headLength, head), at(L, 0), at(L-headLength, -head), at(L-headLength, -shaft), at(0, -shaft)];
  svgEl('polygon', { points: pts.join(' '), fill: '#FFFFFF', stroke: color, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, c.svg);
}

/** One of the three parts (k = 0, 1, 2). */
function panel(k) {
  const W = 290, H = 220, o = { x: 108, y: 150 }, s = 112, c = canvas(W, H, 380);
  const P = a => project(a, o, s);
  triad(c, o, s, I3, { color: GUIDE });
  const tags = ['\\textbf{(a)}\\ \\text{at rest}', '\\textbf{(b)}\\ B_z(\\eta)', '\\textbf{(c)}\\ R(\\varphi,\\vartheta,0)'];
  c.label(6, 14, tags[k], { align: 'left', color: INK });
  const dir = k < 2 ? [0, 0, 1] : [Math.sin(THETA)*Math.cos(PHI), Math.sin(THETA)*Math.sin(PHI), Math.cos(THETA)];
  const tip = P(scale(dir, 0.95)), spinTip = P(scale(dir, 0.62));
  if (k > 0) c.line(o, tip, { color: ACCENT, width: 1.8, arrow: true });
  blockArrow(c, o, spinTip);
  c.dot(o, 3.6, INK);
  const away = { x: spinTip.x-o.x, y: spinTip.y-o.y }, d = Math.hypot(away.x, away.y);
  const lab = (p, text, color) => c.label(p.x+away.x/d*18+14, p.y+away.y/d*18, text, { color, align: 'left' });
  lab(spinTip, k === 0 ? 'm_j=\\lambda' : '\\lambda', PATH_II);
  if (k > 0) c.label(tip.x-16, tip.y+4, '\\vec p', { color: ACCENT });
  if (k === 2) {                                                          // the angles of the direction, as in figure 6.1
    const arc = (a, b, r, t0, t1) => Array.from({ length: 25 }, (_, i) => P(add(scale(a, r*Math.cos(t0+(t1-t0)*i/24)), scale(b, r*Math.sin(t0+(t1-t0)*i/24)))));
    const ez = [0, 0, 1], ex = [1, 0, 0], ey = [0, 1, 0], h3 = [Math.cos(PHI), Math.sin(PHI), 0], foot = P([dir[0]*0.95, dir[1]*0.95, 0]);
    c.line(o, foot, { dash: true }); c.line(foot, P(scale(dir, 0.95)), { dash: true });
    c.path(arc(ez, h3, .36, 0, THETA), { arrow: true });
    c.path(arc(ex, ey, .45, 0, PHI), { arrow: true });
    const lp = (a, b, r, t) => P(add(scale(a, r*Math.cos(t)), scale(b, r*Math.sin(t))));
    const lt = lp(ez, h3, .56, THETA/2), lf = lp(ex, ey, .66, PHI/2);
    c.label(lt.x+4, lt.y-6, '\\vartheta', { color: ACCENT }); c.label(lf.x+2, lf.y+8, '\\varphi', { color: ACCENT });
  }
  return c.root;
}

export const figure71 = () => h('div', { class: 'faq-grid' }, [panel(0), panel(1), h('div', { style: 'grid-column:1 / -1;width:calc(50% - 7px);margin:0 auto' }, [panel(2)])]);
