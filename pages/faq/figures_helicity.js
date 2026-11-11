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
  const W = 290, H = 236, o = { x: 108, y: 166 }, s = 112, c = canvas(W, H, 380);
  const P = a => project(a, o, s);
  triad(c, o, s, I3, { color: GUIDE });
  const tags = ['\\textbf{(a)}\\ \\text{at rest}', '\\textbf{(b)}\\ B_z(\\eta)', '\\textbf{(c)}\\ R(\\varphi,\\vartheta,0)'];
  c.label(6, 14, tags[k], { align: 'left', color: INK });
  const dir = k < 2 ? [0, 0, 1] : [Math.sin(THETA)*Math.cos(PHI), Math.sin(THETA)*Math.sin(PHI), Math.cos(THETA)];
  const tip = P(scale(dir, 0.95));
  const sd = { x: tip.x-o.x, y: tip.y-o.y }, sl = Math.hypot(sd.x, sd.y), u = { x: sd.x/sl, y: sd.y/sl }, side = { x: -u.y, y: u.x };      // the screen direction of the momentum and its normal
  const half = 14, len = 2*half;                                                                                                          // the spin arrow is short and does not scale with the vector
  const centre = k === 0 ? { x: o.x+u.x*(half+4), y: o.y+u.y*(half+4) } : { x: tip.x+side.x*17, y: tip.y+side.y*17 };                    // (a) at the particle, (b) and (c) parallel next to the tip of the momentum
  const spinFrom = { x: centre.x-u.x*half, y: centre.y-u.y*half }, spinTo = { x: centre.x+u.x*half, y: centre.y+u.y*half };
  if (k > 0) c.line(o, tip, { color: ACCENT, width: 1.8, arrow: true });
  blockArrow(c, spinFrom, spinTo, { shaft: 3.4, head: 8, headLength: 11 });
  c.dot(o, 3.6, INK);
  c.label(centre.x+side.x*17+8, centre.y+side.y*17, k === 0 ? 'm_j=\\lambda' : '\\lambda', { color: PATH_II, align: 'left' });
  if (k > 0) c.label(tip.x-(k === 1 ? 16 : 4), tip.y-(k === 1 ? 2 : 16), '\\vec p', { color: ACCENT });
  if (k === 2) {                                                          // the angles of the direction, as in figure 6.1
    const arc = (a, b, r, t0, t1) => Array.from({ length: 25 }, (_, i) => P(add(scale(a, r*Math.cos(t0+(t1-t0)*i/24)), scale(b, r*Math.sin(t0+(t1-t0)*i/24)))));
    const ez = [0, 0, 1], ex = [1, 0, 0], ey = [0, 1, 0], h3 = [Math.cos(PHI), Math.sin(PHI), 0], foot = P([dir[0]*0.95, dir[1]*0.95, 0]);
    c.line(o, foot, { dash: true }); c.line(foot, P(scale(dir, 0.95)), { dash: true });
    c.path(arc(ez, h3, .36, 0, THETA), { arrow: true });
    c.path(arc(ex, ey, .45, 0, PHI), { arrow: true });
    const lp = (a, b, r, t) => P(add(scale(a, r*Math.cos(t)), scale(b, r*Math.sin(t))));
    const lt = lp(ez, h3, .5, THETA/2), lf = lp(ex, ey, .66, PHI/2);
    c.label(lt.x-6, lt.y-4, '\\vartheta', { color: ACCENT }); c.label(lf.x+2, lf.y+8, '\\varphi', { color: ACCENT });
  }
  return c.root;
}

export const figure71 = () => h('div', { class: 'faq-grid' }, [panel(0), panel(1), h('div', { style: 'grid-column:1 / -1;width:calc(50% - 7px);margin:0 auto' }, [panel(2)])]);
