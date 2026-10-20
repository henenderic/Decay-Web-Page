// Helicity alignment between two topologies and Greenwich geometry (port of alignment.py).
//
// A path of a final-state particle is the product of all transport operations from the laboratory frame to its terminal rest-spin frame i|K.
// W_i^{K->I} = T_i^I (T_i^K)^{-1} fixes the rest momentum and is a rotation for a massive particle; it is also built from the chains of single steps
// L_{parent<-daughter} = R_z(phi) R_y(theta) [R_y(pi)] B_z(eta) and compared with the construction from the transport matrices.
import { eye, matmul, matvec, transpose, maxAbs, sub, norm, dot, det, sumVectors, cmul, cexp, ceye, cmatmul, cinv2 } from './linalg.js';
import { G, InputError, Operation, MATRIX, rotationY, rotationZ, boostZ, computeFrames, invariant, leaves, treeName, sameTree } from './kinematics.js';

export const POLE = 1e-9;            // |sin(beta)| below this value is treated as an Euler pole
export const TOLERANCE = 2e-7;       // residuals of the numerical checks, as for the frames

// ------------------------------------------------------------------ spinor representation
export function spinor(axis, value) {
  if (axis === 'Rz') return [[cexp(0, -0.5 * value), [0, 0]], [[0, 0], cexp(0, 0.5 * value)]];
  if (axis === 'Ry') { const c = Math.cos(value / 2), s = Math.sin(value / 2); return [[[c, 0], [-s, 0]], [[s, 0], [c, 0]]]; }
  if (axis === 'Bz') return [[[Math.exp(value / 2), 0], [0, 0]], [[0, 0], [Math.exp(-value / 2), 0]]];
  throw new InputError(`Unknown operator ${axis}.`);
}
export const lorentz = (axis, value) => MATRIX[axis](value);

/** Four-by-four matrix and spinor matrix of operations that are applied in the given order. */
export function product(operations) {
  let matrix = eye(4), spin = ceye();
  for (const op of operations) {
    matrix = matmul(lorentz(op.axis, op.value), matrix);
    spin = cmatmul(spinor(op.axis, op.value), spin);
  }
  return [matrix, spin];
}

// ------------------------------------------------------------------ terminal paths
export function chainEdge(parent, child, referenceDaughter, role, phi, theta, eta) {
  return { parent, child, reference_daughter: referenceDaughter, role, phi: phi + 0, theta: theta + 0, half_turn: role === 'spectator', eta: eta + 0 };
}
export function edgeMatrix(edge) {
  let matrix = matmul(lorentz('Rz', edge.phi), lorentz('Ry', edge.theta));
  if (edge.half_turn) matrix = matmul(matrix, lorentz('Ry', Math.PI));
  return matmul(matrix, lorentz('Bz', edge.eta));
}
export function chainMatrix(edges) {
  let result = eye(4);
  for (const edge of edges) result = matmul(result, edgeMatrix(edge));
  return result;
}

/** Complete path (laboratory -> terminal rest-spin frame) of every final-state particle of a FrameSet. */
export function terminalPaths(frames) {
  const result = new Map();
  const byLabel = new Map(frames.decays.map(f => [f.label, f]));
  for (const frame of frames.decays) {
    frame.node.forEach((child, side) => {
      if (typeof child !== 'string') return;
      const p = frame.momentum(child);
      const mSquare = invariant(p);
      const base = frame.path.flatMap(step => step.operations);
      if (mSquare <= 1e-12 * dot(p, p)) {
        result.set(child, { particle: child, frameLabel: frame.label, side, mass: null, operations: base, matrix: null, spin: null, edges: null });
        return;
      }
      const m = Math.sqrt(mSquare);
      const [phi, theta] = frame.angles;
      const eta = Math.asinh(norm(p.slice(1)) / m);
      const operations = [...base, new Operation('Rz', -phi, 'Undo parent reference azimuth'), new Operation('Ry', -theta, 'Undo parent reference polar angle')];
      if (side === 1) operations.push(new Operation('Ry', -Math.PI, 'Undo spectator half-turn'));
      operations.push(new Operation('Bz', -eta, `Bring ${child} to rest`));
      const [matrix, spin] = product(operations);
      // the chain: the decay steps of the path to the frame (the root transport is common), then the step to the particle itself
      const edges = frame.path.filter(step => step.role !== 'root')
        .map(step => chainEdge(step.source, step.target, treeName(byLabel.get(step.source).node[0]), step.role,
                               -step.operations[0].value, -step.operations[1].value, -step.operations[step.operations.length - 1].value));
      edges.push(chainEdge(frame.label, `${child}|${frame.topologyLabel}`, treeName(frame.node[0]), side === 1 ? 'spectator' : 'reference', phi, theta, eta));
      result.set(child, { particle: child, frameLabel: frame.label, side, mass: m, operations, matrix, spin, edges });
    });
  }
  return result;
}

