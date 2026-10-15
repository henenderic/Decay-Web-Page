// Drawing layer: momentum models -> SVG in the style of the TikZ template.
// The camera acts on the display only; it never changes four-momenta.
const NS = 'http://www.w3.org/2000/svg';
export const XLIM = 6.3, YLIM = 5.15;
const FONT = '"STIX Two Text","Latin Modern Roman","Cambria","Georgia","Times New Roman",serif';
const ANGLE = '#766094', PARENT = '#394953', VERTEX = '#26333C', AXIS = '#69757D', ACTIVE = '#0F7C8F';

// ---------------------------------------------------------------- linear algebra
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const norm = a => Math.hypot(a[0], a[1], a[2]);
const unit = a => { const n = norm(a); return a.map(x => x/n); };
const sub = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
const scl = (a, k) => [a[0]*k, a[1]*k, a[2]*k];
const mv = (M, v) => [dot(M.slice(0,3), v), dot(M.slice(3,6), v), dot(M.slice(6,9), v)];
const mt = (M, v) => [M[0]*v[0]+M[3]*v[1]+M[6]*v[2], M[1]*v[0]+M[4]*v[1]+M[7]*v[2], M[2]*v[0]+M[5]*v[1]+M[8]*v[2]];
const mm = (A, B) => { const R = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
  R[3*i+j] = A[3*i]*B[j] + A[3*i+1]*B[3+j] + A[3*i+2]*B[6+j]; return R; };
const smooth = (lo, hi, x) => { const t = Math.min(1, Math.max(0, (x-lo)/(hi-lo))); return t*t*(3-2*t); };
function axisAngle(k, t) {
  const c = Math.cos(t), s = Math.sin(t), C = 1-c, [x, y, z] = k;
  return [c+x*x*C, x*y*C-z*s, x*z*C+y*s, y*x*C+z*s, c+y*y*C, y*z*C-x*s, z*x*C-y*s, z*y*C+x*s, c+z*z*C];
}
function orthonormalize(M) {
  const a = unit(M.slice(0,3)), b0 = M.slice(3,6), b = unit(b0.map((x, i) => x-dot(b0, a)*a[i]));
  return [...a, ...b, ...cross(a, b)];
}

// Oblique projection of the TikZ template (x up, y forward, z backward).
const VIEW = 70*Math.PI/180;
const R0 = [0, Math.sin(VIEW)-.48*Math.cos(VIEW), Math.cos(VIEW)+.48*Math.sin(VIEW)];
const R1 = [1, -.36*Math.cos(VIEW), .36*Math.sin(VIEW)];
const CAM = unit(cross(R0, R1));          // points towards the viewer
const RIGHT = unit(R0), UP = cross(CAM, RIGHT);
const R0LEN = norm(R0), SHEAR_C = dot(R1, RIGHT), SHEAR_D = dot(R1, UP), ORTHO_K = norm(R1);
export const IDENTITY = [1,0,0, 0,1,0, 0,0,1];

export function rotateView(M, dyaw, dpitch) {
  return orthonormalize(mm(axisAngle(RIGHT, dpitch), mm(axisAngle(UP, dyaw), M)));
}
export function presetView(name) {
  const cols = { z: [RIGHT, UP, CAM], x: [CAM, RIGHT, UP], y: [UP, CAM, RIGHT] }[name];
  if (!cols) return IDENTITY.slice();
  return [cols[0][0], cols[1][0], cols[2][0], cols[0][1], cols[1][1], cols[2][1], cols[0][2], cols[1][2], cols[2][2]];
}

// ---------------------------------------------------------------- SVG helpers
function el(tag, attrs = {}, parent = null, text = null) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (text !== null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
const f = x => (Math.round(x*1e4)/1e4).toString();
const polyPath = pts => 'M'+pts.map(p => f(p[0])+' '+f(p[1])).join('L')+'Z';
const NSE = 'vector-effect';

// ---------------------------------------------------------------- rich text (sub/superscripts)
const measureCtx = document.createElement('canvas').getContext('2d');
const widthCache = new Map();
function textWidth(text, italic) {
  const key = (italic ? 'i' : 'n')+text;
  if (!widthCache.has(key)) {
    measureCtx.font = `${italic ? 'italic ' : ''}100px ${FONT}`;
    widthCache.set(key, measureCtx.measureText(text).width/100);
  }
  return widthCache.get(key);
}

/** Markup: _x ^x or _{..} ^{..}; backslash escapes; ~ puts a vector arrow over the next glyph. */
export function layout(str, size, level = 0) {
  const runs = [], vecs = [];
  let x = 0, buffer = '', pending = false;
  const SCRIPT = level === 0 ? .78 : .84;
  const flush = (arrow = false) => {
    if (!buffer) return;
    const italic = level === 0 && /^[A-Za-zα-ωϑφλχη]$/.test(buffer);
    const w = textWidth(buffer, italic)*size;
    if (arrow) { x += .05*size; vecs.push({ x: x + .08*size, w: Math.max(w-.06*size, .42*size) }); }      // a little room before and after a glyph with a vector arrow
    runs.push({ text: buffer, x, y: 0, size, italic });
    x += w + (arrow ? .07*size : 0); buffer = '';
  };
  const readArg = (i) => {
    if (str[i] === '{') {
      let depth = 1, j = i+1;
      while (j < str.length && depth) { if (str[j] === '\\') j++; else if (str[j] === '{') depth++; else if (str[j] === '}') depth--; j++; }
      return [str.slice(i+1, j-1), j];
    }
    if (str[i] === '\\') return [str.slice(i, i+2), i+2];
    return [str[i] ?? '', i+1];
  };
  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (c === '~') { flush(); pending = true; i++; }
    else if (c === '@') { flush(); const [arg, next] = readArg(i+1); runs.push({ text: arg, x, y: 0, size, italic: false }); x += textWidth(arg, false)*size; i = next; }      // @{II}: upright text
    else if (c === '_' || c === '^') {
      flush();
      const scripts = {};
      while (i < str.length && (str[i] === '_' || str[i] === '^')) {
        const [arg, next] = readArg(i+1); scripts[str[i]] = arg; i = next;
      }
      let width = 0;
      x += .06*size;
      for (const [kind, arg] of Object.entries(scripts)) {
        const subl = layout(arg, size*SCRIPT, level+1);
        const dy = kind === '_' ? .28*size : -.50*size;
        for (const r of subl.runs) runs.push({ ...r, x: r.x+x, y: r.y+dy });
        width = Math.max(width, subl.width);
      }
      x += width + .05*size;
    } else {
      buffer += c === '\\' ? (str[i+1] ?? '') : c; i += c === '\\' ? 2 : 1;
      if (pending) { flush(true); pending = false; }
    }
  }
  flush();
  return { runs, width: x, vecs };
}

