// FAQ page 6: How Is a Particle Rest-Frame Defined?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "The rest-frame of a particle is the frame in which its three-momentum vanishes. It follows from the on-shell four-momentum ([[4]]) by a boost with the velocity $\\vec\\beta=\\vec p/E$. A cascade decay-chain needs one such rest-frame for every particle that decays, because each decay is described in the rest-frame of its mother. The boost alone fixes only the velocity: in general a rest-frame can have any rotation. The convention of this site fixes its orientation: to get from the rest-frame into another frame, one first boosts along $z$ (said to be the direction of the particle at rest in this convention) followed by a rotation of said $z$ axis into the direction of flight in the new frame, $L=R_z(\\varphi)R_y(\\vartheta)B_z(\\eta)$. Two paths through a decay chain that end in the rest-frame of the same particle give $x$ and $y$ axes that are rotated against each other (Wigner rotation). Therefore every rest-frame needs to be named after its vertex and chain of origin, $[v|\\mathrm K]$ in order to keep track of the transformations that lead there."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Why a Decay Chain Needs Rest-Frames"
 },
 {
  "type": "p",
  "text": "For the later mathematical description, a decay can be expressed the simplest in the frame in which the decaying particle is at rest. In this rest-frame of the mother of a two-body decay $0_\\mathrm p \\to 1_\\mathrm p + 2_\\mathrm p$, the two products have momenta of equal size and opposite direction ([[9]]). In a cascade decay-chain, multiple two-body decays form the chain back-to-back meaning the products of one decay can decay again. Every particle that decays has a rest-frame of its own and the chain passes from one rest-frame to the next."
 },
 {
  "type": "h",
  "level": 3,
  "text": "From a Four-Momentum to a Rest-Frame"
 },
 {
  "type": "p",
  "text": "A particle $0_\\mathrm p$ with a mass $m_0>0$ and the on-shell four-momentum $p_0^\\mu=(E_0,\\vec p_0)$ has the velocity $\\vec\\beta_0=\\vec p_0/E_0$ and the Lorentz factor $\\gamma_0=E_0/m_0$ [[Ref 1, 2]]. Its rest-frame $[R_0]$ is the frame in which the particle has zero spatial momentum $\\vec p_0=0$. There its four-momentum is given solely by the mass $(m_0,\\vec 0)$ [[Ref 2]]. Subsequently, a frame, in which a particle appears to be at rest is called a rest-frame that comoves with the particle with a velocity $\\vec\\beta_0$ with respect to the frame in which $p_0^\\mu$ is (actually) measured."
 },
 {
  "type": "p",
  "text": "For a boost along $z$ it is convenient to use the rapidity $\\eta_0$, defined by $\\tanh\\eta_0=\\beta_0$, so that $\\gamma_0=\\cosh\\eta_0$ and $\\gamma\\beta_0=\\sinh\\eta_0$. For a particle that moves along $z$, $\\eta_0=\\tfrac12\\ln\\frac{E_0+p_{0,z}}{E_0-p_{0,z}}$ [[Ref 2]]. The boost acts on the components $(E_0,p_{0,x},p_{0,y},p_{0,z})$ as"
 },
 {
  "type": "eq",
  "tex": "B_z(\\eta_0)=\\begin{pmatrix}\\cosh\\eta_0&0&0&\\sinh\\eta_0\\\\0&1&0&0\\\\0&0&1&0\\\\\\sinh\\eta_0&0&0&\\cosh\\eta_0\\end{pmatrix}\\tag{6.1}"
 },
 {
  "type": "p",
  "text": "It is meant actively: it maps the four-momentum of a particle at rest, $(m_0,0,0,0)$, to $(m_0\\cosh\\eta_0,0,0,m_0\\sinh\\eta_0)$, so it gives the particle a positive momentum along $z$. The inverse boost, $B_z(-\\eta_0)$, takes the particle back to rest."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Axes Are Not Fixed by the Boost"
 },
 {
  "type": "p",
  "text": "The boost alone fixes only the velocity of the rest-frame. A rest-frame can in general have any rotation: if its axes are rotated, the particle is still at rest, so every rotation of a rest-frame is again a rest-frame of the same particle. The rest-frame that is reached by the convention of this site, however, has a fixed orientation in space. This work uses the helicity convention of [[Ref 3]]: to get from the rest-frame $[R_0]$ to some other frame $[F]$, first one boosts along the standard $z$ axis of Eq. (6.1) that is chosen to be the direction of motion of particle $0_\\mathrm p$ in this frame, then a rotation tilts the momentum by the polar angle $\\vartheta_0$ and turns it to the azimuth $\\varphi_0$ of the direction of flight in the second frame $[F]$. All rotations are active and the rightmost factor acts first ([[5]]):"
 },
 {
  "type": "eq",
  "tex": "L=R_z(\\varphi_0)\\,R_y(\\vartheta_0)\\,B_z(\\eta_0)\\tag{6.2}"
 },
 {
  "type": "p",
  "text": "[[Figure 6.1]] shows the steps. The angles $\\vartheta_0$ and $\\varphi_0$ of Eq. (6.2) are those of the momentum in the frame the transport starts from, i.e."
 },
 {
  "type": "eq",
  "tex": "\\vec{p}_0^{[F]} = p_0 \\begin{pmatrix}\\sin\\vartheta_0\\,\\cos\\varphi_0\\\\\\sin\\vartheta_0\\,\\sin\\varphi_0\\\\\\cos\\vartheta_0\\end{pmatrix}\\tag{6.3}"
 },
 {
  "type": "p",
  "text": "meaning $\\vartheta_0$ and $\\varphi_0$ are measured within frame $[F]$."
 },
 {
  "type": "p",
  "text": "The way ths convention defines it, the map $L$ takes the four-momentum of a particle at rest to its four-momentum in some other frame, while its inverse acting on a state in this other frame gives the components of a four-vector in the rest-frame. This means that $L$ is a full Lorentz transformation including a boost and rotations. The construction of helicity states from a boost and a rotation goes back to Jacob and Wick [[Ref 4]]. For the second decay product of a decay, the rotation $R_y(\\pi)$ has to be inserted between $R_y(\\vartheta)$ and $B_z(\\eta)$, see card ([[18]]) for a further review on this issue."
 },
 {
  "type": "p",
  "text": "The rest-frame therefore has an orientation inherited from the previous non-resting frame. Its $z$ axis is parallel to the direction of flight that this particle originally has in the frame the transport starts from. While the momentum in the rest-frame itself has only vanishing components per definition (i.e. $\\vec{p}_0^{[R_0]} = 0\\,\\hat e_x^{[R_0]} + 0\\,\\hat e_y^{[R_0]} + 0\\,\\hat e_z^{[R_0]}$), the direction of flight is carried along from the original frame. It is what makes the projection of the spin on $z$ in the rest-frame the projection on the direction of flight, the helicity, see card ([[7]]) on the matter of helicity."
 },
 {
  "type": "fig",
  "id": "F6.1",
  "number": "6.1",
  "caption": "From rest to the direction of flight in four steps. (a) The particle at rest. (b) After the boost $B_z(\\eta_0)$ it moves along $z$. (c) After $R_y(\\vartheta_0)$ the momentum is tilted by the polar angle $\\vartheta_0$. (d) After $R_z(\\varphi_0)$ it has the azimuth $\\varphi_0$. The axes of the starting frame stay in place."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Two Paths to the Same Rest-Frame"
 },
 {
  "type": "p",
  "text": "In a cascade decay-chain, every intermediate particles rest-frame is reached from the rest-frame of its production in a previous decay by a transport of the form of Eq. (6.2). Thus a path of consecutive decays through the decay graph will be a sequence of such transports [[Ref 3]]. Take the decay of $0_\\mathrm p$ into $1_\\mathrm p$, $2_\\mathrm p$ and $3_\\mathrm p$ in card [[3]]. In the topology $((12)3)$ the rest-frame of particle $1_\\mathrm p$ is reached from the rest-frame of $0_\\mathrm p$ through a transport to the rest-frame of the intermediate resonance $(12)_\\mathrm i$. In the topology $(1(23))$ however, it is reached directly with only one transport."
 },
 {
  "type": "p",
  "text": "Both paths end in a rest-frame of the same particle, but the axes of the two frames are rotated against each other. The reason is that two boosts in different directions will not combine into a single boost but into a boost and a rotation, the Wigner rotation [[Ref 3]]. The orientation of a rest-frame therefore depends on the path through which it was reached. How the rotation is computed in detail is explained on card [[29]]. Its action on spin states will however be relevant already on card [[7]]. For background on the little group behind the Wigner rotation see [[Ref 5]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Naming the Frames"
 },
 {
  "type": "p",
  "text": "Because the axes of a rest-frame depend on the path, a rest-frame is named after the vertex at which its particle decays and after the chain through which it is reached: $[v|\\mathrm K]$. Here $v$ denotes the vertex name. The chain $\\mathrm K$ is a topology label with its resonances ([[3]] and [[17]]). In the examples in this work, they will be denoted using Roman numerals for the topologies. Let $\\mathrm I$ be the chain with the topology $((12)3)$ (the reference-topology) and $\\mathrm{II}$ is a different chain with the topology $(1(23))$. Then $[(12)|\\mathrm I]$ is the rest-frame of the resonance $(12)_\\mathrm i$ in the reference-chain $\\mathrm I$."
 },
 {
  "type": "table",
  "head": [
   "Label",
   "Rest-frame of",
   "Remark"
  ],
  "rows": [
   [
    "$[v\\vert\\mathrm K]$",
    "the particle that decays at the vertex $v$, in the chain $\\mathrm K$",
    "A vertex that occurs in two chains can have different axes in them, because the paths to it differ."
   ],
   [
    "$[R_0]$",
    "the mother $0_\\mathrm p$",
    "The same for all chains of an event, so the label needs no chain."
   ],
   [
    "$i\\vert\\mathrm K$",
    "the final-state particle $i_\\mathrm p$, in the chain $\\mathrm K$",
    "The end of a path. The two frames at the end of the paths are $1\\vert\\mathrm I$ (the path through $(12)_\\mathrm i$) and $1\\vert\\mathrm{II}$ (the direct path)."
   ]
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Orientation of the First Rest-Frame"
 },
 {
  "type": "p",
  "text": "The chain starts in the rest-frame of the mother, $[R_0]$. There is no earlier decay from which a direction could be taken, so the axes of this frame need a convention of their own. How the production of the mother provides the starting frame is described in [[20]] and why the orientation of this frame has to be prescribed is the subject of [[22]]."
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
    "n": 4,
    "text": "The four-momentum from which the boost is built."
   },
   {
    "n": 5,
    "text": "The rotations of Eq. (6.2)."
   },
   {
    "n": 7,
    "text": "How boost and rotation define the states."
   },
   {
    "n": 9,
    "text": "The rest-frame of a pair of particles."
   },
   {
    "n": 17,
    "text": "The chain $\\mathrm K$ in the label."
   },
   {
    "n": 18,
    "text": "The transport of a single vertex."
   },
   {
    "n": 20,
    "text": "The frame in which the mother is produced."
   },
   {
    "n": 22,
    "text": "The orientation of the first rest-frame."
   },
   {
    "n": 27,
    "text": "The path of frames to every vertex."
   },
   {
    "n": 29,
    "text": "The Wigner rotation between chains."
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
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sects. 49.1, 49.4.2 and 49.4.3).",
   "M. Thomson, *Modern Particle Physics* (Cambridge University Press, 2013), Sects. 2.2.1, 2.2.2 and 10.9.1.",
   "K. Habermann and M. Mikhasenko, \"Wigner rotations for cascade reactions\", *Phys. Rev. D* **111**, 056015 (2025), arXiv:2409.06913, Eqs. (3) and (15), Fig. 2 and Sect. VI.",
   "M. Jacob and G. C. Wick, \"On the general theory of collisions for particles with spin\", *Ann. Phys.* **7**, 404 (1959).",
   "S. Weinberg, *The Quantum Theory of Fields*, Vol. 1 (Cambridge University Press, 1995), Sect. 2.5."
  ],
  "refs": true
 }
];
