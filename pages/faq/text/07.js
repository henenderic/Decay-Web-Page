// FAQ page 7: What Are Spin and Helicity States, How Do Rotations Act on Them?
// Written by llm/faq_map/build_faq_pages.py from the draft in FAQ Contents/; do not edit by hand.
export default [
 {
  "type": "p",
  "text": "A massive particle with a spin $j$ has a total of $2j+1$ spin-projections in its rest-frame labelled by the projection $m_j$ of the spin onto the rest-frame $z$ axis $\\hat e^{[R]}_z$. Since the $z$ axis of the rest-frame points along the direction of flight that the particle had in the frame it was reached from, this projection is simultaneously a **helicity** $\\lambda^{[R]}$ as well, the projection of the spin on the direction of flight in the rest-frame. A state with momentum was built from the rest state by a boost along $z$ and a rotation of $z$ into the direction of flight, with the third Euler angle fixed as $\\gamma=0$, see card [[6]]. A rotation $R$ acts on the spin states through the **Wigner D-matrix**, the representation of the rotation operator. A rotation by $\\pi$ about $y$, necessary when considering the spectator of a decay, reverses the helicity and brings in an additional phase of $(-1)^{j-\\lambda}$. For half-integer spin a rotation does not fix its own sign and the sign of its **spin lift** has to be carried along."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Spin in the Rest-Frame"
 },
 {
  "type": "p",
  "text": "In its rest-frame, a particle with a mass $m>0$ and spin $j$ has $2j+1$ possible states, i.e. spin-orientations. They are the eigenstates of the square of the spin operator $\\vec J$ and of its $z$ component [[Ref 1, 2]]"
 },
 {
  "type": "eq",
  "tex": "J_z\\vert\\vec 0,j,m_j\\rangle=m_j\\vert\\vec 0,j,m_j\\rangle\\qquad\\vec J^{\\,2}\\vert\\vec 0,j,m_j\\rangle=j(j+1)\\vert\\vec 0,j,m_j\\rangle\\tag{7.1}"
 },
 {
  "type": "p",
  "text": "with $m_j=-j,\\dots,j$ the $2j+1$ orientations. In the rest-frame, every component of the momentum is zero, though a particles rest-frame is not just defined through  the condition $\\vec p=0$, but it also has axes inherited from before the Lorentz-transformation. As built in card [[6]], the rest-frames $z$ axis is parallel to the direction of flight that the particle had in the frame it was reached from. The projection of the spin on $z$ is therefore at the same time the quantum number $m_j$, as well as the projection on the direction of flight, the helicity, thus only in the rest-frame one finds $\\lambda^{[R]}=m_j$. In a decay that is to be modelled, the mother is such a particle and so its projection is called $\\lambda_0$, see card [[1]] on the general formula of a decay amplitude."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Helicity"
 },
 {
  "type": "p",
  "text": "For a particle in motion the helicity is the projection of the spin on the direction of flight, $\\lambda=\\vec J\\cdot\\vec p/\\lvert\\vec p\\rvert$ and it takes again the orientation values $\\lambda=-j,\\dots,j$ [[Ref 1, 2]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Building a State with Momentum"
 },
 {
  "type": "p",
  "text": "The state of a particle with the momentum $\\vec p$ and the helicity $\\lambda$ is obtained from its rest-frame state by the transport $L=R_z(\\varphi)R_y(\\vartheta)B_z(\\eta)$ of Eq. (6.2), where $(\\varphi,\\vartheta)$ is the direction of $\\vec p$ and $\\eta$ the rapidity. This is a special Lorentz transformation (in contrast to a general Lorentz-transformation $\\Lambda$) that acts on the states through a unitary operator $U$ with the third Euler angle $\\gamma=0$ in the rotation"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec p,j,\\lambda\\rangle^{[F]}=U\\big(R(\\varphi,\\vartheta,0)\\,B_z(\\eta)\\big)\\vert\\vec 0,j,\\lambda\\rangle^{[R]}\\tag{7.2}"
 },
 {
  "type": "p",
  "text": "The boost gives the particle its momentum along $z$ and leaves the spin projection on $z$ unchanged. The rotation then turns the $z$ axis of the rest-frame system $[R]$ into the direction of flight in some frame $[F]$ and takes the spin with it, so that the projection on the direction of flight is still $\\lambda$ [[Ref 1, 3]]. The same state arises if the rest state is rotated first and boosted along the new direction afterwards ([[Figure 7.1]])."
 },
 {
  "type": "fig",
  "id": "F7.1",
  "number": "7.1",
  "caption": "Building a helicity state. (a) The rest state with the spin projection $\\lambda=m_j$ on $z$. (b) After the boost $B_z(\\eta)$ the particle moves along $z$ and the spin projection is unchanged. (c) After the rotation $R(\\varphi,\\vartheta,0)$ the momentum and the spin point into the direction $(\\varphi,\\vartheta)$ and the projection on this direction is still $\\lambda$."
 },
 {
  "type": "h",
  "level": 3,
  "text": "How Rotations Act on Spin States"
 },
 {
  "type": "h",
  "level": 4,
  "text": "The Wigner $D$- and $d$-Matrices"
 },
 {
  "type": "p",
  "text": "The rotation operators $R_{\\hat n}(\\vartheta)=e^{-i\\vartheta\\hat n\\cdot\\vec J}$ and the Euler rotation $R(\\alpha,\\beta,\\gamma)=R_z(\\alpha)R_y(\\beta)R_z(\\gamma)$ are those introduced in card [[5]], so on states of the spin $j$, the Euler rotation acts as the operator $R(\\alpha,\\beta,\\gamma)=e^{-i\\alpha J_z}e^{-i\\beta J_y}e^{-i\\gamma J_z}$. The two outer factors act on eigenstates of $J_z$ and give a phase, while the inner rotation must be evaluated differently. Before this middle factor, a complete set of spin-states $\\one=\\sum_{j',m_j'}\\vert j',m_j'\\rangle\\langle j',m_j'\\vert$ is inserted on both sides. This complete set is to be understood as the spin part of the rest-frame particle wave-function."
 },
 {
  "type": "p",
  "text": "Since $\\vec J^{\\,2}$ commutes with $J_y$, the matrix element of $e^{-i\\beta J_y}$ between states of different spin vanishes and only $j'=j$ remains [[Ref 2, 4]]"
 },
 {
  "type": "eq",
  "tex": "\\begin{aligned}U(R)\\vert j,m_j\\rangle&=e^{-i\\alpha J_z}\\,e^{-i\\beta J_y}\\,e^{-i\\gamma J_z}\\vert j,m_j\\rangle\\\\&=\\sum_{j',m_j'}e^{-i\\alpha J_z}\\vert j',m_j'\\rangle\\langle j',m_j'\\vert e^{-i\\beta J_y}\\vert j,m_j\\rangle\\,e^{-im_j\\gamma}\\\\&=\\sum_{m_j'}e^{-im_j'\\alpha}\\,\\langle j,m_j'\\vert e^{-i\\beta J_y}\\vert j,m_j\\rangle\\,e^{-im_j\\gamma}\\,\\vert j,m_j'\\rangle\\end{aligned}\\tag{7.3}"
 },
 {
  "type": "p",
  "text": "The small $d$-matrix and the Wigner $D$-matrix can then be defined through"
 },
 {
  "type": "eq",
  "tex": "d^j_{m_j'm_j}(\\beta)=\\langle j,m_j'\\vert e^{-i\\beta J_y}\\vert j,m_j\\rangle\\qquad D^j_{m_j'm_j}(\\alpha,\\beta,\\gamma)=e^{-im_j'\\alpha}\\,d^j_{m_j'm_j}(\\beta)\\,e^{-im_j\\gamma}\\tag{7.4}"
 },
 {
  "type": "p",
  "text": "so that a rotation acts on the states of spin $j$ as"
 },
 {
  "type": "eq",
  "tex": "U(R)\\vert j,m_j\\rangle=\\sum_{m_j'}D^j_{m_j'm_j}(\\alpha,\\beta,\\gamma)\\vert j,m_j'\\rangle\\tag{7.5}"
 },
 {
  "type": "p",
  "text": "meaning a rotation mixes spin states."
 },
 {
  "type": "h",
  "level": 4,
  "text": "Properties of the Wigner $D$- and $d$-Matrices"
 },
 {
  "type": "p",
  "text": "A rotation about the $z$ axis is diagonal, i.e. $D^j_{m_j'm_j}(R_z(\\omega))=\\delta_{m_j'm_j}e^{-im_j\\omega}$ and the inverse rotation gives the conjugate transpose, $D^j_{m_j'm_j}(R^{-1})=D^{j*}_{m_jm_j'}(R)$, which is why the complex conjugate $D^*$ appears in the amplitude of [[1]] due to a projection of a bra state."
 },
 {
  "type": "p",
  "text": "The matrix $d^j(\\beta)$ is real, because the $J_y$ spin-projection is purely imaginary in the basis $\\vert j,m_j\\rangle$ and $e^{-i\\beta J_y}$ is therefore a real orthogonal matrix. From the definition of the ladder-operators, which are real matrices in the Condon-shortley phase convention, it follows"
 },
 {
  "type": "eq",
  "tex": "J_\\pm = J_x \\pm i J_y \\qquad\\Rightarrow\\qquad J_x = \\frac{1}{2}(J_+ + J_-) \\qquad J_y = \\frac{1}{2i}(J_+ - J_-)\\tag{7.6}"
 },
 {
  "type": "p",
  "text": "Also one finds that $d^j_{m_j'm_j}(-\\beta)=d^j_{m_jm_j'}(\\beta)$ and further $d^j_{m_j'm_j}(\\beta)=(-1)^{m_j'-m_j}\\,d^j_{m_jm_j'}(\\beta)=d^j_{-m_j,-m_j'}(\\beta)$ and $d^j_{m_j'm_j}(0)=\\delta_{m_j'm_j}$. Explicitly, the $d$-matrix has the expression"
 },
 {
  "type": "eq",
  "tex": "d^j_{m_j'm_j}(\\beta)=\\sum_s\\frac{(-1)^{m_j'-m_j+s}\\sqrt{(j+m_j')!\\,(j-m_j')!\\,(j+m_j)!\\,(j-m_j)!}}{(j+m_j-s)!\\;s!\\;(m_j'-m_j+s)!\\;(j-m_j'-s)!}\\Big(\\cos\\tfrac\\beta2\\Big)^{2j-m_j'+m_j-2s}\\Big(\\sin\\tfrac\\beta2\\Big)^{m_j'-m_j+2s}\\tag{7.7}"
 },
 {
  "type": "p",
  "text": "where $s$ runs over all integers for which no factorial in the denominator has a negative argument. For example in spin $\\frac{1}{2}$ this is the matrix $d^{1/2}(\\beta)=\\begin{pmatrix}\\cos\\frac\\beta2&-\\sin\\frac\\beta2\\\\\\sin\\frac\\beta2&\\cos\\frac\\beta2\\end{pmatrix}$"
 },
 {
  "type": "h",
  "level": 4,
  "text": "Lorentz-Transforming Spin States"
 },
 {
  "type": "p",
  "text": "A rotation of the frame leaves the helicity unchanged up to a phase and so does a boost along the direction of flight, as long as it does not turn the momentum around. A boost that reverses the momentum reverses the helicity and a boost in any other direction mixes helicities, so the helicity of a massive particle depends on the frame. This is why in [[6]] rest-frame labels are introduced for the various rest-frames that one will encounter in a decay chain and why the helicities of the same particle in two frames cannot be compared without knowing how the frames are related."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Third Euler Angle"
 },
 {
  "type": "p",
  "text": "As seen in the section on rotations ([[5]]), only two angles are required to fix the direction of flight, i.e. to rotate $\\hat e_z^{[R]}$ such that it is parallel to $\\hat e_p^{[F]}$, the third one is only necessary to properly align the $x$ and $y$ axes in this system ([[5]]). Since one can extract $R(\\varphi,\\vartheta,\\gamma)=R(\\varphi,\\vartheta,0)R_z(\\gamma)$ and $R_z(\\gamma)$ commutes with the Lorentz-boost $B_z(\\eta)$, Eq. (7.4) with the spin-projection written as a helicity $m_j=\\lambda$ gives"
 },
 {
  "type": "eq",
  "tex": "\\vert\\vec p,j,\\lambda\\rangle_\\gamma=e^{-i\\lambda\\gamma}\\,\\vert\\vec p,j,\\lambda\\rangle_{\\gamma=0}\\tag{7.8}"
 },
 {
  "type": "p",
  "text": "The angle $\\gamma$ is not a coordinate of the momentum, but a spatial alignment property and it changes the phase of the state and the azimuths in the frames that follow. This guide uses $\\gamma=0$ [[Ref 3]]. A different choice gives states that differ by the phase of Eq. (7.8) and which choice two programs use is part of the conventions collected in card [[32]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "The Opposite Direction"
 },
 {
  "type": "p",
  "text": "A rotation by $\\pi$ about $y$ turns the eigenvalue of $S_z$ into its negative, but the ket does not only change its label [[Ref 1, 2]]:"
 },
 {
  "type": "eq",
  "tex": "R_y(\\pi)\\vert j,m_j\\rangle=(-1)^{j-m_j}\\vert j,-m_j\\rangle\\tag{7.9}"
 },
 {
  "type": "p",
  "text": "This follows from $d^j_{m_j'm_j}(\\pi)=(-1)^{j-m_j}\\delta_{m_j',-m_j}$: the rotation $R_y(\\pi)$ turns $J_\\pm$ into $-J_\\mp$ and $\\vert j,j\\rangle$ into $\\vert j,-j\\rangle$ and the lowering operator then fixes the sign of every step. For the spin $\\tfrac12$ it reads $R_y(\\pi)\\vert{+\\tfrac12}\\rangle=\\vert{-\\tfrac12}\\rangle$ and $R_y(\\pi)\\vert{-\\tfrac12}\\rangle=-\\vert{+\\tfrac12}\\rangle$. The state of a particle that flies in the opposite direction is therefore not just the original state times a phase, the momentum has to be turned as well. The phase of Eq. (7.9) is the origin of the factor that belongs to the second particle of a decay, which is explained in [[18]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "How a Lorentz Transformation Acts on a Helicity State"
 },
 {
  "type": "p",
  "text": "Every proper orthochronous Lorentz transformation is the product of a boost along some axis $\\hat n$ and a rotation about another axis $\\hat m$"
 },
 {
  "type": "eq",
  "tex": "\\Lambda = B(\\hat n,\\eta)\\,R(\\hat m,\\Omega)\\tag{7.10}"
 },
 {
  "type": "p",
  "text": "The boost along $\\hat n$ itself can be equally written as a properly rotated boost into $z$ direction only"
 },
 {
  "type": "eq",
  "tex": "B(\\hat n,\\eta) = R_{z\\to\\hat n}\\,B_z(\\eta)\\,R_{z\\to\\hat n}^{-1}\\tag{7.11}"
 },
 {
  "type": "p",
  "text": "All rotations are equally expressable using Euler rotations and neighbouring rotations about the $z$ axis can be combined, because they commute with the boost $B_z$. Every Lorentz transformation can therefore also be written using six parameters only, five angles and one rapidity,"
 },
 {
  "type": "eq",
  "tex": "\\Lambda=R(\\varphi,\\vartheta,0)\\,B_z(\\eta)\\,R(\\alpha,\\beta,\\gamma)\\tag{7.12}"
 },
 {
  "type": "p",
  "text": "where the first two factors form the transport $L$ of Eq. (6.2) from the particles rest-frame to some other frame and the last factor is a rotation of said rest-frame state before the frame-transformation happens. The particles state in some frame $[F]$ is built as $\\vert\\vec p,j,\\lambda\\rangle^{[F]}=U(L(p))\\vert\\vec 0,j,\\lambda\\rangle^{[R]}$ (Eq. (7.2)). Acting with $\\Lambda$ gives $U(\\Lambda)U(L(p))\\vert\\vec 0,j,\\lambda\\rangle^{[R]}=U(\\Lambda L(p))\\vert\\vec 0,j,\\lambda\\rangle^{[R]}$. The product $\\Lambda L(p)$ is again a Lorentz transformation and so has the form (7.12). Its last factor rotates the rest state through the $D$-matrix of Eq. (7.5) and its first two factors build the state with the new momentum $\\vec p\\,'=\\Lambda\\vec p$:"
 },
 {
  "type": "eq",
  "tex": "U(\\Lambda)\\vert\\vec p,j,\\lambda\\rangle^{[F]}=\\sum_{\\lambda'}D^j_{\\lambda'\\lambda}(\\alpha,\\beta,\\gamma)\\,\\vert\\vec p\\,',j,\\lambda'\\rangle^{[F]}\\tag{7.13}"
 },
 {
  "type": "p",
  "text": "The helicity is conserved only if $D$ is diagonal, which requires the second angle in the rest-frame rotation to be zero $\\beta=0$. For just a rotation $\\Lambda=R'$ of the state $\\vert\\vec p,j,\\lambda\\rangle^{[F]}$, the product of two rotations $R'R(\\varphi,\\vartheta,0)$ can again be expressed as a Euler-rotation with different angles $\\vartheta'$, $\\varphi'$ and $\\omega$ and can be written as $R(\\varphi',\\vartheta',0)R_z(\\omega)$. Since the $z$-rotation $R_z(\\omega)$ commutes with the $z$-boost $B_z$, the rotation can be written as a transformation to a different frame $[F']$ times a rest-frame rotation about $z$, i.e. $R'L(p)=L(R'p)R_z(\\omega)$, so $\\beta=0$ in Eq. (7.13) and it gives a phase $e^{-i\\lambda\\omega}$ only."
 },
 {
  "type": "p",
  "text": "A boost along the direction of flight changes only the magnitude of the momentum as long as it does not turn the momentum around, this means total rest-frame boosts $\\eta+\\eta'>0$. Then $\\Lambda L(p)=R(\\varphi,\\vartheta,0)B_z(\\eta+\\eta')=L(p')$ and the rotation in (7.12) is trivial. If the boost is strong enough to reverse the momentum, these are boosts with $\\eta+\\eta'<0$, it becomes a boost along $-z$ which equals a half-turn about $y$, a standard boost along $+z$ and a half-turn back, i.e. $B_z(-\\eta)=R_y(\\pi)B_z(\\eta)R_y(-\\pi)$. Hence $\\Lambda L(p)=L(p')R(\\alpha,\\beta,\\gamma)$ with $\\beta=\\pm\\pi$. By Eq. (7.9), the Wigner matrix $D^j_{\\lambda'\\lambda}$ in Eq. (7.13) is non-zero in this case only for $\\lambda'=-\\lambda$. The state keeps its spin but its momentum is reversed, so the helicity changes sign. A boost in any other direction needs a rotation with $\\beta\\neq0,\\pm\\pi$ and mixes the helicities. How $\\alpha$, $\\beta$ and $\\gamma$ follow for a chain of frames is shown in [[29]]."
 },
 {
  "type": "h",
  "level": 3,
  "text": "Half-Integer Spin and the Spin Lift"
 },
 {
  "type": "p",
  "text": "Obviously, a rotation of $2\\pi$ about an arbitrary axis $\\hat n$ brings every vector back into its original orientation. However, this need not hold for a state that consists of both a momentum vector and a spin. To show this, we need the representation of the rotation operator about some axis $\\hat n$, $U(R_{\\hat n}(\\vartheta)) = e^{-i\\vartheta \\,\\hat n\\cdot \\vec{J}}$, Eq. (5.7) on card [[5]]. The generator of this rotation is the operator $\\hat n\\cdot \\vec{J}$, which can be understood as the operator $J_z$ turned to the axis $\\hat n$: for a rotation $Q$ with $Q\\hat e_z=\\hat n$ one has $\\hat n\\cdot\\vec J=U(Q)\\,J_z\\,U(Q)^{-1}$, because $\\vec J$ transforms as a vector. Hence $\\hat n\\cdot\\vec J$ has the same eigenvalues as $J_z$ and the eigenstates $\\vert j,\\tilde m_{\\hat n}\\rangle=U(Q)\\vert j,m_j\\rangle$, which form a complete set because $U(Q)$ is unitary. The eigenvalues $\\tilde m_{\\hat n}=-j,\\dots,j$ are the projections of the spin onto $\\hat n$. They are not the $m_j$ of the rest-frame $z$ axis, but they run through the same values, so the operator can be written as $\\hat n\\cdot\\vec{J} = \\sum_{\\tilde m_{\\hat n}} \\tilde m_{\\hat n}\\vert j,\\tilde m_{\\hat n}\\rangle\\langle j,\\tilde m_{\\hat n}\\vert$. Acting with the rotation operator for a rotation of $2\\pi$ on one of these eigenstates we find"
 },
 {
  "type": "eq",
  "tex": "U(R_{\\hat n}(2\\pi))\\vert j,\\tilde m_{\\hat n}\\rangle = e^{-2\\pi i\\,\\hat n\\cdot\\vec J}\\vert j,\\tilde m_{\\hat n}\\rangle = e^{-2\\pi i\\,\\tilde m_{\\hat n}}\\vert j,\\tilde m_{\\hat n}\\rangle"
 },
 {
  "type": "p",
  "text": "This phase is either $-1$ or $+1$, depending on the spin of the particle. For half-integer spins, $j=(2n+1)/2$ with $n$ a non-negative integer, all projections are half-integer, $\\tilde m_{\\hat n}=(2k+1)/2$ with $k$ an integer and the phase is $e^{-i\\,(2k+1)\\pi} = -1$. For integer spins $j=n$ the projections are integer as well, $\\tilde m_{\\hat n}=k$ and the phase is $e^{-2\\pi i k}=+1$. Both cases are written as"
 },
 {
  "type": "eq",
  "tex": "e^{-2\\pi i\\,\\hat n\\cdot\\vec J}\\vert j,\\tilde m_{\\hat n}\\rangle = (-1)^{2j}\\vert j,\\tilde m_{\\hat n}\\rangle"
 },
 {
  "type": "p",
  "text": "Multiplying this relation from the right with the bra $\\langle j,\\tilde m_{\\hat n}\\vert$ and summing over all projections $\\tilde m_{\\hat n}$ gives"
 },
 {
  "type": "eq",
  "tex": "e^{-2\\pi i\\,\\hat n\\cdot\\vec J}\\underbrace{\\sum_{\\tilde m_{\\hat n}}\\vert j,\\tilde m_{\\hat n}\\rangle\\langle j,\\tilde m_{\\hat n}\\vert}_{=\\one} = (-1)^{2j}\\underbrace{\\sum_{\\tilde m_{\\hat n}}\\vert j,\\tilde m_{\\hat n}\\rangle\\langle j,\\tilde m_{\\hat n}\\vert}_{=\\one}"
 },
 {
  "type": "p",
  "text": "Because the eigenstates are complete, this is an operator identity and holds for every state of the spin $j$, whatever its momentum. A rotation by $2\\pi$ about any axis is therefore replaced by a number that depends only on the spin"
 },
 {
  "type": "eq",
  "tex": "U(R_{\\hat n}(2\\pi)) = (-1)^{2j}\\tag{7.14}"
 },
 {
  "type": "p",
  "text": "A rotation by $\\vartheta+2\\pi k$ with an integer $k$ is the rotation by $\\vartheta$ followed by $k$ rotations by $2\\pi$ about the same axis and these commute, so"
 },
 {
  "type": "eq",
  "tex": "U\\big(R_{\\hat n}(\\vartheta+2\\pi k)\\big)=(-1)^{2jk}\\,U\\big(R_{\\hat n}(\\vartheta)\\big)\\tag{7.15}"
 },
 {
  "type": "p",
  "text": "The $3\\times3$ matrices of these rotations are the same, $R_{\\hat n}(\\vartheta+2\\pi k)=R_{\\hat n}(\\vartheta)$, so a vector cannot tell the angles $\\vartheta$ and $\\vartheta\\pm2\\pi$ apart. It knows only the orientation that the rotation leads to. A state with half-integer spin on the other hand also knows by how much it has been turned, modulo $4\\pi$: the angles $\\vartheta$ and $\\vartheta\\pm2\\pi$ lead to the same orientation, but to states that differ by a factor $-1$ and only a rotation by $4\\pi$ brings the state back. For integer spins there is no such difference and so only fermionic states require extra care."
 },
 {
  "type": "p",
  "text": "A spatial orientation alone therefore does not fix the rotation operator $U(R)$ of a half-integer spin state and it fixes it only up to a sign. One still has to say which of the two signs belongs to the rotation $R$. This choice is called the spin lift [[Ref 3]]. This logic can be applied when looking at the Euler angles of Eq. (5.8): the angles of a given rotation are fixed only modulo $2\\pi$ and a shift of $\\alpha$, $\\beta$ or $\\gamma$ by $2\\pi$ multiplies $D^j(\\alpha,\\beta,\\gamma)$ of Eq. (7.4) with the spin-lift phase $(-1)^{2j}$. For one state alone, the sign is an overall phase without effect. It becomes a relative sign (and thus observable) only when two amplitudes are added (or then subtracted) in which the same orientation was reached in different ways, see card [[29]]."
 },
 {
  "type": "p",
  "text": "In a decay chain a state is moved by a sequence of rotations and boosts, Eq. (7.12). The product of the matrices of the single steps is one lift of the total rotation $W$ that the chain produces. The Euler angles of $W$ in their principal ranges, inserted in Eq. (7.13), give a second one. Both lead to the same orientation, so by Eq. (7.15) they agree up to a sign. The sign $\\epsilon=\\pm1$ says whether they do,"
 },
 {
  "type": "eq",
  "tex": "D^j(W)=\\epsilon^{2j}\\,D^j(\\alpha,\\beta,\\gamma)\\tag{7.16}"
 },
 {
  "type": "p",
  "text": "For every half-integer spin, for example $j=\\tfrac32$ as well as $j=\\tfrac12$, the exponent $2j$ is odd and $\\epsilon^{2j}=\\epsilon$. Integer spins bring no sign: there $\\epsilon^{2j}=1$ whichever lift is taken. The value of $\\epsilon$ is piecewise constant over the kinematic variables and changes only where an Euler angle leaves its principal range, for example when $\\alpha$ crosses $\\pm\\pi$. How $\\epsilon$ is found for a chain will be revisited in card [[29]]."
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
    "n": 1,
    "text": "The helicities in the formula."
   },
   {
    "n": 5,
    "text": "The rotations that act on the spin states."
   },
   {
    "n": 6,
    "text": "The boost and the direction of the rest-frame."
   },
   {
    "n": 8,
    "text": "The norm of the states built here."
   },
   {
    "n": 18,
    "text": "The phase of the second particle."
   },
   {
    "n": 19,
    "text": "The helicity states in the partial-wave expansion."
   },
   {
    "n": 20,
    "text": "The helicity of the mother."
   },
   {
    "n": 21,
    "text": "The helicity states of the mother."
   },
   {
    "n": 22,
    "text": "The effect of the third angle on the mother."
   },
   {
    "n": 27,
    "text": "The angles in the states."
   },
   {
    "n": 29,
    "text": "The rotation between the helicity bases of two chains."
   },
   {
    "n": 31,
    "text": "The sum over the helicities."
   },
   {
    "n": 32,
    "text": "The conventions for the third angle and the phases."
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
   "M. Jacob and G. C. Wick, \"On the general theory of collisions for particles with spin\", *Ann. Phys.* **7**, 404 (1959), Sect. II, Eqs. (6), (7), (9') and (17).",
   "J. D. Richman, \"An experimenter's guide to the helicity formalism\", CALT-68-1148 (1984), Eqs. (2.4), (2.12) and (3.1) to (3.7).",
   "K. Habermann and M. Mikhasenko, \"Wigner rotations for cascade reactions\", *Phys. Rev. D* **111**, 056015 (2025), arXiv:2409.06913, Eq. (3) and Sects. II and VI.",
   "M. Mikhasenko et al. (JPAC), \"Dalitz-plot decomposition for three-body decays\", *Phys. Rev. D* **101**, 034033 (2020), Eq. (2)."
  ],
  "refs": true
 }
];
