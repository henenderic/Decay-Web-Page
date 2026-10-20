import { rotateView, IDENTITY } from '../render/drawing.js';
import { toTex } from '../render/tex.js';

export const $ = id => document.getElementById(id);
export function h(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, ''); else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of [children].flat(Infinity)) if (c != null) e.append(c);
  return e;
}
export const MINUS = '\u2212';
/** Label size in pixels for a figure of the given width: all figures use the same rule, so the text is about equally large everywhere. */
export const figureLabelPx = width => Math.round(Math.min(15, Math.max(11, (width || 560)/50))*2)/2;
export const num = (x, d = 4) => (Math.abs(x) < 5*10**-(d+1) ? 0 : x).toFixed(d).replace('-', MINUS);

// ------------------------------------------------------------------ mathematics: the markup of the page, set by KaTeX
// The macros of the manuscript are defined here; they name objects in the sources of the page and never appear on it.
const MACROS = {
  '\\prt': '#1_{\\text{p}}', '\\itl': '#1_{\\text{i}}', '\\vtc': '#1_{\\text{v}}',
  '\\frame': '{}^{\\htmlClass{frame}{\\scriptscriptstyle[#1]}}',
  '\\Int': '\\text{d}',
  '\\one': '\\mathbf{1}'                                         // the unit operator (KaTeX has no double-struck 1)
};
const cache = new Map();
/** A span with the formula `tex` set by KaTeX. Without KaTeX (the files of the page are incomplete) the source stays readable. */
export function texNode(tex, { display = false } = {}) {
  const node = h('span', { class: display ? 'sym sym-display' : 'sym' });
  const key = (display ? 'D' : 'I') + tex;
  let html = cache.get(key);
  if (html === undefined) {
    try {
      html = window.katex.renderToString(tex, { throwOnError: false, strict: false, output: 'html', displayMode: display, macros: { ...MACROS },
                                                trust: context => context.command === '\\htmlClass' });
    } catch (e) { html = null; }
    cache.set(key, html);
  }
  if (html === null) node.textContent = tex; else node.innerHTML = html;
  return node;
}
export const sym = (markup, all = false, options = {}) => texNode(toTex(markup, 0, all), options);
// Names of the manuscript (macros \prt, \itl, \vtc): a particle 1_p, an intermediate state (1 2)_i, a vertex (1 2)_v. They name objects in text and decay
// expressions; momentum and helicity indices and frame labels keep the plain names.
export const up = text => `@{${text}}`;
export const prt = name => `${name}_{@{p}}`;
export const itl = name => `${name}_{@{i}}`;
export const vtc = name => `${name}_{@{v}}`;
export const named = (name, internal) => internal ? itl(name) : prt(name);
/** The whole decay of an event in the notation of the manuscript, mother → final states: 0_p → 1_p + 2_p + 3_p. */
export const eventDecay = event => `${prt('0')} → ${Object.keys(event.final_states).map(prt).join(' + ')}`;
/** Text with inline mathematics: segments between $ ... $ are set as mathematics. A segment of letters only, such as $xy$, gives italic letters;
 *  anything else uses the markup of sym (scripts with _ and ^, ~ for a vector arrow). Use \\$ for a dollar sign. */
export function mt(text, all = false) {
  const parts = String(text).split(/(?<!\\)\$/), out = [];
  parts.forEach((part, i) => {
    const math = i % 2 === 1 && i < parts.length - (parts.length % 2 === 0 ? 1 : 0);
    if (!math) { if (part) out.push((i % 2 === 1 ? '$' : '') + part.replace(/\\\$/g, '$')); }
    else if (/^[A-Za-zα-ωΑ-Ωϑφλχη′″]+$/.test(part)) out.push(sym(part, true));
    else out.push(sym(part, all));
  });
  return out;
}
/** Text with inline mathematics written in TeX: the segments between $ ... $ are set by KaTeX as they stand. */
export function mtex(text) {
  const parts = String(text).split(/(?<!\\)\$/);
  return parts.map((part, i) => (i % 2 === 1 && i < parts.length - (parts.length % 2 === 0 ? 1 : 0)) ? texNode(part) : part.replace(/\\\$/g, '$')).filter(part => part !== '');
}
/** The same text for places that take plain strings only (title attributes): the dollar signs and the markup braces are removed. */
export const plain = text => String(text).replace(/(?<!\\)\$/g, '').replace(/\\\$/g, '$').replace(/[{}]/g, '').replace(/~/g, '');
export const tagNode = markup => texNode('[' + toTex(markup) + ']');

// ------------------------------------------------------------------ tooltips
/** The bubble of a chip, button or term sits inside the box (card or page) that holds it: it is moved sideways when it would stick out, and put below its host
 *  when there is no room above. */
function placeTip(host) {
  const tip = host.querySelector(':scope > .tip');
  if (!tip || tip.hidden) return;
  const margin = 6, box = (host.closest('.frame-card, .page-body') || document.body).getBoundingClientRect();
  tip.classList.remove('below'); tip.style.left = '0px'; tip.style.maxWidth = Math.max(160, box.width-2*margin)+'px';
  const display = tip.style.display, visibility = tip.style.visibility;
  tip.style.display = 'block'; tip.style.visibility = 'hidden';                    // measure it, whether or not the style sheet shows it already
  const r = tip.getBoundingClientRect();
  let dx = 0;
  if (r.right > box.right-margin) dx = box.right-margin-r.right;
  if (r.left+dx < box.left+margin) dx = box.left+margin-r.left;
  tip.style.left = dx+'px';
  if (r.top < Math.max(box.top, 0)+margin) tip.classList.add('below');
  tip.style.display = display; tip.style.visibility = visibility;
}
for (const type of ['mouseover', 'focusin']) document.addEventListener(type, e => {
  const host = e.target instanceof Element ? e.target.closest('.tip-host, .op-chip') : null;
  if (host) placeTip(host);
}, true);

