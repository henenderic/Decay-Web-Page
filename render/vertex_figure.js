// Sketch of a measured event: the primary vertex (the collision, where the mother is produced), the mother that flies a short distance without leaving a track, the secondary
// vertex (its decay) and the tracks of the n final states in the magnetic field of the detector. Charged particles are bent (circular arcs), neutral particles fly straight and leave
// no track in the tracking detector (dashed). The figure follows the style of such sketches in publications of the experiments; it is drawn for this page.
import { diagram } from './blobs.js';

const CHARGED = '#0F7C8F', GREY = '#9AA7AD', DARK = '#33434B', SANS = 'system-ui,sans-serif';
const PV = { x: 70, y: 180 }, SV = { x: 290, y: 152 }, R_IN = 470, R_OUT = 570, SPAN = 15;           // the detector is a ring segment around the primary vertex (degrees above and below the axis)

const at = (r, deg) => ({ x: PV.x+r*Math.cos(deg*Math.PI/180), y: PV.y-r*Math.sin(deg*Math.PI/180) });       // a point of the detector ring, seen from the primary vertex
const arc = (a, b, rho, sweep) => `M${a.x.toFixed(1)} ${a.y.toFixed(1)}A${rho} ${rho} 0 0 ${sweep} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;      // a track in a homogeneous magnetic field is a circular arc

/** n final states; for more than six only five tracks are drawn (the last one is the n-th). */
export function buildVertexFigure(n) {
  const d = diagram(780, 360, 'Sketch of an event: the primary vertex, the mother that flies a short distance, the secondary vertex of its decay and the tracks of the final states in the detector');
  const names = n <= 6 ? Array.from({ length: n }, (_, k) => String(k+1)) : ['1', '2', '3', '4', String(n)];
  const el = d.el, halo = { stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
  // the detector: a ring segment around the primary vertex
  const a0 = at(R_IN, SPAN), a1 = at(R_IN, -SPAN), b0 = at(R_OUT, SPAN), b1 = at(R_OUT, -SPAN);
  el('path', { d: `M${a0.x} ${a0.y}A${R_IN} ${R_IN} 0 0 1 ${a1.x} ${a1.y}L${b1.x} ${b1.y}A${R_OUT} ${R_OUT} 0 0 0 ${b0.x} ${b0.y}Z`, fill: '#E6EBED', stroke: GREY, 'stroke-width': 1.6 }, d.svg);
  el('text', { x: (a0.x+b0.x)/2, y: b0.y-9, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 14, 'font-weight': 600, fill: '#304d59' }, d.svg, 'Detector');

  // tracks of other particles of the collision, from the primary vertex to the detector
  [[12, 0], [8.5, 1], [-3, 0], [-8, 1], [-12, 0]].forEach(([phi, sweep]) => el('path', { d: arc(PV, at(R_OUT, phi), 1600, sweep), fill: 'none', stroke: GREY, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, d.svg));
  // the mother: it leaves no track, it flies from the primary to the secondary vertex
  el('line', { x1: PV.x, y1: PV.y, x2: SV.x, y2: SV.y, stroke: DARK, 'stroke-width': 2.6, 'stroke-dasharray': '7 6' }, d.svg);
  d.name((PV.x+SV.x)/2-4, (PV.y+SV.y)/2-14, '0', 'p');
  // the final states from the secondary vertex to the detector: charged ones bent in both directions, one neutral (straight, dashed)
  const pattern = [1, 0, 0, 1, 0, 1].map((s, k) => [s, [1, 0][k % 2]]);                               // [charged, sweep]
  const charged = [true, true, false, true, true, true];
  names.forEach((nm, k) => {
    const phi = names.length > 1 ? 11-22*k/(names.length-1) : 4, end = at(R_OUT, phi);
    if (!charged[k % charged.length]) {
      el('line', { x1: SV.x, y1: SV.y, x2: end.x, y2: end.y, stroke: DARK, 'stroke-width': 2.2, 'stroke-dasharray': '3 5', 'stroke-linecap': 'round' }, d.svg);
    } else {
      el('path', { d: arc(SV, end, 700, pattern[k % pattern.length][1]), fill: 'none', stroke: CHARGED, 'stroke-width': 2.8, 'stroke-linecap': 'round' }, d.svg);
    }
    d.name(end.x+8, end.y+5, nm, 'p', 'start');
  });
  // the vertices
  for (const [p, text, dx, dy] of [[PV, 'Primary vertex', 6, 40], [SV, 'Secondary vertex', -6, -34]]) {
    el('circle', { cx: p.x, cy: p.y, r: 5.5, fill: DARK }, d.svg);
    el('circle', { cx: p.x, cy: p.y, r: 10, fill: 'none', stroke: DARK, 'stroke-width': 1.6 }, d.svg);
    el('text', { x: p.x+dx, y: p.y+dy, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 14, 'font-weight': 600, fill: '#304d59', ...halo }, d.svg, text);
  }
  // the magnetic field: out of the plane (a circle with a dot)
  el('circle', { cx: 40, cy: 328, r: 9, fill: 'none', stroke: DARK, 'stroke-width': 1.6 }, d.svg);
  el('circle', { cx: 40, cy: 328, r: 2.6, fill: DARK }, d.svg);
  el('text', { x: 58, y: 333, 'font-family': SANS, 'font-size': 13, fill: '#304d59' }, d.svg, 'magnetic field, towards the viewer');
  return d.svg;
}
