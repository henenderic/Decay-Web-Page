// Legend: explains the objects that the current figure (or animation stage) actually shows.
import { h, sym, mt, tagNode, named } from './common.js';
import { forMode } from './drawing.js';

const NS = 'http://www.w3.org/2000/svg';
const ANGLE = '#766094', PARENT = '#394953';

function svgEl(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  parent?.appendChild(e);
  return e;
}

/** Small line sample in the style of the arrows: solid = primary, dashed/dotted = descendants. */
function lineSwatch(color, line, opacity = 1) {
  const s = svgEl('svg', { width: 44, height: 14, viewBox: '0 0 44 14', class: 'swatch', 'aria-hidden': 'true' });
  const y = 7;
  if (line === 'solid') {
    svgEl('path', { d: `M2 ${y-1.6}L32 ${y-1.6}L32 ${y-4.5}L42 ${y}L32 ${y+4.5}L32 ${y+1.6}L2 ${y+1.6}Z`, fill: color, 'fill-opacity': opacity }, s);
  } else if (line === 'thin') {
    svgEl('path', { d: `M2 ${y}L36 ${y}`, stroke: color, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', 'stroke-opacity': opacity }, s);
    svgEl('path', { d: `M42 ${y}L35 ${y-3.2}L35 ${y+3.2}Z`, fill: color, 'fill-opacity': opacity }, s);
  } else if (line === 'guide') {
    svgEl('path', { d: `M2 ${y}L42 ${y}`, stroke: color, 'stroke-width': 1.6, 'stroke-dasharray': '1.3 3.2', 'stroke-linecap': 'round', 'stroke-opacity': opacity }, s);
  } else {
    const dash = line === 'dashed' ? '6 4' : '1.6 4';
    svgEl('path', { d: `M2 ${y}L34 ${y}`, stroke: color, 'stroke-width': line === 'dashed' ? 2.6 : 2.2, 'stroke-dasharray': dash, 'stroke-opacity': opacity, 'stroke-linecap': line === 'dashed' ? 'butt' : 'round' }, s);
    svgEl('path', { d: `M42 ${y}L33 ${y-3.6}L33 ${y+3.6}Z`, fill: color, 'fill-opacity': opacity }, s);
  }
  return s;
}
function areaSwatch(color) {
  const s = svgEl('svg', { width: 44, height: 14, viewBox: '0 0 44 14', class: 'swatch', 'aria-hidden': 'true' });
  svgEl('path', { d: 'M5 11L14 3H40L31 11Z', fill: color, 'fill-opacity': .5, stroke: color, 'stroke-width': 1 }, s);
  return s;
}
function dotSwatch() {
  const s = svgEl('svg', { width: 44, height: 14, viewBox: '0 0 44 14', class: 'swatch', 'aria-hidden': 'true' });
  svgEl('circle', { cx: 22, cy: 7, r: 4, fill: '#26333C' }, s);
  return s;
}
const row = (swatch, label, text) => h('div', { class: 'legend-row' }, [
  h('div', { class: 'legend-key' }, [swatch, label ? h('span', { class: 'legend-sym' }, label) : null]),
  h('div', { class: 'legend-text' }, typeof text === 'string' ? mt(text) : text)]);
const nameOf = (label, leaf) => `$${named(label, !leaf)}$`;          // a particle 1_p or an intermediate state (2 3)_i

/**
 * @param model  figure model (staticModel) or the blended model of a running transformation
 * @param o      {mode, angles, planes, decay, frameName, moving}
 */
export function buildLegend(model, o) {
  const finalOnly = o.mode === 'final';
  model = forMode(model, finalOnly);
  const tag = model.showTag === false ? '' : `^{[${model.tag}]}`;
  const visible = model.vectors.filter(v => v.alpha > .02 && (!finalOnly || v.leaf));
  const labelOf = new Map(model.vectors.map(v => [v.particle, v]));
  const where = o.moving ? 'during the transformation' : `in the frame [${o.frameLabel}]`;

  const momenta = [];
  for (const v of visible.slice().sort((a, b) => a.depth - b.depth)) {
    const name = `the ${v.leaf ? 'final state' : 'resonance'} ${nameOf(v.label, v.leaf)}`;
    const sum = v.leaf || finalOnly ? '' : ', the sum of its two daughters';
    let text;
    if (v.context) text = `Momentum of ${name}. It does not belong to the decay of this frame; it is shown for orientation, in the same frame.`;
    else if (finalOnly) text = `Momentum of ${name}.`;
    else if (v.depth === 0) text = `Momentum of ${name}${sum}, the ${v.role} daughter of the decay $${o.decay}$.`;
    else { const parent = labelOf.get(v.parent); text = `Momentum of ${name}${sum}, a daughter of ${parent ? nameOf(parent.label, parent.leaf) : v.parent}.`; }
    momenta.push(row(lineSwatch(v.color, finalOnly || v.depth === 0 ? 'solid' : v.linestyle, finalOnly ? 1 : Math.max(.5, v.opacity)),
      sym(`~p_{${v.index_markup}}${tag}`), text));
  }
  const par = model.parent;
  if (par.alpha > .02) {
    const long = Math.hypot(...par.spatial)*model.scale > 1e-9*2.85, parentName = `$${named(par.index === '0' ? '0' : par.label, par.index !== '0')}$`;
    if (long) momenta.push(row(lineSwatch(par.color, 'solid'), sym(`~p_{${par.index_markup}}${tag}`),
      par.index === '0' ? `Momentum of the mother ${parentName} entering the decay (incoming arrow).` : `Momentum of the decaying system ${parentName}, entering the decay.`));
    else momenta.push(row(dotSwatch(), sym(`~p_{${par.index_markup}}${tag}=~0`),
      `The decaying system ${parentName} is at rest ${where}, so it has no arrow. Its two daughters are back to back.`));
  }

  // the meaning of the angles and of the parameters of the transformation (no values)
  const meanings = [];
  if (o.angles && model.angles && model.kind === 'vertex') {
    const ref = model.vectors.find(v => v.depth === 0 && v.role === 'reference');
    if (ref) {
      meanings.push(row(lineSwatch(ANGLE, 'solid'), sym(`ϑ_{${ref.index_markup}}, φ_{${ref.index_markup}}`),
        `Polar angle $ϑ$ and azimuth $φ$ of the reference daughter ${nameOf(ref.label, ref.leaf)} in the parent frame, drawn as arcs from the $z$ and the $x$ axis.`));
      meanings.push(row(lineSwatch(ANGLE, 'thin'), sym(`~p_{${ref.index_markup},xy}`),
        `Projection of the momentum of ${nameOf(ref.label, ref.leaf)} onto the $xy$ plane; its azimuth is $φ$.`));
    }
  }
  for (const p of o.parameters || []) meanings.push(row(h('span', { class: 'swatch' }), sym(p.symbol_markup), p.description));

  const other = [];
  if (o.planes?.particle) {
    const byId = new Map(model.vectors.map(v => [v.id, v]));
    for (const pl of model.planes) {
      const a = byId.get(pl.aId), b = byId.get(pl.bId);
      if (!a || !b) continue;
      other.push(row(areaSwatch(pl.color), sym(pl.node),
        `Plane spanned by the momenta of the final states ${nameOf(a.label, a.leaf)} and ${nameOf(b.label, b.leaf)}. It is absent when the two momenta are collinear, for example the decay products in the rest frame of their parent.`));
    }
  }
  if (o.helicities && !o.moving) other.push(row(h('span', { class: 'swatch' }), sym('λ_{i}^{['+o.frameLabel+']}'),
    `Helicity label: the helicity of the particle $i$, measured in the displayed frame [${o.frameLabel}]. The frame in which a helicity is conventionally defined, the rest frame of the parent of the particle, is reached in the dynamic view.`));

  const section = (title, rows) => rows.length ? h('div', { class: 'legend-section' }, [h('div', { class: 'legend-title', text: title }), ...rows]) : null;
  return h('div', { class: 'legend' }, [
    h('div', { class: 'legend-head' }, o.moving ? `Legend: momenta during the transformation ${o.frameName}` : ['Legend: objects shown in ', tagNode(model.tag)]),
    o.moving ? h('p', { class: 'legend-note', text: 'The momenta are shown between two frames; labels carry no frame mark.' }) : null,
    h('div', { class: 'legend-columns' }, [section('Momenta', momenta), section('Angles and parameters', meanings), section('Planes and labels', other)].filter(Boolean))]);
}
