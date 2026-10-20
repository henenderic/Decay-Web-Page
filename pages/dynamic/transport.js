// Animated transport between frames. Intermediate momenta are sampled by the Python core
// (each operation applied gradually); this module only interpolates between those samples.
//
// Position model: p = number of operations applied so far along the whole chain (0 .. N).
// Frames sit at the cumulative operation counts cum[i]; positions between two frames are
// intermediate states after a single step. Buttons and chips move p; a jump needs no animation.
import { renderScene, staticModel, particlePlanesAvailable, presetView, IDENTITY, XLIM } from '../../render/drawing.js';
import { h, sym, mt, plain, tagNode, up, state, figureLabelPx, attachCamera, zoomButtons, makeOptions, exportSvg, exportPng } from '../../app/common.js';
import { buildLegend } from '../../render/legend.js';
import { buildSketch, vertexId, lineId } from '../../render/sketch.js';
import { buildAmplitude } from './amplitude_row.js';

const smooth = x => { const t = Math.min(1, Math.max(0, x)); return t*t*(3-2*t); };
const clamp01 = x => Math.min(1, Math.max(0, x));
const SECONDS_PER_STEP = 1.8;          // at "Normal"; "Slow" takes twice as long

const AXIS_OF = { Rz: 2, Ry: 1, Bz: 2 };

/** The chains of a branched topology (one per branch) run one after the other in a single animation. After the end of a branch the animation jumps back to the deepest frame
 *  that the next branch shares with it (usually the first vertex, the rest frame of the mother) and goes on from there with the steps of the next branch. The jump is a step
 *  of its own in the list of the steps, `returns` maps the index of its transition to the frames that it undoes. */
function mergeChains(chains) {
  if (chains.length <= 1) return chains[0];
  const stages = chains[0].stages.slice(), returns = new Map();
  let previous = chains[0].stages;
  for (const chain of chains.slice(1)) {
    let k = 0;
    while (k < previous.length && k < chain.stages.length && previous[k] === chain.stages[k]) k++;
    returns.set(stages.length-1, { undone: previous.slice(k) });                      // the transitions into these frames are undone
    stages.push(chain.stages[k-1], ...chain.stages.slice(k));
    previous = chain.stages;
  }
  return { target: chains[chains.length-1].target, stages, returns };
}

export function buildAnimations(payload) {
  return [buildAnimation(payload, mergeChains(payload.animation.chains))];
}

