// Sketch of a measured event: the primary vertex (the collision, where the mother is produced), the mother that flies a short distance without leaving a track, the secondary
// vertex (its decay) and the tracks of the n final states in the magnetic field of the detector. Charged particles are bent (circular arcs), neutral particles fly straight and leave
// no track in the tracking detector (dashed). The detector is a cut-out of the whole detector (jagged edges above and below). The figure follows the style of such sketches in
// publications of the experiments; it is drawn for this page.
import { diagram } from './blobs.js';

const CHARGED = '#0F7C8F', BACKGROUND = '#D3DADD', FRAME = '#9AA7AD', DARK = '#33434B', SANS = 'system-ui,sans-serif';
const PV = { x: 70, y: 180 }, SV = { x: 290, y: 152 }, R_IN = 470, R_OUT = 570, SPAN = 15;           // the detector is a ring segment around the primary vertex (degrees above and below the axis)

const at = (r, deg) => ({ x: PV.x+r*Math.cos(deg*Math.PI/180), y: PV.y-r*Math.sin(deg*Math.PI/180) });       // a point of the detector ring, seen from the primary vertex
const arc = (a, b, rho, sweep) => `M${a.x.toFixed(1)} ${a.y.toFixed(1)}A${rho} ${rho} 0 0 ${sweep} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;      // a track in a homogeneous magnetic field is a circular arc
/** A jagged line from p to q, as it is drawn for a cut: the points alternate to both sides of the straight line. */
function jagged(p, q, amplitude = 4.5, steps = 9) {
  const dx = q.x-p.x, dy = q.y-p.y, len = Math.hypot(dx, dy), nx = -dy/len, ny = dx/len;
  let out = '';
  for (let k = 1; k < steps; k++) { const t = k/steps, off = (k % 2 ? 1 : -1)*amplitude; out += `L${(p.x+dx*t+nx*off).toFixed(1)} ${(p.y+dy*t+ny*off).toFixed(1)}`; }
  return out+`L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
}

/** n final states; for more than six only five tracks are drawn (the last one is the n-th). */
export function buildVertexFigure(n) {
  const d = diagram(780, 360, 'Sketch of an event: the primary vertex, the mother that flies a short distance, the secondary vertex of its decay and the tracks of the final states in the detector');
  const names = n <= 6 ? Array.from({ length: n }, (_, k) => String(k+1)) : ['1', '2', '3', '4', String(n)];
  const el = d.el, halo = { stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
  // the detector: a ring segment around the primary vertex; its edges above and below are jagged, since the detector goes on
  const a0 = at(R_IN, SPAN), a1 = at(R_IN, -SPAN), b0 = at(R_OUT, SPAN), b1 = at(R_OUT, -SPAN);
  el('path', { d: `M${a0.x.toFixed(1)} ${a0.y.toFixed(1)}A${R_IN} ${R_IN} 0 0 1 ${a1.x.toFixed(1)} ${a1.y.toFixed(1)}${jagged(a1, b1)}A${R_OUT} ${R_OUT} 0 0 0 ${b0.x.toFixed(1)} ${b0.y.toFixed(1)}${jagged(b0, a0)}Z`,
               fill: '#E9EEF0', stroke: FRAME, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, d.svg);
  el('text', { x: (a0.x+b0.x)/2, y: b0.y-12, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 14, 'font-weight': 600, fill: '#304d59' }, d.svg, 'Detector');

  // tracks of other particles of the collision, from the primary vertex to the detector (light, so that they do not compete with the tracks of the decay)
  [[12, 0], [8.5, 1], [-3, 0], [-8, 1], [-12, 0]].forEach(([phi, sweep]) => el('path', { d: arc(PV, at(R_OUT, phi), 1600, sweep), fill: 'none', stroke: BACKGROUND, 'stroke-width': 2, 'stroke-linecap': 'round' }, d.svg));
  // the mother: it leaves no track, it flies from the primary to the secondary vertex
  el('line', { x1: PV.x, y1: PV.y, x2: SV.x, y2: SV.y, stroke: DARK, 'stroke-width': 2.6, 'stroke-dasharray': '7 6' }, d.svg);
  // the final states from the secondary vertex to the detector: charged ones bent in both directions, one neutral (straight, dashed)
  const sweeps = [1, 0, 0, 1, 0, 1], charged = [true, true, false, true, true, true];
  names.forEach((nm, k) => {
    const phi = names.length > 1 ? 11-22*k/(names.length-1) : 4, end = at(R_OUT, phi);
    if (!charged[k % charged.length]) {
      el('line', { x1: SV.x, y1: SV.y, x2: end.x, y2: end.y, stroke: DARK, 'stroke-width': 2.2, 'stroke-dasharray': '3 5', 'stroke-linecap': 'round' }, d.svg);
    } else {
      el('path', { d: arc(SV, end, 700, sweeps[k % sweeps.length]), fill: 'none', stroke: CHARGED, 'stroke-width': 2.8, 'stroke-linecap': 'round' }, d.svg);
    }
    d.name(end.x+8, end.y+5, nm, 'p', 'start');
  });
  d.name((PV.x+SV.x)/2-4, (PV.y+SV.y)/2-14, '0', 'p', 'middle', '', true);                          // on a box, so that the lines that cross do not disturb the name
  // the vertices: a dot each
  for (const [p, text, dx, dy] of [[PV, 'Primary vertex', 6, 34], [SV, 'Secondary vertex', -6, -22]]) {
    el('circle', { cx: p.x, cy: p.y, r: 5.5, fill: DARK }, d.svg);
    el('text', { x: p.x+dx, y: p.y+dy, 'text-anchor': 'middle', 'font-family': SANS, 'font-size': 14, 'font-weight': 600, fill: '#304d59', ...halo }, d.svg, text);
  }
  // the magnetic field, towards the viewer: four arrowheads in two rows of two, each drawn foreshortened (a short stem and a head that points at the viewer)
  for (const [x, y] of [[30, 300], [68, 300], [30, 336], [68, 336]]) {
    el('line', { x1: x, y1: y, x2: x+10, y2: y-10, stroke: DARK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, d.svg);
    el('path', { d: `M${x+22} ${y-22}L${x+5} ${y-14}L${x+14} ${y-5}Z`, fill: DARK }, d.svg);
  }
  el('text', { x: 114, y: 322, 'font-family': SANS, 'font-size': 13, fill: '#304d59' }, d.svg, 'magnetic field, towards the viewer');
  return d.svg;
}
