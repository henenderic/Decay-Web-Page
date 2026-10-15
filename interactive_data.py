"""Browser payloads; every physical quantity comes from the existing core."""
from __future__ import annotations

import colorsys
from copy import deepcopy
import json
import math
import re

import numpy as np

from kinematics import InputError, compute_frames, leaves, parse_topology, tree_name, rotation_y, rotation_z, boost_z
from alignment import compute_alignment, greenwich
from scene import momentum_scene, MAX_PLANE_PARTICLES

SUPERSCRIPT = str.maketrans('0123456789I', '⁰¹²³⁴⁵⁶⁷⁸⁹ᴵ')
MINUS = '\u2212'
PARENT_COLOR = '#394953'
FINAL_STATE_COLORS = ['#B46765', '#5B8A74', '#296E96', '#8773A7', '#AB893C', '#558F99']
PAIR_COLORS = ['#D9803F', '#3F9C9F', '#B85C93', '#8B9A2E', '#6F73C4', '#A98B5B', '#C95D5D', '#4C8C5E', '#7A6AA8', '#9C7A2F']


# ------------------------------------------------------------------ text helpers
def display_tree(node):
    if isinstance(node, str):
        return node
    separator = '' if all(k.isdigit() and len(k) == 1 for k in leaves(node)) else ', '
    return '('+display_tree(node[0])+separator+display_tree(node[1])+')'


def display_frame(label):
    parts = label.split('|')
    if parts[0].startswith('R0^'):
        parts[0] = 'R₀'+parts[0][3:].translate(SUPERSCRIPT)
    elif parts[0] != 'lab':
        parts[0] = display_tree(parse_topology(parts[0]))
    return '|'.join(parts)


def index(node):
    """Subscript for a momentum: outermost parentheses removed, inner grouping kept."""
    return node if isinstance(node, str) else display_tree(node)[1:-1]


def escape(text):
    """Mini-markup for the browser: _ ^ { } @ \\ and ~ are structural."""
    return re.sub(r'([_^{}@\\~])', r'\\\1', text)


# Names of the manuscript (macros \prt, \itl, \vtc): a particle 1_p, an intermediate state (1 2)_i, a vertex (1 2)_v. They name objects in texts and decay
# expressions; momentum and helicity indices and frame labels keep the plain names.
def prt(name):
    return f'{escape(name)}_{{@{{p}}}}'


def itl(text):
    return f'{escape(text)}_{{@{{i}}}}'


def named(node):
    """A final-state particle or an intermediate state, as markup."""
    return prt(node) if isinstance(node, str) else itl(display_tree(node))


def decay_markup(parent, first, second):
    """A → B + C as markup; `parent` is markup (the mother 0 or an intermediate state), the daughters are nodes."""
    return f'{parent} → {named(first)} + {named(second)}'


ZERO = prt('0')


def frame_markup(label):
    parts = label.split('|')
    if parts[0].startswith('R0^'):
        head = 'R_0^{'+escape(parts[0][3:])+'}'
    elif parts[0] == 'lab':
        head = 'lab'
    else:
        head = escape(display_tree(parse_topology(parts[0])))
    return '|'.join([head]+['@{'+escape(p)+'}' for p in parts[1:]])                  # the topology label is upright text


def hex_color(rgb):
    return '#'+''.join(f'{round(float(c)*255):02x}' for c in rgb)


def colors_for(frames):
    """The colour of every particle as RGB in 0..1: the final states take the palette in the order of their numbers (further ones golden-ratio hues), an intermediate state the mean of its final states."""
    ids = sorted(leaves(frames.decay), key=lambda x: (not x.isdigit(), int(x) if x.isdigit() else x))
    colors = {key: tuple(int(FINAL_STATE_COLORS[i][k:k+2], 16)/255 for k in (1, 3, 5)) if i < len(FINAL_STATE_COLORS) else colorsys.hls_to_rgb((i*.61803398875) % 1, .47, .30)
              for i, key in enumerate(ids)}
    return lambda tree: np.mean([colors[key] for key in leaves(tree)], axis=0)


