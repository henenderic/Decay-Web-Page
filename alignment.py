"""Helicity alignment between two topologies and Greenwich geometry. NumPy only.

Rules: the amplitude construction for chains of ordered binary decays (W from complete paths, z-y-z angles,
spin-lift sign, Greenwich choice of the root axes).

A *path* of a final-state particle is the product of all transport operations that lead from the
laboratory frame to the terminal rest-spin frame ``i|K`` of that particle. Every path starts with the
root transport, which depends on the reference topology only, so the root part is common to all
topologies. With the matrices T_i^K and T_i^I that map laboratory coordinates into the terminal
frames of the topologies K and I,

    W_i^{K->I} = T_i^I (T_i^K)^{-1}      (inverse reference path times source path, terminal-to-root form),

which fixes the rest momentum k_i = (m_i, 0, 0, 0) and is a rotation for a massive particle.

Every path is also available as a chain of steps (``TerminalPath.edges``), one per decay vertex on the way from the common root frame to the
particle: L_{parent<-daughter} = R_z(phi) R_y(theta) [R_y(pi)] B_z(eta), where (phi, theta) are the angles of the first (reference) daughter of
the parent in the parent frame, R_y(pi) occurs for the second daughter only, and eta is the rapidity of the transported daughter in the parent
frame. The transport from the laboratory to the root frame is common to both topologies and not part of the chains. W is built from the chains,

    W_i^{K->I} = [L^I_1 L^I_2 ...]^{-1} [L^K_1 L^K_2 ...],

and compared with the construction from the transport matrices.
"""
from __future__ import annotations

from dataclasses import dataclass
import math

import numpy as np

from kinematics import (G, InputError, Operation, boost_z, compute_frames, invariant, leaves, mass, rotation_y, rotation_z,
                        tree_name)

POLE = 1e-9                  # |sin(beta)| below this value is treated as an Euler pole
TOLERANCE = 2e-7             # residuals of the numerical checks, as for the frames


# ------------------------------------------------------------------ spinor representation
def spinor(axis: str, value: float) -> np.ndarray:
    """Two-component representation S of Rz, Ry, Bz with the conventions of the rule file."""
    if axis == 'Rz':
        return np.diag([np.exp(-0.5j*value), np.exp(0.5j*value)])
    if axis == 'Ry':
        c, s = math.cos(value/2), math.sin(value/2)
        return np.array([[c, -s], [s, c]], dtype=complex)
    if axis == 'Bz':
        return np.diag([math.exp(value/2), math.exp(-value/2)]).astype(complex)
    raise InputError(f'Unknown operator {axis}.')


def lorentz(axis: str, value: float) -> np.ndarray:
    return {'Rz': rotation_z, 'Ry': rotation_y, 'Bz': boost_z}[axis](value)


def product(operations) -> tuple[np.ndarray, np.ndarray]:
    """Four-by-four matrix and spinor matrix of operations that are applied in the given order."""
    matrix, spin = np.eye(4), np.eye(2, dtype=complex)
    for op in operations:
        matrix = lorentz(op.axis, op.value) @ matrix
        spin = spinor(op.axis, op.value) @ spin
    return matrix, spin


# ------------------------------------------------------------------ terminal paths
@dataclass
class TerminalPath:
    particle: str
    frame_label: str          # vertex frame in which the helicity of the particle is defined (production vertex)
    side: int                 # 0: reference daughter, 1: spectator
    mass: float | None
    operations: list[Operation]
    matrix: np.ndarray | None
    spin: np.ndarray | None
    edges: list[dict] | None = None   # steps of the chain from the common root frame to the particle, root-nearest first


