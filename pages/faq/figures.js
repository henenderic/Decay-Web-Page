// The figures of the pages of the FAQ. A page refers to a figure by its id (F2.1 ... F3.4, see FIGURES at the end); a figure is built when its page is shown.
// F2.1 and F2.3 are the finished pictures of the page "Amplitude construction" (render/experiments_figure.js, render/dalitz.js), F2.2 is a picture of the author (img/),
// F3.1 to F3.4 are the Feynman sketches of render/sketch.js and render/blobs.js with labels on top. The labels are KaTeX text in boxes that lie over the sketch, placed by the
// coordinates of the sketch; the leaders and arrows are lines in the sketch itself. No figure shows numerical values.
import { h, texNode } from '../../app/common.js';
import { buildSketch } from '../../render/sketch.js';
import { diagram, onCircle } from '../../render/blobs.js';
import { buildDalitzPlot } from '../../render/dalitz.js';
import { EXPERIMENT_FIGURE } from '../../render/experiments_figure.js';
import { figure41 as figure41Interactive } from './figures_shell.js';
import { figure41 as figure41Static } from './figures_shell_static.js';
const SHELL_INTERACTIVE = true;                 // false gives back the static figure 4.1 of 3 November 2026 (figures_shell_static.js)
const figure41 = SHELL_INTERACTIVE ? figure41Interactive : figure41Static;
import { figure51, figure52 } from './figures_rotation.js';
import { figure61 } from './figures_frames.js';
import { figure42 } from './figures_channels.js';
import { figure71 } from './figures_helicity.js';
import { figure91, figure92 } from './figures_pair.js';

const VERSION = new URL(import.meta.url).search;                  // the files of a deployment carry a version in their addresses; the images follow it
const fileUrl = name => { const u = new URL(name, import.meta.url); u.search = VERSION; return u.href; };
const NS = 'http://www.w3.org/2000/svg';
const INK = '#33434B', GUIDE = '#7C8A92', ACCENT = '#0F7C8F';

const svgEl = (tag, attrs = {}, parent = null) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  parent?.appendChild(e);
  return e;
};
const f = x => (Math.round(x*1e3)/1e3).toString();

// ------------------------------------------------------------------ topologies of the sketches
const leaf = n => ({ name: String(n), display: String(n), leaf: true });
const pair = (a, b) => ({ name: `(${a.name} ${b.name})`, display: `(${a.display}${b.display})`, leaf: false, children: [a, b] });
const T_12_3 = pair(pair(leaf(1), leaf(2)), leaf(3));            // ((12)3): the mother decays into (12) and 3, then (12) into 1 and 2
const T_1_23 = pair(leaf(1), pair(leaf(2), leaf(3)));            // (1(23)): the mother decays into 1 and (23), then (23) into 2 and 3

// ------------------------------------------------------------------ a sketch with labels on top
/** A sketch in a box with labels. The coordinates of the labels and leaders are those of the sketch (x to the right, y up, the line of a decay has the length 1).
 *  o: {labels, width: design width in px (sets the size of the names), labelPx, room: {left, right, top, bottom}: extra room around the sketch in these units} */
