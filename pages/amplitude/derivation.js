// The amplitude of a single decay m → a + b, derived for the decay that is selected on the page "Amplitude construction", the states and their normalisation, and the phase of the spectator.
// The formulas use the letters m, a, b; what depends on the selected vertex are the names, the frames and the Lorentz transformation between them.
import { h, mt, mtex, named, itl, vtc, tagNode, texNode, sym } from '../../app/common.js';
import { toTex } from '../../render/tex.js';

const T = markup => toTex(markup, 0, true);
const raw = String.raw;

/** The states of one and two particles and their normalisation, a foldout (it does not depend on the chosen decay). */
export function buildNormalisation(foldout) {
  const P = (...nodes) => h('p', {}, nodes.flat());
  const D = tex => h('div', { class: 'formula' }, [texNode(tex, { display: true })]);
  return foldout('normalisation-details', 'The states and their normalisation', [
    P(...mtex(`A state of one particle with the momentum $\\vec p$ and the helicity $\\lambda$ is normalised so that the normalisation itself is Lorentz invariant, and the space of these states is complete in every frame:`)),
    D(raw`\langle\vec p\,';\lambda'\vert\vec p;\lambda\rangle=(2\pi)^3\,2E\,\delta^3(\vec p\,'-\vec p)\,\delta_{\lambda'\lambda}\,,\qquad \one=\sum_\lambda\int\frac{\Int^3p}{(2\pi)^3\,2E}\,\lvert\vec p;\lambda\rangle\langle\vec p;\lambda\rvert\,.`),
    P(...mtex(`The state of two particles is the product of the two one-particle states, $\\lvert\\vec p_a,\\vec p_b;\\lambda_a,\\lambda_b\\rangle=\\lvert\\vec p_a;\\lambda_a\\rangle\\otimes\\lvert\\vec p_b;\\lambda_b\\rangle$, with the normalisation and the completeness`)),
    D(raw`\langle\vec p_a',\vec p_b';\lambda_a',\lambda_b'\vert\vec p_a,\vec p_b;\lambda_a,\lambda_b\rangle=(2\pi)^6\,4E_aE_b\,\delta^3(\vec p_a'-\vec p_a)\,\delta^3(\vec p_b'-\vec p_b)\,\delta_{\lambda_a'\lambda_a}\delta_{\lambda_b'\lambda_b}\,,`),
    D(raw`\one=\sum_{\lambda_a,\lambda_b}\int\frac{\Int^3p_a\,\Int^3p_b}{(2\pi)^6\,4E_aE_b}\,\lvert\vec p_a,\vec p_b;\lambda_a,\lambda_b\rangle\langle\vec p_a,\vec p_b;\lambda_a,\lambda_b\rvert\,.`),
    P(...mtex(`In the rest frame of the pair, $\\vec P=0$, the pair is labelled by the total momentum $\\vec P$ and the relative momentum $\\vec q$ instead of $\\vec p_a$ and $\\vec p_b$; the Jacobian determinant of this change of variables is 1 there. The state behaves like a product of a state of the total momentum and a state of the relative momentum, $\\lvert\\vec P,\\vec q;\\lambda_a,\\lambda_b\\rangle=\\lvert\\vec P\\rangle\\otimes\\lvert\\vec q;\\lambda_a,\\lambda_b\\rangle$, with`)),
    D(raw`\langle\vec P\,'\vert\vec P\rangle=(2\pi)^3\,\delta^3(\vec P\,'-\vec P)\,,\qquad \langle\vec q\,';\lambda_a',\lambda_b'\vert\vec q;\lambda_a,\lambda_b\rangle=(2\pi)^3\,4E_aE_b\,\delta^3(\vec q\,'-\vec q)\,\delta_{\lambda_a'\lambda_a}\delta_{\lambda_b'\lambda_b}\,.`),
    P(...mtex(`The three-dimensional $\\delta$ function of the relative momentum is split into its radial and angular parts, $\\delta^3(\\vec q\\,'-\\vec q)=q^{-2}\\,\\delta(q'-q)\\,\\delta^2(\\Omega'-\\Omega)$ with $\\delta^2(\\Omega'-\\Omega)=\\delta(\\cos\\vartheta'-\\cos\\vartheta)\\,\\delta(\\varphi'-\\varphi)$. With the relation $\\delta\\big(f(y)\\big)=\\sum_i\\delta(y-y_i)/\\lvert f'(y_i)\\rvert$ for the total energy $E=E_a+E_b$, for which $\\Int E/\\Int q=qE/(E_aE_b)$, the radial part becomes an energy $\\delta$ function:`)),
    D(raw`\begin{aligned}\delta(q'-q)&=\frac{qE}{E_aE_b}\,\delta(E'-E)\,,\\ \langle\vec P\,',\vec q\,';\lambda_a',\lambda_b'\vert\vec P,\vec q;\lambda_a,\lambda_b\rangle&=\frac{2\pi}{\rho}\,(2\pi)^4\,\delta^4(P'^\mu-P^\mu)\,\delta^2(\Omega'-\Omega)\,\delta_{\lambda_a'\lambda_a}\delta_{\lambda_b'\lambda_b}\,,\qquad\rho=\frac{q}{8\pi E}\,.\end{aligned}`),
    P(...mtex(`The quantity $\\rho$ is the density of the two-particle phase space. The pair is therefore a product of a state of the four-momentum and a state of the direction of $\\vec q$:`)),
    D(raw`\lvert\vec P,\vec q;\lambda_a,\lambda_b\rangle=\sqrt{\frac{2\pi}{\rho}}\;\lvert P^\mu\rangle\otimes\lvert\Omega;\lambda_a,\lambda_b\rangle\,,\qquad\langle P'^\mu\vert P^\mu\rangle=(2\pi)^4\,\delta^4(P'^\mu-P^\mu)\,,\quad\langle\Omega'\vert\Omega\rangle=\delta^2(\Omega'-\Omega)\,.`),
    P(...mtex(`The state of a single particle with $p\\neq0$ can be written in the same way, with its energy and its direction. Since $\\Int p/\\Int E=E/p$,`)),
    D(raw`\begin{aligned}\langle\vec p\,'\vert\vec p\rangle&=(2\pi)^3\,\frac{2E}{p^2}\,\delta(p'-p)\,\delta^2(\Omega'-\Omega)=\frac{2\pi\cdot4\pi}{p}\;2\pi\,\delta(E'-E)\,\delta^2(\Omega'-\Omega)\,,\\ \lvert\vec p;\lambda\rangle&=\sqrt{2\pi}\sqrt{\frac{4\pi}{p}}\;\lvert E\rangle\otimes\lvert\Omega;\lambda\rangle\,,\qquad\langle E'\vert E\rangle=2\pi\,\delta(E'-E)\,.\end{aligned}`)]);
}

