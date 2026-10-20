// Page "Next step": how a spin state of the decay topology K is carried into the helicity basis of the reference topology I.
// The page lists the steps of the chains by which the frames of both topologies are reached (L_{parent<-daughter} = R_z(phi) R_y(theta) [R_y(pi)] B_z(eta)),
// builds W = [chain of I]^{-1} [chain of K] from them, and mentions the shorter route W = R_z(alpha) R_y(beta) R_z(gamma) in addition.
// There are no numbers on the page. The names of the steps come from the Python core (alignment.py, interactive_data.py); the browser only sets the text.
import { h, sym, mt, plain, tagNode, MINUS, state, up, prt } from '../../app/common.js';
import { buildSketch, stepSelection } from '../../render/sketch.js';

const GREEK = ['γ', 'β', 'α'];                                                           // the three Euler operations are listed in the order of application: R_z(γ), R_y(β), R_z(α)

export function buildNextStepPage(payload) {
  const data = payload.alignment;
  if (!data) return null;
  const entries = data.particles;
  if (!entries.length) return null;
  const K = data.source_label, I = data.target_label;
  const run = { entry: entries.find(e => e.available && !e.identity) || entries.find(e => e.available) || entries[0] };
  const Ks = () => sym(up(K)), Is = () => sym(up(I));                                    // topology labels are upright text; a DOM node can be inserted only once
  const trans = `${up(K)}→${up(I)}`;

  // ---------------------------------------------------------------- the chains and the three Euler operations of W
  const spaced = nodes => nodes.flatMap((n, i) => i ? [' ', n] : [n]);
  const chainOf = edges => spaced(edges.map(edge => sym(edge.label)));                  // L_{parent←daughter}^{T}, root-nearest step first
  const factorsOf = edge => edge.factors.map(f => f.markup).join(' ');
  const inverseOf = edge => edge.factors.slice().reverse().map(f => f.inverse_markup).join(' ');    // the inverse of a step: the factors in reverse order with opposite parameters
  const uniqueEdges = key => { const seen = new Map(); entries.filter(e => e.available).forEach(e => e[key].forEach(edge => { if (!seen.has(edge.label)) seen.set(edge.label, edge); })); return [...seen.values()]; };
  const opsOf = e => e.available ? e.operations.filter(op => Math.abs(op.parameter) > 1e-12) : [];
  const shortOf = (e, op) => op.short_markup || `${op.operator === 'Ry' ? 'R_y' : 'R_z'}(${GREEK[e.operations.indexOf(op)]})`;      // short_markup comes from the core; this keeps the page working with an older core
  const eulerChain = e => opsOf(e).slice().reverse().map(op => shortOf(e, op));          // W = R_z(α) R_y(β) R_z(γ): the factor applied last stands leftmost

  const F = (...lines) => h('div', { class: 'formula' }, lines.flatMap((l, i) => i ? [h('br'), sym(l)] : [sym(l)]));      // displayed formulas
  const headOf = label => label.split('|')[0];
  const stepSketch = (edge, topology) => {                                                // tiny stylised sketch: the vertex of the parent, the line to the daughter and, for an intermediate state, its vertex
    if (!topology) return '';
    const sk = buildSketch(topology, { width: 132, labels: 'names', stylised: true });
    sk.update(stepSelection(sk.layout, headOf(edge.parent).startsWith('R0^') ? sk.layout.root.name : headOf(edge.parent), headOf(edge.child)));
    sk.svg.setAttribute('aria-label', `The step ${plain(edge.label)} in the sketch of the topology`);
    return sk.svg;
  };
  const stepTable = (edges, topology) => h('table', { class: 'num-table steps-table' }, [
    h('thead', {}, h('tr', {}, ['Step', 'Rotations', 'Boost', 'Path in the sketch'].map(c => h('th', { text: c })))),
    h('tbody', {}, edges.map(edge => {
      const rotations = edge.factors.filter(f => f.operator !== 'Bz').map(f => f.markup).join(' '), boost = edge.factors.filter(f => f.operator === 'Bz').map(f => f.markup).join(' ');
      return h('tr', {}, [h('td', {}, sym(edge.label)), h('td', {}, rotations ? sym(rotations) : '–'), h('td', {}, boost ? sym(boost) : '–'), h('td', { class: 'step-sketch' }, stepSketch(edge, topology))]);
    }))]);
  const link = () => h('button', { type: 'button', class: 'link-button', text: 'Euler rotations', title: 'Opens the section Euler rotations on the page Amplitude construction', onclick: () => state.showEuler() });

  // ---------------------------------------------------------------- the particle table: where the helicity is measured and the paths
  const chooser = h('div', { class: 'align-chooser' });
  function buildChooser() {
    chooser.replaceChildren(h('table', { class: 'num-table align-table' }, [
      h('thead', {}, h('tr', {}, ['Particle', `Helicity measured in $${up(K)}$`, `Helicity measured in $${up(I)}$`, `Path in $${up(K)}$`, `Path in $${up(I)}$`].map(t => h('th', {}, mt(t))))),
      h('tbody', {}, entries.map(e => h('tr', { class: 'align-row' + (e === run.entry ? ' selected' : ''), 'data-particle': e.particle }, [
        h('td', {}, h('button', { type: 'button', class: 'op-chip align-chip', 'aria-pressed': String(e === run.entry), title: e.available ? `Build W for the particle ${e.particle}` : e.reason,
                                  disabled: !e.available, onclick: () => { run.entry = e; rebuild(); } }, sym(prt(e.index_markup)))),
        h('td', {}, tagNode(e.source_markup)), h('td', {}, tagNode(e.target_markup)),
        h('td', { class: 'align-path' }, e.available ? chainOf(e.source_edges) : '–'), h('td', { class: 'align-path' }, e.available ? chainOf(e.reference_edges) : '–')])))]));
  }

  // ---------------------------------------------------------------- the explanation, in the order of the construction
  const part1 = h('div', { class: 'next-part' }, [
    h('h3', { text: 'Two bases for one state' }),
    h('p', {}, ['The helicity of a final-state particle is measured in the frame of the decay that produced it: in the rest frame of its parent, along the direction of motion of the particle in that frame. ',
      'In the decay topology ', Ks(), ' and in the reference topology ', Is(), ' the same particle is produced by different decays, so its helicity is measured in different frames; the table below lists them for every particle.']),
    h('p', {}, ['From the frame of measurement the particle is carried into its own rest frame, and a chain of rotations and boosts leads from there, through the frame of measurement and the frames above it, up to the common root frame. ',
      'The two topologies use different chains for the same particle. The rest frames of the particle at the end of the two chains have the same rest momentum but, in general, different axes, ',
      'and a helicity label of ', Ks(), ' does not denote the same spin state as the same label of ', Is(), '. Only when every spin state is expressed in the basis of ', Is(), ' can the amplitudes of both topologies be added coherently.']),
    h('h3', { text: 'The steps of the chains' }),
    h('p', {}, mt('Every decay transports the rest frame of one of its daughters into the rest frame of its parent. Let $C$ be the transported daughter and $B$ the first (reference) daughter of the decay. The transport is the product')),
    F('L_{parent←C} = R_z(φ_B) R_y(ϑ_B) B_z(η_C),'),
    h('p', {}, mt('in which the rightmost factor acts first, and for the second daughter the half-turn $R_y(π)$ stands in front of the boost. $B_z(η_C)$ is the boost along $z$ with the rapidity of $C$ in the parent frame. The half-turn takes care of the second daughter moving opposite to the first one. $R_y(ϑ_B)$ and $R_z(φ_B)$ turn the $z$ axis into the direction of $B$ in the parent frame, with the polar angle $ϑ_B$ and the azimuth $φ_B$. Factors with the value zero are left out; the superscript names the topology.')),
    h('p', {}, ['The steps of the topology ', Ks(), ' of this event are']),
    stepTable(uniqueEdges('source_edges'), payload.topologies?.decay),
    h('p', {}, ['and those of the reference topology ', Is(), ':']),
    stepTable(uniqueEdges('reference_edges'), payload.topologies?.reference),
    h('p', {}, mt('Here $R_0$ is the common root frame. The transport from the laboratory frame into it is the same for both topologies and drops out of everything below.')),
    h('h3', { text: 'The paths of the particles' }),
    h('p', {}, 'The path of a final-state particle is the product of the steps from the root frame to the particle, the step nearest to the root leftmost. These are the paths of this event:'),
    chooser]);

  const build = h('div', { class: 'next-part' });                                        // W of the selected particle
  function buildBuild() {
    const e = run.entry, idx = e.index_markup, Wi = `W_{${idx}}^{${trans}}`;
    const nodes = [h('h3', { text: 'Building W' }),
      h('p', {}, ['The change of basis follows the path of ', Ks(), ' up to the root frame and the path of ', Is(), ' down again. ', sym('W'), ' is therefore the inverse of the path in ', Is(), ' multiplied by the path in ', Ks(), ':']),
      h('div', { class: 'formula' }, [sym(`W_i^{${trans}}`), ' = [path of ', sym('i'), ' in ', Is(), ']', h('sup', { text: MINUS+'1' }), ' [path of ', sym('i'), ' in ', Ks(), '].'])];
    if (!e.available) nodes.push(h('p', { text: e.reason }));
    else {
      const ref = e.reference_edges, src = e.source_edges;
      const written = [...ref.slice().reverse().map(inverseOf), ...src.map(factorsOf)].filter(g => g).map(g => `(${g})`).join(' ');
      nodes.push(
        h('p', { class: 'selection-lead' }, ['For the selected particle ', h('span', { class: 'selection-inline' }, sym(prt(idx))), ' the two paths are made of the steps above:']),
        h('div', { class: 'formula selection-box' }, [sym(Wi), ' = [', ...chainOf(ref), ']', h('sup', { text: MINUS+'1' }), ' ', ...chainOf(src), '.']),
        h('p', {}, ['The inverse of a chain undoes its steps in the reverse order, each with the opposite parameter. With the operators of the steps written out, the same ', sym('W'), ' reads']),
        h('div', { class: 'formula selection-box' }, sym(`${Wi} = ${written}.`)),
        h('p', {}, mt('The rightmost factor acts first. The steps of the decay topology carry the rest state of the particle up to the root frame; the inverse steps of the reference topology carry it down again into the rest frame of the particle in the reference topology. Both paths lead from the same rest momentum to the same root momentum, so the product leaves the rest momentum unchanged and is a pure rotation, although it is made of rotations and boosts. $W$ does not change the physical state and adds no interaction; it only compares the two spin bases.')));
    }
    build.replaceChildren(...nodes);
  }

  const shorter = h('div', { class: 'next-part' }, [
    h('h3', { text: 'A shorter route: three Euler rotations' }),
    h('p', {}, [...mt('Since $W$ is a pure rotation, it does not have to be built from the steps of the chains when only its action on the spin is needed. Like every rotation it is described by three Euler angles ('), link(),
      ...mt('), which are read from its rotation matrix $R$, the spatial block of $W$. It rotates vectors, so its angles are positive. On a spin state of angular momentum $j$ it acts as')]),
    F('W = R_z(α) R_y(β) R_z(γ), U(W) = ε^{2j} e^{−iα J_z} e^{−iβ J_y} e^{−iγ J_z}.'),
    h('p', {}, mt('Here $ε = ±1$ is the sign of the spin lift, which is explained below. The formula describes the same $W$, with at most three factors; the rightmost factor acts first. Each of the three operators has its own task:')),
    h('ul', { class: 'operator-list' }, [
      h('li', {}, [sym('R_z(γ)'), ...mt(' turns the transverse axes of the rest frame of the particle in '), Ks(), ...mt(' about the helicity axis. It acts on the helicity $ν$ of '), Ks(), ...mt(' only as the phase $e^{−iνγ}$.')]),
      h('li', {}, [sym('R_y(β)'), ...mt(' tilts the helicity axis: $β$ is the angle between the helicity axes of the two topologies. It is the only one of the three rotations that mixes helicities.')]),
      h('li', {}, [sym('R_z(α)'), ...mt(' turns the transverse axes about the $z$ axis of the reference frame. It acts on the helicity $λ$ of '), Is(), ...mt(' only as the phase $e^{−iλα}$.')])]),
    h('p', {}, mt('The sign $ε = ±1$ belongs to the lift into spin space. A rotation matrix fixes the operator $U(W)$ only up to a sign: a turn by $2π$ leaves every vector unchanged but multiplies a state of half-integer spin by $−1$, so the angles read from the matrix do not decide between $U$ and $−U$. The sign $ε$ settles it. It is $+1$ if the operator built from the steps of the two chains (their spinor representation) equals the product of the three exponentials above, and $−1$ if it differs from it by a sign. For integer spin it has no effect, since $ε^{2j} = 1$ then; for half-integer spin it is an overall sign of the state.'))]);

  const action = h('div', { class: 'next-part' }, [
    h('h3', { text: 'What this does to the state' }),
    h('p', {}, ['Applied to a state of the particle, the rotation gives the Wigner ', sym('D'), ' function. In the helicity basis of ', Is(), ', the state that has the helicity ', sym('ν'), ' in ', Ks(), ' reads']),
    F(`|ν⟩_{${up(K)}} = Σ_λ |λ⟩_{${up(I)}} D^{j}_{λν}(W),`, 'D^{j}_{λν}(W) = ε^{2j} e^{−iλα} d^{j}_{λν}(β) e^{−iνγ}.'),
    h('p', {}, mt('The two rotations about $z$ attach phases, the rotation about $y$ distributes the state over the helicities. If $β = 0$, the helicity axes coincide: every helicity keeps its value, and the two bases differ by a phase. If $β = π$, the helicity is reversed, up to a phase. Otherwise the helicities of the decay topology mix in the reference topology. The sign $ε$ is the sign of the spin lift explained above. The amplitude of the decay topology is converted with one such factor for every final-state particle.'))]);

  // ---------------------------------------------------------------- the selected particle
  const selected = h('div', { class: 'next-selected' });
  function buildSelected() {
    const e = run.entry, idx = e.index_markup;
    const nodes = [h('h3', {}, ['The selected particle ', h('span', { class: 'selection-inline' }, sym(prt(idx)))])];
    if (!e.available) nodes.push(h('p', { text: e.reason }));
    else {
      nodes.push(h('p', {}, ['Its helicity is measured in ', tagNode(e.source_markup), ' in topology ', Ks(), ' and in ', tagNode(e.target_markup), ' in the reference topology ', Is(),
        '. The rest frames of the particle that are reached from there are ', tagNode(e.source_terminal_markup), ' and ', tagNode(e.target_terminal_markup), '.']));
      if (e.identity) nodes.push(h('p', {}, ['The rest frames of the particle in the two topologies coincide: ', sym(`W_{${idx}}^{${trans}}`), ' is the identity, no rotation is needed, and the helicity labels of both topologies denote the same states.']));
      else {
        const used = opsOf(e).length;
        nodes.push(h('p', {}, ['In the short form, ', sym(`W_{${idx}}^{${trans}} = ${eulerChain(e).join(' ')}`), used === 3 ? ': all three rotations are needed.' : used === 1 ? ': only one rotation is needed.' : ': two of the three rotations are needed.', ' ',
          ...(Math.abs(e.angles.beta) < 1e-9 ? mt('The helicity axes of the two frames coincide, so the helicities are not mixed: the change of basis is a phase, produced by the rotations about $z$.')
          : Math.abs(e.angles.beta-Math.PI) < 1e-9 ? mt('The helicity axes of the two frames are opposite, so the helicity of the reference topology is the negative of the helicity of topology $'+up(K)+'$, up to a phase.')
          : mt('The helicity axes of the two frames differ, so the helicities of the two topologies mix according to the matrix $D$.'))]));
      }
    }
    selected.replaceChildren(...nodes);
  }

  // ---------------------------------------------------------------- the two topologies and their amplitudes, with the helicity labels in their own frames
  const sketchCard = (title, labelNode, topology) => h('figure', { class: 'sketch-card' }, [h('figcaption', {}, [title, ' ', labelNode]), buildSketch(topology, { width: 360 }).svg]);
  const sketches = payload.topologies ? h('div', { class: 'sketch-pair' }, [sketchCard('Reference topology', Is(), payload.topologies.reference), sketchCard('Decay topology', Ks(), payload.topologies.decay)]) : null;
  const rootFrame = T => `R_0^{${up(I)}}|${up(T)}`;                                      // the root frame carries the orientation of the reference topology
    const amplitude = reference => {                                                         // the amplitude of a topology with the frames in which its helicities are measured
    const T = reference ? I : K, letter = reference ? 'λ' : 'ν';
    const labels = entries.map(e => `${letter}_{${e.index_markup}}^{[${reference ? e.target_markup : e.source_markup}]}`).join('\u2009');
    return `ℳ^{(${up(T)})}^{λ_{0}^{[${rootFrame(T)}]}}_{${labels}}`;                       // no momenta here: the label of the chain, then the helicities
  };
  const e1 = entries[0];
  const amplitudes = h('div', { class: 'next-part' }, [
    h('p', {}, ['The same final state is described by one amplitude for every topology. The amplitude of the reference topology ', Is(), ' and the amplitude of the decay topology ', Ks(), ' of this event are']),
    h('div', { class: 'formula amplitude-formula' }, sym(amplitude(true))),
    h('div', { class: 'formula amplitude-formula' }, sym(amplitude(false))),
    h('p', {}, ['They describe the same final state, but their helicity labels refer to different frames. The helicity of the particle ', sym(prt(e1.index_markup)), ', for example, is ', sym(`λ_{${e1.index_markup}}`), ' in the first amplitude, measured in ', tagNode(e1.target_markup),
      ', and ', sym(`ν_{${e1.index_markup}}`), ' in the second, measured in ', tagNode(e1.source_markup), '. The two amplitudes can therefore not be summed as they stand. How such an amplitude is built is explained on the page ',
      h('button', { type: 'button', class: 'link-button', text: 'Amplitude construction', onclick: () => state.showPage('amplitude') }), '; this page builds the rotation ', sym('W'), ' that carries the helicities of the second amplitude into the helicity basis of the first.'])]);

  // ---------------------------------------------------------------- page
  function rebuild() { buildChooser(); buildBuild(); buildSelected(); }
  const lead = h('p', { class: 'lead' }, ['The dynamic view follows the decay chain of the topology ', Ks(), ' frame by frame. Every frame after the laboratory frame is the rest frame of a decaying particle, and in it the helicities of the particles produced by this decay are measured. ',
    'In the reference topology ', Is(), ' the final-state particles are produced by other decays, so their helicities are measured in other frames, and the helicity states defined there differ by a rotation. ',
    'This page lists the steps by which the frames of both topologies are reached and builds from them the rotation ', sym('W'), ' that carries a spin state of topology ', Ks(), ' into the helicity basis of the reference topology ', Is(), '.']);
  const root = h('div', { class: 'page-body next-box next-single' }, [
    h('h2', {}, ['Next step: helicities in the reference topology ', h('span', { class: 'sym' }, I)]),
    lead, sketches, amplitudes, part1, build, shorter, action, selected]);
  rebuild();
  const view = { stop() {} };
  return { root, view, render() {} };
}