function sketchCanvas(topology, { labels = true, width = 520, labelPx = 15, room = {} } = {}) {
  const sk = buildSketch(topology, { labels, width, labelPx });
  const svg = sk.svg, vb = svg.viewBox.baseVal;
  const box = { x: vb.x-(room.left || 0), y: vb.y-(room.top || 0), w: vb.width+(room.left || 0)+(room.right || 0), h: vb.height+(room.top || 0)+(room.bottom || 0) };
  svg.setAttribute('viewBox', `${f(box.x)} ${f(box.y)} ${f(box.w)} ${f(box.h)}`);
  svg.removeAttribute('role'); svg.setAttribute('aria-hidden', 'true');
  const root = h('div', { class: 'faq-canvas', style: `max-width:${width}px` }, [svg]);
  const uid = Math.random().toString(36).slice(2, 8);
  const defs = svgEl('defs', {}, svg);
  const head = svgEl('marker', { id: `h${uid}`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
  svgEl('path', { d: 'M0 0L10 5L0 10z', fill: GUIDE }, head);
  const pos = (x, y) => `left:${f((x-box.x)/box.w*100)}%;top:${f((-y-box.y)/box.h*100)}%`;
  const api = {
    root, svg, layout: sk.layout, box,
    /** A line in the units of the sketch, optionally with an arrowhead at its end (or at both ends). */
    line(x1, y1, x2, y2, { arrow = false, both = false, dash = false, color = GUIDE } = {}) {
      svgEl('line', { x1: f(x1), y1: f(-y1), x2: f(x2), y2: f(-y2), stroke: color, 'stroke-width': 1.5, 'stroke-dasharray': dash ? '4 3' : null, 'vector-effect': 'non-scaling-stroke',
                      'marker-end': arrow ? `url(#h${uid})` : null, 'marker-start': both ? `url(#h${uid})` : null }, svg);
    },
    /** A label: KaTeX (tex) or plain words (words), centred on (x, y) or with its left or right end there. */
    label(x, y, content, { align = 'center', words = false } = {}) {
      const node = h('span', { class: `faq-label${words ? ' faq-note' : ''} ${align}`, style: pos(x, y) }, words ? content : texNode(content));
      root.append(node);
      return node;
    }
  };
  return api;
}

const names = { v12_3: String.raw`((12)3)_\mathrm v`, v12: String.raw`(12)_\mathrm v`, i12: String.raw`(12)_\mathrm i` };

/** Figure 3.1: the elements of a sketch. */
function figure31() {
  const c = sketchCanvas(T_12_3, { room: { bottom: .55, left: .1, top: .1, right: .15 } });
  c.label(.18, .98, 'double line', { align: 'right', words: true }); c.line(.2, .93, .45, .5);
  c.label(-.12, -.62, 'vertex', { align: 'right', words: true }); c.line(-.1, -.54, -.02, -.07);
  c.label(.42, -1.02, 'single line', { align: 'right', words: true }); c.line(.45, -.97, .62, -.58);
  const y = -1.36;
  c.line(-.55, y, .75, y, { arrow: true }); c.label(.84, y, 'time', { align: 'left', words: true });
  return c.root;
}

/** Figure 3.2: the same sketch with the factor of every element. */
function figure32() {
  const c = sketchCanvas(T_12_3, { labels: 'names', room: { bottom: .85, left: .1, top: .2, right: .15 } });
  c.label(-.08, -.32, String.raw`V_{${names.v12_3}}`, { align: 'right' });
  c.label(.38, .88, String.raw`G_{${names.i12}}`, { align: 'right' });
  c.label(.92, 1.12, String.raw`V_{${names.v12}}`, { align: 'right' });
  c.label(.38, -.8, String.raw`\one_{3_\mathrm p}`, { align: 'right' });
  const y = -1.42;
  c.line(1.7, y, .1, y, { arrow: true });
  c.label(.9, y-.2, 'read the expression from right to left', { words: true });
  return c.root;
}

/** Figure 3.3: two topologies side by side. */
function figure33() {
  const left = sketchCanvas(T_12_3, { width: 380, labelPx: 14, room: { left: .1, right: .1, top: .15, bottom: .15 } });
  const right = sketchCanvas(T_1_23, { width: 380, labelPx: 14, room: { left: .1, right: .1, top: .15, bottom: .15 } });
  left.label(.2, 1.02, 'reference', { align: 'right', words: true }); left.line(.22, .97, .46, .5);
  left.label(.2, -1.02, 'spectator', { align: 'right', words: true }); left.line(.22, -.97, .46, -.5);
  const caption = (tex, c) => h('div', { class: 'faq-pair-item' }, [c.root, h('div', { class: 'faq-pair-name' }, [texNode(tex)])]);
  return h('div', { class: 'faq-pair' }, [caption(String.raw`((12)3)`, left), caption(String.raw`(1(23))`, right)]);
}

/** Figure 3.4: a scattering process with a decay attached: A and B enter a hatched area, from which 0 and C come, and 0 decays as in figure 3.1. */
function figure34() {
  const W = 760, H = 390, d = diagram(W, H, 'A scattering process in which two particles produce the mother 0 and a further particle C, and the mother decays through an intermediate state');
  const b = { x: 150, y: 275 }, r = 52;
  const a = { x: 26, y: 195 }, bb = { x: 26, y: 355 };
  d.line(a, onCircle(a, b, r)); d.line(bb, onCircle(bb, b, r));
  d.name(a.x-8, a.y-12, 'A', 'p', 'start'); d.name(bb.x-8, bb.y+26, 'B', 'p', 'start');
  // the decay sketch, as in figure 3.1; its line of the mother is replaced by a line from the hatched area
  const sk = buildSketch(T_12_3, { labels: 'names', width: 380, labelPx: 15 }), vb = sk.svg.viewBox.baseVal;
  sk.svg.querySelector('text')?.remove();                                                         // the name of the mother
  sk.svg.querySelector('g')?.remove();                                                            // and its line
  const sw = 380, sh = sw*vb.height/vb.width, sx = 300, scale = sw/vb.width;
  const mother = { x: sx+(0-vb.x)*scale, y: 195 };                                                // the vertex of the mother
  const nest = svgEl('svg', { x: sx, y: mother.y-(0-vb.y)*scale, width: sw, height: sh, viewBox: `${vb.x} ${vb.y} ${vb.width} ${vb.height}` }, d.svg);
  while (sk.svg.firstChild) nest.append(sk.svg.firstChild);
  const from = onCircle(mother, b, r), end = { x: mother.x-6, y: mother.y+2 };
  d.line(from, end);
  d.name((from.x+end.x)/2-4, (from.y+end.y)/2-16, '0', 'p');
  const c = { x: 700, y: 372 };
  d.line(onCircle(c, b, r), c); d.name(c.x+8, c.y+5, 'C', 'p', 'start');
  d.blob(b, r);
  return h('div', { class: 'faq-canvas wide' }, [d.svg]);
}


/** Figure 11.1: a decay into four particles with the subsystem (12) marked by a frame; seen from outside it acts as one particle of the mass m_12. */
function figure111() {
  const T = pair(pair(pair(leaf(1), leaf(2)), leaf(3)), leaf(4));
  const c = sketchCanvas(T, { labels: 'names', width: 440, labelPx: 15, room: { left: .1, right: .35, top: .35, bottom: .3 } });
  const sub = c.layout.byName.get('(1 2)'), one = c.layout.byName.get('1'), two = c.layout.byName.get('2');
  const x0 = sub.x-.08, x1 = one.x+.42, y0 = two.y-.28, y1 = one.y+.28;
  for (const [a, b, d, e] of [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]]) c.line(a, b, d, e, { color: ACCENT, dash: true });
  c.label(x0+.02, y1+.12, String.raw`\text{acts as one particle: }m_{12}`, { align: 'left' });
  return c.root;
}

/** Figure 2.1: a collision at a collider and at a fixed target. */
const figure21 = () => { const box = h('div', { class: 'faq-svg' }); box.innerHTML = EXPERIMENT_FIGURE; return box; };

/** Figure 2.2: the production vertex, the decay vertices and the tracks in a detector (a picture of the author). */
const figure22 = () => h('img', { class: 'faq-picture', src: fileUrl('img/production-decay-vertices.png'), alt: 'Sketch of an event in a detector: the primary vertex, secondary vertices and tracks that pass the detector layers',
                                  width: 1210, height: 1000, loading: 'lazy' });

/** Figure 2.3: a schematic Dalitz plot. */
const figure23 = () => h('div', { class: 'faq-svg' }, [buildDalitzPlot()]);

export const FIGURES = { 'F2.1': figure21, 'F2.2': figure22, 'F2.3': figure23, 'F3.1': figure31, 'F3.2': figure32, 'F3.3': figure33, 'F3.4': figure34, 'F4.1': figure41, 'F4.2': figure42, 'F5.1': figure51, 'F5.2': figure52, 'F6.1': figure61, 'F7.1': figure71, 'F9.1': figure91, 'F9.2': figure92, 'F11.1': figure111 };
