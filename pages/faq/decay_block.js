// The block "The Formula for the Selected Decay" of the page of card 1: it shows how the general formula of the page follows for the decay that is selected in the Decay
// Description, in six short steps. The values of the selection stand in small coloured boxes and the formulas in coloured, centred boxes (the rule of the page for everything that
// depends on the selection). The block only explains the substitution; why the factors look the way they do is explained on other cards.
// It reads the selection from state.payload (amplitude, alignment, topologies) and takes the terms of the formula from pages/amplitude/terms.js, like the amplitude row of the
// dynamic view and the page "Amplitude construction", so all three show the same formula. The factors carry the classes of pages/faq/correspond.js.
import { h, texNode, sym, tagNode, mtex } from '../../app/common.js';
import { toTex } from '../../render/tex.js';
import { vertexPiece, linePiece, headMarkup, completeLabels } from '../amplitude/terms.js';
import { cardLink } from './inline.js';

const T = markup => toTex(markup, 0, true);
const F = markup => toTex(markup, 0, false);                                                 // the markup of a term of the amplitude (see terms.js)
const raw = String.raw;
const mark = (name, tex) => raw`\htmlClass{sym-${name}}{${tex}}`;
const box = node => h('span', { class: 'selection-inline' }, node);
const formula = tex => h('div', { class: 'formula selection-box faq-decay-formula' }, [texNode(tex, { display: true })]);

/** The factor of one vertex: the same terms as in the amplitude row, with the classes of the correspondence. */
function vertexFactor(amp, v) {
  const p = vertexPiece(amp, v), cut = p.D.lastIndexOf('(');                                  // the arguments of the D function (the angles) stand after the last opening bracket
  return [mark('density', raw`\sqrt{\frac{4\pi}{\rho_{${T(p.b)},${T(p.c)}}}}`), mark('norm', raw`\sqrt{\frac{${T(`2j_{${p.a}}+1`)}}{4\pi}}`), mark('spin', F(p.D.slice(0, cut)))+mark('angles', F(p.D.slice(cut))), mark('phase', F(p.phase)), mark('coupling', F(p.h))]
    .join(raw`\,`);
}

/** The amplitude of the chain: the head and the product of the vertex factors and the propagators, with the sums over the helicities of the intermediate states in front. */
function chainAmplitude(amp) {
  const rows = [], sums = [];
  for (const v of amp.vertices) {
    if (!v.root) { const line = linePiece(amp, v); sums.push(mark('internal-sum', F(line.sum))); rows.push(mark('propagator', F(line.G))); }
    rows.push(vertexFactor(amp, v));
  }
  if (sums.length) { rows[0] = raw`${sums.join(raw`\,`)}\Big[${rows[0]}`; rows[rows.length-1] += raw`\,\Big]`; }
  const head = mark('amp', F(headMarkup(amp, completeLabels(amp))));
  return raw`\begin{aligned}&${head}=\\ ${[raw`&\quad ${rows[0]}`, ...rows.slice(1).map(row => raw`&\quad\times\ ${row}`)].join(raw`\\ `)}\end{aligned}`;
}

/** The alignment factor of every final-state particle and the contribution of the chain to the full amplitude, for a chain that is not the reference topology. */
function alignmentFormula(amp, K, I) {
  const factors = amp.leaves.map(l => raw`D^{j_{${T(l.index)}}}_{\lambda_{${T(l.index)}}\nu_{${T(l.index)}}}\big(W_{${T(l.index)}}^{\text{${K}}\to\text{${I}}}\big)`);
  return raw`\htmlClass{sym-alignment}{${factors.join(raw`\,`)}}`;
}

