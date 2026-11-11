// The correspondence between the general formula and the formula of the selected decay (card 1): the parts of the formulas that carry a class sym-... (set with
// \htmlClass in the TeX) belong together. Hovering a part marks all parts of its class on the page of the card. Every marked part has a very faint box all the time
// (style.css), stronger while it is hovered.
// The function is self-contained and can be taken out: set ENABLED to false, or do not call attachCorrespondence.
export const ENABLED = true;

export const CLASSES = ['sym-amp', 'sym-chains', 'sym-resonance', 'sym-roles', 'sym-spin', 'sym-frame', 'sym-angles', 'sym-density', 'sym-norm', 'sym-coupling', 'sym-phase',
                        'sym-propagator', 'sym-internal-sum', 'sym-alignment', 'sym-topology', 'sym-nr'];

/** The innermost class of the correspondence on the element or on one of its parents (up to the root), or null. */
function classOf(element, root) {
  for (let node = element; node && node !== root; node = node.parentElement) {
    const name = CLASSES.find(c => node.classList?.contains(c));
    if (name) return name;
  }
  return null;
}

export function attachCorrespondence(root) {
  if (!ENABLED) return;
  let active = null;
  const show = name => {
    if (name === active) return;
    if (active) root.querySelectorAll(`.${active}`).forEach(node => node.classList.remove('corr-on'));
    active = name;
    if (active) root.querySelectorAll(`.${active}`).forEach(node => node.classList.add('corr-on'));
  };
  root.addEventListener('mouseover', e => show(classOf(e.target, root)));
  root.addEventListener('mouseleave', () => show(null));
}
