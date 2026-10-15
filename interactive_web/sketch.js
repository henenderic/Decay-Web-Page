// Feynman sketches of a decay topology, in the style of the manuscript: read from left to right, the mother 0_p enters from the left, a vertex (filled dot) splits
// into the reference daughter (upper line) and the spectator (lower line), a single line is a particle, a double line an intermediate state (isobar). The lines
// leave every vertex symmetrically and have the same length, so a final state ends mirror-symmetric to an isobar line. A sketch is no Feynman diagram; it gives a
// picture of the decay chain and can light up the part that is at work (vertices, lines).
//
// The topology comes from the Python core: {name, display, leaf, children: [reference, spectator]}.
const NS = 'http://www.w3.org/2000/svg';
const FONT = '"STIX Two Text","Latin Modern Roman",Cambria,"Times New Roman","Liberation Serif",Georgia,serif';
const BASE = '#7C8A92', LIT = '#0F7C8F', WHITE = '#fff';
const SPREAD = .42;                  // vertical half distance of the two lines of a vertex whose daughters are final states (the length of a line is 1)

const el = (tag, attrs = {}, parent = null, text = null) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (text !== null) e.textContent = text;
  parent?.appendChild(e);
  return e;
};
const f = x => (Math.round(x*1e3)/1e3).toString();
const mix = (a, b, t) => {                                   // colours as hex, t = 0 gives a
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i+2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i+2), 16));
  return '#'+pa.map((x, i) => Math.round(x+(pb[i]-x)*t).toString(16).padStart(2, '0')).join('');
};

/** Positions of all vertices and lines. Every vertex has two lines of equal length at the same angle above and below; the spread grows with the size of the subtrees. */
export function layoutTopology(tree) {
  const extent = node => {                                    // vertical half extent of the subtree below a line, counted from the start of that line
    if (node.leaf) return 0;
    const s = Math.max(extent(node.children[0]), extent(node.children[1]));
    return 2*s + SPREAD;
  };
  const vertices = [], lines = [], byName = new Map();
  const place = (node, x, y, path, parent) => {
    const entry = { node, path, x, y, parent, leaf: node.leaf, name: node.name, display: node.display };
    byName.set(node.name, entry);
    if (node.leaf) { lines.push({ id: 'e:'+path, to: entry, from: parent, leaf: true }); return entry; }
    if (parent) lines.push({ id: 'e:'+path, to: entry, from: parent, leaf: false });
    vertices.push(entry);
    const s = Math.max(extent(node.children[0]), extent(node.children[1])), d = s + SPREAD, len = Math.max(1, d*1.1);
    entry.children = node.children.map((child, k) => place(child, x+len, y+(k === 0 ? d : -d), path+(k === 0 ? 'L' : 'R'), entry));
    return entry;
  };
  const root = place(tree, 0, 0, '', null);
  const xs = [...lines.map(l => l.to.x), -.8], ys = [...lines.map(l => l.to.y), root.y];
  return { root, vertices, lines, byName, bounds: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) } };
}

/** Identifiers of the parts of a sketch: 'in' (the line of the mother), 'v:<path>' (vertices), 'e:<path>' (the line that ends in the node of that path). */
export const vertexId = entry => 'v:'+entry.path;
export const lineId = entry => 'e:'+entry.path;

/**
 * @param topology  {name, display, leaf, children}
 * @param o         {labels: true = all names, 'names' = the particles and intermediate states without the vertices, false = none; width: design width in px (sets the size of
 *                   the text); stylised: small dots and thin lines; labelPx: size of the names in px; weight: their font weight; maxHeight: the greatest height in px at which the sketch is shown;
 *                   emphasis: {scale, weight} for the names of the parts that are lit: they grow with the strength of the light}
 * @returns {svg, layout, update(items), ids}
 *   items: Map id -> {v: strength 0..1 (default 1), color, window: [from, to] (the part of a line that is lit, from its start to its end; hard edges, like a loading bar),
 *                     fade: {end: 'start'|'end', length} (a line that is lit at one end and fades out over the given fraction of its length)}
 */
