// The payload of the page (port of interactive_data.py): every physical quantity comes from the core, this module adds names, texts and the sampled animation.
import { matvec, norm, dot, maxAbs } from './linalg.js';
import { InputError, computeFrames, leaves, parseTopology, treeName, rotationY, rotationZ, boostZ, MATRIX, sameTree } from './kinematics.js';
import { computeAlignment, greenwich } from './alignment.js';
import { momentumScene, MAX_PLANE_PARTICLES } from './scene.js';

const SUPERSCRIPT = Object.fromEntries([...'0123456789I'].map((c, i) => [c, '⁰¹²³⁴⁵⁶⁷⁸⁹ᴵ'[i]]));
const MINUS = '−';
const PARENT_COLOR = '#394953';
const FINAL_STATE_COLORS = ['#B46765', '#5B8A74', '#296E96', '#8773A7', '#AB893C', '#558F99'];
const PAIR_COLORS = ['#D9803F', '#3F9C9F', '#B85C93', '#8B9A2E', '#6F73C4', '#A98B5B', '#C95D5D', '#4C8C5E', '#7A6AA8', '#9C7A2F'];

/** Python's round(): halves go to the even neighbour. */
const pyRound = x => { const r = Math.round(x); return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r; };
const round9 = x => Math.round(x * 1e9) / 1e9;
const isDigit = k => /^[0-9]+$/.test(k);

// ------------------------------------------------------------------ text helpers
export function displayTree(node) {
  if (typeof node === 'string') return node;
  const separator = leaves(node).every(k => isDigit(k) && k.length === 1) ? '' : ', ';
  return '(' + displayTree(node[0]) + separator + displayTree(node[1]) + ')';
}
export function displayFrame(label) {
  const parts = label.split('|');
  if (parts[0].startsWith('R0^')) parts[0] = 'R₀' + [...parts[0].slice(3)].map(c => SUPERSCRIPT[c] ?? c).join('');
  else if (parts[0] !== 'lab') parts[0] = displayTree(parseTopology(parts[0]));
  return parts.join('|');
}
/** Subscript for a momentum: outermost parentheses removed, inner grouping kept. */
export const index = node => (typeof node === 'string' ? node : displayTree(node).slice(1, -1));
/** Mini-markup for the browser: _ ^ { } @ \ and ~ are structural. */
export const escape = text => text.replace(/([_^{}@\\~])/g, '\\$1');

// Names of the manuscript (macros \prt, \itl, \vtc): a particle 1_p, an intermediate state (1 2)_i, a vertex (1 2)_v.
const prt = name => `${escape(name)}_{@{p}}`;
const itl = text => `${escape(text)}_{@{i}}`;
const named = node => (typeof node === 'string' ? prt(node) : itl(displayTree(node)));
const decayMarkup = (parent, first, second) => `${parent} → ${named(first)} + ${named(second)}`;
const ZERO = prt('0');

export function frameMarkup(label) {
  const parts = label.split('|');
  let head;
  if (parts[0].startsWith('R0^')) head = 'R_0^{' + escape(parts[0].slice(3)) + '}';
  else if (parts[0] === 'lab') head = 'lab';
  else head = escape(displayTree(parseTopology(parts[0])));
  return [head, ...parts.slice(1).map(p => '@{' + escape(p) + '}')].join('|');                  // the topology label is upright text
}

export const hexColor = rgb => '#' + rgb.map(c => pyRound(c * 255).toString(16).padStart(2, '0')).join('');

function hlsToRgb(h, l, s) {
  if (s === 0) return [l, l, l];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s, m1 = 2 * l - m2;
  const v = (hue) => { hue = ((hue % 1) + 1) % 1; if (hue < 1 / 6) return m1 + (m2 - m1) * hue * 6; if (hue < 0.5) return m2; if (hue < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - hue) * 6; return m1; };
  return [v(h + 1 / 3), v(h), v(h - 1 / 3)];
}