def chain_edge(parent: str, child: str, reference_daughter: str, role: str, phi: float, theta: float, eta: float) -> dict:
    """One step L_{parent<-daughter} = R_z(phi) R_y(theta) [R_y(pi)] B_z(eta); the half-turn occurs for the second (spectator) daughter."""
    return {'parent': parent, 'child': child, 'reference_daughter': reference_daughter, 'role': role,
            'phi': float(phi)+0.0, 'theta': float(theta)+0.0, 'half_turn': role == 'spectator', 'eta': float(eta)+0.0}


def edge_matrix(edge: dict) -> np.ndarray:
    """The Lorentz matrix of a step; it maps coordinates of the daughter frame into coordinates of the parent frame."""
    matrix = lorentz('Rz', edge['phi']) @ lorentz('Ry', edge['theta'])
    if edge['half_turn']:
        matrix = matrix @ lorentz('Ry', math.pi)
    return matrix @ lorentz('Bz', edge['eta'])


def chain_matrix(edges: list[dict]) -> np.ndarray:
    """Product of the steps of a chain, the root-nearest step leftmost (it acts last)."""
    result = np.eye(4)
    for edge in edges:
        result = result @ edge_matrix(edge)
    return result


def terminal_paths(frames) -> dict[str, TerminalPath]:
    """Complete path (laboratory -> terminal rest-spin frame) of every final-state particle of a FrameSet."""
    result = {}
    by_label = {f.label: f for f in frames.decays}
    for frame in frames.decays:
        for side, child in enumerate(frame.node):
            if not isinstance(child, str):
                continue
            p = frame.momentum(child)
            m_square = invariant(p)
            base = [op for step in frame.path for op in step.operations]
            if m_square <= 1e-12*float(p @ p):
                result[child] = TerminalPath(child, frame.label, side, None, base, None, None)
                continue
            m = math.sqrt(m_square)
            phi, theta = frame.angles
            eta = math.asinh(float(np.linalg.norm(p[1:]))/m)
            operations = base+[Operation('Rz', -phi, 'Undo parent reference azimuth'), Operation('Ry', -theta, 'Undo parent reference polar angle')]
            if side == 1:
                operations.append(Operation('Ry', -math.pi, 'Undo spectator half-turn'))
            operations.append(Operation('Bz', -eta, f'Bring {child} to rest'))
            matrix, spin = product(operations)
            # the chain: the decay steps of the path to the frame (the root transport is common), then the step to the particle itself
            edges = [chain_edge(step.source, step.target, tree_name(by_label[step.source].node[0]), step.role,
                                -step.operations[0].value, -step.operations[1].value, -step.operations[-1].value)
                     for step in frame.path if step.role != 'root']
            edges.append(chain_edge(frame.label, f'{child}|{frame.topology_label}', tree_name(frame.node[0]), 'spectator' if side == 1 else 'reference', phi, theta, eta))
            result[child] = TerminalPath(child, frame.label, side, m, operations, matrix, spin, edges)
    return result


# ------------------------------------------------------------------ Euler angles
def principal(angle: float) -> float:
    """Angle in (-pi, pi]; a value within rounding of -pi is reported as +pi (the principal representative)."""
    return math.pi if angle <= -math.pi+1e-9 else angle+0.0


def euler_zyz(R: np.ndarray) -> tuple[float, float, float]:
    """R = Rz(alpha) Ry(beta) Rz(gamma); formulas and pole cases of the z-y-z decomposition.

    The spatial matrix does not fix the spin lift; the sign epsilon is determined afterwards from the spinor products.
    """
    s = math.hypot(R[0, 2], R[1, 2])
    beta = math.atan2(s, R[2, 2])
    if s > POLE:
        alpha, gamma = math.atan2(R[1, 2], R[0, 2]), math.atan2(R[2, 1], -R[2, 0])
    elif R[2, 2] > 0:
        alpha, beta, gamma = math.atan2(R[1, 0], R[0, 0]), 0.0, 0.0
    else:
        alpha, beta, gamma = math.atan2(-R[1, 0], -R[0, 0]), math.pi, 0.0
    return principal(alpha), beta, principal(gamma)


