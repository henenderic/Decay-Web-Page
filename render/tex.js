// Translation of the markup of the page into TeX. The texts of the page are written with a small markup (scripts with _ and ^, ~ for a vector arrow,
// @{...} for upright text); this module turns it into the TeX that KaTeX sets. It has no dependence on the browser.
//
//   all = true : formulas; letters are italic at every level, the words sin, cos, tan, exp, lab and MeV are upright.
//   all = false: only single letters at the top level are italic, longer runs of letters are names (upright), and everything inside a script is upright.
const LETTER = /([A-Za-zα-ωΑ-Ωϑφλχη]+)/;
const MATH_LETTER = /(sin|cos|tan|exp|lab|MeV|[A-Za-zα-ωΑ-Ωϑφλχη])/;
const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'exp']);
const SPECIAL = { '\\': '\\backslash ', '{': '\\{', '}': '\\}', '#': '\\#', '$': '\\$', '%': '\\%', '&': '\\&', '_': '\\_', '^': '\\^{}' };
const SUPERSCRIPT = new Map([...'⁰¹²³⁴⁵⁶⁷⁸⁹⁻'].map((c, k) => [c, '0123456789-'[k]]));
const LEFT_ORDINARY = /[A-Za-z0-9α-ωΑ-Ωϑ)\]}'′″⟩]/, RIGHT_ORDINARY = /[A-Za-z0-9α-ωΑ-Ωϑ(\[⟨@~ℳ]/;

/** A text that is set upright, as it stands (names, labels). */
const upright = text => '\\text{' + [...text].map(c => SPECIAL[c] ?? (c === ' ' ? '\\,' : c)).join('') + '}';

/** A piece of plain text (no markup): symbols as in TeX, a space only where two ordinary symbols meet (TeX ignores the others, operators and punctuation bring their own). */
function plainText(text, before, after) {
  let out = '';
  const chars = [...text];
  for (let k = 0; k < chars.length; k++) {
    const c = chars[k];
    if (/\s/.test(c) && c !== ' ' && c !== ' ') {
      let m = k; while (m < chars.length && /\s/.test(chars[m]) && chars[m] !== ' ' && chars[m] !== ' ') m++;
      const left = k > 0 ? chars[k-1] : before, right = m < chars.length ? chars[m] : after;
      if (left && right && LEFT_ORDINARY.test(left) && RIGHT_ORDINARY.test(right)) out += '\\ ';
      k = m - 1;
    }
    else if (c === ' ' || c === ' ') out += '\\,';
    else if (c === ' ') out += '~';
    else if (c === '′') out += "'";
    else if (SUPERSCRIPT.has(c)) { let m = k; let digits = ''; while (m < chars.length && SUPERSCRIPT.has(chars[m])) digits += SUPERSCRIPT.get(chars[m++]); out += '^{' + digits + '}'; k = m - 1; }
    else if (c === '″') out += "''";
    else if (c === '…') out += '\\dots ';
    else out += SPECIAL[c] ?? c;
  }
  return out;
}

export function toTex(str, level = 0, all = false) {
  let out = '', buffer = '', pendingArrow = false, previous = '';       // previous: the last character before the buffer, for the spaces
  const italic = level === 0 || all;
  const flush = (after = '') => {
    if (!buffer) return;
    const pieces = italic ? buffer.split(all ? MATH_LETTER : LETTER).filter(Boolean) : buffer.split(LETTER).filter(Boolean);
    let consumed = 0;
    pieces.forEach((piece, n) => {
      const next = pieces[n+1] ? pieces[n+1][0] : after, before = n ? (FUNCTIONS.has(pieces[n-1]) ? '' : pieces[n-1].slice(-1)) : previous;      // a function name brings its own space
      consumed += piece.length;
      if (piece.includes('ℳ') && piece.length === 1) { out += '\\mathcal{M}'; return; }
      const word = /^[A-Za-zα-ωΑ-Ωϑφλχη]+$/.test(piece);
      if (word) {
        const latin = /^[A-Za-z]+$/.test(piece);
        if (all) { out += FUNCTIONS.has(piece) ? '\\' + piece + ' ' : (piece === 'lab' || piece === 'MeV') ? '\\text{' + piece + '}' : piece; }
        else if (level === 0) {
          if (piece.length === 1) out += pendingArrow ? '\\vec{' + piece + '}' : piece;
          else out += latin ? upright(piece) : piece;                      // a name; a run of Greek letters stays as it is
          pendingArrow = false;
        } else out += latin ? upright(piece) : piece;
      } else {
        for (const part of piece.split(/(ℳ)/).filter(Boolean)) out += part === 'ℳ' ? '\\mathcal{M}' : plainText(part, before, next);
      }
    });
    pendingArrow = false; buffer = '';
  };
  const readArg = i => {
    if (str[i] === '{') {
      let depth = 1, j = i + 1;
      while (j < str.length && depth) { if (str[j] === '\\') j++; else if (str[j] === '{') depth++; else if (str[j] === '}') depth--; j++; }
      return [str.slice(i + 1, j - 1), j];
    }
    if (str[i] === '\\') return [str[i + 1] ?? '', i + 2];
    return [str[i] ?? '', i + 1];
  };
  const script = a => a.startsWith('[') ? `\\htmlClass{frame}{\\scriptscriptstyle ${toTex(a, level + 1, all)}}` : toTex(a, level + 1, all);   // a frame label [v|K] is set smaller and can be marked
  let i = 0;
  while (i < str.length) {
    const c = str[i];
    if (c === '~') {
      flush(c); pendingArrow = true; i++;
      const next = str[i];                                               // the arrow goes over the next symbol
      if (next && !/[_^@~{]/.test(next)) { const ch = String.fromCodePoint(str.codePointAt(i)); out += '\\vec{' + (SPECIAL[ch] ?? ch) + '}'; i += ch.length; pendingArrow = false; }
    }
    else if (c === '@') { flush(c); const [arg, next] = readArg(i + 1); out += upright(arg); previous = arg.slice(-1) || previous; i = next; }
    else if (c === '_' || c === '^') {
      flush(c);
      const sup = [], sub = [];
      while (i < str.length && (str[i] === '_' || str[i] === '^')) {     // all scripts that follow one another belong to the same base
        const kind = str[i], [arg, next] = readArg(i + 1);
        (kind === '^' ? sup : sub).push(script(arg));
        i = next;
      }
      if (sub.length) out += '_{' + sub.join('\\,') + '}';
      if (sup.length) out += '^{' + sup.join('\\,') + '}';
      previous = '}';
    } else {
      buffer += c === '\\' ? (str[i + 1] ?? '') : c; i += c === '\\' ? 2 : 1;
    }
    if (buffer && (i >= str.length || /[_^@~]/.test(str[i]))) { flush(str[i] ?? ''); previous = ''; }
  }
  flush();
  return out;
}