function measureLabel(spec, size) {
  const lines = [layout(spec.markup, size)];
  if (spec.note) lines.push(layout(spec.note, size*.8));
  return { lines, width: Math.max(...lines.map(l => l.width)), height: size*1.5 + (spec.note ? size*1.3 : 0) };
}

function drawLabel(parent, spec, m, x, y, size) {
  const g = el('g', { opacity: spec.opacity ?? 1 }, parent);
  const pad = .22*size;
  el('rect', { x: f(x-pad), y: f(y-pad*.5), width: f(m.width+2*pad), height: f(m.height+pad*.2), rx: f(.5*size), fill: '#fff', 'fill-opacity': .82 }, g);
  let baseline = y + size*1.05;
  m.lines.forEach((line, n) => {
    const s = n ? size*.8 : size, dx = n ? (m.width-line.width)/2 : 0;          // the note (reference, spectator) stands centred below the symbol, with room to the line above
    if (n) baseline += size*1.2;
    for (const r of line.runs) {
      el('text', { x: f(x+dx+r.x), y: f(baseline+r.y), 'font-size': f(r.size), 'font-family': FONT,
                   'font-style': r.italic ? 'italic' : 'normal', fill: spec.color }, g, r.text);
    }
    for (const vec of line.vecs) {
      const ax = x+dx+vec.x, ay = baseline-.64*s, aw = vec.w;
      el('path', { d: `M${f(ax)} ${f(ay)}H${f(ax+aw)}M${f(ax+aw-.17*s)} ${f(ay-.1*s)}L${f(ax+aw)} ${f(ay)}L${f(ax+aw-.17*s)} ${f(ay+.1*s)}`,
                   stroke: spec.color, 'stroke-width': 1, fill: 'none', 'stroke-linecap': 'round', [NSE]: 'non-scaling-stroke' }, g);
    }
  });
}

// ---------------------------------------------------------------- models
/** Static model for one figure payload. Vectors keep physical (unscaled) spatial components. */
export function staticModel(fig) {
  const sc = fig.scene;
  return {
    kind: fig.kind, tag: fig.tag_markup, vertex: fig.vertex_markup, scale: sc.plot_scale, scaleFinal: sc.plot_scale_final ?? sc.plot_scale, angles: fig.angles,
    // context vectors (final states outside the vertex of the frame) appear in the final-states view only
    vectors: sc.vectors.map(v => ({ ...v, alpha: v.context ? 0 : 1, alphaFinal: 1 })),
    guides: sc.sum_guides.map(g => ({ startId: g.start_vector_id, copiedId: g.copied_vector_id, sumId: g.sum_vector_id, color: g.color, opacity: g.opacity })),
    planes: sc.planes.map(p => ({ id: p.id, node: p.node, pair: p.pair, aId: p.a_id, bId: p.b_id, color: p.color })),
    parent: { ...sc.parent, alpha: 1 },
    showTag: true,
  };
}

/** The model as seen in one display mode: the final-states view uses its own membership and scale. */
export function forMode(model, finalOnly) {
  if (!finalOnly) return model;
  return { ...model, scale: model.scaleFinal ?? model.scale,
           vectors: model.vectors.map(v => ({ ...v, alpha: v.alphaFinal ?? v.alpha })),
           trails: (model.trails || []).map(t => ({ ...t, alpha: t.alphaFinal ?? t.alpha })) };
}

/** End points (plot coordinates) of the two vectors that span a particle plane. */
function planeEnds(pl, byId, scale) {
  const a = byId.get(pl.aId), b = byId.get(pl.bId);
  return a && b ? { a, b, pa: scl(a.spatial, scale), pb: scl(b.spatial, scale) } : null;
}

// ---------------------------------------------------------------- plane geometry
// The three coordinate planes: one light grey, without an edge, spread up to the walls of the box (the box reaches from -3.8 to 3.8).
const COORD_GREY = '#BFC9CF';
const COORD_PLANES = {
  xy: { normal: [0,0,1], u: [1,0,0], v: [0,1,0], ur: [-3.8, 3.8], vr: [-3.8, 3.8], fill: COORD_GREY },
  xz: { normal: [0,1,0], u: [1,0,0], v: [0,0,1], ur: [-3.8, 3.8], vr: [-3.8, 3.8], fill: COORD_GREY },
  yz: { normal: [1,0,0], u: [0,1,0], v: [0,0,1], ur: [-3.8, 3.8], vr: [-3.8, 3.8], fill: COORD_GREY },
};