# ------------------------------------------------------------------ input
def parse_json(text):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise InputError(f'Duplicate JSON key: {key}')
            result[key] = value
        return result
    return json.loads(text, object_pairs_hook=unique)


def normalize_event(event):
    if not isinstance(event, dict):
        raise InputError('An event must be a JSON object.')
    required = ['mother', 'final_states', 'reference_topology', 'decay_topology']
    if any(k not in event for k in required):
        raise InputError('Required fields: mother, final_states, reference_topology, decay_topology.')
    if not isinstance(event['final_states'], dict) or not 2 <= len(event['final_states']) <= 32:
        raise InputError('Between 2 and 32 final-state particles are required.')
    for name in ['reference_topology', 'decay_topology']:
        if len(json.dumps(event[name])) > 4096:
            raise InputError('The topology string is too long.')
    normalized = {k: deepcopy(event[k]) for k in required}
    for key, default in [('reference_label', 'I'), ('decay_label', None), ('degenerate', 'error')]:
        normalized[key] = event.get(key, default)
    return normalized


# ------------------------------------------------------------------ transport description
ROOT_PARAMETERS = [
    # texts use $...$ for mathematics; the viewer sets them as such. The rotations come first, the boost last (the Greenwich rotation commutes with it).
    ('Rz', 'φ_0', f'azimuth of the laboratory flight direction of ${ZERO}$',
     f'Change to axes turned by $φ_0$ about the $z$ axis, where $φ_0$ is the azimuth of the laboratory momentum of the mother ${ZERO}$. '
     'The coordinates transform with the inverse rotation $R_z(−φ_0)$; against the axes, all momenta of the event turn by $−φ_0$. '
     f'Afterwards the momentum of ${ZERO}$ lies in the $xz$ plane; no energy changes.'),
    ('Ry', 'ϑ_0', f'polar angle of the laboratory flight direction of ${ZERO}$',
     f'Change to axes tilted by $ϑ_0$ about the $y$ axis, where $ϑ_0$ is the polar angle of the momentum of ${ZERO}$. '
     f'The coordinates transform with $R_y(−ϑ_0)$; against the axes, all momenta turn by $−ϑ_0$. Afterwards the flight direction of ${ZERO}$ '
     'coincides with the $+z$ axis, which becomes the $z$ axis of all root-based frames.'),
    ('Rz', 'χ', 'Greenwich angle: azimuth of the first daughter of the reference topology',
     'Change to axes turned by $χ$ about $z$, where $χ$ is the azimuth of the first daughter of the REFERENCE topology in the rest frame of '
     f'${ZERO}$ (a boost along $z$ does not change it, so it can be taken before the boost). The coordinates transform with $R_z(−χ)$. '
     'This angle is the Greenwich choice, and it is made by the reference topology alone: afterwards that daughter lies in the $xz$ plane with a '
     'positive $x$ component, which fixes the root axes once for all topologies. A decay topology that differs from the reference topology does not '
     'choose its own $x$ axis; its first daughter then generally has a nonzero azimuth in these axes. The page “Greenwich convention” shows this step.'),
    ('Bz', 'η_0', f'rapidity of ${ZERO}$ along the inherited $z$ axis',
     f'Change to the frame that moves along $z$ with the rapidity $η_0$ of the mother ${ZERO}$. The coordinates transform with the boost of rapidity $−η_0$. After this step ${ZERO}$ is at rest. '
     'The $z$ components and energies of all momenta change, the transverse components ($x$, $y$) are unchanged.'),
]
AXIS_NAME = {'Rz': 'R_z', 'Ry': 'R_y', 'Bz': 'B_z'}


def sym(name, node=None):
    """Symbol markup such as φ_{12}; node supplies the subscript."""
    return name if node is None else name+'_{'+escape(index(node))+'}'


