// The amplitude row of the dynamic view: the amplitude of the decay chain appears term by term while the animation runs.
//
// At the start only the symbol ℳ stands there, with unknown frames [·], and the note that the event is first transformed from the laboratory frame into the rest
// frame of the mother. The steps of that transformation are added one by one. When the animation reaches a frame, the terms of the vertex of this frame appear
// (normalisation, Wigner D function, phase of the spectator, coupling h); when it moves along the line of an intermediate state, the sum over its helicity and its
// lineshape appear. The frame labels of the helicities and of the momenta are filled in with every frame. The row is a function of the position of the animation, so
// stepping back removes the terms again. Hovering a term explains it. The branches of a decay topology are one animation (the animation jumps back to the first vertex between
// them), so the terms of all branches appear in the one row; the jump removes nothing.
//
// Terms (the amplitude construction rules for chains of ordered binary decays):
//   vertex A -> B + C in the frame [v|K]:  sqrt((2 j_A+1)/(4 pi))  D^{j_A *}_{lambda_A, lambda_B - lambda_C}|^{[v|K]}(phi_B, theta_B, 0)  (-1)^{j_C - lambda_C}  h^{[v|K]}_{lambda_B lambda_C}(vertex)
//   intermediate state R:                   sum over lambda_R, lineshape G_R(s_R)
import { h, sym, mt, tagNode, texNode, state, up, itl, vtc, named } from '../../app/common.js';
import { toTex } from '../../render/tex.js';
import { MINUS, tag as frameTag, vertexPiece, linePiece, headMarkup } from '../amplitude/terms.js';

