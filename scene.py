"""Unprojected momentum geometry shared by static and future interactive views.

Coordinates are physical spatial momenta in one Frame, never display pixels.
Descendants share the origin; translated copies complete momentum parallelograms.
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from kinematics import Frame, Tree, leaves, tree_name


MAX_PLANE_PARTICLES = 5


@dataclass
class MomentumVector:
    id: str
    node: Tree
    parent: Tree
    spatial: np.ndarray
    depth: int
    role: str
    context: bool = False      # final state outside the vertex of this frame; shown only in the final-states view

    @property
    def opacity(self):
        return max(.08, .60**self.depth)

    @property
    def linestyle(self):
        return 'solid' if self.depth == 0 else ('dashed' if self.depth % 2 else 'dotted')

    def as_dict(self):
        return {'id': self.id, 'particle': tree_name(self.node),
                'parent': tree_name(self.parent), 'spatial': self.spatial.tolist(),
                'start': [0., 0., 0.], 'end': self.spatial.tolist(),
                'depth': self.depth, 'role': self.role,
                'leaf': isinstance(self.node, str), 'context': self.context,
                'layer': 'primary' if self.depth == 0 else 'descendants',
                'opacity': self.opacity, 'linestyle': self.linestyle}


@dataclass
class SumGuide:
    id: str
    start: np.ndarray
    end: np.ndarray
    copied_vector: MomentumVector
    sum_id: str
    start_id: str = ''

    def as_dict(self):
        return {'id': self.id, 'start': self.start.tolist(), 'end': self.end.tolist(),
                'start_vector_id': self.start_id,
                'copied_vector_id': self.copied_vector.id, 'sum_vector_id': self.sum_id,
                'layer': 'sum_guides', 'depth': self.copied_vector.depth,
                'opacity': .62*self.copied_vector.opacity, 'linestyle': 'dotted'}


@dataclass
class MomentumScene:
    vectors: list[MomentumVector]
    guides: list[SumGuide]
    parent_spatial: np.ndarray
    root_pair: tuple[str, str] | None = None   # ids of the two daughters of a root node shown in an overview
    order: tuple = ()                           # final-state identifiers in input order (names and order of the pair planes)

    @property
    def planes(self):
        """Planes through the origin spanned by the momenta of two final states.

        There is one plane for every pair of final states (12, 13, 23, ... in the order of the topology), in every
        frame. A pair of collinear momenta (for example the two decay products in the rest frame of their parent)
        spans no plane; that test is done at display time because it depends on the vectors. At most the first
        ``MAX_PLANE_PARTICLES`` final states are used, so that the number of planes stays readable.
        """
        rank = {key: i for i, key in enumerate(self.order)}
        leaf = sorted((v for v in self.vectors if isinstance(v.node, str)), key=lambda v: rank.get(v.node, len(rank)))[:MAX_PLANE_PARTICLES]
        planes = []
        for i, a in enumerate(leaf):
            for b in leaf[i+1:]:
                name = a.node+b.node if len(a.node) == 1 and len(b.node) == 1 else a.node+' '+b.node
                planes.append({'id': a.id+'/plane/'+b.node, 'node': name, 'pair': [a.node, b.node], 'a_id': a.id, 'b_id': b.id, 'kind': 'pair'})
        return planes

    def _scale(self, vectors):
        # Include every descendant; cancellation can make a resonance smaller.
        largest = max([np.max(np.abs(v.spatial)) for v in vectors]
                      + [np.max(np.abs(self.parent_spatial)), 1e-14])
        return 2.85/largest

    @property
    def scale(self):
        return self._scale([v for v in self.vectors if not v.context])

    @property
    def scale_final(self):
        """Scale of the final-states view, which also shows the final states outside the vertex."""
        return self._scale(self.vectors)

    def as_dict(self):
        return {'coordinates': 'spatial momenta in the displayed physical frame, before projection or plot scaling',
                'vectors': [v.as_dict() for v in self.vectors],
                'sum_guides': [g.as_dict() for g in self.guides],
                'planes': self.planes,
                'parent_spatial': self.parent_spatial.tolist(), 'plot_scale': self.scale, 'plot_scale_final': self.scale_final}


def momentum_scene(frame: Frame, resonances: bool = False, context: bool = False) -> MomentumScene:
    """Recursively expand both daughters of a vertex, within this same frame.

    Overview frames (``kind == 'all'``) contain the final-state momenta only,
    unless ``resonances`` is set: then they use the same hierarchy as every
    decay frame, i.e. the two daughters of the first decay are the primary
    (solid) momenta and all deeper subsystems and final states are descendants.
    In the optional reference image, frame.node is the reference topology.
    With ``context`` the final states outside the vertex of a decay frame are added (flagged ``context``); they are
    meant for the final-states view and for the planes of final-state pairs, which exist in every frame.
    """
    order = tuple(key for key in frame.momenta if key != '0')
    if frame.kind == 'all' and not resonances:
        vectors = [MomentumVector(frame.key+'/momentum/'+key, key, frame.node,
                                  frame.momenta[key][1:].copy(), 0, 'final')
                   for key in leaves(frame.node)]
        return MomentumScene(vectors, [], frame.momenta['0'][1:].copy(), order=order)

    vectors, guides = [], []

    def visit(node, address, parent, depth, role):
        vector = MomentumVector(frame.key+'/momentum/'+address, node, parent,
                                frame.momentum(node)[1:], depth, role)
        vectors.append(vector)
        if not isinstance(node, str):
            children = [visit(child, address+side, node, depth+1, child_role)
                        for child, side, child_role in zip(node, ['L','R'], ['reference','spectator'])]
            for i in [0,1]:
                guides.append(SumGuide(vector.id+'/sum/'+str(i), children[i].spatial.copy(),
                                       vector.spatial.copy(), children[1-i], vector.id, children[i].id))
        return vector

    tops = [visit(node, address, frame.node, 0, role)
            for node, address, role in zip(frame.node, ['L','R'], ['reference','spectator'])]
    if frame.kind == 'all':
        # Overview of the whole event in one frame: the mother is shown as the incoming momentum and the two
        # daughters of the first decay span the plane of the root vertex.
        return MomentumScene(vectors, guides, frame.momenta['0'][1:].copy(), (tops[0].id, tops[1].id), order)
    if context:
        inside = set(leaves(frame.node))
        for key in frame.momenta:
            if key != '0' and key not in inside:
                vectors.append(MomentumVector(frame.key+'/momentum/context/'+key, key, frame.node,
                                              frame.momenta[key][1:].copy(), 0, 'context', context=True))
    return MomentumScene(vectors, guides, frame.momentum(frame.node)[1:], order=order)