def describe_step(step, by_label):
    """Operation factors with symbolic parameter names; values stay in the numeric fields."""
    operations, parameters = [], []
    if step.role == 'root':
        for op, (axis, name, text, detail) in zip(step.operations, ROOT_PARAMETERS):
            symbol = name
            symbol_with_label = name
            operations.append({'operator': op.axis, 'parameter': op.value, 'symbol': symbol, 'description': text, 'detail': detail,
                               'factor_markup': AXIS_NAME[op.axis]+'('+MINUS+symbol+')'})
            parameters.append({'symbol_markup': symbol_with_label, 'value': -op.value,
                               'kind': 'rapidity' if op.axis == 'Bz' else 'angle', 'description': text})
        return operations, parameters
    parent = by_label[step.source]
    child = by_label[step.target]
    ref, spec = parent.node
    B, C = named(ref), named(spec)
    A = ZERO if step.source.startswith('R0^') else itl(display_tree(parent.node))       # the decaying system: the mother 0 at the root, otherwise an intermediate state
    is_reference = child.node == ref
    target = named(child.node)
    names = iter([('φ', ref, f'azimuth of the reference daughter ${B}$ in the parent frame'),
                  ('ϑ', ref, f'polar angle of the reference daughter ${B}$ in the parent frame')])
    for op in step.operations:
        if op.axis == 'Bz':
            node = child.node
            text = f'rapidity of ${target}$ in the parent frame'
            symbol = sym('η', node)
            detail = (f'Change to the frame that moves along $z$ with the rapidity $η$ of ${target}$ in the parent frame; the coordinates transform with the boost of rapidity $−η$. '
                      f'Afterwards ${target}$ is at rest: this is the rest frame of ${target}$. Energies and $z$ components of all momenta change; '
                      'the transverse components are unchanged.')
        elif op.axis == 'Ry' and abs(op.value+math.pi) < 1e-13:
            operations.append({'operator': op.axis, 'parameter': op.value, 'symbol': None,
                               'description': 'half-turn of the spectator transport, fixed by convention',
                               'detail': f'Half-turn of the axes about $y$ (the transformation $R_y(−π)$, fixed by the convention for the spectator transport). '
                                         f'After the two previous rotations the reference daughter ${B}$ points along $+z$ and the spectator ${C}$ along $−z$; '
                                         f'the half-turn makes ${C}$ point along $+z$, so the following boost along $z$ brings ${C}$ to rest.',
                               'factor_markup': AXIS_NAME[op.axis]+'('+MINUS+'π)'})
            continue
        else:
            name, node, text = next(names)
            symbol = sym(name, node)
            if op.axis == 'Rz':
                detail = (f'Change to axes turned by $φ$ about the $z$ axis, where $φ$ is the azimuth of the reference daughter ${B}$ in the parent frame (decay ${A} → {B} + {C}$); '
                          f'the coordinates transform with $R_z(−φ)$. Afterwards ${B}$ lies in the $xz$ plane. The azimuth is not reset by later steps.')
            else:
                detail = (f'Change to axes tilted by $ϑ$ about the $y$ axis, where $ϑ$ is the polar angle of the reference daughter ${B}$ in the parent frame; '
                          f'the coordinates transform with $R_y(−ϑ)$. Afterwards ${B}$ points along $+z$ and the spectator ${C}$ along $−z$, because the parent is at rest.')
        operations.append({'operator': op.axis, 'parameter': op.value, 'symbol': symbol, 'description': text, 'detail': detail,
                           'factor_markup': AXIS_NAME[op.axis]+'('+MINUS+symbol+')'})
        parameters.append({'symbol_markup': symbol, 'value': -op.value,
                           'kind': 'rapidity' if op.axis == 'Bz' else 'angle', 'description': text})
    return operations, parameters


def topology_json(tree):
    """A topology as nested nodes for the Feynman sketches: name as in the frame labels, display name, children (first = reference daughter, second = spectator)."""
    if isinstance(tree, str):
        return {'name': tree, 'display': tree, 'leaf': True}
    return {'name': tree_name(tree), 'display': display_tree(tree), 'leaf': False, 'children': [topology_json(tree[0]), topology_json(tree[1])]}