function particlePlane(a, b) {
  // Rectangle in span(a, b) that contains 0, a, b and a+b with a margin; null for (nearly) collinear a, b.
  const na = norm(a), nb = norm(b);
  if (na < 1e-9 || nb < 1e-9) return null;
  const n = cross(a, b), sinus = norm(n)/(na*nb);
  if (sinus < .03) return null;
  const e1 = scl(a, 1/na), t = sub(b, scl(e1, dot(b, e1))), e2 = scl(t, 1/norm(t));
  const pts = [[0,0], [na,0], [dot(b,e1), dot(b,e2)], [na+dot(b,e1), dot(b,e2)]];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const mx = .3*Math.max(na, nb);
  const x0 = Math.min(...xs)-mx, x1 = Math.max(...xs)+mx, y0 = Math.min(...ys)-mx, y1 = Math.max(...ys)+mx;
  const at = (x, y) => [e1[0]*x+e2[0]*y, e1[1]*x+e2[1]*y, e1[2]*x+e2[2]*y];
  return { corners: [at(x0,y0), at(x1,y0), at(x1,y1), at(x0,y1)], normal: unit(n), strength: smooth(.03, .16, sinus) };
}

/** True if at least one resonance of the model has daughters that span a plane. */
export function particlePlanesAvailable(model) {
  const byId = new Map(model.vectors.map(v => [v.id, v]));
  return model.planes.some(pl => {
    const e = planeEnds(pl, byId, model.scale);
    return e && particlePlane(e.pa, e.pb);
  });
}

// ---------------------------------------------------------------- the renderer
/**
 * @param model  see staticModel
 * @param view   {rot: 3x3, zoom, shear}
 * @param opts   {mode: 'full'|'final', planes: {xy,xz,yz,particle}, labels, helicities, angles, moving, ppu, labelPx}
 */
