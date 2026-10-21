// Page "Amplitude construction": from the experiment to the decay, the process as a diagram, the filling of the blobs (the T matrix), the amplitude of a single decay and the
// amplitude of a decay chain. The text is written in English; the formulas come from the chain of the event (the final states and the names of the chain) where they depend on it.
// The sections that are prerequisites, and the derivations, are foldouts. The Euler rotations stand at the beginning of the section on the single decay.
import { h, sym, mtex, named, itl, tagNode, texNode, state, up } from '../../app/common.js';
import { buildEulerPage } from '../euler/euler.js';
import { buildSketch } from '../../render/sketch.js';
import { buildProcessDiagram, buildDecayBlob, buildPotentialDiagram } from '../../render/blobs.js';
import { buildVertexFigure } from '../../render/vertex_figure.js';
import { buildDalitzPlot } from '../../render/dalitz.js';
import { buildNormalisation, buildDerivation, buildSpectatorPhase } from './derivation.js';
import { buildChain } from './chain.js';
import { EXPERIMENT_FIGURE } from '../../render/experiments_figure.js';
import { toTex } from '../../render/tex.js';

const raw = String.raw;
const URL = {
  lhc: 'https://home.cern/science/accelerators/large-hadron-collider', alice: 'https://alice-collaboration.web.cern.ch', atlas: 'https://atlas.cern', cms: 'https://cms.cern',
  lhcb: 'https://lhcb-outreach.web.cern.ch', bes: 'https://english.ihep.cas.cn/bes/', kek: 'https://www.kek.jp/en/', belle: 'https://www.belle2.org',
  compass: 'https://wwwcompass.cern.ch', amber: 'https://amber.web.cern.ch', gluex: 'https://www.jlab.org/Hall-D/', hades: 'https://hades.gsi.de'
};
const DOI = id => 'https://doi.org/' + id, ARXIV = id => 'https://arxiv.org/abs/' + id;