/** The colour of every particle as RGB in 0..1: the final states take the palette in the order of their numbers, an intermediate state the mean of its final states. */
export function colorsFor(frames) {
  const ids = leaves(frames.decay).slice().sort((a, b) => {
    const ka = [!isDigit(a), isDigit(a) ? Number(a) : a], kb = [!isDigit(b), isDigit(b) ? Number(b) : b];
    if (ka[0] !== kb[0]) return ka[0] ? 1 : -1;
    return ka[1] < kb[1] ? -1 : ka[1] > kb[1] ? 1 : 0;
  });
  const colors = new Map(ids.map((key, i) => [key, i < FINAL_STATE_COLORS.length
    ? [1, 3, 5].map(k => parseInt(FINAL_STATE_COLORS[i].slice(k, k + 2), 16) / 255) : hlsToRgb((i * 0.61803398875) % 1, 0.47, 0.30)]));
  return tree => {
    const members = leaves(tree).map(key => colors.get(key));
    return [0, 1, 2].map(c => members.reduce((s, rgb) => s + rgb[c], 0) / members.length);
  };
}

// ------------------------------------------------------------------ input
export function normalizeEvent(event) {
  if (event === null || typeof event !== 'object' || Array.isArray(event)) throw new InputError('An event must be a JSON object.');
  const required = ['mother', 'final_states', 'reference_topology', 'decay_topology'];
  if (required.some(k => !(k in event))) throw new InputError('Required fields: mother, final_states, reference_topology, decay_topology.');
  const fs = event.final_states;
  if (fs === null || typeof fs !== 'object' || Array.isArray(fs) || !(Object.keys(fs).length >= 2 && Object.keys(fs).length <= 32)) throw new InputError('Between 2 and 32 final-state particles are required.');
  for (const name of ['reference_topology', 'decay_topology']) if (JSON.stringify(event[name]).length > 4096) throw new InputError('The topology string is too long.');
  const normalized = Object.fromEntries(required.map(k => [k, structuredClone(event[k])]));
  for (const [key, fallback] of [['reference_label', 'I'], ['decay_label', null], ['degenerate', 'error']]) normalized[key] = key in event ? event[key] : fallback;
  return normalized;
}

// ------------------------------------------------------------------ transport description
const ROOT_PARAMETERS = [
  // texts use $...$ for mathematics; the viewer sets them as such. The rotations come first, the boost last (the Greenwich rotation commutes with it).
  ['Rz', 'φ_0', `azimuth of the laboratory flight direction of $${ZERO}$`,
    `Change to axes turned by $φ_0$ about the $z$ axis, where $φ_0$ is the azimuth of the laboratory momentum of the mother $${ZERO}$. `
    + 'The coordinates transform with the inverse rotation $R_z(−φ_0)$; against the axes, all momenta of the event turn by $−φ_0$. '
    + `Afterwards the momentum of $${ZERO}$ lies in the $xz$ plane; no energy changes.`],
  ['Ry', 'ϑ_0', `polar angle of the laboratory flight direction of $${ZERO}$`,
    `Change to axes tilted by $ϑ_0$ about the $y$ axis, where $ϑ_0$ is the polar angle of the momentum of $${ZERO}$. `
    + `The coordinates transform with $R_y(−ϑ_0)$; against the axes, all momenta turn by $−ϑ_0$. Afterwards the flight direction of $${ZERO}$ `
    + 'coincides with the $+z$ axis, which becomes the $z$ axis of all root-based frames.'],
  ['Rz', 'χ', 'Greenwich angle: azimuth of the first daughter of the reference topology',
    'Change to axes turned by $χ$ about $z$, where $χ$ is the azimuth of the first daughter of the REFERENCE topology in the rest frame of '
    + `$${ZERO}$ (a boost along $z$ does not change it, so it can be taken before the boost). The coordinates transform with $R_z(−χ)$. `
    + 'This angle is the Greenwich choice, and it is made by the reference topology alone: afterwards that daughter lies in the $xz$ plane with a '
    + 'positive $x$ component, which fixes the root axes once for all topologies. A decay topology that differs from the reference topology does not '
    + 'choose its own $x$ axis; its first daughter then generally has a nonzero azimuth in these axes. The page “Greenwich convention” shows this step.'],
  ['Bz', 'η_0', `rapidity of $${ZERO}$ along the inherited $z$ axis`,
    `Change to the frame that moves along $z$ with the rapidity $η_0$ of the mother $${ZERO}$. The coordinates transform with the boost of rapidity $−η_0$. After this step $${ZERO}$ is at rest. `
    + 'The $z$ components and energies of all momenta change, the transverse components ($x$, $y$) are unchanged.'],
];
const AXIS_NAME = { Rz: 'R_z', Ry: 'R_y', Bz: 'B_z' };

