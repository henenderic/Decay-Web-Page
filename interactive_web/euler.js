// Section "Prerequisite: Euler rotations" (a foldout of the page "Greenwich convention"): the z-y-z convention used throughout. The figures re-model the three Euler sketches of the manuscript
// (fig_EulerRotationAlpha, ...Beta, ...Gamma) in the drawing style of the application, and the animation applies the same three steps.
// Frame k is the frame after k steps; its axes are the columns of M_k = M_{k-1} R_local(angle_k), so that M_3 = R_z(a) R_y(b) R_z(g).
import { renderScene, presetView, IDENTITY, XLIM } from './drawing.js';
import { h, num, mt, sym, state, figureLabelPx, attachCamera } from './common.js';

const NS = 'http://www.w3.org/2000/svg';
// one colour per step (alpha blue, beta red, gamma green) with similar lightness and saturation; the initial frame is grey
const COLORS = ['#2F6DB5', '#C2473B', '#3E9468'];
const TEXT_COLORS = COLORS;
const GREY = '#69757D';
const DEG = Math.PI/180;
const SECONDS_PER_STEP = 1.8;
const ZOOM = 1.45;                                                    // the same zoom for the figures and the animation; the user cannot change it
const smooth = x => { const t = Math.min(1, Math.max(0, x)); return t*t*(3-2*t); };
const rz = a => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];
const ry = a => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]];
const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
const column = (M, j) => [M[0][j], M[1][j], M[2][j]];
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const mm9 = (A, B) => { const R = new Array(9); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R[3*i+j] = A[3*i]*B[j] + A[3*i+1]*B[3+j] + A[3*i+2]*B[6+j]; return R; };
/** Camera of the figures: orthographic, the z axis pointing up and the x axis towards the viewer (slightly to the left), y to the right. */
function eulerView() {
  const az = 20*DEG, el = 22*DEG;
  const c = [Math.cos(el)*Math.cos(az), Math.cos(el)*Math.sin(az), Math.sin(el)];                     // towards the viewer
  const r = [-Math.sin(az), Math.cos(az), 0];                                                          // to the right
  const u = [c[1]*r[2]-c[2]*r[1], c[2]*r[0]-c[0]*r[2], c[0]*r[1]-c[1]*r[0]];                          // up = c x r
  return mm9(presetView('z'), [...r, ...u, ...c]);                                                     // template matrix times the rows (r, u, c)
}
const EULER_ROT = eulerView();

const STEPS = [
  { angle: 'α', factor: 'R_z(α)', local: rz, about: '$z$', trail: 0, axis: 2, labels: ['x^{′}', 'y^{′}', ''],
    title: 'Rotation about the $z$ axis',
    detail: 'All vectors, and the axes carried along with them, turn about the $z$ axis of the starting frame. The axes $x$, $y$ become $x′$, $y′$; the $z$ axis stays.' },
  { angle: 'β', factor: 'R_y(β)', local: ry, about: '$y′$', trail: 2, axis: 1, labels: ['x^{″}', '', 'Z'],
    title: 'Rotation about the new $y$ axis',
    detail: 'All vectors, and the axes carried along with them, turn about the carried axis $y′$. The $z$ axis tilts into the new axis $Z$, and $x′$ becomes $x″$; the axis $y′$ stays.' },
  { angle: 'γ', factor: 'R_z(γ)', local: rz, about: '$Z$', trail: 0, axis: 2, labels: ['X', 'Y', ''],
    title: 'Rotation about the new $z$ axis',
    detail: 'All vectors, and the axes carried along with them, turn about the carried axis $Z$. The axes $x″$, $y′$ become $X$, $Y$; the axis $Z$ stays.' },
];

/** The scene after `stage` steps (stage 0: none), the step `stage` being applied up to the fraction t; angles in radians.
 *  The starting frame and the frame of the step in progress carry their three coordinate planes (xy, xz, yz), drawn like the walls of the box; the planes of
 *  completed steps are removed, their axes stay faded. Plain axes have small arrow heads; a circular arrow around the axis of the last rotation shows its direction. */