// ------------------------------------------------------------------ Euler angles
/** Angle in (-pi, pi]; a value within rounding of -pi is reported as +pi. */
export const principal = angle => (angle <= -Math.PI + 1e-9 ? Math.PI : angle + 0);

/** R = Rz(alpha) Ry(beta) Rz(gamma); formulas and pole cases of the z-y-z decomposition. */
export function eulerZyz(R) {
  const s = Math.hypot(R[0][2], R[1][2]);
  let beta = Math.atan2(s, R[2][2]), alpha, gamma;
  if (s > POLE) { alpha = Math.atan2(R[1][2], R[0][2]); gamma = Math.atan2(R[2][1], -R[2][0]); }
  else if (R[2][2] > 0) { alpha = Math.atan2(R[1][0], R[0][0]); beta = 0; gamma = 0; }
  else { alpha = Math.atan2(-R[1][0], -R[0][0]); beta = Math.PI; gamma = 0; }
  return [principal(alpha), beta, principal(gamma)];
}
export function rotationFromEuler(alpha, beta, gamma) {
  return matmul(matmul(rotationZ(alpha), rotationY(beta)), rotationZ(gamma)).slice(1).map(row => row.slice(1));
}

// ------------------------------------------------------------------ alignment
/** W_i^{K->I} for all final-state particles, or null if the decay topology is the reference topology. */
export function computeAlignment(frames, degenerate = 'error') {
  if (sameTree(frames.reference, frames.decay)) return null;
  const momenta = new Map([...frames.lab.momenta].filter(([k]) => k !== '0'));
  const reference = computeFrames(frames.lab.momenta.get('0'), momenta, frames.reference, frames.reference,
                                  { referenceLabel: frames.referenceLabel, decayLabel: frames.referenceLabel, degenerate });
  if (maxAbs(sub2(reference.decays[0].matrix, frames.decays[0].matrix)) > 1e-12) throw new InputError('The root axes of the two topologies differ; they must be common.');
  const source = terminalPaths(frames), target = terminalPaths(reference);
  const checks = [], particles = [];
  const checked = (name, value, tolerance = TOLERANCE) => {
    value = Number(value);
    if (!Number.isFinite(value) || value > tolerance) throw new InputError(`Numerical check failed: ${name}, residual ${Number(value.toPrecision(4))} > ${Number(tolerance.toPrecision(4))}`);
    checks.push({ name, residual: value, tolerance, passed: true });
  };
  const I3 = eye(3), cabs = z => Math.hypot(z[0], z[1]);

  for (const name of leaves(frames.decay)) {
    const s = source.get(name), t = target.get(name);
    const entry = { particle: name, source_frame: s.frameLabel, target_frame: t.frameLabel,
                    source_terminal: `${name}|${frames.decayLabel}`, target_terminal: `${name}|${frames.referenceLabel}` };
    if (s.matrix === null) {
      Object.assign(entry, { available: false, reason: `${name} is massless or has no resolved mass: no rest frame, no rotation W.` });
      particles.push(entry);
      continue;
    }
    const WTransports = matmul(t.matrix, matmul(matmul(G, transpose(s.matrix)), G));           // inverse of a Lorentz matrix
    const W = matmul(matmul(matmul(G, transpose(chainMatrix(t.edges))), G), chainMatrix(s.edges));   // [reference chain]^{-1} [source chain], built from the steps
    checked(`W ${name}: chains agree with the transport matrices`, maxAbs(sub2(W, WTransports)));
    const k = [s.mass, 0, 0, 0];
    const rest = maxAbs(sub(matvec(W, k), k)) / s.mass;
    const R = W.slice(1).map(row => row.slice(1));
    checked(`W ${name}: rest momentum fixed`, rest);
    checked(`W ${name}: time block`, Math.max(Math.abs(W[0][0] - 1), maxAbs(W[0].slice(1)), maxAbs(W.slice(1).map(row => row[0]))));
    const orth = maxAbs(sub2(matmul(transpose(R), R), I3));
    checked(`W ${name}: orthogonality`, orth);
    checked(`W ${name}: determinant`, Math.abs(det(R) - 1));
    const [alpha, beta, gamma] = eulerZyz(R);
    const rebuilt = rotationFromEuler(alpha, beta, gamma);
    checked(`W ${name}: Euler reconstruction`, maxAbs(sub2(rebuilt, R)));
    const S = cmatmul(t.spin, cinv2(s.spin));
    const eulerSpin = cmatmul(cmatmul(spinor('Rz', alpha), spinor('Ry', beta)), spinor('Rz', gamma));
    const ratio = cmatmul(S, cinv2(eulerSpin));
    const epsilon = ratio[0][0][0] >= 0 ? 1 : -1;
    checked(`W ${name}: spin-lift sign`, Math.max(...ratio.flatMap((row, i) => row.map((z, j) => cabs([z[0] - (i === j ? epsilon : 0), z[1]])))));
    const angles = [['Rz', gamma], ['Ry', beta], ['Rz', alpha]];         // application order of R = Rz(alpha) Ry(beta) Rz(gamma)
    // momenta of the other final states in the two terminal frames; W carries the first into the second
    const shown = [];
    for (const other of leaves(frames.decay)) {
      if (other === name) continue;
      const pSource = matvec(s.matrix, frames.lab.momenta.get(other)).slice(1), pTarget = matvec(t.matrix, frames.lab.momenta.get(other)).slice(1);
      const scale = Math.max(1, maxAbs(pSource), maxAbs(pTarget));
      checked(`W ${name}: momentum ${other} in the target frame`, maxAbs(sub(matvec(R, pSource), pTarget)) / scale);
      shown.push({ particle: other, source: pSource, target: pTarget });
    }
    Object.assign(entry, {
      available: true, mass: s.mass, matrix: R, epsilon, angles: { alpha, beta, gamma },
      pole: Math.hypot(R[0][2], R[1][2]) <= POLE,
      identity: maxAbs(sub2(R, I3)) < 1e-9 && epsilon === 1,
      residuals: { rest, orthogonality: orth },
      operations: angles.map(([axis, value]) => ({ operator: axis, parameter: value })),
      momenta: shown, source_edges: s.edges, reference_edges: t.edges, lorentz: W, axis_angle: beta });
    particles.push(entry);
  }
  return { reference: treeName(frames.reference), decay: treeName(frames.decay), particles, checks };
}

