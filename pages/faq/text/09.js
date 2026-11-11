// FAQ page 9: How to Describe Two-Particle Systems?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "A system of two distinguishable particles $a_{\\mathrm p}$ and $b_{\\mathrm p}$ is described by the tensor product of their one-particle states introduced in card [[8]]. A state with definite momenta and helicities then has the norm that is the product of the two single-particle norms and the completeness relation thus is also the product of the two relations. Instead of using both momenta, one uses the **total momentum** $P^\\mu=p_a^\\mu+p_b^\\mu$ and the **relative momentum** $q^\\mu$, which is orthogonal to it. In the rest-frame of the pair, the total momentum is zero and the relative momentum then describes $\\vec q=\\vec p_a=-\\vec p_b$ and its magnitude is fixed by the invariant mass of the pair through the Källén function. Only its direction is free. The state with the momenta $\\vec p_a$ and $\\vec p_b$ and the state with the total and relative momentum are the same state with different labels. The Jacobian of this change of variables is one in the rest-frame of the pair, where the norm splits into one norm of the total momentum and one of the relative momentum. In this frame the pair state can also be written as a product of a state of the four-momentum and a state of the direction, with a factor in front that card [[10]] identifies with the density of the two-body phase-space. The two helicities form the **helicity pair** $(\\lambda_a\\lambda_b)$ and the difference $\\lambda_a-\\lambda_b$ is the projection of the spin of the pair on the direction of flight of $a_{\\mathrm p}$. An intermediate state that decays into two particles is such a pair with a mass that changes from event to event, so it is off-shell. Its squared invariant mass lies between the threshold of the two particles and an upper bound set by the mother."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Two Particles as a Tensor Product"
 },
 {
  "type": "p",
  "text": "A state of two distinguishable particles with positive masses lives in the product of their one-particle spaces. A state of definite momenta and helicities is the product of the one-particle states of card [[7]]"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec p_a,\\vec p_b;\\lambda_a\\lambda_b\\rangle^{[F]}=\\vert\\vec p_a;j_a,\\lambda_a\\rangle^{[F]}\\otimes\\vert\\vec p_b;j_b,\\lambda_b\\rangle^{[F]}\\tag{9.1}"
 },
 {
  "type": "p",
  "text": "Both factors are taken in the same frame $[F]$. The label of a ket or bra names the frame in which it is defined and the momenta inside it are the momenta in this frame. The factors are normalised as in Eq. (8.1), so the scalar product of two such states is the product of two scalar products [[Ref 1]]"
 },
 {
  "type": "eq",
  "tex": "{}^{[F]}\\langle\\vec p_a\\,',\\vec p_b\\,';\\lambda_a'\\lambda_b'\\vert\\vec p_a,\\vec p_b;\\lambda_a\\lambda_b\\rangle^{[F]}=(2\\pi)^6\\,4E_a^{[F]}E_b^{[F]}\\,\\delta^3(\\vec p_a^{\\prime[F]}-\\vec p_a^{[F]})\\,\\delta^3(\\vec p_b^{\\prime[F]}-\\vec p_b^{[F]})\\,\\delta_{\\lambda_a^{\\prime[F]}\\lambda_a^{[F]}}\\delta_{\\lambda_b^{\\prime[F]}\\lambda_b^{[F]}}\\tag{9.2}"
 },
 {
  "type": "p",
  "text": "with the energy $E_a^{[F]}=\\sqrt{\\vec p_a^{\\,2}+m_a^2}$ in $[F]$ and $E_b^{[F]}$ likewise for $b_{\\mathrm p}$. The completeness relation of Eq. (8.3) holds for each particle, so for the pair it is the product with a sum over the helicities of both"
 },
 {
  "type": "eq",
  "tex": "\\one=\\sum_{\\lambda_a\\lambda_b}\\int\\frac{\\mathrm d^3p_a\\,\\mathrm d^3p_b}{(2\\pi)^6\\,4E_a^{[F]}E_b^{[F]}}\\,\\vert\\vec p_a,\\vec p_b;\\lambda_a\\lambda_b\\rangle^{[F]}\\,{}^{[F]}\\langle\\vec p_a,\\vec p_b;\\lambda_a\\lambda_b\\vert\\tag{9.3}"
 },
 {
  "type": "p",
  "text": "Both relations have the same value in every frame, as the one-particle relations do. For identical particles the state has to be symmetrised. This is not covered here and is discussed in card [[33]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Two Mass Shells in One Picture"
 },
 {
  "type": "p",
  "text": "Each of the two particles is on its own mass shell, as in card [[4]], so the pair has $3+3$ free momentum components. The pair as a whole has no fixed mass. Its four-momentum is the sum of the two and the square of this sum is the squared invariant mass of the pair, which depends on the two momenta. [[Figure 9.1]] shows this for motion along $z$ only."
 },
 {
  "type": "fig",
  "id": "F9.1",
  "number": "9.1",
  "caption": "Two mass shells in one picture, for motion along $z$. (a) The energy $E_a^{[F]}=\\sqrt{p_{a,z}^2+m_a^2}$ in a frame $[F]$ of the particle $a_{\\mathrm p}$ over its momentum, with a vector to a point of the hyperbola and a cross at rest. (b) The same for $b_{\\mathrm p}$ with the mass $m_b$. (c) The energy $E_a^{[F]}+E_b^{[F]}$ of the pair over the two momenta $p_{a,z}$ and $p_{b,z}$. Its lowest point is the threshold $m_a+m_b$, where both particles are at rest. Points of this surface lie on the hyperbolas of (a) and (b) and have different values of $P^2$, so the surface is not a mass shell of the pair."
 },
 {
  "type": "p",
  "text": "In panel (c) the point at which both particles are at rest has the energy $m_a+m_b$ and no state of the pair has a smaller one. Every other point has its own value of $P^2$, since both the energy and the total momentum change from point to point."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Total and Relative Momentum"
 },
 {
  "type": "p",
  "text": "The pair is equally well described by the total momentum and by a second four-vector, the relative momentum"
 },
 {
  "type": "eq",
  "tex": "P^\\mu=p_a^\\mu+p_b^\\mu\\qquad q^\\mu=\\frac12\\big(p_a^\\mu-p_b^\\mu\\big)-\\frac{m_a^2-m_b^2}{2P^2}\\,P^\\mu\\tag{9.4}"
 },
 {
  "type": "p",
  "text": "The second term of $q^\\mu$ makes it orthogonal to $P^\\mu$: because $P_\\mu\\big(p_a^\\mu-p_b^\\mu\\big)=p_a^\\mu p_{a,\\mu}-p_b^\\mu p_{b,\\mu}=m_a^2-m_b^2$, we find $P_\\mu q^\\mu=\\tfrac12(m_a^2-m_b^2)-\\tfrac12(m_a^2-m_b^2)=0$."
 },
 {
  "type": "p",
  "text": "In the rest-frame $[R]$ of the pair, the total four momentum will be $P^\\mu\\big|^{[R]}=(E_R,\\vec 0)$ with the total energy $E^{[R]}=\\sqrt{P^2}=\\sqrt{s}$, which is the invariant mass. In this frame the energies are written with a subscript $R$ instead of the superscript $[R]$, for the total energy as $E^{[R]}=E_R$ and for the single particles as $E_a^{[R]}=E_{a,R}$ and $E_b^{[R]}=E_{b,R}$ for simplicity reasons. Within states, whose frame is given by a superscript to the state, this index is suppressed. Using the orthogonality of the scalar product, $P_\\mu q^\\mu=E_R\\,q^0\\big|^{[R]}=0$ gives $q^0\\big|^{[R]}=0$. The three-momenta of the two particles are opposite in the rest-frame, i.e. $\\vec p_a^{[R]}+\\vec p_b^{[R]}=\\vec 0$ and so the spatial part of the relative four-momentum vector $q^\\mu\\big|^{[R]}$ is defined as the rest-frame transformed momentum $\\vec p_a^{[R]}$ of the reference particle $a_{\\mathrm p}$"
 },
 {
  "type": "eq",
  "tex": "\\begin{align}P^\\mu\\big|^{[R]}&=(E_R,\\vec 0)&&\\text{with}&E_R&=E_{a,R}+E_{b,R}\\\\[3ex] q^\\mu\\big|^{[R]}&=(0,\\vec q_R)&&\\text{with}&\\vec q_R&=\\vec p_a^{[R]}=-\\vec p_b^{[R]}\\end{align}\\tag{9.5}"
 },
 {
  "type": "p",
  "text": "Exchanging the two particles reverses the sign of $q^\\mu$, so the first particle has to be the one that is named $a_{\\mathrm p}$, the reference particle of card [[1]]. [[Figure 9.2]] shows the rest-frame $[R]$ of the pair."
 },
 {
  "type": "fig",
  "id": "F9.2",
  "number": "9.2",
  "caption": "The pair in its rest-frame $[R]$. The particle $a_{\\mathrm p}$ moves along $\\vec q_R$ and $b_{\\mathrm p}$ along $-\\vec q_R$. The direction of $\\vec q_R$ is given by the polar angle $\\vartheta$ and the azimuth $\\varphi$. The shaded plane is the $xy$ plane."
 },
 {
  "type": "p",
  "text": "A change of variables does not change the state, only the label it carries. The state with the momenta $\\vec p_a$ and $\\vec p_b$ and the state with the total and the relative momentum, taken as the spatial components of $P^\\mu$ and $q^\\mu$ in the same frame $[F]$, are the same state"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec p_a,\\vec p_b;\\lambda_a\\lambda_b\\rangle^{[F]}=\\vert\\vec P,\\vec q;\\lambda_a\\lambda_b\\rangle^{[F]}\\tag{9.6}"
 },
 {
  "type": "p",
  "text": "In the rest-frame $[R]$ of the pair $\\vec P^{[R]}=\\vec 0$ and with Eq. (9.5) this reads $\\vert\\vec p_a=\\vec q,\\vec p_b=-\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\vert\\vec P=\\vec 0,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}$."
 },
 {
  "type": "p",
  "text": "By counting the free variables of the two-particle state we find that previously there were six (three variables for each momentum vector $\\vec p_a$ and $\\vec p_b$). After changing to total- and relative momentum we have four components of $P^\\mu$, thus two more are free. These two are the angles $\\Omega=(\\vartheta,\\varphi)$ of the relative momentum $\\vec q_R$ in the rest-frame $[R]$, because the next chapter shows that its magnitude already follows from the invariant total mass $P^2$."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Magnitude of the Relative Momentum"
 },
 {
  "type": "p",
  "text": "In the rest-frame $[R]$, the energy of the pair is the sum of the two energies, $E_R=\\sqrt s=E_{a,R}+E_{b,R}$, with the invariant mass $\\sqrt s$ of card [[4]] and with $E_{a,R}=\\sqrt{q_R^2+m_a^2}$ and $E_{b,R}=\\sqrt{q_R^2+m_b^2}$, and $q^{[R]}=q_R=\\lvert\\vec q_R\\rvert$ the magnitude of the relative momentum $\\vec q_R$. This condition fixes $q_R$ for a given $s$, because both energies grow with $q_R$. The aim is to solve it for $q_R$, which is done in two steps. First, $E_{a,R}$ is expressed by $s$ and the masses alone. For this, the energy of $b_{\\mathrm p}$ is put on one side, $\\sqrt s-E_{a,R}=E_{b,R}$ and both sides are squared in order to remove the square root in the definition of the particle energies, revealing bare $q_R$"
 },
 {
  "type": "eq",
  "tex": "s-2\\sqrt s\\,E_{a,R}+\\big(E_{a,R}\\big)^2=\\big(E_{b,R}\\big)^2"
 },
 {
  "type": "p",
  "text": "Inserting $\\big(E_{i,R}\\big)^2=q_R^2+m_i^2$ for the two particles, the term $q_R^2$ appears on both sides and cancels, which leaves $s-2\\sqrt s\\,E_{a,R}+m_a^2=m_b^2$. This equation is linear in the energy $E_{a,R}$ of particle $q_{\\mathrm p}$ and can be solved for it. Second, $q_R$ follows again from the definition of the energy, $q_R^2=\\big(E_{a,R}\\big)^2-m_a^2$"
 },
 {
  "type": "eq",
  "tex": "E_{a,R}=\\frac{s+m_a^2-m_b^2}{2\\sqrt s}\\qquad q_R^2=\\big(E_{a,R}\\big)^2-m_a^2=\\frac{\\big(s+m_a^2-m_b^2\\big)^2-4s\\,m_a^2}{4s}"
 },
 {
  "type": "p",
  "text": "The numerator can be shown to be the Källén function $\\lambda(x,y,z)=x^2+y^2+z^2-2xy-2xz-2yz$ with $x=s$, $y=m_a^2$ and $z=m_b^2$ [[Ref 2]]"
 },
 {
  "type": "eq",
  "tex": "q_R=\\frac{\\sqrt{\\lambda(s,m_a^2,m_b^2)}}{2\\sqrt s}\\tag{9.7}"
 },
 {
  "type": "p",
  "text": "The function $\\lambda(x,y,z)$ is symmetric in its three arguments and it should not be confused with a helicity despite their similar naming. It factorises as $\\lambda(s,m_a^2,m_b^2)=\\big(s-(m_a+m_b)^2\\big)\\big(s-(m_a-m_b)^2\\big)$, meaning $q_R$ is real above the threshold $\\sqrt s\\ge m_a+m_b$ and vanishes at it. Since $s=P^2$ has the same value in every frame (card [[4]]), so has the magnitude $q_R$ through Eq. (9.7). For a given $P^\\mu$ the magnitude $q_R$ is therefore fixed and only the direction $\\Omega$ of $\\vec q_R$ is free."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Helicity Pair"
 },
 {
  "type": "p",
  "text": "The spin projections of the two particles are labelled by their helicities, each measured on the direction of flight of that particle. In the rest-frame $[R]$ of the pair, the state with $\\vec P=\\vec 0$ and the relative momentum $\\vec q$ along the direction $(\\varphi,\\vartheta)$ is built from the two rest states of card [[7]], which are defined in the rest-frames $[R_a]$ of $a_{\\mathrm p}$ and $[R_b]$ of $b_{\\mathrm p}$"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec P=\\vec 0,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=U\\big(R(\\varphi,\\vartheta,0)\\big)\\Big[U\\big(B_z(\\eta_a)\\big)\\vert\\vec 0,j_a,\\lambda_a\\rangle^{[R_a]}\\otimes U\\big(R_y(\\pi)\\,B_z(\\eta_b)\\big)\\vert\\vec 0,j_b,\\lambda_b\\rangle^{[R_b]}\\Big]\\tag{9.8}"
 },
 {
  "type": "p",
  "text": "where $\\cosh\\eta_i=E_{i,R}/m_i$ and $\\sinh\\eta_i=q_R/m_i$ for $i=a,b$ [[Ref 3]]. The particles get the proper momentum by a boost in $z$-direction and both particles are then turned by the same rotation $R(\\varphi,\\vartheta,0)$ into the direction of $\\vec q$. The particle $b_{\\mathrm p}$ additionally is turned by a rotation $R_y(\\pi)$ before that alignment, so that it moves along $-z$ and, after the common rotation, along $-\\vec q$ as desired. Using the same rotation acting on both is a convention used within this guide; alternatively turning $b_{\\mathrm p}$ separately by its own angles to give the direction $-\\vec q$ gives a state that differs by a phase to this construction. The state $\\vert\\vec p_b;j_b,\\lambda_b\\rangle^{[F]}$ of $b_{\\mathrm p}$ in Eq. (9.1) is meant with the transport of Eq. (9.8), so that Eq. (9.6) holds. The phase that follows from the choice is explained in card [[18]]."
 },
 {
  "type": "p",
  "text": "The pair of helicities $(\\lambda_a\\lambda_b)$ is called the helicity pair. By Eq. (7.9), $R_y(\\pi)$ turns the projection $\\lambda_b$ of $b_{\\mathrm p}$ on $z$ into $-\\lambda_b$. Before the common rotation the total projection of the spin of the pair on $z$ is therefore $\\lambda_a-\\lambda_b$ and after it the projection on the direction of $\\vec q$, which is the direction of flight of $a_{\\mathrm p}$. There is no orbital angular momentum along $\\vec q$. The difference of the helicities, not the sum, is what enters the expansion in partial waves of card [[19]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Normalisation in Total and Relative Momentum"
 },
 {
  "type": "p",
  "text": "In any frame $[F]$, the momenta $(\\vec p_a,\\vec p_b)$ of the two particles can be replaced by total- and relative momentum $(\\vec P,\\vec q)$ [[Ref 1]]. In this derivation the components and derivatives refer to the same frame $[F]$, so that the label is omitted there. It is written again for the energies and for the vectors in the results. According to Eq. (9.4) these were"
 },
 {
  "type": "eq",
  "tex": "P_i=p_{a,i}+p_{b,i}\\qquad q_i=\\tfrac12\\big(p_{a,i}-p_{b,i}\\big)-\\kappa\\,P_i\\qquad\\kappa=\\frac{m_a^2-m_b^2}{2s}"
 },
 {
  "type": "p",
  "text": "with $s = P^2 = (E_a^{[F]} + E_b^{[F]})^2 - \\vec P^2$. The change of the volume element under this change of variables is given by the Jacobian matrix, which contains all derivatives of the new variables with respect to the old ones, $\\mathrm d^3P\\,\\mathrm d^3q=\\lvert\\det J\\rvert\\,\\mathrm d^3p_a\\,\\mathrm d^3p_b$. In blocks of $3\\times3$ entries it reads"
 },
 {
  "type": "eq",
  "tex": "J=\\frac{\\partial(\\vec P,\\vec q)}{\\partial(\\vec p_a,\\vec p_b)}=\\begin{pmatrix}\\dfrac{\\partial P_i}{\\partial p_{a,j}}&\\dfrac{\\partial P_i}{\\partial p_{b,j}}\\\\[3ex]\\dfrac{\\partial q_i}{\\partial p_{a,j}}&\\dfrac{\\partial q_i}{\\partial p_{b,j}}\\end{pmatrix}=\\begin{pmatrix}\\delta_{ij}&\\delta_{ij}\\\\[3ex]\\Big(\\tfrac12-\\kappa\\Big)\\delta_{ij}-P_i\\,\\frac{\\partial\\kappa}{\\partial p_{a,j}}&\\Big(-\\tfrac12-\\kappa\\Big)\\delta_{ij}-P_i\\,\\frac{\\partial\\kappa}{\\partial p_{b,j}}\\end{pmatrix}"
 },
 {
  "type": "p",
  "text": "The entries follow from the definitions above. Note that for the $q_i$ the derivative also acts on $\\kappa$ which depends on $(\\vec p_a,\\vec p_b)$ through $s$."
 },
 {
  "type": "p",
  "text": "The Jacobian matrix then has the form of a block matrix, with $C$ and $D$ for the two lower blocks"
 },
 {
  "type": "eq",
  "tex": "J=\\begin{pmatrix}\\one&\\one\\\\C&D\\end{pmatrix}\\qquad C_{ij}=\\frac{\\partial q_i}{\\partial p_{a,j}}\\qquad D_{ij}=\\frac{\\partial q_i}{\\partial p_{b,j}}"
 },
 {
  "type": "p",
  "text": "For a block matrix with an invertible upper left block $A$ the determinant is given by"
 },
 {
  "type": "eq",
  "tex": "\\det\\begin{pmatrix}A&B\\\\C&D\\end{pmatrix}=\\det(A)\\,\\det\\big(D-CA^{-1}B\\big)"
 },
 {
  "type": "p",
  "text": "Here the blocks $A$ and $B$ in the upper row are both $\\one$, so that"
 },
 {
  "type": "eq",
  "tex": "\\det J=\\det(\\one)\\,\\det\\big(D-C\\big)=\\det(D-C)"
 },
 {
  "type": "p",
  "text": "The elements of this matrix are"
 },
 {
  "type": "eq",
  "tex": "(D-C)_{ij}=-\\delta_{ij}-P_i\\,w_j\\qquad\\text{with}\\qquad w_j=\\frac{\\partial\\kappa}{\\partial p_{b,j}}-\\frac{\\partial\\kappa}{\\partial p_{a,j}}"
 },
 {
  "type": "p",
  "text": "And the determinant of this matrix is"
 },
 {
  "type": "eq",
  "tex": "\\det J=\\det(-\\one-\\vec P\\otimes\\vec w)=(-1)^3\\det(\\one+\\vec P\\otimes\\vec w)=-\\big(1+\\vec P\\cdot\\vec w\\big)"
 },
 {
  "type": "p",
  "text": "The vector $\\vec w$ follows from $\\partial\\kappa/\\partial p_j=-\\dfrac{m_a^2-m_b^2}{2s^2}\\,\\partial s/\\partial p_j$ and from the derivatives of $s$ using the velocities $\\vec v_i^{[F]}=\\vec p_i^{[F]}/E_i^{[F]}$"
 },
 {
  "type": "eq",
  "tex": "\\frac{\\partial s}{\\partial\\vec p_a}=2(E_a^{[F]}+E_b^{[F]})\\,\\vec v_a^{[F]}-2\\vec P^{[F]}\\qquad\\frac{\\partial s}{\\partial\\vec p_b}=2(E_a^{[F]}+E_b^{[F]})\\,\\vec v_b^{[F]}-2\\vec P^{[F]}"
 },
 {
  "type": "p",
  "text": "The terms $-2\\vec P$ are equal and drop out in the difference, which leaves"
 },
 {
  "type": "eq",
  "tex": "\\vec w=\\frac{(m_a^2-m_b^2)\\,(E_a^{[F]}+E_b^{[F]})}{s^2}\\,\\big(\\vec v_a^{[F]}-\\vec v_b^{[F]}\\big)"
 },
 {
  "type": "p",
  "text": "Hence"
 },
 {
  "type": "eq",
  "tex": "\\det J=-\\left[1+\\frac{(m_a^2-m_b^2)\\,(E_a^{[F]}+E_b^{[F]})}{s^2}\\;\\vec P^{[F]}\\cdot\\big(\\vec v_a^{[F]}-\\vec v_b^{[F]}\\big)\\right]"
 },
 {
  "type": "p",
  "text": "In case of $m_a=m_b$ the second term vanishes in every frame. For different masses it vanishes only at $\\vec P^{[F]}=\\vec 0$, so that $[F]=[R]$ is the rest-frame of the pair and there $\\lvert\\det J\\rvert=1$ so that $\\mathrm d^3p_a\\,\\mathrm d^3p_b=\\mathrm d^3P\\,\\mathrm d^3q$. In the same way the $\\delta$-functions of Eq. (9.2) transform with the inverse determinant, $\\delta^3(\\vec p_a^{\\prime[F]}-\\vec p_a^{[F]})\\,\\delta^3(\\vec p_b^{\\prime[F]}-\\vec p_b^{[F]})=\\delta^3(\\vec P^{\\prime[F]}-\\vec P^{[F]})\\,\\delta^3(\\vec q^{\\prime[F]}-\\vec q^{[F]})/\\lvert\\det J\\rvert$, so in a general frame $[F]$ the factor $4E_a^{[F]}E_b^{[F]}$ of Eq. (9.2) turns into $4E_a^{[F]}E_b^{[F]}/\\lvert\\det J\\rvert$. In the rest-frame $[R]$ of the pair, $\\vec P^{[R]}=\\vec 0$ and $\\vec q_R=\\vec p_a^{[R]}=-\\vec p_b^{[R]}$, the factor is $\\lvert\\det J\\rvert=1$ and the norm is"
 },
 {
  "type": "eq",
  "tex": "{}^{[R]}\\langle\\vec P\\,',\\vec q\\,';\\lambda_a'\\lambda_b'\\vert\\vec P,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=(2\\pi)^6\\,4E_{a,R}E_{b,R}\\,\\delta^3(\\vec P^{\\prime[R]}-\\vec P^{[R]})\\,\\delta^3(\\vec q_R^\\prime-\\vec q_R)\\,\\delta_{\\lambda_a^{\\prime[R]}\\lambda_a^{[R]}}\\delta_{\\lambda_b^{\\prime[R]}\\lambda_b^{[R]}}\\tag{9.9}"
 },
 {
  "type": "p",
  "text": "with $E_{a,R}=\\sqrt{q_R^2+m_a^2}$ and $E_{b,R}=\\sqrt{q_R^2+m_b^2}$. The given normalisation is applicable in the rest-frame of the pair only: A decay is described in the rest-frame of the decaying particle (card [[18]])."
 },
 {
  "type": "h",
  "level": 3,
  "text": "States of Total Four-Momentum and Direction of the Pair"
 },
 {
  "type": "p",
  "text": "As with the single particle state, the state of two particles can be given using energy and direction insted, which is the representation that cards [[10]] and [[18]] will also apply instead of the relative three-momentum. The steps made are equivalent to those of card [[8]], Eqs. (8.4) and (8.5) and applied now for the relative momentum, as the total energy is independent of the total momentum in the rest-frame. Within this frame $[R]$ of the pair $a_{\\mathrm p}$ and $b_{\\mathrm p}$, the norm (9.9) can be shown to be a product of the norm of $\\vec P$ and the norm of $\\vec q$, so the state will be the product of a state of the total momentum and a state of the relative momentum as well"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec P,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\vert\\vec P\\rangle^{[R]}\\otimes\\vert\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}\\tag{9.10}"
 },
 {
  "type": "p",
  "text": "The individual state normalisations are defined as"
 },
 {
  "type": "eq",
  "tex": "{}^{[R]}\\langle\\vec P\\,'\\vert\\vec P\\rangle^{[R]}=(2\\pi)^3\\,\\delta^3(\\vec P^{\\prime[R]}-\\vec P^{[R]})\\qquad{}^{[R]}\\langle\\vec q\\,';\\lambda_a'\\lambda_b'\\vert\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=(2\\pi)^3\\,4E_{a,R}E_{b,R}\\,\\delta^3(\\vec q_R^\\prime-\\vec q_R)\\,\\delta_{\\lambda_a^{\\prime[R]}\\lambda_a^{[R]}}\\delta_{\\lambda_b^{\\prime[R]}\\lambda_b^{[R]}}"
 },
 {
  "type": "p",
  "text": "Now write the $\\delta$-function of the relative momentum as in card [[8]], in spherical coordinates, i.e. $\\delta^3(\\vec q_R^\\prime-\\vec q_R)=\\frac1{q_R^2}\\,\\delta(q_R'-q_R)\\,\\delta^2(\\Omega_R^\\prime-\\Omega_R)$. The energy of the pair in this frame is $E_R=E_{a,R}+E_{b,R}=\\sqrt s$ with the individual energies $E_{i,R}=\\sqrt{q_R^2+m_i^2}$ in $[R]$ and replaces the magnitude of the relative momentum. In contrast to one particle, where $\\mathrm dE_p/\\mathrm dp=p/E_p$, both particles contribute now"
 },
 {
  "type": "eq",
  "tex": "\\frac{\\mathrm dE_R}{\\mathrm dq_R}=\\frac{q_R}{E_{a,R}}+\\frac{q_R}{E_{b,R}}=\\frac{q_RE_R}{E_{a,R}E_{b,R}}\\qquad\\text{so}\\qquad\\delta(q_R'-q_R)=\\frac{q_RE_R}{E_{a,R}E_{b,R}}\\,\\delta(E_R'-E_R)"
 },
 {
  "type": "p",
  "text": "Inserted into the norm of $\\vec q$, the factor $E_{a,R}E_{b,R}$ cancels, in the way the factor $E_p$ of one particle did in Eq. (8.4) and the normalisation becomes"
 },
 {
  "type": "eq",
  "tex": "{}^{[R]}\\langle\\vec q\\,';\\lambda_a'\\lambda_b'\\vert\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\frac{16\\pi^2\\sqrt{s}}{q_R}\\;2\\pi\\,\\delta(E_R'-E_R)\\;\\delta^2(\\Omega_R^\\prime-\\Omega_R)\\,\\delta_{\\lambda_a^{\\prime[R]}\\lambda_a^{[R]}}\\delta_{\\lambda_b^{\\prime[R]}\\lambda_b^{[R]}}\\tag{9.11}"
 },
 {
  "type": "p",
  "text": "The right-hand side is the normalisation ${}^{[R]}\\langle E'\\vert E\\rangle^{[R]}=2\\pi\\,\\delta(E_R'-E_R)$ of two energy states times the normalisation ${}^{[R]}\\langle\\Omega';\\lambda_a'\\lambda_b'\\vert\\Omega;\\lambda_a\\lambda_b\\rangle^{[R]}=\\delta^2(\\Omega_R^\\prime-\\Omega_R)\\,\\delta_{\\lambda_a^{\\prime[R]}\\lambda_a^{[R]}}\\delta_{\\lambda_b^{\\prime[R]}\\lambda_b^{[R]}}$ of two direction states, with a factor in front. This factor corresponds to $2\\pi\\cdot4\\pi/p$ of Eq. (8.4). The state of the relative momentum is therefore, as in Eq. (8.5),"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\sqrt{\\frac{16\\pi^2E_R}{q_R}}\\;\\vert E\\rangle^{[R]}\\otimes\\vert\\Omega;\\lambda_a\\lambda_b\\rangle^{[R]}\\tag{9.12}"
 },
 {
  "type": "p",
  "text": "Finally, the state of the total momentum and the energy $E_R$ of the pair together are a state of the four-momentum $P^\\mu\\big|^{[R]}=(E^{[R]},\\vec P^{[R]})$. Its norm is the product ${}^{[R]}\\langle\\vec P\\,'\\vert\\vec P\\rangle^{[R]}\\,{}^{[R]}\\langle E'\\vert E\\rangle^{[R]}=(2\\pi)^4\\,\\delta^4(P'^\\mu\\big|^{[R]}-P^\\mu\\big|^{[R]})$, so that"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec P,\\vec q;\\lambda_a\\lambda_b\\rangle^{[R]}=\\sqrt{\\frac{16\\pi^2E_R}{q_R}}\\;\\vert P^\\mu\\rangle^{[R]}\\otimes\\vert\\Omega;\\lambda_a\\lambda_b\\rangle^{[R]}\\tag{9.13}"
 },
 {
  "type": "eq",
  "tex": "{}^{[R]}\\langle P'^\\mu\\vert P^\\mu\\rangle^{[R]}=(2\\pi)^4\\,\\delta^4(P'^\\mu\\big|^{[R]}-P^\\mu\\big|^{[R]})\\qquad{}^{[R]}\\langle\\Omega',\\lambda_a'\\lambda_b'\\vert\\Omega,\\lambda_a\\lambda_b\\rangle^{[R]}=\\delta^2(\\Omega_R^\\prime-\\Omega_R)\\,\\delta_{\\lambda_a^{\\prime[R]}\\lambda_a^{[R]}}\\delta_{\\lambda_b^{\\prime[R]}\\lambda_b^{[R]}}"
 },
 {
  "type": "p",
  "text": "Like Eq. (9.9) it holds only in the rest-frame $[R]$ of the pair, where $\\lvert\\det J\\rvert=1$. The factor in front of the state contains the density of the two-particle states, which is the topic of card [[10]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Intermediate States Are Off-Shell"
 },
 {
  "type": "p",
  "text": "Take the decay of card [[3]], in which $0_\\mathrm p$ decays into $1_\\mathrm p$, $2_\\mathrm p$ and $3_\\mathrm p$ through the intermediate state $(12)_\\mathrm i$. The four particles are on-shell, their four-momenta fulfil $p^2=m^2$ with fixed masses. The intermediate state is the pair of $1_\\mathrm p$ and $2_\\mathrm p$ in the sense of this card, with the total momentum $P^\\mu=p_1^\\mu+p_2^\\mu$ and the squared invariant mass $P^2=s_{12}$, which changes from event to event, see card [[4]]. There is no fixed mass $m$ with $P^2=m^2$, so the intermediate state is off-shell. The squared invariant mass $s_{12}$ is bounded from below by the threshold, because in the rest-frame $[R]$ of the pair $\\sqrt{s_{12}}=E_{1,R}+E_{2,R}\\ge m_1+m_2$. It is bounded from above by the energy of the mother, because in the rest-frame $[R_0]$ of the mother $m_0=P^0\\big|^{[R_0]}+E_{3,R_0}\\ge\\sqrt{s_{12}}+m_3$, with $P^0\\big|^{[R_0]}\\ge\\sqrt{s_{12}}$ the energy of the pair"
 },
 {
  "type": "eq",
  "tex": "(m_1+m_2)^2\\le s_{12}\\le(m_0-m_3)^2"
 },
 {
  "type": "p",
  "text": "In the rest-frame $[R]$ of the pair, Eq. (9.7) holds with $s=s_{12}$. The magnitude of the relative momentum of $1_\\mathrm p$ and $2_\\mathrm p$ is then $\\sqrt{\\lambda(s_{12},m_1^2,m_2^2)}/(2\\sqrt{s_{12}})$ and changes from event to event, while its direction $\\Omega$ in $[R]$ stays free. At the lower bound $q_R=0$ and no direction is defined. How far $s_{12}$ is from the squared mass of the resonance enters the propagator of the intermediate state, see the cards [[24]] and [[25]]. In decays with more particles, card [[11]] treats such a pair like a single particle with the mass $\\sqrt{s_{12}}$."
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
    "text": "The mass shell of one particle and the invariant mass of a pair."
   },
   {
    "n": 6,
    "text": "The rest-frame of the pair and its axes."
   },
   {
    "n": 8,
    "text": "The norm and completeness that the pair builds on."
   },
   {
    "n": 10,
    "text": "The density in the factor in front of the energy and direction states."
   },
   {
    "n": 16,
    "text": "The pair in the internal helicity sums."
   },
   {
    "n": 18,
    "text": "The phase of the second particle and the vertex."
   },
   {
    "n": 20,
    "text": "The pair in the production of the mother."
   },
   {
    "n": 24,
    "text": "The propagator of an off-shell pair."
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
   "J. D. Richman, \"An experimenter's guide to the helicity formalism\", CALT-68-1148 (1984), Sect. 3.2, Eqs. (3.9) to (3.13).",
   "Particle Data Group, *Review of Particle Physics*, \"Kinematics\" (Sect. 49.4.2, Eqs. 49.16 and 49.17).",
   "K. Habermann and M. Mikhasenko, \"Wigner rotations for cascade reactions\", *Phys. Rev. D* **111**, 056015 (2025), arXiv:2409.06913, Eq. (3) and Sect. II."
  ],
  "refs": true
 }
];
