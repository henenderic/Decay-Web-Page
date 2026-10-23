// The terms of the amplitude of a decay chain, in one place: the amplitude row of the dynamic view builds them up step by step while the animation runs, and the page
// "Amplitude construction" writes the complete product. Both take the markup from here, so that the amplitude on the page is the amplitude of the dynamic view.
//
//   vertex A -> B + C in the frame [v|K]:  sqrt((2 j_A+1)/(4 pi))  D^{j_A *}_{lambda_A, lambda_B - lambda_C}|^{[v|K]}(phi_B, theta_B, 0)  (-1)^{j_C - lambda_C}  h^{[v|K]}_{lambda_B lambda_C}(vertex)
//   intermediate state R:                   sum over lambda_R, lineshape G_R(s_R)
import { itl, vtc, named, up } from '../../app/common.js';
import { toTex } from '../../render/tex.js';

export const MINUS = '−';
export const tag = frame => `[${frame}]`;

/** The markup of the terms of the vertex v: the strings a, b, c are the indices of the decaying system and of its two daughters, F the frame in which the vertex is evaluated. */
export function vertexPiece(amp, v) {
  const letter = amp.letter;
  const a = v.A.index, b = v.B.index, c = v.C.index, F = v.frame_markup, lamA = v.root ? 'λ_{0}' : `${letter}_{${a}}`;
  const Aname = v.root ? named('0', false) : itl(v.display), B = named(v.B.leaf ? v.B.name : v.B.display, !v.B.leaf), C = named(v.C.leaf ? v.C.name : v.C.display, !v.C.leaf);
  return {
    a, b, c, F, Aname, B, C,
    D: `D^{j_{${a}}*}_{${lamA},${letter}_{${b}}${MINUS}${letter}_{${c}}}|^{[${F}]}(φ_{${b}},ϑ_{${b}},0)`,
    phase: `(${MINUS}1)^{j_{${c}}${MINUS}${letter}_{${c}}^{[${F}]}}`,
    h: `h^{[${F}]}_{${letter}_{${b}}${letter}_{${c}}}(${vtc(v.display)})`,
    lamA
  };
}

/** The markup of the sum over the helicity and of the lineshape of the intermediate state that decays at the vertex v. */
export function linePiece(amp, v) {
  const r = v.A.index;
  return { r, sum: `Σ_{${amp.letter}_{${r}}}`, G: `G_{${r}}(s_{${r}})` };
}

/**
 * The head of the amplitude, ℳ^{(K)λ_0}_{λ_1 ... λ_n}(p_0; p_1, ..., p_n), with the frame label of every helicity and momentum.
 * labels: {root0, lam(leaf), momentumFrame(leaf)}; the labels are '[·]' for a frame that is not known yet.
 */
export function headMarkup(amp, { root0, lam, momentumFrame }) {
  const letter = amp.letter, leaves = amp.leaves, mother = { name: '0', index: '0' };
  const lower = leaves.map(l => `${letter}_{${l.index}}^{${lam(l)}}`).join(' ');
  const momenta = [mother, ...leaves].map(l => `~p_{${l.index}}^{${momentumFrame(l)}}`);
  return `ℳ^{(${up(amp.topology_label)})}^{λ_{0}^{${root0}}}_{${lower}}(${momenta[0]}; ${momenta.slice(1).join(', ')})`;           // the label of the chain stands before all helicities
}

/** The frame labels once the whole chain has been reached: the helicity of a final state in the frame of its production, its momentum in the frame of the deepest vertex that contains it. */
export function completeLabels(amp) {
  const vertices = amp.vertices, production = new Map();
  for (const v of vertices) for (const side of [v.B, v.C]) if (side.leaf) production.set(side.name, v);
  return {
    root0: tag(vertices.find(v => v.root).frame_markup),
    lam: l => tag(production.get(l.name).frame_markup),
    momentumFrame: l => { let label = null; for (const v of vertices) if (v.A.members.includes(l.name) || (l.name === '0' && v.root)) label = v.frame_markup; return tag(label); }
  };
}

/** The matrix element of the vertex v in TeX, with the phase-space factor of the two products (ρ with the indices of the two products), written out in full; the page uses it in the derivation
 *  of a single decay and in the chain, so both give the same formula. */
export function vertexAmplitudeTex(amp, v) {
  const p = vertexPiece(amp, v), T = markup => toTex(markup, 0, true), F = markup => toTex(markup, 0, false);
  return String.raw`\mathcal M_{\vtc{${v.display}}}=\sqrt{\frac{2\pi}{\rho_{${T(p.b)},${T(p.c)}}}}\;\sqrt{\frac{${T(`2j_{${p.a}}+1`)}}{4\pi}}\;${F(p.D)}\;${F(p.phase)}\;${F(p.h)}\,.`;
}