export function buildSketch(topology, { labels = true, width = 380, stylised = false, labelPx = stylised ? 10 : 12.5, weight = 400, maxHeight = Infinity, emphasis = null } = {}) {
  const names = !!labels, vertexNames = labels === true;
  const layout = layoutTopology(topology);
  const pad = stylised ? .25 : .4, inLength = stylised ? .5 : .7;
  const { x1, y0, y1 } = layout.bounds;
  const vb = { x: -inLength-(names ? .45 : 0), y: -(y1+pad+(names ? .15 : 0)), w: 0, h: 0 };
  vb.w = x1+(names ? .55 : pad)-vb.x; vb.h = (y1-y0)+2*pad+(names ? .3 : 0);
  const px = Math.min(width/vb.w, maxHeight/vb.h), fs = labelPx/px;      // text size in view-box units for labelPx on screen, at the scale that the sketch has when it is shown
  const svg = el('svg', { viewBox: `${f(vb.x)} ${f(vb.y)} ${f(vb.w)} ${f(vb.h)}`, class: 'sketch'+(stylised ? ' stylised' : ''), role: 'img', preserveAspectRatio: 'xMidYMid meet',
                          'aria-label': `Feynman sketch of the decay topology ${topology.display}` });
  const defs = el('defs', {}, svg), uid = Math.random().toString(36).slice(2, 8);
  const Y = y => -y;
  const wBase = stylised ? 1.2 : 1.7, wDouble = stylised ? 3.8 : 4.4, wInner = stylised ? 1.2 : 1.8, TEXT = '#33434B';
  const parts = new Map();                                    // id -> update function
  const labelsOf = new Map();                                 // id -> labels {element, grow(k, bold)} that take the colour of the part
  const addLabel = (id, label) => labelsOf.set(id, [...(labelsOf.get(id) || []), label]);

  /** Opacity profile along a line, from its start to its end, as gradient stops. */
  const profile = spec => {
    const v = spec.v ?? 1, eps = .012;
    if (spec.fade) {
      const len = Math.max(.05, Math.min(1, spec.fade.length));
      return spec.fade.end === 'start' ? [[0, v], [len, 0], [1, 0]] : [[0, 0], [1-len, 0], [1, v]];
    }
    const [from, to] = spec.window || [0, 1], pts = [];
    if (from > .001) pts.push([Math.max(0, from-eps), 0], [from, v]); else pts.push([0, v]);
    if (to < .999) pts.push([to, v], [Math.min(1, to+eps), 0]); else pts.push([1, v]);
    return pts;
  };

  const drawLine = (id, a, b, double) => {
    const g = el('g', {}, svg), coords = { x1: f(a.x), y1: f(Y(a.y)), x2: f(b.x), y2: f(Y(b.y)) };
    const gradientId = `g${uid}${id.replace(/[^A-Za-z0-9]/g, '_')}`;
    const gradient = el('linearGradient', { id: gradientId, gradientUnits: 'userSpaceOnUse', ...coords }, defs);
    const stroke = (col, w) => ({ ...coords, stroke: col, 'stroke-width': w, 'vector-effect': 'non-scaling-stroke', 'stroke-linecap': 'butt', fill: 'none' });
    const strokes = [];
    // the dim line (always there), then the lit line with the gradient on top; a double line is a wide stroke with a white core
    if (double) { el('line', stroke(BASE, wDouble), g).setAttribute('opacity', .55); el('line', stroke(WHITE, wInner), g); }
    else el('line', stroke(BASE, wBase), g).setAttribute('opacity', .55);
    const lit = el('g', {}, g);
    if (double) { strokes.push(el('line', stroke(`url(#${gradientId})`, wDouble), lit)); el('line', stroke(WHITE, wInner), lit); }      // the white core stays on top of the colour
    else strokes.push(el('line', stroke(`url(#${gradientId})`, wBase), lit));
    parts.set(id, spec => {
      gradient.replaceChildren();
      if (!spec) { for (const s of strokes) s.setAttribute('visibility', 'hidden'); return; }
      for (const s of strokes) s.removeAttribute('visibility');
      for (const [offset, opacity] of profile(spec)) el('stop', { offset: f(offset), 'stop-color': spec.color || LIT, 'stop-opacity': f(opacity) }, gradient);
    });
    return g;
  };

  const text = (id, x, y, markup, { anchor = 'start', rotate = 0, size = 1, lift = 0, gain = 1 } = {}) => {
    // markup: base text and an upright subscript, e.g. ['1', 'p']
    const [base, sub] = markup;
    const t = el('text', { x: f(x), y: f(y), 'font-family': FONT, 'font-size': f(fs*size), 'text-anchor': anchor, 'font-weight': weight, fill: TEXT,
                           transform: rotate ? `rotate(${f(rotate)} ${f(x)} ${f(y)})` : null, 'pointer-events': 'none' }, svg);
    el('tspan', {}, t, base);
    const subscript = el('tspan', { dy: f(fs*.28), 'font-size': f(fs*size*.7) }, t, sub);
    const grow = (k, bold) => {                               // the name of a part that is at work is set larger (and bold); gain < 1 lets it grow less, lift moves it away from the line
      k = 1+(k-1)*gain;
      t.setAttribute('font-size', f(fs*size*k)); subscript.setAttribute('font-size', f(fs*size*.7*k)); subscript.setAttribute('dy', f(fs*.28*k));
      t.setAttribute('font-weight', bold ? emphasis.weight : weight);
      if (lift) t.setAttribute('y', f(y+lift*fs*(k-1)));
    };
    addLabel(id, { element: t, grow });
    return t;
  };

  // the line of the mother, then every line below a vertex, then the vertices on top
  const root = layout.root;
  const motherStart = { x: -inLength, y: root.y }, rootPoint = { x: root.x, y: root.y };
  drawLine('in', motherStart, rootPoint, false);
  if (names) text('in', motherStart.x-.06, Y(root.y)+fs*.3, ['0', 'p'], { anchor: 'end' });
  for (const line of layout.lines) {
    const a = line.from, b = line.to;
    drawLine(line.id, a, b, !line.leaf);
    if (!names) continue;
    if (line.leaf) text(line.id, b.x+.07, Y(b.y)+fs*.3, [b.display, 'p']);
    else {                                                    // the name of the intermediate state, along the line, below it
      const dx = b.x-a.x, dy = Y(b.y)-Y(a.y), len = Math.hypot(dx, dy), angle = Math.atan2(dy, dx)*180/Math.PI;
      const nx = -dy/len, ny = dx/len, off = fs*1.6;                     // (nx, ny) points below a line that runs to the right: the name of an isobar always stands below its line
      text(line.id, (a.x+b.x)/2+nx*off, (Y(a.y)+Y(b.y))/2+ny*off, [b.display, 'i'], { anchor: 'middle', rotate: angle, size: .95 });
    }
  }
  for (const v of layout.vertices) {
    const dot = el('circle', { cx: f(v.x), cy: f(Y(v.y)), r: stylised ? .075 : .06, fill: BASE }, svg), id = vertexId(v);
    parts.set(id, spec => {
      const value = spec ? (spec.v ?? 1) : 0;
      dot.setAttribute('fill', mix(BASE, spec?.color || LIT, value)); dot.setAttribute('r', f((stylised ? .075 : .06)*(1+.45*value)));
    });
    if (vertexNames) text(id, v.x-.07, Y(v.y)+(v.path.endsWith('R') ? fs*1.25 : -fs*.75), [v.display, 'v'], { anchor: 'end', size: .9, gain: .6, lift: v.path.endsWith('R') ? 2.2 : -2.2 });      // above left, below left for a lower vertex
  }

  // the jump back: a dashed arc from the vertex where a branch ended to the vertex where the next branch starts (item 'jump': {v, from, to}, the names of two vertices)
  const jumpGroup = el('g', { visibility: 'hidden', 'pointer-events': 'none' }, svg);
  const jumpArc = el('path', { fill: 'none', stroke: TEXT, 'stroke-width': stylised ? 1.2 : 1.6, 'stroke-dasharray': '5 4', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }, jumpGroup);
  const jumpHead = el('path', { fill: TEXT }, jumpGroup);
  parts.set('jump', spec => {
    const a = spec && layout.byName.get(spec.from), b = spec && layout.byName.get(spec.to);
    if (!a || !b) { jumpGroup.setAttribute('visibility', 'hidden'); return; }
    const P = { x: a.x, y: Y(a.y) }, Q = { x: b.x, y: Y(b.y) }, dx = Q.x-P.x, dy = Q.y-P.y, len = Math.hypot(dx, dy) || 1;
    let nx = -dy/len, ny = dx/len;
    if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }                // the arc bulges upwards, away from the branch that comes next
    const r = .12, C = { x: (P.x+Q.x)/2+nx*len*.32, y: (P.y+Q.y)/2+ny*len*.32 };
    const unit = (u, v) => { const l = Math.hypot(u, v) || 1; return { x: u/l, y: v/l }; };
    const t0 = unit(C.x-P.x, C.y-P.y), t1 = unit(Q.x-C.x, Q.y-C.y);
    const S0 = { x: P.x+t0.x*r, y: P.y+t0.y*r }, E = { x: Q.x-t1.x*r, y: Q.y-t1.y*r };
    jumpArc.setAttribute('d', `M${f(S0.x)} ${f(S0.y)}Q${f(C.x)} ${f(C.y)} ${f(E.x)} ${f(E.y)}`);
    const hl = .13, hw = .055, bx = E.x-t1.x*hl, by = E.y-t1.y*hl;
    jumpHead.setAttribute('d', `M${f(E.x)} ${f(E.y)}L${f(bx-hw*t1.y)} ${f(by+hw*t1.x)}L${f(bx+hw*t1.y)} ${f(by-hw*t1.x)}Z`);
    const v = spec.v ?? 1;
    jumpArc.setAttribute('stroke-opacity', f(v)); jumpHead.setAttribute('fill-opacity', f(v)); jumpGroup.removeAttribute('visibility');
  });

  const update = (items = new Map()) => {
    for (const [id, part] of parts) {
      const spec = items.get(id);
      part(spec && (spec.v ?? 1) > .004 ? spec : null);
      // the name of a lit part takes its colour
      const strength = spec ? Math.min(1, (spec.v ?? 1)*(spec.fade || spec.window ? .85 : 1)) : 0;
      for (const label of labelsOf.get(id) || []) {
        label.element.setAttribute('fill', strength > .01 ? mix(TEXT, spec.color || LIT, strength) : TEXT);
        if (emphasis) label.grow(1+(emphasis.scale-1)*strength, strength > .5);
      }
    }
  };
  update();
  return { svg, layout, update, ids: [...parts.keys()] };
}

/** The parts of a sketch that belong to one step L_{parent<-child} of a chain: the vertex of the parent, the line to the child and, for an intermediate state, its vertex;
 *  the adjacent lines glow too, but fade out quickly, so that the focus stays on the line of the step. */
export function stepSelection(layout, parentName, childName, color = LIT) {
  const items = new Map(), parent = parentName ? layout.byName.get(parentName) : layout.root, child = layout.byName.get(childName);
  if (!parent || !child) return items;
  const strong = { v: 1, color }, soft = side => ({ v: 1, color, fade: { end: side, length: .6 } });
  const incoming = n => n.path === '' ? 'in' : lineId(n);
  items.set(vertexId(parent), strong); items.set(lineId(child), strong);
  items.set(incoming(parent), soft('end'));                                        // the line that arrives at the parent vertex
  for (const sibling of parent.children) if (sibling !== child) items.set(lineId(sibling), soft('start'));
  if (!child.leaf) { items.set(vertexId(child), strong); for (const grandchild of child.children) items.set(lineId(grandchild), soft('start')); }
  return items;
}