/** Symbol markup such as φ_{12}; node supplies the subscript. */
const sym = (name, node = null) => (node === null ? name : name + '_{' + escape(index(node)) + '}');

function describeStep(step, byLabel) {
  /** Operation factors with symbolic parameter names; values stay in the numeric fields. */
  const operations = [], parameters = [];
  if (step.role === 'root') {
    step.operations.forEach((op, k) => {
      const [, name, text] = ROOT_PARAMETERS[k], detail = ROOT_PARAMETERS[k][3];
      operations.push({ operator: op.axis, parameter: op.value, symbol: name, description: text, detail, factor_markup: AXIS_NAME[op.axis] + '(' + MINUS + name + ')' });
      parameters.push({ symbol_markup: name, value: -op.value, kind: op.axis === 'Bz' ? 'rapidity' : 'angle', description: text });
    });
    return [operations, parameters];
  }
  const parent = byLabel.get(step.source), child = byLabel.get(step.target);
  const [ref, spec] = parent.node;
  const B = named(ref), C = named(spec);
  const A = step.source.startsWith('R0^') ? ZERO : itl(displayTree(parent.node));        // the decaying system: the mother 0 at the root, otherwise an intermediate state
  const target = named(child.node);
  const names = [['φ', ref, `azimuth of the reference daughter $${B}$ in the parent frame`], ['ϑ', ref, `polar angle of the reference daughter $${B}$ in the parent frame`]];
  let next = 0;
  for (const op of step.operations) {
    let text, symbol, detail;
    if (op.axis === 'Bz') {
      const node = child.node;
      text = `rapidity of $${target}$ in the parent frame`;
      symbol = sym('η', node);
      detail = `Change to the frame that moves along $z$ with the rapidity $η$ of $${target}$ in the parent frame; the coordinates transform with the boost of rapidity $−η$. `
        + `Afterwards $${target}$ is at rest: this is the rest frame of $${target}$. Energies and $z$ components of all momenta change; `
        + 'the transverse components are unchanged.';
    } else if (op.axis === 'Ry' && Math.abs(op.value + Math.PI) < 1e-13) {
      operations.push({ operator: op.axis, parameter: op.value, symbol: null, description: 'half-turn of the spectator transport, fixed by convention',
        detail: 'Half-turn of the axes about $y$ (the transformation $R_y(−π)$, fixed by the convention for the spectator transport). '
          + `After the two previous rotations the reference daughter $${B}$ points along $+z$ and the spectator $${C}$ along $−z$; `
          + `the half-turn makes $${C}$ point along $+z$, so the following boost along $z$ brings $${C}$ to rest.`,
        factor_markup: AXIS_NAME[op.axis] + '(' + MINUS + 'π)' });
      continue;
    } else {
      const [name, node, t] = names[next++];
      text = t; symbol = sym(name, node);
      if (op.axis === 'Rz') {
        detail = `Change to axes turned by $φ$ about the $z$ axis, where $φ$ is the azimuth of the reference daughter $${B}$ in the parent frame (decay $${A} → ${B} + ${C}$); `
          + `the coordinates transform with $R_z(−φ)$. Afterwards $${B}$ lies in the $xz$ plane. The azimuth is not reset by later steps.`;
      } else {
        detail = `Change to axes tilted by $ϑ$ about the $y$ axis, where $ϑ$ is the polar angle of the reference daughter $${B}$ in the parent frame; `
          + `the coordinates transform with $R_y(−ϑ)$. Afterwards $${B}$ points along $+z$ and the spectator $${C}$ along $−z$, because the parent is at rest.`;
      }
    }
    operations.push({ operator: op.axis, parameter: op.value, symbol, description: text, detail, factor_markup: AXIS_NAME[op.axis] + '(' + MINUS + symbol + ')' });
    parameters.push({ symbol_markup: symbol, value: -op.value, kind: op.axis === 'Bz' ? 'rapidity' : 'angle', description: text });
  }
  return [operations, parameters];
}