export function buildDerivation(payload, { link, openEuler, openNormalisation }) {
  const amp = payload.amplitude, vertices = amp.vertices, transitions = payload.animation?.transitions || {};
  const letter = amp.letter, K = amp.topology_label;
  const P = (...nodes) => h('p', {}, nodes.flat());
  const D = tex => h('div', { class: 'formula' }, [texNode(tex, { display: true })]);
  const frameSup = markup => raw`^{\htmlClass{frame}{\scriptscriptstyle[${T(markup)}]}}`;
  const parentOf = v => vertices.find(u => u.B.name === v.node || u.C.name === v.node);
  const sideName = side => named(side.leaf ? side.name : side.display, !side.leaf);
  const vertexName = v => v.root ? named('0', false) : itl(v.display);

  // ---------------------------------------------------------------- the derivation for one vertex
  function derive(v) {
    const parent = parentOf(v), Fp = parent ? parent.frame_markup : 'lab', Fm = v.frame_markup;
    const sp = frameSup(Fp), sm = frameSup(Fm);
    const ops = transitions[v.key]?.operations || [];
    const inverse = op => op.factor_markup.replace('(−', '(');                       // the state is built with the inverse of the coordinate transformation of the animation
    const L = T(ops.map(inverse).join(' '));
    const vv = T(`V_{${vtc(v.display)}}`), MV = T(`ℳ_{${vtc(v.display)}}`);
    const ketM = raw`\lvert\vec p_m;\lambda_m\rangle${sp}`, ketAB = raw`\lvert\vec p_a,\vec p_b;\lambda_a,\lambda_b\rangle${sp}`, braAB = raw`{}${sp}\langle\vec p_a,\vec p_b;\lambda_a,\lambda_b\rvert`;
    const nodes = [];

    nodes.push(
      P('The decay ', sym(`${vertexName(v)} → ${sideName(v.B)} + ${sideName(v.C)}`, true), ' is written as ', sym('m → a + b', true), ...mtex(`: $m$ is the decaying particle, $a$ the reference particle and $b$ the spectator. The decay is considered in the frame `),
        tagNode(Fp), ...mtex(`, in which $m$ has the momentum $\\vec p_m$. The rest frame of $m$ is `), tagNode(Fm), '. The frame labels on the states say in which frame momenta and helicities are measured.'),
      P('The initial state is the state of ', sym('m', true), ' with its momentum and helicity, the final state is the state of the two daughters as free particles, and the transition between them is described by the interaction ', sym(`V_{${vtc(v.display)}}`), ' of this vertex:'),
      D(raw`${braAB}\,${vv}\,${ketM}\,.`),
      P(...mtex(`The vertex conserves the four-momentum, $p_m^\\mu=p_a^\\mu+p_b^\\mu$, and this holds in every frame. It can be used to simplify the problem: in the rest frame of $m$ the total momentum of the final state vanishes. For the two daughters the total momentum $P^\\mu=p_a^\\mu+p_b^\\mu$ and the relative momentum $q^\\mu$ are`)),
      D(raw`P^\mu=p_a^\mu+p_b^\mu\,,\qquad q^\mu=\frac12\,(p_a^\mu-p_b^\mu)-\frac{m_a^2-m_b^2}{2P^2}\,P^\mu\,,\qquad q\cdot P=0\,.`),
      P(...mtex(`In the rest frame $\\vec P=0$, the relative momentum is the momentum of $a$, $\\vec q=\\vec p_a=-\\vec p_b$, and its length follows from the energy $E_m=E_a+E_b$. The state of the two daughters is labelled by $\\vec P$ and $\\vec q$ instead of $\\vec p_a$ and $\\vec p_b$, $\\lvert\\vec p_a,\\vec p_b;\\lambda_a,\\lambda_b\\rangle=\\lvert\\vec P,\\vec q;\\lambda_a,\\lambda_b\\rangle$. How these states are normalised, and how they are split into a state of the four-momentum and a state of the direction of $a$, is shown in the foldout `), h('button', { type: 'button', class: 'link-button', text: 'The states and their normalisation', onclick: openNormalisation }), '.'),
      P(...mtex(`In the rest frame of $m$ the state of the daughters is then fixed by the energy $E_m$ and the solid angle $\\Omega$ of $a$ alone:`)),
      D(raw`\lvert\vec P,\vec q;\lambda_a,\lambda_b\rangle${sm}=\sqrt{\frac{2\pi}{\rho}}\;\lvert\vec P=0\rangle${sm}\otimes\lvert E_m\rangle${sm}\otimes\lvert\Omega;\lambda_a,\lambda_b\rangle${sm}\,.`),

      // ---- the Lorentz transformation between the frames
      P(...mtex(`This state is obtained from the state in the frame `), tagNode(Fp), ...mtex(` by the Lorentz transformation $L$ between the two frames. It is the inverse of the transformation of the coordinates that the animation shows for this step, so its factors stand in the same order with the opposite signs of the angles:`)),
      D(raw`\lvert\,\cdot\,\rangle${sp}=L\,\lvert\,\cdot\,\rangle${sm}\,,\qquad L=${L}\,.`),
      h('ul', { class: 'amp-factors' }, ops.map(op => h('li', {}, [sym(inverse(op)), ' ', ...mt(op.description.replace(/^(?!Greenwich)./, c => c.toLowerCase()) + '.')]))),
      P(...mtex(`The vertex is a Lorentz scalar, $U(L)^{-1}\\,V\\,U(L)=V$. Inserting $L$ on both sides of the matrix element therefore does not change $V$ but transforms the initial and the final state into the rest frame of $m$, and the matrix element of the decay can be evaluated there:`)),
      D(raw`\begin{aligned}&{}${sp}\langle f\rvert\,V\,\lvert i\rangle${sp}={}${sm}\langle f\rvert\,U(L)^{-1}\,V\,U(L)\,\lvert i\rangle${sm}={}${sm}\langle f\rvert\,V\,\lvert i\rangle${sm}\\ &\text{with}\quad\lvert i\rangle=\lvert\vec p_m;\lambda_m\rangle\,,\quad\lvert f\rangle=\lvert\vec p_a,\vec p_b;\lambda_a,\lambda_b\rangle\,.\end{aligned}`),

      // ---- partial waves
      P(...mtex(`In the rest frame the particle $m$ is at rest and has the spin $j_m$, whose projection on the $z$ axis is its helicity, $\\lambda_m$. The state of the two daughters is expanded in states of the total angular momentum $J$ and its projection $M$, with the Wigner $D$ functions of the Euler angles $(\\varphi,\\vartheta,0)$ of the direction of $a$ (see the `), h('button', { type: 'button', class: 'link-button', text: 'Euler rotations', onclick: openEuler }), ...mtex(` above):`)),
      D(raw`\lvert\Omega;\lambda_a,\lambda_b\rangle=\sum_{J=\lvert\lambda_a-\lambda_b\rvert}^{\infty}\ \sum_{M=-J}^{J}\sqrt{\frac{2J+1}{4\pi}}\;D^{J}_{M,\lambda_a-\lambda_b}(\varphi,\vartheta,0)\;\lvert J,M;\lambda_a,\lambda_b\rangle\,.`),
      P(...mtex(`The sum over $J$ has no upper limit, since the orbital angular momentum is not restricted; it begins at $\\lvert\\lambda_a-\\lambda_b\\rvert$. The interaction conserves the total angular momentum and its projection, $\\langle J,M;\\lambda_a,\\lambda_b\\vert\\,V_v\\,\\vert j_m,\\lambda_m\\rangle\\propto\\delta_{Jj_m}\\,\\delta_{M\\lambda_m}$, so that of the whole sum only the term with $J=j_m$ and $M=\\lambda_m$ remains. What is left of the matrix element is the helicity coupling $h$ of the vertex, which carries the dynamics of the decay and does not depend on the orientation; the normalisation of the state of the decaying particle is part of it:`)),
      D(raw`h_{\lambda_a\lambda_b}=\langle E_m;J=j_m,M=\lambda_m;\lambda_a,\lambda_b\vert\,V_v\,\vert E_m;j_m,\lambda_m\rangle\,.`),
      P(...mtex(`The bra of the final state brings the complex conjugate of the $D$ function. With the factor of the normalisation of the final state, the matrix element of the decay is`)),
      D(raw`${MV}=\sqrt{\frac{2\pi}{\rho}}\,\sqrt{\frac{2j_m+1}{4\pi}}\;D^{\,j_m\,*}_{\lambda_m,\lambda_a-\lambda_b}(\varphi_a,\vartheta_a,0)\;(-1)^{j_b-\lambda_b}\;h_{\lambda_a\lambda_b}\,.`),
      P(...mtex(`The phase $(-1)^{j_b-\\lambda_b}$ belongs to the spectator and is explained below. The factor $\\sqrt{2\\pi/\\rho}$ is the phase-space factor; in the amplitude row of the `), link('dynamic', 'dynamic view'), ...mtex(` it is not written, since the row gives $\\mathcal M$ only up to such factors. The other factors are the terms that the animation adds to the row when it reaches the frame $${T(`[${Fm}]`)}$: the normalisation, the $D$ function, the phase and the coupling.`)),
    );
    return nodes;
  }

  const root = h('div', { class: 'derivation' });
  return { root, show(v) { root.replaceChildren(...derive(v)); } };
}

