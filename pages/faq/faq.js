// Page "FAQ": a map of all questions of the FAQ, every part in a row of its own (a dark bar above a light row of cards).
// Nothing is drawn or routed here. There is one finished image for the start view and one for every card (img/map-00.svg ... map-NN.svg, written by
// llm/faq_map/build_faq_map.py); a click on a card loads its image, which shows the card with its connections. The positions of the cards in the images
// are in layout.js, so that transparent buttons can be put over them. The images show the basics of a card only: the cards it needs and its "see also" cards.
// The page of the card (text/NN.js, a list of blocks, written by llm/faq_map/build_faq_pages.py) appears below the chart; the chart stays where it is.
// A double click on a card scrolls to its page. The three buttons "Apply", "Derive" and "Implement" choose a reading path (FAQ_PATHS in layout.js): the images
// path-*.svg let the cards of the path stand out and lead with arrows from each card to the next one, and below the chart stand the pages of all these cards in
// the order of their numbers. A double click on the name of a path chooses it and scrolls to its pages. A click on any card clears a chosen path.
import { h, texNode, state } from '../../app/common.js';
import { FAQ_SIZE, FAQ_CARDS, FAQ_PATHS } from './layout.js';
import { inline, cardLink } from './inline.js';
import { FIGURES } from './figures.js';
import { buildDecayBlock } from './decay_block.js';
import { buildEulerPage } from '../euler/euler.js';
import { attachCorrespondence } from './correspond.js';

const VERSION = new URL(import.meta.url).search;                  // the files of a deployment carry a version in their addresses; the images follow it
const fileUrl = name => { const u = new URL(name, import.meta.url); u.search = VERSION; return u.href; };
const nn = n => String(n).padStart(2, '0');
const imageUrl = n => fileUrl(`img/map-${nn(n)}.svg`);
const pathImageUrl = key => fileUrl(`img/path-${key}.svg`);
const pageUrl = n => fileUrl(`text/${nn(n)}.js`);
const list = numbers => numbers.length ? numbers.join(', ') : '–';
const pct = (value, whole) => `${(100*value/whole).toFixed(3)}%`;

/** The framed note in the place of a figure that does not exist yet. */
const pendingNote = words => h('p', { class: 'faq-pending', text: words });

/** The blocks of a page as DOM. Texts have the markup of inline.js (mathematics between $ ... $, links to cards, figures and sources).
 *  'h' a heading ({ level: 3 or 4, text }), 'p' a paragraph ({ text }), 'eq' a display equation ({ tex }; a number is set with \tag in the formula, without it the formula has none),
 *  'ul' and 'ol' lists ({ items }; refs: true makes the items of a list of sources the targets of the references), 'table' ({ head, rows }),
 *  'fold' a foldout ({ title, blocks }), 'fig' a figure ({ id, number, caption }, the picture comes from figures.js), 'related' the list of related questions ({ items: [{ n, text }] }),
 *  'decay' the block for the selected decay (card 1, decay_block.js), 'embed' a foldout that is to hold a part of another page of the site ({ title, pending }).
 *  A figure or an embedded block with pending: true is not drawn yet: the page shows a framed note in its place (the caption stays).
 *  ctx: { card, open(n), title(n), decays: the set of the hosts of the block for the selected decay }. */