export function buildAmplitude({ payload, figs, cum, trans }) {
  const amp = payload.amplitude;
  if (!amp) return null;
  const K = amp.topology_label, I = amp.reference_label, letter = amp.letter;
  const vertices = amp.vertices;
  const figIndex = new Map();                                       // the first visit of every frame (a frame to which the animation jumps back is visited twice)
  figs.forEach((f, i) => { if (!figIndex.has(f.id)) figIndex.set(f.id, i); });
  const onChain = vertices.filter(v => figIndex.has(v.key));
  const missing = vertices.length > onChain.length;                 // a branch that belongs to another animation
  const root = h('div', { class: 'amplitude-row' });
  const formula = h('div', { class: 'amplitude-align' });                // an align: the head, then one line per step, the signs below each other
  const link = h('button', { type: 'button', class: 'link-button', text: 'How the amplitude is formed', title: 'Opens the page Amplitude construction', onclick: () => state.showPage('amplitude') });
  root.append(h('div', { class: 'amplitude-head' }, [h('span', { class: 'opt-title' }, ['Amplitude of the decay chain ', sym(up(K))]), ' ', link]), formula);

  // ---------------------------------------------------------------- tooltips
  const tip = (title, text) => h('span', { class: 'tip', role: 'tooltip' }, [h('span', { class: 'tip-title' }, title), h('span', { class: 'tip-text' }, Array.isArray(text) ? text : mt(text))]);
  const term = (id, content, title, text, fresh) => h('span', { class: 'term tip-host' + (fresh ? ' fresh' : ''), tabindex: 0, 'data-term': id }, [content, tip(title, text)]);

  // ---------------------------------------------------------------- the pieces of the formula (markup) for a vertex
  const piece = v => vertexPiece(amp, v);
  const pieces = new Map(vertices.map(v => [v.key, piece(v)]));

  const vertexTerms = (v, fresh) => {
    const p = pieces.get(v.key), id = k => `${k}:${v.key}`;
    const decay = `$${p.Aname} → ${p.B} + ${p.C}$`;
    return [
      term(id('norm'), texNode(`\\sqrt{\\frac{${toTex(`2j_{${p.a}}+1`, 0, true)}}{4\\pi}}`), 'Angular normalisation',
        `Normalisation of the angular part for the decay ${decay}. It comes from the expansion of the state of the decaying system with the spin $j_{${p.a}}$ in partial waves. It is fixed by the formalism and no fitted strength.`, fresh.has(id('norm'))),
      term(id('D'), sym(p.D), 'Wigner D function',
        `Complex conjugated Wigner $D$ function for the spin $j_{${p.a}}$ of the decaying system. It turns the spin state, quantised along the $z$ axis of the frame [${v.frame_label}], into the direction of the reference daughter $${p.B}$: $φ_{${p.b}}$ and $ϑ_{${p.b}}$ are its azimuth and polar angle in this frame, the angles of the transformation steps into this frame (with the opposite sign). The third Euler angle is zero by convention. The indices are numerical helicity projections: the decaying system has $${p.lamA}$, the pair of daughters the difference of their helicities.`, fresh.has(id('D'))),
      term(id('phase'), sym(p.phase), 'Phase of the spectator',
        `The phase $(${MINUS}1)^{j_{${p.c}}${MINUS}${letter}_{${p.c}}}$ belongs to the second daughter $${p.C}$. It follows from the half-turn $R_y(π)$ in its transport: the spectator moves opposite to the reference daughter. It must be included once.`, fresh.has(id('phase'))),
      term(id('h'), sym(p.h), 'Reduced coupling',
        `Reduced helicity coupling of the vertex $${vtc(v.display)}$ for the decay ${decay}. It carries the dynamics of this decay, a complex model parameter that can be built from LS couplings, after the dependence on the orientation has been resolved into the $D$ function.`, fresh.has(id('h')))
    ];
  };
  const lineTerms = (v, fresh) => {
    const p = pieces.get(v.key), r = p.a, id = k => `${k}:${v.key}`, R = `$${itl(v.display)}$`, line = linePiece(amp, v);
    return [
      term(id('sum'), sym(line.sum), 'Sum over the helicity',
        `Sum over the helicity of the intermediate state ${R}. The same numerical value leaves its production vertex and enters its decay vertex, so every value contributes coherently.`, fresh.has(id('sum'))),
      term(id('G'), sym(line.G), 'Lineshape',
        `Lineshape (propagator) of the intermediate state ${R}: the dependence on the invariant mass $s_{${r}}$ of its decay products, for example $G(s) = 1/(m_R^2 ${MINUS} s ${MINUS} i m_R Γ_R(s))$ for a resonance with the mass $m_R$ and the width $Γ_R$. Model data. It appears when the animation moves along the line of ${R} in the sketch.`, fresh.has(id('G')))
    ];
  };

  // ---------------------------------------------------------------- what is visible at a position
  let lastKey = '', shown = new Set(), lastLabels = null;
  function update(q) {
    const reached = s => q >= cum[s]-1e-9, started = s => q > cum[s-1]+1e-9;
    const visible = new Set(), frames = new Map();                      // frames: node name or 'root' -> frame markup of the reached vertex
    for (const v of onChain) {
      const s = figIndex.get(v.key);
      if (reached(s)) { visible.add(`vertex:${v.key}`); frames.set(v.key, v.frame_markup); }
      if (!v.root && started(s)) visible.add(`line:${v.key}`);
    }
    const rootReached = onChain.some(v => v.root && reached(figIndex.get(v.key)));
    const done = rootReached ? -1 : Math.min(trans[0].operations.length, Math.floor(q+1e-9));
    const key = JSON.stringify([[...visible].sort(), done, rootReached]);
    if (key === lastKey) return;
    lastKey = key;
    const fresh = new Set([...visible].filter(x => !shown.has(x)).flatMap(x => { const [kind, k] = x.split(':'); return kind === 'vertex' ? ['norm', 'D', 'phase', 'h'].map(t => `${t}:${k}`) : ['sum', 'G'].map(t => `${t}:${k}`); }));
    shown = visible;

    // frame labels of the helicities of the final states and of the momenta
    const production = new Map();                                       // final state -> vertex that produces it
    for (const v of vertices) for (const side of [v.B, v.C]) if (side.leaf) production.set(side.name, v);
    const tag = frameTag;
    const lam = l => { const v = production.get(l.name); return frames.has(v?.key) ? tag(v.frame_markup) : '[·]'; };
    const momentumFrame = l => { let label = null; for (const v of onChain) if (frames.has(v.key) && (v.A.members.includes(l.name) || (l.name === '0' && v.root))) label = v.frame_markup; return label ? tag(label) : '[lab]'; };
    const leaves = amp.leaves, mother = { name: '0', index: '0' };
    const root0 = rootReached ? tag(vertices.find(v => v.root).frame_markup) : '[·]';
    const head = headMarkup(amp, { root0, lam, momentumFrame });
    const finals = leaves.map(l => named(l.index, false));
    const headTip = tip('The amplitude', `Helicity amplitude of the decay chain of the topology $${up(K)}$: the transition from the mother $${named('0', false)}$ with the helicity $λ_{0}$ to the final states $${finals.join(', ')}$ with the helicities $${letter}_{i}$. The helicity of every particle is measured in the frame given in brackets; $[·]$ is not known yet and is filled in when the animation reaches the frame in which that helicity is measured. The argument lists the momenta and the frame in which they are shown. The amplitude is built up step by step while the animation runs.`);

    const headTerm = h('span', { class: 'term tip-host head', tabindex: 0 }, [sym(head), headTip]);
    // a frame label that was unknown ([·]) and is filled in now lights up for a moment, like a new term; the labels are in the order of the head: root, helicities, momenta
    const labelList = [root0, ...leaves.map(lam), ...[mother, ...leaves].map(momentumFrame)];
    const labelNodes = headTerm.querySelectorAll('.frame');
    if (lastLabels && labelNodes.length === labelList.length) labelList.forEach((x, i) => { if (lastLabels[i] === '[·]' && x !== '[·]') labelNodes[i].classList.add('flash'); });
    lastLabels = labelList;
    const rows = [h('div', { class: 'align-head' }, headTerm)];                                            // the first line: the amplitude itself
    const row = (sign, cells) => rows.push(h('div', { class: 'align-sign', text: sign }), h('div', { class: 'align-line' }, cells.flatMap((c, i) => i ? ['\u2009', c] : [c])));
    if (!rootReached) {
      const ops = trans[0].operations.slice(0, done).reverse().map(o => o.factor_markup);
      const rootFrame = vertices.find(v => v.root).frame_markup;
      row('∝', [h('span', { class: 'term tip-host note', tabindex: 0 }, [
        h('span', { class: 'note-text' }, ['first transform ', tagNode('lab'), ' → ', tagNode(rootFrame)]), ops.length ? [': ', sym(ops.join(' '))] : null,
        tip('Transformation into the rest frame of the mother', `The helicity of the mother $${named('0', false)}$ is defined in its rest frame with the common root axes. The event is therefore first transformed from the laboratory frame into $[R_0|${up(K)}]$. These are the steps of the animation; the product is read from right to left, the step that was applied last stands on the left. The terms of the amplitude appear afterwards.`)])]);
    } else {
      // one line for every step of the animation, in the order in which the terms appear
      let first = true;
      for (const v of onChain) {
        if (!v.root && visible.has(`line:${v.key}`)) { row(first ? '∝' : '×', lineTerms(v, fresh)); first = false; }
        if (visible.has(`vertex:${v.key}`)) { row(first ? '∝' : '×', vertexTerms(v, fresh)); first = false; }
      }
      const complete = vertices.every(v => visible.has(`vertex:${v.key}`));
      if (!complete) row('×', [h('span', { class: 'term tip-host', tabindex: 0 }, ['…', tip('The amplitude continues', missing && onChain.every(v => visible.has(`vertex:${v.key}`))
        ? 'Terms of the other branches of the decay topology. They appear in the animation of that branch.' : 'The terms of the next steps appear when the animation reaches them: the lineshape and the sum of the next intermediate state, then the factors of its vertex.')])]);
    }
    formula.replaceChildren(...rows);
  }
  update(0);
  return { root, update, reset: () => { lastKey = ''; shown = new Set(); lastLabels = null; } };
}
