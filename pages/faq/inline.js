// The markup inside the texts of the pages of the FAQ (see llm/faq_map/build_faq_pages.py):
//   $ ... $       mathematics (KaTeX), \$ is a dollar sign
//   [[n]]         a link to card n, written "n. Title"; a click chooses the card
//   [[Figure 2.1]] a link to the figure on the same page
//   [[Ref 3]], [[Ref 3, 5]], [[Ref 1-10]]    references to the list "Sources" of the page, written as in a paper: [3], [3, 5], [1–10]
//   **keyword**  a keyword of the text (a term that the card introduces or explains): bold with an extra space before and behind it, which is left out before a bracket and
//                 before a punctuation mark. A bold text that ends with a full stop or a colon is the beginning of a list item and gets no extra space.
//   *italic*, `code`, and an address that begins with https:// becomes a link
// The context ctx is {card, open(n), title(n)}: the number of the card of the page, the function that chooses a card, and the title of a card.
import { h, texNode } from '../../app/common.js';

const TOKEN = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|(https?:\/\/[^\s)]*[^\s).,;])/g;

/** Scrolls to the element with this id (a figure or an entry of the list of sources), when it is there. */
function scrollToId(id) {
  const target = document.getElementById(id);
  if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
}

/** The link to a card: "n. Title". */
export const cardLink = (n, ctx) => h('a', { class: 'faq-xref', href: `#faq-page-${n}`, title: 'Show this question',
                                            onclick: e => { e.preventDefault(); ctx.open(n); }, text: `${n}. ${ctx.title(n)}` });

/** The numbers of a reference, "3", "3, 5" or "1-10", as a list of numbers and ranges. */
const parseRefs = spec => spec.split(',').map(part => part.trim()).filter(Boolean).map(part => {
  const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
  return range ? { from: +range[1], to: +range[2] } : { from: +part, to: +part };
});

/** The mark of a reference: [1], [1, 3], [1–10]. Every number is a link to its entry in the list of sources. */
export function referenceMark(spec, ctx) {
  const refLink = k => h('a', { class: 'faq-ref', href: `#faq-ref-${ctx.card}-${k}`, title: 'Show this source',
                                onclick: e => { e.preventDefault(); scrollToId(`faq-ref-${ctx.card}-${k}`); }, text: String(k) });
  const out = ['['];
  parseRefs(spec).forEach((r, i) => {
    if (i) out.push(', ');
    out.push(refLink(r.from));
    if (r.to !== r.from) out.push('–', refLink(r.to));
  });
  out.push(']');
  return h('span', { class: 'faq-refs' }, out);
}

/** The nodes of a text with the markup above. */
export function inline(text, ctx) {
  const parts = String(text).split(/(?<!\\)\$/), out = [];
  parts.forEach((part, i) => {
    const math = i % 2 === 1 && i < parts.length-(parts.length % 2 === 0 ? 1 : 0);
    if (math) out.push(texNode(part));
    else out.push(...plain(part.replace(/\\\$/g, '$'), ctx));
  });
  return out.filter(node => node !== '');
}

/** A bold text: a keyword (class faq-keyword, with the extra space of the style sheet unless a bracket or a punctuation mark is next to it) or the beginning of a list item (ends with . or :). */
function keyword(words, before, after) {
  if (/[.:]$/.test(words)) return h('strong', {}, words);
  const open = before === undefined || /[(\["“\u201E]/.test(before), close = after === undefined || /[)\],.;:!?"”]/.test(after);
  return h('strong', { class: `faq-keyword${open ? ' no-before' : ''}${close ? ' no-after' : ''}` }, words);
}

function plain(text, ctx) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    last = m.index+m[0].length;
    if (m[1] !== undefined) {
      const spec = m[1].trim();
      if (/^\d+$/.test(spec)) out.push(cardLink(+spec, ctx));
      else if (/^Figure \d+\.\d+$/.test(spec)) {
        const id = `faq-fig-${spec.slice(7)}`;
        out.push(h('a', { class: 'faq-xref', href: `#${id}`, onclick: e => { e.preventDefault(); scrollToId(id); }, text: spec }));
      } else if (/^Ref [\d,\s-]+$/.test(spec)) out.push(referenceMark(spec.slice(4), ctx));
      else throw new Error(`unknown reference [[${spec}]]`);
    }
    else if (m[2] !== undefined) out.push(keyword(m[2], text[m.index-1], text[last]));
    else if (m[3] !== undefined) out.push(h('em', {}, m[3]));
    else if (m[4] !== undefined) out.push(h('code', {}, m[4]));
    else out.push(h('a', { class: 'faq-url', href: m[5], target: '_blank', rel: 'noopener noreferrer', text: m[5] }));
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
