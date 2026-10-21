// Two simplified diagrams in the picture language of Feynman diagrams, for the introduction of the page "Amplitude construction":
// the process (two colliding particles, a hatched area, the mother 0 and a particle that does not matter, and a second hatched area from which the final states come),
// and an enlarged view of the second area, the decay of the mother into the final states. A hatched area stands for what is not known about the process.
const NS = 'http://www.w3.org/2000/svg';
const FONT = '"STIX Two Text","Latin Modern Roman",Cambria,"Times New Roman","Liberation Serif",Georgia,serif';
const LINE = '#7C8A92', TEXT = '#33434B', HATCH = '#9BB5BB';

const el = (tag, attrs = {}, parent = null, text = null) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (text !== null) e.textContent = text;
  parent?.appendChild(e);
  return e;
};
const f = x => (Math.round(x*10)/10).toString();

/** The point on the circle around `c` with the radius r that lies on the straight line from `from` to the centre. */
export const onCircle = (from, c, r) => { const dx = from.x-c.x, dy = from.y-c.y, d = Math.hypot(dx, dy); return { x: c.x+dx/d*r, y: c.y+dy/d*r }; };

export function diagram(width, height, label) {
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, class: 'blob-diagram', role: 'img', preserveAspectRatio: 'xMidYMid meet', 'aria-label': label });
  const uid = Math.random().toString(36).slice(2, 8);
  const defs = el('defs', {}, svg);
  const marker = el('marker', { id: `a${uid}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: 'auto' }, defs);
  el('path', { d: 'M0 0L10 5L0 10z', fill: LINE }, marker);
  const pattern = el('pattern', { id: `h${uid}`, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  el('rect', { width: 7, height: 7, fill: '#fff' }, pattern);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: HATCH, 'stroke-width': 2.4 }, pattern);
  const line = (a, b, arrow = true) => el('line', { x1: f(a.x), y1: f(a.y), x2: f(b.x), y2: f(b.y), stroke: LINE, 'stroke-width': 2.4, 'marker-end': arrow ? `url(#a${uid})` : null }, svg);
  /** A double line, as in the sketches of the decay chains: an intermediate state. */
  const double = (a, b) => { for (const [color, width] of [[LINE, 6.4], ['#fff', 2.2]]) el('line', { x1: f(a.x), y1: f(a.y), x2: f(b.x), y2: f(b.y), stroke: color, 'stroke-width': width }, svg); };
  const blob = (c, r, caption = true) => {
    el('circle', { cx: f(c.x), cy: f(c.y), r, fill: `url(#h${uid})`, stroke: LINE, 'stroke-width': 2.4 }, svg);
    if (!caption) return;
    const w = 44, h = 20;
    el('rect', { x: f(c.x-w/2), y: f(c.y-h/2), width: w, height: h, rx: 4, fill: '#fff', 'fill-opacity': .92 }, svg);
    el('text', { x: f(c.x), y: f(c.y+5), 'text-anchor': 'middle', 'font-family': FONT, 'font-size': 15, fill: TEXT }, svg, 'Blob');
  };
  // a name with the upright subscript p, as in the sketches: 1_p; an optional superscript (the index of a resonance) and an optional white box behind the text
  const name = (x, y, base, sub, anchor = 'middle', sup = '', box = false) => {
    if (box) {
      const w = base.length*10.5+(sub ? 9 : 0)+(sup ? 9 : 0)+6, x0 = anchor === 'start' ? x-3 : anchor === 'end' ? x-w+3 : x-w/2;
      el('rect', { x: f(x0), y: f(y-17), width: f(w), height: 25, rx: 4, fill: '#fff', 'fill-opacity': .94 }, svg);
    }
    const t = el('text', { x: f(x), y: f(y), 'text-anchor': anchor, 'font-family': FONT, 'font-size': 18, fill: TEXT }, svg);
    el('tspan', {}, t, base); if (sub) el('tspan', { dy: 5, 'font-size': 13 }, t, sub);
    if (sup) el('tspan', { dy: sub ? -12 : -7, dx: sub ? -7 : 1, 'font-size': 13, 'font-style': 'italic' }, t, sup);
  };
  const word = (x, y, text, anchor = 'middle') => el('text', { x: f(x), y: f(y), 'text-anchor': anchor, 'font-family': FONT, 'font-size': 16, 'font-style': 'italic', fill: TEXT }, svg, text);
  return { svg, line, double, blob, name, word, el };
}

/** The positions of the lines of the n final states at the abscissa x, around the ordinate y0; for more than six final states only five lines are drawn, with dots before the last. */
function finalLines(n, x, y0, spacing = 36, maxTotal = 150) {
  const names = n <= 6 ? Array.from({ length: n }, (_, k) => String(k+1)) : ['1', '2', '3', '4', String(n)];
  const step = Math.min(spacing, maxTotal/Math.max(1, names.length-1));                                   // the lines stay inside the figure
  const ys = names.map((_, k) => y0+(k-(names.length-1)/2)*step);
  return { names, ys, dots: n > 6 };
}

/** The process: beam and target, a hatched area, the mother 0 and a particle that does not matter, a second hatched area, the n final states. */
export function buildProcessDiagram(n) {
  const d = diagram(720, 320, 'Simplified diagram of the process: two colliding particles, a hatched area, the mother and another particle, a second hatched area and the final states');
  const b1 = { x: 190, y: 160 }, r1 = 50, b2 = { x: 440, y: 90 }, r2 = 42;
  const beam = { x: 30, y: 100 }, target = { x: 30, y: 220 };
  d.line(beam, onCircle(beam, b1, r1)); d.line(target, onCircle(target, b1, r1));
  d.name(20, 86, 'A', 'p', 'start'); d.name(20, 244, 'B', 'p', 'start');
  d.line(onCircle(b2, b1, r1), onCircle(b1, b2, r2));                                                 // the mother
  d.name(298, 112, '0', 'p');
  const other = { x: 560, y: 262 };
  d.line(onCircle(other, b1, r1), other); d.word(other.x+8, other.y+6, 'X', 'start');                 // a particle that does not matter
  const { names, ys, dots } = finalLines(n, 660, b2.y, 36, 120);
  names.forEach((nm, k) => { const end = { x: 640, y: ys[k] }; d.line(onCircle(end, b2, r2), end); d.name(end.x+8, end.y+5, nm, 'p', 'start'); });
  if (dots) d.word(652, (ys[3]+ys[4])/2+6, '⋮', 'middle');
  d.blob(b1, r1); d.blob(b2, r2);
  return d.svg;
}

/** The enlarged view of the decay of the mother: the mother 0 enters a hatched area from which the n final states come. */
export function buildDecayBlob(n) {
  const d = diagram(640, 230, 'The decay of the mother into the final states: the mother enters a hatched area, the final states leave it');
  const c = { x: 280, y: 115 }, r = 62;
  const start = { x: 30, y: c.y };
  d.line(start, onCircle(start, c, r)); d.name(150, c.y-12, '0', 'p');
  const { names, ys, dots } = finalLines(n, 560, c.y, 34, 170);
  names.forEach((nm, k) => { const end = { x: 560, y: ys[k] }; d.line(onCircle(end, c, r), end); d.name(end.x+8, end.y+5, nm, 'p', 'start'); });
  if (dots) d.word(572, (ys[3]+ys[4])/2+6, '⋮', 'middle');
  d.blob(c, r);
  return d.svg;
}

/** The three kinds of terms of the potential V for a decay into three particles, as small diagrams: 'direct' (0 into 1, 2, 3 at one vertex), 'production' (0 into the intermediate
 *  state (12) and 3) and 'decay' (the intermediate state (12) into 1 and 2, while 3 passes by). A hatched dot is a vertex without further structure. */
export function buildPotentialDiagram(kind) {
  const labels = { direct: 'Diagram of the direct decay of the mother into three particles', production: 'Diagram of the decay of the mother into the intermediate state of the particles 1 and 2 and the particle 3',
                   decay: 'Diagram of the decay of the intermediate state into the particles 1 and 2, while the particle 3 passes by' };
  const d = diagram(270, 150, labels[kind]);
  const c = { x: 120, y: 75 }, r = 24, x0 = 64, xs = 198;                                      // the incoming lines start at x0, the name stands to the left of the arrow
  const incoming = (y, base, sub, sup) => d.name(x0-8, y+5, base, sub, 'end', sup);
  if (kind === 'direct') {
    const start = { x: x0, y: c.y };
    d.line(start, onCircle(start, c, r)); incoming(c.y, '0', 'p');
    [['1', 30], ['2', 75], ['3', 120]].forEach(([nm, y]) => { const end = { x: xs, y }; d.line(onCircle(end, c, r), end); d.name(end.x+8, end.y+5, nm, 'p', 'start'); });
    d.blob(c, r, false);
  } else if (kind === 'production') {
    const start = { x: x0, y: c.y }, up = { x: xs, y: 34 }, down = { x: xs, y: 116 };
    d.line(start, onCircle(start, c, r)); incoming(c.y, '0', 'p');
    d.double(onCircle(up, c, r), up); d.name(up.x+8, up.y+5, '(12)', 'i', 'start', 'α');
    d.line(onCircle(down, c, r), down); d.name(down.x+8, down.y+5, '3', 'p', 'start');
    d.blob(c, r, false);
  } else {
    const top = { x: 120, y: 42 }, start = { x: x0, y: top.y };
    d.double(start, onCircle(start, top, r)); incoming(top.y, '(12)', 'i', 'α');
    [['1', 14], ['2', 70]].forEach(([nm, y]) => { const end = { x: xs, y }; d.line(onCircle(end, top, r), end); d.name(end.x+8, end.y+5, nm, 'p', 'start'); });
    d.blob(top, r, false);
    const a = { x: x0, y: 122 }, b = { x: xs, y: 122 };
    d.line(a, b); incoming(a.y, '3', 'p'); d.name(b.x+8, b.y+5, '3', 'p', 'start');
  }
  return d.svg;
}