function render(blocks, ctx) {
  const text = s => inline(s, ctx);
  return blocks.map(b => {
    switch (b.type) {
      case 'h': return h(`h${b.level || 3}`, {}, text(b.text));
      case 'p': return h('p', {}, text(b.text));
      case 'eq': return h('div', { class: 'faq-eq' }, texNode(`\\begin{equation*}${b.tex}\\end{equation*}`, { display: true }));      // a formula has a number when the draft gives it with \\tag
      case 'ul': return h('ul', {}, b.items.map(item => h('li', {}, text(item))));
      case 'ol': return h('ol', { class: b.refs ? 'faq-sources' : null }, b.items.map((item, k) => h('li', b.refs ? { id: `faq-ref-${ctx.card}-${k+1}` } : {}, text(item))));
      case 'table': return h('div', { class: 'faq-table-wrap' }, [h('table', { class: 'faq-table' }, [
        h('thead', {}, [h('tr', {}, b.head.map(c => h('th', {}, text(c))))]), h('tbody', {}, b.rows.map(r => h('tr', {}, r.map(c => h('td', {}, text(c))))))])]);
      case 'fold': return h('details', { class: 'faq-fold' }, [h('summary', {}, text(b.title)), ...render(b.blocks, ctx)]);
      case 'embed': {                                                       // the animation of the Euler rotations of the page "Amplitude construction" (pages/euler/euler.js)
        const euler = ctx.euler();
        const fold = h('details', { class: 'faq-fold' }, [h('summary', {}, text(b.title)), euler.animation]);
        fold.addEventListener('toggle', () => { if (fold.open) requestAnimationFrame(() => euler.render()); else euler.view.stop(); });
        return fold;
      }
      case 'fig': {
        const make = b.pending ? null : FIGURES[b.id];
        if (!make && !b.pending) throw new Error(`unknown figure ${b.id}`);
        return h('figure', { class: 'faq-figure', id: `faq-fig-${b.number}` }, [h('div', { class: 'faq-figure-body' }, [make ? make(ctx) : pendingNote('This figure has not been drawn yet.')]),
                                                                              h('figcaption', {}, [h('strong', { text: `Figure ${b.number}. ` }), ...text(b.caption)])]);
      }
      case 'related': return h('ul', { class: 'faq-related' }, b.items.map(item => h('li', {}, [cardLink(item.n, ctx), ...(item.text ? [' ', ...text(item.text)] : [])])));
      case 'decay': {
        const host = h('div', { class: 'faq-decay' });
        host.replaceChildren(...buildDecayBlock(state.payload, ctx));
        ctx.decays.add(host);
        return host;
      }
      default: throw new Error(`unknown block type ${b.type}`);
    }
  });
}

/** A formula that is wider than its box scrolls sideways; the others get no scroll bar (KaTeX sets some of them a pixel or two too wide). A formula whose number would
 *  cover its last characters scrolls too, and the number then stands at the end of the line (style.css). */
function markScrolling(root) {
  root.querySelectorAll('.faq-eq, .faq-decay-formula').forEach(node => {
    node.classList.remove('scrolls');                                                // measure the formula with the number where KaTeX puts it
    const tag = node.querySelector('.tag'), bases = node.querySelectorAll('.katex-html > .base');
    const crowded = tag && bases.length && bases[bases.length-1].getBoundingClientRect().right > tag.getBoundingClientRect().left - 8;
    node.classList.toggle('scrolls', node.scrollWidth - node.clientWidth > 4 || !!crowded);
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
  const decays = new Set();                                                  // the hosts of the block for the selected decay on the pages that are shown
  let ticket = 0, ready = Promise.resolve();
  let eulerNow = null;                                                       // the Euler figures and the animation of the page that is shown: one set of them, so that they follow each other
  const context = n => {
    let euler = null;
    return { card: n, open: m => { selectCard(m); jumpTo(m); }, title: m => byNumber.get(m).title, decays,
             euler: () => { if (!euler) { eulerNow?.view.stop(); euler = eulerNow = buildEulerPage({ parts: true }); } return euler; } };
  };

  /** Shows the pages of the cards `numbers` below the chart, in this order. The texts are loaded one by one; `ready` is settled when all are there. */
  function showPages(numbers) {
    const mine = ++ticket;
    articles.clear(); decays.clear();
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
      let nodes;
      try { nodes = blocks ? render(blocks, context(n)) : null; } catch (e) { console.error(e); nodes = null; }
      articles.get(n).append(...(nodes || [h('p', { class: 'small', text: 'This page could not be loaded.' })]));
      attachCorrespondence(articles.get(n));
      requestAnimationFrame(() => markScrolling(articles.get(n)));
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
  addEventListener('resize', () => markScrolling(pages));

  /** The block for the selected decay on the pages that are shown is built again after the selection has changed. */
  function refresh() {
    requestAnimationFrame(() => markScrolling(pages));
    for (const host of decays) host.replaceChildren(...buildDecayBlock(state.payload, context(Number(host.closest('.faq-article')?.id.replace('faq-page-', '')) || 1)));
  }
  return { root, refresh, select: n => { if (byNumber.has(n)) selectCard(n); } };
}
