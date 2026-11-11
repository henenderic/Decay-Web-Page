// Figure 4.2 of the FAQ (card 4, Mandelstam variables): the three diagrams of the reaction A + B -> 0 + C with the exchange of one line, in the s-, t- and u-channel.
// Time runs from left to right. The line that carries the four-momentum of the channel is drawn in the accent colour, as a double line in the s-channel (an intermediate state
// that can be a resonance, as in the sketches of card 3) and as a single line in the t- and u-channel (a virtual exchange). The labels are KaTeX text in boxes that lie over
// the drawing (figure_kit.js). The figure shows no numerical values.
import { h } from '../../app/common.js';
import { canvas, INK, ACCENT } from './figure_kit.js';

const W = 220, H = 156;
const IN_A = { x: 36, y: 38 }, IN_B = { x: 36, y: 124 }, OUT_TOP = { x: 184, y: 38 }, OUT_BOTTOM = { x: 184, y: 124 };

/** One panel: `tag` names the channel, `kind` is 's', 't' or 'u', `invariant` is the label of the variable. */
function panel(kind, tag, invariant) {
  const c = canvas(W, H, 300);
  const line = (p, q, color = INK, width = 2) => c.line(p, q, { color, width });
  let v1, v2;
  if (kind === 's') {
    v1 = { x: 82, y: 81 }; v2 = { x: 138, y: 81 };
    line(IN_A, v1); line(IN_B, v1); line(v2, OUT_TOP); line(v2, OUT_BOTTOM);
    for (const dy of [-2.6, 2.6]) c.line({ x: v1.x, y: v1.y+dy }, { x: v2.x, y: v2.y+dy }, { color: ACCENT, width: 1.8 });
  } else {
    v1 = { x: 110, y: 58 }; v2 = { x: 110, y: 104 };
    line(IN_A, v1); line(IN_B, v2);
    if (kind === 't') { line(v1, OUT_TOP); line(v2, OUT_BOTTOM); }
    else { line(v1, OUT_BOTTOM); line(v2, OUT_TOP); }                         // the outgoing lines cross
    c.line(v1, v2, { color: ACCENT, width: 1.8 });
  }
  c.dot(v1, 3.4, INK); c.dot(v2, 3.4, INK);
  c.label(IN_A.x-6, IN_A.y, 'A_\\mathrm p', { align: 'right' }); c.label(IN_B.x-6, IN_B.y, 'B_\\mathrm p', { align: 'right' });
  c.label(OUT_TOP.x+6, OUT_TOP.y, '0_\\mathrm p', { align: 'left' }); c.label(OUT_BOTTOM.x+6, OUT_BOTTOM.y, 'C_\\mathrm p', { align: 'left' });
  c.label(4, 9, tag, { align: 'left', color: INK });
  c.label(W/2, H-10, invariant, { color: ACCENT });
  return c.root;
}

export const figure42 = () => h('div', { class: 'faq-grid faq-grid3' }, [
  panel('s', '\\textbf{(a)}\\ s\\text{-channel}', 's=(p_A^\\mu+p_B^\\mu)^2'),
  panel('t', '\\textbf{(b)}\\ t\\text{-channel}', 't=(p_A^\\mu-p_0^\\mu)^2'),
  panel('u', '\\textbf{(c)}\\ u\\text{-channel}', 'u=(p_A^\\mu-p_C^\\mu)^2')
]);