/** A topology as nested nodes for the Feynman sketches: name as in the frame labels, display name, children (first = reference daughter, second = spectator). */
function topologyJson(tree) {
  if (typeof tree === 'string') return { name: tree, display: tree, leaf: true };
  return { name: treeName(tree), display: displayTree(tree), leaf: false, children: [topologyJson(tree[0]), topologyJson(tree[1])] };
}

/** The Greenwich choice made by the reference topology, as one sentence. */
function greenwichRule(frames) {
  const first = displayTree(frames.reference[0]);
  return `Greenwich convention, fixed by the reference topology ${frames.referenceLabel}: z along the laboratory flight direction of 0, `
    + `x along the transverse momentum of the first daughter ${first} of topology ${frames.referenceLabel}, y completing a right-handed system. `
    + 'All topologies use these root axes.';
}

const superscriptLabel = label => [...label].map(c => SUPERSCRIPT[c] ?? c).join('');

/** English title, decay line and note for a figure (plain), and the title and the decay line with the names of the manuscript (markup). */
function figureTexts(frame, frames, root, parentNode) {
  const refLabel = frames.referenceLabel, decLabel = frames.decayLabel;
  if (frame.label === 'lab') {
    return ['Laboratory frame', '0 → ' + frames.decay.map(displayTree).join(' + '),
            'Specified starting frame of the event. The mother 0 enters with its laboratory momentum (incoming arrow).',
            'Laboratory frame', `${ZERO} → ` + frames.decay.map(named).join(' + ')];
  }
  if (frame === frames.referenceFirst) {
    return ['Rest frame of 0 (reference topology)', '0 → ' + displayTree(frames.reference[0]) + ' + ' + displayTree(frames.reference[1]),
            `First decay of topology ${refLabel}. ` + greenwichRule(frames),
            `Rest frame of $${ZERO}$ (reference topology)`, decayMarkup(ZERO, frames.reference[0], frames.reference[1])];
  }
  if (frame.kind === 'all') {
    return ['Rest frame of 0 (all final states)', '0 → ' + leaves(frames.decay).map(displayTree).join(' + '),
            `All final-state momenta in the root axes R₀${superscriptLabel(refLabel)}, which are common to every topology. ` + greenwichRule(frames),
            `Rest frame of $${ZERO}$ (all final states)`, `${ZERO} → ` + leaves(frames.decay).map(prt).join(' + ')];
  }
  const [first, second] = frame.node;
  const decay = displayTree(parentNode) + ' → ' + displayTree(first) + ' + ' + displayTree(second);
  const decaying = root ? ZERO : itl(displayTree(frame.node));
  const decayM = decayMarkup(decaying, first, second);
  if (root) {
    let note = `First decay of topology ${decLabel} in the common root axes R₀${superscriptLabel(refLabel)}.`;
    if (sameTree(frames.reference, frames.decay)) note += ' This is also the reference topology, so this decay fixes the root axes. ' + greenwichRule(frames);
    else {
      note += ` The root axes were fixed by the first daughter ${displayTree(frames.reference[0])} of the reference topology ${refLabel}, `
        + `not by the first daughter ${displayTree(first)} of this decay. ` + greenwichRule(frames);
    }
    return ['Rest frame of 0', decay, note, `Rest frame of $${ZERO}$`, decayM];
  }
  const role = frame.path[frame.path.length - 1].role;
  return ['Rest frame of ' + displayTree(frame.node), decay,
          `Reached from the parent frame by the ${role} transport of topology ${decLabel}. `
          + 'The z axis inherits the momentum direction in the parent frame; the azimuth is not reset.',
          `Rest frame of $${decaying}$`, decayM];
}

