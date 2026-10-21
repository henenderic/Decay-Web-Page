// "From a single decay to a decay chain": the contribution of the chosen chain to the decay amplitude, the complete sets that are inserted, the amplitude of every single decay,
// and the product that is the amplitude of the dynamic view. Everything is generated from the chain of the event; the factors of the final product come from terms.js,
// the module that the amplitude row of the dynamic view uses as well.
import { h, mtex, texNode } from '../../app/common.js';
import { toTex } from '../../render/tex.js';
import { vertexPiece, linePiece, headMarkup, completeLabels } from './terms.js';

const T = markup => toTex(markup, 0, true);
const F = markup => toTex(markup, 0, false);                                                    // the markup of a term of the amplitude row (see terms.js)
const raw = String.raw;

export function buildChain(payload, { link, projection }) {
  const amp = payload.amplitude, vertices = amp.vertices, K = amp.topology_label, letter = amp.letter;
  const P = (...nodes) => h('p', {}, nodes.flat());
  const D = tex => h('div', { class: 'formula' }, [texNode(tex, { display: true })]);
  const rootV = vertices.find(v => v.root);
  const parentOf = v => vertices.find(u => u.B.name === v.node || u.C.name === v.node);
  const byNode = new Map(vertices.map(v => [v.node, v]));
  const frameSup = markup => raw`^{\htmlClass{frame}{\scriptscriptstyle[${T(markup)}]}}`;
  const tex = side => side.leaf ? raw`\prt{${side.name}}` : raw`\itl{${side.display}}`;       // a daughter of a vertex, in the notation of the manuscript
  const texVertex = v => raw`\vtc{${v.display}}`;
  const sentence = text => P(...mtex(text));

  // ---------------------------------------------------------------- the product of the vertices and propagators, grouped by the depth in the tree
  const depth = new Map();
  vertices.forEach(v => { const p = parentOf(v); depth.set(v.key, p ? depth.get(p.key)+1 : 0); });              // the vertices are listed from the root down, so parents come first
  const D_MAX = Math.max(...depth.values());
  /** The objects present before the decays of level d, in the order of the diagram: particles already produced, intermediate states that decay at level d or later. */
  const cut = d => {
    const out = [];
    const walk = (side, parentDepth) => {                                         // side: a daughter of a vertex of depth parentDepth
      const v = byNode.get(side.name);
      if (parentDepth < d) { if (side.leaf) { out.push({ side, v: null }); return; } if (depth.get(v.key) >= d) { out.push({ side, v }); return; } }
      if (v) { walk(v.B, depth.get(v.key)); walk(v.C, depth.get(v.key)); }
    };
    walk(rootV.B, 0); walk(rootV.C, 0);
    return d === 0 ? [{ side: { name: '0', leaf: false, root: true }, v: rootV }] : out;
  };
  const objectName = o => o.side.root ? raw`\prt{0}` : tex(o.side);
  const tensor = parts => parts.join(raw`\otimes `);
  const vFactor = d => tensor(cut(d).map(o => (o.v && depth.get(o.v.key) === d) ? raw`V_{${texVertex(o.v)}}` : raw`\one_{${objectName(o)}}`));
  const gFactor = d => tensor(cut(d).map(o => (o.v && depth.get(o.v.key) === d && !o.v.root) ? raw`G_{\itl{${o.v.display}}}` : raw`\one_{${objectName(o)}}`));
  const pieces = [];
  for (let d = D_MAX; d >= 1; d--) pieces.push(raw`\Big(${vFactor(d)}\Big)\Big(${gFactor(d)}\Big)`);
  pieces.push(raw`V_{${texVertex(rootV)}}`);
  const total = pieces.length > 3
    ? raw`\begin{aligned}T^{\text{${K}}}={}&${pieces.map((piece, k) => (k ? raw`&\quad` : '') + piece).join(raw`\\ `)}\,.\end{aligned}`
    : raw`T^{\text{${K}}}=${pieces.join('\\,')}\,.`;

  // ---------------------------------------------------------------- the amplitude of a single decay, the matrix element of its vertex
  const vertexAmplitude = v => {
    const p = vertexPiece(amp, v);
    return raw`\mathcal M_{${texVertex(v)}}=\sqrt{\frac{2\pi}{\rho_{${T(p.a)}}}}\;\sqrt{\frac{${T(`2j_{${p.a}}+1`)}}{4\pi}}\;${F(p.D)}\;${F(p.phase)}\;${F(p.h)}\,.`;
  };

  // ---------------------------------------------------------------- the complete set that stands at the first decay
  const fRoot = frameSup(rootV.frame_markup);
  const b = T(rootV.B.index), c = T(rootV.C.index), nb = `${letter}_{${b}}`, nc = `${letter}_{${c}}`;
  const completeSet = raw`\begin{aligned}\cdots\,\Big[\sum_{${nb},${nc}}\int\frac{\Int^3p_{${b}}\,\Int^3p_{${c}}}{(2\pi)^6\,4E_{${b}}E_{${c}}}\,\lvert\vec p_{${b}},\vec p_{${c}};${nb},${nc}\rangle${fRoot}\,{}${fRoot}\langle\vec p_{${b}},\vec p_{${c}};${nb},${nc}\rvert\Big]\,V_{${texVertex(rootV)}}\,\lvert\vec p_0;\lambda_0\rangle^{\htmlClass{frame}{\scriptscriptstyle[\text{lab}]}}\,.\end{aligned}`;

  // ---------------------------------------------------------------- the final product: the same terms as the amplitude row of the dynamic view, in the same order
  const termRows = [];
  for (const v of vertices) {
    const p = vertexPiece(amp, v);
    if (!v.root) { const line = linePiece(amp, v); termRows.push(`${F(line.sum)}\\,${F(line.G)}`); }
    termRows.push([raw`\sqrt{\frac{${T(`2j_{${p.a}}+1`)}}{4\pi}}`, F(p.D), F(p.phase), F(p.h)].join(raw`\,`));
  }
  const head = F(headMarkup(amp, completeLabels(amp)));
  const product = raw`\begin{aligned}&${head}\ \propto\\ ${[raw`&\quad ${termRows[0]}`, ...termRows.slice(1).map(row => raw`&\quad\times\ ${row}`)].join(raw`\\ `)}\end{aligned}`;

  // ---------------------------------------------------------------- the text
  const nodes = [h('h3', { text: 'From a single Decay to a Decay Chain' })];
  const resonances = vertices.length-1;
  nodes.push(
    sentence(`The decay chain chosen above, $\\text{${K}}$, corresponds to the contribution $T^{\\text{${K}}}$ to the decay amplitude. It is the product of the vertices $V$ of the single decays and the propagators $G$ of the intermediate states. A vertex acts only on the particles that take part in its decay; on all other objects it acts as the unit operator, $\\otimes\\,\\one$, so that every factor of the product is a tensor product over all objects that are present at that stage:`),
    D(total),
    sentence(`On the left stand the last decays. Decays on the same level of the diagram take place independently of each other and are written as a tensor product, in which the decay of the reference particle stands first. Next to them stand the propagators of the intermediate states that decay on this level, in the same order, then the decays of the level before, and so on, up to the first vertex $V_{${texVertex(rootV)}}$ on the right, which acts first on the state of the mother.`),
    sentence(`First the initial and the final state are projected onto this contribution:`),
    D(projection),
  );
  if (resonances === 0) {
    nodes.push(sentence(`The chain consists of the single decay of the mother, so that no complete set of states has to be inserted. Its amplitude, according to the derivation above, is`), D(vertexAmplitude(rootV)));
  } else {
    nodes.push(
      sentence(resonances === 1 ? `By inserting a complete set of particle states the complete contribution is then determined. One begins at the very right, with the first decay, that of the mother into the resonance:`
                                : `By inserting several complete sets of particle states the complete contribution is then determined. One begins at the very right, with the first decay, that of the mother into its two daughters:`),
      D(completeSet));
    const leaves = [rootV.B, rootV.C].filter(s => s.leaf), resonant = [rootV.B, rootV.C].filter(s => !s.leaf);
    if (leaves.length && resonant.length) {
      nodes.push(sentence(`The non-resonant final-state particle $${tex(leaves[0])}$ can be moved forward up to here. Together with the resonant particle $${tex(resonant[0])}$ it forms a state that acts on the vertex $V_{${texVertex(rootV)}}$. According to the derivation above, the amplitude of this decay is`));
    } else {
      nodes.push(sentence(`The two daughters $${tex(rootV.B)}$ and $${tex(rootV.C)}$ are both resonances; together they form a state that acts on the vertex $V_{${texVertex(rootV)}}$. According to the derivation above, the amplitude of this decay is`));
    }
    nodes.push(D(vertexAmplitude(rootV)));
    for (const v of vertices.filter(u => !u.root)) {
      const parent = parentOf(v), spectator = parent.C.name === v.node;
      const aside = spectator ? ` The intermediate state is the spectator of the decay that produced it: its phase stands in the amplitude of that vertex, and its own decay is evaluated in its rest frame, which is reached through the same half-turn $R_y(\\pi)$.` : '';
      nodes.push(
        sentence(`The decay of the intermediate state $\\itl{${v.display}}$ into $${tex(v.B)}$ and $${tex(v.C)}$ is treated in the same way: a complete set of its states stands next to its propagator $G_{\\itl{${v.display}}}$, the final-state particles that take no part in this decay are moved forward, and the amplitude of the vertex is${aside}`),
        D(vertexAmplitude(v)));
    }
  }
  nodes.push(
    sentence(`The final contribution to the scattering amplitude is the product of the single amplitudes, connected by the ${resonances > 1 ? 'propagators' : 'propagator'} of the ${resonances > 1 ? 'resonances' : 'resonance'}, with the helicity of every intermediate state summed over. In the frame labels of this form every helicity and every momentum carries the frame in which it is measured, instead of the common label $[\\text{lab}]$ of the states above; the rotations and boosts between these frames are the steps of the animation.`),
    D(product),
    P(...mtex(`The factors $\\sqrt{2\\pi/\\rho}$ of the phase space of the single decays and the factors in front of $\\mathcal M$ are not written. This is the amplitude that the amplitude row of the `), link('dynamic', 'dynamic view'), ...mtex(` builds up term by term while the animation runs: it takes its terms from the same source as this page, and the last line of the row agrees with the product above.`)));
  return nodes;
}