def rotation_from_euler(alpha, beta, gamma) -> np.ndarray:
    return (rotation_z(alpha) @ rotation_y(beta) @ rotation_z(gamma))[1:, 1:]


# ------------------------------------------------------------------ alignment
def compute_alignment(frames, degenerate='error') -> dict | None:
    """W_i^{K->I} for all final-state particles, or None if the decay topology is the reference topology."""
    if frames.reference == frames.decay:
        return None
    momenta = {k: v for k, v in frames.lab.momenta.items() if k != '0'}
    reference = compute_frames(frames.lab.momenta['0'], momenta, frames.reference, frames.reference,
                               reference_label=frames.reference_label, decay_label=frames.reference_label, degenerate=degenerate)
    if np.max(np.abs(reference.decays[0].matrix-frames.decays[0].matrix)) > 1e-12:
        raise InputError('The root axes of the two topologies differ; they must be common.')
    source, target = terminal_paths(frames), terminal_paths(reference)
    checks, particles = [], []

    def checked(name, value, tolerance=TOLERANCE):
        value = float(value)
        if not math.isfinite(value) or value > tolerance:
            raise InputError(f'Numerical check failed: {name}, residual {value:.4g} > {tolerance:.4g}')
        checks.append({'name': name, 'residual': value, 'tolerance': tolerance, 'passed': True})

    for name in leaves(frames.decay):
        s, t = source[name], target[name]
        entry = {'particle': name, 'source_frame': s.frame_label, 'target_frame': t.frame_label,
                 'source_terminal': f'{name}|{frames.decay_label}', 'target_terminal': f'{name}|{frames.reference_label}'}
        if s.matrix is None:
            entry.update(available=False, reason=f'{name} is massless or has no resolved mass: no rest frame, no rotation W.')
            particles.append(entry)
            continue
        W_transports = t.matrix @ (G @ s.matrix.T @ G)           # inverse of a Lorentz matrix
        W = (G @ chain_matrix(t.edges).T @ G) @ chain_matrix(s.edges)       # [reference chain]^{-1} [source chain], built from the steps
        checked(f'W {name}: chains agree with the transport matrices', np.max(np.abs(W-W_transports)))
        k = np.array([s.mass, 0, 0, 0])
        rest = np.max(np.abs(W @ k-k))/s.mass
        R = W[1:, 1:]
        checked(f'W {name}: rest momentum fixed', rest)
        checked(f'W {name}: time block', max(abs(W[0, 0]-1), np.max(np.abs(W[0, 1:])), np.max(np.abs(W[1:, 0]))))
        checked(f'W {name}: orthogonality', np.max(np.abs(R.T @ R-np.eye(3))))
        checked(f'W {name}: determinant', abs(np.linalg.det(R)-1))
        alpha, beta, gamma = euler_zyz(R)
        rebuilt = rotation_from_euler(alpha, beta, gamma)
        checked(f'W {name}: Euler reconstruction', np.max(np.abs(rebuilt-R)))
        S = t.spin @ np.linalg.inv(s.spin)
        euler_spin = spinor('Rz', alpha) @ spinor('Ry', beta) @ spinor('Rz', gamma)
        ratio = S @ np.linalg.inv(euler_spin)
        epsilon = 1 if ratio[0, 0].real >= 0 else -1
        checked(f'W {name}: spin-lift sign', np.max(np.abs(ratio-epsilon*np.eye(2))))
        angles = [('Rz', gamma), ('Ry', beta), ('Rz', alpha)]         # application order of R = Rz(alpha) Ry(beta) Rz(gamma)
        # momenta of the other final states in the two terminal frames; W carries the first into the second
        shown = []
        for other in leaves(frames.decay):
            if other == name:
                continue
            p_source, p_target = (s.matrix @ frames.lab.momenta[other])[1:], (t.matrix @ frames.lab.momenta[other])[1:]
            scale = max(1.0, float(np.max(np.abs(p_source))), float(np.max(np.abs(p_target))))
            checked(f'W {name}: momentum {other} in the target frame', np.max(np.abs(R @ p_source-p_target))/scale)
            shown.append({'particle': other, 'source': p_source.tolist(), 'target': p_target.tolist()})
        entry.update(available=True, mass=s.mass, matrix=R.tolist(), epsilon=epsilon,
                     angles={'alpha': alpha, 'beta': beta, 'gamma': gamma},
                     pole=s.matrix is not None and math.hypot(R[0, 2], R[1, 2]) <= POLE,
                     identity=bool(np.max(np.abs(R-np.eye(3))) < 1e-9 and epsilon == 1),
                     residuals={'rest': rest, 'orthogonality': float(np.max(np.abs(R.T @ R-np.eye(3))))},
                     operations=[{'operator': axis, 'parameter': value} for axis, value in angles],
                     momenta=shown, source_edges=s.edges, reference_edges=t.edges, lorentz=W.tolist(),
                     axis_angle=beta)
        particles.append(entry)
    return {'reference': tree_name(frames.reference), 'decay': tree_name(frames.decay), 'particles': particles, 'checks': checks}