// ------------------------------------------------------------------ animation
export const SAMPLES_PER_OPERATION = 40;

/** Every subsystem of a topology: leaves, intermediate nodes and the whole tree. */
const allNodes = tree => (typeof tree === 'string' ? [tree] : [...allNodes(tree[0]), ...allNodes(tree[1]), tree]);

/** Sampled momenta while each transport operation is applied gradually: sample k is the momentum after M(p*k/N) acts on the state before the operation. */
function buildAnimation(frames, byLabel, keyOf, descriptions) {
  const every = allNodes(frames.decay);
  const nodes = ['0', ...every.slice(0, -1).map(treeName)];                  // the whole tree is the mother 0
  const trees = [null, ...every.slice(0, -1)];
  const state = frame => new Map(nodes.map((name, i) => [name, trees[i] === null ? frame.momenta.get('0') : frame.momentum(trees[i])]));
  const transitions = {};
  for (const frame of frames.decays) {
    const step = frame.path[frame.path.length - 1];
    const parent = byLabel.get(step.source);
    let current = state(parent);
    const ops = [];
    step.operations.forEach((op, k) => {
      const samples = [];
      for (let s = 0; s <= SAMPLES_PER_OPERATION; s++) {
        const matrix = MATRIX[op.axis](op.value * s / SAMPLES_PER_OPERATION);
        samples.push(nodes.map(name => matvec(matrix, current.get(name)).slice(1).map(round9)));
      }
      const full = MATRIX[op.axis](op.value);
      current = new Map([...current].map(([name, vector]) => [name, matvec(full, vector)]));
      ops.push({ ...descriptions[frame.key][k], samples });
    });
    transitions[frame.key] = { from: keyOf.get(step.source), to: frame.key, operations: ops };
  }
  const chains = [];
  const parents = new Map(frames.decays.map(frame => [frame.key, keyOf.get(frame.path[frame.path.length - 1].source)]));
  const hasChild = new Set(parents.values());
  for (const frame of frames.decays) {
    if (hasChild.has(frame.key)) continue;
    const stages = [];
    let key = frame.key;
    while (key !== keyOf.get('lab')) { stages.push(key); key = parents.get(key); }
    chains.push({ target: frame.key, stages: [keyOf.get('lab'), ...stages.reverse()] });
  }
  return { nodes, samples_per_operation: SAMPLES_PER_OPERATION, transitions, chains };
}

// ------------------------------------------------------------------ helicity alignment and Greenwich view
/** Names for one step of a chain and its factors; factors that vanish are left out. */
function describeEdge(edge, topology) {
  const head = label => label.split('|')[0];
  const node = text => (text.includes('(') ? parseTopology(text) : text);            // a final-state particle is a plain name
  const parent = head(edge.parent).startsWith('R0^') ? 'R_0' : escape(displayTree(node(head(edge.parent))));
  const childNode = node(head(edge.child));
  const child = escape(displayTree(childNode)), T = escape(topology);
  const ref = escape(index(node(edge.reference_daughter)));
  const factors = [];
  for (const [axis, value, symbol] of [['Rz', edge.phi, `φ_{${ref}}^{${T}}`], ['Ry', edge.theta, `ϑ_{${ref}}^{${T}}`],
                                      ['Ry', edge.half_turn ? Math.PI : 0, 'π'], ['Bz', edge.eta, `η_{${escape(index(childNode))}}^{${T}}`]]) {
    if (Math.abs(value) > 1e-12) factors.push({ operator: axis, value, symbol, markup: `${AXIS_NAME[axis]}(${symbol})`, inverse_markup: `${AXIS_NAME[axis]}(${MINUS}${symbol})` });
  }
  Object.assign(edge, { label: `L_{${parent}←${child}}^{${T}}`, parent_markup: parent, child_markup: child, factors });
}