export function buildAmplitudePage(payload) {
  const heading3 = text => h('h3', { text });
  const P = (...nodes) => h('p', {}, nodes.flat());
  const D = tex => h('div', { class: 'formula' }, [texNode(tex, { display: true })]);               // a displayed formula, centred
  const link = (page, text) => h('button', { type: 'button', class: 'link-button', text, onclick: () => state.showPage(page) });
  const ext = (href, text) => h('a', { href, target: '_blank', rel: 'noopener noreferrer', text });     // a link to a page outside of this one
  const small = (...nodes) => h('p', { class: 'small' }, nodes.flat());
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
  const single = i => `\\lvert ${T(`~p_{${i}}`)};${T(`λ_{${i}}`)}\\rangle${LAB}`;
  const product = (idx.length <= 4 ? idx.map(single) : [single(idx[0]), '\\cdots', single(idx[idx.length-1])]).join(' \\otimes ');
  const lab = '[lab]';                                                                              // the head of the amplitude with all frames set to the laboratory frame
  const headLab = T(`ℳ^{(${up(K)})}^{λ_{0}^{${lab}}}_{${leaves.map(l => `λ_{${l.index}}^{${lab}}`).join(' ')}}(~p_{0}; ${leaves.map(l => `~p_{${l.index}}`).join(', ')})`);
  const projection = raw`\begin{aligned}&${braFinal}\,T^{\text{${K}}}\,${ketMother}\\ &=(2\pi)^3\,\delta^3(\vec P-\vec p_0)\,${headLab}\,.\end{aligned}`;

  const firstOrFurther = K === I
    ? mtex(`An amplitude analysis builds its model from the amplitudes of several decay chains, each with its own intermediate states, and adds them coherently. The chain of this event, $\\text{${K}}$, is the first one in the model. It defines the reference topology $\\text{${I}}$ and with it the axes of the root frame (Greenwich convention), in which all further chains are expressed.`)
    : [...mtex(`An amplitude analysis builds its model from the amplitudes of several decay chains, each with its own intermediate states, and adds them coherently. The model of this event already contains the chain $\\text{${I}}$, which defines the reference topology and with it the axes of the root frame (Greenwich convention). The chain $\\text{${K}}$ is added to it, so its helicities have to be expressed in the helicity basis of the reference topology; this is shown on the page `), ...(payload.alignment ? [link('next', 'Next step'), '.'] : ['.'])];

  /** A foldout for what the following sections presuppose, or for a derivation. */
  const foldout = (id, title, content, kind = 'Prerequisite') => h('details', { class: 'euler-details', id }, [h('summary', {}, [h('span', { class: 'prerequisite-label', text: `${kind}: ${title}` }), h('span', { class: 'prerequisite-hint', text: ' (click to show)' })]), h('div', { class: 'foldout-body' }, content)]);
  /** A section that is a prerequisite: a foldout with the heading of the section as its title, open at first. */
  const sectionFold = (title, content) => h('details', { class: 'section-fold', open: true }, [h('summary', {}, [h('span', { class: 'section-title', text: title }), h('span', { class: 'prerequisite-hint', text: ' (a prerequisite; click to hide)' })]), h('div', { class: 'section-body' }, content)]);
  const openFoldout = id => () => { const e = document.getElementById(id); if (e) { e.open = true; requestAnimationFrame(() => e.scrollIntoView?.({ block: 'start' })); } };

  if (topology && amp) {
    // ================================================================ From Experiment to Decay
    const experiment = [
      P('Every decay that is analysed is preceded by the collision of two particles in an accelerator. In an accelerator, charged particles are brought to high velocities, that is, to high energies, in bunches of several million particles (the particle beam), and are made to collide with a target or with a second beam in the region of a detector. Two layouts are distinguished: in a ',
        h('i', { text: 'collider' }), ' experiment two bunches are accelerated in opposite directions and collide head-on, while in a ', h('i', { text: 'fixed-target' }), ' experiment a bunch is fired at a target at rest. Examples of colliders are the ',
        ext(URL.lhc, 'LHC'), ' at CERN with the experiments ', ext(URL.alice, 'ALICE'), ', ', ext(URL.atlas, 'ATLAS'), ', ', ext(URL.cms, 'CMS'), ' and ', ext(URL.lhcb, 'LHCb'), ' (protons or lead nuclei), BEPCII at IHEP with the experiment ',
        ext(URL.bes, 'BESIII'), ' (electrons and positrons) and SuperKEKB at ', ext(URL.kek, 'KEK'), ' with ', ext(URL.belle, 'Belle II'), ' (electrons and positrons). Examples of large fixed-target experiments are ', ext(URL.compass, 'COMPASS'),
        ' on a beamline of the SPS at CERN (pion beam on a liquid-hydrogen target; its programme is continued by ', ext(URL.amber, 'AMBER'), '), ', ext(URL.gluex, 'GlueX'), ' at Jefferson Lab (photon beam on a liquid-hydrogen target) and ', ext(URL.hades, 'HADES'),
        ' at GSI (proton, pion and heavy-ion beams on targets from hydrogen to gold).'),
      figure(svgNode(EXPERIMENT_FIGURE), [...mtex(`Two collisions that produce particles. (a) Collider, as at LHCb: a proton–proton collision produces a $\\Lambda_b^{0}$ baryon and further particles; the $\\Lambda_b^{0}$ was observed in the decay $\\Lambda_b^{0}\\to J/\\psi\\,K^{-}p$ `),
        h('span', {}, ['(', ext(DOI('10.1103/PhysRevLett.115.072001'), 'LHCb, PRL 115, 072001'), '). The sketch is schematic. (b) Fixed target, as at HADES: a proton beam on a proton at rest produces a proton and a ', ...mtex(`$\\Delta^{+}$`), ' baryon (', ext(DOI('10.1103/PhysRevC.95.065205'), 'HADES, PRC 95, 065205'), '). The momenta in (b) follow two-body kinematics.'])]),
      P('Conceptually the layout makes no difference: in both cases the particles of the initial state are given as much energy as possible, so that heavy, short-lived particles can be produced in an inelastic collision. Because of their short lifetime they cover only a short distance from their place of production, the production vertex, before they decay into further particles. Resonances that decay by the strong interaction live so briefly that their decay point cannot be told from the production point; heavy hadrons such as the ',
        ...mtex(`$\\Lambda_b^{0}$, the $B$ and the $D$ mesons`), ' decay weakly and fly a distance of the order of a millimetre or more, so that their decay vertex can be separated from the production vertex. Which particles were produced cannot be measured directly in the detector; it follows from the subsequent analysis. The direct decay products too are mostly too short-lived to reach the detector, so that one can speak of “stable” and “unstable” particles on the scale of the detector: only the “stable” particles, which decay outside of the detector, fly through the individual detectors. Typically these are pions, kaons, protons, electrons and muons, and photons. Long-lived neutral particles can only be measured partly by most detectors.'),
      P('Such a collision is described by quantum-mechanical scattering theory. The detector first sees the reaction'),
      D(raw`\prt{A}+\prt{B}\to\prt{1}+\dots+\prt{n}+\mathrm{X}\;(+\,\prt{A}+\prt{B})`),
      P(...mtex(`$\\prt{A}$ and $\\prt{B}$ stand for the particles of the beam and of the target (or of the second beam) that interact in the region of the detector. Parts of the beam, and at colliders also of the target or of the opposite beam, do not interact or interact only elastically, that is, without producing new particles. They can be measured by the detectors as well and therefore appear in the final state too. Furthermore the final states of the decay under study, $\\prt{0}\\to\\prt{1}+\\dots+\\prt{n}$, are observed together with further particles that are of no interest here; these are summarised in a state $\\mathrm{X}$ and flow into the background. The process thus splits into a part in which the particles do not interact at all and a part in which they do, elastically or with the production of new particles:`)),
      D(raw`S=\underbrace{\one}_{\text{no interaction}}-\underbrace{i\,2\pi\,\delta(E_f-E_i)\,T}_{\text{interaction}}`),
      P(...mtex(`This is the $S$ matrix, or scattering matrix, and it describes the whole scattering process. The second matrix, $T$, is called the transition matrix; it stands for the actual reaction of the particles. It conserves the energy explicitly through the $\\delta$ function $2\\pi\\,\\delta(E_f-E_i)$.`)),
      foldout('s-matrix-details', 'From the S matrix to the matrix element', [
        P(...mtex(`The $S$ matrix is unitary; it maps the states of the free particles before the collision onto the states after it. The interaction does not depend on the time at which it acts, so the energy is conserved, and $\\langle f\\vert S-\\one\\vert i\\rangle$ contains the factor $\\delta(E_f-E_i)$. The rest is, by definition, the matrix element of $T$:`)),
        D(raw`\langle f\vert\,S\,\vert i\rangle=\langle f\vert i\rangle-i\,2\pi\,\delta(E_f-E_i)\,\langle f\vert\,T\,\vert i\rangle\,.`),
        P(...mtex(`The interaction does not depend on the place at which it acts either, so $T$ conserves the total momentum $\\vec P=\\sum_i\\vec p_i$, and its matrix element factorises into a $\\delta$ function and the matrix element $\\mathcal M_{fi}$ (the factor $(2\\pi)^3$ is a convention):`)),
        D(raw`\langle f\vert\,T\,\vert i\rangle=(2\pi)^3\,\delta^3(\vec P_f-\vec P_i)\,\mathcal M_{fi}\,.`),
        P(...mtex(`The factor in front and the energy $\\delta$ function of $S$ together are the conservation of the four-momentum:`)),
        D(raw`\langle f\vert\,S-\one\,\vert i\rangle=-i\,(2\pi)^4\,\delta^4(P_f^\mu-P_i^\mu)\,\mathcal M_{fi}\,.`),
        small(...mtex(`The sign is conventional and follows from the definition of $S$ above, as in scattering theory; texts on field theory write $+i$ and thereby give $\\mathcal M$ the opposite sign.`)),
        P(...mtex(`The factors in front of $\\mathcal M$ are usually not written. The amplitude row of the `), link('dynamic', 'dynamic view'), ...mtex(` therefore gives $\\mathcal M$ only up to them, $\\mathcal M\\propto\\dots$.`)),
        small('Literature: S. Weinberg, The Quantum Theory of Fields, Vol. 1 (Cambridge University Press, 1995), Chap. 3; J. R. Taylor, Scattering Theory (Wiley, 1972).')], 'Derivation'),
      P('In the detectors the tracks, momenta and types of the final-state particles of a decay can be resolved. The type of a particle is determined from its energy loss, its time of flight, the Cherenkov light it emits, or its signal in a calorimeter or muon detector; its momentum is determined from the curvature of its track in the magnetic field of the detector. In an involved analysis a “large picture” of the scattering process is then made from the many individually measured tracks, and single tracks are combined, whereby production and decay vertices can be found. From the four-momenta of the final states of a decay vertex, which are then known, the invariant mass and the momentum of the decaying mother can be determined. The distribution of the invariant masses determined in this way has accumulations at the masses of the mother and of the dominant resonances of this decay. The resonances are an essential ingredient for building a model of a decay, and their mass, width, spin and parity can be read from the fitted models. Particles that could not be assigned to a vertex form the rest of the measured background. How such a model comes about is the subject of the following sections.'),
      figure(svgNode(buildVertexFigure(leaves.length)), [...mtex(`Sketch of a measured event. The mother $\\prt{0}$ is produced at the primary vertex and decays after a short flight at the secondary vertex into the final states $\\prt{1},\\dots$ Charged particles are bent in the magnetic field of the detector (full lines), neutral particles fly straight and leave no track in the tracking detector (dashed lines); the mother is not measured directly. The style follows Fig. 1 of `),
        ext(DOI('10.1140/epjc/s10052-021-09342-y'), 'J. Shlomi et al., Eur. Phys. J. C 81, 540 (2021)'), '.']),
      foldout('dalitz-details', 'How the mother and the resonances are found', [
        P(...mtex(`For the final states that belong to one decay, $m^2=(\\sum_i p_i)^2$ is the invariant mass squared. A peak in its distribution marks the mother; the same quantity for a subset of the final states marks a resonance that decays into this subset.`)),
        h('h4', { text: 'Three particles: the Dalitz plot' }),
        P(...mtex(`The decay of a spin-0 mother into three spin-0 particles has two independent kinematic variables. A decay into $n$ particles has $3n-4$ kinematic variables; three of them are the orientation of the decay in space, so $3n-7$ remain, which is 2 for $n=3$. A convenient choice is the pair of invariant masses $m_{12}^2$ and $m_{23}^2$. Every decay is one point in this plane, and the plot of many decays is the Dalitz plot (Dalitz 1953). The phase-space element is constant in these variables, so without any dynamics the allowed region would be filled uniformly. Structure therefore shows the amplitude: a resonance in the system of the particles $1$ and $2$ is a band at constant $m_{12}^2$, its width is the width of the resonance, and its spin shows in the distribution along the band. Where bands cross, they interfere.`)),
        figure(svgNode(buildDalitzPlot()), mtex(`Schematic Dalitz plot of a decay into three particles. The allowed region is bounded by energy and momentum conservation; a resonance in the pair $12$, $23$ or $13$ gives a vertical, a horizontal or a diagonal band.`), true),
        h('h4', { text: 'More than three particles' }),
        P('For four and more particles the invariant masses of pairs and triples no longer describe all kinematic degrees of freedom; parity-odd variables, for example the angle between two decay planes, are needed. The Dalitz plot does not generalise to a two-dimensional plot, and resonances are found in three steps: (i) projections on the invariant masses of all subsets of the final states, (ii) the angular distributions, in particular of the helicity angles of every decay of the chain, and (iii) a multidimensional fit of an amplitude to all variables at the same time. The amplitude is a coherent sum of decay chains, each of which is built from decays into two particles. This is the amplitude whose construction is the subject of the following sections.'),
        small('Literature: ', ext(DOI('10.1080/14786441008520365'), 'R. H. Dalitz, Phil. Mag. 44, 1068 (1953)'), '; ', ext(DOI('10.1103/PhysRevD.110.030001'), 'Particle Data Group, Review of Particle Physics'), ', sections “Kinematics” (Dalitz plot, multibody phase space) and “Multibody charm analyses”; ',
          ext(DOI('10.1103/PhysRevD.101.034033'), 'M. Mikhasenko et al., Phys. Rev. D 101, 034033 (2020)'), '; ', ext(DOI('10.1103/PhysRevD.111.056015'), 'J. Habermann and M. Mikhasenko, Phys. Rev. D 111, 056015 (2025)'),
          '. Examples with four and more particles: LHCb, ', ext(DOI('10.1103/PhysRevLett.112.222002'), 'PRL 112, 222002 (2014)'), ' (', ...mtex(`$Z(4430)^{-}$`), '), ', ext(DOI('10.1103/PhysRevLett.115.072001'), 'PRL 115, 072001 (2015)'), ' (pentaquarks), ',
          ext(DOI('10.1103/PhysRevLett.118.022003'), 'PRL 118, 022003 (2017)'), ' (', ...mtex(`$J/\\psi\\,\\phi$`), '); BESIII, ', ext(ARXIV('2312.02524'), 'arXiv:2312.02524'), '.')], 'Explanation')
    ];
    blocks.push(sectionFold('From Experiment to Decay', experiment));

    // ================================================================ Diagrammatic Expression
    blocks.push(heading3('Diagrammatic Expression'),
      P(...mtex(`In the picture language of theoretical physics, or quantum field theory, such a process is represented by a Feynman diagram or Feynman sketch. An incoming line with momentum and spin is assigned to each of the two initial particles $\\prt{A}$ and $\\prt{B}$. They interact in a process that is not specified further, which is called a “blob” in the diagram, and produce a shower of new particles that leave the region of the interaction.`)),
      figure(svgNode(buildProcessDiagram(leaves.length)), mtex(`Simplified diagram of the whole process. The hatched areas stand for what is not specified: the interaction of $\\prt{A}$ and $\\prt{B}$, and the decay of the mother. The particle $\\mathrm{X}$ stands for everything else that is produced.`)),
      P(...mtex(`The second blob is the one that is interesting for what follows. One of the produced particles is the mother $\\prt{0}$, which, first, can be regarded as sufficiently stable (above all, it is not a virtual particle) and whose decay products, second, can be separated from the rest of the background measured in the detector. It can therefore be considered separately from the actual scattering process. The decay of this particle into its $n$ products is also not specified further for now.`)),
      figure(svgNode(buildDecayBlob(leaves.length)), mtex(`The decay of the mother into the final states.`), true),
      P(...mtex(`Quantum-mechanical states can be assigned to the particles of the initial and final state. The mother has a momentum $\\vec p_0\\frame{\\text{lab}}$, measured in the detector or laboratory frame, and a helicity $\\lambda_0\\frame{\\text{lab}}$, measured with respect to this direction; it has a mass $m_0$ and a spin $j_0$. Mass and spin are fixed properties of the particle and are left out of the state in the following. The compact form of the state in the laboratory frame is`)),
      D(ketMother),
      P(...mtex(`where the label $[\\text{lab}]$ refers to both quantities. How frame labels $[v|K]$ are read is explained on the page `), link('notation', 'Notation'), '.'),
      P(...mtex(`The final state consists of all $n$ particles that were measured by the detector and assigned to the mother $\\prt{0}$:`)),
      D(raw`${ketFinal}=${product}`),
      P(...mtex(`Here too masses and spins are left out to save space in the notation. The state is thus the product of the states of $n$ single particles.`)));

    // ================================================================ Filling the Blobs
    const lippmann = foldout('lippmann-details', 'Derivation of the Lippmann–Schwinger equation', [
      P(...mtex(`Let $H=H_0+V$ be the Hamiltonian, with the free part $H_0$, whose eigenstates $\\lvert\\phi\\rangle$ are the states of the free particles, $H_0\\lvert\\phi\\rangle=E\\lvert\\phi\\rangle$. A scattering state $\\lvert\\psi\\rangle$ of the same energy obeys the Schrödinger equation $(E-H_0)\\lvert\\psi\\rangle=V\\lvert\\psi\\rangle$. Its formal solution, which contains the free state and an outgoing wave, is`)),
      D(raw`\lvert\psi\rangle=\lvert\phi\rangle+G_0\,V\,\lvert\psi\rangle\,,\qquad G_0=\frac{1}{E-H_0+i0}\,.`),
      P(...mtex(`The infinitesimal $+i0$ makes the inverse defined and selects the outgoing wave; $G_0$ is the propagator of the free particles. The $T$ matrix is defined by the action of the interaction on the scattering state, $T\\lvert\\phi\\rangle=V\\lvert\\psi\\rangle$. Multiplying the equation above with $V$ gives $V\\lvert\\psi\\rangle=V\\lvert\\phi\\rangle+V\\,G_0\\,V\\lvert\\psi\\rangle$, that is,`)),
      D(raw`T=V+V\,G_0\,T\,.`),
      P(...mtex(`Repeated insertion gives the series $T=V+VG_0V+VG_0VG_0V+\\dots$, which can be summed from either side, so the equation holds with the factors in the opposite order as well, $T=V+T\\,G_0\\,V$. With the matrix element of $T$ at the energy of the initial state the $S$ matrix is`)),
      D(raw`S_{fi}=\delta_{fi}-2\pi i\,\delta(E_f-E_i)\,\langle f\vert\,T\,\vert i\rangle\,,`),
      P(...mtex(`which is the form used above. With the full propagator $G=(E-H+i0)^{-1}$, which obeys $G=G_0+G_0\\,V\\,G$ (since $E-H=(E-H_0)-V$), the scattering state is $\\lvert\\psi\\rangle=(1+G\\,V)\\lvert\\phi\\rangle$, and the same definition of $T$ gives`)),
      D(raw`T=V+V\,G\,V\,.`),
      small('Literature: J. R. Taylor, Scattering Theory (Wiley, 1972); S. Weinberg, The Quantum Theory of Fields, Vol. 1 (Cambridge University Press, 1995), Chap. 3.')], 'Derivation');
    const potential = raw`\begin{aligned}V={}&\underbrace{V_{\vtc{(123)}}}_{\text{direct decay}}\\
      &+\underbrace{\sum_\alpha V^{\alpha}_{\vtc{((12)3)}}+\sum_\alpha V^{\alpha}_{\vtc{(12)}}\otimes\one_{\prt{3}}}_{\text{decay into resonances of $\prt{1}$ and $\prt{2}$}}\\
      &+\underbrace{\sum_\beta V^{\beta}_{\vtc{((13)2)}}+\sum_\beta V^{\beta}_{\vtc{(13)}}\otimes\one_{\prt{2}}}_{\text{decay into resonances of $\prt{1}$ and $\prt{3}$}}\\
      &+\underbrace{\sum_\gamma V^{\gamma}_{\vtc{((23)1)}}+\sum_\gamma V^{\gamma}_{\vtc{(23)}}\otimes\one_{\prt{1}}}_{\text{decay into resonances of $\prt{2}$ and $\prt{3}$}}\\
      &+\text{interactions that involve exchange particles}\end{aligned}`;
    const simplest = raw`\begin{aligned}T_{123}={}&\underbrace{V^{\text{contact}}_{\vtc{(123)}}}_{\text{the simplest possible decay into 3 particles}}\\
      &+\sum_\alpha\underbrace{\Big(V^{\alpha,\text{contact}}_{\vtc{(12)}}\otimes\one_{\prt{3}}\Big)\Big(G^{\alpha}_{\itl{(12)}}\otimes\one_{\prt{3}}\Big)V^{\alpha,\text{contact}}_{\vtc{((12)3)}}}_{\text{the simplest possible decays via a resonance of $\prt{1}$ and $\prt{2}$}}\\
      &+\sum_\beta\big(\dots\big)_{(13)2}+\sum_\gamma\big(\dots\big)_{(23)1}\\
      &+\text{more complicated decays including rescattering}\end{aligned}`;
    const vRow = h('div', { class: 'v-row' }, [texNode(raw`V=`), svgNode(buildPotentialDiagram('direct')), texNode(raw`+\sum_\alpha`), svgNode(buildPotentialDiagram('production')),
                                                 texNode(raw`+\sum_\alpha`), svgNode(buildPotentialDiagram('decay')), texNode(raw`+\ \cdots`)]);
    blocks.push(heading3('Filling the Blobs'),
      P(...mtex(`The blobs, or rather the actual interaction of the particles, are described by the $T$ matrix. In scattering theory it is determined by the Lippmann–Schwinger equation, which can be derived from the Schrödinger equation:`)),
      D(raw`T=V+V\,G_0\,T\qquad\text{or}\qquad T=V+T\,G_0\,V`),
      P(...mtex(`Here $V$ is the interaction (the “potential”) and $G_0=(E-H_0+i0)^{-1}$ is the propagator of the free particles (free Green's function, free resolvent).`)),
      lippmann,
      P(...mtex(`The potential $V$ is the sum of all possible interactions that can occur in the process. For the decay blob it contains, on the one hand, the possibility of a direct decay $\\prt{0}\\to\\prt{1}+\\dots+\\prt{n}$, and on the other hand decays with resonant intermediate states, for example $\\prt{0}\\to\\itl{(12)}+\\dots+\\prt{n}$ with $\\itl{(12)}\\to\\prt{1}+\\prt{2}$. $V$ is thus the sum over all these parts; for a decay into three particles one can write in simplified form`)),
      D(potential),
      P(...mtex(`The sums run over all resonances that are possible at the energy. In the potential these decays enter in two parts: once as the decay into the resonance and a particle that takes no part, and once as the decay of the resonance into the final state, where the particle that takes no part experiences no further interaction. In diagrams this corresponds to`)),
      vRow,
      P(...mtex(`The potentials are effective interactions between hadrons. In quantum field theory (QCD) they would arise from the interactions of the constituents of these particles, the quarks and gluons, including the exchange of further particles. This is left out here on purpose: as in chiral effective field theory, the interactions are written directly as potentials between hadrons, which stand representatively for everything that happens inside. The aim is to make the problem clear with simple images, not to go into the underlying dynamics.`)),
      P(...mtex(`The equation is iterative. Repeated insertion gives an infinite chain of interactions, connected by the propagators $G_0$, which act like glue:`)),
      D(raw`T=V+V\,G_0\,V+V\,G_0\,V\,G_0\,V+\dots`),
      P(...mtex(`The Lippmann–Schwinger equation thus covers the simplest interactions of the particles, the direct decays or contact interactions, where the blob can be replaced by a simple vertex, as well as much more complicated interactions such as rescattering of the final states.`)),
      P(...mtex(`Instead of the iterative equation, $T$ can also be written by rewriting the free propagator $G_0$ into the full propagator $G$:`)),
      D(raw`T=V+V\,G\,V`),
      P(...mtex(`The iterative nature of this equation does not disappear, but with the propagator $G$ the resonances appear, which also showed up in the spectrum of the invariant masses. $G$ obeys`)),
      D(raw`G=G_0+G_0\,V\,G=G_0+G_0\,V\,G_0+\dots`),
      P(...mtex(`In the simplest approximation the $T$ matrix is thus`)),
      D(simplest),
      P(...mtex(`In many cases these decay chains are the dominant contributions to the decay amplitude. To model an amplitude one therefore often uses only the non-resonant contribution and the so-called cascade decays (the isobar model); rescattering of the final states is left out or treated separately.`)),
      P(...mtex(`In a cascade decay a mother particle decays into two daughters, which can decay further themselves or are “stable”.`), h('sup', { text: '1' }), ...mtex(` Only one- and two-particle states are therefore relevant in the mathematical description:`)),
      D(raw`\lvert\vec p_m;\lambda_m\rangle\frame{\text{lab}}\qquad\lvert\vec p_a,\vec p_b;\lambda_a\lambda_b\rangle\frame{\text{lab}}`),
      small(h('sup', { text: '1' }), ' Of course decays into more than two particles are possible in a cascade decay as well, but this description is the simplest one mathematically.'),
      buildNormalisation(foldout),
      small('Literature: ', ext(DOI('10.1103/PhysRevD.101.034033'), 'M. Mikhasenko et al., Phys. Rev. D 101, 034033 (2020)'), '; ', ext(DOI('10.1007/JHEP08(2019)080'), 'M. Mikhasenko et al., JHEP 08, 080 (2019)'), '; ', ext(DOI('10.1103/PhysRevD.84.114019'), 'H. Kamano, S. X. Nakamura, T.-S. H. Lee and T. Sato, Phys. Rev. D 84, 114019 (2011)'),
        '; ', ext(DOI('10.1140/epja/i2017-12368-4'), 'M. Mai, B. Hu, M. Döring, A. Pilloni and A. Szczepaniak, Eur. Phys. J. A 53, 177 (2017)'), '; ', ext(DOI('10.1103/RevModPhys.81.1773'), 'E. Epelbaum, H.-W. Hammer and U.-G. Meißner, Rev. Mod. Phys. 81, 1773 (2009)'), ' (chiral effective field theory).'));
  }

  // ================================================================ A single Decay Vertex: the Euler rotations, the circles around the vertices, the derivation for the selected decay, the phase of the spectator
  const euler = buildEulerPage({ next: !!payload.alignment });
  const prerequisite = h('details', { class: 'euler-details', id: 'euler-details' }, [h('summary', {}, [h('span', { class: 'prerequisite-label', text: 'Prerequisite: Euler rotations' }), h('span', { class: 'prerequisite-hint', text: ' (click to show)' })]), euler.root]);
  prerequisite.addEventListener('toggle', () => { if (prerequisite.open) requestAnimationFrame(() => euler.render()); else euler.view.stop(); });

  if (topology && vertices.length) {
    const byNode = new Map(vertices.map(v => [v.node, v]));
    const readout = h('div', { class: 'selection-box amp-readout' });
    const label = side => named(side.leaf ? side.name : side.display, !side.leaf);
    const show = entry => {                                                       // the selected decay m → a + b and the frame in which m is at rest
      const v = byNode.get(entry.name);
      if (!v) return;
      const m = v.root ? named('0', false) : itl(v.display);
      readout.style.borderColor = diagram.circleColor(entry.name);
      readout.replaceChildren(h('div', { class: 'amp-readout-title' }, ['Selected decay']), sym(`${m} → ${label(v.B)} + ${label(v.C)}`, true),
                              h('div', { class: 'amp-readout-frame' }, ['rest frame of ', sym(m), ': ', tagNode(v.frame_markup)]));
    };
    const derivation = buildDerivation(payload, { link, openEuler: () => state.showEuler(), openNormalisation: openFoldout('normalisation-details') });
    const select = entry => { show(entry); const v = byNode.get(entry.name); if (v) derivation.show(v); };
    const diagram = buildSketch(topology, { width: 540, labelPx: 13, circles: { onSelect: select } });
    diagram.select(diagram.layout.root.name);
    blocks.push(heading3('A single Decay Vertex'),
      P(...mtex(`A decay chain consists of single decays of one particle into two. The amplitude of a single decay $m\\to a+b$ is derived here in general, and every decay of the chain is described in this way. For the chain of this event the diagram below marks each decay by a circle, in a red that gets darker with the depth in the chain, and the derivation is applied to the selected decay: the frames of the states, the Lorentz transformation between them and the names of the particles come from the selected vertex. A click on a circle selects the decay. The derivation ends with the phase of the spectator. The Euler rotations are a prerequisite of this section.`)),
      prerequisite,
      h('div', { class: 'amp-figure' }, diagram.svg), readout, derivation.root, ...buildSpectatorPhase());
  }

  // ================================================================ From a single Decay to a Decay Chain
  if (topology && amp && vertices.length) {
    blocks.push(...buildChain(payload, { link, projection }), P(...firstOrFurther));
  }

  const root = h('div', { class: 'page-body amplitude-text' }, [h('h2', { text: 'Amplitude construction' }), ...blocks]);
  return { root, draw: () => { if (prerequisite.open) euler.render(); }, stop: () => euler.view.stop(), euler, openEuler: () => { prerequisite.open = true; return prerequisite; } };
}
