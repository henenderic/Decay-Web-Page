// FAQ page 5: How to Rotate Vectors and Coordinate Systems?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "A rotation is fixed by an axis to rotate about and an angle. In a right-handed coordinate system, a positive angle turns counter-clockwise. The three basic rotations $R_x$, $R_y$ and $R_z$ turn about the coordinate axes and rotations about different axes in three dimensions do not commute with each other. An active rotation turns a vector, a passive rotation turns the coordinate system and is described by the inverse, which is the rotation by the negative angle. On this site, vectors are turned with positive angles and coordinate systems are parametrised with negative angles."
 },
 {
  "type": "p",
  "text": "Every rotation can be written as a product of three consecutive rotations $R(\\alpha,\\beta,\\gamma)=R_z(\\alpha)\\,R_y(\\beta)\\,R_z(\\gamma)$, read from right to left. This follows from turning the axes about $z$, then about the carried $y$ axis and finally about the carried $z$ axis. The columns of the rotation matrix are the new axes. The angles $\\beta$ and $\\alpha$ are the polar angle and the azimuth of the new $z$ axis, meaning two angles are sufficient to fix a direction. The third angle $\\gamma$ turns the $x$ and $y$ axes around that direction and is defined conventionally."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Rotations About the Axes"
 },
 {
  "type": "p",
  "text": "All rotations on this site use right-handed axes. A positive angle is a right-handed turn: with the thumb along the axis, the fingers show the sense of the rotation, which is counter-clockwise as seen from the tip of the axis. The three basic rotations act on the components of a vector as"
 },
 {
  "type": "eq",
  "tex": "\\begin{aligned}\nR_x(\\alpha)&=\\begin{pmatrix}1&0&0\\\\0&\\cos\\alpha&-\\sin\\alpha\\\\0&\\sin\\alpha&\\cos\\alpha\\end{pmatrix}\\\\\nR_y(\\alpha)&=\\begin{pmatrix}\\cos\\alpha&0&\\sin\\alpha\\\\0&1&0\\\\-\\sin\\alpha&0&\\cos\\alpha\\end{pmatrix}\\\\\nR_z(\\alpha)&=\\begin{pmatrix}\\cos\\alpha&-\\sin\\alpha&0\\\\\\sin\\alpha&\\cos\\alpha&0\\\\0&0&1\\end{pmatrix}\n\\end{aligned}\\tag{5.1}"
 },
 {
  "type": "p",
  "text": "A product of rotations is read from right to left, so in $R_z(\\alpha)R_y(\\beta)$ the rotation about the $y$-axis $R_y(\\beta)$ acts first. Rotations about the same axis commute and their angles can be add, however, rotations about different axes are not commuting in three dimensions and in general $R_y(\\beta)R_z(\\alpha)\\neq R_z(\\alpha)R_y(\\beta)$, thus the ordering matters."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Active and Passive Rotations"
 },
 {
  "type": "p",
  "text": "A rotation can be used in two ways ([[Figure 5.1]]). An *active* rotation moves the vector and leaves the axes where they are: the vector $\\vec v$ becomes $R\\vec v$. A *passive* rotation on the other hand moves the coordinate system and leaves the vector where it is. If the axes are turned by $R$, the components of $\\vec v$ in the turned system are those of $R^{-1}\\vec v$ and a passive rotation is therefore described by an inverse of the rotation. The inverse of a rotation about an axis $\\hat n$ is the rotation about the same axis by the negative angle:"
 },
 {
  "type": "eq",
  "tex": "R_{\\hat n}^{-1}(\\vartheta)=R_{\\hat n}(-\\vartheta)\\tag{5.2}"
 },
 {
  "type": "fig",
  "id": "F5.1",
  "number": "5.1",
  "caption": "The same picture from an active and from a passive rotation about $z$. (a) Active: the vector $\\vec v$ is turned into $R_z(\\alpha)\\vec v$ and the axes stay. (b) Passive: the vector stays and the axes are turned by $-\\alpha$ into $x'$ and $y'$. The components of $\\vec v$ in the new axes are those of $R_z(\\alpha)\\vec v$."
 },
 {
  "type": "p",
  "text": "In this work, vectors are turned using positive angles and rotations of coordinate systems thus are parametrised with negative angles, see Eq. (5.2)."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Euler Angles"
 },
 {
  "type": "p",
  "text": "Any orientation of a set of right-handed axes can be reached from the fixed axes $x$, $y$, $z$ by three successive rotations called Euler-rotations [[Ref 1]]. Introduce a second set of axes $X$, $Y$, $Z$ that is attached to the rotated object. A rotation $R$ then carries the fixed axes over into the new ones: $X=R\\hat e_x$, $Y=R\\hat e_y$ and $Z=R\\hat e_z$."
 },
 {
  "type": "h",
  "level": 4,
  "text": "Three Rotations About Carried Axes"
 },
 {
  "type": "p",
  "text": "The new axes are reached in three steps, in which all axes are turned together ([[Figure 5.2]]). Every step is an active rotation of the axes and of everything that is attached to them."
 },
 {
  "type": "ol",
  "items": [
   "A rotation by $\\alpha$ about $z$ that carries $x$ and $y$ to the intermediate carried axes $x'$ and $y'$, and leaves $z$ in place.",
   "A rotation by $\\beta$ about the carried axis $y'$ that tilts the $z$-axis into its final direction $Z$ and also carries $x'$ to a second intermediate axis $x''$.",
   "Lastly a rotation by $\\gamma$ about $Z$, which carries $x''$ and $y'$ to the final axes $X$ and $Y$."
  ]
 },
 {
  "type": "fig",
  "id": "F5.2",
  "number": "5.2",
  "caption": "The three rotations that carry the axes $x$, $y$, $z$ to $X$, $Y$, $Z$. Step 1: $\\alpha$ about $z$. Step 2: $\\beta$ about the carried axis $y'$. Step 3: $\\gamma$ about the carried axis $Z$. The circular arrow shows the sense of each rotation."
 },
 {
  "type": "p",
  "text": "The whole rotation is, read from right to left"
 },
 {
  "type": "eq",
  "tex": "R(\\alpha,\\beta,\\gamma)=R_Z(\\gamma)\\,R_{y'}(\\beta)\\,R_z(\\alpha)\\tag{5.3}"
 },
 {
  "type": "p",
  "text": "The rotations $R_{y'}$ and $R_Z$ are not among the matrices of Eq. (5.1), because their axes depend on the earlier angles. The animation shows the three steps in motion."
 },
 {
  "type": "embed",
  "title": "Animation of the Three Rotations"
 },
 {
  "type": "h",
  "level": 4,
  "text": "From Carried Axes to Fixed Axes"
 },
 {
  "type": "p",
  "text": "To express Eq. (5.3) with the matrices of Eq. (5.1), one can use the following rule: For every rotation $Q$ and every axis $\\hat n$ a rotation $R_{\\hat n}(\\vartheta)$ about that axis can be expressed as a rotation about the rotated axis $\\hat n' = Q\\hat n$ [[Ref 1, 2]]"
 },
 {
  "type": "eq",
  "tex": "Q\\,R_{\\hat n}(\\vartheta)\\,Q^{-1}=R_{Q\\hat n}(\\vartheta)\\tag{5.4}"
 },
 {
  "type": "p",
  "text": "Indeed, the left-hand side leaves the axis $Q\\hat n$ unchanged and turns the plane perpendicular to it by $\\vartheta$ in the positive sense, because $Q$ preserves lengths, angles and handedness. With $Q=R_z(\\alpha)$ and $\\hat n=\\hat e_y$, and with $Q=R_z(\\alpha)R_y(\\beta)$ and $\\hat n=\\hat e_z$, it gives"
 },
 {
  "type": "eq",
  "tex": "R_{y'}(\\beta)=R_z(\\alpha)\\,R_y(\\beta)\\,R_z^{-1}(\\alpha)\\qquad R_Z(\\gamma)=R_z(\\alpha)R_y(\\beta)\\,R_z(\\gamma)\\,R_y^{-1}(\\beta)R_z^{-1}(\\alpha)\\tag{5.5}"
 },
 {
  "type": "p",
  "text": "Inserting both into Eq. (5.3), the inner factors cancel pairwise:"
 },
 {
  "type": "eq",
  "tex": "\\begin{aligned}\nR(\\alpha,\\beta,\\gamma)&=\\big[R_z(\\alpha)R_y(\\beta)R_z(\\gamma)R_y^{-1}(\\beta)R_z^{-1}(\\alpha)\\big]\\,\\big[R_z(\\alpha)R_y(\\beta)R_z^{-1}(\\alpha)\\big]\\,R_z(\\alpha)\\\\\n&=R_z(\\alpha)\\,R_y(\\beta)\\,R_z(\\gamma)\n\\end{aligned}\\tag{5.6}"
 },
 {
  "type": "p",
  "text": "Therefore, three rotations about the carried axes $z$, $y'$ and $Z$ in the order $\\alpha$, $\\beta$, $\\gamma$ are the same as three rotations about the fixed axes $z$, $y$ and $z$ in the order $\\gamma$, $\\beta$, $\\alpha$. One notes that the order is reversed, which is no contradiction, because both still describe the same rotation, however, the two readings must not be mixed. Eq. (5.6) defines the Euler angles $\\alpha$, $\\beta$, $\\gamma$ used throughout this site."
 },
 {
  "type": "h",
  "level": 4,
  "text": "Rotation Operators"
 },
 {
  "type": "p",
  "text": "In quantum mechanics a rotation is an operator that is generated by the angular momentum operators $\\vec J$ with $[J_i,J_j]=i\\epsilon_{ijk}J_k$. A rotation by $\\vartheta$ about the axis $\\hat n$ then is written as"
 },
 {
  "type": "eq",
  "tex": "R_{\\hat n}(\\vartheta)=e^{-i\\vartheta\\,\\hat n\\cdot\\vec J}\\tag{5.7}"
 },
 {
  "type": "p",
  "text": "Using the vector representation of the angular momentum operators, Eq. (5.7) turns into the same matrices of Eq. (5.1). The operators act on the states of a quantum system, which are the subject of [[7]]. For this section, only the operators themselves are needed."
 },
 {
  "type": "p",
  "text": "Angular momentum is a vector operator: if a rotation $Q$ turns $\\hat n$ into the rotated axis $Q\\hat n$, then $Q\\,(\\hat n\\cdot\\vec J)\\,Q^{-1}=(Q\\hat n)\\cdot\\vec J$., which is the rule $Q'=RQR^\\dagger$ [[Ref 1]]. Exponentiating it gives Eq. (5.4) for operators, so the derivation above holds unchanged. With $J_{y'}=\\hat y'\\cdot\\vec J=R_z(\\alpha)\\,J_y\\,R_z^{-1}(\\alpha)$ and $J_Z=\\hat Z\\cdot\\vec J$ the chain of Eq. (5.3) reads $R=e^{-i\\gamma J_Z}e^{-i\\beta J_{y'}}e^{-i\\alpha J_z}$. The same cancellation as in Eq. (5.6) leaves"
 },
 {
  "type": "eq",
  "tex": "R(\\alpha,\\beta,\\gamma)=e^{-i\\alpha J_z}\\,e^{-i\\beta J_y}\\,e^{-i\\gamma J_z}\\tag{5.8}"
 },
 {
  "type": "p",
  "text": "This is the form from which the Wigner $D$ matrices will be built later in card [[7]]."
 },
 {
  "type": "h",
  "level": 4,
  "text": "The Rotation Matrix"
 },
 {
  "type": "p",
  "text": "Multiplying the three matrices of Eq. (5.1) gives the full Euler rotation matrix in the $y$-$z$-$y$ convention from above"
 },
 {
  "type": "eq",
  "tex": "R(\\alpha,\\beta,\\gamma)=\\begin{pmatrix}\n\\cos\\alpha\\cos\\beta\\cos\\gamma-\\sin\\alpha\\sin\\gamma&-\\cos\\alpha\\cos\\beta\\sin\\gamma-\\sin\\alpha\\cos\\gamma&\\cos\\alpha\\sin\\beta\\\\\n\\sin\\alpha\\cos\\beta\\cos\\gamma+\\cos\\alpha\\sin\\gamma&-\\sin\\alpha\\cos\\beta\\sin\\gamma+\\cos\\alpha\\cos\\gamma&\\sin\\alpha\\sin\\beta\\\\\n-\\sin\\beta\\cos\\gamma&\\sin\\beta\\sin\\gamma&\\cos\\beta\n\\end{pmatrix}\\tag{5.9}"
 },
 {
  "type": "p",
  "text": "Its columns give the new axes written in the components of the old ones: the $j$-th column is the vector $\\hat E_j$ with $\\hat E_1=X$, $\\hat E_2=Y$, $\\hat E_3=Z$, the components then can be written as $R_{ij}=\\hat e_i\\cdot \\hat E_j$ [[Ref 1]] and a vector $\\vec v$ has the components $\\hat E_j\\cdot\\vec v=(R^{\\mathrm T}\\vec v)_j$ along the new axes. The coordinates in the rotated system therefore follow from $R^{\\mathrm T}=R^{-1}$, which is the rule for passive rotations of the previous section."
 },
 {
  "type": "h",
  "level": 3,
  "text": "What the Three Angles Do"
 },
 {
  "type": "p",
  "text": "The three angles of Eq. (5.6) play different roles: Two of them fix a direction and the third one turns the axes about it. This section shows that the third one leaves the new $z$ axis in place and why this leaves a freedom that has to be fixed by a convention."
 },
 {
  "type": "h",
  "level": 4,
  "text": "The Third Angle Leaves the New $z$ Axis in Place"
 },
 {
  "type": "p",
  "text": "The rotation $R$ carries the three axes into $X=R\\hat e_x$, $Y=R\\hat e_y$ and $Z=R\\hat e_z$. The first rotation $R_z(\\gamma)$ rotates about the $z$-axis, which means it does not affect the unit vector $\\hat e_z$ in $z$-direction"
 },
 {
  "type": "eq",
  "tex": "Z=R(\\alpha,\\beta,\\gamma)\\,\\hat e_z=R_z(\\alpha)\\,R_y(\\beta)\\,\\hat e_z=\\begin{pmatrix}\\sin\\beta\\cos\\alpha\\\\\\sin\\beta\\sin\\alpha\\\\\\cos\\beta\\end{pmatrix}\\tag{5.10}"
 },
 {
  "type": "p",
  "text": "wich means also means that the new $z$ axis points to a direction that depends on an azimuth $\\alpha$ and polar angle $\\beta$ only."
 },
 {
  "type": "p",
  "text": "The other two axes $X$ and $Y$ do depend on $\\gamma$, as the first two columns of Eq. (5.9) show."
 },
 {
  "type": "h",
  "level": 4,
  "text": "The Greenwich Problem"
 },
 {
  "type": "p",
  "text": "The direction of $Z$ only fixes the plane perpendicular to it, not where $X$ and $Y$ point within this plane. The angle $\\gamma$ turns them about $Z$ and has to be chosen separately. This is the same problem as the zero of the longitude on Earth: The axis of the Earth fixes the latitudes, but not where the longitude zero lies, which needs to be decided by convention, the meridian of Greenwich. For this reason the missing azimuthal zero around a given direction is called the Greenwich- or meridian problem. In principle this could mean, such an angle can be chosen arbitrarily, which under certain circumstances is true to some extent, however, as we will see later, such a free choice is not suitable for descriptions including the particle production ([[21]] and [[22]])."
 },
 {
  "type": "h",
  "level": 4,
  "text": "Choosing the Third Angle"
 },
 {
  "type": "p",
  "text": "Which value is used is a convention. For a three-body final state, for example, the three Euler angles give the orientation of the final-state system: two fix the direction of one particle and the third one can be set as the azimuth of a second particle around the first [[Ref 3]]. For the angles of a single decay two conventions are common: $\\gamma=0$ (the helicity convention) and $\\gamma=-\\alpha$ (the minus-phi convention of Jacob and Wick). They are equivalent, but the extra rotation changes the azimuths in the daughter frames [[Ref 4]]. The amplitude of [[1]] uses $\\gamma=0$ for the angles of a decay. The conventions that two programs must agree on are collected in [[32]]. The letters $(\\alpha,\\beta,\\gamma)$ stand for a general rotation. The pair $(\\varphi,\\vartheta)$ is kept for the direction of a decay product."
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
    "text": "The rotation that points the $z$ axis along the flight direction."
   },
   {
    "n": 7,
    "text": "How the rotations act on states and what the third angle does to them."
   },
   {
    "n": 18,
    "text": "The decay angles of a vertex."
   },
   {
    "n": 20,
    "text": "The axes of the production and of the decay."
   },
   {
    "n": 21,
    "text": "How the density matrix behaves under rotations."
   },
   {
    "n": 22,
    "text": "What fixes the remaining angle."
   },
   {
    "n": 27,
    "text": "The angles of every decay, read from the momenta."
   },
   {
    "n": 29,
    "text": "The rotation between the spin bases of two chains."
   },
   {
    "n": 32,
    "text": "The choice of the third angle as one of the conventions."
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
   "J. D. Richman, \"An experimenter's guide to the helicity formalism\", Caltech report CALT-68-1148 (1984), Sects. 2.1 and 2.2.1.",
   "J. J. Sakurai and J. Napolitano, *Modern Quantum Mechanics*, 3rd ed. (Cambridge University Press, 2020), Sect. 3.3.3.",
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sect. 49.4.3).",
   "K. Habermann and M. Mikhasenko, \"Wigner rotations for cascade reactions\", *Phys. Rev. D* **111**, 056015 (2025), arXiv:2409.06913, Sect. VI."
  ],
  "refs": true
 }
];
