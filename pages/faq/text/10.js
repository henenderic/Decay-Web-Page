// FAQ page 10: What Is the Two-Particle Phase-Space Density?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "The states of two particles with a fixed total four-momentum are counted by the **two-body phase-space** $\\mathrm d\\Phi_2$. In the rest-frame of the pair it depends only on the direction of the relative momentum and has the constant value $q_R/(16\\pi^2E_R)$ per solid angle $\\mathrm d\\Omega$, with the energy $E_R=\\sqrt s$ of the pair and the magnitude $q_R$ of the relative momentum from card [[9]]. Integrated over all directions it is the **density** $\\rho=q_R/(4\\pi E_R)$. This density can be used as the factor for the pair state of momenta $\\vert\\vec p_a,\\vec p_b;\\lambda_a\\lambda_b\\rangle^{[R]}$ and the product of a state of total four-momentum $\\vert P^\\mu\\rangle^{[R]}$ and the directional state $\\vert\\Omega;\\lambda_a\\lambda_b\\rangle^{[R]}$. The same factor appears in front of every vertex of the decay amplitude due to the projection of these states onto the corresponding matrix equations."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Two-Body Phase-Space"
 },
 {
  "type": "p",
  "text": "A particle $0_{\\mathrm p}$ with the total four-momentum $P_0^\\mu$ can decay into $a_{\\mathrm p}$ and $b_{\\mathrm p}$ in many ways (meaning different momentum-combinations and directions). The number of these ways is counted by the two-body phase-space. Each particle contributes the invariant measure of card [[4]], $\\mathrm d^3p/\\big((2\\pi)^3\\,2E\\big)$. The conservation of four-momentum that puts everything onto the allowed shell enters through a four-dimensional $\\delta$-function [[Ref 1]]"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_2=(2\\pi)^4\\,\\delta^4\\big(P^\\mu-p_a^\\mu-p_b^\\mu\\big)\\,\\frac{\\mathrm d^3p_a}{(2\\pi)^3\\,2E_a}\\,\\frac{\\mathrm d^3p_b}{(2\\pi)^3\\,2E_b}\\tag{10.1}"
 },
 {
  "type": "p",
  "text": "The factor $(2\\pi)^4$ is part of the measure here. The Review of Particle Physics writes it in front of the decay rate instead [[Ref 1]], so that its $\\mathrm d\\Phi_2$ is smaller by this factor. All factors of Eq. (10.1) have the same value in every frame, so it can be evaluated in the rest-frame $[R]$ of the pair as well [[Ref 2]]. There the four-momentum is simply $P^\\mu\\big|^{[R]}=(E_R,\\vec 0)$ with the total energy of the system $E^{[R]}=E_R=\\sqrt s$ of card [[9]], the energies of the single particles are $E_a^{[R]}=E_{a,R}$ and $E_b^{[R]}=E_{b,R}$, and the magnitude of the relative momentum is $q^{[R]}=q_R$."
 },
 {
  "type": "p",
  "text": "The four-dimensional $\\delta$-function is trivially split up into two parts $(2\\pi)^4\\,\\delta^4\\big(P^\\mu-p_a^\\mu-p_b^\\mu\\big)=2\\pi\\delta(E_R-E_{a,R}-E_{b,R})\\,(2\\pi)^3\\delta^3(\\vec P-\\vec p_a-\\vec p_b)$: the three-dimensional $\\delta$-function removes one of the momentum integrations and sets $\\vec p_b^{[R]}=-\\vec p_a^{[R]}$, so that both momenta have the magnitude $q_R$. What remains is the single integration over $\\vec p_a$, which in spherical coordinates is $\\mathrm d^3p_a=q_R^2\\,\\mathrm dq_R\\,\\mathrm d\\Omega$, together with the remaining energy $\\delta$-function."
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_2=\\frac{1}{(2\\pi)^2}\\,\\frac{1}{4E_{a,R}E_{b,R}}\\,\\delta\\big(E_R-E_{a,R}-E_{b,R}\\big)\\,q_R^2\\,\\mathrm dq_R\\,\\mathrm d\\Omega\\tag{10.2}"
 },
 {
  "type": "p",
  "text": "The energy $\\delta$-function can be reformulated into a $\\delta$-function on the magnitude of relative momentum, see cards [[8]] and [[9]] and fixes the integration variable $q_R$ to the value of Eq. (9.7). The integration over $q_R$ gives the inverse of the derivative of its argument [[Ref 2]], which we know from card [[9]]: $\\mathrm dE_R/\\mathrm dq_R=q_RE_R/(E_{a,R}E_{b,R})$. The product $E_{a,R}E_{b,R}$ cancels and what remains is"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_2=\\frac{q_R}{16\\pi^2E_R}\\,\\mathrm d\\Omega\\tag{10.3}"
 },
 {
  "type": "p",
  "text": "The two-body phase-space is therefore constant in the direction of the relative momentum and its size is set by $q_R$ and the energy of the pair."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Density of the Two-Body Phase-Space"
 },
 {
  "type": "p",
  "text": "The integral of Eq. (10.3) over all directions, $\\int\\mathrm d\\Omega=4\\pi$, is the total two-body phase-space of the pair. We call it the density $\\rho$ and write it in terms of $s$ with Eq. (9.7) and $E_R=\\sqrt s$"
 },
 {
  "type": "eq",
  "tex": "\\rho=\\int\\mathrm d\\Phi_2=\\frac{q_R}{4\\pi E_R}=\\frac{\\sqrt{\\lambda(s,m_a^2,m_b^2)}}{8\\pi s}\\tag{10.4}"
 },
 {
  "type": "p",
  "text": "It depends on the pair only through its squared invariant mass $s$ and the two masses and so it has the same value in every frame. For an intermediate state, the invariant mass $s=s_{12}$ changes from event to event, card [[9]] and so does the density change then."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Density in the Pair State"
 },
 {
  "type": "p",
  "text": "Card [[9]] wrote the pair state in energy and direction with the factor $\\sqrt{16\\pi^2E_R/q_R}$, Eq. (9.13). This factor already hinted at the density and $16\\pi^2E_R/q_R=4\\pi/\\rho$ follows from Eq. (10.4). The pair state therefore reads"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec P,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\sqrt{\\frac{4\\pi}{\\rho}}\\;\\vert P^\\mu\\rangle^{[R]}\\otimes\\vert\\Omega;\\lambda_a\\lambda_b\\rangle^{[R]}\\tag{10.5}"
 },
 {
  "type": "p",
  "text": "and the product of the two norms $\\langle P'^\\mu\\vert P^\\mu\\rangle=(2\\pi)^4\\,\\delta^4(P'^\\mu-P^\\mu)$ and $\\langle\\Omega'\\vert\\Omega\\rangle=\\delta^2(\\Omega'-\\Omega)$ of card [[9]] gives its norm"
 },
 {
  "type": "eq",
  "tex": "{}^{[R]}\\langle\\vec P\\,',\\vec q\\,';\\lambda_a'\\lambda_b'\\vert\\vec P,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\frac{4\\pi}{\\rho}\\,(2\\pi)^4\\,\\delta^4\\big(P'^\\mu\\big|^{[R]}-P^\\mu\\big|^{[R]}\\big)\\,\\delta^2\\big(\\Omega^{\\prime[R]}-\\Omega^{[R]}\\big)\\,\\delta_{\\lambda_a^{\\prime[R]}\\lambda_a^{[R]}}\\delta_{\\lambda_b^{\\prime[R]}\\lambda_b^{[R]}}\\tag{10.6}"
 },
 {
  "type": "p",
  "text": "The factor $4\\pi/\\rho$ is the ratio $\\int\\mathrm d\\Omega\\big/\\int\\mathrm d\\Phi_2$ of the full solid angle to the phase-space. A state of the direction has the unit norm of the sphere and the larger the phase-space of the pair is, the smaller is the factor that turns it into a state of definite momenta."
 },
 {
  "type": "p",
  "text": "The factor is fixed by the norms, only its writing in terms of $\\rho$ is a convention. Chung normalises the pair state in the same way, with $(2\\pi)^4\\delta^4\\delta^2$ and finds the constant $\\frac1{4\\pi}\\sqrt{p/w}$ [[Ref 3]], which is the inverse of our factor, as $q_R/E_R=p/w$. Richman normalises the state of the four-momentum with $\\delta^4$ instead and has the factor $(2\\pi)^3\\sqrt{4\\sqrt s/p}$ [[Ref 4]], which is $(2\\pi)^2\\sqrt{4\\pi/\\rho}$, so that it differs from ours only by the factor $(2\\pi)^2$ that the different norm of the state of the four-momentum requires. A density of this kind appears also in the $S$-matrix of a partial wave, card [[23]], where the constant in front depends on the convention used there."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Where the Density Enters the Decay Amplitude"
 },
 {
  "type": "p",
  "text": "Let a particle decay into $a_{\\mathrm p}$ and $b_{\\mathrm p}$ and let the final state be described by the pair state of Eq. (10.5). The transition operator $T$ is linear, so the bra of the final state carries the factor in front"
 },
 {
  "type": "eq",
  "tex": "{}^{[R]}\\langle\\vec P,\\vec q;\\lambda_a\\lambda_b\\vert\\,T\\,\\vert\\mathrm{in}\\rangle=\\sqrt{\\frac{4\\pi}{\\rho}}\\;\\Big({}^{[R]}\\langle P^\\mu\\vert\\otimes{}^{[R]}\\langle\\Omega;\\lambda_a\\lambda_b\\vert\\Big)\\,T\\,\\vert\\mathrm{in}\\rangle\\tag{10.7}"
 },
 {
  "type": "p",
  "text": "The amplitude into the states of definite momenta is thus the amplitude into the states of the four-momentum and the direction, times $\\sqrt{4\\pi/\\rho}$, with the density of the two particles of the decay. The amplitude into the direction states carries the dependence on the angles and helicities. It is expanded in states of definite angular momentum in the cards [[18]] and [[19]]. The factor $\\sqrt{4\\pi/\\rho}$ therefore stands in front of every vertex of the decay amplitude. Eq. (1.1) of card [[1]] writes the angular part only, so this factor does not appear there. Because $\\rho$ depends on the invariant mass of the pair, it is not a constant for a vertex at which an intermediate state decays. How the factors of all vertices combine to the amplitude of a chain is described in card [[28]]. This card makes no statement about absolute decay rates."
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
    "text": "The invariant measure that each particle contributes to the phase-space."
   },
   {
    "n": 9,
    "text": "The energy and the relative momentum of the pair and the pair state in energy and direction."
   },
   {
    "n": 11,
    "text": "The phase-space of more than two particles, built from two-body factors."
   },
   {
    "n": 18,
    "text": "The vertex of the decay amplitude, in which the factor of this card stands."
   },
   {
    "n": 23,
    "text": "A density of this kind in the S-matrix of a partial wave."
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
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sect. 49.4, Eqs. 49.11 and 49.12).",
   "M. Thomson, *Modern Particle Physics* (Cambridge University Press, 2013), Sect. 3.3.1, Eqs. (3.14) to (3.20).",
   "S. U. Chung, \"Spin formalisms\", CERN 71-08 (1971), updated version BNL-76975-2006-IR (2008), Appendix C, Eqs. (C.2) to (C.4).",
   "J. D. Richman, \"An experimenter's guide to the helicity formalism\", CALT-68-1148 (1984), Sect. 3.2, Eqs. (3.11) to (3.15)."
  ],
  "refs": true
 }
];
