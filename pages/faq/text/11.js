// FAQ page 11: How to Build the Phase-Space for More Particles?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "The phase-space of $n$ particles with the total four-momentum $P^\\mu$ is the product of the invariant measures of all particles, restricted by the conservation of four-momentum. Any group of the particles, a **subsystem**, behaves in this phase-space like one particle with the mass $\\sqrt s$ given by the squared invariant mass of its four-momentum. The phase-space therefore factorises into the phase-space of the decay of the subsystem, the phase-space of the remaining particles together with the subsystem as one of them, and a **mass integral** over the squared mass of the subsystem. Repeating this step gives $n-1$ two-body phase-spaces from card [[10]] and $n-2$ mass integrals. The final state has $3n-4$ variables, and $3n-7$ if the orientation of the whole event is left out. For three particles these are two squared invariant masses, in which the phase-space is flat. From four particles on, invariant masses alone do not fix the event."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Phase-Space of Many Particles"
 },
 {
  "type": "p",
  "text": "The phase-space of a final state with $n$ particles is conceptually the same product of invariant measures that card [[10]] introduced for two particles, with the conservation of four-momentum restricting the system onto the multi-particle energy-shell [[Ref 1]]"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_n(P^\\mu;p_1^\\mu,\\dots,p_n^\\mu)=(2\\pi)^4\\,\\delta^4\\Big(P^\\mu-\\sum_{i=1}^np_i^\\mu\\Big)\\prod_{i=1}^n\\frac{\\mathrm d^3p_i}{(2\\pi)^3\\,2E_i}\\tag{11.1}"
 },
 {
  "type": "p",
  "text": "For $n=2$ this just gives Eq. (10.1) and as there, the factor $(2\\pi)^4$ belongs to the measure, while it is left out for example in the Review of Particle Physics [[Ref 1]]. All factors are frame-invariant, so it does not matter in which frame the momenta are taken and the phase-space integral is evaluated."
 },
 {
  "type": "p",
  "text": "This measure counts the final states that can be reached by distinguishable particles, for identical particles it has to be reduced, which is not covered here."
 },
 {
  "type": "h",
  "level": 3,
  "text": "A Subsystem as a Particle"
 },
 {
  "type": "p",
  "text": "Take a group of the final-state particles, a subsystem, for example the first two (remember that the ordering of particles is relevant in this discussion). Four-momenta add, so the four-momentum of this group of two is the sum, and the square of this sum is the squared invariant mass of this group [[Ref 1]]"
 },
 {
  "type": "eq",
  "tex": "p_{12}^\\mu=p_1^\\mu+p_2^\\mu\\qquad s_{12}=p_{12}^\\mu\\,p_{12,\\mu}=m_{12}^2\\tag{11.2}"
 },
 {
  "type": "p",
  "text": "A group of the first $j$ particles is called $p_{1\\dots j}^\\mu$ with the squared invariant mass $s_{1\\dots j}$, respectively. Seen from the outside perspective, only the four-momentum of the group matters and the subsystem $(12)$ then behaves like a single particle with the mass $m_{12}$. In contrast to a stable particle, its mass changes from event to event, meaning it is off-shell, as discussed in cards [[4]] and [[9]] and intermediate states of a decay chain form such a subsystem. Its spin enters through the states of card [[18]] and its dependence on the mass through the lineshape of card [[24]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Factorising the Phase-Space"
 },
 {
  "type": "p",
  "text": "The factorisation follows from two steps. First, the $\\delta$-function of the conservation of four-momentum has to be split at the subsystem, by integrating over its four-momentum with a second $\\delta$-function that ties it to its members"
 },
 {
  "type": "eq",
  "tex": "\\delta^4\\Big(P^\\mu-\\sum_{i=1}^np_i^\\mu\\Big)=\\int\\mathrm d^4p_{1\\dots j}\\;\\delta^4\\Big(p_{1\\dots j}^\\mu-\\sum_{i=1}^jp_i^\\mu\\Big)\\,\\delta^4\\Big(P^\\mu-p_{1\\dots j}^\\mu-\\sum_{i=j+1}^np_i^\\mu\\Big)\\tag{11.3}"
 },
 {
  "type": "p",
  "text": "Put plainly, we introduced four-momentum conservation for the subsystem by introducing a virtual particle. The phase-space integral now looks the following way"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_n(P^\\mu;p_1^\\mu,\\dots,p_n^\\mu)=(2\\pi)^4\\delta^4\\Big(p_{1\\dots j}^\\mu-\\sum_{i=1}^jp_i^\\mu\\Big)\\prod_{i=1}^j\\frac{\\mathrm d^3p_i}{(2\\pi)^3\\,2E_i}\\,\\cdot\\,(2\\pi)^4\\delta^4\\Big(P^\\mu-p_{1\\dots j}^\\mu-\\sum_{i=j+1}^np_i^\\mu\\Big)\\frac{\\mathrm d^4p_{1\\dots j}}{(2\\pi)^4}\\prod_{i=j+1}^n\\frac{\\mathrm d^3p_i}{(2\\pi)^3\\,2E_i}"
 },
 {
  "type": "p",
  "text": "that strikingly looks like two phase-spaces multiplied. Second, the four-dimensional integration over $p_{1\\dots j}^\\mu$ must be rewritten now with its squared mass as a variable in order to fit in with the other measures of real particles. We introduce it here by inserting $\\one=\\int\\mathrm ds_{1\\dots j}\\,\\delta\\big(p_{1\\dots j}^2-s_{1\\dots j}\\big)$ into the integral over $p_{1\\dots j}^\\mu$. For each fixed $s_{1\\dots j}$, with the restriction to positive energy, Eq. (4.6) then turns the four-dimensional integration into one over the three-momentum with the measure $\\mathrm d^3p_{1\\dots j}/(2E_{1\\dots j})$, so that $\\mathrm d^4p_{1\\dots j}=\\mathrm ds_{1\\dots j}\\,\\mathrm d^3p_{1\\dots j}/(2E_{1\\dots j})$. Here $E_{1\\dots j}=\\sqrt{\\vec p_{1\\dots j}^{\\,2}+s_{1\\dots j}}$ is the energy of the subsystem in the frame of the momentum $\\vec p_{1\\dots j}$. Together with the factor $1/(2\\pi)^4$ of $\\mathrm d^4p_{1\\dots j}$ and with $\\mathrm d^3p/(2E)=(2\\pi)^3\\,\\mathrm d^3p/\\big((2\\pi)^3\\,2E\\big)$ this gives the invariant measure of one particle with the mass $\\sqrt{s_{1\\dots j}}$ and the factor $(2\\pi)^3/(2\\pi)^4\\,\\mathrm ds_{1\\dots j}=\\mathrm ds_{1\\dots j}/(2\\pi)$. What is left now is the phase-space of the members of the subsystem and the phase-space of the remaining particles with the subsystem among them [[Ref 2]]"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_n(P^\\mu;p_1^\\mu,\\dots,p_n^\\mu)=\\mathrm d\\Phi_j(p_{1\\dots j}^\\mu;p_1^\\mu,\\dots,p_j^\\mu)\\;\\mathrm d\\Phi_{n-j+1}(P^\\mu;p_{1\\dots j}^\\mu,p_{j+1}^\\mu,\\dots,p_n^\\mu)\\;\\frac{\\mathrm ds_{1\\dots j}}{2\\pi}\\tag{11.4}"
 },
 {
  "type": "p",
  "text": "The Review of Particle Physics writes $(2\\pi)^3\\,\\mathrm dq^2$ [[Ref 1]], because its $\\mathrm d\\Phi_n$ does not contain the factor $(2\\pi)^4$. Skjeggestad writes the same factorisation without any factors $2\\pi$, first as a recursion that splits off one particle and then for a subsystem of $k$ particles [[Ref 2]]. Applying Eq. (11.4) again to the phase-space of the subsystem and to the remaining one splits the phase-space into $n-1$ two-body phase-spaces of Eq. (10.3) (each in the rest-frame of its own total four-momentum) and $n-2$ mass integrals."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Counting the Variables"
 },
 {
  "type": "p",
  "text": "The $n$ momenta have combined $3n$ components, because the masses are fixed and so the energies follow from the $3n$ spatial components. The conservation of four-momentum then removes four of these components, the energy and three spatial components, so $3n-4$ variables remain [[Ref 3]]. The factorisation shows the same number: A chain of $n-1$ two-body decays needs two angles to describe each decay in its rest-frame and $n-2$ masses of the intermediate subsystems, together $2(n-1)+(n-2)=3n-4$ free variables."
 },
 {
  "type": "p",
  "text": "Among them are the three Euler angles that give the orientation of the whole event in space. If only the shape of the event matters, $3n-7$ variables remain. This holds from $n=3$ on. For $n=2$ the two angles are the orientation of the pair itself and no variable of the shape is left. Particles with spin carry helicities in addition. They are discrete labels and do not count as variables of the phase-space."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Invariants of a Decay"
 },
 {
  "type": "p",
  "text": "For $n=3$ the factorisation with the subsystem $(12)$ reads"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_3(P^\\mu;p_1^\\mu,p_2^\\mu,p_3^\\mu)=\\mathrm d\\Phi_2(p_{12}^\\mu;p_1^\\mu,p_2^\\mu)\\;\\mathrm d\\Phi_2(P^\\mu;p_{12}^\\mu,p_3^\\mu)\\;\\frac{\\mathrm ds_{12}}{2\\pi}\\tag{11.5}"
 },
 {
  "type": "p",
  "text": "Each two-body phase-space has two angles, so together with $s_{12}$ there are $5=3\\cdot3-4$ variables and without the three Euler angles of the orientation, two variables remain free. They can be chosen as the squared invariant masses $s_{12}$ and $s_{23}$, the variables of the Dalitz plot of card [[2]]; the first of which was already introduced by the factorisation of Eq. (11.4). To see how $s_{23}$ enters, we first fix the chain. For our chosen subsystem the decay chain would be $((12)3)$ or one of the equivalent permutations $((21)3)$, $(3(12))$ or $(3(21))$ of this topology, the chain $\\mathrm I$ of card [[6]]. Its rest-frames have clear names that were defined in card [[6]], $[R_0]$ for the mother and $[(12)|\\mathrm I]$ for the intermediate state $(12)_\\mathrm i$. We evaluate both two-body phase-spaces with Eq. (10.3), each in the rest-frame of its own total four-momentum. In the decay of the mother $(12)_\\mathrm i$ is the reference particle and $3_\\mathrm p$ the spectator (card [[1]]), so the angles of this decay are those of $(12)_\\mathrm i$, and the spectator flies in the opposite direction with the same momentum, i.e. $\\vec p_{12}^{[R_0]}=-\\vec p_3^{[R_0]}$. With $\\Omega_1^{[(12)|\\mathrm I]}$ the direction of the momentum $\\vec p_1^{[(12)|\\mathrm I]}$ of particle $1_{\\mathrm p}$ in the frame $[(12)|\\mathrm I]$, $\\Omega_{12}^{[R_0]}$ the direction of the momentum $\\vec p_{12}^{[R_0]}$ of $(12)_\\mathrm i$ in $[R_0]$ and the invariant mass squared $m_0^2=P^2$ this gives"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_3=\\frac{\\lvert\\vec p_1^{[(12)|\\mathrm I]}\\rvert}{16\\pi^2\\,m_{12}}\\,\\mathrm d\\Omega_1^{[(12)|\\mathrm I]}\\;\\frac{\\lvert\\vec p_{12}^{[R_0]}\\rvert}{16\\pi^2\\,m_0}\\,\\mathrm d\\Omega_{12}^{[R_0]}\\;\\frac{\\mathrm ds_{12}}{2\\pi}"
 },
 {
  "type": "p",
  "text": "which agrees with the three-body decay rate of the Review of Particle Physics [[Ref 1]]. These are the five variables, $s_{12}$ and two angles for each decay. Three of the four angles give the orientation of the whole event: the direction $\\Omega_{12}^{[R_0]}=(\\vartheta_{12}^{[R_0]},\\varphi_{12}^{[R_0]})$ and the azimuth $\\varphi_1^{[(12)|\\mathrm I]}$ of $\\Omega_1^{[(12)|\\mathrm I]}$ about the $z$ axis of the frame $[(12)|\\mathrm I]$, which points along the direction of flight of $(12)_\\mathrm i$ in $[R_0]$ (card [[6]]). Integrating over them gives $4\\pi\\cdot2\\pi=8\\pi^2$ and leaves the polar angle $\\vartheta_1^{[(12)|\\mathrm I]}$ of $1_\\mathrm p$ against this axis"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_3=\\frac{\\lvert\\vec p_1^{[(12)|\\mathrm I]}\\rvert\\,\\lvert\\vec p_{12}^{[R_0]}\\rvert}{64\\pi^3\\,m_0\\,m_{12}}\\;\\mathrm d\\cos\\vartheta_1^{[(12)|\\mathrm I]}\\,\\mathrm ds_{12}"
 },
 {
  "type": "p",
  "text": "The second invariant mass comes from a change of variables. In $[(12)|\\mathrm I]$ the squared mass $s_{23}=(p_2^\\mu+p_3^\\mu)^2$ is linear in $\\cos\\vartheta_1^{[(12)|\\mathrm I]}$"
 },
 {
  "type": "eq",
  "tex": "\\begin{aligned}s_{23}=&(p_2^\\mu\\big\\vert^{[(12)|\\mathrm I]}+p_3^\\mu\\big\\vert^{[(12)|\\mathrm I]})^2\\\\[2ex]=&m_2^2+m_3^2+2\\Big(E_2^{[(12)|\\mathrm I]}\\,E_3^{[(12)|\\mathrm I]}-\\lvert\\vec p_1^{[(12)|\\mathrm I]}\\rvert\\,\\lvert\\vec p_3^{[(12)|\\mathrm I]}\\rvert\\cos\\vartheta_1^{[(12)|\\mathrm I]}\\Big)\\end{aligned}"
 },
 {
  "type": "p",
  "text": "with $E_2^{[(12)|\\mathrm I]}$ and $E_3^{[(12)|\\mathrm I]}$ constant for a fixed $s_{12}$ and so the measure of the invariant mass squared $s_{23}$ reads"
 },
 {
  "type": "eq",
  "tex": "\\lvert\\mathrm ds_{23}\\rvert=2\\,\\lvert\\vec p_1^{[(12)|\\mathrm I]}\\rvert\\,\\lvert\\vec p_3^{[(12)|\\mathrm I]}\\rvert\\,\\lvert\\mathrm d\\cos\\vartheta_1^{[(12)|\\mathrm I]}\\rvert"
 },
 {
  "type": "p",
  "text": "Here $\\lvert\\vec p_3^{[(12)|\\mathrm I]}\\rvert=m_0\\,\\lvert\\vec p_{12}^{[R_0]}\\rvert/m_{12}$ is the momentum of the spectator $3_\\mathrm p$ in this frame. It follows from a boost along the direction of flight of $(12)_\\mathrm i$ with the velocity $\\beta=\\lvert\\vec p_{12}^{[R_0]}\\rvert/E_{12}^{[R_0]}$ and $\\gamma=E_{12}^{[R_0]}/m_{12}$, where $E_{12}^{[R_0]}$ and $E_3^{[R_0]}$ are the energies in $[R_0]$: The component of $\\vec p_3$ along this direction becomes $\\gamma\\big(-\\lvert\\vec p_{12}^{[R_0]}\\rvert-\\beta E_3^{[R_0]}\\big)=-\\lvert\\vec p_{12}^{[R_0]}\\rvert\\,(E_{12}^{[R_0]}+E_3^{[R_0]})/m_{12}$, and since the mother is at rest in $[R_0]$, $E_{12}^{[R_0]}+E_3^{[R_0]}=m_0$. Inserting $\\lvert\\mathrm d\\cos\\vartheta_1^{[(12)|\\mathrm I]}\\rvert=m_{12}\\,\\lvert\\mathrm ds_{23}\\rvert\\big/\\big(2m_0\\,\\lvert\\vec p_1^{[(12)|\\mathrm I]}\\rvert\\,\\lvert\\vec p_{12}^{[R_0]}\\rvert\\big)$ lets the two momenta and $m_{12}$ cancel. For a mother with $P^2=m_0^2$ the phase-space, integrated over the orientation, is therefore flat in the two squared masses [[Ref 1, 2]]"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_3=\\frac{\\mathrm ds_{12}\\,\\mathrm ds_{23}}{128\\pi^3\\,m_0^2}\\tag{11.6}"
 },
 {
  "type": "p",
  "text": "Equal areas of the Dalitz plot correspond to equal phase-space, so every structure in a measured Dalitz plot comes from the amplitude and not from the phase-space. The allowed region is bounded by the configurations in which two of the particles fly parallel or antiparallel to each other [[Ref 1]]. How the phase-space enters a measured distribution is described in card [[31]]."
 },
 {
  "type": "p",
  "text": "From four particles on, invariant masses are not enough. An event and its mirror image have the same invariant masses, because scalar products of four-vectors do not change under the reflection of all spatial momenta, yet in general they differ by more than a rotation. A variable that changes its sign under the reflection is therefore also needed, for example the angle between the planes of two decays of a chain."
 },
 {
  "type": "h",
  "level": 3,
  "text": "A Four-Body Example"
 },
 {
  "type": "p",
  "text": "Take a decay of a mother into four particles, in which $1_\\mathrm p$ and $2_\\mathrm p$ form the subsystem $(12)_\\mathrm i$ and which is reached by the decays $0_\\mathrm p\\to(123)_\\mathrm i+4_\\mathrm p$, $(123)_\\mathrm i\\to(12)_\\mathrm i+3_\\mathrm p$ and $(12)_\\mathrm i\\to1_\\mathrm p+2_\\mathrm p$ of [[Figure 11.1]]. Applying Eq. (11.4) with $j=3$ and then Eq. (11.5) gives three two-body phase-spaces and two mass integrals"
 },
 {
  "type": "eq",
  "tex": "\\mathrm d\\Phi_4=\\mathrm d\\Phi_2(P^\\mu;p_{123}^\\mu,p_4^\\mu)\\;\\mathrm d\\Phi_2(p_{123}^\\mu;p_{12}^\\mu,p_3^\\mu)\\;\\mathrm d\\Phi_2(p_{12}^\\mu;p_1^\\mu,p_2^\\mu)\\;\\frac{\\mathrm ds_{123}}{2\\pi}\\,\\frac{\\mathrm ds_{12}}{2\\pi}\\tag{11.7}"
 },
 {
  "type": "p",
  "text": "The three decays take place in the rest-frames $[R_0]$, $[((12)3)|\\mathrm I]$ and $[(12)|\\mathrm I]$ of card [[6]] (the chain $\\mathrm I$ with the topology $(((12)3)4)$). Each of the three two-body phase-spaces has its own angles, so there are $3\\cdot2+2=8=3\\cdot4-4$ variables and five without the orientation. The tree of the decays, with the subsystems as its nodes, is the topology of card [[17]]."
 },
 {
  "type": "fig",
  "id": "F11.1",
  "number": "11.1",
  "caption": "A decay into four particles. The subsystem $(12)_\\mathrm i$ is marked: Seen from the rest of the decay it acts as one particle with the mass $m_{12}$."
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
    "text": "The Dalitz plot of three particles."
   },
   {
    "n": 10,
    "text": "The two-body phase-space that this card puts together."
   },
   {
    "n": 17,
    "text": "The tree of the decays and its subsystems."
   },
   {
    "n": 31,
    "text": "The phase-space in a measured distribution."
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
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sects. 49.4, 49.4.3 and 49.4.5, Eqs. 49.12, 49.13, 49.22, 49.23 and 49.26).",
   "O. Skjeggestad, \"Notes on Phase Space\" (CERN, 1964), Sects. III and V, Eqs. (10), (23) and (24), and Sect. VII.",
   "K. Habermann and M. Mikhasenko, \"Wigner rotations for cascade reactions\", *Phys. Rev. D* **111**, 056015 (2025), arXiv:2409.06913, Sect. II."
  ],
  "refs": true
 }
];
