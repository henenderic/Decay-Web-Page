// Figure 5.1 of the FAQ (card 5, rotations): the same picture from an active and from a passive rotation. (a) The vector v is turned by alpha, the axes stay. (b) The vector stays and
// the axes are turned by -alpha, the inverse rotation: the vector then stands to the new axes as the turned vector in (a) stands to the axes there. Both panels look down the z axis
// onto the xy plane (z points to the viewer, marked by the circle with the dot). The vector v is teal in both panels and what is turned is red: in (a) the vector, in (b) the axes.
// The angles are drawn for the sake of the picture, no numerical value is shown.
import { h } from '../../app/common.js';
import { canvas, INK, GUIDE, ACCENT, PATH_II, DEG } from './figure_kit.js';

const U = 110, ALPHA = 40, V = 25;                              // pixels per unit, the angle of the rotation and the direction of v (degrees)

/** One of the panels; `draw` gets the drawing, the map from (radius, angle in degrees) to pixels, the polyline of an arc and a point moved away from the origin. */
function panel(tag, draw) {
  const W = 290, H = 262, o = { x: 135, y: 142 }, c = canvas(W, H, 360);
  const P = (r, deg) => ({ x: o.x+U*r*Math.cos(deg*DEG), y: o.y-U*r*Math.sin(deg*DEG) });
  const arc = (r, from, to) => Array.from({ length: 21 }, (_, i) => P(r, from+(to-from)*i/20));
  const away = (p, d = 12) => { const dx = p.x-o.x, dy = p.y-o.y, n = Math.hypot(dx, dy); return { x: p.x+dx/n*d, y: p.y+dy/n*d }; };
  c.label(6, H-12, tag, { align: 'left', color: INK });                // the tag stands at the bottom, the axes reach the top
  draw({ c, P, arc, away });
  c.ring(o, 6.5, { color: INK }); c.dot(o, 2.2, INK);                   // the z axis comes out of the page
  c.label(o.x-13, o.y+13, 'z', { color: GUIDE });
  return c.root;
}

/** An axis at the angle `deg` with its name beyond the tip; `dashed` draws it as a thin dashed line without a head (an axis that is not the one in use). */
function axis({ c, P, away }, deg, name, { color = GUIDE, dashed = false } = {}) {
  const tip = P(1.15, deg), l = away(tip, 14);
  c.line(P(0, 0), tip, { color, width: dashed ? 1.2 : color === GUIDE ? 1.5 : 2, dash: dashed, arrow: !dashed });
  c.label(l.x, l.y, name, { color });
}

/** The vector v at the angle `deg` (teal). */
function vector({ c, P, away }, deg) {
  c.line(P(0, 0), P(.9, deg), { color: ACCENT, width: 2.6, arrow: true });
  const l = away(P(.9, deg), 13);
  c.label(l.x+4, l.y, '\\vec v', { color: ACCENT });
}

const active = () => panel('\\textbf{(a)}\\;\\text{active}', ctx => {
  const { c, P, arc, away } = ctx;
  axis(ctx, 0, 'x'); axis(ctx, 90, 'y');
  vector(ctx, V);
  c.line(P(0, 0), P(.9, V+ALPHA), { color: PATH_II, width: 2.6, arrow: true });
  const l = away(P(.9, V+ALPHA), 13);
  c.label(l.x+30, l.y-2, 'R_z(\\alpha)\\vec v', { color: PATH_II });
  c.path(arc(.5, V, V+ALPHA), { color: PATH_II, width: 1.6, arrow: true });
  const a = P(.7, V+ALPHA/2);
  c.label(a.x+3, a.y, '\\alpha', { color: PATH_II });
});

const passive = () => panel('\\textbf{(b)}\\;\\text{passive}', ctx => {
  const { c, P, arc } = ctx;
  axis(ctx, 0, 'x', { dashed: true }); axis(ctx, 90, 'y', { dashed: true });          // the axes before
  axis(ctx, -ALPHA, 'x\'', { color: PATH_II }); axis(ctx, 90-ALPHA, 'y\'', { color: PATH_II });
  [0, 90].forEach(deg => {                                                           // the axes are turned by -alpha
    c.path(arc(.5, deg, deg-ALPHA), { color: PATH_II, width: 1.6, arrow: true });
    const a = P(.74, deg-ALPHA/2); c.label(a.x, a.y, '-\\alpha', { color: PATH_II });
  });
  vector(ctx, V);
});

export const figure51 = () => h('div', { class: 'faq-grid' }, [active(), passive()]);

/** Figure 5.2: the three steps of the Euler rotation, the three sketches of the page "Amplitude construction" (pages/euler/euler.js, which draws them with render/drawing.js).
 *  ctx.euler() gives the figures and the animation of the page that is shown; the animation of card 5 and these sketches follow the same three angles. */
export function figure52(ctx) {
  const euler = ctx.euler();
  const steps = h('div', { class: 'faq-euler-steps' }, euler.figures.map((svg, k) => h('div', { class: 'faq-euler-step' }, [svg, h('div', { class: 'faq-euler-tag', text: `Step ${k+1}` })])));
  new ResizeObserver(() => { if (steps.clientWidth) requestAnimationFrame(() => euler.render()); }).observe(steps);       // the sketches are drawn for the width they have
  return h('div', { class: 'faq-euler-wrap' }, [steps]);                                    // the wrapper lets the style set three columns or one by the width of the figure
}
