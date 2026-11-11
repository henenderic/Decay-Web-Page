// FAQ page 3: How to Read a Feynman-Sketch?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "A Feynman-sketch is a picture illustrating a decay chain borrowing the look of Feynman diagrams. However, they are to be understood as sketches rather then a mathematical expression in the sense of Feynman-diagrams: the lines are hadrons, not quarks and gluons, each dot and each hatched area stands for everything that happens inside it and unlike Feynman diagrams the sketches are not used to build an expression from the QCD Lagrangian. Time runs from left to right. A **single line** is a particle, such as $1_\\mathrm p$. A **double line** is an intermediate state, such as $(12)_\\mathrm i$, which decays further and carries a propagator. A dot is a **vertex**, such as $((12)3)_\\mathrm v$, where one particle decays into two. A **hatched area** is an interaction that is not specified any further."
 },
 {
  "type": "p",
  "text": "Every vertex stands for an operator $V$, every double line for a propagator $G$ and every particle that takes no part in a step for the identity $\\one$. The operators are multiplied. The first decay stands on the right. Why consecutive decays can be multiplied in this way follows from scattering theory and is explained in [[14]] and [[16]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Elements of a Sketch"
 },
 {
  "type": "p",
  "text": "A sketch shows one process or chain of a decay $0_\\mathrm p\\to 1_\\mathrm p + \\dots + n_\\mathrm p$, read from left to right. It is built from the elements in the table below. [[Figure 3.1]] shows them in the decay of a particle $0_\\mathrm p$ into three particles $1_\\mathrm p$, $2_\\mathrm p$ and $3_\\mathrm p$."
 },
 {
  "type": "fig",
  "id": "F3.1",
  "number": "3.1",
  "caption": "The elements of a sketch, in the decay of $0_\\mathrm p$ into $1_\\mathrm p$, $2_\\mathrm p$ and $3_\\mathrm p$ through the intermediate state $(12)_\\mathrm i$: single lines are particles, the double line is the intermediate state, and each of the two dots is a vertex, $((12)3)_\\mathrm v$ and $(12)_\\mathrm v$."
 },
 {
  "type": "table",
  "head": [
   "Element",
   "Meaning",
   "Mathematical object"
  ],
  "rows": [
   [
    "Single line",
    "A particle, for example $1_\\mathrm p$. It is treated as stable: its decay products are not part of the sketch.",
    "A one-particle state with a momentum and a helicity, $\\vert\\vec p_1;\\lambda_1\\rangle$"
   ],
   [
    "Double line",
    "An intermediate state, for example $(12)_\\mathrm i$. It is produced in one decay and decays itself.",
    "A propagator, $G_{(12)_\\mathrm i}$, which carries the lineshape of the resonance ([[24]])"
   ],
   [
    "Filled dot",
    "A vertex, for example $(12)_\\mathrm v$: one line enters, the decay products leave.",
    "A vertex operator, $V_{(12)_\\mathrm v}$"
   ],
   [
    "Hatched area / \"Blob\"",
    "An interaction that is not specified any further.",
    "An operator that is not written out, a part of the $T$ matrix ([[13]])"
   ],
   [
    "Line that passes a vertex",
    "A particle that takes no part in this step.",
    "The identity operator, $\\one$"
   ]
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "Names: Particles, Intermediate States, Vertices"
 },
 {
  "type": "p",
  "text": "In the general formulation of a scattering or decay that is used throughout this site, every name is built from the numbers of the final-state particles, plus a small upright letter stating the type of an object."
 },
 {
  "type": "table",
  "head": [
   "Subscript",
   "Object",
   "Examples"
  ],
  "rows": [
   [
    "$\\mathrm p$",
    "A particle",
    "$0_\\mathrm p$, $1_\\mathrm p$, $2_\\mathrm p$"
   ],
   [
    "$\\mathrm i$",
    "An intermediate state / resonance, named after what it decays into",
    "$(12)_\\mathrm i$, $((12)3)_\\mathrm i$"
   ],
   [
    "$\\mathrm v$",
    "A vertex, named after everything that comes out of it",
    "$(12)_\\mathrm v$, $((12)3)_\\mathrm v$, $(123)_\\mathrm v$"
   ]
  ]
 },
 {
  "type": "p",
  "text": "The order inside a bracket matters: the first entry always gives the **reference particle** and is drawn on the upper line, the second one is always the **spectator** and drawn on the lower line ([[17]])."
 },
 {
  "type": "p",
  "text": "In the sketch of [[Figure 3.1]] the mother $0_\\mathrm p$ decays at the vertex $((12)3)_\\mathrm v$ into the intermediate state $(12)_\\mathrm i$ and the particle $3_\\mathrm p$. The intermediate state decays at the vertex $(12)_\\mathrm v$ into $1_\\mathrm p$ and $2_\\mathrm p$. A decay of $0_\\mathrm p$ into three particles without an intermediate state has a single vertex, $(123)_\\mathrm v$."
 },
 {
  "type": "p",
  "text": "The subscripts belong to names only. Momenta and helicities carry the bare number: the four-momentum of $1_\\mathrm p$ is $p_1^\\mu$ and its helicity is $\\lambda_1$."
 },
 {
  "type": "h",
  "level": 3,
  "text": "From Sketch to Expression"
 },
 {
  "type": "p",
  "text": "A sketch is read vertex by vertex, from left to right. Every element gives one factor."
 },
 {
  "type": "h",
  "level": 4,
  "text": "One Decay"
 },
 {
  "type": "p",
  "text": "A decay of $0_\\mathrm p$ into $1_\\mathrm p$ and $2_\\mathrm p$ is a single vertex, $(12)_\\mathrm v$. It gives one **operator**, $V_{(12)_\\mathrm v}$, that turns the state of one particle into the state of two particles. Its matrix element between these states is the **decay amplitude** of the vertex ([[18]])."
 },
 {
  "type": "h",
  "level": 4,
  "text": "A Chain of Decays"
 },
 {
  "type": "p",
  "text": "In the decay of [[Figure 3.1]] the mother first decays at $((12)3)_\\mathrm v$, then the intermediate state with the resonance of particles $1_\\mathrm p$ and $2_\\mathrm p$ propagates and then it decays at the vertex $(12)_\\mathrm v$. The expression gets one factor for each of these steps:"
 },
 {
  "type": "eq",
  "tex": "\\big(V_{(12)_\\mathrm v}\\otimes\\one_{3_\\mathrm p}\\big)\\big(G_{(12)_\\mathrm i}\\otimes\\one_{3_\\mathrm p}\\big)\\,V_{((12)3)_\\mathrm v}\\tag{3.1}"
 },
 {
  "type": "p",
  "text": "Like every product of operators, it is read from right to left: the operator on the right acts first. The symbol $\\otimes$ is the **dyadic-product** of two operators acting in different vector- or state-spaces. The next section explains the identity $\\one$. [[Figure 3.2]] shows which factor belongs to which element of the sketch."
 },
 {
  "type": "fig",
  "id": "F3.2",
  "number": "3.2",
  "caption": "The sketch of [[Figure 3.1]] with the factor of Eq. (3.1) that belongs to each element. Read the expression from right to left."
 },
 {
  "type": "h",
  "level": 4,
  "text": "The Sum of Chains"
 },
 {
  "type": "p",
  "text": "Different intermediate states give different sketches and each sketch has its own expression. A decay into three particles has the direct decay (with the single vertex $(123)_\\mathrm v$) and three kinds of decays through a resonance, one for each pair of particles:"
 },
 {
  "type": "eq",
  "tex": "\\begin{aligned}\nT_{123}={}&V_{(123)_\\mathrm v}\\\\\n&+\\sum_\\alpha\\big(V^{\\alpha}_{(12)_\\mathrm v}\\otimes\\one_{3_\\mathrm p}\\big)\\big(G^{\\alpha}_{(12)_\\mathrm i}\\otimes\\one_{3_\\mathrm p}\\big)V^{\\alpha}_{((12)3)_\\mathrm v}\\\\\n&+\\sum_\\beta\\big(V^{\\beta}_{(13)_\\mathrm v}\\otimes\\one_{2_\\mathrm p}\\big)\\big(G^{\\beta}_{(13)_\\mathrm i}\\otimes\\one_{2_\\mathrm p}\\big)V^{\\beta}_{((13)2)_\\mathrm v}\\\\\n&+\\sum_\\gamma\\big(V^{\\gamma}_{(23)_\\mathrm v}\\otimes\\one_{1_\\mathrm p}\\big)\\big(G^{\\gamma}_{(23)_\\mathrm i}\\otimes\\one_{1_\\mathrm p}\\big)V^{\\gamma}_{((23)1)_\\mathrm v}\n\\end{aligned}\\tag{3.2}"
 },
 {
  "type": "p",
  "text": "The Greek letters $\\alpha$, $\\beta$ and $\\gamma$ count the possible resonances of the intermediate states $(12)_\\mathrm i$, $(13)_\\mathrm i$ and $(23)_\\mathrm i$. This is the simplest approximation: decays with rescattering of the final-state particles would add further sketches that are not written here ([[16]]). The amplitude of a single chain is built from these factors in [[28]] and [[30]] shows how all chains together form the full amplitude."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Particles That Take No Part and the Unit Operator"
 },
 {
  "type": "p",
  "text": "In Eq. (3.1) the particle $3_\\mathrm p$ appears twice, with the identity $\\one_{3_\\mathrm p}$. While the intermediate state propagates and decays, $3_\\mathrm p$ simply flies on: in the sketch its line passes the vertex $(12)_\\mathrm v$ without touching it."
 },
 {
  "type": "p",
  "text": "An operator such as $V_{(12)_\\mathrm v}$ is defined for the particles that take part in the decay only. To let it act on the state of all three particles, it is combined with the identity on the others, $V_{(12)_\\mathrm v}\\otimes\\one_{3_\\mathrm p}$. The **identity** means no interaction: the particle keeps its momentum and its helicity."
 },
 {
  "type": "p",
  "text": "Do not confuse a particle that takes no part in a step with the spectator of a vertex. The spectator is the second product of a decay on the lower line and takes part in the decay ([[17]])."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Reading the Topology from a Sketch"
 },
 {
  "type": "p",
  "text": "The sketch of a cascade is an **ordered binary tree**: every vertex has one line entering and two leaving. The upper line is the reference, the lower line the spectator. The brackets in the names write the same tree in one line. In the topology $((12)3)$ the mother splits into $(12)_\\mathrm i$ on the upper line and $3_\\mathrm p$ on the lower line. In turn, $(12)_\\mathrm i$ splits into $1_\\mathrm p$ and $2_\\mathrm p$. The spectator can decay as well: in $(1(23))$ the mother splits into $1_\\mathrm p$ on the upper line and $(23)_\\mathrm i$ on the lower line, which is a double line. [[Figure 3.3]] shows both topologies."
 },
 {
  "type": "fig",
  "id": "F3.3",
  "number": "3.3",
  "caption": "Two topologies of a decay into three particles. In the first one the intermediate state is on the upper line, in the second one on the lower line."
 },
 {
  "type": "p",
  "text": "Such a tree is called the **topology** of the decay. The same final state can be reached through different topologies. Each topology is one sketch with one expression. Changing the order of the two entries in a bracket is not just a different drawing: it changes the conventions of the amplitude, because it changes which particle is the reference and which is the spectator. Which topologies exist and how many there are is explained in [[17]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Production and Decay in One Sketch"
 },
 {
  "type": "p",
  "text": "A sketch can also show where the decaying particle comes from. In [[Figure 3.4]] two particles $A_\\mathrm p$ and $B_\\mathrm p$ enter from the left and interact in a hatched area, an interaction that is not specified any further. They produce the mother $0_\\mathrm p$ and a further particle $C_\\mathrm p$. The line of $C_\\mathrm p$ runs on to the right, because $C_\\mathrm p$ takes no part in the decay of $0_\\mathrm p$. The decay then follows as in [[Figure 3.1]]."
 },
 {
  "type": "fig",
  "id": "F3.4",
  "number": "3.4",
  "caption": "A scattering process with a decay attached: the particles $A_\\mathrm p$ and $B_\\mathrm p$ produce $0_\\mathrm p$ and $C_\\mathrm p$. Then $0_\\mathrm p$ decays through $(12)_\\mathrm i$ into $1_\\mathrm p$, $2_\\mathrm p$ and $3_\\mathrm p$."
 },
 {
  "type": "p",
  "text": "The mother is treated as a particle, not as a virtual state, so its decay can be considered separately from the production. The following questions concentrate on the decay. How a collision becomes a decay event is the subject of [[2]] and how the production enters the amplitude is explained in [[20]]."
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
    "n": 2,
    "text": "Where the process in a sketch comes from."
   },
   {
    "n": 14,
    "text": "The equation behind the sketches."
   },
   {
    "n": 16,
    "text": "This question builds on the sketches."
   },
   {
    "n": 17,
    "text": "Which sketches exist for a final state."
   },
   {
    "n": 18,
    "text": "The operator of a single vertex, written out."
   },
   {
    "n": 20,
    "text": "The left part of [[Figure 3.4]]."
   },
   {
    "n": 28,
    "text": "The product of Eq. (3.1), written out."
   },
   {
    "n": 30,
    "text": "The sum of Eq. (3.2), written out."
   }
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "Sources"
 },
 {
  "type": "p",
  "text": "The scattering theory behind the sketches is explained, with its sources, in [[14]] and [[16]]."
 }
];
