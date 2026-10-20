import { $, sym, state, setStatus, eventDecay } from './common.js';
import { buildAnimations } from '../pages/dynamic/transport.js';
import { buildAmplitudePage } from '../pages/amplitude/page.js';
import { buildGreenwichPanel } from '../pages/greenwich/greenwich.js';
import { buildNextStepPage } from '../pages/next-step/nextstep.js';
import { initDecayForm, formToEvent, eventToForm, buildExample } from './decay_form.js';
import { buildPayload } from '../core/payload.js';
import { initialEventFromAddress } from '../core/address.js';

function showError(message) { const e = $('error'); e.hidden = !message; e.textContent = message || ''; }

let timer = null;
function changed() {
  setStatus('Input changed', 'stale');
  clearTimeout(timer);
  timer = setTimeout(() => compute(), 450);
}

/** Shows the animation, centred in the window (after an explicit request to compute). */
function revealAnimation() {
  showPage('dynamic');
  (state.animations[0]?.root.querySelector('.card-main') || $('animations')).scrollIntoView({ block: 'center' });
}

async function compute({ reveal = false } = {}) {
  clearTimeout(timer);
  let event;
  try { event = formToEvent(); } catch (e) { showError(e.message); setStatus('The input is incomplete; the display shows the last valid event.', 'stale'); return; }
  const id = ++state.requestId;
  setStatus('Computing frames', 'busy');
  try {
    const data = buildPayload(event);                                               // the computation core runs in the browser
    if (id !== state.requestId) return;
    showError('');
    state.payload = data;
    rebuild();
    setStatus('');
    if (reveal) revealAnimation();
  } catch (e) {
    if (id !== state.requestId) return;
    showError(e.message);
    setStatus('The input cannot be evaluated; the display shows the last valid event.', 'stale');
  }
}

// ------------------------------------------------------------------ pages
const PAGES = ['dynamic', 'notation', 'amplitude', 'greenwich', 'next'];

/** Shows one page of the application; pages that were built lazily are drawn when they become visible. */
function showPage(name) {
  if (!PAGES.includes(name) || (name === 'next' && $('tab-next').hidden)) name = 'dynamic';
  document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
  document.querySelectorAll('.page').forEach(p => { p.hidden = p.dataset.page !== name; });
  state.page = name;
  requestAnimationFrame(() => {
    if (name === 'dynamic') state.animations.forEach(v => v.render());
    else if (name === 'amplitude') state.pages.amplitude?.draw();
    else if (name === 'greenwich') state.pages.greenwich?.draw();
    else if (name === 'next') state.pages.next?.render();
  });
}
state.showPage = showPage;
/** The Euler rotations are a foldout of the page "Amplitude construction": show that page and open the section. */
state.showEuler = () => {
  showPage('amplitude');
  const section = state.pages.amplitude?.openEuler();
  if (section) requestAnimationFrame(() => section.scrollIntoView?.({ block: 'start' }));
};

function rebuild() {
  const p = state.payload;
  $('result-title').replaceChildren('Decay ', sym(eventDecay(p.event)));
  $('result-subtitle').textContent = `Reference topology ${p.reference_label}: ${p.reference_topology}   ·   decay topology ${p.decay_label}: ${p.decay_topology}`;
  const warnings = [...p.warnings, ...p.figures.flatMap(f => f.warnings)];
  $('warnings').hidden = !warnings.length;
  $('warnings').textContent = [...new Set(warnings)].join('\n');
  state.animations.forEach(sim => sim.stop?.());
  state.pages.greenwich?.stop?.(); state.pages.next?.view.stop(); state.pages.euler?.view.stop();
  state.animations = buildAnimations(p);
  $('animations').replaceChildren(...state.animations.map(sim => sim.root));
  // explanation pages that belong to the event
  state.pages.amplitude = buildAmplitudePage(p);
  $('page-amplitude').replaceChildren(state.pages.amplitude.root);
  state.pages.euler = state.pages.amplitude.euler;                                // the content of the foldout on the page "Amplitude construction"
  state.pages.greenwich = p.greenwich ? buildGreenwichPanel(p) : null;
  $('page-greenwich').replaceChildren(...(state.pages.greenwich ? [state.pages.greenwich.root] : []));
  state.pages.next = buildNextStepPage(p);
  $('page-next').replaceChildren(...(state.pages.next ? [state.pages.next.root] : []));
  $('tab-next').hidden = !state.pages.next;
  if (location.hash === '#euler') state.pages.amplitude.openEuler();              // deep link to the foldout
  showPage(state.page || 'dynamic');
}

// ------------------------------------------------------------------ boot
async function init() {
  state.config = { initial_event: initialEventFromAddress() };
  initDecayForm();
  if (state.config.initial_event) eventToForm(state.config.initial_event);       // an event in the address (?event=...)
  else buildExample();                                                           // otherwise the page starts with random momenta of a decay into three particles
  $('event-form').addEventListener('submit', e => { e.preventDefault(); compute({ reveal: true }); });
  $('event-form').addEventListener('input', () => changed());
  $('build-example').addEventListener('click', () => { buildExample(); changed(); });
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => { showPage(tab.dataset.tab); history.replaceState(null, '', '#'+tab.dataset.tab); }));
  state.page = PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : location.hash === '#euler' ? 'amplitude' : 'dynamic';
  compute();
}
init();