export function renderScene(svg, model, view, opts) {
  model = forMode(model, opts.mode === 'final');
  const zoom = view.zoom || 1;
  const halfW = XLIM/zoom, halfH = YLIM/zoom;
  svg.setAttribute('viewBox', `${f(-halfW)} ${f(-halfH)} ${f(2*halfW)} ${f(2*halfH)}`);
  svg.replaceChildren();
  const rot = view.rot, t = view.shear ?? 1;
  const ppu = opts.ppu || 60;
  const labelSize = (opts.labelPx || 12)/ppu;
  const scale = model.scale;
  const finalOnly = opts.mode === 'final';

  const P = v => {
    const u = mv(rot, v), ox = dot(RIGHT, u), oy = dot(UP, u);
    return { x: ((1-t)*ORTHO_K + t*R0LEN)*ox, y: -((1-t)*ORTHO_K*oy + t*.9*(SHEAR_C*ox + SHEAR_D*oy)), d: dot(CAM, u) };
  };
  const P2 = v => { const p = P(v); return [p.x, p.y]; };
  const depthOf = v => dot(CAM, mv(rot, v));
  const camWorld = mt(rot, CAM);        // viewing direction (towards the viewer) in physical coordinates

  el('rect', { x: f(-halfW), y: f(-halfH), width: f(2*halfW), height: f(2*halfH), fill: '#fff' }, svg);

  // ---- fixed grid faces; they fade when the camera looks at them from outside
  {
    const g = el('g', {}, svg), lo = -3.8, hi = 3.8;
    const faces = model.boxSigns ? model.boxSigns.map((s, a) => ({ a, s, c: ['#EEF3F6', '#E3EBF2', '#D9E4ED'][a] }))      // model.boxSigns: side of each wall, e.g. [-1, -1, -1] for a floor
                                  : [{ a: 0, s: -1, c: '#EEF3F6' }, { a: 1, s: -1, c: '#E3EBF2' }, { a: 2, s: 1, c: '#D9E4ED' }];
    for (const { a, s, c } of faces) {
      const n = [0,0,0]; n[a] = s;
      const facing = -dot(mv(rot, n), CAM);                    // > 0: the face lies behind the scene
      const k = .13 + .87*smooth(-.04, .38, facing);
      const b = (a+1) % 3, cc = (a+2) % 3;
      const pt = (u, w) => { const v = [0,0,0]; v[a] = s > 0 ? hi : lo; v[b] = u; v[cc] = w; return P2(v); };
      const gg = el('g', { opacity: f(k) }, g);
      el('path', { d: polyPath([pt(lo,lo), pt(hi,lo), pt(hi,hi), pt(lo,hi)]), fill: c, 'fill-opacity': .35 }, gg);
      let d = '';
      for (let i = -3; i <= 3; i++) {
        const p1 = pt(i, lo), p2 = pt(i, hi), p3 = pt(lo, i), p4 = pt(hi, i);
        d += `M${f(p1[0])} ${f(p1[1])}L${f(p2[0])} ${f(p2[1])}M${f(p3[0])} ${f(p3[1])}L${f(p4[0])} ${f(p4[1])}`;
      }
      el('path', { d, stroke: '#BDCDD8', 'stroke-opacity': .5, 'stroke-width': .6, fill: 'none', [NSE]: 'non-scaling-stroke' }, gg);
      el('path', { d: polyPath([pt(lo,lo), pt(hi,lo), pt(hi,hi), pt(lo,hi)]), stroke: '#91A5B3', 'stroke-opacity': .65, 'stroke-width': .9, fill: 'none', [NSE]: 'non-scaling-stroke' }, gg);
    }
  }

  // ---- bookkeeping of what is shown
  const byId = new Map(model.vectors.map(v => [v.id, v]));
  const pos = v => scl(v.spatial, scale);                      // plot coordinates
  const shown = v => v.alpha > .02 && (!finalOnly || v.leaf);
  const style = v => finalOnly ? { opacity: 1, line: 'solid' } : { opacity: v.opacity, line: v.depth === 0 ? 'solid' : v.linestyle };
  const visibleVectors = model.vectors.filter(shown);

  // ---- items for painter's ordering
  const items = [];                                           // {depth, draw, anchor}
  const addItem = (anchor, draw) => items.push({ depth: depthOf(anchor), anchor, draw });

  // coordinate axes (always shown); the axis of the running rotation or boost is highlighted
  [2.75, 3.0, 2.9].forEach((len, i) => {
    const e = [0,0,0]; e[i] = len;
    const neg = scl(e, -.72);
    const hot = model.activeAxis === i, col = hot ? ACTIVE : AXIS;
    addItem(scl(e, .5), g => {
      const a = P2(e);
      el('path', { d: `M0 0L${f(a[0])} ${f(a[1])}`, stroke: col, 'stroke-width': hot ? 2.6 : 1, fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
      const len2 = Math.hypot(a[0], a[1]) || 1, dir = [a[0]/len2, a[1]/len2], nrm = [-dir[1], dir[0]];
      const hl = hot ? .22 : .17, hw = hot ? .08 : .06, base = [a[0]-hl*dir[0], a[1]-hl*dir[1]];
      el('path', { d: polyPath([[a[0], a[1]], [base[0]+hw*nrm[0], base[1]+hw*nrm[1]], [base[0]-hw*nrm[0], base[1]-hw*nrm[1]]]), fill: col }, g);
      const fs = labelSize*(hot ? 1.3 : 1.05);
      if (model.axisMarkup) {            // axes of a named frame, e.g. x^{[1|I]}
        const spec = { markup: model.axisMarkup[i], color: col }, m = measureLabel(spec, fs*.95);
        drawLabel(g, spec, m, a[0]+.05, a[1]-m.height*.95, fs*.95);
        return;
      }
      el('rect', { x: f(a[0]+.05), y: f(a[1]-fs*1.05), width: f(fs*.75), height: f(fs*1.1), rx: f(fs*.25), fill: '#fff', 'fill-opacity': .82 }, g);
      el('text', { x: f(a[0]+.05+fs*.14), y: f(a[1]-fs*.18), 'font-size': f(fs), 'font-family': FONT, 'font-style': 'italic', 'font-weight': hot ? 700 : 400, fill: col }, g, ['x', 'y', 'z'][i]);
    });
    addItem(scl(neg, .5), g => {
      const b = P2(neg);
      el('path', { d: `M0 0L${f(b[0])} ${f(b[1])}`, stroke: col, 'stroke-opacity': hot ? .8 : .48, 'stroke-width': hot ? 1.6 : .8, 'stroke-dasharray': '3 4', fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
    });
  });

  // paths of the arrow tips during the current step (rotations show up as arcs)
  for (const tr of model.trails || []) {
    if (finalOnly ? !tr.leaf : tr.depth !== 0) continue;
    const pts = tr.points.map(p => scl(p, scale));
    if (pts.length < 2) continue;
    let total = 0; for (let k = 1; k < pts.length; k++) total += norm(sub(pts[k], pts[k-1]));
    if (total < .08) continue;
    const tail = pts[pts.length-1];
    addItem(tail, g => {
      const q = pts.map(P2);
      el('path', { d: 'M'+q.map(a => f(a[0])+' '+f(a[1])).join('L'), stroke: tr.color, 'stroke-opacity': .85*tr.alpha, 'stroke-width': 1.7,
                   'stroke-dasharray': '1.5 3.6', 'stroke-linecap': 'round', fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
      el('circle', { cx: f(q[0][0]), cy: f(q[0][1]), r: .055, fill: '#fff', stroke: tr.color, 'stroke-opacity': tr.alpha, 'stroke-width': 1.2, [NSE]: 'non-scaling-stroke' }, g);
    });
  }

  // circular arrows: model.circles: [{center, u, v, radius, start, sweep, color, width, opacity}] in physical coordinates; the arc runs from `start` by `sweep` (radians)
  // in the plane spanned by the unit vectors u and v, with an arrow head at its end
  for (const c of model.circles || []) {
    const pts3 = [];
    for (let k = 0; k <= 60; k++) {
      const a = c.start + c.sweep*k/60;
      pts3.push([0, 1, 2].map(i => (c.center[i] + c.radius*(Math.cos(a)*c.u[i] + Math.sin(a)*c.v[i]))*scale));
    }
    addItem(scl(c.center, scale), g => {
      const q = pts3.map(P2), o = c.opacity ?? 1;
      el('path', { d: 'M'+q.map(a => f(a[0])+' '+f(a[1])).join('L'), stroke: c.color, 'stroke-opacity': o, 'stroke-width': c.width ?? 1.6, fill: 'none', 'stroke-linecap': 'round', [NSE]: 'non-scaling-stroke' }, g);
      const end = q[q.length-1], back = q[q.length-6], len = Math.hypot(end[0]-back[0], end[1]-back[1]) || 1;
      const dir = [(end[0]-back[0])/len, (end[1]-back[1])/len], nrm = [-dir[1], dir[0]], hl = .19, hw = .075, base = [end[0]-hl*dir[0], end[1]-hl*dir[1]];
      el('path', { d: polyPath([end, [base[0]+hw*nrm[0], base[1]+hw*nrm[1]], [base[0]-hw*nrm[0], base[1]-hw*nrm[1]]]), fill: c.color, 'fill-opacity': o }, g);
    });
  }

  // additional axes drawn like the coordinate axes (thin line, small head); model.axes3d: [{tip, color, opacity, width, dash}] with tips in physical coordinates
  for (const ax of model.axes3d || []) {
    const tip = scl(ax.tip, scale);
    addItem(scl(tip, .5), g => {
      const a = P2(tip), len = Math.hypot(a[0], a[1]) || 1, dir = [a[0]/len, a[1]/len], nrm = [-dir[1], dir[0]], hl = .17, hw = .06, o = ax.opacity ?? 1;
      el('path', { d: `M0 0L${f(a[0])} ${f(a[1])}`, stroke: ax.color, 'stroke-opacity': o, 'stroke-width': ax.width ?? 1.3, 'stroke-dasharray': ax.dash ? '4 3' : null, fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
      if (len > 2*hl) {
        const base = [a[0]-hl*dir[0], a[1]-hl*dir[1]];
        el('path', { d: polyPath([[a[0], a[1]], [base[0]+hw*nrm[0], base[1]+hw*nrm[1]], [base[0]-hw*nrm[0], base[1]-hw*nrm[1]]]), fill: ax.color, 'fill-opacity': o }, g);
      }
    });
  }

  // vectors
  for (const v of visibleVectors) {
    const end = pos(v), st = style(v);
    addItem(end, g => arrow(g, [0,0,0], end, v.color, st.opacity*v.alpha, st.line));
  }
  // sum guides: translated copies completing the momentum parallelograms (resonance view only)
  if (!finalOnly) {
    for (const gd of model.guides) {
      const a = byId.get(gd.startId), c = byId.get(gd.copiedId), s = byId.get(gd.sumId);
      if (!a || !c || !s || !shown(a) || !shown(c) || !shown(s)) continue;
      const p = pos(a), q = pos(s), mid = scl([p[0]+q[0], p[1]+q[1], p[2]+q[2]], .5);
      const alpha = Math.min(a.alpha, c.alpha, s.alpha)*(gd.weight ?? 1);
      addItem(mid, g => {
        const A = P2(p), B = P2(q);
        el('path', { d: `M${f(A[0])} ${f(A[1])}L${f(B[0])} ${f(B[1])}`, stroke: gd.color, 'stroke-opacity': gd.opacity*alpha,
                     'stroke-width': .9, 'stroke-dasharray': '1.3 3.2', 'stroke-linecap': 'round', fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
      });
    }
  }
  // incoming parent momentum
  const par = model.parent, parPos = scl(par.spatial, scale);
  const parentLong = norm(par.spatial)*scale > 1e-9*2.85;
  const parentStart = parentLong ? scl(parPos, -1) : null;
  if (parentLong && par.alpha > .02) addItem(scl(parPos, -.5), g => arrow(g, parentStart, [0,0,0], par.color, par.alpha, 'solid'));

  // angle construction
  const angleLabels = [];
  const ref = model.vectors.find(v => v.depth === 0 && v.role === 'reference');
  if (opts.angles && model.angles && model.kind === 'vertex' && ref && shown(ref)) {
    const refP = pos(ref), q = norm(refP);
    const { phi, theta } = model.angles;
    const tag = '['+model.tag+']';
    if (q > 1e-9) {
      const proj = [refP[0], refP[1], 0], rho = Math.hypot(proj[0], proj[1]);
      addItem(scl([refP[0]+proj[0], refP[1]+proj[1], refP[2]], .5), g => {
        const a = P2(refP), b = P2(proj);
        el('path', { d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, stroke: ANGLE, 'stroke-opacity': .65, 'stroke-width': .9,
                     'stroke-dasharray': '3 3', fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
      });
      if (rho > 1e-8) {
        addItem(scl(proj, .5), g => arrow(g, [0,0,0], proj, ANGLE, .85, 'dashed-thin'));
        angleLabels.push({ at: P2(proj), markup: `~p_{${ref.index_markup},xy}^{${tag}}`, color: ANGLE });
      }
      const arc = (points, markup) => {
        const proj2 = points.map(P2), mid = points[Math.floor(points.length/2)];
        addItem(mid, g => {
          el('path', { d: 'M'+proj2.map(p => f(p[0])+' '+f(p[1])).join('L'), stroke: ANGLE, 'stroke-width': 1.3, fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
          const n = proj2.length, a = proj2[n-1], b = proj2[Math.max(0, n-6)];
          const len = Math.hypot(a[0]-b[0], a[1]-b[1]) || 1, dir = [(a[0]-b[0])/len, (a[1]-b[1])/len], nrm = [-dir[1], dir[0]], hl = .16, hw = .06;
          const base = [a[0]-hl*dir[0], a[1]-hl*dir[1]];
          el('path', { d: polyPath([a, [base[0]+hw*nrm[0], base[1]+hw*nrm[1]], [base[0]-hw*nrm[0], base[1]-hw*nrm[1]]]), fill: ANGLE }, g);
        });
        angleLabels.push({ at: proj2[Math.floor(proj2.length/2)], markup, color: ANGLE });
      };
      const idx = ref.index_markup;
      if (theta > 1e-7) {
        const r = Math.min(1.45, .55*q), pts = [];
        for (let k = 0; k <= 120; k++) { const a = theta*k/120; pts.push([r*Math.sin(a)*Math.cos(phi), r*Math.sin(a)*Math.sin(phi), r*Math.cos(a)]); }
        arc(pts, `ϑ_{${idx}}^{${tag}}`);
      }
      if (rho > 1e-8 && Math.abs(phi) > 1e-7) {
        const r = Math.min(1.15, .58*rho), pts = [];
        for (let k = 0; k <= 120; k++) { const a = phi*k/120; pts.push([r*Math.cos(a), r*Math.sin(a), 0]); }
        arc(pts, `φ_{${idx}}^{${tag}}`);
      } else {
        angleLabels.push({ at: P2([1.65, 0, 0]), markup: `φ_{${idx}}^{${tag}}=0`, color: ANGLE });
      }
    }
  }

  // ---- planes: coordinate planes and planes spanned by the daughters of resonances
  const planes = [];
  const planeFace = (corners, normal, fill, edge, fillOpacity, strength, extra) => planes.push({ corners, normal, fill, edge, fillOpacity, strength, extra });
  for (const key of ['xy', 'xz', 'yz']) {
    if (!opts.planes?.coord) continue;
    const c = COORD_PLANES[key];
    const at = (u, w) => [c.u[0]*u+c.v[0]*w, c.u[1]*u+c.v[1]*w, c.u[2]*u+c.v[2]*w];
    planeFace([at(c.ur[0], c.vr[0]), at(c.ur[1], c.vr[0]), at(c.ur[1], c.vr[1]), at(c.ur[0], c.vr[1])], c.normal, c.fill, null, .3, 1,
      { coord: c, label: key, at });
  }
  if (opts.planes?.particle) {
    for (const pl of model.planes) {
      const e = planeEnds(pl, byId, scale);
      if (!e) continue;
      const a = e.a, b = e.b;
      // the planes of the final-state pairs exist in every frame and in both display modes
      const present = Math.min(a.alphaFinal ?? a.alpha, b.alphaFinal ?? b.alpha);
      if (present < .02 || (pl.weight ?? 1) < .02) continue;
      const geo = particlePlane(e.pa, e.pb);
      if (geo) planeFace(geo.corners, geo.normal, pl.color, pl.color, .09, geo.strength*(pl.weight ?? 1)*present, { particle: pl.node });
    }
  }
  // model.frameBoxes: [{axes: [ex, ey, ez], size, color, fillOpacity, strength}]: the three planes xy, xz, yz of a frame, each a square from the origin to the axis tips
  for (const fb of model.frameBoxes || []) {
    for (const [ia, ib, inn] of [[0, 1, 2], [0, 2, 1], [1, 2, 0]]) {
      const A = scl(fb.axes[ia], fb.size*scale), B = scl(fb.axes[ib], fb.size*scale);
      planeFace([[0, 0, 0], A, [A[0]+B[0], A[1]+B[1], A[2]+B[2]], B], fb.axes[inn], fb.color, fb.color, fb.fillOpacity ?? .08, fb.strength ?? 1, { cell: 5 });
    }
  }
  for (const pl of planes) {
    pl.draw = g => {
      const gg = el('g', { opacity: f(pl.strength) }, g);
      const pts = pl.corners.map(P2);
      el('path', { d: polyPath(pts), fill: pl.fill, 'fill-opacity': pl.fillOpacity, stroke: pl.edge ? pl.edge : 'none', 'stroke-opacity': .4,
                   'stroke-width': .9, [NSE]: 'non-scaling-stroke' }, gg);
      if (pl.extra.cell) {            // dashed grid of a frame plane
        const [c0, c1, c2, c3] = pl.corners, n = pl.extra.cell, mix = (p, q, t) => [p[0]+(q[0]-p[0])*t, p[1]+(q[1]-p[1])*t, p[2]+(q[2]-p[2])*t];
        let grid = '';
        for (let i = 1; i < n; i++) {
          const a = P2(mix(c0, c1, i/n)), b = P2(mix(c3, c2, i/n)), c = P2(mix(c0, c3, i/n)), e = P2(mix(c1, c2, i/n));
          grid += `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}M${f(c[0])} ${f(c[1])}L${f(e[0])} ${f(e[1])}`;
        }
        el('path', { d: grid, stroke: pl.edge, 'stroke-opacity': .4, 'stroke-width': .6, 'stroke-dasharray': '3 3', fill: 'none', [NSE]: 'non-scaling-stroke' }, gg);
      }
      if (pl.extra.particle) {        // name of the pair, at the far corner of the plane
        const c = pts[2];
        el('text', { x: f(c[0]-labelSize*.3), y: f(c[1]-labelSize*.2), 'font-size': f(labelSize*.95), 'font-family': FONT, 'text-anchor': 'end',
                     'font-weight': 600, fill: pl.fill, 'fill-opacity': .95 }, gg, pl.extra.particle);
      }
      if (pl.extra.coord) {          // the name of the plane at its corner
        const c = pl.extra.coord, at = pl.extra.at, corner = P2(at(c.ur[1]-.15, c.vr[1]-.35));
        el('text', { x: f(corner[0]-labelSize*.9), y: f(corner[1]), 'font-size': f(labelSize*.9), 'font-family': FONT, 'font-style': 'italic', fill: '#8497A2' }, gg, pl.extra.label);
      }
    };
  }

  // ---- painter's order: far to near; every item stays on its side of every plane
  const order = orderItems(items, planes, camWorld);
  const layer = el('g', {}, svg);
  for (const item of order) item.draw(el('g', {}, layer));

  el('circle', { cx: 0, cy: 0, r: .075, fill: VERTEX }, svg);

  // ---- labels
  if (opts.labels) {
    const tag = model.showTag === false ? '' : '^{['+model.tag+']}';
    const hel = (idx, frameMarkup) => opts.helicities && model.showTag !== false ? `, λ_{${idx}}^{[${frameMarkup}]}` : '';
    const queue = [];
    visibleVectors.filter(v => v.labelMarkup !== '' && (finalOnly ? v.leaf : v.depth === 0)).forEach(v => queue.push({
      at: P2(pos(v)), color: v.color, opacity: v.alpha, vectorId: v.id,
      markup: v.labelMarkup ?? `~p_{${v.index_markup}}${tag}`+hel(v.index_markup, v.helicity_markup),
      note: model.kind === 'vertex' && v.depth === 0 && !v.context && model.showTag !== false ? v.role : null }));
    queue.push(...angleLabels);
    queue.push(...(model.extraLabels || []).map(l => ({ at: P2(scl(l.at, scale)), color: l.color, opacity: l.opacity ?? 1, markup: l.markup })));     // additional labels at 3D points
    if (par.alpha > .02) {
      if (parentLong) queue.push({ at: P2(parentStart), color: PARENT, opacity: par.alpha, markup: `~p_{${par.index_markup}}${tag}`+hel('0', par.helicity_markup) });
      else queue.push({ at: [-.1, .15], color: par.index === '0' ? PARENT : par.color, opacity: par.alpha,
                        markup: `~p_{${par.index_markup}}${tag}=~0`+hel(par.index_markup, par.helicity_markup) });
    }
    if (model.kind === 'vertex' && model.showTag !== false) queue.push({ at: [.2, -.1], color: VERTEX, markup: `${model.vertex}_{v}` });
    if (!finalOnly) visibleVectors.filter(v => v.depth > 0 && v.labelMarkup !== '').sort((a, b) => a.depth - b.depth).forEach(v => queue.push({
      at: P2(pos(v)), color: v.color, opacity: Math.max(.5, v.opacity)*v.alpha, vectorId: v.id, small: true,
      markup: v.labelMarkup ?? `~p_{${v.index_markup}}${tag}`+hel(v.index_markup, v.helicity_markup) }));
    placeLabels(svg, queue, { labelSize, ppu, halfW, halfH, moving: !!opts.moving,
      shafts: visibleVectors.map(v => ({ id: v.id, end: P2(pos(v)) })) });
  }

  // ------------------------------------------------------------ inner helpers
  function arrow(g, a3, b3, color, opacity, line) {
    const A = P(a3), B = P(b3);
    const a = [A.x, A.y], b = [B.x, B.y];
    const delta = [b[0]-a[0], b[1]-a[1]], length = Math.hypot(delta[0], delta[1]);
    if (length < .018) {
      const d3 = sub(b3, a3);
      if (norm(d3) > 1e-10) {
        const toward = dot(mv(rot, d3), CAM) > 0;
        el('circle', { cx: f(b[0]), cy: f(b[1]), r: .11, fill: 'none', stroke: color, 'stroke-opacity': opacity, 'stroke-width': 1.1, [NSE]: 'non-scaling-stroke' }, g);
        if (toward) el('circle', { cx: f(b[0]), cy: f(b[1]), r: .035, fill: color, 'fill-opacity': opacity }, g);
        else el('path', { d: `M${f(b[0]-.07)} ${f(b[1]-.07)}L${f(b[0]+.07)} ${f(b[1]+.07)}M${f(b[0]-.07)} ${f(b[1]+.07)}L${f(b[0]+.07)} ${f(b[1]-.07)}`,
                          stroke: color, 'stroke-opacity': opacity, 'stroke-width': 1.1, [NSE]: 'non-scaling-stroke' }, g);
      }
      return;
    }
    const dir = [delta[0]/length, delta[1]/length], nrm = [-dir[1], dir[0]];
    const clip = (lo, hi, x) => Math.min(hi, Math.max(lo, x));
    const w = [A.d, B.d].map(d => clip(.012, .076, .034*Math.exp(.32*d)));
    const at = (p, s, n) => [p[0]+s[0]*n, p[1]+s[1]*n];
    if (line === 'dashed-thin') {
      el('path', { d: `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`, stroke: color, 'stroke-opacity': opacity, 'stroke-width': 1,
                   'stroke-dasharray': '3 3', fill: 'none', [NSE]: 'non-scaling-stroke' }, g);
      const hl = .16, hw = .06, base = [b[0]-hl*dir[0], b[1]-hl*dir[1]];
      el('path', { d: polyPath([b, [base[0]+hw*nrm[0], base[1]+hw*nrm[1]], [base[0]-hw*nrm[0], base[1]-hw*nrm[1]]]), fill: color, 'fill-opacity': opacity }, g);
      return;
    }
    let headLength = Math.min(.28+w[1], .35*length), headWidth = Math.min(.12+w[1], .23*length);
    if (line === 'solid') {
      const base = [b[0]-headLength*dir[0], b[1]-headLength*dir[1]];
      const pts = [at(a, nrm, w[0]), at(base, nrm, w[1]), at(base, nrm, headWidth), b, at(base, nrm, -headWidth), at(base, nrm, -w[1]), at(a, nrm, -w[0])];
      el('path', { d: polyPath(pts), fill: color, 'fill-opacity': opacity }, g);
      return;
    }
    headLength *= .75; headWidth *= .68;
    const base = [b[0]-headLength*dir[0], b[1]-headLength*dir[1]];
    const shaft = length-headLength;
    const [dash, gap] = line === 'dashed' ? [.15, .11] : [.025, .095];
    let d = '';
    const circles = [];
    for (let s = 0; s < shaft; s += dash+gap) {
      const e = Math.min(s+dash, shaft), u = s/shaft, v = e/shaft;
      const wa = .65*((1-u)*w[0]+u*w[1]), wb = .65*((1-v)*w[0]+v*w[1]);
      const p = [a[0]+s*dir[0], a[1]+s*dir[1]], q = [a[0]+e*dir[0], a[1]+e*dir[1]];
      if (line === 'dotted') circles.push([(p[0]+q[0])/2, (p[1]+q[1])/2, Math.max(wa, .014)]);
      else d += polyPath([at(p, nrm, wa), at(q, nrm, wb), at(q, nrm, -wb), at(p, nrm, -wa)]);
    }
    d += polyPath([at(base, nrm, headWidth), b, at(base, nrm, -headWidth)]);
    el('path', { d, fill: color, 'fill-opacity': opacity }, g);
    for (const c of circles) el('circle', { cx: f(c[0]), cy: f(c[1]), r: f(c[2]), fill: color, 'fill-opacity': opacity }, g);
  }
}

/** Painter's order: far items first. Arrows keep their side of each translucent plane whenever the
 *  constraints are consistent; a constraint that would close a cycle (possible with several planes) is skipped. */
function orderItems(items, planes, camWorld) {
  const nodes = [...items.map(it => ({ ...it, kind: 'item' })), ...planes.map(pl => ({ depth: 0, draw: pl.draw, kind: 'plane', pl }))];
  const edges = nodes.map(() => new Set()), indeg = nodes.map(() => 0);
  const reaches = (from, target) => {
    const seen = new Set([from]), stack = [from];
    while (stack.length) { const n = stack.pop(); if (n === target) return true; for (const m of edges[n]) if (!seen.has(m)) { seen.add(m); stack.push(m); } }
    return false;
  };
  nodes.forEach((pn, pi) => {
    if (pn.kind !== 'plane') return;
    const n = pn.pl.normal, facing = Math.sign(dot(camWorld, n)) || 1;
    nodes.forEach((it, ii) => {
      if (it.kind !== 'item') return;
      const a = it.anchor, size = norm(a) || 1;
      const front = dot(a, n)*facing > -1e-6*size;        // in-plane items stay visible above the plane
      const [from, to] = front ? [pi, ii] : [ii, pi];
      if (edges[from].has(to) || reaches(to, from)) return;
      edges[from].add(to); indeg[to]++;
    });
  });
  const ready = nodes.map((n, i) => i).filter(i => indeg[i] === 0), out = [], done = new Set();
  while (ready.length) {
    let best = 0;
    for (let k = 1; k < ready.length; k++) if (nodes[ready[k]].depth < nodes[ready[best]].depth) best = k;
    const i = ready.splice(best, 1)[0];
    out.push(nodes[i]); done.add(i);
    for (const j of edges[i]) if (--indeg[j] === 0) ready.push(j);
  }
  nodes.forEach((n, i) => { if (!done.has(i)) out.push(n); });      // safety net: never drop an element
  return out;
}

// ---------------------------------------------------------------- greedy label placement
function placeLabels(svg, queue, ctx) {
  const { labelSize, ppu, halfW, halfH } = ctx;
  const group = el('g', {}, svg);
  const used = [];
  const samples = [];
  if (!ctx.moving) for (const s of ctx.shafts) for (let k = 1; k <= 24; k++) samples.push({ id: s.id, x: s.end[0]*k/24, y: s.end[1]*k/24 });
  const bounds = { x0: -halfW, x1: halfW, y0: -halfH, y1: halfH };
  const radii = ctx.moving ? [.2*labelSize*5] : [.2, .38, .6, .86, 1.2].map(r => r*labelSize*5);
  const deltas = ctx.moving ? [0] : [0, .6, -.6, 1.2, -1.2, Math.PI/2, -Math.PI/2, Math.PI];
  for (const item of queue) {
    const size = labelSize*(item.small ? .92 : 1);
    const spec = { markup: item.markup, note: item.note, color: item.color, opacity: item.opacity };
    const m = measureLabel(spec, size);
    const [ex, ey] = item.at;
    const radial = Math.hypot(ex, ey) > .1 ? Math.atan2(-ey, ex) : Math.PI;
    let best = null;
    for (const r of radii) {
      for (const dl of deltas) {
        const a = radial+dl;
        const ox = r*Math.cos(a), oy = -r*Math.sin(a);
        const left = ox > .02 ? ex+ox : (ox < -.02 ? ex+ox-m.width : ex+ox-m.width/2);
        const top = oy > .02 ? ey+oy : (oy < -.02 ? ey+oy-m.height : ey+oy-m.height/2);
        const box = { x0: left-.2*size, x1: left+m.width+.2*size, y0: top-.15*size, y1: top+m.height+.2*size };
        let overlap = 0;
        for (const u of used) {
          const w = Math.min(box.x1, u.x1)-Math.max(box.x0, u.x0), h = Math.min(box.y1, u.y1)-Math.max(box.y0, u.y0);
          if (w > 0 && h > 0) overlap += w*h*ppu*ppu;
        }
        let hits = 0;
        for (const s of samples) if (s.id !== item.vectorId && s.x > box.x0 && s.x < box.x1 && s.y > box.y0 && s.y < box.y1) hits++;
        const outside = Math.max(0, bounds.x0-box.x0)+Math.max(0, box.x1-bounds.x1)+Math.max(0, bounds.y0-box.y0)+Math.max(0, box.y1-bounds.y1);
        const score = overlap*20 + outside*ppu*200 + hits*35 + r*ppu + Math.abs(dl)*4;
        if (!best || score < best.score) best = { score, left, top, box, r };
      }
      if (best.score < 60) break;
    }
    if (best.r > labelSize*2.6) {
      const cx = Math.min(best.box.x1, Math.max(best.box.x0, ex)), cy = Math.min(best.box.y1, Math.max(best.box.y0, ey));
      el('path', { d: `M${f(ex)} ${f(ey)}L${f(cx)} ${f(cy)}`, stroke: item.color, 'stroke-opacity': .4, 'stroke-width': .6, [NSE]: 'non-scaling-stroke', fill: 'none' }, group);
    }
    drawLabel(group, spec, m, best.left, best.top, size);
    used.push(best.box);
  }
}
