// FAQ page 1: What Does a Cascade Decay Amplitude Look Like?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "The amplitude of a specific decay $0_\\mathrm p\\to1_\\mathrm p+\\dots+n_\\mathrm p$ of a particle $0_\\mathrm p$ with mass $m_0$ and spin $j_0$ into $n$ different particles with their own masses and spins is a **coherent sum** over possible / observable **decay chains**, one for every topology and resonance combination, plus, where needed, a non-resonant term. A **cascade chain** is a product with one factor for every two-body decay, a factor of the two-body phase-space, an angular part $D$ and coupling $h$, and one propagator $G$ for every resonant intermediate state, summed over the helicities of all these intermediate states. To add the chains, the spin bases of the final-state particles must be aligned with each other on the basis of an ambiguous reference topology. This is the **Wigner rotation** $W$."
 },
 {
  "type": "p",
  "text": "For a concrete decay the amplitude follows by putting its topology, its spins and occurring frames into a general form. This page shows this general form for all orders $n$ of final states first and then the amplitude of the decay that is currently selected in the above Decay Description. How the single parts come about is explained in the other questions of this guide. All conventions are collected in card [[32]]. The picture of a decay chain that stands behind the formula is explained in card [[3]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Formula"
 },
 {
  "type": "p",
  "text": "The amplitude depends on the helicity $\\lambda_0$ of the mother particle (termed $0_\\mathrm p$ for generality in this guide), on the helicities $\\lambda_1,\\dots,\\lambda_n$ of the final-state particles $1_\\mathrm p,\\dots,n_\\mathrm p$ and on their momenta. We write it as the **matrix element** $\\mathcal M^{\\lambda_0}_{\\lambda_1\\dots\\lambda_n}$ of these helicities ([[15]]). It is a sum over the selected decay chains [[Ref 1]]: over the topologies $\\mathrm K$ ([[17]]) and, for each topology, over the combinations $\\alpha$ of resonances in its intermediate states. Each chain has its own amplitude $\\mathcal M^{(\\mathrm K,\\alpha)}$."
 },
 {
  "type": "p",
  "text": "In a chain, every vertex is a two-body decay in the cascade-decay isobar assumption: at the vertex $(v)$ a particle $A_{\\mathrm p/\\mathrm i}^{(v)}$ with the spin $j_{A^{(v)}}$ decays into the so-called **reference particle** $a_{\\mathrm p/\\mathrm i}^{(v)}$ and a second particle $b_{\\mathrm p/\\mathrm i}^{(v)}$ that is termed **spectator**. The label $\\mathrm p/\\mathrm i$ says that such a particle is either a final-state particle ($\\mathrm p$) or an **intermediate state** ($\\mathrm i$), while the superscript $(v)$ states the vertex this particle takes part in. Every intermediate state can be populated by different resonances. Which resonances will be allowed is discussed in theory on a different card ([[2]]). A chain is therefore fixed by its topology $\\mathrm K$ and by the combination $\\alpha$ of the resonances in all its intermediate states. A topology can be built with more than one such combination. The general chain amplitude of a cascade chain is given through"
 },
 {
  "type": "eq",
  "tex": "\\htmlClass{sym-amp}{\\mathcal M^{(\\mathrm K,\\alpha)\\,\\lambda_0}_{\\lambda_1\\dots\\lambda_n}}=\\htmlClass{sym-internal-sum}{\\sum_{\\{\\lambda_R\\}}}\\Bigg[\\prod_{v\\in\\mathrm K}\\htmlClass{sym-density}{\\sqrt{\\frac{4\\pi}{\\rho_{a^{(v)},b^{(v)}}}}}\\;\\htmlClass{sym-norm}{\\sqrt{\\frac{2j_{A^{(v)}}+1}{4\\pi}}}\\;\\htmlClass{sym-spin}{D^{j_{A^{(v)}}*}_{\\lambda_{A^{(v)}},\\,\\lambda_{a^{(v)}}-\\lambda_{b^{(v)}}}}\\!\\htmlClass{sym-angles}{\\big(\\varphi_{a^{(v)}},\\vartheta_{a^{(v)}},0\\big)}\\,\\htmlClass{sym-phase}{(-1)^{j_{b^{(v)}}-\\lambda_{b^{(v)}}}}\\,\\htmlClass{sym-coupling}{h^{\\alpha}_{\\lambda_{a^{(v)}}\\lambda_{b^{(v)}}}}\\;\\prod_{R\\in\\mathrm K}\\htmlClass{sym-propagator}{G^{\\alpha}_R(s_R)}\\Bigg]\\tag{1.1}"
 },
 {
  "type": "p",
  "text": "Here $\\lambda_X$ is the helicity of particle $X$ and $(\\varphi_{a^{(v)}},\\vartheta_{a^{(v)}})$ is the direction of $a^{(v)}$ in the frame of this vertex, i.e. the rest-frame of the mother particle $A^{(v)}$. The functions $D$ are Wigner matrices ([[7]]), $h$ is the **helicity coupling** of the vertex the factor $\\sqrt{(2j_{A^{(v)}}+1)/4\\pi}$ normalises the angular part ([[19]]) and the factor $\\sqrt{4\\pi/\\rho_{a^{(v)},b^{(v)}}}$ contains the density $\\rho_{a^{(v)},b^{(v)}}$ of the two-body phase-space of the two products of the vertex ([[10]]). The phase $(-1)^{j_{b^{(v)}}-\\lambda_{b^{(v)}}}$ belongs to the spectator $b^{(v)}$ ([[18]]). The helicity formalism behind these factors goes back to Jacob and Wick [[Ref 2]], see also [[Ref 3, 4]]. The isobar model of cascade decays is described in [[Ref 5]]. $R$ runs over the intermediate states of $\\mathrm K$. $G^{\\alpha}_R(s_R)$ is the **propagator** or **lineshape** of the resonance that $\\alpha$ assigns to $R$, as a function of its invariant mass squared $s_R$ ([[24]], [[25]]). The spins of the intermediate states, the couplings $h$ and the lineshapes belong to the chosen combination $\\alpha$ of resonances. The sum runs over the helicities $\\lambda_R$ of all intermediate states and encloses the whole product ([[16]], [[28]])."
 },
 {
  "type": "p",
  "text": "The helicity of every particle is measured in a specific chain that is reached by going through the process stepwise and is specified by a superscript. For example, $\\lambda_i^{[v|\\mathrm K]}$ is the helicity of a final-state particle $i_\\mathrm p$ in the frame $[v|\\mathrm K]$ of a vertex $v$ producing this particle in the chain $\\mathrm K$. Likewise, $\\lambda_0^{[R_0]}$ is the helicity of the mother in its own rest-frame $[R_0]$, which is the same for all chains ([[6]]). The angles are explained in [[27]]."
 },
 {
  "type": "p",
  "text": "As mentioned above, chains with different topologies use different spin bases to measure helicities of the final-state particles. To add them, every chain is transformed into the base given by the **reference topology** $\\mathrm I$ [[Ref 6]]:"
 },
 {
  "type": "eq",
  "tex": "\\htmlClass{sym-amp}{\\mathcal M^{\\lambda_0}_{\\lambda_1\\dots\\lambda_n}}=\\htmlClass{sym-chains}{\\sum_{\\mathrm K}}\\ \\htmlClass{sym-resonance}{\\sum_{\\alpha}}\\ \\sum_{\\nu_1\\dots\\nu_n}\\Bigg[\\htmlClass{sym-alignment}{\\prod_{i=1}^{n}D^{j_i}_{\\lambda_i\\nu_i}\\big(W_i^{\\mathrm K\\to\\mathrm I}\\big)}\\Bigg]\\htmlClass{sym-amp}{\\mathcal M^{(\\mathrm K,\\alpha)\\lambda_0}_{\\nu_1\\dots\\nu_n}}\\;+\\;\\htmlClass{sym-nr}{\\mathcal M^{(\\mathrm{N.R.})\\lambda_0}_{\\lambda_1\\dots\\lambda_n}}\\tag{1.2}"
 },
 {
  "type": "p",
  "text": "The helicities $\\nu_i$ belong to the basis of the chain $\\mathrm K$, the helicities $\\lambda_i$ to the basis of the reference topology. The sum over $\\alpha$ adds all resonance combinations of the topology $\\mathrm K$. $W_i^{\\mathrm K\\to\\mathrm I}$ is the Wigner rotation that turns the basis of $\\mathrm K$ into that of $\\mathrm I$ for the particle $i_\\mathrm p$ ([[29]], [[Ref 6]]). It depends on the topology only, so that all resonance combinations of one topology are aligned in the same way. For the reference topology itself it is the identity, so that these chains enter without any alignment. The last term is the **non-resonant contribution**, a decay without intermediate resonance ([[30]], [[33]])."
 },
 {
  "type": "h",
  "level": 3,
  "text": "How to Read It"
 },
 {
  "type": "p",
  "text": "Every factor in Eq. (1.1) has a place in the picture of the decay chain ([[3]]): one density factor, one angular factor, one phase and one coupling for every vertex, one propagator for every intermediate state. The vertex of the mother is the root of the chain and its decaying particle has the helicity $\\lambda_0$. A topology can be built with different resonances: every combination $\\alpha$ is its own chain and all of them are added in Eq. (1.2). The product does not depend on the order of the factors, but the sketch tells in which order the decays take place. In the operator form the first decay stands on the right."
 },
 {
  "type": "p",
  "text": "The sum over the helicity $\\lambda_R$ of an intermediate state encloses the whole product, because this helicity appears twice: in the vertex that produces the intermediate state and in the vertex in which it decays, where it is not measurable. Thus, to include all possible helicity values, one needs to sum over it."
 },
 {
  "type": "p",
  "text": "The label $[v|\\mathrm K]$ of a frame says which rest-frame a helicity or an angle refers to ([[6]]). Without such a label the amplitude in question would not be well defined."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Symbol Table"
 },
 {
  "type": "table",
  "head": [
   "Symbol",
   "Meaning",
   "Question"
  ],
  "rows": [
   [
    "$\\mathcal M$",
    "decay amplitude, the matrix element",
    "[[15]]"
   ],
   [
    "$\\sum_{\\mathrm K}\\sum_\\alpha$",
    "sum over decay chains: the topologies and, for each topology, the combinations of resonances",
    "[[17]], [[30]]"
   ],
   [
    "$A_{\\mathrm p/\\mathrm i}^{(v)}$, $a_{\\mathrm p/\\mathrm i}^{(v)}$, $b_{\\mathrm p/\\mathrm i}^{(v)}$",
    "decaying, reference and spectator particle at the vertex $(v)$",
    "[[17]]"
   ],
   [
    "$\\lambda$, $j$, $D^{j*}$",
    "helicity, spin, Wigner $D$ function",
    "[[7]]"
   ],
   [
    "$[v\\vert\\mathrm K]$",
    "frame label: rest-frame of the vertex $v$ in the chain $\\mathrm K$",
    "[[6]]"
   ],
   [
    "$(\\varphi,\\vartheta)$",
    "helicity angles in the frame of the vertex",
    "[[27]]"
   ],
   [
    "$\\sqrt{(2j+1)/4\\pi}$, $h$",
    "normalisation of the angular part, helicity coupling",
    "[[19]]"
   ],
   [
    "$\\sqrt{4\\pi/\\rho}$",
    "factor of the density of the two-body phase-space of the two products of a vertex",
    "[[10]]"
   ],
   [
    "$(-1)^{j_b-\\lambda_b}$",
    "phase of the spectator",
    "[[18]]"
   ],
   [
    "$G_R(s_R)$",
    "propagator, lineshape of an intermediate state",
    "[[24]], [[25]]"
   ],
   [
    "$\\sum_{\\lambda_R}$",
    "sum over the helicity of an intermediate state",
    "[[16]], [[28]]"
   ],
   [
    "$W$",
    "Wigner rotation, alignment of the spin bases",
    "[[29]]"
   ],
   [
    "$\\mathrm I$, $\\mathrm K$",
    "reference topology, chain",
    "[[17]], [[22]], [[29]]"
   ],
   [
    "$\\mathcal M^{(\\mathrm{N.R.})}$",
    "non-resonant contribution",
    "[[30]], [[33]]"
   ]
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Formula for the Selected Decay"
 },
 {
  "type": "p",
  "text": "This section shows how the formula above follows for the selected decay. It only explains the substitution. Why the factors look the way they do is explained in [[10]], [[18]], [[19]], [[27]], [[28]] and [[29]]."
 },
 {
  "type": "decay"
 },
 {
  "type": "p",
  "text": "The result is the same formula that the page Amplitude Construction derives step by step and that the amplitude row of the Dynamic View builds up term by term: all of them take their terms from the same source."
 },
 {
  "type": "h",
  "level": 3,
  "text": "What the Formula Leaves Out"
 },
 {
  "type": "p",
  "text": "The formula is a model. It leaves out, for example:"
 },
 {
  "type": "ul",
  "items": [
   "**Rescattering.** Final-state interactions between the decay products of different steps are not part of a chain. Approaches such as the Khuri–Treiman equations include them [[Ref 6]]. They change the lineshapes of the intermediate states, so that these depend on the partial wave and on the mass of the mother [[Ref 1]]. The lineshapes are not fixed by the formalism and have to be modelled ([[16]]).",
   "**Identical particles.** Identical final-state particles need additional care and are not covered here ([[33]]).",
   "**The polarisation of the mother.** The amplitude describes the decay of a mother with a given helicity. How the mother is produced and how its spin is distributed is explained in [[21]].",
   "**The normalisation.** The amplitude is not yet an intensity. How it becomes one is explained in [[31]]."
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "Where the Same Formula Appears"
 },
 {
  "type": "p",
  "text": "The page Amplitude Construction derives the amplitude of the selected decay step by step. The amplitude row of the Dynamic View builds it up term by term while the animation runs. Amplitude Construction, the amplitude row and the section above take their terms from the same source, so that all of them show the same amplitude."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Related Questions"
 },
 {
  "type": "related",
  "items": [
   {
    "n": 7,
    "text": "The helicities and the $D$ functions."
   },
   {
    "n": 17,
    "text": "The sum over chains."
   },
   {
    "n": 19,
    "text": "The coupling $h$ and the normalisation."
   },
   {
    "n": 24,
    "text": "The lineshape."
   },
   {
    "n": 27,
    "text": "The helicity angles."
   },
   {
    "n": 29,
    "text": "The alignment."
   },
   {
    "n": 30,
    "text": "The construction of the full amplitude, step by step."
   },
   {
    "n": 32,
    "text": "All conventions."
   }
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "Sources"
 },
 {
  "type": "ol",
  "items": [
   "M. Mikhasenko et al. (JPAC), \"Dalitz-plot decomposition for three-body decays\", *Phys. Rev. D* **101**, 034033 (2020), arXiv:1910.04566.",
   "M. Jacob and G. C. Wick, \"On the general theory of collisions for particles with spin\", *Ann. Phys.* **7**, 404 (1959).",
   "S. U. Chung, \"Spin formalisms\", CERN Yellow Report CERN 71-08 (1971).",
   "J. D. Richman, \"An experimenter's guide to the helicity formalism\", Caltech report CALT-68-1148 (1984).",
   "D. Herndon, P. Söding and R. J. Cashmore, \"A generalized isobar model formalism\", *Phys. Rev. D* **11**, 3165 (1975).",
   "K. Habermann and M. Mikhasenko, \"Wigner rotations for cascade reactions\", *Phys. Rev. D* **111**, 056015 (2025), arXiv:2409.06913."
  ],
  "refs": true
 }
];
