# Cascade Decay Frames

An interactive page for cascades of ordered binary decays. From the four-momenta of a decay `0 → 1 + 2 + …` and a decay topology, it computes the rest frames of all intermediate states and shows, as an animation, how the laboratory frame is carried step by step into the frame of every vertex. Further pages explain the notation of the frame labels, the construction of the amplitude of a decay chain (with the Euler rotations), the Greenwich convention for the axes of the root frame, and the step from one decay topology to a reference topology. The page *FAQ* is a flow chart of the questions of a FAQ on the description of cascade decays: every card is a question, and a click on a card shows what it builds on: the questions it needs have a solid frame and an arrow leading to the card, related questions a dashed frame and an arrow leading from the card. Every part has its own colour.

The page runs entirely in the browser: all calculations are done by JavaScript on your computer, nothing is sent anywhere, and the page loads no files from other sites. It is a static site and works on GitHub Pages.

## Open the page

On GitHub Pages: `https://<account>.github.io/<repository>/` (after the setup below).

On your own computer, from this folder, with any static web server, for example

```bash
python3 -m http.server 8000
```

and then `http://127.0.0.1:8000/` in a current browser. (Opening `index.html` directly from the file system does not work, because browsers do not load ES modules from `file://`.)

Browsers keep the JavaScript files of the page in their cache for a while. After the files have changed (a new version on GitHub Pages, another branch checked out, an edited file), load the page again with Ctrl+Shift+R (Ctrl+F5); otherwise old and new files can mix, and the page then reports an error such as “null has no property replaceChildren”.

The page starts with random momenta. A start event can be put in the address as JSON, for example

```
http://127.0.0.1:8000/?event={"mother":[9.424309,3.046443,2.084185,2.929122],"final_states":{"1":[4.559222,3.922497,2.091695,-0.159163],"2":[3.25,-0.58506,1.191114,2.793108],"3":[1.615087,-0.290994,-1.198624,0.295177]},"reference_topology":"((1 2) 3)","decay_topology":"(1 (2 3))"}
```

## Publish on GitHub Pages

The page is published by the workflow `.github/workflows/pages.yml` from the branch `no-greenwich` of the repository, at `https://<account>.github.io/<repository>/`. The page has no Greenwich angle. The branch `web` (the page with the Greenwich angle) is not published. The workflow file is the same in both branches.

1. Push the page to the branch `no-greenwich`.
2. In the repository settings, open *Pages* and choose the source *GitHub Actions* (not *Deploy from a branch*, which publishes one branch only).
3. In the repository settings, open *Environments*, then `github-pages`, and under *Deployment branches and tags* allow the branch `no-greenwich` (or all branches). Otherwise the workflow stops before its first step, because it is run by a branch that is not allowed to deploy.
4. After a push the workflow runs (tab *Actions*); it can also be started by hand (*Run workflow*). It gives the files of every deployment a version in their addresses (`app.js?v=…`), so that a browser that has opened an older version does not mix old and new files.

## Files

| Folder or file | Content |
|---|---|
| `index.html`, `style.css` | the page |
| `core/` | the computation: `kinematics.js` (frames from four-momenta), `alignment.js` (Greenwich axes, Euler angles, transports between two topologies), `scene.js` (momenta of a frame as geometry), `payload.js` (everything the page shows, including the samples of the animation), `linalg.js` (small matrices), `address.js` (start event from the address) |
| `app/` | start and form (`app.js`, `decay_form.js`) and shared helpers (`common.js`: DOM, formulas through KaTeX, SVG and PNG export) |
| `render/` | drawing: `drawing.js` (figures of the frames), `sketch.js` (Feynman sketches), `blobs.js` (simplified diagrams, also the terms of the potential), `vertex_figure.js` (primary and secondary vertex), `dalitz.js` (schematic Dalitz plot), `legend.js`, `tex.js` (markup to TeX), `world.js` (coarse land outlines for the globe, Natural Earth 110m, public domain), `experiments_figure.js` (sketch of the two kinds of experiment) |
| `pages/` | one folder per page: `dynamic/` (animation and the amplitude row), `amplitude/` (construction of the amplitude: `page.js` the text, `derivation.js` the single decay and the phase of the spectator, `chain.js` the chain, `terms.js` the terms of the amplitude, shared with the amplitude row of `dynamic/`), `euler/`, `greenwich/`, `next-step/`, `faq/` (`faq.js`: the page; `layout.js`: positions and connections of the cards; `text/NN.js`: the page of each card, shown below the chart (cards 1 to 3 are written by `llm/faq_map/build_faq_pages.py` from the drafts in `FAQ Contents/Part 0/`, the other pages are placeholders so far); `inline.js`: the markup inside the texts (`$…$`, `[[n]]` links to cards, `[[Figure n.m]]`, `[[Ref n]]` references to the list of sources, bold, italic); `figures.js`: the figures F2.1 to F3.4; `decay_block.js`: the block "The Formula for the Selected Decay" of card 1, built from `state.payload` and the terms of `amplitude/terms.js`; `correspond.js`: hovering a part of a formula marks the parts of the same class `sym-…` (a switch turns it off); the address `#faq-3` opens the tab FAQ with card 3 chosen; `img/map-00.svg` the start view, `img/map-01.svg` … one finished image per card with its lines, `img/path-apply.svg`, `path-derive.svg`, `path-implement.svg` one image per reading path (the cards of the path stand out, arrows lead from each card to the next), all written by `llm/faq_map/build_faq_map.py`; no line is computed in the browser) |
| `vendor/katex/` | KaTeX 0.16.47 (MIT licence), which sets the formulas |

The conventions of the page are explained on its page *Notation*.
