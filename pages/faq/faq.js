// Page "FAQ": a map of all questions of the FAQ, every part in a row of its own (a dark bar above a light row of cards).
// Nothing is drawn or routed here. There is one finished image for the start view and one for every card (img/map-00.svg ... map-NN.svg, written by
// llm/faq_map/build_faq_map.py); a click on a card loads its image, which shows the card with its connections. The positions of the cards in the images
// are in layout.js, so that transparent buttons can be put over them. The images show the basics of a card only: the cards it needs and its "see also" cards.
// The page of the card (text/NN.js, a list of blocks, written by llm/faq_map/build_faq_pages.py) appears below the chart; the chart stays where it is.
// A double click on a card scrolls to its page. The three buttons "Apply", "Derive" and "Implement" choose a reading path (FAQ_PATHS in layout.js): the images
// path-*.svg let the cards of the path stand out and lead with arrows from each card to the next one, and below the chart stand the pages of all these cards in
// the order of their numbers. A double click on the name of a path chooses it and scrolls to its pages. A click on any card clears a chosen path.
import { h, mtex, texNode } from '../../app/common.js';
import { FAQ_SIZE, FAQ_CARDS, FAQ_PATHS } from './layout.js';

const VERSION = new URL(import.meta.url).search;                  // the files of a deployment carry a version in their addresses; the images follow it
const fileUrl = name => { const u = new URL(name, import.meta.url); u.search = VERSION; return u.href; };
const nn = n => String(n).padStart(2, '0');
const imageUrl = n => fileUrl(`img/map-${nn(n)}.svg`);
const pathImageUrl = key => fileUrl(`img/path-${key}.svg`);
const pageUrl = n => fileUrl(`text/${nn(n)}.js`);
const list = numbers => numbers.length ? numbers.join(', ') : '–';
const pct = (value, whole) => `${(100*value/whole).toFixed(3)}%`;

/** The blocks of a page as DOM. Text may contain TeX between $ ... $.
 *  'h' a heading ({ level: 3 or 4, text }), 'p' a paragraph ({ text }), 'eq' a display equation that KaTeX numbers ({ tex, numbered: false for none }),
 *  'ul' a list ({ items }), 'fold' a foldout ({ title, blocks }). */
function render(blocks) {
  return blocks.map(b => {
    switch (b.type) {
      case 'h': return h(`h${b.level || 3}`, {}, mtex(b.text));
      case 'p': return h('p', {}, mtex(b.text));
      case 'eq': { const env = b.numbered === false ? 'equation*' : 'equation'; return h('div', { class: 'faq-eq' }, texNode(`\\begin{${env}}${b.tex}\\end{${env}}`, { display: true })); }
      case 'ul': return h('ul', {}, b.items.map(item => h('li', {}, mtex(item))));
      case 'fold': return h('details', { class: 'faq-fold' }, [h('summary', {}, mtex(b.title)), ...render(b.blocks)]);
      default: throw new Error(`unknown block type ${b.type}`);
    }
  });
}

