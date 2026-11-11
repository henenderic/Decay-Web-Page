// The kit of the drawn figures of the FAQ (figures_frames.js, figures_shell.js): colours, SVG elements and a drawing with KaTeX labels on top. The labels are boxes that lie
// over the drawing and are placed by its coordinates (as in figures.js); lines, paths and arrowheads are part of the drawing itself.
import { h, texNode } from '../../app/common.js';

const NS = 'http://www.w3.org/2000/svg';
export const INK = '#33434B', GUIDE = '#7C8A92', ACCENT = '#0F7C8F', PATH_I = '#2F6DB5', PATH_II = '#C2473B';
export const DEG = Math.PI/180;

export const svgEl = (tag, attrs = {}, parent = null) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  parent?.appendChild(e);
  return e;
};
export const f = x => (Math.round(x*10)/10).toString();

/** A drawing of width x height pixels (its viewBox) in a box of at most maxWidth pixels on the page. Points are { x, y } in the pixels of the drawing (y downwards). */
export function canvas(width, height, maxWidth) {
  const svg = svgEl('svg', { class: 'sketch', viewBox: `0 0 ${width} ${height}`, 'aria-hidden': 'true' });
  const root = h('div', { class: 'faq-canvas', style: `max-width:${maxWidth}px` }, [svg]);
  const defs = svgEl('defs', {}, svg), uid = Math.random().toString(36).slice(2, 8), heads = new Map();
  const head = color => {                                                 // one arrowhead per colour
    if (!heads.has(color)) {
      const id = `h${uid}${heads.size}`;
      const m = svgEl('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerUnits: 'userSpaceOnUse', markerWidth: 10, markerHeight: 10, orient: 'auto' }, defs);
      svgEl('path', { d: 'M0 0L10 5L0 10z', fill: color }, m);
      heads.set(color, id);
    }
    return `url(#${heads.get(color)})`;
  };
  const api = {
    root, svg,
    line(p, q, { color = GUIDE, width = 1.5, dash = false, arrow = false, opacity = null } = {}) {
      svgEl('line', { x1: f(p.x), y1: f(p.y), x2: f(q.x), y2: f(q.y), stroke: color, 'stroke-width': width, 'stroke-dasharray': dash ? '4 3' : null, 'stroke-linecap': 'round', opacity,
                      'marker-end': arrow ? head(color) : null }, svg);
    },
    path(points, { color = ACCENT, width = 1.6, arrow = false, opacity = null } = {}) {
      svgEl('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join(''), fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round',
                      'stroke-opacity': opacity, 'marker-end': arrow ? head(color) : null }, svg);
    },
    ring(p, r = 6, { color = GUIDE, width = 1.5 } = {}) { svgEl('circle', { cx: f(p.x), cy: f(p.y), r, fill: '#FFFFFF', stroke: color, 'stroke-width': width }, svg); },
    dot(p, r = 4, color = ACCENT) { svgEl('circle', { cx: f(p.x), cy: f(p.y), r, fill: color }, svg); },
    cross(p, size = 4.5, { color = INK, width = 1.6 } = {}) {
      api.line({ x: p.x-size, y: p.y-size }, { x: p.x+size, y: p.y+size }, { color, width });
      api.line({ x: p.x-size, y: p.y+size }, { x: p.x+size, y: p.y-size }, { color, width });
    },
    box(x, y, w, hh, { color = INK, width = 1.8 } = {}) { svgEl('rect', { x: f(x-w/2), y: f(y-hh/2), width: w, height: hh, rx: 9, fill: '#FFFFFF', stroke: color, 'stroke-width': width }, svg); },
    label(x, y, tex, { align = 'center', color = null } = {}) {
      const node = h('span', { class: `faq-label ${align}`, style: `left:${f(x/width*100)}%;top:${f(y/height*100)}%${color ? `;color:${color}` : ''}` }, texNode(tex));
      root.append(node);
      return node;
    }
  };
  return api;
}