def greenwich_rule(frames):
    """The Greenwich choice made by the reference topology, as one sentence."""
    first = display_tree(frames.reference[0])
    return (f'Greenwich convention, fixed by the reference topology {frames.reference_label}: z along the laboratory flight direction of 0, '
            f'x along the transverse momentum of the first daughter {first} of topology {frames.reference_label}, y completing a right-handed system. '
            'All topologies use these root axes.')


def figure_texts(frame, frames, root, parent_node):
    """English title, decay line and note for a figure (plain), and the title and the decay line with the names of the manuscript (markup)."""
    ref_label, dec_label = frames.reference_label, frames.decay_label
    if frame.label == 'lab':
        return ('Laboratory frame',
                '0 → '+' + '.join(display_tree(t) for t in frames.decay),
                'Specified starting frame of the event. The mother 0 enters with its laboratory momentum (incoming arrow).',
                'Laboratory frame', f'{ZERO} → '+' + '.join(named(t) for t in frames.decay))
    if frame is frames.reference_first:
        return ('Rest frame of 0 (reference topology)',
                '0 → '+display_tree(frames.reference[0])+' + '+display_tree(frames.reference[1]),
                f'First decay of topology {ref_label}. '+greenwich_rule(frames),
                f'Rest frame of ${ZERO}$ (reference topology)', decay_markup(ZERO, frames.reference[0], frames.reference[1]))
    if frame.kind == 'all':
        return ('Rest frame of 0 (all final states)',
                '0 → '+' + '.join(display_tree(leaf) for leaf in leaves(frames.decay)),
                f'All final-state momenta in the root axes R₀{ref_label.translate(SUPERSCRIPT)}, which are common to every topology. '+greenwich_rule(frames),
                f'Rest frame of ${ZERO}$ (all final states)', f'{ZERO} → '+' + '.join(prt(leaf) for leaf in leaves(frames.decay)))
    first, second = frame.node
    decay = display_tree(parent_node)+' → '+display_tree(first)+' + '+display_tree(second)
    decaying = ZERO if root else itl(display_tree(frame.node))
    decay_m = decay_markup(decaying, first, second)
    if root:
        note = f'First decay of topology {dec_label} in the common root axes R₀{ref_label.translate(SUPERSCRIPT)}.'
        if frames.reference == frames.decay:
            note += ' This is also the reference topology, so this decay fixes the root axes. '+greenwich_rule(frames)
        else:
            note += (f' The root axes were fixed by the first daughter {display_tree(frames.reference[0])} of the reference topology {ref_label}, '
                     f'not by the first daughter {display_tree(first)} of this decay. '+greenwich_rule(frames))
        return ('Rest frame of 0', decay, note, f'Rest frame of ${ZERO}$', decay_m)
    role = frame.path[-1].role
    return ('Rest frame of '+display_tree(frame.node), decay,
            f'Reached from the parent frame by the {role} transport of topology {dec_label}. '
            'The z axis inherits the momentum direction in the parent frame; the azimuth is not reset.',
            f'Rest frame of ${decaying}$', decay_m)


# ------------------------------------------------------------------ animation
SAMPLES_PER_OPERATION = 40
MATRIX = {'Rz': rotation_z, 'Ry': rotation_y, 'Bz': boost_z}


def all_nodes(tree):
    """Every subsystem of a topology: leaves, intermediate nodes and the whole tree."""
    if isinstance(tree, str):
        return [tree]
    return all_nodes(tree[0])+all_nodes(tree[1])+[tree]


