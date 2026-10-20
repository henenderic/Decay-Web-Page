// The Decay Description: the kind of decay, the momenta, the topologies and the examples.
//
// The kind of decay (the number of final-state particles) fixes the rows of momenta. Every particle has an energy and the three components of its momentum in the laboratory frame;
// its mass follows from them, and the momentum of the mother (0) is the sum of the final states. The topology is written as an ordered binary tree with spaces, e.g. ((1 2) 3):
// the first topology is the topology of the decay, the optional second one is the reference topology I (the first one is then II). "Build Example" enters random momenta and
// energies with one decimal. The form is the single source of the event that is sent to the computation core.
import { $, h, sym } from './common.js';

const MIN_DAUGHTERS = 2, MAX_SELECTABLE = 8, MAX_DAUGHTERS = 32;      // the core accepts up to 32 final states, the menu offers the usual ones
const fmt = x => String(Number(x.toPrecision(12)));
const short = x => String(Number(x.toPrecision(4)));                                  // masses follow from the entered numbers; four digits are enough to read them
const tenths = x => Math.abs(x*10-Math.round(x*10)) < 1e-9 ? x.toFixed(1) : fmt(x);      // numbers with one decimal are shown with one decimal: 2.0, not 2
const number = text => text.trim() === '' ? NaN : Number(text.trim());

// ------------------------------------------------------------------ topologies as text
const treeToString = t => Array.isArray(t) ? '('+t.map(treeToString).join(' ')+')' : String(t);
/** Parses a topology string such as "((1 2) 3)" into nested arrays; null if it is not well formed. */
export function parseTree(text) {
  const tokens = text.replace(/[()]/g, m => ` ${m} `).split(/\s+/).filter(Boolean);
  let pos = 0;
  const node = () => {
    const t = tokens[pos++];
    if (t === undefined || t === ')') throw new Error('malformed');
    if (t !== '(') return t;
    const kids = [];
    while (tokens[pos] !== ')') { if (pos >= tokens.length) throw new Error('malformed'); kids.push(node()); }
    pos++;
    return kids;
  };
  try { const tree = node(); return pos === tokens.length ? tree : null; } catch { return null; }
}
const mapLeaves = (tree, f) => Array.isArray(tree) ? tree.map(k => mapLeaves(k, f)) : f(tree);
const leavesOf = tree => Array.isArray(tree) ? tree.flatMap(leavesOf) : [tree];
const asTree = value => typeof value === 'string' ? parseTree(value.trim()) : value;
const isBinary = tree => !Array.isArray(tree) || (tree.length === 2 && tree.every(isBinary));
/** The topology of a decay in which the final states are joined one after the other: (1 2), ((1 2) 3), (((1 2) 3) 4), … */
const chainTopology = n => Array.from({ length: n-1 }, (_, i) => String(i+2)).reduce((tree, id) => `(${tree} ${id})`, '1');

// ------------------------------------------------------------------ rows of momenta
const cards = { mother: null, daughters: [] };

/** A row for the mother (role 'mother', its momentum is the sum of the final states) or for a final state. */
function createCard(role) {
  const mother = role === 'mother';
  const field = (cls, label, readonly) => h('input', { class: 'comp '+cls, inputmode: 'decimal', 'aria-label': label, readonly, spellcheck: 'false' });
  const m = field('f-m', 'Mass', true), e = field('f-e', 'Energy', mother);
  const px = field('f-px', 'Momentum px', mother), py = field('f-py', 'Momentum py', mother), pz = field('f-pz', 'Momentum pz', mother);
  const head = h('div', { class: 'pc-head' }, h('h4', {}, [mother ? 'Mother ' : 'Final state ', h('span', { class: 'pc-number', text: mother ? '0' : '' })]));
  const table = h('table', { class: 'input-table pc-table' }, [
    h('thead', {}, h('tr', {}, [h('th', {}, sym('m')), h('th', {}, sym('E')), h('th', {}, sym('p_x')), h('th', {}, sym('p_y')), h('th', {}, sym('p_z'))])),
    h('tbody', {}, h('tr', {}, [m, e, px, py, pz].map(i => h('td', {}, i))))]);
  const card = { root: h('article', { class: 'particle-card' + (mother ? ' mother-card' : ''), 'data-role': role }, [head, table]), role, m, e, px, py, pz };
  for (const input of [e, px, py, pz]) input.addEventListener('input', () => update());
  return card;
}

