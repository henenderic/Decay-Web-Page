# Cascade Decay Frames

An interactive viewer for cascades of ordered binary decays. From the four-momenta of a decay `0 → 1 + 2 + …` and a decay topology, it computes the rest frames of all intermediate states and shows, as an animation, how the laboratory frame is carried step by step into the frame of every vertex. Further pages explain the notation of the frame labels, the Greenwich convention for the axes of the root frame (with the Euler rotations it relies on), and the step from one decay topology to a reference topology.

The page runs on your own computer: a small Python server does all the physics, the browser draws and animates. Nothing is loaded from the internet and no input leaves the machine.

## Requirements

- Python 3.10 or newer (developed with 3.13)
- NumPy (the rest of the Python code uses only the standard library)
- a current web browser (developed with Chromium)

## Start

Get the files, for example with `git clone <URL of this repository>`, and change into the folder. Then:

```bash
python3 -m pip install -r requirements.txt     # NumPy; use a virtual environment if you prefer
python3 interactive.py
```

The server prints `Interactive viewer: http://127.0.0.1:8765/`. Open that address in the browser. Stop the server with `Ctrl+C`.

A virtual environment, if you want one:

```bash
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 interactive.py
```

Options of `interactive.py`:

| Option | Meaning |
|---|---|
| `--port N` | listen on port `N` instead of 8765 |
| `--event FILE` | start with the event in the JSON file `FILE` instead of random momenta (format below) |

The server accepts connections from the same computer only (`127.0.0.1`, requests with another `Host` or `Origin` are refused). After a change of a Python file, restart the server; the files in `interactive_web/` are read again on every page load.

## Using the page

**Decay Description** (top of the page):

1. *Kind of Decay*: the number of final-state particles (2, 3, 4, …).
2. *Momenta*: energy and momentum `(E, p_x, p_y, p_z)` of the final states 1, 2, … in the laboratory frame, in any common unit with `c = 1`. The row of the mother 0 is the sum of the final states, and the masses follow from energy and momentum (both grey). **Build Example** fills in random numbers with one decimal; the page starts with such an example.
3. *Topology*: the decay as an ordered binary tree over the numbers of the final states. Every pair stands in brackets and its two parts are separated by a space, for example `((1 2) 3)` or `((1 3) (2 4))`. The first part of a pair is the reference particle, the second the spectator.
4. *Reference Topology* (optional): a second topology. It becomes the reference topology `I` and fixes the root axes (Greenwich convention); the first topology is then chain `II`. Without a second topology the first one is `I`. The name of the chain can be changed next to *Topology*.

The result is computed as soon as the input is valid; for an invalid input the page says what is wrong and keeps the last valid state.

**Pages:**

| Page | Content |
|---|---|
| Dynamic view | The animation: laboratory frame, root frame, every vertex. Per figure: particles, planes, labels, angles, legend, camera (drag to rotate, `Ctrl` + scroll to zoom, double click to reset), and the figure as SVG or PNG. Next to it a Feynman sketch of the topology and the amplitude row that builds up during the animation. |
| Notation | How the frame labels `[v\|K]` are read. |
| Amplitude construction | Reserved for the explanation of the amplitude of a decay chain; the content is still to be added. |
| Greenwich convention | The axes of the root frame on a sphere of directions, with the Euler rotations as a foldout. |
| Next step | Only for two different topologies: how the spin state of the decay topology is carried into the helicity basis of the reference topology. |

**Conventions in short:** metric `(+, −, −, −)`; the root `z` axis is the laboratory flight direction of the mother, the root `x` axis points along the transverse momentum of the first daughter of the reference topology; rotations turn vectors and states with positive angles, a coordinate system is parametrised with the inverse rotation. The page *Notation* gives the rest.

## Event file for `--event`

A JSON object with the four-momenta `[E, px, py, pz]`, and the two topologies as nested pairs:

```json
{
  "mother": [9.424309, 3.046443, 2.084185, 2.929122],
  "final_states": {
    "1": [4.559222, 3.922497, 2.091695, -0.159163],
    "2": [3.25, -0.58506, 1.191114, 2.793108],
    "3": [1.615087, -0.290994, -1.198624, 0.295177]
  },
  "reference_topology": [["1", "2"], "3"],
  "decay_topology": [["1", "2"], "3"]
}
```

Optional keys: `reference_label` (default `"I"`), `decay_label`, and `degenerate` (`"error"` or `"canonical"`, see below). Between 2 and 32 final states are allowed. A topology can also be given as a string such as `"((1 2) 3)"`.

Some events have no unique axes, for example a mother at rest in the laboratory frame. The page reports this as an error; the option *Resolve undefined axes by the canonical fallback* (`"degenerate": "canonical"` in a file) chooses canonical axes instead and flags the result.

## Files

| File | Content |
|---|---|
| `interactive.py` | the local server: serves the page and answers `POST /api/compute` with the frames of an event |
| `kinematics.py` | frames of an ordered cascade from four-momenta (NumPy only) |
| `alignment.py` | Greenwich axes, Euler angles and the transports between two topologies |
| `scene.py` | momenta of a frame as geometry (vectors, planes) |
| `interactive_data.py` | the data the browser gets: frames, transport steps, 41 samples per operation for the animation |
| `interactive_web/index.html`, `style.css` | page and style |
| `interactive_web/app.js` | start, computation request, rebuild of all pages |
| `interactive_web/decay_form.js` | the Decay Description |
| `interactive_web/transport.js` | the animation of the dynamic view |
| `interactive_web/drawing.js`, `sketch.js`, `legend.js`, `amplitude.js` | SVG drawing, topology sketch, legend, amplitude row |
| `interactive_web/greenwich.js`, `euler.js`, `nextstep.js` | the pages Greenwich convention (with Euler rotations) and Next step |
| `interactive_web/common.js` | shared helpers (DOM, mathematical symbols, SVG/PNG saving) |
| `interactive_web/world.js` | coarse land outlines for the globe of the Greenwich page (Natural Earth 110m, public domain) |

The Python code computes every physical quantity, including the intermediate states of the animation; the browser only interpolates between the samples and draws.
