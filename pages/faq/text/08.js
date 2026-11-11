// FAQ page 8: How Are One-Particle States Normalised?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "The momentum of a single particle with the mass $m$ and the spin $j$ is a continuous, so the scalar product of states of the form $\\vert\\vec p;j,\\lambda\\rangle$ will be the usual $\\delta$-function, $\\langle\\vec p\\,';j,\\lambda'\\vert\\vec p;j,\\lambda\\rangle=(2\\pi)^3\\,2E_p\\,\\delta^3(\\vec p\\,'-\\vec p)\\,\\delta_{\\lambda'\\lambda}$ with $E_p=\\sqrt{\\vec p^{\\,2}+m^2}$. The factor $E_p$ makes this **normalisation** Lorentz-invariant: $E\\,\\delta^3(\\vec p\\,'-\\vec p)$ keeps its value under a boost, just as the measure $\\mathrm d^3p/E$ of card [[4]] does. The states are complete. The **completeness relation** integrates over this invariant measure and sums over all $2j+1$ helicities of the particle. Both relations have the same form in every frame. States in energy and direction have a different normalisation, which the cards [[10]] and [[18]] use. The states specifically use the same spin value $j$, as we allow only products of states of the same particle type anyways."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Normalisation"
 },
 {
  "type": "p",
  "text": "A state of definite momentum is a plane wave and has no finite norm, so the normalisation of the states of a particle is a statement about their scalar products. They are chosen as the $\\delta$-function"
 },
 {
  "type": "eq",
  "tex": "\\langle\\vec p\\,';j,\\lambda'\\vert\\vec p;j,\\lambda\\rangle=(2\\pi)^3\\,2E_p\\,\\delta^3(\\vec p\\,'-\\vec p)\\,\\delta_{\\lambda'\\lambda}\\tag{8.1}"
 },
 {
  "type": "p",
  "text": "where $E_p=\\sqrt{\\vec p^{\\,2}+m^2}$ is the on-shell energy, Eq. (4.2) of card [[4]] [[Ref 1, 2, 3]]. All states of this card belong to one frame and to the same helicity basis and therefore frame labels are supressed. Also, only products of the same particle type are allowed, restricting the spin values in the states to always be identical. The $\\delta$-function fixes the momentum: states with different momenta are orthogonal and for equal momenta the scalar product has no finite value but is meant to be integrated. For equal momenta both states arise from the rest states $\\vert\\vec 0,j,\\lambda\\rangle$ by the same boost and rotation, Eq. (7.2) of card [[7]], which do not mix different $\\lambda$. Only states with the same helicity overlap, which is the Kronecker $\\delta_{\\lambda'\\lambda}$."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Lorentz Invariance of the Normalisation"
 },
 {
  "type": "p",
  "text": "The scalar product of two states must have the same value in every frame, because the operator $U(\\Lambda)$ of a Lorentz transformation is unitary [[Ref 3]]. That the right-hand side of Eq. (8.1) fulfils this follows from the invariant measure $\\mathrm d^3p/\\big((2\\pi)^3\\,2E_p\\big)$ of card [[4]], Eqs. (4.6) and (4.7). It is the four-dimensional measure restricted to the mass shell by $2\\pi\\,\\delta(p^2-m^2)\\,\\theta(p^0)$ and each factor of that restriction is Lorentz-invariant."
 },
 {
  "type": "p",
  "text": "The norm of Eq. (8.1) is the unit of the integration over this measure. For every function $g$ of the momentum"
 },
 {
  "type": "eq",
  "tex": "\\int\\frac{\\mathrm d^3p}{(2\\pi)^3\\,2E_p}\\,\\Big[(2\\pi)^3\\,2E_p\\,\\delta^3(\\vec p\\,'-\\vec p)\\Big]\\,g(\\vec p)=g(\\vec p\\,')\\tag{8.2}"
 },
 {
  "type": "p",
  "text": "If $g$ is a Lorentz scalar, its value $g(\\vec p\\,')$ on the right-hand side does not depend on the frame and neither does the measure on the left-hand side. Then the bracket cannot depend on it either and $E_p\\,\\delta^3(\\vec p\\,'-\\vec p)$ has the same value in every frame."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Completeness"
 },
 {
  "type": "p",
  "text": "The states of a particle with the mass $m$ and the spin $j$ are complete in the space of the states of this one particle. With the invariant measure of Eq. (4.6), the completeness relation reads"
 },
 {
  "type": "eq",
  "tex": "\\one=\\sum_{\\lambda=-j}^{j}\\int\\frac{\\mathrm d^3p}{(2\\pi)^3\\,2E_p}\\,\\vert\\vec p;j,\\lambda\\rangle\\langle\\vec p;j,\\lambda\\vert\\tag{8.3}"
 },
 {
  "type": "p",
  "text": "The sum runs over all $2j+1$ helicities [[Ref 3, 4, 5]]. Acting with it on a state $\\vert\\vec p\\,';j,\\lambda'\\rangle$ and using Eq. (8.1) shows that the relation fits the normalisation."
 },
 {
  "type": "p",
  "text": "It is used wherever a state is split into helicity states, for example in the internal helicity sums of card [[16]]. The relation belongs to one particle with a fixed mass and spin. A sum over particle types or over $j$ does not appear as a consequence of particles not changing particle types without transitioning in an  inelastic operator. The relation for two particles is shown in card [[9]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Momentum, Energy and Direction"
 },
 {
  "type": "p",
  "text": "The cards [[9]], [[10]] and [[18]] write the states in energy and momentum-direction rather than giving the three-momentum. Denote the direction of $\\vec p$ by $\\Omega=(\\vartheta,\\varphi)$ and $p=\\lvert\\vec p\\rvert$ is the absolute value of it. In spherical coordinates the three-dimensional $\\delta$-function of Eq. (8.1) can be expressed as $\\delta^3(\\vec p\\,'-\\vec p)=\\frac{1}{p^2}\\,\\delta(p'-p)\\,\\delta^2(\\Omega'-\\Omega)$ with $\\delta^2(\\Omega'-\\Omega)=\\delta(\\cos\\vartheta'-\\cos\\vartheta)\\,\\delta(\\varphi'-\\varphi)$. Because the particles energy is $E_p^2=p^2+m^2$, we have $\\mathrm dE_p/\\mathrm dp=p/E_p$ for the energy measure and thus the $\\delta$-function of absolute momentum can be re-expressed as $\\delta(p'-p)=\\frac{p}{E_p}\\,\\delta(E'-E)$. Inserted in Eq. (8.1) this gives for the normalisation"
 },
 {
  "type": "eq",
  "tex": "\\langle\\vec p\\,';j,\\lambda'\\vert\\vec p;j,\\lambda\\rangle=(2\\pi)^3\\,\\frac{2}{p}\\,\\delta(E'-E)\\,\\delta^2(\\Omega'-\\Omega)\\,\\delta_{\\lambda'\\lambda}=\\frac{2\\pi\\cdot4\\pi}{p}\\;2\\pi\\,\\delta(E'-E)\\;\\delta^2(\\Omega'-\\Omega)\\,\\delta_{\\lambda'\\lambda}\\tag{8.4}"
 },
 {
  "type": "p",
  "text": "The right-hand side is a product of the scalar product $\\langle E'\\vert E\\rangle=2\\pi\\,\\delta(E'-E)$ of two energy states and the scalar product $\\langle\\Omega',\\lambda'\\vert\\Omega,\\lambda\\rangle=\\delta^2(\\Omega'-\\Omega)\\,\\delta_{\\lambda'\\lambda}$ of two direction states, with a factor $2\\pi\\cdot4\\pi/p$ in front. The state of definite momentum is therefore"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec p;j,\\lambda\\rangle=\\sqrt{2\\pi}\\,\\sqrt{\\frac{4\\pi}{p}}\\;\\vert E\\rangle\\otimes\\vert\\Omega,\\lambda\\rangle\\tag{8.5}"
 },
 {
  "type": "p",
  "text": "This is the same state as before, just expressed with another normalisation, a change of variables from $\\vec p$ to $E$ and $\\Omega$ and nothing new. Card [[9]] takes the corresponding step for two particles."
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
    "text": "The invariant measure $\\mathrm d^3p/(2E_p)$ used here."
   },
   {
    "n": 7,
    "text": "The states that are normalised here."
   },
   {
    "n": 9,
    "text": "The normalisation and completeness for two particles."
   },
   {
    "n": 12,
    "text": "The free states built on this normalisation."
   },
   {
    "n": 15,
    "text": "The matrix element between normalised states."
   },
   {
    "n": 16,
    "text": "The internal helicity sums from the completeness relation."
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
   "J. D. Richman, \"An experimenter's guide to the helicity formalism\", CALT-68-1148 (1984), Eq. (3.8).",
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sect. 49.1, Eqs. 49.9 and 49.12).",
   "S. U. Chung, \"Spin formalisms\", CERN 71-08 (1971), Eqs. (2.20) to (2.23).",
   "M. E. Peskin and D. V. Schroeder, *An Introduction to Quantum Field Theory* (Westview Press, 1995), Sect. 2.3, Eqs. (2.36), (2.39) and (2.40).",
   "M. D. Schwartz, *Quantum Field Theory and the Standard Model* (Cambridge University Press, 2014), Sect. 2.3.1, Eqs. (2.72) to (2.74) and Problem 2.6."
  ],
  "refs": true
 }
];