export function buildFaqPage() {
  const byNumber = new Map(FAQ_CARDS.map(c => [c.n, c]));
  let selected = 0, pathKey = null;                                          // a card is selected, or a reading path, or nothing
  let restorePath = null;                                                    // the reading path that a click has just cleared (see ondblclick)
  const img = h('img', { class: 'faq-img', src: imageUrl(0), width: FAQ_SIZE.width, height: FAQ_SIZE.height, alt: 'Map of all questions of the FAQ, ordered by part', draggable: 'false' });
  const title = h('p', { class: 'faq-title' });                               // the selected question or reading path
  const needsList = h('p', { class: 'faq-numbers' }), seeList = h('p', { class: 'faq-numbers' }), pathList = h('p', { class: 'faq-numbers' });
  const buttons = FAQ_CARDS.map(c => h('button', {
    type: 'button', class: 'faq-card', 'aria-pressed': 'false', 'aria-label': `${c.n}. ${c.title}`,
    style: `left:${pct(c.x, FAQ_SIZE.width)};top:${pct(c.y, FAQ_SIZE.height)};width:${pct(c.w, FAQ_SIZE.width)};height:${pct(c.h, FAQ_SIZE.height)}`,
    // the second click of a double click must not undo the first; a click on a card clears a chosen reading path
    onclick: e => {
      if (e.detail > 1) return;
      if (pathKey) { restorePath = { key: pathKey, time: Date.now() }; selectCard(0); return; }
      selectCard(c.n === selected ? 0 : c.n);
    },
    ondblclick: () => {
      // in a reading path the first click of the double click has cleared the path: choose it again when the card belongs to it, and go to the page of the card
      const back = restorePath && Date.now() - restorePath.time < 700 ? FAQ_PATHS.find(p => p.key === restorePath.key) : null;
      restorePath = null;
      if (back && back.cards.includes(c.n)) { selectPath(back.key); jumpTo(c.n); return; }
      if (selected !== c.n) selectCard(c.n);
      jumpTo(c.n);
    }
  }));
  const map = h('div', { class: 'faq-map' }, [img, ...buttons]);
  const pages = h('div', { class: 'faq-pages', hidden: true });               // the pages below the chart: that of the selected card, or those of a path
  const articles = new Map();
  let ticket = 0, ready = Promise.resolve();

  /** Shows the pages of the cards `numbers` below the chart, in this order. The texts are loaded one by one; `ready` is settled when all are there. */
  function showPages(numbers) {
    const mine = ++ticket;
    articles.clear();
    pages.hidden = numbers.length === 0;
    pages.replaceChildren(...numbers.map(n => {
      const c = byNumber.get(n);
      const article = h('article', { class: 'faq-article', id: `faq-page-${n}` }, [h('h2', { text: `${c.n}. ${c.title}` })]);
      articles.set(n, article);
      return article;
    }));
    ready = Promise.all(numbers.map(async n => {
      let blocks;
      try { blocks = (await import(pageUrl(n))).default; } catch (e) { blocks = null; }
      if (mine !== ticket) return;
      articles.get(n).append(...(blocks ? render(blocks) : [h('p', { class: 'small', text: 'This page could not be loaded.' })]));
    }));
  }

  /** Scrolls to the page of the card n, or to the first of the pages (n = 0), when they are shown. */
  async function jumpTo(n = 0) {
    await ready;
    const target = n ? articles.get(n) : pages;
    if (target && !pages.hidden) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }

  function selectCard(n) {
    selected = n; pathKey = null;
    img.src = imageUrl(n);
    pathButtons.forEach(b => b.setAttribute('aria-pressed', 'false'));
    buttons.forEach((b, i) => { b.setAttribute('aria-pressed', String(FAQ_CARDS[i].n === n)); b.title = 'Click: show its dependencies. Double click: go to its content.'; });
    key.hidden = false; pathInfo.hidden = true;
    const c = byNumber.get(n);
    title.textContent = c ? `${c.n}. ${c.title}` : '';
    needsList.textContent = c ? list(c.needs) : '';
    seeList.textContent = c ? list(c.see) : '';
    showPages(c ? [n] : []);
  }

  function selectPath(k) {
    const path = FAQ_PATHS.find(p => p.key === k);
    if (!path) { selectCard(0); return; }
    selected = 0; pathKey = k;
    img.src = pathImageUrl(k);
    pathButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(FAQ_PATHS[i].key === k)));
    buttons.forEach(b => { b.setAttribute('aria-pressed', 'false'); b.title = 'Click: clear the selection. Double click: go to its content.'; });
    key.hidden = true; pathInfo.hidden = false;
    title.textContent = `Reading path: ${path.label}`;
    pathList.textContent = path.cards.join(' \u2192 ');                             // the order of the path
    showPages(path.cards);
  }

  const pathButtons = FAQ_PATHS.map(p => h('button', {
    type: 'button', 'aria-pressed': 'false', text: p.label, title: 'Click: show the reading path. Double click: go to its texts.',
    onclick: e => { if (e.detail < 2) selectPath(pathKey === p.key ? null : p.key); },        // the second click of a double click must not undo the first
    ondblclick: () => { if (pathKey !== p.key) selectPath(p.key); jumpTo(); }
  }));
  const pathControl = h('div', {}, [h('p', { class: 'faq-paths-label', text: 'Reading path' }), h('div', { class: 'segmented faq-paths', role: 'group', 'aria-label': 'Reading path' }, pathButtons)]);
  const keyItem = (cls, label, numbers) => h('div', { class: 'faq-key-item' }, [h('div', { class: 'faq-key-label' }, [h('span', { class: `faq-line ${cls}` }), label]), numbers]);
  const key = h('div', { class: 'faq-key' }, [keyItem('solid', 'Needs', needsList), keyItem('dashed', 'See also', seeList)]);
  const pathInfo = h('div', { class: 'faq-key', hidden: true }, [keyItem('solid', 'Order', pathList)]);
  selectCard(0);

  map.addEventListener('click', e => { if (e.target === map || e.target === img) selectCard(0); });
  map.addEventListener('keydown', e => { if (e.key === 'Escape') selectCard(0); });
  let warmed = false;
  map.addEventListener('pointerenter', () => {                    // load the other images once, so that a click shows its image at once
    if (warmed) return;
    warmed = true;
    FAQ_CARDS.forEach(c => { new Image().src = imageUrl(c.n); });
    FAQ_PATHS.forEach(p => { new Image().src = pathImageUrl(p.key); });
  });

  const help = h('ul', { class: 'faq-help' }, [
    'Click a card to show its dependencies.', 'Click a reading path to show one way to read the text.',
    'Click again to clear the selection.', 'Double click a card to go to its content.'
  ].map(text => h('li', { text })));
  const info = h('div', { class: 'faq-info', role: 'status' }, [help, pathControl, title, key, pathInfo]);
  const root = h('div', { class: 'page-body faq' }, [h('div', { class: 'faq-left' }, [h('div', { class: 'faq-stage' }, [map]), pages]), info]);
  return { root };
}