const vectorOf = card => {
  const four = [card.e, card.px, card.py, card.pz].map(i => number(i.value));
  return four.some(x => !Number.isFinite(x)) ? null : four;
};
const invariant = v => v[0]**2 - v[1]**2 - v[2]**2 - v[3]**2;

/** Recomputes the grey fields: the masses and the momentum of the mother. */
export function update() {
  let sum = [0, 0, 0, 0], complete = true;
  for (const card of cards.daughters) {
    const four = vectorOf(card);
    card.m.value = four && invariant(four) >= 0 ? short(Math.sqrt(invariant(four))) : '';
    if (four) sum = sum.map((x, i) => x + four[i]); else complete = false;
  }
  const mother = cards.mother;
  [mother.e, mother.px, mother.py, mother.pz].forEach((input, i) => { input.value = complete ? tenths(sum[i]) : ''; });
  mother.m.value = complete && invariant(sum) >= 0 ? short(Math.sqrt(invariant(sum))) : '';
  cards.daughters.forEach((card, i) => { card.root.querySelector('.pc-number').textContent = String(i+1); });
}

// ------------------------------------------------------------------ the kind of decay
const kindSelect = () => $('decay-kind');
function ensureKindOption(n) {
  const select = kindSelect();
  if (![...select.options].some(o => Number(o.value) === n)) select.append(h('option', { value: String(n), text: `${n} particles` }));
  select.value = String(n);
}
/** Sets the number of final states. Rows that stay keep their values; a topology that is the standard one of the old number (or empty) follows the new number. */
function setCount(n) {
  const old = cards.daughters.length, field = $('decay');
  while (cards.daughters.length < n) { const card = createCard('daughter'); cards.daughters.push(card); $('daughters').append(card.root); }
  while (cards.daughters.length > n) cards.daughters.pop().root.remove();
  ensureKindOption(n);
  if (old !== n && (field.value.trim() === '' || field.value.trim() === chainTopology(old))) field.value = chainTopology(n);
  syncLabel();
  update();
}

// ------------------------------------------------------------------ event <-> form
let decayLabel = 'II';                                         // the name of the chain of the topology when there is a reference topology (II unless it is changed); the reference topology is I
/** True if a reference topology is given that differs from the topology (an identical one is no second topology). */
function hasReference() {
  const reference = $('reference').value.trim();
  if (!reference) return false;
  const a = parseTree(reference), b = parseTree($('decay').value.trim());
  return !(a && b && treeToString(a) === treeToString(b));
}
/** The field for the name of the chain: grey with I without a reference topology (then the topology is the reference topology), otherwise II or the name that was entered. */
function syncLabel() {
  const field = $('decay-label'), given = hasReference();
  field.disabled = !given;
  field.value = given ? decayLabel : 'I';
}

/** The event for the computation core; throws an Error with a readable message for incomplete input. */
export function formToEvent() {
  update();
  const final_states = {};
  cards.daughters.forEach((card, i) => {
    const id = String(i+1), four = vectorOf(card);
    if (!four) throw new Error(`Final state ${id}: enter the energy and all components of the momentum as numbers; use a period as decimal separator.`);
    final_states[id] = four.map(x => Number(x.toPrecision(15)));
  });
  const mother = [0, 1, 2, 3].map(k => Number(Object.values(final_states).reduce((sum, v) => sum + v[k], 0).toPrecision(15)));
  const n = cards.daughters.length, decay = $('decay').value.trim(), reference = $('reference').value.trim();
  const expected = Array.from({ length: n }, (_, i) => String(i+1)).join(' ');
  for (const [text, name] of [[decay, 'The topology'], [reference, 'The reference topology']]) {
    if (!text && name === 'The reference topology') continue;
    const tree = parseTree(text);
    if (!tree || !Array.isArray(tree) || !isBinary(tree) || leavesOf(tree).map(String).sort((a, b) => a-b).join(' ') !== expected)
      throw new Error(`${name} must be written as pairs in brackets with spaces, using each of the numbers 1 to ${n} exactly once, for example ${chainTopology(n)}.`);
  }
  const differs = hasReference();
  const event = { mother, final_states, reference_topology: reference || decay, decay_topology: decay, reference_label: 'I', degenerate: $('canonical').checked ? 'canonical' : 'error' };
  if (differs) event.decay_label = decayLabel;
  return event;
}