# ------------------------------------------------------------------ Greenwich geometry
def greenwich(frames, describe=None) -> dict:
    """Data for the top view of the Greenwich choice in the rest frame of the mother.

    The preliminary axes are those after Rz(-phi0), Ry(-theta0), Bz(-eta0); the final root axes follow after Rz(-chi).
    chi is the azimuth of the first daughter of the REFERENCE topology in the preliminary axes.
    ``describe(tree) -> (label, color)`` supplies display data.
    """
    ops = frames.decays[0].path[0].operations
    pre_matrix, _ = product([ops[0], ops[1], ops[3]])          # rotations and boost before the Greenwich rotation; the order in the list is Rz, Ry, Rz(chi), Bz
    chi = -ops[2].value+0.0
    lab = frames.lab.momenta

    def node_momentum(tree, matrix):
        return matrix @ sum((lab[k] for k in leaves(tree)), np.zeros(4))

    final_matrix = frames.decays[0].matrix
    first_ref, first_decay = frames.reference[0], frames.decay[0]
    mother = frames.lab.momenta['0']
    items = []

    def add(tree, role):
        pre, fin = node_momentum(tree, pre_matrix), node_momentum(tree, final_matrix)
        label, color = describe(tree) if describe else (tree_name(tree), '#394953')
        items.append({'node': tree_name(tree), 'label': label, 'color': color, 'role': role, 'leaf': isinstance(tree, str),
                      'preliminary': pre[1:3].tolist(), 'final': fin[1:3].tolist(), 'pz': float(fin[3]),
                      'transverse': float(math.hypot(fin[1], fin[2])), 'energy': float(fin[0])})
    add(first_ref, 'reference')
    if first_decay != first_ref:
        add(first_decay, 'decay')
    for leaf in leaves(frames.decay):
        if leaf not in (tree_name(first_ref), tree_name(first_decay)):
            add(leaf, 'final')
    ref_item = items[0]
    defined = ref_item['transverse'] > 1e-11*max(ref_item['energy'], 1e-300)
    q0 = float(np.linalg.norm(mother[1:]))
    return {'chi': chi, 'defined': bool(defined), 'reference_topology': tree_name(frames.reference),
            'reference_label': frames.reference_label, 'decay_label': frames.decay_label,
            'same_topology': frames.reference == frames.decay,
            'reference_first': tree_name(first_ref), 'decay_first': tree_name(first_decay),
            'mother_flight': {'momentum': q0, 'phi': math.atan2(mother[2], mother[1]) if q0 > 0 else 0.0,
                              'theta': math.atan2(math.hypot(mother[1], mother[2]), mother[3])},
            'vectors': items}
