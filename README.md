# Cascade Decay Frames

An interactive page for cascades of ordered binary decays. From the four-momenta of a decay `0 → 1 + 2 + …` and a decay topology, it computes the rest frames of all intermediate states and shows, as an animation, how the laboratory frame is carried step by step into the frame of every vertex. Further pages explain the notation of the frame labels, the construction of the amplitude of a decay chain (with the Euler rotations), and the step from one decay topology to a reference topology. This version of the page (branch `no-greenwich`) has no Greenwich angle: the root axes follow from the laboratory axes and the flight direction of the mother alone.

The page runs entirely in the browser: all calculations are done by JavaScript on your computer, nothing is sent anywhere, and the page loads no files from other sites. It is a static site and works on GitHub Pages.

## Open the page

On GitHub Pages: `https://<account>.github.io/<repository>/` (after the setup below).

On your own computer, from this folder, with any static web server, for example

```bash
python3 -m http.server 8000
```

and then `http://127.0.0.1:8000/` in a current browser. (Opening `index.html` directly from the file system does not work, because browsers do not load ES modules from `file://`.)

The page starts with random momenta. A start event can be put in the address as JSON, for example

```
http://127.0.0.1:8000/?event={"mother":[9.424309,3.046443,2.084185,2.929122],"final_states":{"1":[4.559222,3.922497,2.091695,-0.159163],"2":[3.25,-0.58506,1.191114,2.793108],"3":[1.615087,-0.290994,-1.198624,0.295177]},"reference_topology":"((1 2) 3)","decay_topology":"(1 (2 3))"}
```

## Publish on GitHub Pages

The page is published by the workflow `.github/workflows/pages.yml` from the branches of the repository that hold a version of it:

| Branch | Version | Address |
|---|---|---|
| `web` | the complete page | `https://<account>.github.io/<repository>/` |
| `no-greenwich` | the page without the Greenwich angle | `https://<account>.github.io/<repository>/no-greenwich/` |

A repository has one Pages site, so the workflow assembles both branches into one site after every push to one of them; a branch that does not exist (yet) is left out. The workflow file is the same in both branches.

1. Push the page to the branch `web` (and, for the second version, to `no-greenwich`).
2. In the repository settings, open *Pages* and choose the source *GitHub Actions*.
3. After a push the workflow runs (tab *Actions*); it can also be started by hand (*Run workflow*).

## Files

| Folder or file | Content |
|---|---|
| `index.html`, `style.css` | the page |
| `core/` | the computation: `kinematics.js` (frames from four-momenta), `alignment.js` (Euler angles, transports between two topologies), `scene.js` (momenta of a frame as geometry), `payload.js` (everything the page shows, including the samples of the animation), `linalg.js` (small matrices), `address.js` (start event from the address) |
| `app/` | start and form (`app.js`, `decay_form.js`) and shared helpers (`common.js`: DOM, formulas through KaTeX, SVG and PNG export) |
| `render/` | drawing: `drawing.js` (figures of the frames), `sketch.js` (Feynman sketches), `blobs.js` (simplified diagrams, also the terms of the potential), `vertex_figure.js` (primary and secondary vertex), `dalitz.js` (schematic Dalitz plot), `legend.js`, `tex.js` (markup to TeX), `experiments_figure.js` (sketch of the two kinds of experiment) |
| `pages/` | one folder per page: `dynamic/` (animation and the amplitude row), `amplitude/` (construction of the amplitude: `page.js` the text, `derivation.js` the single decay and the phase of the spectator, `chain.js` the chain, `terms.js` the terms of the amplitude, shared with the amplitude row of `dynamic/`), `euler/`, `next-step/` |
| `vendor/katex/` | KaTeX 0.16.47 (MIT licence), which sets the formulas |

The conventions of the page are explained on its page *Notation*.