function buildAnimation(payload, chain) {
  const anim = payload.animation, S = anim.samples_per_operation;
  const figs = chain.stages.map(id => payload.figures.find(f => f.id === id));
  // Operations whose parameter vanishes move nothing and are skipped. A transformation that consists of
  // nothing else keeps one placeholder step, so that every frame transition has at least one step.
  const IDENTITY_STEP = { operator: 'I', parameter: 0, factor_markup: '1', description: 'identity (all parameters vanish)',
                          detail: 'All parameters of this transformation vanish, so the momenta keep their coordinates.', samples: null };
  const movingOps = id => anim.transitions[id].operations.filter(op => Math.abs(op.parameter) > 1e-12);
  const isReturn = t => !!chain.returns?.has(t);                               // the transition t is the jump back to an earlier frame
  // The jump back is one step: the steps into the frames of the finished branch are undone, the sampled momenta run backwards, from the last step to the first.
  const returnStep = (ret, t) => {
    const pieces = ret.undone.slice().reverse().flatMap(id => movingOps(id).slice().reverse().filter(op => op.samples).map(op => op.samples.slice().reverse()));
    const all = pieces.flatMap((piece, i) => i ? piece.slice(1) : piece);
    const A = `$[${figs[t].tag_markup}]$`, B = `$[${figs[t+1].tag_markup}]$`;
    return { operator: 'Return', parameter: 0, factor_markup: '@{return}', samples: all.length ? Array.from({ length: S+1 }, (_, k) => all[Math.round(k*(all.length-1)/S)]) : null,
             description: `jump back from ${A} to ${B}: the steps into ${A} are undone in one go`,
             detail: `The decay chain of ${A} is finished. The next branch of the decay topology starts at the vertex of ${B}, so the animation jumps back to the frame ${B}: the steps that led into ${A} are undone in one go (the momenta run back along their paths, in the sketch an arc leads back to the vertex). `
                   + 'The jump is no transformation of its own, it is the inverse of the transformation shown before. From there the steps of the next branch follow.' };
  };
  const trans = chain.stages.slice(1).map((id, t) => {
    if (isReturn(t)) return { from: chain.stages[t], to: id, operations: [returnStep(chain.returns.get(t), t)], omitted: [] };
    const T = anim.transitions[id], moving = movingOps(id);
    return { ...T, operations: moving.length ? moving : [IDENTITY_STEP], omitted: T.operations.filter(op => Math.abs(op.parameter) <= 1e-12) };
  });
  const models = figs.map(staticModel);
  const nodeIndex = new Map(anim.nodes.map((n, i) => [n, i]));
  const last = figs.length - 1;
  const cum = [0]; trans.forEach(T => cum.push(cum[cum.length-1] + T.operations.length));
  const N = cum[last];
  const cs = { rot: IDENTITY.slice(), zoom: 1, shear: 1, mode: 'full',
               planes: { coord: false, particle: false }, labels: true, angles: true, helicities: false, legend: true };
  const run = { p: 0, playing: null, speed: 1 };

  const available = { mode: models.some(m => m.vectors.some(v => !v.leaf || v.context)), coord: true,
                      particle: models.some(particlePlanesAvailable), labels: true,
                      angles: figs.some(f => f.kind === 'vertex' && f.angles), helicities: true };

  // ---------------------------------------------------------------- position bookkeeping
  const stageAt = p => { for (let i = last; i >= 0; i--) if (cum[i] === p) return i; return -1; };   // frame index or -1
  const transOf = opIndex => { for (let t = last-1; t >= 0; t--) if (cum[t] <= opIndex) return t; return 0; };
  /** Transition and local progress for a (possibly fractional) position; direction resolves the frame boundaries. */
  function locate(q, direction) {
    const op = direction >= 0 ? Math.min(Math.floor(q), N-1) : Math.max(Math.ceil(q)-1, 0);
    const t = transOf(op);
    return { t, local: q - cum[t] };
  }
  /** Global index of the step that is in progress (or last finished) for a playing state. */
  const playingStep = pl => Math.max(0, Math.min(N-1, pl.dir > 0 ? Math.floor(pl.q) : Math.ceil(pl.q) - 1));
  function describeStep(g) {
    const t = transOf(g);
    return { t, k: g - cum[t], op: trans[t].operations[g - cum[t]], n: trans[t].operations.length };
  }

  // ---------------------------------------------------------------- blended model between two frames
  function blend(i, progress) {
    const A = figs[i], B = figs[i+1], T = trans[i], ops = T.operations, n = ops.length;
    // the operation that is drawn and its fraction: a finished step stays at its end state
    let op, t;
    if (progress <= 0) { op = 0; t = 0; }
    else if (progress >= n) { op = n-1; t = 1; }
    else if (Number.isInteger(progress)) { op = progress-1; t = 1; }
    else { op = Math.floor(progress); t = smooth(progress-op); }
    const samples = ops[op].samples;
    const kf = t*S, k0 = Math.min(S, Math.floor(kf)), k1 = Math.min(S, k0+1), w = kf-k0;
    const byName = fig => new Map(fig.scene.vectors.map(v => [v.particle, v]));
    const va = byName(A), vb = byName(B);
    const still = name => (va.get(name) || vb.get(name) || A.scene.parent).spatial;      // identity step: nothing moves
    const pos = name => {
      if (!samples) return still(name);
      const a = samples[k0][nodeIndex.get(name)], b = samples[k1][nodeIndex.get(name)];
      return [a[0]+(b[0]-a[0])*w, a[1]+(b[1]-a[1])*w, a[2]+(b[2]-a[2])*w];
    };
    // Frame membership (vectors, helper lines, planes) changes during the last step only.
    // Final states outside the vertex of a frame (context) are visible in the final-states view only.
    const e = smooth(progress-(n-1)), late = e >= .5;
    const full = v => (v && !v.context) ? 1 : 0;
    const vectors = [], trails = [];
    for (const name of anim.nodes) {
      const a = va.get(name), b = vb.get(name);
      if (!a && !b) continue;
      const rep = late ? (b || a) : (a || b);
      const alpha = full(a)*(1-e) + full(b)*e;
      const alphaFinal = (a ? 1 : 0)*(1-e) + (b ? 1 : 0)*e;
      vectors.push({ ...rep, id: name, spatial: pos(name), alpha, alphaFinal });
      if (samples && Math.max(alpha, alphaFinal) > .02 && t > 0) {
        const points = [];
        for (let k = 0; k <= k0; k++) points.push(samples[k][nodeIndex.get(name)]);
        points.push(pos(name));
        trails.push({ points, color: rep.color, alpha, alphaFinal, leaf: rep.leaf, depth: rep.depth });
      }
    }
    // guides and planes: union of both frames, faded with their membership
    const idName = fig => new Map(fig.scene.vectors.map(v => [v.id, v.particle]));
    const ia = idName(A), ib = idName(B), guides = new Map(), planes = new Map();
    const addGuide = (g, names, side) => {
      const key = [names.get(g.start_vector_id), names.get(g.copied_vector_id), names.get(g.sum_vector_id)].join('|');
      const item = guides.get(key) || { startId: names.get(g.start_vector_id), copiedId: names.get(g.copied_vector_id), sumId: names.get(g.sum_vector_id),
                                        color: g.color, opacity: g.opacity, a: 0, b: 0 };
      item[side] = 1; guides.set(key, item);
    };
    A.scene.sum_guides.forEach(g => addGuide(g, ia, 'a')); B.scene.sum_guides.forEach(g => addGuide(g, ib, 'b'));
    const addPlane = (pl, names, side) => {
      // planes of final-state pairs: the same pair keeps its plane from frame to frame
      const item = planes.get(pl.node) || { id: pl.node, node: pl.node, pair: pl.pair, aId: names.get(pl.a_id), bId: names.get(pl.b_id), color: pl.color, a: 0, b: 0 };
      item[side] = 1; planes.set(pl.node, item);
    };
    A.scene.planes.forEach(pl => addPlane(pl, ia, 'a')); B.scene.planes.forEach(pl => addPlane(pl, ib, 'b'));
    const withWeight = item => ({ ...item, weight: item.a*(1-e) + item.b*e });
    // parent arrow only when both frames share the same parent node
    const pa = A.scene.parent, pb = B.scene.parent;
    const parent = pa.node === pb.node ? { ...pa, spatial: pos(pa.node), alpha: 1 } : { ...pa, spatial: [0, 0, 0], alpha: 0 };
    // Scale: constant while only rotations act (lengths do not change). It moves from the scale of the first frame to that of
    // the second during the boost(s) of the transformation, or during the last step if there is no boost.
    const ramp = ops.map((o, j) => o.operator === 'Bz' ? j : -1).filter(j => j >= 0);
    if (!ramp.length) ramp.push(n-1);
    const weight = ramp.reduce((sum, j) => sum + smooth(progress-j), 0)/ramp.length;
    const blendScale = (x, y) => Math.exp((1-weight)*Math.log(x) + weight*Math.log(y));
    const scale = blendScale(A.scene.plot_scale, B.scene.plot_scale);
    const scaleFinal = blendScale(A.scene.plot_scale_final ?? A.scene.plot_scale, B.scene.plot_scale_final ?? B.scene.plot_scale);
    return { kind: 'all', tag: '', vertex: '', scale, scaleFinal, angles: null, vectors, guides: [...guides.values()].map(withWeight),
             planes: [...planes.values()].map(withWeight), parent, showTag: false, operation: op, fraction: t,
             activeAxis: t > 0 ? AXIS_OF[ops[op].operator] : undefined, trails };
  }

  /** What is currently displayed: {model, moving, t, stage?} */
  function current() {
    if (run.playing) { const pl = run.playing; return { model: blend(pl.t, pl.q - cum[pl.t]), moving: true, t: pl.t }; }
    const i = stageAt(run.p);
    if (i >= 0) return { model: models[i], moving: false, t: Math.min(i, last-1), stage: i };
    const { t, local } = locate(run.p, 1);
    return { model: blend(t, local), moving: true, t };
  }

  // ---------------------------------------------------------------- DOM
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'scene'); svg.setAttribute('tabindex', '0'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `Transport from the laboratory frame to [${figs[last].frame_label}]`); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  let lastPpu = 0;
  const ppuNow = () => (svg.clientWidth || 600)/(2*XLIM/cs.zoom);
  const drawOptions = moving => ({ mode: cs.mode, planes: cs.planes, labels: cs.labels, angles: cs.angles, helicities: cs.helicities,
                                   ppu: lastPpu = ppuNow(), labelPx: figureLabelPx(svg.clientWidth), moving });
  const render = () => { const c = current(); renderScene(svg, c.model, cs, drawOptions(c.moving)); updateSketch(); amplitude?.update(run.playing ? run.playing.q : run.p); };
  const ro = new ResizeObserver(() => { if (Math.abs(ppuNow()-lastPpu)/Math.max(lastPpu, 1) > .02) render(); });
  ro.observe(svg);
  let frame = 0;
  const schedule = () => { if (!frame && !run.playing) frame = requestAnimationFrame(() => { frame = 0; render(); }); };
  const setCamera = (rot, zoom, propagate = true, shear = cs.shear) => {
    cs.rot = rot; cs.zoom = zoom; cs.shear = shear; schedule();
  };
  attachCamera(svg, cs, setCamera);

  // The Feynman sketch of the decay topology follows the animation, in the colours of the particles. In the laboratory frame the beginning of the line of the mother is lit; while the
  // event is transformed into the rest frame of the mother, the line fills up like a loading bar. In the rest frame of a decaying particle its vertex glows, the lines of the
  // final states are lit completely, those of intermediate states only at their tips. On the way to the next rest frame the line of the intermediate state fills up while the
  // previous line, the vertex and the final states fade out, so that on arrival only the line is lit; then the next vertex glows. When the animation jumps back to an earlier
  // vertex (the next branch starts there), the vertex where the branch ended and its lines fade, a dashed arc leads back, and the vertex of the target glows again.
  const sketch = payload.topologies ? buildSketch(payload.topologies.decay, { width: 380, labelPx: 11.5, maxHeight: 250, emphasis: { scale: 1.4, weight: 700 } }) : null;
  const colors = new Map();                                                      // the colour of every particle, as in the figures
  for (const fig of figs) { colors.set(fig.scene.parent.node, fig.scene.parent.color); for (const v of fig.scene.vectors) colors.set(v.particle, v.color); }
  function updateSketch() {
    if (!sketch) return;
    const L = sketch.layout, items = new Map(), TIP = .28, GAP = .2;               // an isobar line is lit at its tip when it leaves a vertex; on arrival it is lit from GAP on, so that the colour does not reach back to the previous vertex
    const colorOf = name => colors.get(name) || '#0F7C8F';
    const nodeOf = fig => fig.node ? L.byName.get(fig.node) : null;
    const incoming = n => n.path === '' ? 'in' : lineId(n);
    const decaying = n => colorOf(n.path === '' ? '0' : n.name);                 // the colour of the particle that decays at a vertex
    const frame = (n, k, mark) => {
      const spec = (extra = {}) => ({ v: k, color: decaying(n), ...extra });
      items.set(vertexId(n), spec()); items.set(incoming(n), n.path === '' ? spec() : spec({ window: [GAP, 1] }));
      for (const child of n.children || []) items.set(lineId(child), child.leaf ? { v: k, color: colorOf(child.name) } : { v: k, color: colorOf(child.name), window: [0, TIP] });
    };
    const c = current();
    if (!c.moving) {
      const n = nodeOf(figs[c.stage]);
      if (n) frame(n, 1); else items.set('in', { color: colorOf('0'), window: [0, .1] });       // laboratory frame: only the beginning of the line of the mother
    } else if (isReturn(c.t)) {
      const X = nodeOf(figs[c.t]), Y = nodeOf(figs[c.t+1]);                                  // from the vertex where the branch ended back to the vertex of the next branch
      const q = run.playing ? run.playing.q : run.p, P = clamp01(q-cum[c.t]), leave = clamp01(P/.6), arrive = clamp01((P-.4)/.6);
      const onPath = child => X.path.startsWith(child.path);                               // the line of this child leads towards X
      items.set(vertexId(X), { v: 1-leave, color: decaying(X) });
      for (const child of X.children) items.set(lineId(child), child.leaf ? { v: 1-leave, color: colorOf(child.name) } : { v: 1-leave, color: colorOf(child.name), window: [0, TIP] });
      if (X.parent === Y) items.set(lineId(X), { color: colorOf(X.name), window: [GAP*(1-leave), TIP+(1-TIP)*(1-leave)] });          // the colour of its line runs back to the vertex
      else items.set(lineId(X), { v: 1-leave, color: colorOf(X.name), window: [GAP, 1] });
      items.set(vertexId(Y), { v: arrive, color: decaying(Y) });
      items.set(incoming(Y), Y.path === '' ? { v: arrive, color: decaying(Y) } : { v: arrive, color: decaying(Y), window: [GAP, 1] });
      for (const child of Y.children) {
        if (child === X) continue;
        if (onPath(child)) items.set(lineId(child), { color: colorOf(child.name), window: [0, TIP*arrive] });
        else items.set(lineId(child), child.leaf ? { v: arrive, color: colorOf(child.name) } : { v: arrive, color: colorOf(child.name), window: [0, TIP] });
      }
      items.set('jump', { v: Math.min(1, 4*P, 4*(1-P)), from: X.name, to: Y.name });
    } else {
      const A = figs[c.t], B = figs[c.t+1], nA = nodeOf(A), nB = nodeOf(B);
      const q = run.playing ? run.playing.q : run.p, n = trans[c.t].operations.length, P = clamp01((q-cum[c.t])/n);
      const loadEnd = n > 1 ? (n-1)/n : .5, load = clamp01(P/loadEnd), grow = clamp01((P-loadEnd)/(1-loadEnd));      // the line fills up with the steps, in the last step the next vertex glows and its lines grow out of it
      if (!nA) items.set('in', { color: colorOf('0'), window: [0, .1+.9*load] });             // the line of the mother fills up with the steps
      else {
        const gone = 1-load;
        items.set(vertexId(nA), { v: gone, color: decaying(nA) });
        items.set(incoming(nA), { color: decaying(nA), window: [nA.path === '' ? load : GAP+(1-GAP)*load, 1] });      // the previous line is taken down from its start
        for (const child of nA.children) if (child !== nB) items.set(lineId(child), child.leaf ? { v: gone, color: colorOf(child.name) } : { v: gone, color: colorOf(child.name), window: [0, TIP] });
        if (nB) items.set(lineId(nB), { color: colorOf(nB.name), window: [GAP*load, TIP+(1-TIP)*load] });       // the line of the intermediate state fills up, its beginning is let go
      }
      if (nB && grow > 0) {
        items.set(vertexId(nB), { v: grow, color: decaying(nB) });
        for (const child of nB.children) items.set(lineId(child), { color: colorOf(child.name), window: [0, child.leaf ? grow : TIP*grow] });
      }
    }
    sketch.update(items);
  }
  const amplitude = buildAmplitude({ payload, figs, cum, trans });                // the amplitude row: the terms appear with the position of the animation
  const legendBox = h('div', { class: 'legend-box' });
  const renderLegend = () => {
    const c = current(), A = figs[c.t], B = figs[c.t+1], P = isReturn(c.t) ? A : B, parameters = P.path[P.path.length-1].parameters;      // the parameters of the transformation that is shown or next (undone, for a jump back)
    if (c.moving) legendBox.replaceChildren(buildLegend(c.model, { mode: cs.mode, angles: false, helicities: false, planes: cs.planes, decay: B.decay_markup, parameters,
                                                                  frameName: `[${A.frame_label}] → [${B.frame_label}]`, frameLabel: B.frame_label, moving: true }));
    else { const f = figs[c.stage]; legendBox.replaceChildren(buildLegend(c.model, { mode: cs.mode, angles: cs.angles, helicities: cs.helicities, planes: cs.planes, decay: f.decay_markup,
                                                                                   parameters: c.stage === 0 ? parameters : f.path[f.path.length-1].parameters, frameName: f.title, frameLabel: f.frame_label })); }
  };

  // The frame in which the helicity of a particle is defined (the rest frame of its parent) can be visited from here
  const helBox = h('div', { class: 'hel-box' });
  const renderHelicity = () => {
    helBox.hidden = !cs.helicities;
    if (!cs.helicities) return;
    const indexOf = name => { for (const f of figs) { const v = f.scene.vectors.find(x => x.particle === name); if (v) return v.index_markup; } return name; };
    const atStage = !run.playing ? stageAt(run.p) : -1;
    const rows = figs.map((f, i) => {
      if (figs.indexOf(f) !== i) return null;                                          // a frame that is visited twice is listed once
      const names = Object.entries(payload.helicity_frames || {}).filter(([, hf]) => hf.figure === f.id).map(([name]) => name);
      if (!names.length) return null;
      return h('div', { class: 'hel-row' + (atStage === i ? ' current' : '') }, [
        'In ', tagNode(f.tag_markup), ': ', ...names.flatMap((name, k) => [k ? ', ' : '', sym(`λ_{${indexOf(name)}}`)]),
        h('button', { type: 'button', title: 'Jump to this frame without animation', text: atStage === i ? 'shown' : 'Show frame', disabled: atStage === i, onclick: () => jump(cum[i]) })]);
    }).filter(Boolean);
    helBox.replaceChildren(h('div', { class: 'hel-title', text: 'Frame in which each helicity is defined' }), ...rows,
      h('div', { class: 'hel-note', text: 'The labels in the figures always refer to the frame that is displayed; the rest frame of the parent of a particle is the frame of its helicity.' }));
  };

  const opts = makeOptions(cs, available, () => { opts.sync(); render(); renderLegend(); renderHelicity(); });
  const view = { root: null, render, stop: () => { if (run.playing) cancelAnimationFrame(run.playing.frame); run.playing = null; } };

  const strip = h('div', { class: 'stage-strip' });
  const stepNow = h('div', { class: 'step-now', 'aria-live': 'polite' });
  const bar = h('div', { class: 'step-bar' }, h('div', { class: 'step-fill' }));
  const rows = h('div', { class: 'step-rows' });
  const nextFrame = () => { for (let i = 0; i <= last; i++) if (cum[i] > run.p) return cum[i]; return N; };
  const prevFrame = () => { for (let i = last; i >= 0; i--) if (cum[i] < run.p) return cum[i]; return 0; };
  const button = (text, title, onclick, cls = '') => h('button', { type: 'button', class: cls, title, onclick }, text);
  const frameBack = button('« Frame', 'Back to the previous frame, without stopping at the single steps', () => moveTo(prevFrame()));
  const stepBack = button('‹ Step', '', () => moveTo(run.p-1));
  const stepFwd = button('Step ›', '', () => moveTo(run.p+1), 'primary-small');
  // the bubble of a step button explains the step that it would apply (or undo), without the hint to click
  const stepTip = (btn) => { const tip = h('span', { class: 'tip', role: 'tooltip', hidden: true }); return { host: h('span', { class: 'tip-host' }, [btn, tip]), tip }; };
  const backTip = stepTip(stepBack), fwdTip = stepTip(stepFwd);
  function updateStepTips() {
    const fill = ({ tip }, index, verb) => {
      if (run.playing || index < 0 || index >= N) { tip.hidden = true; tip.replaceChildren(); return; }
      const { op, k, n } = describeStep(index);
      tip.hidden = false;
      tip.replaceChildren(h('span', { class: 'tip-title' }, [`${verb} step ${k+1} of ${n}: `, op.operator === 'I' ? 'identity' : sym(op.factor_markup)]), h('span', { class: 'tip-text' }, mt(op.detail || op.description)));
    };
    fill(fwdTip, run.p, 'Apply'); fill(backTip, run.p-1, 'Undo');
  }
  const frameFwd = button('Frame »', 'Apply all remaining steps up to the next frame', () => moveTo(nextFrame()), 'primary-small');
  const playAll = button('Play all', 'Play the whole animation from the laboratory frame to the last frame, without stopping at the frames', () => { jump(0); moveTo(N); }, 'primary-small');
  const reset = button('Reset', 'Back to the laboratory frame', () => jump(0));
  const speed = h('select', { 'aria-label': 'Speed', onchange: e => { run.speed = Number(e.target.value); } },
    [['1', 'Normal'], ['0.5', 'Slow']].map(([v, t]) => h('option', { value: v, text: t })));
  const preset = (name, label, title) => h('button', { type: 'button', title, text: label,
    onclick: () => setCamera(name ? presetView(name) : IDENTITY.slice(), name ? cs.zoom : 1, true, name ? 0 : 1) });
  const viewTools = h('div', { class: 'opt-group' }, [h('div', { class: 'opt-title', text: 'View' }), h('div', { class: 'toolbar-buttons' }, [
    preset(null, 'Default', 'Oblique view of the template figure'), preset('z', 'xy', 'View along z'), preset('x', 'yz', 'View along x'), preset('y', 'zx', 'View along y'),
    ...zoomButtons(cs, setCamera),
    h('button', { type: 'button', text: 'SVG', title: 'Save the current view as SVG', onclick: () => exportSvg(svg, { id: 'transport_'+chain.target }) }),
    h('button', { type: 'button', text: 'PNG', title: 'Save the current view as PNG', onclick: () => exportPng(svg, { id: 'transport_'+chain.target }) })])]);
  const controls = h('div', { class: 'transport-controls' }, [frameBack, backTip.host, fwdTip.host, frameFwd, playAll, reset, h('label', { class: 'speed' }, ['Speed ', speed])]);

  const headTitle = h('h3'), headLine = h('p', { class: 'decay-line' }), headTag = h('div', { class: 'frame-tag' });
  function updateHeading() {
    const c = current();
    if (!c.moving) {
      const f = figs[c.stage];
      headTitle.replaceChildren(...mt(f.title_markup)); headLine.replaceChildren(sym(f.decay_markup)); headTag.replaceChildren(tagNode(f.tag_markup));
      return;
    }
    const A = figs[c.t], B = figs[c.t+1], n = trans[c.t].operations.length;
    headTitle.replaceChildren(...mt(A.title_markup), ' → ', ...mt(B.title_markup));
    headLine.textContent = run.playing ? `Step ${describeStep(playingStep(run.playing)).k + 1} of ${n} in progress` : `After step ${run.p - cum[c.t]} of ${n}`;
    headTag.replaceChildren(tagNode(A.tag_markup), ' → ', tagNode(B.tag_markup));
  }

  // one chip per operation; hovering (or focusing) it explains the step in detail, clicking jumps to the state after it
  const chipFor = (op, t, k, n) => {
    const label = op.operator === 'I' ? 'identity' : sym(op.factor_markup);
    return h('button', { type: 'button', class: 'op-chip', 'data-t': t, 'data-k': k, 'aria-label': `Go to the state after step ${k+1} of ${n}: ${plain(op.description)}`,
                         onclick: () => jump(cum[t] + k + 1) }, [
      h('span', { class: 'op-chip-label' }, [`${k+1}. `, label]),
      h('span', { class: 'tip', role: 'tooltip' }, [
        h('span', { class: 'tip-title' }, [`Step ${k+1} of ${n}: `, op.operator === 'I' ? 'identity' : sym(op.factor_markup)]),
        h('span', { class: 'tip-text' }, mt(op.detail || op.description)),
        h('span', { class: 'tip-hint', text: 'Click to jump to the state after this step.' })])]);
  };
  function buildRows() {
    rows.replaceChildren(...trans.map((T, t) => {
      const omitted = isReturn(t) ? ' (jump back: the next branch starts here again)' : T.omitted.length ? ` (no step for ${T.omitted.map(o => o.factor_markup.replace(/[_^{}\\]/g, '')).join(', ')}: parameter zero)` : '';
      return h('div', { class: 'step-row' + (isReturn(t) ? ' jump-row' : '') }, [
        h('div', { class: 'step-row-label' }, [tagNode(figs[t].tag_markup), isReturn(t) ? ' ↩ ' : ' → ', tagNode(figs[t+1].tag_markup), h('span', { class: 'omitted', text: omitted })]),
        h('div', { class: 'op-chips' }, T.operations.map((op, k) => chipFor(op, t, k, T.operations.length)))]);
    }));
  }
  function setChipStates() {
    // completed steps are marked, the step shown (finished or in progress) is highlighted
    const pl = run.playing;
    const doneCount = pl ? playingStep(pl) : run.p, activeOp = pl ? playingStep(pl) : run.p - 1;
    rows.querySelectorAll('.op-chip').forEach(c => {
      const g = cum[Number(c.dataset.t)] + Number(c.dataset.k);
      c.classList.toggle('done', g < doneCount);
      c.classList.toggle('active', g === activeOp);
    });
  }
  function setStepText(shownFraction) {
    const pl = run.playing;
    if (pl) {
      const { k, op, n } = describeStep(playingStep(pl));
      stepNow.replaceChildren(h('span', { class: 'step-index', text: `Step ${k+1} of ${n}` }), ' — ', op.operator === 'I' ? 'identity' : sym(op.factor_markup), ': ', ...mt(op.description));
      stepNow.title = plain(op.detail || '');
      bar.hidden = false; bar.firstChild.style.width = `${clamp01(shownFraction ?? 0)*100}%`;
      return;
    }
    bar.hidden = true; stepNow.title = '';
    const i = stageAt(run.p);
    if (i >= 0 && run.p === 0) {
      stepNow.replaceChildren(h('span', { class: 'step-index', text: 'Start' }), ' — laboratory frame. “Step” applies a single step, “Frame” the whole transformation to the next frame, “Play all” the complete animation; the steps below can be clicked to jump.');
    } else if (i >= 0) {
      stepNow.replaceChildren(h('span', { class: 'step-index', text: 'Frame reached' }), ' — ', tagNode(figs[i].tag_markup), ', ', ...mt(figs[i].title_markup.replace(/^./, ch => ch.toLowerCase())), '.');
    } else {
      const { k, op, n } = describeStep(run.p - 1);
      stepNow.replaceChildren(h('span', { class: 'step-index', text: `After step ${k+1} of ${n}` }), ' — ', op.operator === 'I' ? 'identity' : sym(op.factor_markup), ': ', ...mt(op.description));
      stepNow.title = plain(op.detail || '');
    }
  }

  function updateUi() {
    const c = current(), busy = !!run.playing;
    strip.replaceChildren(...figs.flatMap((f, i) => {
      const reached = cum[i] <= run.p, atFrame = !busy && stageAt(run.p) === i;
      const chip = h('button', { type: 'button', class: 'stage-chip' + (atFrame ? ' current' : reached ? ' done' : ''), title: 'Jump to this frame',
                                 onclick: () => jump(cum[i]) }, tagNode(f.tag_markup));
      return i ? [isReturn(i-1) ? h('span', { class: 'stage-arrow jump', title: 'The animation jumps back here: the next branch starts at this frame again', text: '↩' }) : h('span', { class: 'stage-arrow', text: '→' }), chip] : [chip];
    }));
    updateHeading();
    frameBack.disabled = stepBack.disabled = busy || run.p === 0;
    frameFwd.disabled = stepFwd.disabled = busy || run.p === N;
    playAll.disabled = busy;
    setChipStates();
    setStepText(busy ? 0 : null);
    updateStepTips();
    renderLegend(); renderHelicity();
  }

  // ---------------------------------------------------------------- movement
  /** Direct jump, no animation. */
  function jump(p) {
    view.stop();
    run.p = Math.max(0, Math.min(N, p));
    updateUi(); render();
  }
  /** Animated move between two positions of the same transition. */
  function moveTo(target) {
    if (run.playing) return;
    target = Math.max(0, Math.min(N, target));
    const from = run.p;
    if (target === from) return;
    const dir = Math.sign(target-from), count = Math.abs(target-from);
    const playing = run.playing = { t: locate(from, dir).t, q: from, dir, frame: 0 };
    let t0 = null;
    const finish = () => { run.playing = null; run.p = target; updateUi(); render(); };
    const tick = now => {
      if (run.playing !== playing) return;
      if (t0 === null) t0 = now;                                  // first frame timestamp = start (it may precede performance.now())
      const elapsed = Math.max(0, (now-t0)/1000*run.speed/SECONDS_PER_STEP);
      if (elapsed >= count) { finish(); return; }
      playing.q = from + dir*elapsed;
      playing.t = transOf(playingStep(playing));
      const frac = dir > 0 ? playing.q - Math.floor(playing.q) : Math.ceil(playing.q) - playing.q;
      setChipStates(); setStepText(smooth(frac)); updateHeading();
      try { render(); } catch (error) { finish(); throw error; }
      playing.frame = requestAnimationFrame(tick);
    };
    updateUi();
    playing.frame = requestAnimationFrame(tick);
  }

  // pointers to the explanation pages
  const pageLink = (page, text, title) => h('button', { type: 'button', class: 'link-button', title, text, onclick: () => state.showPage(page) });
  const pageLinks = h('div', { class: 'sub-section page-links' }, [h('span', { text: 'Explanations: ' }),
    pageLink('notation', 'Notation of the frame labels', 'How to read the labels in square brackets'),
    pageLink('greenwich', 'Greenwich convention', 'Why the step R_z(−χ) is needed and how it fixes the root axes'),
    payload.alignment ? pageLink('next', 'Next step: helicities in the reference topology', 'How the helicity bases of the decay topology are aligned with the reference topology') : null]);
  const heading = h('div', { class: 'card-heading' }, [h('div', { class: 'heading-line' }, [headTitle, headTag, headLine])]);
  // three columns: options and view tools (left), the figure, and the choice of frames and steps with the legend (right)
  const sketchBox = sketch ? h('div', { class: 'sketch-box' }, [h('div', { class: 'opt-title' }, ['Decay topology ', sym(up(payload.topologies.decay_label))]), sketch.svg]) : null;
  const right = h('div', { class: 'card-right' }, [h('div', { class: 'stage-strip-box' }, [h('div', { class: 'opt-title', text: 'Frames' }), strip]),
    h('div', { class: 'step-panel' }, [stepNow, bar, rows]), controls, sketchBox, helBox]);
  const amplitudeSlot = h('div', { class: 'amplitude-slot' }, amplitude ? amplitude.root : []);          // the amplitude that is built up step by step, above the legend
  const root = h('article', { class: 'frame-card animation-card', id: 'animation-'+chain.target }, [
    heading,
    h('div', { class: 'card-body' }, [h('aside', { class: 'card-side' }, [opts.node, viewTools]), h('div', { class: 'card-main' }, svg), right]),
    amplitudeSlot, legendBox,
    pageLinks,
  ]);
  view.root = root;
  buildRows(); opts.sync(); updateUi();
  requestAnimationFrame(render);
  return view;
}
