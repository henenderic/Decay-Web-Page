// Page "Amplitude construction": how the amplitude of a decay chain is formed from decays into two particles.
// The page begins with the experiment and the process, narrows it down to the decay of the mother, and shows the decay chain with a circle around every vertex; a click selects a decay.
// The matrix element and the Euler rotations are foldouts (prerequisites); the page "Greenwich convention" links to the Euler rotations.
import { h, sym, mtex, named, itl, tagNode, texNode, state, up } from '../../app/common.js';
import { buildEulerPage } from '../euler/euler.js';
import { buildSketch } from '../../render/sketch.js';
import { buildProcessDiagram, buildDecayBlob } from '../../render/blobs.js';
import { buildDerivation } from './derivation.js';
import { EXPERIMENT_FIGURE } from '../../render/experiments_figure.js';
import { toTex } from '../../render/tex.js';

export function buildAmplitudePage(payload) {
  const heading3 = text => h('h3', { text });
  const P = (...nodes) => h('p', {}, nodes.flat());
  const D = tex => h('div', { class: 'formula' }, [texNode(tex, { display: true })]);               // a displayed formula, centred
  const link = (page, text) => h('button', { type: 'button', class: 'link-button', text, onclick: () => state.showPage(page) });
  const figure = (content, caption, narrow = false) => h('figure', { class: 'amp-figure ' + (narrow ? 'medium' : 'wide') }, [content, h('figcaption', {}, caption)]);
  const svgNode = content => { const box = h('div', { class: 'amp-svg' }); if (typeof content === 'string') box.innerHTML = content; else box.append(content); return box; };
  const topology = payload.topologies?.decay, amp = payload.amplitude, vertices = amp?.vertices || [];
  const blocks = [];

  // ---------------------------------------------------------------- pieces of the formulas, from the final states and the name of the chain of this event
  const T = markup => toTex(markup, 0, true);
  const leaves = amp?.leaves || [], idx = leaves.map(l => l.index), K = amp?.topology_label || '', I = amp?.reference_label || '';
  const sequence = make => idx.length <= 4 ? idx.map(make).join(', ') : [make(idx[0]), '\\dots', make(idx[idx.length-1])].join(', ');
  const vecs = sequence(i => T(`~p_{${i}}`)), hels = sequence(i => T(`λ_{${i}}`));
  const LAB = '\\frame{\\text{lab}}';
  const ketMother = `\\lvert ${T('~p_{0}')};${T('λ_{0}')}\\rangle${LAB}`, ketFinal = `\\lvert ${vecs};\\,${hels}\\rangle${LAB}`;
  const braFinal = `${LAB}\\langle ${vecs};\\,${hels}\\rvert`;
  const lab = '[lab]';                                                                              // the same head of the amplitude as in the row of the dynamic view, with all frames set to the laboratory frame
  const head = T(`ℳ^{(${up(K)})}^{λ_{0}^{${lab}}}_{${leaves.map(l => `λ_{${l.index}}^{${lab}}`).join(' ')}}(~p_{0}; ${leaves.map(l => `~p_{${l.index}}`).join(', ')})`);

  const firstOrFurther = K === I
    ? mtex(`An amplitude analysis builds its model from the amplitudes of several decay chains, each with its own intermediate states, and adds them coherently. The chain of this event, $\\text{${K}}$, is the first one in the model. It defines the reference topology $\\text{${I}}$ and with it the axes of the root frame (Greenwich convention), in which all further chains are expressed.`)
    : [...mtex(`An amplitude analysis builds its model from the amplitudes of several decay chains, each with its own intermediate states, and adds them coherently. The model of this event already contains the chain $\\text{${I}}$, which defines the reference topology and with it the axes of the root frame (Greenwich convention). The chain $\\text{${K}}$ is added to it, so its helicities have to be expressed in the helicity basis of the reference topology; this is shown on the page `), ...(payload.alignment ? [link('next', 'Next step'), '.'] : ['.'])];

  /** A foldout for what the following sections presuppose. */
  const foldout = (id, title, content) => h('details', { class: 'euler-details', id }, [h('summary', {}, [h('span', { class: 'prerequisite-label', text: `Prerequisite: ${title}` }), h('span', { class: 'prerequisite-hint', text: ' (click to show)' })]), h('div', { class: 'foldout-body' }, content)]);

  if (topology && amp) {
    // ---------------------------------------------------------------- from the experiment to the decay
    blocks.push(heading3('From the experiment to the decay'),
      P(...mtex(`Every detection of particles is preceded by an accelerator, in which particles are brought to high velocities, that is, to high energies, and combined into a beam. In the region of the particle detector the beam particles meet other particles. Depending on the setup of the accelerator these are either the particles of a second beam that moves in the opposite direction (collider experiments, for example at the LHC, at BEPCII or at SuperKEKB) or the particles of a block of material at rest (fixed-target experiments, for example COMPASS at the CERN SPS with a pion beam on a hydrogen target, GlueX at Jefferson Lab with a photon beam, or HADES at GSI with proton and pion beams). Reactions of the kinds sketched below have been measured, for example $\\pi^{-}p\\to\\pi^{0}n$ with the Crystal Ball detector at the Brookhaven AGS and $pp\\to p\\Delta^{+}$ with HADES.`)),
      figure(svgNode(EXPERIMENT_FIGURE), mtex(`Two experiments that produce particles. (a) Collider experiment: two protons collide head-on and produce a proton and a $\\Delta^{+}$ baryon. (b) Fixed-target experiment: a $\\pi^{-}$ beam hits a proton at rest and produces a $\\pi^{0}$ and a neutron.`)),
      P(...mtex(`The collision produces other particles, many of them with a very short lifetime. Which particles are produced is not known at this point. Because of their short lifetime they decay close to the place where they were produced, long before they could reach a detector. A particle counts as stable on the scale of the detector if it decays beyond the detector. These are typically the charged pions, kaons, protons, electrons and muons, and the photons; they leave signals in the detector, from which they are identified and their momenta are measured. Neutral long-lived particles such as the neutron and the $K^{0}_{L}$ are only partly measured. Particles that decay after a short flight, such as the $K^{0}_{S}$, the $\\Lambda$, charm and bottom hadrons and the $\\tau$ lepton, are found from vertices that are displaced from the production point.`)),
      P(...mtex(`The momenta follow from the curvature of the tracks in a magnetic field, the type of a particle from its energy loss, its time of flight, the Cherenkov light it emits or its signal in the calorimeters and muon chambers. In an involved procedure the measured particles are then assigned to a mother particle. The sum of the four-momenta of particles from the same decay has the invariant mass of the mother, and a mother or a resonance shows up as a peak in the distribution of this invariant mass. The step-by-step structure of a decay, the intermediate resonances, their masses, widths, spins and parities, is read from the distributions of the momenta of all final states and determined by fitting models of the amplitude to them. Combinations of particles that do not belong together form a combinatorial background, which is taken into account in these fits.`)),

      // ---------------------------------------------------------------- from the process to a diagram
      heading3('From the process to a diagram'),
      P(...mtex(`In the picture language of theoretical physics, the Feynman diagrams, the process can be sketched in a simplified way. The two colliding particles, also the target at rest, are drawn as lines that run into a hatched area, the first blob. Two lines leave it: the upper one is the mother $\\prt{0}$, the lower one a particle that is of no interest here. The mother runs into a second blob, from which $n$ lines come out, one for each final state.`)),
      figure(svgNode(buildProcessDiagram(leaves.length)), mtex(`Simplified diagram of the process. The hatched areas stand for what is not known about the process.`)),
      P(...mtex(`Only the second part of this diagram, the decay of the mother into the final states, is relevant for what follows. It is shown enlarged below. Here the states of the particles in the laboratory frame come into play: the initial state is the mother $\\prt{0}$ with the momentum $\\vec p_0$ and the helicity $\\lambda_0$, and the final state consists of the final-state particles as free particles with the momenta $\\vec p_i$ and the helicities $\\lambda_i$.`)),
      figure(svgNode(buildDecayBlob(leaves.length)), mtex(`The decay of the mother into the final states.`), true),
      h('div', { class: 'state-row' }, [
        h('div', {}, [h('div', { class: 'amp-readout-title' }, 'Initial state'), D(ketMother)]),
        h('div', {}, [h('div', { class: 'amp-readout-title' }, 'Final state'), D(ketFinal)])]),
      P(...mtex(`The label $[\\text{lab}]$ marks the frame in which the momenta and helicities are measured, here the laboratory frame in which the event is given. How frame labels $[v|K]$ are read is explained on the page `), link('notation', 'Notation'), '.'),

      // ---------------------------------------------------------------- what is inside the blob
      heading3('What is inside the blob'),
      P(...mtex(`The blob stands for what is not known about the decay. Quantum field theory says that it has to be filled with all allowed diagrams, in principle infinitely many. The simplest of them is a contact interaction, a direct decay of the mother into the $n$ final states. More complicated decays proceed in steps: the mother decays into two particles, and one or both of them decay further into two particles again (cascade decays). The intermediate states are resonances. The description of such cascades is the subject of this page.`)),
      P(...mtex(`In the isobar model, the usual description of such cascades, a single decay of the chain is not filled with a further blob. It is described by an effective vertex, in the formulas a coupling in the helicity or $LS$ scheme, possibly multiplied by a factor that depends on the momentum of the decay products. The interaction of the decay products of an intermediate state with each other, which gives the resonance its width and shape, is contained in the lineshape of this intermediate state. Only the product of vertex and lineshape can be determined from data, so the division between them is a convention. What the model leaves out is the interaction between decay products of different steps (rescattering); such terms would add further diagrams to the blob and are treated in three-body unitarity and in Khuri–Treiman approaches.`)),
      h('p', { class: 'small' }, `Literature: M. Mikhasenko et al., Phys. Rev. D 101, 034033 (2020); H. Kamano, S. X. Nakamura, T.-S. H. Lee and T. Sato, Phys. Rev. D 84, 114019 (2011); M. Mai, B. Hu, M. Döring, A. Pilloni and A. Szczepaniak, Eur. Phys. J. A 53, 177 (2017).`),
      h('div', { class: 'amp-figure' }, buildSketch(topology, { width: 540, labelPx: 13 }).svg),
      P(...mtex(`The diagram shows the decay chain of the topology $\\text{${K}}$ of this event. It is read from left to right: the mother $\\prt{0}$ enters from the left, and every filled dot is a vertex at which one particle decays into two, with the reference particle on the upper and the spectator on the lower line. A double line is an intermediate state that decays further.`)),

      // ---------------------------------------------------------------- the first resonance and further resonances
      heading3('The amplitude of a chosen resonance'),
      P(...firstOrFurther),

      // ---------------------------------------------------------------- the matrix element (prerequisite)
      foldout('matrix-element-details', 'The matrix element', [
        P(...mtex(`The process is described by the scattering matrix $S$. Its interacting part is written with the transition matrix $T$,`)),
        D(`S=\\one-i\\,2\\pi\\,\\delta(E_f-E_i)\\,T\\,,`),
        P(...mtex(`where $E_i$ and $E_f$ are the energies of the initial and the final state. The interaction is invariant under translations, so $T$ conserves the total momentum $\\vec P=\\sum_i\\vec p_i$, and its matrix element between the states above factorises:`)),
        D(`\\begin{aligned}&${braFinal}\\,T\\,${ketMother}\\\\ &=(2\\pi)^3\\,\\delta^3(\\vec P-\\vec p_0)\\,${head}\\,.\\end{aligned}`),
        P(...mtex(`The factor in front and the energy $\\delta$ function of $S$ together are the conservation of the four-momentum, so that the matrix element $\\mathcal M$ of the decay is defined by`)),
        D(`\\begin{aligned}&${braFinal}\\,(S-\\one)\\,${ketMother}\\\\ &=-i\\,(2\\pi)^4\\,\\delta^4(P^\\mu-p_0^\\mu)\\,${head}\\,.\\end{aligned}`),
        h('p', { class: 'small' }, mtex(`The sign is conventional and follows from the definition of $S$ above, as in scattering theory; texts on field theory write $+i$ and thereby give $\\mathcal M$ the opposite sign.`)),
        P(...mtex(`The factors in front of $\\mathcal M$ are usually not written. The amplitude row of the `), link('dynamic', 'dynamic view'), ...mtex(` therefore gives $\\mathcal M$ only up to them, $\\mathcal M\\propto\\dots$.`))]));
  }

  // ---------------------------------------------------------------- the single decays: circles around the vertices, a click selects a decay
  if (topology && vertices.length) {
    const byNode = new Map(vertices.map(v => [v.node, v]));
    const readout = h('div', { class: 'selection-box amp-readout' });
    const label = side => named(side.leaf ? side.name : side.display, !side.leaf);
    const show = entry => {                                                       // the selected decay x → a + b and the frame in which x is at rest
      const v = byNode.get(entry.name);
      if (!v) return;
      const x = v.root ? named('0', false) : itl(v.display);
      readout.style.borderColor = diagram.circleColor(entry.name);
      readout.replaceChildren(h('div', { class: 'amp-readout-title' }, ['Selected decay']), sym(`${x} → ${label(v.B)} + ${label(v.C)}`, true),
                              h('div', { class: 'amp-readout-frame' }, ['rest frame of ', sym(x), ': ', tagNode(v.frame_markup)]));
    };
    const derivation = buildDerivation(payload, { foldout, link, openEuler: () => state.showEuler() });
    const select = entry => { show(entry); const v = byNode.get(entry.name); if (v) derivation.show(v); };
    const diagram = buildSketch(topology, { width: 540, labelPx: 13, circles: { onSelect: select } });
    diagram.select(diagram.layout.root.name);
    blocks.push(heading3('The single decays'),
      P(...mtex(`The decay chain consists of single decays of one particle into two. In the diagram below each of them is marked by a circle, in a red that gets darker with the depth in the chain. Every one of these decays has a simple description, which is derived next for a decay $x\\to a+b$. A click on a circle selects the decay to which the description is applied.`)),
      h('div', { class: 'amp-figure' }, diagram.svg), readout, derivation.root);
  }

  // ---------------------------------------------------------------- the Euler rotations (figures are drawn when the section is opened)
  const euler = buildEulerPage({ next: !!payload.alignment });
  const prerequisite = h('details', { class: 'euler-details', id: 'euler-details' }, [h('summary', {}, [h('span', { class: 'prerequisite-label', text: 'Prerequisite: Euler rotations' }), h('span', { class: 'prerequisite-hint', text: ' (click to show)' })]), euler.root]);
  prerequisite.addEventListener('toggle', () => { if (prerequisite.open) requestAnimationFrame(() => euler.render()); else euler.view.stop(); });

  const root = h('div', { class: 'page-body amplitude-text' }, [h('h2', { text: 'Amplitude construction' }), ...blocks, prerequisite]);
  return { root, draw: () => { if (prerequisite.open) euler.render(); }, stop: () => euler.view.stop(), euler, openEuler: () => { prerequisite.open = true; return prerequisite; } };
}