def build_animation(frames, by_label, key_of, descriptions):
    """Sampled momenta while each transport operation is applied gradually.

    For an operation with parameter p the sample k is the momentum after
    M(p*k/N) acts on the state before the operation. M is the same matrix
    family used by the transports, so the last sample equals the exact frame.
    """
    nodes = [tree_name(n) for n in all_nodes(frames.decay)]
    nodes = ['0']+nodes[:-1]                         # the whole tree is the mother 0
    trees = [None]+all_nodes(frames.decay)[:-1]

    def state(frame):
        return {name: (frame.momenta['0'] if tree is None else frame.momentum(tree))
                for name, tree in zip(nodes, trees)}

    transitions = {}
    for frame in frames.decays:
        step = frame.path[-1]
        parent = by_label[step.source]
        current = state(parent)
        ops = []
        for op, description in zip(step.operations, descriptions[frame.key]):
            samples = []
            for k in range(SAMPLES_PER_OPERATION+1):
                matrix = MATRIX[op.axis](op.value*k/SAMPLES_PER_OPERATION)
                samples.append([[round(float(x), 9) for x in (matrix @ current[name])[1:]] for name in nodes])
            current = {name: MATRIX[op.axis](op.value) @ vector for name, vector in current.items()}
            ops.append({**description, 'samples': samples})
        transitions[frame.key] = {'from': key_of[step.source], 'to': frame.key, 'operations': ops}

    chains = []
    parents = {frame.key: key_of[frame.path[-1].source] for frame in frames.decays}
    has_child = set(parents.values())
    for frame in frames.decays:
        if frame.key in has_child:
            continue
        stages, key = [], frame.key
        while key != key_of['lab']:
            stages.append(key); key = parents[key]
        chains.append({'target': frame.key, 'stages': [key_of['lab']]+stages[::-1]})
    return {'nodes': nodes, 'samples_per_operation': SAMPLES_PER_OPERATION, 'transitions': transitions, 'chains': chains}


# ------------------------------------------------------------------ helicity alignment and Greenwich view
def describe_edge(edge, topology):
    """Names for one step of a chain, L_{parent<-daughter} = R_z(phi) R_y(theta) [R_y(pi)] B_z(eta), and its factors; factors that vanish are left out.
    Parameters carry the topology label as superscript: phi_B^T and theta_B^T are the angles of the reference daughter B in its parent frame, eta_C^T
    is the rapidity of the transported daughter C in its parent frame."""
    head = lambda label: label.split('|')[0]
    node = lambda text: text if '(' not in text else parse_topology(text)             # a final-state particle is a plain name
    parent = 'R_0' if head(edge['parent']).startswith('R0^') else escape(display_tree(node(head(edge['parent']))))
    child_node = node(head(edge['child']))
    child, T = escape(display_tree(child_node)), escape(topology)
    ref = escape(index(node(edge['reference_daughter'])))
    factors = []
    for axis, value, symbol in [('Rz', edge['phi'], f'φ_{{{ref}}}^{{{T}}}'), ('Ry', edge['theta'], f'ϑ_{{{ref}}}^{{{T}}}'),
                                ('Ry', math.pi if edge['half_turn'] else 0.0, 'π'), ('Bz', edge['eta'], f'η_{{{escape(index(child_node))}}}^{{{T}}}')]:
        if abs(value) > 1e-12:
            factors.append({'operator': axis, 'value': value, 'symbol': symbol, 'markup': f'{AXIS_NAME[axis]}({symbol})', 'inverse_markup': f'{AXIS_NAME[axis]}({MINUS}{symbol})'})
    edge.update(label=f'L_{{{parent}←{child}}}^{{{T}}}', parent_markup=parent, child_markup=child, factors=factors)


def alignment_payload(frames, color):
    """W_i^{K->I} for the browser: numbers come from alignment.py, this function only adds names and explanations."""
    data = compute_alignment(frames)
    if data is None:
        return None
    for entry in data['particles']:
        name = entry['particle']
        entry.update(index_markup=escape(name), color=hex_color(color(name)),
                     source_markup=frame_markup(entry['source_frame']), target_markup=frame_markup(entry['target_frame']),
                     source_label=display_frame(entry['source_frame']), target_label=display_frame(entry['target_frame']),
                     source_terminal_markup=escape(name)+'|@{'+escape(frames.decay_label)+'}', target_terminal_markup=escape(name)+'|@{'+escape(frames.reference_label)+'}')
        if not entry['available']:
            continue
        for item in entry['momenta']:
            item.update(index_markup=escape(item['particle']), color=hex_color(color(item['particle'])))
        for op, greek in zip(entry['operations'], ['γ', 'β', 'α']):                       # the Euler operations of W = R_z(α) R_y(β) R_z(γ), in the order of application
            op['short_markup'] = AXIS_NAME[op['operator']]+'('+greek+')'
        for key, topology in [('source_edges', frames.decay_label), ('reference_edges', frames.reference_label)]:
            for edge in entry[key]:
                describe_edge(edge, topology)
    data['source_label'], data['target_label'] = frames.decay_label, frames.reference_label
    data['rule'] = ('W = [path of i in I]\u207b\u00b9 [path of i in K]; the rotation R = R_z(α) R_y(β) R_z(γ) has row = target axes of i|I, column = source axes of i|K; '
                    'D^{j}_{λν}(W) = ε^{2j} e^{−iλα} d^{j}_{λν}(β) e^{−iνγ}.')
    return data


