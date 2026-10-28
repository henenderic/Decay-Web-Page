// Page "FAQ": a map of all questions of the FAQ, every part in a row of its own (a dark bar above a light row of cards).
// Nothing is drawn or routed here. There is one finished image for the start view and one for every card (img/map-00.svg ... map-NN.svg, written by
// llm/faq_map/build_faq_map.py); a click on a card loads its image, which shows the card with its connections. The positions of the cards in the images
// are in layout.js, so that transparent buttons can be put over them. The images show the basics of a card only: the cards it needs and its "see also" cards.
import { h } from '../../app/common.js';
import { FAQ_SIZE, FAQ_CARDS } from './layout.js';

const VERSION = new URL(import.meta.url).search;                  // the files of a deployment carry a version in their addresses; the images follow it
const imageUrl = n => { const u = new URL(`img/map-${String(n).padStart(2, '0')}.svg`, import.meta.url); u.search = VERSION; return u.href; };
const list = numbers => numbers.length ? numbers.join(', ') : '–';
const pct = (value, whole) => `${(100*value/whole).toFixed(3)}%`;

export function buildFaqPage() {
  const byNumber = new Map(FAQ_CARDS.map(c => [c.n, c]));
  let selected = 0;
  const img = h('img', { class: 'faq-img', src: imageUrl(0), width: FAQ_SIZE.width, height: FAQ_SIZE.height, alt: 'Map of all questions of the FAQ, ordered by part', draggable: 'false' });
  const title = h('p', { class: 'faq-title' });                               // the selected question, its numbers below the key
  const needsList = h('p', { class: 'faq-numbers' }), seeList = h('p', { class: 'faq-numbers' });
  const buttons = FAQ_CARDS.map(c => h('button', {
    type: 'button', class: 'faq-card', 'aria-pressed': 'false', 'aria-label': `${c.n}. ${c.title}`,
    style: `left:${pct(c.x, FAQ_SIZE.width)};top:${pct(c.y, FAQ_SIZE.height)};width:${pct(c.w, FAQ_SIZE.width)};height:${pct(c.h, FAQ_SIZE.height)}`,
    onclick: () => select(c.n === selected ? 0 : c.n)
  }));
  const map = h('div', { class: 'faq-map' }, [img, ...buttons]);

  function select(n) {
    selected = n;
    img.src = imageUrl(n);
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(FAQ_CARDS[i].n === n)));
    const c = byNumber.get(n);
    title.textContent = c ? `${c.n}. ${c.title}` : '';
    needsList.textContent = c ? list(c.needs) : '';
    seeList.textContent = c ? list(c.see) : '';
  }
  select(0);

  map.addEventListener('click', e => { if (e.target === map || e.target === img) select(0); });
  map.addEventListener('keydown', e => { if (e.key === 'Escape') select(0); });
  let warmed = false;
  map.addEventListener('pointerenter', () => {                    // load the other images once, so that a click shows its image at once
    if (warmed) return;
    warmed = true;
    FAQ_CARDS.forEach(c => { new Image().src = imageUrl(c.n); });
  });

  const key = (cls, label, numbers) => h('div', { class: 'faq-key-item' }, [h('div', { class: 'faq-key-label' }, [h('span', { class: `faq-line ${cls}` }), label]), numbers]);
  const info = h('div', { class: 'faq-info', role: 'status' }, [title, h('div', { class: 'faq-key' }, [key('solid', 'Needs', needsList), key('dashed', 'See also', seeList)])]);
  const root = h('div', { class: 'page-body faq' }, [h('div', { class: 'faq-stage' }, [map]), info]);
  return { root };
}
