// FAQ page 2: How Does a Collision Become a Decay Event?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "Two particles are brought to collision at high energy, either as two opposite beams (a **collider**) or as a moving beam on a target at rest (a **fixed target**). In the laboratory frame these are different processes, but the scattering is calculated in the **centre-of-momentum frame**. There both layouts are found to be the same problem. In an inelastic collision heavy, short-lived particles are produced. Resonances that decay by the strong interaction decay at the place of their production, while weakly decaying heavy hadrons decay after a resolvable distance from their production vertex."
 },
 {
  "type": "p",
  "text": "A detector sees then only the \"stable\" decay products. Which mother decayed follows from an analysis, for example from the measured distribution of invariant masses. The whole process is a scattering reaction overall described through the scattering matrix $S$. The decay is only one part of its $T$ matrix. An **amplitude analysis** then looks for the model that appropriately explains the measured distribution of decay products."
 },
 {
  "type": "h",
  "level": 3,
  "text": "From Beam to Collision"
 },
 {
  "type": "p",
  "text": "Every decay that is analysed is preceded by the collision of particles in an accelerator. Charged particles are brought to high energies, in bunches that form a beam and made to collide in the region of a detector, either with a second beam or with a target at rest. In a collider experiment two beams are accelerated in opposite directions and collide head-on. Opposite to that, in a fixed-target experiment only a single beam is accelerated and fired at a target at rest ([[Figure 2.1]])."
 },
 {
  "type": "p",
  "text": "Examples of colliders are the experiments ALICE [[Ref 1]], ATLAS [[Ref 2]], CMS [[Ref 3]] and LHCb [[Ref 4]] at the LHC, which collides protons or lead nuclei, and BESIII [[Ref 5]] at BEPCII and Belle II [[Ref 6]] at SuperKEKB, which collide electrons and positrons. Examples of fixed-target experiments are AMBER [[Ref 7]] and COMPASS [[Ref 8]] at CERN with hadron beams, GlueX [[Ref 9]] at Jefferson Lab with a photon beam, and HADES [[Ref 10]] at GSI with proton, pion and heavy-ion beams."
 },
 {
  "type": "fig",
  "id": "F2.1",
  "number": "2.1",
  "caption": "Two collisions that produce particles in a scattering reaction. (a) Collider: a proton–proton collision produces a $\\Lambda_b^0$ baryon and further particles. The sketch is schematic. (b) Fixed target: a proton beam on a proton at rest produces a proton and a $\\Delta^+$ baryon. The momenta in (b) follow two-body kinematics. In addition (a) can also be seen as a fixed-target collision that is brought to the center-of-momentum frame, while (b) is the \"view\" of one of the particles accelerated towards another."
 },
 {
  "type": "fold",
  "title": "Collider and Fixed Target Compared",
  "blocks": [
   {
    "type": "p",
    "text": "In the laboratory frame, the two layouts are obviously different: at a collider two moving particles meet, at a fixed target a moving particle hits one at rest. What counts for the reaction is the energy in the centre-of-momentum frame, $\\sqrt s$, where $s=P^\\mu P_\\mu$ is the square of the total four-momentum $P^\\mu$ of the two initial particles (the Mandelstam variable $s$ of card [[4]]). Take two particles of the same mass $m$. The following relations are standard kinematics [[Ref 11]]."
   },
   {
    "type": "p",
    "text": "At a collider with two beams of opposite momenta of magnitude $q$ the total energy is the sum of the two energies and the momenta cancel:"
   },
   {
    "type": "eq",
    "tex": "s=4\\,(m^2+q^2)\\tag{2.1}"
   },
   {
    "type": "p",
    "text": "At a fixed target a beam particle with the momentum $p$ hits a particle at rest:"
   },
   {
    "type": "eq",
    "tex": "s=2m^2+2m\\sqrt{m^2+p^2}\\tag{2.2}"
   },
   {
    "type": "p",
    "text": "The same $s$ requires"
   },
   {
    "type": "eq",
    "tex": "p=2\\,\\frac{q}{m}\\,\\sqrt{m^2+q^2}\\tag{2.3}"
   },
   {
    "type": "p",
    "text": "which for $q\\gg m$ is about $2q^2/m$. A single beam particle must therefore be accelerated much more strongly than each of the two particles at a collider to reach the same energy."
   },
   {
    "type": "p",
    "text": "Nevertheless the principle is the same as soon as one changes to the centre-of-momentum frame. There both particles have the momenta $\\pm\\vec q$ and the total energy $\\sqrt s$. The scattering is calculated there. The two layouts differ only by a boost into the laboratory frame. At a fixed target the reaction products move strongly forward. Eqs. (2.1) to (2.3) hold for particles of equal mass and, at the collider, equal beam momenta. For other masses or momenta the formulas change, not the statement."
   }
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "Production and Decay"
 },
 {
  "type": "p",
  "text": "In the collision, new particles are produced at the **production vertex**. Heavy, short-lived particles cover only a short distance from their place of production before they decay into further particles. Resonances that decay by the strong interaction live so briefly that their decay point cannot be told from the production point. Heavy hadrons such as the $\\Lambda_b^0$ and the $B$ and $D$ mesons decay weakly and fly a distance that can be resolved, so that their **decay vertex** can be separated from the production vertex ([[Figure 2.2]]). The lifetimes of particles are listed in [[Ref 12]]. The mother itself is usually not seen. What is measured are the tracks of its decay products."
 },
 {
  "type": "fig",
  "id": "F2.2",
  "number": "2.2",
  "caption": "A sketch of a measured event: the production vertex, where the collision happens and the mother is produced, the decay vertex, where the mother decays, and the tracks of the decay products in the detector."
 },
 {
  "type": "h",
  "level": 3,
  "text": "What the Detector Sees"
 },
 {
  "type": "p",
  "text": "Only a part of the true interaction is actually measureable. A detector surrounds the collision point in layers: a tracking detector in a magnetic field, detectors that help to identify the particle type, calorimeters and muon detectors [[Ref 13]]. The curvature of a track in this magnetic field gives the momentum of a charged particle and also sign of its charge helping with its identification. The particle type follows from the signals in the different layers, for example the energy loss in the tracker, the time of flight, Cherenkov light and the energy deposited in the calorimeters. Electrons and photons are stopped in the electromagnetic calorimeter, hadrons in the hadronic calorimeter, and muons pass through both and are detected in the muon detectors outside. Neutrinos cannot be seen directly and their presence follows from missing momentum [[Ref 13]]. A **trigger** selects which collisions are stored. The detectors of the experiments named above differ in their design. Their own descriptions are found in [[Ref 1-10]]. As an example of a detailed description of one detector see [[Ref 14]]. An overview of the detector techniques is given in [[Ref 15]]."
 },
 {
  "type": "p",
  "text": "Only the \"**stable**\" particles that can actually make it to the detectors thus will be measured, that is, particles that decay (far) outside the detector. Typically these are pions, kaons, protons, electrons, muons and photons. Long-lived neutral particles can only be measured partly by most detectors. However, particles that decay inside the detector can be reconstructed from their decay products."
 },
 {
  "type": "h",
  "level": 3,
  "text": "From Tracks to a Decay"
 },
 {
  "type": "p",
  "text": "An **event** consists of many tracks and energy deposits. They are combined into a picture: the tracks are fitted in order to find production- and decay vertices and then the particles are assigned to a mother that was possibly produced in the scattering. From the measured four-momenta $p_i^\\mu$ of a group of particles one calculates their **invariant mass** ($m^2=P^\\mu P_\\mu$ with $P^\\mu=\\sum_i p_i^\\mu$) and the momentum of the mother. If the group is the complete set of decay products of one mother, its invariant mass is the mass of the mother. The distribution of all calculated invariant masses accumulates at the masses of the mother and of the resonances. Particles that cannot be assigned form the **background** in the data. The variables that describe such an event are explained in [[11]]."
 },
 {
  "type": "fold",
  "title": "How the Mother and the Resonances Are Found - The Dalitz Plot",
  "blocks": [
   {
    "type": "p",
    "text": "For a decay into three particles two variables are enough to describe the kinematics of the decay. In a **Dalitz plot** one plots the squares of two pair invariant masses, for example $m_{12}^2$ and $m_{23}^2$, where $m_{12}$ is the invariant mass of the particles $1_\\mathrm p$ and $2_\\mathrm p$ ([[Figure 2.3]]). The plot goes back to Dalitz [[Ref 16]] and is treated in textbooks [[Ref 17]] and in the kinematics review of the Particle Data Group [[Ref 11]]."
   },
   {
    "type": "eq",
    "tex": "m_{12}^2 = (E_1 + E_2)^2 - (\\vec{p}_1 + \\vec{p}_2)^2 = (m_0 - E_3)^2 - \\vec{p}_3 = m_0^2 + m_3^2 - 2 m_0 E_3"
   },
   {
    "type": "p",
    "text": "Energy and momentum conservation limit the allowed region to a bounded area in phase-space. If the matrix elements were constant, the events would fill this area evenly. However, a resonance in a pair of particles appears as a line at $m_{ij}^2=m_R^2$ with an increased density of events in this plot, showcasing a certain possible resonance within the kinematics. Deviations from an even distribution show the dynamics of the decay. The shape of the bands is the subject of [[24]]."
   },
   {
    "type": "fig",
    "id": "F2.3",
    "number": "2.3",
    "caption": "A schematic Dalitz plot: the allowed region, evenly filled, with one band for a resonance in each of the three pair systems."
   }
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Process as a Scattering Reaction"
 },
 {
  "type": "p",
  "text": "The whole process of particle collision and subsequent decay is called a **scattering reaction** and is of the form"
 },
 {
  "type": "eq",
  "tex": "A_\\mathrm p+B_\\mathrm p\\to1_\\mathrm p+\\dots+n_\\mathrm p+X"
 },
 {
  "type": "p",
  "text": "where $X$ stands for all further particles that do not matter to the analysis. Also, some of the beam particles will not take part in the reaction and fly on and appear in the final state as well. In scattering theory the transition from the initial to the final state is described by the $S$ matrix. We only quote the result,"
 },
 {
  "type": "eq",
  "tex": "S=\\one-i\\,2\\pi\\,\\delta(E_f-E_i)\\,T\\tag{2.4}"
 },
 {
  "type": "p",
  "text": "where $\\one$ describes initial particles that did not partake in any scattering that chaged its configurations and are found in the final state again and $T$ describes the actual inelastic scattering reaction that is able to produce a final state different to the incoming particle state. The $\\delta$-function ensures energy conservation. The decay that we are interested in is a part of $T$. [[13]] explains the $S$ and $T$ matrices and [[3]] shows how the parts of $T$ are drawn."
 },
 {
  "type": "fold",
  "title": "From the S Matrix to the Matrix Element",
  "blocks": [
   {
    "type": "p",
    "text": "The transition between an initial state $\\vert i\\rangle$ and a final state $\\vert f\\rangle$ defines the **matrix element** $\\mathcal M_{fi}$:"
   },
   {
    "type": "eq",
    "tex": "\\langle f|S-\\one|i\\rangle=-i\\,(2\\pi)^4\\,\\delta^4\\big(P_f^\\mu-P_i^\\mu\\big)\\,\\mathcal M_{fi}\\tag{2.5}"
   },
   {
    "type": "p",
    "text": "Four-momentum conservation stands in the $\\delta$-function. The matrix element $\\mathcal M$ is the object that all later questions work with. Some texts, for example the Review of Particle Physics [[Ref 11]], use the opposite sign. [[15]] explains how Eq. (2.5) follows from Eq. (2.4) and fixes the sign convention."
   }
  ]
 },
 {
  "type": "h",
  "level": 3,
  "text": "What an Amplitude Analysis Adds"
 },
 {
  "type": "p",
  "text": "The distributions of the invariant masses and of the angles of the decay products are compared with a model, the amplitude described in [[1]]. The parameters of the model are fitted to the data. The masses, widths, spins and parities of the resonances are read off from the fitted model. [[30]] shows how all parts of the model form the full amplitude and [[31]] shows how it becomes an intensity and a fit."
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
    "n": 3,
    "text": "How the decay is drawn."
   },
   {
    "n": 11,
    "text": "The variables of an event."
   },
   {
    "n": 13,
    "text": "Where Eq. (2.4) comes from."
   },
   {
    "n": 24,
    "text": "The shape of the resonance bands."
   },
   {
    "n": 30,
    "text": "The model that is compared with the data."
   },
   {
    "n": 31,
    "text": "From the model to the measured distribution."
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
   "ALICE experiment, detector page, https://alice.cern/experiment",
   "ATLAS experiment, detector page, https://atlas.cern/index%2ephp/Discover/Detector",
   "CMS experiment, detector page, https://cms.cern/detector",
   "LHCb experiment, detector page, https://lhcb-outreach.web.cern.ch/detector/",
   "The BESIII Collaboration, \"Design and construction of the BESIII detector\", *Nucl. Instrum. Methods A* **614**, 345 (2010), arXiv:0911.4960.",
   "Belle II experiment at SuperKEKB, detector page, https://www.belle2.org/about_us/belle_ii_detector/",
   "B. Ketzer and M. Chiosso (for the AMBER Collaboration), \"AMBER: A Strong-Interaction Facility at CERN\", arXiv:2601.06570.",
   "COMPASS experiment, https://wwwcompass.cern.ch",
   "S. Adhikari et al. (GlueX Collaboration), \"The GlueX Beamline and Detector\", *Nucl. Instrum. Methods A* **987**, 164807 (2021), arXiv:2005.14272.",
   "HADES experiment, https://hades.gsi.de/node/40",
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Eqs. 49.2, 49.3 and 49.8).",
   "Particle Data Group, PDG Live, https://pdglive.lbl.gov",
   "M. Thomson, *Modern Particle Physics* (Cambridge University Press, 2013), Sect. 1.3.",
   "The LHCb Collaboration, \"The LHCb Detector at the LHC\", *JINST* **3** S08005 (2008).",
   "Particle Data Group, *Review of Particle Physics*, \"Particle Detectors at Accelerators\".",
   "R. H. Dalitz, *Phil. Mag.* **44**, 1068 (1953).",
   "A. Bettini, *Introduction to Elementary Particle Physics*, 2nd ed. (Cambridge University Press, 2014), Sect. 4.3."
  ],
  "refs": true
 }
];