def greenwich_payload(frames, color):
    def describe(tree):
        return display_tree(tree), hex_color(color(tree))
    data = greenwich(frames, describe)
    data['rule'] = greenwich_rule(frames)
    data['reference_first_label'] = display_tree(frames.reference[0])
    data['decay_first_label'] = display_tree(frames.decay[0])
    return data


# ------------------------------------------------------------------ amplitude of the decay chain
def amplitude_payload(frames, event):
    """What the amplitude row of the dynamic view needs: the vertices of the decay topology (the vertex frame, the decaying system A and its two daughters B, C),
    the intermediate states with their lineshapes, and the final states in particle order with the vertex that produces them. The terms of a vertex are
    sqrt((2 j_A+1)/(4 pi)) D^{j_A *}_{lambda_A, lambda_B-lambda_C}(phi_B, theta_B, 0) (-1)^{j_C-lambda_C} h_{lambda_B lambda_C}(vertex);
    every intermediate state adds a lineshape G(s) and the sum over its helicity. All numbers stay in the core; here only names and structure."""
    def entry(node):
        return {'name': tree_name(node), 'index': escape(index(node)), 'leaf': isinstance(node, str), 'display': display_tree(node),
                'members': list(leaves(node))}
    vertices = []
    for frame in frames.decays:
        ref, spec = frame.node
        root = frame.label.startswith('R0^')
        vertices.append({
            'key': frame.key, 'node': tree_name(frame.node), 'display': display_tree(frame.node), 'root': root,
            'frame_markup': frame_markup(frame.label), 'frame_label': display_frame(frame.label),
            'A': {'index': '0' if root else escape(index(frame.node)), 'internal': not root, 'members': list(leaves(frame.node))},
            'B': entry(ref), 'C': entry(spec),
            # the first root azimuth of the reference topology is zero by the Greenwich choice
            'phi_zero': bool(root and frames.reference[0] == ref)})
    return {'topology_label': frames.decay_label, 'reference_label': frames.reference_label,
            'letter': 'λ' if frames.decay == frames.reference else 'ν',
            'vertices': vertices, 'leaves': [{'name': name, 'index': escape(name)} for name in event['final_states']]}