function sceneModel(angles, stage, t) {
  const frames = [I3];
  for (let k = 0; k < 3; k++) frames.push(mul(frames[k], STEPS[k].local(angles[k])));
  const axes3d = [], frameBoxes = [], trails = [], extraLabels = [], circles = [];
  const axesOf = M => [0, 1, 2].map(j => column(M, j));
  frameBoxes.push({ axes: axesOf(I3), size: 1, color: GREY, fillOpacity: .05, strength: .8 });        // the fixed starting frame
  const add = (k, M, faded) => {
    const labels = STEPS[k-1].labels;
    if (!faded) frameBoxes.push({ axes: axesOf(M), size: 1, color: COLORS[k-1], fillOpacity: .08, strength: 1 });
    [0, 1, 2].forEach(j => {
      axes3d.push({ tip: column(M, j), color: COLORS[k-1], opacity: faded ? .4 : 1, width: faded ? 1 : 1.5, dash: false });
      if (labels[j] !== '') extraLabels.push({ at: column(M, j).map(x => x*1.12), markup: labels[j], color: TEXT_COLORS[k-1], opacity: faded ? .55 : 1 });
    });
  };
  for (let k = 1; k < stage; k++) add(k, frames[k], true);
  if (stage >= 1) {
    const step = STEPS[stage-1], theta = angles[stage-1];
    add(stage, mul(frames[stage-1], step.local(t*theta)), false);
    const before = frames[stage-1], j = step.axis;                    // the axis of this rotation, as it is before the step; (u, v, axis) is right-handed
    circles.push({ center: column(before, j).map(x => x*.62), u: column(before, (j+1) % 3), v: column(before, (j+2) % 3), radius: .24, start: .3, sweep: (theta < 0 ? -1 : 1)*4.4,
                   color: COLORS[stage-1], width: 1.7 });
    if (t > 0 && Math.abs(theta) > 1e-9) {
      const tip = tau => column(mul(frames[stage-1], step.local(tau*theta)), step.trail);
      const points = []; for (let k = 0; k <= 48; k++) points.push(tip(t*k/48));
      trails.push({ points, color: COLORS[stage-1], alpha: 1, alphaFinal: 1, leaf: true, depth: 0 });
      const mid = tip(t/2);
      extraLabels.push({ at: mid.map(x => x*.82), markup: step.angle, color: TEXT_COLORS[stage-1] });
    }
  }
  return { kind: 'all', tag: '', vertex: '', scale: 2.6, scaleFinal: 2.6, angles: null, showTag: false, vectors: [], guides: [], planes: [], trails, extraLabels, axes3d, frameBoxes, circles,
           parent: { spatial: [0, 0, 0], alpha: 0, color: '#394953', index: '0', index_markup: '0' },
           activeAxis: stage === 1 && t > 0 && t < 1 ? 2 : undefined, axisMarkup: ['x', 'y', 'z'], boxSigns: [-1, -1, -1] };      // walls behind and at the left, and a floor
}

const OPTIONS = ppu => ({ mode: 'full', planes: { coord: false, particle: false }, labels: true, angles: false, helicities: false, ppu, moving: false });

