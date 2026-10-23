// Ordered cascade frames (port of kinematics.py). Column four-vectors (E, px, py, pz), metric +---. Matrices act rightmost first.
import { eye, diag, matmul, matvec, transpose, copy, add, sub, dot, norm, maxAbs, sumVectors, zeros, det } from './linalg.js';

export const G = diag([1, -1, -1, -1]);
export const RTOL = 2e-9;
export const TINY = 2.2250738585072014e-308;          // the smallest normal double, as numpy.finfo(float).tiny

export class InputError extends Error {
  constructor(message) { super(message); this.name = 'InputError'; }
}

/** A number as Python prints a float: 1 becomes 1.0. */
const pyFloat = x => (Number.isInteger(x) ? x.toFixed(1) : String(x));

export const leaves = tree => (typeof tree === 'string' ? [tree] : [...leaves(tree[0]), ...leaves(tree[1])]);
export const treeName = tree => (typeof tree === 'string' ? tree : `(${treeName(tree[0])} ${treeName(tree[1])})`);
export const sameTree = (a, b) => treeName(a) === treeName(b);

/** Parse nested pairs or '(1 (2 3))'; identifiers require spaces or commas. */
export function parseTopology(value) {
  const normalize = node => {
    if (typeof node === 'boolean') throw new InputError('Boolean values are not particle identifiers.');
    if (typeof node === 'string' || typeof node === 'number') {
      const label = String(node);
      if (!/^(?:[A-Za-z][A-Za-z0-9_]*|[0-9]+)$/.test(label)) throw new InputError(`Invalid particle identifier: '${label}'`);
      return label;
    }
    if (!Array.isArray(node) || node.length !== 2) throw new InputError('Each internal node must have exactly two ordered daughters.');
    return [normalize(node[0]), normalize(node[1])];
  };
  let tree;
  if (typeof value === 'string' && (value.includes('(') || value.includes(')'))) {
    const tokens = value.match(/\(|\)|,|[A-Za-z][A-Za-z0-9_]*|[0-9]+|\S/g) || [];
    let position = 0;
    const parse = () => {
      if (position >= tokens.length) throw new InputError('Unexpected end of topology.');
      const token = tokens[position++];
      if (token !== '(') return normalize(token);
      const left = parse();
      if (position < tokens.length && tokens[position] === ',') position++;
      const right = parse();
      if (position >= tokens.length || tokens[position] !== ')') throw new InputError('Expected a closing parenthesis after two daughters.');
      position++;
      return [left, right];
    };
    tree = parse();
    if (position !== tokens.length) throw new InputError('Unexpected tokens after the topology.');
  } else tree = normalize(value);
  if (typeof tree === 'string') throw new InputError('A topology must describe at least one binary decay.');
  const ids = leaves(tree);
  if (ids.length !== new Set(ids).size) throw new InputError('Every final-state particle must occur exactly once in a topology.');
  if (!(ids.length >= 2 && ids.length <= 32)) throw new InputError('Supported input size: 2 to 32 distinct final-state particles.');
  return tree;
}

export function rotationY(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[1, 0, 0, 0], [0, c, 0, s], [0, 0, 1, 0], [0, -s, 0, c]];
}
export function rotationZ(a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]];
}
export function boostZ(eta) {
  const c = Math.cosh(eta), s = Math.sinh(eta);
  return [[c, 0, 0, s], [0, 1, 0, 0], [0, 0, 1, 0], [s, 0, 0, c]];
}
export const MATRIX = { Rz: rotationZ, Ry: rotationY, Bz: boostZ };

export const invariant = p => dot(matvec(G, p), p);                 // p G p
export function mass(p, label) {
  const m2 = invariant(p);
  if (m2 <= 1e-12 * dot(p, p)) throw new InputError(`${label}: a numerically resolved timelike momentum is required for a rest frame.`);
  return Math.sqrt(m2);
}
export function phiAngle(y, x) {
  const a = Math.atan2(y, x);
  return a === -Math.PI ? Math.PI : a;
}

export class Operation {
  constructor(axis, value, purpose) { this.axis = axis; this.value = value; this.purpose = purpose; }
  matrix() { return MATRIX[this.axis](this.value); }
}

export class Transition {
  constructor(source, target, role, operations) { this.source = source; this.target = target; this.role = role; this.operations = operations; }   // operations in the order actually applied
  get matrix() {
    let result = eye(4);
    for (const op of this.operations) result = matmul(op.matrix(), result);
    return result;
  }
}

export class Frame {
  constructor(key, label, kind, node, topologyLabel, matrix, momenta, path, degeneracies = []) {
    Object.assign(this, { key, label, kind, node, topologyLabel, matrix, momenta, path, degeneracies });
    this.angles = null;                                                // phi, theta of the first daughter
  }
  momentum(node) { return sumVectors(leaves(node).map(k => this.momenta.get(k))); }
}