# ------------------------------------------------------------------ payload
def build_payload(event):
    event = normalize_event(event)
    frames = compute_frames(event['mother'], event['final_states'], event['reference_topology'], event['decay_topology'],
                            reference_label=event['reference_label'], decay_label=event['decay_label'],
                            degenerate=event['degenerate'])
    color = colors_for(frames)
    production = {tree_name(child): f for f in frames.decays for child in f.node}   # frame in which the helicity of a particle is defined
    by_label = {f.label: f for f in frames.decays}
    by_label['lab'] = frames.lab
    key_of = {f.label: f.key for f in frames.decays}
    key_of['lab'] = frames.lab.key
    descriptions = {}
    result = {'viewer_schema': 2, 'event': event,
              'reference_topology': tree_name(frames.reference), 'decay_topology': tree_name(frames.decay),
              'reference_label': frames.reference_label, 'decay_label': frames.decay_label,
              'warnings': frames.warnings, 'checks': frames.checks, 'figures': []}
    # The reference topology only orients the common root axes; its own decay is never shown as a figure, because for a
    # different decay topology it is not part of the chain, and for an identical one it is the first decay anyway.
    pair_color = {}
    ordered = [key for key in event['final_states']][:MAX_PLANE_PARTICLES]
    for i, a in enumerate(ordered):
        for b in ordered[i+1:]:
            pair_color[a+b if len(a) == 1 and len(b) == 1 else a+' '+b] = PAIR_COLORS[len(pair_color) % len(PAIR_COLORS)]
    for frame in frames.selected(True, True):
        if frame is frames.reference_first:
            continue
        scene = momentum_scene(frame, resonances=True, context=True)
        data = scene.as_dict()
        for vector, item in zip(scene.vectors, data['vectors']):
            item['color'] = hex_color(color(vector.node))
            item['index'] = index(vector.node)
            item['label'] = display_tree(vector.node)
            item['energy'] = float(frame.momentum(vector.node)[0])
            raw = frame.label          # helicity labels are measured in the frame that is displayed
            item['helicity_frame'] = display_frame(raw)
            item['helicity_markup'] = frame_markup(raw)
            item['index_markup'] = escape(item['index'])
        root = frame is frames.decays[0] or frame is frames.reference_first
        parent = '0' if frame.kind == 'all' or root else frame.node
        parent_p = frame.momenta['0'] if frame.kind == 'all' else frame.momentum(frame.node)
        parent_raw = frame.label
        data['parent'] = {'id': frame.key+'/parent', 'node': '0' if parent == '0' else tree_name(parent), 'index': index(parent), 'label': display_tree(parent),
                          'color': PARENT_COLOR if parent == '0' else hex_color(color(parent)),
                          'spatial': parent_p[1:].tolist(), 'energy': float(parent_p[0]),
                          'index_markup': escape(index(parent)),
                          'helicity_frame': display_frame(parent_raw), 'helicity_markup': frame_markup(parent_raw)}
        node_color = {item['particle']: item['color'] for item in data['vectors']}
        node_color['0'] = PARENT_COLOR
        for plane in data['planes']:
            plane['color'] = pair_color.get(plane['node'], PARENT_COLOR)
        for guide in data['sum_guides']:
            copied = next(v for v in data['vectors'] if v['id'] == guide['copied_vector_id'])
            guide['color'] = copied['color']
        title, decay, note, title_markup, decay_markup_text = figure_texts(frame, frames, root, parent)
        steps = []
        for step in frame.path:
            operations, parameters = describe_step(step, by_label)
            if frame.path[-1] is step:
                descriptions[frame.key] = [{k: v for k, v in op.items()} for op in operations]
            steps.append({'source': step.source, 'target': step.target, 'role': step.role,
                          'source_markup': frame_markup(step.source), 'target_markup': frame_markup(step.target),
                          'operations': operations, 'parameters': parameters})
        result['figures'].append({
            'id': frame.key, 'title': title, 'decay': decay, 'note': note, 'title_markup': title_markup, 'decay_markup': decay_markup_text,
            'node': tree_name(frame.node) if frame.kind == 'vertex' else None,
            'frame_label': display_frame(frame.label), 'tag_markup': frame_markup(frame.label),
            'vertex_markup': escape(display_tree(frame.node)),
            'optional': frame is frames.reference_first or frame is frames.root_all,
            'kind': frame.kind, 'local_plane': frame.kind == 'vertex' and not root,
            'scene': data, 'angles': None if frame.angles is None else {'phi': frame.angles[0], 'theta': frame.angles[1]},
            'path': steps, 'matrix': frame.matrix.tolist(), 'warnings': frame.degeneracies,
        })
    result['topologies'] = {'reference': topology_json(frames.reference), 'decay': topology_json(frames.decay),
                             'reference_label': frames.reference_label, 'decay_label': frames.decay_label}
    result['helicity_frames'] = {name: {'figure': f.key, 'frame_label': display_frame(f.label), 'tag_markup': frame_markup(f.label)}
                                 for name, f in production.items()}
    result['animation'] = build_animation(frames, by_label, key_of, descriptions)
    result['amplitude'] = amplitude_payload(frames, event)
    result['alignment'] = alignment_payload(frames, color)
    result['greenwich'] = greenwich_payload(frames, color)
    return result