/** The content of the foldout; `next` tells whether the page "Next step" exists (the text then links to it). */
export function buildEulerPage({ next = false } = {}) {
  const link = (page, text) => h('button', { type: 'button', class: 'link-button', text, onclick: () => state.showPage(page) });
  const run = { p: 0, playing: null, speed: 1, angles: [50, 40, 60] };
  const rad = () => run.angles.map(a => a*DEG);

  // ---------------------------------------------------------------- the three figures, one per step
  const staticSvgs = STEPS.map((step, k) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'scene euler-scene'); svg.setAttribute('role', 'img'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('aria-label', `Frame after step ${k+1}: rotation by ${step.angle}`);
    return svg;
  });
  const staticCs = STEPS.map(() => ({ rot: EULER_ROT.slice(), zoom: ZOOM, shear: 0 }));      // every figure has its own camera, all with the same zoom
  const renderStaticOne = k => {
    const svg = staticSvgs[k], cs = staticCs[k], ppu = (svg.clientWidth || 340)/(2*XLIM/cs.zoom);
    renderScene(svg, sceneModel(rad(), k+1, 1), cs, { ...OPTIONS(ppu), labelPx: figureLabelPx(svg.clientWidth) });
  };
  const renderStatic = () => staticSvgs.forEach((svg, k) => renderStaticOne(k));
  staticSvgs.forEach((svg, k) => {                                  // drag to rotate, Ctrl + scroll to zoom, double-click to reset
    let pending = 0;
    svg.setAttribute('tabindex', '0');
    attachCamera(svg, staticCs[k], (rot, zoom, propagate, shear = staticCs[k].shear) => {
      const reset = zoom === 1 && rot.every((x, i) => x === IDENTITY[i]);                       // the double click of attachCamera
      Object.assign(staticCs[k], reset ? { rot: EULER_ROT.slice(), zoom: ZOOM, shear: 0 } : { rot, zoom: ZOOM, shear });
      if (!pending) pending = requestAnimationFrame(() => { pending = 0; renderStaticOne(k); });
    }, { zoom: false });
  });
  const figure = (k, caption) => h('figure', { class: 'euler-figure' }, [staticSvgs[k], h('figcaption', {}, caption)]);

  // ---------------------------------------------------------------- the animation
  const cs = { rot: EULER_ROT.slice(), zoom: ZOOM, shear: 0 };
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'scene'); svg.setAttribute('tabindex', '0'); svg.setAttribute('role', 'img'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-label', 'Animation of the three Euler rotations');
  const positionModel = (q, moving) => {
    if (q <= 0) return sceneModel(rad(), 0, 0);
    if (Number.isInteger(q)) return sceneModel(rad(), q, 1);
    return sceneModel(rad(), Math.floor(q)+1, smooth(q-Math.floor(q)));
  };
  let lastPpu = 0;
  const ppuNow = () => (svg.clientWidth || 520)/(2*XLIM/cs.zoom);
  const render = () => {
    const moving = !!run.playing;
    renderScene(svg, positionModel(moving ? run.playing.q : run.p, moving), cs, { ...OPTIONS(lastPpu = ppuNow()), labelPx: figureLabelPx(svg.clientWidth), moving });
    renderStatic();
  };
  new ResizeObserver(() => { if (svg.clientWidth && Math.abs(ppuNow()-lastPpu)/Math.max(lastPpu, 1) > .02) render(); }).observe(svg);
  let pending = 0;
  const schedule = () => { if (!pending && !run.playing) pending = requestAnimationFrame(() => { pending = 0; render(); }); };
  const setCamera = (rot, zoom, propagate, shear = cs.shear) => {
    if (zoom === 1 && rot.every((x, i) => x === IDENTITY[i])) { rot = EULER_ROT.slice(); shear = 0; }       // the double click: back to the default view
    cs.rot = rot; cs.zoom = ZOOM; cs.shear = shear; schedule();
  };
  attachCamera(svg, cs, setCamera, { zoom: false });
  const preset = (name, label, title) => h('button', { type: 'button', title, text: label,
    onclick: () => setCamera(name ? presetView(name) : EULER_ROT.slice(), ZOOM, false, 0) });
  const viewTools = h('div', { class: 'toolbar-buttons' }, [preset(null, 'Default', 'The z axis up, the x axis towards the viewer'), preset('z', 'xy', 'View along z'), preset('x', 'yz', 'View along x'), preset('y', 'zx', 'View along y')]);

  const stepNow = h('div', { class: 'step-now', 'aria-live': 'polite' });
  const bar = h('div', { class: 'step-bar' }, h('div', { class: 'step-fill' }));
  const chips = h('div', { class: 'op-chips' });
  const btn = (text, title, onclick, cls = '') => h('button', { type: 'button', class: cls, title, onclick }, text);
  const reset = btn('Reset', 'Back to the starting frame', () => jump(0));
  const back = btn('‹ Step', 'Undo one rotation', () => moveTo(run.p-1));
  const fwd = btn('Step ›', 'Apply the next rotation', () => moveTo(run.p+1), 'primary-small');
  const all = btn('All steps »', 'Apply all remaining rotations', () => moveTo(3), 'primary-small');
  const speed = h('select', { 'aria-label': 'Speed', onchange: e => { run.speed = Number(e.target.value); } }, [['1', 'Normal'], ['0.5', 'Slow']].map(([v, t]) => h('option', { value: v, text: t })));
  const controls = h('div', { class: 'transport-controls' }, [reset, back, fwd, all, h('label', { class: 'speed' }, ['Speed ', speed])]);
  const inputs = STEPS.map((step, k) => h('input', { type: 'number', step: '5', min: '-180', max: '180', value: String(run.angles[k]), 'aria-label': `${step.angle} in degrees`,
    oninput: e => { const v = Number(e.target.value); if (Number.isFinite(v)) { run.angles[k] = v; view.stop(); updateUi(); render(); } } }));
  const angleBox = h('div', { class: 'euler-angles' }, STEPS.flatMap((step, k) => [h('label', {}, [sym(step.angle), ' ', inputs[k], '°'])]));

  const stepIndex = q => Math.max(0, Math.min(2, run.playing ? (run.playing.dir > 0 ? Math.floor(q) : Math.ceil(q)-1) : q-1));
  function setText(frac) {
    const pl = run.playing;
    if (pl) {
      const k = stepIndex(pl.q), s = STEPS[k], total = run.angles[k];
      stepNow.replaceChildren(h('span', { class: 'step-index', text: `Step ${k+1} of 3` }), ' — ', sym(s.factor), ': ', ...mt(s.title), h('span', { class: 'step-value', text: `  ${num(total*frac, 1)}° of ${num(total, 1)}°` }));
      stepNow.title = ''; bar.hidden = false; bar.firstChild.style.width = `${Math.min(1, Math.max(0, frac))*100}%`;
      return;
    }
    bar.hidden = true; stepNow.title = '';
    if (run.p === 0) stepNow.replaceChildren(h('span', { class: 'step-index', text: 'Start' }), ' — ', ...mt('the axes coincide with the fixed axes $x$, $y$, $z$. Each step rotates them about one of their own axes; the coloured axes belong to the step just applied, earlier ones stay faded.'));
    else if (run.p === 3) stepNow.replaceChildren(h('span', { class: 'step-index', text: 'All steps applied' }), ' — ', ...mt('the axes $X$, $Y$, $Z$ are the columns of $R(α, β, γ) = R_z(α) R_y(β) R_z(γ)$.'));
    else { const s = STEPS[run.p-1]; stepNow.replaceChildren(h('span', { class: 'step-index', text: `After step ${run.p} of 3` }), ' — ', sym(s.factor), ': ', ...mt(s.title)); }
  }
  function buildChips() {
    chips.replaceChildren(...STEPS.map((s, k) => h('button', { type: 'button', class: 'op-chip', 'data-k': k, 'aria-label': `Go to the state after step ${k+1} of 3`, onclick: () => jump(k+1) }, [
      h('span', { class: 'op-chip-label' }, [`${k+1}. `, sym(s.factor)]),
      h('span', { class: 'tip', role: 'tooltip' }, [h('span', { class: 'tip-title' }, [`Step ${k+1} of 3: `, sym(s.factor)]), h('span', { class: 'tip-text' }, [...mt(s.detail), ' ', ...mt(`Rotation about ${s.about}.`)]),
                                                       h('span', { class: 'tip-hint', text: 'Click to jump to the state after this step.' })])])));
  }
  function updateUi() {
    const busy = !!run.playing;
    reset.disabled = back.disabled = busy || run.p === 0;
    fwd.disabled = all.disabled = busy || run.p >= 3;
    chips.querySelectorAll('.op-chip').forEach(c => { const k = Number(c.dataset.k), shown = busy ? Math.floor(run.playing.q) : run.p; c.classList.toggle('done', k < shown); c.classList.toggle('active', k === (busy ? stepIndex(run.playing.q) : run.p-1)); });
    setText(busy ? 0 : null);
    heading.replaceChildren(...(run.p === 0 && !busy ? mt('Starting frame: $x$, $y$, $z$') : busy ? mt(`Step ${stepIndex(run.playing.q)+1}: rotation by $${STEPS[stepIndex(run.playing.q)].angle}$`) : mt(`Frame after step ${run.p}`)));
  }
  function jump(p) { view.stop(); run.p = Math.max(0, Math.min(3, p)); updateUi(); render(); }
  function moveTo(target) {
    if (run.playing) return;
    target = Math.max(0, Math.min(3, target));
    const from = run.p; if (target === from) return;
    const dir = Math.sign(target-from), count = Math.abs(target-from);
    const playing = run.playing = { q: from, dir, frame: 0 };
    let t0 = null;
    const finish = () => { run.playing = null; run.p = target; updateUi(); render(); };
    const tick = now => {
      if (run.playing !== playing) return;
      if (t0 === null) t0 = now;                                  // first frame timestamp = start (it may precede performance.now())
      const elapsed = Math.max(0, (now-t0)/1000*run.speed/SECONDS_PER_STEP);
      if (elapsed >= count) { finish(); return; }
      playing.q = from+dir*elapsed;
      const frac = dir > 0 ? playing.q-Math.floor(playing.q) : Math.ceil(playing.q)-playing.q;
      updateUi(); setText(smooth(frac));
      try { render(); } catch (error) { finish(); throw error; }
      playing.frame = requestAnimationFrame(tick);
    };
    updateUi();
    playing.frame = requestAnimationFrame(tick);
  }
  const heading = h('div', { class: 'euler-heading' });
  const view = { stop: () => { if (run.playing) cancelAnimationFrame(run.playing.frame); run.playing = null; } };

  // ---------------------------------------------------------------- the page
  const M = text => mt(text, true);                                       // inline mathematics, letters in italic everywhere
  const F = (...lines) => h('div', { class: 'formula' }, lines.flatMap((l, i) => i ? [h('br'), sym(l, true)] : [sym(l, true)]));      // displayed formulas
  const root = h('div', { class: 'euler-box' }, [
    h('p', { class: 'lead' }, M('Every direction in space, and every orientation of a set of axes, can be reached from a reference by three successive rotations, and the same three angles rotate any particle state. These Euler angles are the language in which the frames of this application are built, and they show where the Greenwich problem comes from. We start from the question what a rotation is in quantum mechanics, follow a set of axes through three rotations, and then ask what these rotations do to a particle with spin. In the end two of the three angles turn out to be enough to fix a direction, and the third is left over.')),

    h('h3', { text: 'Rotations and angular momentum' }),
    h('p', {}, M('In quantum mechanics rotations are generated by angular momentum. The three operators $J_x$, $J_y$, $J_z$ obey the commutation relations $[J_i, J_j] = i ε_{i j k} J_k$, and these relations make them the generators of the group of rotations: the rotation by an angle $θ$ about an axis with the unit vector $n$ is obtained by exponentiating the component of the angular momentum along this axis,')),
    F('R_n(θ) = e^{−iθ n·~J}.'),
    h('p', {}, M('Every rotation about every axis can therefore be written with the three operators alone. A rotation always acts on vectors and states: a vector $v$ becomes $R v$, a state $|a⟩$ becomes $R|a⟩$ and an observable $Q$ becomes $R Q R^†$, and a positive angle is a right-handed turn about the axis. Vectors are rotated with positive angles; coordinate systems, as we shall see at the end, are parametrised with the opposite sign.')),

    h('h3', { text: 'Euler angles' }),
    h('p', {}, M('Any rotation can be composed of three rotations about only two different axes. Take the three unit vectors along the fixed axes $x$, $y$, $z$ and rotate all of them together. First they are rotated by $α$ about $z$, which carries $x$ and $y$ to $x′$ and $y′$ while $z$ stays. Next they are rotated by $β$ about the carried axis $y′$; this tilts $z$ into its final direction $Z$ and carries $x′$ to $x″$. Finally they are rotated by $γ$ about $Z$, and $x″$ and $y′$ arrive at the final axes $X$ and $Y$. Each rotation takes place about an axis that the earlier rotations have already carried along, which is why these rotations are called intrinsic. With the generators the whole chain reads')),
    F('R(α, β, γ) = e^{−iγ J_Z} e^{−iβ J_{y′}} e^{−iα J_z},'),
    h('p', {}, M('where $J_{y′}$ and $J_Z$ are the components of the angular momentum along the carried axes $y′$ and $Z$. The three figures show the axes after each of the three steps.')),
    h('p', { class: 'small' }, 'Each figure can be turned by dragging it; a double click restores the view.'),
    h('div', { class: 'euler-figures' }, [
      figure(0, [h('b', { text: 'Step 1. ' }), ...M('Rotation by $α$ about $z$. The axes $x$, $y$ turn into $x′$, $y′$; the $z$ axis stays.')]),
      figure(1, [h('b', { text: 'Step 2. ' }), ...M('Rotation by $β$ about $y′$. The $z$ axis tilts into the new axis $Z$; $x′$ turns into $x″$.')]),
      figure(2, [h('b', { text: 'Step 3. ' }), ...M('Rotation by $γ$ about $Z$. The axes $x″$, $y′$ turn into the final axes $X$, $Y$; $Z$ stays.')])]),

    h('h3', { text: 'Animation' }),
    h('p', {}, M('The animation runs through the same three steps. Choose the angles $α$, $β$, $γ$ (in degrees) and go through the rotations one by one, or let all of them run at once.')),
    h('div', { class: 'euler-animation' }, [
      h('div', { class: 'euler-animation-main' }, [heading, svg, viewTools]),
      h('div', { class: 'euler-animation-side' }, [h('div', { class: 'step-panel' }, [stepNow, bar, chips]), controls, angleBox])]),

    h('h3', { text: 'From moving axes to fixed axes' }),
    h('p', {}, M('The intrinsic form has a drawback: the generators $J_{y′}$ and $J_Z$ belong to axes that depend on the earlier angles, so the formula cannot be evaluated directly. The remedy is to express the carried axes through rotations about the original ones. The axis $y′$ is the image of $y$ under $R_z(α)$, the axis $Z$ is the image of $z$ under $R_z(α) R_y(β)$, and an observable transforms as $Q′ = R Q R^†$ under a rotation $R$. Hence')),
    F('R_{y′}(β) = R_z(α) R_y(β) R_z^†(α),', 'R_Z(γ) = R_z(α) R_y(β) R_z(γ) R_y^†(β) R_z^†(α).'),
    h('p', {}, M('When these are inserted into the intrinsic chain $R(α, β, γ) = R_Z(γ) R_{y′}(β) R_z(α)$, all intermediate factors $R^† R$ cancel by unitarity, and what remains is a rotation about the fixed axes only:')),
    F('R(α, β, γ) = R_z(α) R_y(β) R_z(γ) = e^{−iα J_z} e^{−iβ J_y} e^{−iγ J_z}.'),
    h('p', {}, M('Read from the right, this form is as simple as the first one: $γ$ about $z$ acts first, then $β$ about $y$, then $α$ about $z$. The order is reversed with respect to the carried axes, and this is no accident. The same rotation is either three turns about carried axes in the order $α$, $β$, $γ$, or three turns about fixed axes in the order $γ$, $β$, $α$. The two descriptions must not be mixed.')),

    h('h3', { text: 'Rotating a particle state' }),
    h('p', {}, M('With the fixed-axes form a particle state is easy to rotate. States of definite angular momentum $|j, m⟩$ transform among themselves, because $R$ commutes with $J^2$, so the rotated state is a superposition of the $2j + 1$ states with the same $j$:')),
    F('R(α, β, γ) |j, m⟩ = Σ_{m′} D^{j}_{m′m}(α, β, γ) |j, m′⟩.'),
    h('p', {}, M('The coefficients are the matrix elements of the fixed-axes form. Its two outer factors act on eigenstates of $J_z$ and give pure phases, so that only the middle factor needs work:')),
    F('D^{j}_{m′m}(α, β, γ) = ⟨j, m′| e^{−iα J_z} e^{−iβ J_y} e^{−iγ J_z} |j, m⟩ = e^{−im′α} d^{j}_{m′m}(β) e^{−imγ}.'),
    h('p', {}, [...M('The remaining function $d^{j}_{m′m}(β) = ⟨j, m′| e^{−iβ J_y} |j, m⟩$ is Wigner’s small $d$ function. Together with the phases it gives the Wigner $D$ functions of the helicity formalism; the helicity alignment of this application ('), next ? link('next', 'Next step') : 'Next step', ') is built from them.']),

    h('h3', { text: 'Two angles fix the direction, the third does not' }),
    h('p', {}, M('The same formulas show what each of the angles does. The new $z$ axis is the image of $e_z$ under the rotation, and in the fixed-axes form the first factor to act on $e_z$ is $R_z(γ)$, which leaves it unchanged. The angle $γ$ therefore drops out:')),
    F('Z = R(α, β, γ) e_z = R_z(α) R_y(β) e_z = (sin β cos α, sin β sin α, cos β).'),
    h('p', {}, M('Here $β$ and $α$ are the polar angle and the azimuth of the new $z$ axis, so two rotations are enough to point it in any direction. The third rotation is about $Z$ itself and cannot move it; it only turns the axes $X$ and $Y$ around $Z$. A direction determines $α$ and $β$ but leaves $γ$ open, and a value has to be fixed by convention.')),
    h('p', {}, M('This is not a peculiarity of the formalism. A particle that moves in a given direction has its $z$ axis fixed by this direction, but nothing tells where its $x$ and $y$ axes point. The rest frame of a decaying particle has exactly this freedom, and this is the origin of the Greenwich problem. A different choice of $γ$ changes the phases of the spin states, not the physics. For helicity states the choice $γ = −α$ is common, since the rotation then becomes the identity for $β → 0$ independently of $α$; for the decay angles of this application $γ = 0$ is used. Which choice is made for the rest frame of the decaying particle is explained below.')),

    h('h3', { text: 'Vectors and coordinate systems' }),
    h('p', {}, M('So far the rotations have moved vectors. A coordinate system is a set of three unit vectors, and the axes $X$, $Y$, $Z$ produced by the three steps are the vectors $e_x$, $e_y$, $e_z$ carried along by $R(α, β, γ)$. The coordinates of a vector $v$ in the new system are its projections onto the new axes, and these are the components of $R^{−1} v$. Transforming coordinates therefore needs the inverse rotation,')),
    F('R^{−1}(α, β, γ) = R_z(−γ) R_y(−β) R_z(−α),'),
    h('p', {}, M('so that vectors are rotated with positive angles and coordinate systems are parametrised with negative ones. The frame transformations of the dynamic view are written in this way. A momentum with the polar angle $ϑ$ and the azimuth $φ$ arises from a momentum along $z$ by the rotation $R_z(φ) R_y(ϑ)$ with positive angles and the third angle zero. The coordinate system whose $z$ axis points along it is reached by $R_y(−ϑ) R_z(−φ)$, and this is why the steps of the dynamic view carry the angles $−φ$ and $−ϑ$; for the same reason the boost into a rest frame carries the rapidity with the opposite sign.')),
  ]);
  buildChips(); updateUi();
  requestAnimationFrame(render);
  return { root, view, render };
}