function alignmentPayload(frames, color) {
  const data = computeAlignment(frames);
  if (data === null) return null;
  for (const entry of data.particles) {
    const name = entry.particle;
    Object.assign(entry, { index_markup: escape(name), color: hexColor(color(name)),
      source_markup: frameMarkup(entry.source_frame), target_markup: frameMarkup(entry.target_frame),
      source_label: displayFrame(entry.source_frame), target_label: displayFrame(entry.target_frame),
      source_terminal_markup: escape(name) + '|@{' + escape(frames.decayLabel) + '}', target_terminal_markup: escape(name) + '|@{' + escape(frames.referenceLabel) + '}' });
    if (!entry.available) continue;
    for (const item of entry.momenta) Object.assign(item, { index_markup: escape(item.particle), color: hexColor(color(item.particle)) });
    entry.operations.forEach((op, k) => { op.short_markup = AXIS_NAME[op.operator] + '(' + ['γ', 'β', 'α'][k] + ')'; });   // the Euler operations of W = R_z(α) R_y(β) R_z(γ), in the order of application
    for (const [key, topology] of [['source_edges', frames.decayLabel], ['reference_edges', frames.referenceLabel]]) for (const edge of entry[key]) describeEdge(edge, topology);
  }
  data.source_label = frames.decayLabel; data.target_label = frames.referenceLabel;
  data.rule = 'W = [path of i in I]⁻¹ [path of i in K]; the rotation R = R_z(α) R_y(β) R_z(γ) has row = target axes of i|I, column = source axes of i|K; '
    + 'D^{j}_{λν}(W) = ε^{2j} e^{−iλα} d^{j}_{λν}(β) e^{−iνγ}.';
  return data;
}

function greenwichPayload(frames, color) {
  const data = greenwich(frames, tree => [displayTree(tree), hexColor(color(tree))]);
  data.rule = greenwichRule(frames);
  data.reference_first_label = displayTree(frames.reference[0]);
  data.decay_first_label = displayTree(frames.decay[0]);
  return data;
}

// ------------------------------------------------------------------ amplitude of the decay chain
/** What the amplitude row needs: the vertices of the decay topology (frame, decaying system A, daughters B, C) and the final states in particle order. All numbers stay in the core; here only names and structure. */
function amplitudePayload(frames, event) {
  const entry = node => ({ name: treeName(node), index: escape(index(node)), leaf: typeof node === 'string', display: displayTree(node), members: leaves(node) });
  const vertices = frames.decays.map(frame => {
    const [ref, spec] = frame.node;
    const root = frame.label.startsWith('R0^');
    return { key: frame.key, node: treeName(frame.node), display: displayTree(frame.node), root,
      frame_markup: frameMarkup(frame.label), frame_label: displayFrame(frame.label),
      A: { index: root ? '0' : escape(index(frame.node)), internal: !root, members: leaves(frame.node) },
      B: entry(ref), C: entry(spec),
      // the first root azimuth of the reference topology is zero by the Greenwich choice
      phi_zero: Boolean(root && sameTree(frames.reference[0], ref)) };
  });
  return { topology_label: frames.decayLabel, reference_label: frames.referenceLabel, letter: sameTree(frames.decay, frames.reference) ? 'λ' : 'ν',
           vertices, leaves: Object.keys(event.final_states).map(name => ({ name, index: escape(name) })) };
}