/** The nodes of the block for the selection in `payload` (null: no decay yet). */
export function buildDecayBlock(payload, ctx) {
  const amp = payload?.amplitude;
  if (!amp) {
    const go = e => { e.preventDefault(); document.getElementById('decay-description')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    return [h('p', { class: 'faq-decay-none' }, ['No decay is selected yet. Enter a decay in the ', h('a', { class: 'faq-xref', href: '#decay-description', onclick: go, text: 'Decay Description' }), ' to see its amplitude here.'])];
  }
  const vertices = amp.vertices, n = amp.leaves.length, K = payload.decay_label, I = payload.reference_label, aligned = !payload.alignment;
  const kLabel = () => box(texNode(raw`\text{${K}}`)), iLabel = () => box(texNode(raw`\text{${I}}`));
  const inner = vertices.filter(v => !v.root);
  const name = side => side.leaf ? raw`\prt{${side.name}}` : raw`\itl{${side.display}}`;
  const vertexName = v => raw`\vtc{${v.display}}`;
  const step = (title, ...content) => h('li', {}, [h('strong', { text: title }), ' ', ...content.flat()]);

  // 1. read the decay
  const read = step('Read the decay.', 'The selected decay has ', box(texNode(String(n))), ' final-state particles. Its topology is ', kLabel(), ' (written ', box(texNode(raw`\text{${payload.topologies.decay.display}}`)), ')',
                    aligned ? [' and it is also the reference topology.']
                            : [' and the reference topology is ', iLabel(), ' (written ', box(texNode(raw`\text{${payload.topologies.reference.display}}`)), ').']);

  // 2. list the vertices
  const head = ['Vertex $(v)$', 'Decaying particle $A_{\\mathrm p/\\mathrm i}^{(v)}$', 'Reference $a_{\\mathrm p/\\mathrm i}^{(v)}$', 'Spectator $b_{\\mathrm p/\\mathrm i}^{(v)}$', 'Frame'];
  const table = h('table', { class: 'faq-table faq-decay-table' }, [
    h('thead', {}, [h('tr', {}, head.map(text => h('th', {}, mtex(text))))]),
    h('tbody', {}, vertices.map(v => h('tr', {}, [texNode(vertexName(v)), texNode(v.root ? raw`\prt{0}` : raw`\itl{${v.display}}`), texNode(name(v.B)), texNode(name(v.C)), tagNode(v.frame_markup)].map(cell => h('td', {}, cell)))))]);
  const list = step('List the vertices.', 'The chain ', kLabel(), ' has ', box(texNode(String(vertices.length))), ' ', vertices.length === 1 ? 'vertex:' : 'vertices:', h('div', { class: 'faq-table-wrap' }, [table]));

  // 3. the vertex factors
  const factors = step('Insert the vertex factors.', 'For each vertex the factor of Eq. (1.1) is written with its own names, spins, angles and frame.',
    vertices.map(v => h('div', { class: 'faq-decay-item' }, [h('p', { class: 'selection-lead' }, ['For the vertex ', box(texNode(vertexName(v))), ' it reads']), formula(vertexFactor(amp, v))])));

  // 4. the intermediate states
  const states = step('Insert the intermediate states.',
    inner.length ? ['The chain has ', box(texNode(String(inner.length))), inner.length === 1 ? ' intermediate state, which gives' : ' intermediate states, each of which gives', ' a propagator and a sum over its helicity:',
                    h('ul', { class: 'faq-decay-states' }, inner.map(v => { const line = linePiece(amp, v);
                      return h('li', {}, [box(texNode(raw`\itl{${v.display}}`)), ': the propagator ', box(texNode(F(line.G))), ' and the sum ', box(texNode(F(line.sum))), '.']); })),
                    ' The sums stand in front of the whole product. ']
                 : ['The chain has no intermediate state, so there is no propagator and there is no sum over a helicity. '],
    'The Decay Description fixes the topology. Which resonances populate the intermediate states is model data, so the formula is written for one resonance in each intermediate state, that is, for one combination ',
    texNode(raw`\alpha`), '. Other combinations give further chains of the same topology.');

  // 5. put it together
  const together = step('Put it together.', 'The amplitude of the chain ', kLabel(), ' is', formula(chainAmplitude(amp)));

  // 6. align
  const align = aligned
    ? step('Align.', 'Because the chain ', kLabel(), ' is the reference topology, no alignment is needed. The Wigner rotation is the identity.')
    : step('Align.', 'Because the chain ', kLabel(), ' is not the reference topology ', iLabel(), ', its amplitude enters the full amplitude with the alignment factor of every final-state particle (', cardLink(29, ctx), '):',
           formula(alignmentFormula(amp, K, I)));
  return [h('ol', { class: 'faq-decay-steps' }, [read, list, factors, states, together, align])];
}