// ------------------------------------------------------------------ global state
export const state = { payload: null, animations: [], pages: {}, page: null, config: null, requestId: 0, showPage: null };

export function setStatus(text, kind = '') { const s = $('status'); s.textContent = text; s.className = kind; }


export const PLANE_KEYS = ['coord', 'particle'];
export const NOTE_KEYS = ['labels', 'angles', 'helicities'];
export const PLANE_NAMES = { coord: 'Coordinate planes (xy, xz, yz)', particle: 'Particle planes (all)' };
export const PLANE_HINTS = { coord: 'Show the three coordinate planes of the frame together.',
                             particle: 'Show the plane spanned by the two daughters of every resonance.' };
export const NOTE_NAMES = { labels: 'Labels', angles: 'Angles', helicities: 'Helicity labels' };




const clampZoom = z => Math.min(4, Math.max(.5, z));
/** Zoom buttons for a view toolbar. */
export function zoomButtons(cs, setCamera) {
  return [['\u2212', 'Zoom out', 1/1.25], ['+', 'Zoom in', 1.25]].map(([text, title, f]) =>
    h('button', { type: 'button', text, title, 'aria-label': title, onclick: () => setCamera(cs.rot, clampZoom(cs.zoom*f)) }));
}

export function attachCamera(svg, cs, setCamera, { zoom = true } = {}) {
  let drag = null;
  svg.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); });
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX-drag.x, dy = e.clientY-drag.y; drag = { x: e.clientX, y: e.clientY };
    setCamera(rotateView(cs.rot, dx*.008, dy*.008), cs.zoom);
  });
  const stop = () => { drag = null; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
  // Plain wheel scrolls the page; zooming needs Ctrl/Cmd (this includes the trackpad pinch gesture) or the +/- buttons.
  if (zoom) svg.addEventListener('wheel', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault(); setCamera(cs.rot, clampZoom(cs.zoom*Math.exp(-e.deltaY*.0012)));
  }, { passive: false });
  svg.addEventListener('dblclick', () => setCamera(IDENTITY.slice(), 1, true, 1));
  svg.addEventListener('keydown', e => {
    const step = .09, k = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (k) { e.preventDefault(); setCamera(rotateView(cs.rot, k[0], k[1]), cs.zoom); }
  });
}


// ------------------------------------------------------------------ export
export function serialize(svg) {
  const clone = svg.cloneNode(true);
  const vb = svg.viewBox.baseVal;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(Math.round(vb.width*100))); clone.setAttribute('height', String(Math.round(vb.height*100)));
  clone.removeAttribute('tabindex'); clone.removeAttribute('class');
  return { text: new XMLSerializer().serializeToString(clone), width: vb.width*100, height: vb.height*100 };
}
export function download(name, blob) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export const fileStem = fig => fig.id.replace(/[^A-Za-z0-9_-]/g, '_');
export function exportSvg(svg, fig) {
  download(fileStem(fig)+'.svg', new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n'+serialize(svg).text], { type: 'image/svg+xml' }));
}
export function exportPng(svg, fig) {
  const { text, width, height } = serialize(svg), scaleUp = 2;
  const img = new Image();
  img.onload = () => {
    const canvas = h('canvas', { width: Math.round(width*scaleUp/1.2), height: Math.round(height*scaleUp/1.2) });
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => { if (blob) download(fileStem(fig)+'.png', blob); }, 'image/png');      // a browser that cannot draw the image gives no blob
  };
  img.src = 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(text);
}


// ------------------------------------------------------------------ shared option controls
/** Builds the per-view option column (particle mode, planes, annotations). `cs` is the view's mutable state. */
export function makeOptions(cs, available, onChange) {
  const inputs = {};
  const checkbox = (key, name, getter, setter, hint) => {
    const input = h('input', { type: 'checkbox', onchange: e => { setter(e.target.checked); onChange(); } });
    inputs[key] = { input, get: getter };
    return h('label', { class: 'check', title: hint || false }, [input, name]);
  };
  const modeButtons = [['full', 'Resonances and final states'], ['final', 'Final states only']].map(([value, text]) =>
    h('button', { type: 'button', 'data-mode': value, text, onclick: () => { cs.mode = value; onChange(); } }));
  const group = (title, children) => children.length ? h('div', { class: 'opt-group' }, [h('div', { class: 'opt-title', text: title }), ...children]) : null;
  const node = h('div', { class: 'card-options' }, [
    available.mode ? group('Particles', [h('div', { class: 'segmented vertical' }, modeButtons)]) : null,
    group('Planes', PLANE_KEYS.filter(k => available[k]).map(k => checkbox('planes.'+k, PLANE_NAMES[k], () => cs.planes[k], v => { cs.planes[k] = v; }, PLANE_HINTS[k]))),
    group('Annotations', NOTE_KEYS.filter(k => available[k]).map(k => checkbox(k, NOTE_NAMES[k], () => cs[k], v => { cs[k] = v; }))),
  ]);
  const sync = () => {
    for (const { input, get } of Object.values(inputs)) input.checked = !!get();
    modeButtons.forEach(b => b.setAttribute('aria-pressed', String(cs.mode === b.dataset.mode)));
  };
  return { node, sync };
}