/** Fills the form from an event. The final states are renumbered 1, 2, … in the order of the event; the topologies follow. */
export function eventToForm(event) {
  const states = event && event.final_states;
  const ids = states && typeof states === 'object' ? Object.keys(states) : [];
  if (ids.length < MIN_DAUGHTERS || ids.length > MAX_DAUGHTERS) throw new Error(`"final_states" must contain between ${MIN_DAUGHTERS} and ${MAX_DAUGHTERS} particles.`);
  for (const id of ids) {
    const v = states[id];
    if (!Array.isArray(v) || v.length !== 4 || v.some(x => typeof x !== 'number' || !Number.isFinite(x))) throw new Error(`Final state "${id}" needs four numbers (E, px, py, pz).`);
  }
  if (event.reference_topology == null || event.decay_topology == null) throw new Error('"reference_topology" and "decay_topology" are required.');
  const map = new Map(ids.map((id, i) => [id, String(i+1)]));
  setCount(ids.length);
  ids.forEach((id, i) => {
    const card = cards.daughters[i], v = states[id];
    card.e.value = tenths(v[0]); card.px.value = tenths(v[1]); card.py.value = tenths(v[2]); card.pz.value = tenths(v[3]);
  });
  const rename = tree => { const t = asTree(tree); return t ? treeToString(mapLeaves(t, leaf => map.get(leaf) ?? leaf)) : String(tree); };
  $('decay').value = rename(event.decay_topology);
  $('reference').value = rename(event.reference_topology) === $('decay').value ? '' : rename(event.reference_topology);
  decayLabel = event.decay_label || 'II';
  $('canonical').checked = event.degenerate === 'canonical';
  syncLabel();
  update();
}

// ------------------------------------------------------------------ Build Example
const randomInt = (a, b) => a+Math.floor(Math.random()*(b-a+1));
/**
 * Enters random momenta and energies with one decimal for the chosen kind of decay: the components of the momenta are between −2.0 and 2.0 with a transverse part of at least 0.3,
 * the energy lies above the length of the momentum, so that every final state has a mass. The mother must fly (it gets an azimuth) and not at once along the z axis.
 */
export function buildExample() {
  for (let attempt = 0; attempt < 100; attempt++) {
    const rows = cards.daughters.map(() => {
      let p;
      do p = [randomInt(-20, 20), randomInt(-20, 20), randomInt(-20, 20)]; while (p[0]**2 + p[1]**2 < 9);       // tenths: the transverse part is at least 0.3
      const energy = Math.ceil(Math.hypot(...p)+3) + randomInt(0, 12);                                           // tenths: above the length of the momentum by 0.3 or more
      return [energy, ...p];
    });
    const total = [1, 2, 3].map(k => rows.reduce((sum, r) => sum + r[k], 0));
    if (Math.hypot(...total) < 5 || total[0]**2 + total[1]**2 < 4) continue;                                    // the mother flies, with a transverse part of at least 0.2
    rows.forEach((row, i) => { const card = cards.daughters[i]; [card.e.value, card.px.value, card.py.value, card.pz.value] = row.map(x => (x/10).toFixed(1)); });
    break;
  }
  update();
}

/** Builds the form: the mother, the final states of a three-body decay and the menu of the kind of decay. */
export function initDecayForm() {
  cards.mother = createCard('mother');
  $('mother-card').append(cards.mother.root);
  const select = kindSelect();
  for (let n = MIN_DAUGHTERS; n <= MAX_SELECTABLE; n++) select.append(h('option', { value: String(n), text: `${n} particles` }));
  select.addEventListener('input', () => setCount(Number(select.value)));
  $('decay').addEventListener('input', syncLabel);
  $('reference').addEventListener('input', syncLabel);
  $('decay-label').addEventListener('input', () => { decayLabel = $('decay-label').value.replace(/[{}\\^_~@$]/g, '').trim() || 'II'; });         // the name is set in the notation of the page: no markup characters
  setCount(3);
  syncLabel();
}