/** The phase of the spectator (it does not depend on the chosen decay). */
export function buildSpectatorPhase() {
  const P = (...nodes) => h('p', {}, nodes.flat());
  const D = tex => h('div', { class: 'formula' }, [texNode(tex, { display: true })]);
  return [
    h('h4', { text: 'The phase of the spectator' }),
    P(...mtex(`The two daughters of a decay are treated differently in the helicity formalism. In the rest frame of the decaying particle the reference particle $a$ is reached from its own rest frame by the rotation $R(\\varphi,\\vartheta,0)=R_z(\\varphi)R_y(\\vartheta)$ and a boost along $z$. The spectator $b$ is reached by the same rotation, a half-turn about the $y$ axis and the boost:`)),
    D(raw`\Lambda_{m\leftarrow a}=R(\varphi,\vartheta,0)\,B_z(\eta_a)\,,\qquad\Lambda_{m\leftarrow b}=R(\varphi,\vartheta,0)\,R_y(\pi)\,B_z(\eta_b)\,.`),
    P(...mtex(`The half-turn $R_y(\\pi)$ is the factor that the animation shows as the step $R_y(-\\pi)$ in the transport of a spectator. Because the state of the second particle is defined with it, the amplitude of a decay is written with the helicity vertex function $H$, and this function differs from the helicity coupling $h$ in the convention of the second particle by a phase,`)),
    D(raw`H_{\lambda_a\lambda_b}=(-1)^{j_b-\lambda_b}\,h_{\lambda_a\lambda_b}\,,`),
    P(...mtex(`which arises from the definition of the state of the second particle (Jacob and Wick; Habermann and Mikhasenko, Eq. 10). The coupling $h$ has convenient transformation properties under parity, and it is $h$ that is usually given. The half-turn and the phase therefore matter at three places of the construction:`)),
    h('ul', { class: 'amp-factors' }, [
      h('li', {}, mtex(`in the transport of the spectator: its Lorentz transformation into the frame of the decay contains $R_y(\\pi)$, and its rest frame is reached through it;`)),
      h('li', {}, mtex(`in the amplitude of every decay: the phase $(-1)^{j_b-\\lambda_b}$ stands in front of $h$, with the helicity $\\lambda_b$ of the spectator as measured in the frame of its production;`)),
      h('li', {}, mtex(`at every intermediate state: its helicity appears twice, in its production vertex (in the phase as well, if it is a spectator) and in the $D$ function of its own decay; the two values are the same, since the transformations between the frames ensure it, and they are summed over at the propagator. If the intermediate state is the spectator of its parent, its rest frame is reached through the half-turn as well, and its own decay is evaluated there in the same way as that of a reference particle.`))]),
  ];
}
