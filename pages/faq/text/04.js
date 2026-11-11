// FAQ page 4: What Does On-Shell Mean?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "A particle of mass $m$ is on-shell when its four-momentum $p^\\mu=(p^0,\\vec p)$ obeys $p^2=(p^0)^2-\\vec p^{\\,2}=m^2$ with $p^0>0$. The four-momenta that obey it form the so-called mass shell, the surface of a hyperboloid in momentum space. Only the three spatial components of $\\vec p$ can be chosen freely, the energy follows through aboves relation from them. The particles of the initial- and of the final state of a reaction are on-shell, thus real particles. Intermediate states are not: the square of their four-momentum differs from $m^2$ and varies from event to event. The condition has the same form in every frame. Together with the restriction to positive energy it turns an integral over the four-dimensional momentum into one over three-momenta with the invariant measure $\\mathrm d^3p/\\big((2\\pi)^3\\,2E\\big)$. The squares of sums of four-momenta, such as $s=P^2$ of a system, are invariants. For a reaction with two particles in and two out, the three **Mandelstam variables** $s$, $t$ and $u$ describe the three channels, of which the $s$-channel is the resonant one."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Mass Shell"
 },
 {
  "type": "p",
  "text": "The square of a four-vector $p^\\mu=(p^0,\\vec p)$ with $\\vec p=(p^1,p^2,p^3)$ is $p^2=p^\\mu p_\\mu=(p^0)^2-\\vec p^{\\,2}$ using the metric $(+,-,-,-)$ and it has the same value in every inertial frame. A particle of mass $m$ is on-shell if its four-momentum fulfils [[Ref 1, 2]]"
 },
 {
  "type": "eq",
  "tex": "p^2=(p^0)^2-\\vec p^{\\,2}=m^2\\qquad p^0>0\\tag{4.1}"
 },
 {
  "type": "p",
  "text": "Then $p^0$ is the energy $E$ of the particle and it follows from the three-momentum:"
 },
 {
  "type": "eq",
  "tex": "E=E_p=\\sqrt{\\vec p^{\\,2}+m^2}\\tag{4.2}"
 },
 {
  "type": "p",
  "text": "At rest, i.e. $\\vec p=0$, the energy will thus be given by the particles mass $E=m$. It follows that a massless particle cannot be at rest. The velocity of the particle is $\\vec\\beta=\\vec p/E$ [[Ref 2]]. The set of all four-momenta that obey Eq. (4.1) gives the mass shell."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Two Pictures of the Mass Shell"
 },
 {
  "type": "p",
  "text": "[[Figure 4.1]] shows the mass shell in two ways. In panel (a), the motion is restricted to the $xy$ plane, i.e. $p_z$ is set $0$, so that the shell can be drawn in three dimensions. Eq. (4.1) then reads $E^2-p_x^2-p_y^2=m^2$, which is a hyperboloid around the energy axis. Its upper branch, $E>0$, is the mass shell of Eq. (4.1) [[Ref 3]]. In panel (b), the energy is fixed and all allowed three-momenta for this energy $E$ lie on a sphere with the radius $\\sqrt{E^2-m^2}$."
 },
 {
  "type": "fig",
  "id": "F4.1",
  "number": "4.1",
  "caption": "Two pictures of the mass shell. (a) For motion in the $xy$ plane the allowed four-momenta lie on the hyperboloid $E^2-p_x^2-p_y^2=m^2$. The thick arrow is one four-momentum on the shell and the cross marks the particle at rest, $E=m$. (b) For a fixed energy $E$ the allowed three-momenta lie on a sphere with the radius $\\sqrt{E^2-m^2}$."
 },
 {
  "type": "h",
  "level": 3,
  "text": "On-Shell and Off-Shell Momenta"
 },
 {
  "type": "p",
  "text": "The particles that enter a reaction and the particles that leave it afterwards are free particles with measurable fixed masses, so each of their four-momenta obeys the relation $p_i^2=m_i^2$. Take for example the decay of card [[3]], in which $0_\\mathrm p$ decays into 3 particles $1_\\mathrm p$, $2_\\mathrm p$ and $3_\\mathrm p$ through some intermediate state $(12)_\\mathrm i$. The mother $0_\\mathrm p$ and the three particles are all on-shell. The intermediate state is not and its four-momentum is the sum $p_1^\\mu + p_2^\\mu$ - and the square of a sum is not fixed [[Ref 1]]:"
 },
 {
  "type": "eq",
  "tex": "(p_1^\\mu+p_2^\\mu)^2=m_1^2+m_2^2+2\\big(E_1E_2-\\vec p_1\\cdot\\vec p_2\\big)=s_{12}\\tag{4.3}"
 },
 {
  "type": "p",
  "text": "The right-hand side changes with the momenta of $1_\\mathrm p$ and $2_\\mathrm p$, so $s_{12}$ varies from event to event and in general differs from the squared mass of the resonance that $(12)_\\mathrm i$ stands for. How far it is from the shell enters the propagator of the resonance ([[24]] and [[25]])."
 },
 {
  "type": "p",
  "text": "The same holds for the sum of all four-momenta of a system, $P^\\mu=\\sum_ip_i^\\mu$. The square $P^2=s$ is the squared invariant mass of the system and has the same value in every frame [[Ref 1]]. In the frame in which the total three-momentum vanishes, $P^\\mu=(\\sqrt s,\\vec 0)$ and $\\sqrt s=\\sum_iE_i\\ge\\sum_im_i$. For the mother, the conservation of four-momentum gives $(p_1^\\mu+p_2^\\mu+p_3^\\mu)^2=m_0^2$. Two on-shell particles taken together are described in [[9]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Where the Invariant Measure Comes From"
 },
 {
  "type": "p",
  "text": "Integrals over the momentum of a free particle use the measure $\\mathrm d^3p/\\big((2\\pi)^3\\,2E_p\\big)$ [[Ref 2]] to integrate over the allowed phase-space region, which follows from the mass-shell condition. Start from the unrestricted four-dimensional momentum space with the measure $\\mathrm d^4p/(2\\pi)^4$. The on-shell condition $p^2=m^2$ is enforced by $2\\pi\\,\\delta(p^2-m^2)$. One also restricts to positive energies only by multiplying with a step function $\\theta(p^0)$. For an arbitrary function $f(p^\\mu)$ in the four-dimensional momentum space one therefore writes the integral:"
 },
 {
  "type": "eq",
  "tex": "\\int\\frac{\\mathrm d^4p}{(2\\pi)^4}\\;2\\pi\\,\\delta(p^2-m^2)\\,\\theta(p^0)\\,f(p^\\mu)\\tag{4.4}"
 },
 {
  "type": "p",
  "text": "The argument of the $\\delta$-function can be rewritten into $p^2-m^2=(p^0)^2-E_p^2$, which vanishes at $p^0=\\pm E_p$. Using the relation on $\\delta$-functions of a function, $\\delta(g(x))=\\sum_k\\delta(x-x_k)/|g'(x_k)|$ with $x_k$ the zeros of $g(x)$, in this case one rewrites the $\\delta$-function using $g'=2p^0$, which gives"
 },
 {
  "type": "eq",
  "tex": "\\delta\\big((p^0)^2-E_p^2\\big)=\\frac{1}{2E_p}\\Big[\\delta(p^0-E_p)+\\delta(p^0+E_p)\\Big]\\tag{4.5}"
 },
 {
  "type": "p",
  "text": "The step function keeps only the first term, while the integral over $p^0$ removes the $\\delta$-function and leaves a factor $1/(2\\pi)^3$:"
 },
 {
  "type": "eq",
  "tex": "\\int\\frac{\\mathrm d^4p}{(2\\pi)^4}\\;2\\pi\\,\\delta(p^2-m^2)\\,\\theta(p^0)\\,f(p)=\\int\\frac{\\mathrm d^3p}{(2\\pi)^3\\,2E_p}\\,f(E_p,\\vec p)\\tag{4.6}"
 },
 {
  "type": "p",
  "text": "This is the usual form of the invariant measure. It is also found in Peskin and Schroeder [[Ref 3]] and in Weinberg [[Ref 4]]. Weinberg's metric has the opposite sign, so his $\\delta(p^2+m^2)$ is the $\\delta(p^2-m^2)$ used here."
 },
 {
  "type": "p",
  "text": "The right-hand side will be Lorentz-invariant, because the left-hand side already was. A Lorentz transformation $\\Lambda$ that preserves the direction of time and obeys $\\Lambda^\\mu_\\rho \\Lambda^\\rho_\\nu = \\delta^\\mu_\\nu$ and $\\Lambda^0_0\\geq 0$ leaves the measure $\\mathrm d^4p$ unchanged, since for the determinant $\\det\\Lambda=\\pm1$ will hold as well. Also $p^2$ is unaffected by the transformation, as for $p'^\\mu = \\Lambda^\\mu_\\nu p^\\nu$ it follows $p'^2 = \\Lambda^\\rho_\\nu p^\\nu \\Lambda^\\mu_\\rho p_\\mu = \\delta^\\mu_\\nu p^\\nu p_\\mu = p^2$. It also maps the future light cone onto itself, so that $p^0>0$ stays positive for $p^2=m^2>0$ and $\\theta(p^0)$ does not change. Hence the integral has the same value for $f(\\Lambda p)$ as for $f(p)$:"
 },
 {
  "type": "eq",
  "tex": "\\int\\frac{\\mathrm d^3p}{(2\\pi)^3\\,2E_p}\\,f(\\Lambda p)=\\int\\frac{\\mathrm d^3p}{(2\\pi)^3\\,2E_p}\\,f(p)\\tag{4.7}"
 },
 {
  "type": "p",
  "text": "The same factor $2E_p$ reappears in the normalisation of one-particle states, $\\langle p'|p\\rangle = (2\\pi)^3\\,2E_p\\,\\delta^3(\\vec p'-\\vec p)$ [[Ref 2, 3]], which we recapitulate in card [[8]] and also in the phase-spaces of two- ([[10]]) and more particles ([[11]])."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Mandelstam Variables"
 },
 {
  "type": "p",
  "text": "Squares of sums of four-momenta, like $s=P^2$ and $s_{12}$ above, appear in every reaction. For a classic two-to-two particle interaction, for example the production process $A_\\mathrm p+B_\\mathrm p\\to0_\\mathrm p+C_\\mathrm p$ of Figure 3.4 in card [[3]], three such invariants can be built from the four momenta. They are called the Mandelstam variables [[Ref 1, 2]]"
 },
 {
  "type": "eq",
  "tex": "s=(p_A^\\mu+p_B^\\mu)^2=(p_0^\\mu+p_C^\\mu)^2\\qquad t=(p_A^\\mu-p_0^\\mu)^2=(p_B^\\mu-p_C^\\mu)^2\\qquad u=(p_A^\\mu-p_C^\\mu)^2=(p_B^\\mu-p_0^\\mu)^2\\tag{4.8}"
 },
 {
  "type": "p",
  "text": "The two expressions of each variable are come due to the conservation of four-momentum of initial- and final state, $p_A^\\mu+p_B^\\mu=p_0^\\mu+p_C^\\mu$. As squares of four-vectors, all three have the same value in every frame. With $p^2=m^2$ for the four particles they add up to a constant, so two of them fix the third"
 },
 {
  "type": "eq",
  "tex": "s+t+u=m_A^2+m_B^2+m_0^2+m_C^2\\tag{4.9}"
 },
 {
  "type": "p",
  "text": "Each variable belongs to one way in which four-momentum can flow through a sketch (card [[3]]), drawn for the three cases in [[Figure 4.2]]. At every vertex four-momentum is conserved, so a line that connects two parts of the sketch carries a definite four-momentum and the three variables are the squares of these. This is called the channel of the reaction [[Ref 1]]. In the $s$-channel the two incoming particles react such that they form a (resonant) state with the four-momentum $p_A^\\mu+p_B^\\mu$, which then decays into the two outgoing particles. This is the situation of the pair above and $s$ can come close to the squared mass of a resonance. The $s$-channel is therefore the resonant one, see the cards [[24]] and [[25]]. In the centre-of-momentum frame $s=(E_A^{[R]}+E_B^{[R]})^2$ is the squared total energy of card [[2]]. In the $t$-channel the particles exchange the four-momentum $p_A^\\mu-p_0^\\mu$, which is carried by a virtual particle. In elastic scattering this four-momentum is space-like, $t\\le0$, so the exchanged particle is never on its mass shell and $t$ shows no resonance peak [[Ref 1, 2]]. The $u$-channel is the same with the two outgoing particles interchanged and is needed when they are identical."
 },
 {
  "type": "fig",
  "id": "F4.2",
  "number": "4.2",
  "caption": "The three channels of the reaction $A_\\mathrm p+B_\\mathrm p\\to0_\\mathrm p+C_\\mathrm p$ with the exchange of one line. Time runs from left to right. (a) In the $s$-channel $A_\\mathrm p$ and $B_\\mathrm p$ merge into one state of the four-momentum $p_A^\\mu+p_B^\\mu$, drawn as a double line because it can be a resonance. (b) In the $t$-channel $A_\\mathrm p$ turns into $0_\\mathrm p$ and passes the four-momentum $p_A^\\mu-p_0^\\mu$ to $B_\\mathrm p$ through a virtual particle. (c) The $u$-channel is the same with the two outgoing particles interchanged, so that their lines cross."
 },
 {
  "type": "p",
  "text": "In the decay of card [[3]] the three pair variables $s_{12}$, $s_{13}$ and $s_{23}$ of Eq. (4.3) play the role of $s$, each is the squared invariant mass of two of the decay products. They satisfy the corresponding relation $s_{12}+s_{13}+s_{23}=m_0^2+m_1^2+m_2^2+m_3^2$ [[Ref 2]], so two of them are enough to describe the kinematics of the decay, as in the Dalitz plot of card [[2]]."
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
    "n": 6,
    "text": "The boost from an on-shell four-momentum to the rest-frame."
   },
   {
    "n": 8,
    "text": "Where the factor $2E$ enters the normalisation of states."
   },
   {
    "n": 9,
    "text": "Two on-shell particles taken together."
   },
   {
    "n": 24,
    "text": "The propagator of a particle that is off-shell."
   },
   {
    "n": 25,
    "text": "The same propagator from field theory."
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
   "M. Thomson, *Modern Particle Physics* (Cambridge University Press, 2013), Sects. 2.2.2, 2.2.3, 3.2.1 and 5.2.",
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sects. 49.1, 49.4.3 and 49.5.1, Eqs. 49.9, 49.12 and 49.29 to 49.32).",
   "M. E. Peskin and D. V. Schroeder, *An Introduction to Quantum Field Theory* (Westview Press, 1995), Sect. 2.3, Eqs. (2.36) and (2.40) and Fig. 2.2.",
   "S. Weinberg, *The Quantum Theory of Fields*, Vol. 1 (Cambridge University Press, 1995), Sect. 2.5, Eq. (2.5.15)."
  ],
  "refs": true
 }
];