const sub2 = (A, B) => A.map((row, i) => row.map((x, j) => x - B[i][j]));

// ------------------------------------------------------------------ Greenwich geometry
/** Data for the top view of the Greenwich choice in the rest frame of the mother. `describe(tree)` returns [label, color]. */
export function greenwich(frames, describe = null) {
  const ops = frames.decays[0].path[0].operations;
  const [preMatrix] = product([ops[0], ops[1], ops[3]]);          // rotations and boost before the Greenwich rotation; the order in the list is Rz, Ry, Rz(chi), Bz
  const chi = -ops[2].value + 0;
  const lab = frames.lab.momenta;
  const nodeMomentum = (tree, matrix) => matvec(matrix, sumVectors(leaves(tree).map(k => lab.get(k))));
  const finalMatrix = frames.decays[0].matrix;
  const firstRef = frames.reference[0], firstDecay = frames.decay[0];
  const mother = frames.lab.momenta.get('0');
  const items = [];
  const add = (tree, role) => {
    const pre = nodeMomentum(tree, preMatrix), fin = nodeMomentum(tree, finalMatrix);
    const [label, color] = describe ? describe(tree) : [treeName(tree), '#394953'];
    items.push({ node: treeName(tree), label, color, role, leaf: typeof tree === 'string',
                 preliminary: pre.slice(1, 3), final: fin.slice(1, 3), pz: fin[3],
                 transverse: Math.hypot(fin[1], fin[2]), energy: fin[0] });
  };
  add(firstRef, 'reference');
  if (!sameTree(firstDecay, firstRef)) add(firstDecay, 'decay');
  for (const leaf of leaves(frames.decay)) if (leaf !== treeName(firstRef) && leaf !== treeName(firstDecay)) add(leaf, 'final');
  const refItem = items[0];
  const defined = refItem.transverse > 1e-11 * Math.max(refItem.energy, 1e-300);
  const q0 = norm(mother.slice(1));
  return {
    chi, defined: Boolean(defined), reference_topology: treeName(frames.reference), reference_label: frames.referenceLabel, decay_label: frames.decayLabel,
    same_topology: sameTree(frames.reference, frames.decay), reference_first: treeName(firstRef), decay_first: treeName(firstDecay),
    mother_flight: { momentum: q0, phi: q0 > 0 ? Math.atan2(mother[2], mother[1]) : 0, theta: Math.atan2(Math.hypot(mother[1], mother[2]), mother[3]) },
    vectors: items };
}
