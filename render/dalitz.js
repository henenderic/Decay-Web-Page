// A schematic Dalitz plot: the allowed region for a decay of a mother into three particles in the plane of the invariant masses squared m_12^2 and m_23^2, filled evenly (the phase
// space is constant in these variables), with a band for a resonance in each of the three pair systems. The masses are chosen to give a clear picture; no numbers are shown.
import { diagram } from './blobs.js';

const M = 1, m = [.14, .22, .4];                                                              // mother and the three particles, in arbitrary units
const SUM = M*M+m[0]**2+m[1]**2+m[2]**2;                                                      // m_12^2 + m_23^2 + m_13^2 = M^2 + m_1^2 + m_2^2 + m_3^2

/** The limits of m_23^2 for a given m_12^2 (the particles 2 and 3 parallel or antiparallel in the rest frame of the pair 12). */
function limits(s12) {
  const w = Math.sqrt(s12), e2 = (s12-m[0]**2+m[1]**2)/(2*w), e3 = (M*M-s12-m[2]**2)/(2*w);
  const p2 = Math.sqrt(Math.max(0, e2*e2-m[1]**2)), p3 = Math.sqrt(Math.max(0, e3*e3-m[2]**2));
  return [(e2+e3)**2-(p2+p3)**2, (e2+e3)**2-(p2-p3)**2];
}

export function buildDalitzPlot() {
  const W = 440, H = 380, x0 = 62, y0 = 330, size = 300;
  const d = diagram(W, H, 'Schematic Dalitz plot: the allowed region in the plane of two invariant masses squared with three bands of resonances');
  const lo = (m[0]+m[1])**2, hi = (M-m[2])**2, s23lo = (m[1]+m[2])**2, s23hi = (M-m[0])**2;
  const X = s => x0+(s-lo*.82)/(hi*1.05-lo*.82)*size, Y = s => y0-(s-s23lo*.8)/(s23hi*1.05-s23lo*.8)*size;
  const upper = [], lower = [];
  for (let k = 0; k <= 160; k++) { const s = lo+(hi-lo)*k/160, [a, b] = limits(s); lower.push([X(s), Y(a)]); upper.push([X(s), Y(b)]); }
  const outline = 'M'+[...lower, ...upper.reverse()].map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')+'Z';
  const el = d.el, uid = Math.random().toString(36).slice(2, 8);
  const defs = el('defs', {}, d.svg);
  el('path', { d: outline }, el('clipPath', { id: `c${uid}` }, defs));
  el('path', { d: outline, fill: '#EEF3F4' }, d.svg);
  const g = el('g', { 'clip-path': `url(#c${uid})` }, d.svg);
  const band = (points, color) => el('polygon', { points: points.map(p => p.join(',')).join(' '), fill: color, 'fill-opacity': .38 }, g);
  const far = 1000;
  const s12 = (lo+hi)*.5*1.05, w12 = (hi-lo)*.03;                                             // a resonance in the pair 12: constant m_12^2
  band([[X(s12-w12), -far], [X(s12+w12), -far], [X(s12+w12), far], [X(s12-w12), far]], '#CC3333');
  const s23 = (s23lo+s23hi)*.5*.97, w23 = (s23hi-s23lo)*.03;                                  // a resonance in the pair 23: constant m_23^2
  band([[-far, Y(s23-w23)], [far, Y(s23-w23)], [far, Y(s23+w23)], [-far, Y(s23+w23)]], '#4C4CB3');
  const s13 = .46, w13 = (hi-lo)*.03, c13 = SUM-s13;                                          // a resonance in the pair 13: m_13^2 = SUM - m_12^2 - m_23^2 is constant, a diagonal band
  band([[X(-.3-w13), Y(c13+.3)], [X(-.3+w13), Y(c13+.3)], [X(1.3+w13), Y(c13-1.3)], [X(1.3-w13), Y(c13-1.3)]], '#3FAE49');
  el('path', { d: outline, fill: 'none', stroke: '#7C8A92', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, d.svg);
  // axes
  const ax = { stroke: '#33434B', 'stroke-width': 1.6 };
  el('line', { x1: x0-12, y1: y0+14, x2: x0+size+12, y2: y0+14, ...ax }, d.svg); el('line', { x1: x0-14, y1: y0+14, x2: x0-14, y2: y0-size-12, ...ax }, d.svg);
  const axisName = (x, y, anchor, rotate) => {
    const t = el('text', { x, y, 'text-anchor': anchor, 'font-family': '"STIX Two Text","Latin Modern Roman",Cambria,"Times New Roman",serif', 'font-size': 18, fill: '#33434B', transform: rotate ? `rotate(${rotate} ${x} ${y})` : null }, d.svg);
    return t;
  };
  const label = (t, sub) => { el('tspan', { 'font-style': 'italic' }, t, 'm'); el('tspan', { dy: -7, 'font-size': 12 }, t, '2'); el('tspan', { dy: 12, dx: -6, 'font-size': 12 }, t, sub); };
  label(axisName(x0+size/2, y0+44, 'middle'), '12'); label(axisName(x0-36, y0-size/2, 'middle', -90), '23');
  return d.svg;
}