export class FrameSet {
  constructor(fields) { Object.assign(this, fields); }
  selected(includeReference = false, includeRootAll = false) {
    const out = [this.lab];
    if (includeReference) out.push(this.referenceFirst);
    out.push(this.decays[0]);
    if (includeRootAll) out.push(this.rootAll);
    return [...out, ...this.decays.slice(1)];
  }
}

/** Compute all vertex frames. `finalStates` is an object (or a Map) from particle identifiers to four-vectors. */
export function computeFrames(mother, finalStates, referenceTopology, decayTopology,
                              { referenceLabel = 'I', decayLabel = null, degenerate = 'error' } = {}) {
  if (degenerate !== 'error' && degenerate !== 'canonical') throw new InputError("degenerate must be 'error' or 'canonical'.");
  const reference = parseTopology(referenceTopology), decay = parseTopology(decayTopology);
  const sameTopology = sameTree(decay, reference);
  decayLabel = decayLabel || (sameTopology ? referenceLabel : (referenceLabel !== 'II' ? 'II' : 'III'));
  for (const label of [referenceLabel, decayLabel]) {
    if (typeof label !== 'string' || !/^[A-Za-z0-9]+$/.test(label)) throw new InputError('Topology labels must be nonempty ASCII letters/digits.');
  }
  if (!sameTopology && decayLabel === referenceLabel) throw new InputError('Distinct topologies must have distinct labels.');
  const entries = finalStates instanceof Map ? [...finalStates.entries()] : (finalStates && typeof finalStates === 'object' && !Array.isArray(finalStates) ? Object.entries(finalStates) : null);
  if (!entries) throw new InputError('final_states must map particle IDs to four-vectors.');
  const momenta = new Map();
  for (const [label, vector] of [...entries, ['0', mother]]) {
    const key = String(label);
    if (momenta.has(key) || (key === '0' && label !== '0')) throw new InputError(`Duplicate or reserved particle identifier: ${key}`);
    if (!Array.isArray(vector) || vector.length !== 4) throw new InputError(`${key}: expected four finite components (E,px,py,pz), E>0.`);
    const p = vector.map(x => (typeof x === 'number' || (typeof x === 'string' && x.trim() !== '') ? Number(x) : NaN));
    if (!p.every(Number.isFinite) || p[0] <= 0) throw new InputError(`${key}: expected four finite components (E,px,py,pz), E>0.`);
    if (invariant(p) < -1e-10 * dot(p, p)) throw new InputError(`${key}: spacelike four-momentum.`);
    momenta.set(key, p);
  }
  const ids = [...momenta.keys()].filter(k => k !== '0');
  const sameSet = tree => { const l = leaves(tree); return l.length === ids.length && l.every(k => ids.includes(k)); };
  if (!sameSet(reference) || !sameSet(decay)) throw new InputError('Both trees must contain exactly the final-state IDs. Use "((1 2) 3)", not ambiguous "((12)3)".');
  const p0 = momenta.get('0');
  const eventScale = Math.max(p0[0], TINY);
  const total = sumVectors(ids.map(k => momenta.get(k)));
  if (maxAbs(sub(total, p0)) > RTOL * eventScale) throw new InputError(`Four-momentum is not conserved: sum(final)-mother=[${sub(total, p0).map(pyFloat).join(', ')}]`);
  const m0 = mass(p0, 'Mother 0');
  const warnings = [];

  const fallback = (message, sink) => {
    if (degenerate === 'error') throw new InputError(message + " Supply a nondegenerate event or use '--degenerate canonical' for the documented arbitrary fallback.");
    sink.push(message);
    warnings.push(message);
  };

  const q0 = norm(p0.slice(1));
  const rootDegenerate = [];
  let phi0, theta0;
  if (q0 <= 1e-11 * eventScale) {
    fallback('Mother 0 is at rest in the lab: flight z is undefined; using lab +z.', rootDegenerate);
    phi0 = 0; theta0 = 0;
  } else {
    const rho = Math.hypot(p0[1], p0[2]);
    // On the z axis of the laboratory the azimuth of the flight direction is not defined; it is set to zero (a gauge, the root axes are then the laboratory axes).
    phi0 = rho > 1e-12 * q0 ? phiAngle(p0[2], p0[1]) : 0;
    theta0 = Math.atan2(rho, p0[3]);
  }
  const rootOps = [new Operation('Rz', -phi0, 'Align mother azimuth'),
                   new Operation('Ry', -theta0, 'Align mother flight with +z'),
                   new Operation('Bz', -Math.asinh(q0 / m0), 'Bring mother 0 to rest')];
  const rootLabel = 'R0';
  const rootStep = new Transition('lab', rootLabel, 'root', rootOps);
  const rootMatrix = rootStep.matrix;

  const transformed = matrix => new Map([...momenta.entries()].map(([k, p]) => [k, matvec(matrix, p)]));

  const decayAngles = frame => {
    const referenceP = frame.momentum(frame.node[0]);
    const q = norm(referenceP.slice(1));
    const scale = Math.max(frame.momentum(frame.node)[0], TINY);
    if (q <= 1e-11 * scale) {
      fallback(`${frame.label}: threshold, reference direction undefined; using theta=phi=0.`, frame.degeneracies);
      return [0, 0];
    }
    const rho = Math.hypot(referenceP[1], referenceP[2]);
    let phi;
    if (rho <= 1e-11 * scale) {
      fallback(`${frame.label}: reference on z axis, azimuth undefined; using phi=0.`, frame.degeneracies);
      phi = 0;
    } else phi = phiAngle(referenceP[2], referenceP[1]);
    return [phi, Math.atan2(rho, referenceP[3])];
  };

  const newFrame = (key, label, kind, tree, topLabel, matrix, path, degeneracies = []) => {
    const frame = new Frame(key, label, kind, tree, topLabel, copy(matrix), transformed(matrix), [...path], [...degeneracies]);
    if (kind === 'vertex') frame.angles = decayAngles(frame);
    return frame;
  };

  const lab = newFrame('00_lab', 'lab', 'all', decay, decayLabel, eye(4), []);
  const referenceFirst = newFrame('01_reference_root', `${rootLabel}|${referenceLabel}`, 'vertex', reference, referenceLabel, rootMatrix, [rootStep], rootDegenerate);
  const rootAll = newFrame('03_root_all', `${rootLabel}|${decayLabel}`, 'all', decay, decayLabel, rootMatrix, [rootStep], rootDegenerate);
  const first = newFrame('02_decay_root', `${rootLabel}|${decayLabel}`, 'vertex', decay, decayLabel, rootMatrix, [rootStep], rootDegenerate);
  const decays = [first];

  const visit = (parent, address = '') => {
    const [phi, theta] = parent.angles;
    parent.node.forEach((child, side) => {
      if (typeof child === 'string') return;                              // terminal spin rest frames are not additional decays
      const p = parent.momentum(child);
      const m = mass(p, treeName(child));
      const eta = Math.asinh(norm(p.slice(1)) / m);
      const role = side === 0 ? 'reference' : 'spectator';
      const operations = [new Operation('Rz', -phi, 'Undo parent reference azimuth'), new Operation('Ry', -theta, 'Undo parent reference polar angle')];
      if (side === 1) operations.push(new Operation('Ry', -Math.PI, 'Undo spectator half-turn; preserve the -pi branch'));
      operations.push(new Operation('Bz', -eta, `Bring ${treeName(child)} to rest`));
      const label = `${treeName(child)}|${decayLabel}`;
      const step = new Transition(parent.label, label, role, operations);
      const pathName = address + (side === 0 ? 'L' : 'R');
      const frame = newFrame('decay_' + pathName, label, 'vertex', child, decayLabel, matmul(step.matrix, parent.matrix), [...parent.path, step]);
      decays.push(frame);
      visit(frame, pathName);
    });
  };
  visit(first);

  const checks = [];
  const checked = (name, value, tolerance) => {
    value = Number(value);
    if (!Number.isFinite(value) || value > tolerance) throw new InputError(`Numerical check failed: ${name}, residual ${Number(value.toPrecision(4))} > ${Number(tolerance.toPrecision(4))}`);
    checks.push({ name, residual: value, tolerance, passed: true });
  };
  checked('lab conservation / event energy', maxAbs(sub(total, p0)) / eventScale, RTOL);
  for (const frame of [lab, referenceFirst, rootAll, ...decays]) {
    const C = frame.matrix;
    // Float64, well-conditioned massive rest frames. Fail rather than hide large cancellation.
    checked(frame.key + ' Lorentz metric', maxAbs(sub2(matmul(matmul(transpose(C), G), C), G)), 2e-7);
    checked(frame.key + ' proper determinant', Math.abs(det(C) - 1), 2e-7);
    checked(frame.key + ' orthochronous', Math.max(0, 1 - C[0][0]), 2e-9);
    for (const [key, p] of frame.momenta) {
      const denom = Math.max(dot(momenta.get(key), momenta.get(key)), TINY);
      checked(frame.key + ' mass shell ' + key, Math.abs(invariant(p) - invariant(momenta.get(key))) / denom, 2e-7);
      checked(frame.key + ' inverse ' + key, maxAbs(sub(matvec(matmul(matmul(G, transpose(C)), G), p), momenta.get(key))) / eventScale, 2e-7);
    }
    if (frame.key !== lab.key) {
      const parentP = frame.momentum(frame.node);
      checked(frame.key + ' parent at rest', maxAbs(parentP.slice(1)) / parentP[0], 2e-7);
    }
    if (frame.kind === 'vertex') {
      const [pb, pc] = frame.node.map(t => frame.momentum(t));
      checked(frame.key + ' opposite daughters', maxAbs(add(pb.slice(1), pc.slice(1))) / (pb[0] + pc[0]), 2e-7);
    }
  }
  return new FrameSet({ reference, decay, referenceLabel, decayLabel, lab, referenceFirst, rootAll, decays, checks, warnings: [...new Set(warnings)], degeneracyPolicy: degenerate });
}

const sub2 = (A, B) => A.map((row, i) => row.map((x, j) => x - B[i][j]));