// ------------------------------------------------------------------ payload
export function buildPayload(rawEvent) {
  const event = normalizeEvent(rawEvent);
  let frames;
  try {
    frames = computeFrames(event.mother, event.final_states, event.reference_topology, event.decay_topology,
                           { referenceLabel: event.reference_label, decayLabel: event.decay_label, degenerate: event.degenerate });
  } catch (error) {
    if (error instanceof RangeError) throw new InputError('The topology is nested too deeply.');
    throw error;
  }
  const color = colorsFor(frames);
  const production = new Map(frames.decays.flatMap(f => f.node.map(child => [treeName(child), f])));   // frame in which the helicity of a particle is defined
  const byLabel = new Map(frames.decays.map(f => [f.label, f]));
  byLabel.set('lab', frames.lab);
  const keyOf = new Map(frames.decays.map(f => [f.label, f.key]));
  keyOf.set('lab', frames.lab.key);
  const descriptions = {};
  const result = { viewer_schema: 2, event, reference_topology: treeName(frames.reference), decay_topology: treeName(frames.decay),
                   reference_label: frames.referenceLabel, decay_label: frames.decayLabel, warnings: frames.warnings, checks: frames.checks, figures: [] };
  // The reference topology only orients the common root axes; its own decay is never shown as a figure.
  const pairColor = new Map();
  const ordered = Object.keys(event.final_states).slice(0, MAX_PLANE_PARTICLES);
  ordered.forEach((a, i) => {
    for (const b of ordered.slice(i + 1)) pairColor.set(a.length === 1 && b.length === 1 ? a + b : a + ' ' + b, PAIR_COLORS[pairColor.size % PAIR_COLORS.length]);
  });
  for (const frame of frames.selected(true, true)) {
    if (frame === frames.referenceFirst) continue;
    const scene = momentumScene(frame, true, true);
    const data = scene.asDict();
    scene.vectors.forEach((vector, k) => {
      const item = data.vectors[k];
      item.color = hexColor(color(vector.node));
      item.index = index(vector.node);
      item.label = displayTree(vector.node);
      item.energy = frame.momentum(vector.node)[0];
      const raw = frame.label;                                              // helicity labels are measured in the frame that is displayed
      item.helicity_frame = displayFrame(raw);
      item.helicity_markup = frameMarkup(raw);
      item.index_markup = escape(item.index);
    });
    const root = frame === frames.decays[0] || frame === frames.referenceFirst;
    const parent = frame.kind === 'all' || root ? '0' : frame.node;
    const parentP = frame.kind === 'all' ? frame.momenta.get('0') : frame.momentum(frame.node);
    const parentRaw = frame.label;
    data.parent = { id: frame.key + '/parent', node: parent === '0' ? '0' : treeName(parent), index: index(parent), label: displayTree(parent),
                    color: parent === '0' ? PARENT_COLOR : hexColor(color(parent)), spatial: parentP.slice(1), energy: parentP[0],
                    index_markup: escape(index(parent)), helicity_frame: displayFrame(parentRaw), helicity_markup: frameMarkup(parentRaw) };
    for (const plane of data.planes) plane.color = pairColor.get(plane.node) ?? PARENT_COLOR;
    for (const guide of data.sum_guides) guide.color = data.vectors.find(v => v.id === guide.copied_vector_id).color;
    const [title, decay, note, titleMarkup, decayMarkupText] = figureTexts(frame, frames, root, parent);
    const steps = [];
    for (const step of frame.path) {
      const [operations, parameters] = describeStep(step, byLabel);
      if (frame.path[frame.path.length - 1] === step) descriptions[frame.key] = operations.map(op => ({ ...op }));
      steps.push({ source: step.source, target: step.target, role: step.role, source_markup: frameMarkup(step.source), target_markup: frameMarkup(step.target), operations, parameters });
    }
    result.figures.push({
      id: frame.key, title, decay, note, title_markup: titleMarkup, decay_markup: decayMarkupText,
      node: frame.kind === 'vertex' ? treeName(frame.node) : null,
      frame_label: displayFrame(frame.label), tag_markup: frameMarkup(frame.label),
      vertex_markup: escape(displayTree(frame.node)),
      optional: frame === frames.referenceFirst || frame === frames.rootAll,
      kind: frame.kind, local_plane: frame.kind === 'vertex' && !root,
      scene: data, angles: frame.angles === null ? null : { phi: frame.angles[0], theta: frame.angles[1] },
      path: steps, matrix: frame.matrix, warnings: frame.degeneracies });
  }
  result.topologies = { reference: topologyJson(frames.reference), decay: topologyJson(frames.decay), reference_label: frames.referenceLabel, decay_label: frames.decayLabel };
  result.helicity_frames = Object.fromEntries([...production].map(([name, f]) => [name, { figure: f.key, frame_label: displayFrame(f.label), tag_markup: frameMarkup(f.label) }]));
  result.animation = buildAnimation(frames, byLabel, keyOf, descriptions);
  result.amplitude = amplitudePayload(frames, event);
  result.alignment = alignmentPayload(frames, color);
  result.greenwich = greenwichPayload(frames, color);
  return result;
}
