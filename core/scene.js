// Unprojected momentum geometry (port of scene.py). Coordinates are physical spatial momenta in one frame, never display pixels.
// Descendants share the origin; translated copies complete momentum parallelograms.
import { maxAbs } from './linalg.js';
import { leaves, treeName } from './kinematics.js';

export const MAX_PLANE_PARTICLES = 5;

const opacityOf = depth => Math.max(0.08, 0.60 ** depth);
const linestyleOf = depth => (depth === 0 ? 'solid' : (depth % 2 ? 'dashed' : 'dotted'));

function vectorDict(v) {
  return { id: v.id, particle: treeName(v.node), parent: treeName(v.parent), spatial: v.spatial.slice(), start: [0, 0, 0], end: v.spatial.slice(),
           depth: v.depth, role: v.role, leaf: typeof v.node === 'string', context: v.context, layer: v.depth === 0 ? 'primary' : 'descendants',
           opacity: opacityOf(v.depth), linestyle: linestyleOf(v.depth) };
}
function guideDict(g) {
  const copied = g.copiedVector;
  return { id: g.id, start: g.start.slice(), end: g.end.slice(), start_vector_id: g.startId, copied_vector_id: copied.id, sum_vector_id: g.sumId,
           layer: 'sum_guides', depth: copied.depth, opacity: 0.62 * opacityOf(copied.depth), linestyle: 'dotted' };
}

export class MomentumScene {
  constructor(vectors, guides, parentSpatial, rootPair = null, order = []) { Object.assign(this, { vectors, guides, parentSpatial, rootPair, order }); }

  /** Planes through the origin spanned by the momenta of two final states: one for every pair of the first MAX_PLANE_PARTICLES final states. */
  get planes() {
    const rank = new Map(this.order.map((key, i) => [key, i]));
    const rankOf = v => (rank.has(v.node) ? rank.get(v.node) : rank.size);
    const leaf = this.vectors.filter(v => typeof v.node === 'string').sort((a, b) => rankOf(a) - rankOf(b)).slice(0, MAX_PLANE_PARTICLES);   // the sort is stable
    const planes = [];
    leaf.forEach((a, i) => {
      for (const b of leaf.slice(i + 1)) {
        const name = a.node.length === 1 && b.node.length === 1 ? a.node + b.node : a.node + ' ' + b.node;
        planes.push({ id: a.id + '/plane/' + b.node, node: name, pair: [a.node, b.node], a_id: a.id, b_id: b.id, kind: 'pair' });
      }
    });
    return planes;
  }
  scaleOf(vectors) {
    const largest = Math.max(...vectors.map(v => maxAbs(v.spatial)), maxAbs(this.parentSpatial), 1e-14);   // include every descendant; cancellation can make a resonance smaller
    return 2.85 / largest;
  }
  get scale() { return this.scaleOf(this.vectors.filter(v => !v.context)); }
  get scaleFinal() { return this.scaleOf(this.vectors); }       // the final-states view also shows the final states outside the vertex
  asDict() {
    return { coordinates: 'spatial momenta in the displayed physical frame, before projection or plot scaling',
             vectors: this.vectors.map(vectorDict), sum_guides: this.guides.map(guideDict), planes: this.planes,
             parent_spatial: this.parentSpatial.slice(), plot_scale: this.scale, plot_scale_final: this.scaleFinal };
  }
}

const makeVector = (id, node, parent, spatial, depth, role, context = false) => ({ id, node, parent, spatial, depth, role, context });

/** Recursively expand both daughters of a vertex, within this same frame (see scene.py for the options). */
export function momentumScene(frame, resonances = false, context = false) {
  const order = [...frame.momenta.keys()].filter(key => key !== '0');
  if (frame.kind === 'all' && !resonances) {
    const vectors = leaves(frame.node).map(key => makeVector(frame.key + '/momentum/' + key, key, frame.node, frame.momenta.get(key).slice(1), 0, 'final'));
    return new MomentumScene(vectors, [], frame.momenta.get('0').slice(1), null, order);
  }
  const vectors = [], guides = [];
  const visit = (node, address, parent, depth, role) => {
    const vector = makeVector(frame.key + '/momentum/' + address, node, parent, frame.momentum(node).slice(1), depth, role);
    vectors.push(vector);
    if (typeof node !== 'string') {
      const children = node.map((child, k) => visit(child, address + (k === 0 ? 'L' : 'R'), node, depth + 1, k === 0 ? 'reference' : 'spectator'));
      for (const i of [0, 1]) guides.push({ id: vector.id + '/sum/' + i, start: children[i].spatial.slice(), end: vector.spatial.slice(), copiedVector: children[1 - i], sumId: vector.id, startId: children[i].id });
    }
    return vector;
  };
  const tops = frame.node.map((node, k) => visit(node, k === 0 ? 'L' : 'R', frame.node, 0, k === 0 ? 'reference' : 'spectator'));
  if (frame.kind === 'all') return new MomentumScene(vectors, guides, frame.momenta.get('0').slice(1), [tops[0].id, tops[1].id], order);
  if (context) {
    const inside = new Set(leaves(frame.node));
    for (const key of frame.momenta.keys()) {
      if (key !== '0' && !inside.has(key)) vectors.push(makeVector(frame.key + '/momentum/context/' + key, key, frame.node, frame.momenta.get(key).slice(1), 0, 'context', true));
    }
  }
  return new MomentumScene(vectors, guides, frame.momentum(frame.node).slice(1), null, order);
}
