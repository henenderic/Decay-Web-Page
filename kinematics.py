"""Ordered cascade frames; NumPy only, no plotting or global state.

Column four-vectors (E,px,py,pz), metric +---. Matrices act rightmost first.
See README.md for the conventions.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from collections.abc import Mapping
import math
import re
from typing import Union

import numpy as np

Tree = Union[str, tuple['Tree', 'Tree']]
G = np.diag([1., -1., -1., -1.])
RTOL = 2e-9


class InputError(ValueError):
    """Invalid event, tree, or geometrically undefined frame."""


def leaves(tree: Tree) -> tuple[str, ...]:
    return (tree,) if isinstance(tree, str) else leaves(tree[0]) + leaves(tree[1])


def tree_name(tree: Tree) -> str:
    return tree if isinstance(tree, str) else f'({tree_name(tree[0])} {tree_name(tree[1])})'


def parse_topology(value) -> Tree:
    """Parse nested pairs or '(1 (2 3))'; IDs require spaces or commas."""
    def normalize(node):
        if isinstance(node, bool):
            raise InputError('Boolean values are not particle identifiers.')
        if isinstance(node, (str, int)):
            label = str(node)
            if not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]*|[0-9]+', label):
                raise InputError(f'Invalid particle identifier: {label!r}')
            return label
        if not isinstance(node, (list, tuple)) or len(node) != 2:
            raise InputError('Each internal node must have exactly two ordered daughters.')
        return (normalize(node[0]), normalize(node[1]))

    if isinstance(value, str) and ('(' in value or ')' in value):
        tokens = re.findall(r'\(|\)|,|[A-Za-z][A-Za-z0-9_]*|[0-9]+|\S', value)
        position = 0

        def parse():
            nonlocal position
            if position >= len(tokens):
                raise InputError('Unexpected end of topology.')
            token = tokens[position]
            position += 1
            if token != '(':
                return normalize(token)
            left = parse()
            if position < len(tokens) and tokens[position] == ',':
                position += 1
            right = parse()
            if position >= len(tokens) or tokens[position] != ')':
                raise InputError('Expected a closing parenthesis after two daughters.')
            position += 1
            return (left, right)

        tree = parse()
        if position != len(tokens):
            raise InputError('Unexpected tokens after the topology.')
    else:
        tree = normalize(value)
    if isinstance(tree, str):
        raise InputError('A topology must describe at least one binary decay.')
    ids = leaves(tree)
    if len(ids) != len(set(ids)):
        raise InputError('Every final-state particle must occur exactly once in a topology.')
    if not 2 <= len(ids) <= 32:
        raise InputError('Supported input size: 2 to 32 distinct final-state particles.')
    return tree


def rotation_y(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0, 0], [0, c, 0, s], [0, 0, 1, 0], [0, -s, 0, c]])


def rotation_z(a: float) -> np.ndarray:
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0, 0], [0, c, -s, 0], [0, s, c, 0], [0, 0, 0, 1]])


def boost_z(eta: float) -> np.ndarray:
    c, s = math.cosh(eta), math.sinh(eta)
    return np.array([[c, 0, 0, s], [0, 1, 0, 0], [0, 0, 1, 0], [s, 0, 0, c]])


def invariant(p: np.ndarray) -> float:
    return float(p @ G @ p)


def mass(p: np.ndarray, label: str) -> float:
    m2 = invariant(p)
    if m2 <= 1e-12 * float(p @ p):
        raise InputError(f'{label}: a numerically resolved timelike momentum is required for a rest frame.')
    return math.sqrt(m2)


def phi_angle(y, x):
    a = math.atan2(float(y), float(x))
    return math.pi if a == -math.pi else a


@dataclass
class Operation:
    axis: str
    value: float
    purpose: str

    def matrix(self):
        return {'Rz': rotation_z, 'Ry': rotation_y, 'Bz': boost_z}[self.axis](self.value)

    def as_dict(self):
        return {'operator': self.axis, 'parameter': self.value,
                'parameter_kind': 'rapidity' if self.axis == 'Bz' else 'angle_radians',
                'purpose': self.purpose, 'matrix': self.matrix().tolist()}


@dataclass
class Transition:
    source: str
    target: str
    role: str
    operations: list[Operation]  # In the order actually applied to column vectors.

    @property
    def matrix(self):
        result = np.eye(4)
        for op in self.operations:
            result = op.matrix() @ result
        return result

    def as_dict(self):
        return {'source': self.source, 'target': self.target, 'role': self.role,
                'operations_in_application_order': [op.as_dict() for op in self.operations],
                'coordinate_map': self.matrix.tolist(),
                'inverse_map_to_parent': (G @ self.matrix.T @ G).tolist()}


@dataclass
class Frame:
    key: str
    label: str
    kind: str
    node: Tree
    topology_label: str
    matrix: np.ndarray
    momenta: dict[str, np.ndarray]
    path: list[Transition]
    angles: tuple[float, float] | None = None  # phi, theta of first daughter
    degeneracies: list[str] = field(default_factory=list)

    def momentum(self, node: Tree):
        return sum((self.momenta[k] for k in leaves(node)), np.zeros(4))

    def as_dict(self):
        local = {k: v.tolist() for k, v in self.momenta.items()}

        def add_nodes(node):
            if not isinstance(node, str):
                local[tree_name(node)] = self.momentum(node).tolist()
                add_nodes(node[0])
                add_nodes(node[1])

        add_nodes(self.node)
        return {'key': self.key, 'frame_label': self.label, 'kind': self.kind,
                'vertex': tree_name(self.node), 'topology_label': self.topology_label,
                'coordinate_map_from_lab': self.matrix.tolist(), 'momenta': local,
                'angles_radians': None if self.angles is None else dict(zip(['phi', 'theta'], self.angles)),
                'transformation_path': [t.as_dict() for t in self.path],
                'degeneracies': self.degeneracies}


@dataclass
class FrameSet:
    reference: Tree
    decay: Tree
    reference_label: str
    decay_label: str
    lab: Frame
    reference_first: Frame
    root_all: Frame
    decays: list[Frame]
    checks: list[dict]
    warnings: list[str]
    degeneracy_policy: str

    def selected(self, include_reference=False, include_root_all=False):
        out = [self.lab]
        if include_reference:
            out.append(self.reference_first)
        out.append(self.decays[0])
        if include_root_all:
            out.append(self.root_all)
        return out + self.decays[1:]

    def as_dict(self):
        return {'schema_version': 1, 'four_vector_order': ['E', 'px', 'py', 'pz'],
                'metric': '+---', 'units': 'consistent user units; hbar=c=1',
                'matrix_action': 'Column vectors; products act rightmost first. Operation lists act top to bottom.',
                'reference_topology': tree_name(self.reference), 'decay_topology': tree_name(self.decay),
                'reference_label': self.reference_label, 'decay_label': self.decay_label,
                'degeneracy_policy': self.degeneracy_policy, 'warnings': self.warnings,
                'checks': self.checks,
                'frames': [f.as_dict() for f in self.selected(True, True)]}


def compute_frames(mother, final_states, reference_topology, decay_topology, *,
                   reference_label='I', decay_label=None, degenerate='error') -> FrameSet:
    """Compute all vertex frames. Neither plotting nor filesystem writes occur here.

    ``degenerate='canonical'`` explicitly permits arbitrary axes at singular
    events; every such choice is logged. It is not a manuscript convention.
    """
    if degenerate not in ('error', 'canonical'):
        raise InputError("degenerate must be 'error' or 'canonical'.")
    reference, decay = parse_topology(reference_topology), parse_topology(decay_topology)
    decay_label = decay_label or (reference_label if decay == reference else ('II' if reference_label != 'II' else 'III'))
    for label in [reference_label, decay_label]:
        if not isinstance(label, str) or not re.fullmatch(r'[A-Za-z0-9]+', label):
            raise InputError('Topology labels must be nonempty ASCII letters/digits.')
    if decay != reference and decay_label == reference_label:
        raise InputError('Distinct topologies must have distinct labels.')
    if not isinstance(final_states, Mapping):
        raise InputError('final_states must map particle IDs to four-vectors.')
    momenta = {}
    for label, vector in list(final_states.items()) + [('0', mother)]:
        key = str(label)
        if key in momenta or (key == '0' and label != '0'):
            raise InputError(f'Duplicate or reserved particle identifier: {key}')
        try:
            p = np.array(vector, dtype=float)
        except (ValueError, TypeError) as exc:
            raise InputError(f'{key}: expected four numeric components.') from exc
        if p.shape != (4,) or not np.all(np.isfinite(p)) or p[0] <= 0:
            raise InputError(f'{key}: expected four finite components (E,px,py,pz), E>0.')
        if invariant(p) < -1e-10 * float(p @ p):
            raise InputError(f'{key}: spacelike four-momentum.')
        momenta[key] = p
    ids = tuple(k for k in momenta if k != '0')
    if set(leaves(reference)) != set(ids) or set(leaves(decay)) != set(ids):
        raise InputError('Both trees must contain exactly the final-state IDs. Use "((1 2) 3)", not ambiguous "((12)3)".')
    p0 = momenta['0']
    event_scale = max(float(p0[0]), np.finfo(float).tiny)
    total = sum((momenta[k] for k in ids), np.zeros(4))
    if np.max(np.abs(total-p0)) > RTOL * event_scale:
        raise InputError(f'Four-momentum is not conserved: sum(final)-mother={(total-p0).tolist()}')
    m0 = mass(p0, 'Mother 0')
    warnings = []

    def fallback(message, sink):
        if degenerate == 'error':
            raise InputError(message + " Supply a nondegenerate event or use '--degenerate canonical' for the documented arbitrary fallback.")
        sink.append(message)
        warnings.append(message)

    q0 = float(np.linalg.norm(p0[1:]))
    root_degenerate = []
    if q0 <= 1e-11 * event_scale:
        fallback('Mother 0 is at rest in the lab: flight z is undefined; using lab +z.', root_degenerate)
        phi0, theta0 = 0., 0.
    else:
        rho = math.hypot(p0[1], p0[2])
        # The preliminary azimuth at a flight pole is a gauge; Greenwich fixes it below.
        phi0 = phi_angle(p0[2], p0[1]) if rho > 1e-12*q0 else 0.
        theta0 = math.atan2(rho, p0[3])
    root_ops = [Operation('Rz', -phi0, 'Align mother azimuth'),
                Operation('Ry', -theta0, 'Align mother flight with +z'),
                Operation('Bz', -math.asinh(q0/m0), 'Bring mother 0 to rest')]
    root_label = f'R0^{reference_label}'
    root_step = Transition('lab', root_label, 'root', root_ops)
    reference_sum = sum((momenta[k] for k in leaves(reference[0])), np.zeros(4))
    r = root_step.matrix @ reference_sum
    if math.hypot(r[1], r[2]) <= 1e-11 * max(abs(r[0]), m0):
        fallback('Root reference has no transverse momentum: Greenwich x is undefined; retaining the preliminary x axis.', root_degenerate)
        chi = 0.
    else:
        chi = phi_angle(r[2], r[1])
    # The Greenwich rotation commutes with the boost along z; it stands before the boost, so that the rotations are grouped.
    root_ops.insert(2, Operation('Rz', -chi, 'Greenwich: reference transverse momentum along +x'))
    root_matrix = root_step.matrix

    def transformed(matrix):
        return {k: matrix @ p for k, p in momenta.items()}

    def decay_angles(frame):
        reference_p = frame.momentum(frame.node[0])
        q = float(np.linalg.norm(reference_p[1:]))
        scale = max(float(frame.momentum(frame.node)[0]), np.finfo(float).tiny)
        if q <= 1e-11 * scale:
            fallback(f'{frame.label}: threshold, reference direction undefined; using theta=phi=0.', frame.degeneracies)
            return (0., 0.)
        rho = math.hypot(reference_p[1], reference_p[2])
        if rho <= 1e-11 * scale:
            fallback(f'{frame.label}: reference on z axis, azimuth undefined; using phi=0.', frame.degeneracies)
            phi = 0.
        else:
            phi = phi_angle(reference_p[2], reference_p[1])
        return phi, math.atan2(rho, reference_p[3])

    def new_frame(key, label, kind, tree, top_label, matrix, path, degeneracies=None):
        frame = Frame(key, label, kind, tree, top_label, matrix.copy(), transformed(matrix),
                      list(path), degeneracies=list(degeneracies or []))
        if kind == 'vertex':
            frame.angles = decay_angles(frame)
        return frame

    lab = new_frame('00_lab', 'lab', 'all', decay, decay_label, np.eye(4), [])
    reference_first = new_frame('01_reference_root', f'{root_label}|{reference_label}', 'vertex',
                                reference, reference_label, root_matrix, [root_step], root_degenerate)
    root_all = new_frame('03_root_all', f'{root_label}|{decay_label}', 'all', decay,
                         decay_label, root_matrix, [root_step], root_degenerate)
    first = new_frame('02_decay_root', f'{root_label}|{decay_label}', 'vertex', decay,
                      decay_label, root_matrix, [root_step], root_degenerate)
    decays = [first]

    def visit(parent, address=''):
        phi, theta = parent.angles
        for side, child in enumerate(parent.node):
            if isinstance(child, str):
                continue  # Terminal spin rest frames are not additional decays.
            p = parent.momentum(child)
            m = mass(p, tree_name(child))
            eta = math.asinh(float(np.linalg.norm(p[1:]))/m)
            role = 'reference' if side == 0 else 'spectator'
            operations = [Operation('Rz', -phi, 'Undo parent reference azimuth'),
                          Operation('Ry', -theta, 'Undo parent reference polar angle')]
            if side == 1:
                operations.append(Operation('Ry', -math.pi, 'Undo spectator half-turn; preserve the -pi branch'))
            operations.append(Operation('Bz', -eta, f'Bring {tree_name(child)} to rest'))
            label = f'{tree_name(child)}|{decay_label}'
            step = Transition(parent.label, label, role, operations)
            path_name = address + ('L' if side == 0 else 'R')
            frame = new_frame('decay_'+path_name, label, 'vertex', child, decay_label,
                              step.matrix @ parent.matrix, parent.path+[step])
            decays.append(frame)
            visit(frame, path_name)

    visit(first)
    checks = []

    def checked(name, value, tolerance):
        value = float(value)
        if not math.isfinite(value) or value > tolerance:
            raise InputError(f'Numerical check failed: {name}, residual {value:.4g} > {tolerance:.4g}')
        checks.append({'name': name, 'residual': value, 'tolerance': tolerance, 'passed': True})

    checked('lab conservation / event energy', np.max(np.abs(total-p0))/event_scale, RTOL)
    for frame in [lab, reference_first, root_all]+decays:
        C = frame.matrix
        # Float64, well-conditioned massive rest frames. Fail rather than hide large cancellation.
        checked(frame.key+' Lorentz metric', np.max(np.abs(C.T @ G @ C-G)), 2e-7)
        checked(frame.key+' proper determinant', abs(np.linalg.det(C)-1.), 2e-7)
        checked(frame.key+' orthochronous', max(0., 1.-C[0, 0]), 2e-9)
        for key, p in frame.momenta.items():
            denom = max(float(momenta[key] @ momenta[key]), np.finfo(float).tiny)
            checked(frame.key+' mass shell '+key, abs(invariant(p)-invariant(momenta[key]))/denom, 2e-7)
            checked(frame.key+' inverse '+key,
                    np.max(np.abs((G @ C.T @ G) @ p-momenta[key]))/event_scale, 2e-7)
        if frame.key != lab.key:
            parent_p = frame.momentum(frame.node)
            checked(frame.key+' parent at rest', np.max(np.abs(parent_p[1:]))/parent_p[0], 2e-7)
        if frame.kind == 'vertex':
            pb, pc = [frame.momentum(t) for t in frame.node]
            checked(frame.key+' opposite daughters', np.max(np.abs(pb[1:]+pc[1:]))/(pb[0]+pc[0]), 2e-7)
    return FrameSet(reference, decay, reference_label, decay_label, lab, reference_first,
                    root_all, decays, checks, list(dict.fromkeys(warnings)), degenerate)
