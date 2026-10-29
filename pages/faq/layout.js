// The layout of the FAQ map: the position of every card in the images map-00.svg ... map-NN.svg and its connections.
// Written by llm/faq_map/build_faq_map.py from FAQ_Outline.md; do not edit by hand.
export const FAQ_SIZE = { width: 1200, height: 1420 };
export const FAQ_CARDS = [
  { n: 1, title: 'What Does a Cascade Decay Amplitude Look Like?', x: 80, y: 70, w: 140, h: 80, needs: [], neededBy: [], see: [7, 17, 19, 24, 27, 29, 30, 32] },
  { n: 2, title: 'How Does a Collision Become a Decay Event?', x: 260, y: 70, w: 140, h: 80, needs: [], neededBy: [], see: [3, 11, 13, 24, 30, 31] },
  { n: 3, title: 'How to Read a Feynman-Sketch?', x: 440, y: 70, w: 140, h: 80, needs: [], neededBy: [16], see: [2, 14, 17, 18, 20, 28, 30] },
  { n: 4, title: 'What Does On-Shell Mean?', x: 80, y: 240, w: 140, h: 80, needs: [], neededBy: [6, 8, 9], see: [24, 25] },
  { n: 5, title: 'How to Rotate Vectors and Coordinate Systems?', x: 260, y: 240, w: 140, h: 80, needs: [], neededBy: [6, 7], see: [18, 20, 21, 22, 27, 29, 32] },
  { n: 6, title: 'How Is a Particle Rest-Frame Defined?', x: 440, y: 240, w: 140, h: 80, needs: [4, 5], neededBy: [7, 17, 18, 22, 27, 29], see: [9, 20] },
  { n: 7, title: 'What Are Spin and Helicity States, How Do Rotations Act on Them?', x: 80, y: 410, w: 140, h: 80, needs: [5, 6], neededBy: [8, 18, 19, 21, 22, 27, 29], see: [1, 20, 31, 32] },
  { n: 8, title: 'How Are One-Particle States Normalised?', x: 260, y: 410, w: 140, h: 80, needs: [4, 7], neededBy: [9, 12, 15], see: [16] },
  { n: 9, title: 'How to Describe Two-Particle Systems?', x: 440, y: 410, w: 140, h: 80, needs: [4, 8], neededBy: [10, 16, 18, 20], see: [6, 24] },
  { n: 10, title: 'What Is the Two-Particle Phase-Space Density?', x: 620, y: 410, w: 140, h: 80, needs: [9], neededBy: [11, 18, 23], see: [] },
  { n: 11, title: 'How to Build the Phase-Space for More Particles?', x: 800, y: 410, w: 140, h: 80, needs: [10], neededBy: [17, 31], see: [2] },
  { n: 12, title: 'How to Relate Free and Interacting Particle States?', x: 80, y: 580, w: 140, h: 80, needs: [8], neededBy: [13], see: [14, 23] },
  { n: 13, title: 'What Are S- and T-Matrix?', x: 260, y: 580, w: 140, h: 80, needs: [12], neededBy: [14, 15, 23], see: [2, 25] },
  { n: 14, title: 'How to Write the Lippmann–Schwinger Equation as a Matrix Equation?', x: 440, y: 580, w: 140, h: 80, needs: [13], neededBy: [16, 25], see: [3, 12, 17, 24] },
  { n: 15, title: 'How Is the Matrix Element Defined?', x: 620, y: 580, w: 140, h: 80, needs: [8, 13], neededBy: [18, 20, 25], see: [32] },
  { n: 16, title: 'How Does LSE Lead to a Sum of Decay Chains?', x: 800, y: 580, w: 140, h: 80, needs: [3, 9, 14], neededBy: [17, 18, 28, 30], see: [8, 24, 33] },
  { n: 17, title: 'What Are Decay Topology and Decay Chain?', x: 980, y: 580, w: 140, h: 80, needs: [6, 11, 16], neededBy: [27, 30], see: [1, 3, 14, 18, 20, 24] },
  { n: 18, title: 'How to Build a Two-Particle Decay Amplitude?', x: 80, y: 750, w: 140, h: 80, needs: [6, 7, 9, 10, 15, 16], neededBy: [19, 20, 27], see: [3, 5, 17, 28] },
  { n: 19, title: 'What Are Partial Waves and Helicity Couplings?', x: 260, y: 750, w: 140, h: 80, needs: [7, 18], neededBy: [28], see: [1, 23, 32] },
  { n: 20, title: 'How Does the Production of the Mother Enter?', x: 440, y: 750, w: 140, h: 80, needs: [9, 15, 18], neededBy: [21], see: [3, 5, 6, 7, 17] },
  { n: 21, title: 'What Is the Spin-Density Matrix?', x: 620, y: 750, w: 140, h: 80, needs: [7, 20], neededBy: [22, 31], see: [5, 32] },
  { n: 22, title: 'Why Must the Orientation of the Rest-Frame Be Prescribed?', x: 800, y: 750, w: 140, h: 80, needs: [6, 7, 21], neededBy: [27], see: [5, 32] },
  { n: 23, title: 'How Does the Radial-Wave Function Determine the Partial-Wave S-Matrix?', x: 80, y: 920, w: 140, h: 80, needs: [10, 13], neededBy: [24, 25], see: [12, 19, 28] },
  { n: 24, title: 'How Does the Decay S-Matrix Lead to the Breit–Wigner Form?', x: 260, y: 920, w: 140, h: 80, needs: [23], neededBy: [26, 28, 30], see: [1, 2, 4, 9, 14, 16, 17, 32, 33] },
  { n: 25, title: 'How Does Field Theory Give the Resonance Propagator?', x: 440, y: 920, w: 140, h: 80, needs: [14, 15, 23], neededBy: [26], see: [4, 13] },
  { n: 26, title: 'Which Alternatives to the Breit–Wigner Form Exist?', x: 620, y: 920, w: 140, h: 80, needs: [24, 25], neededBy: [], see: [30, 32, 33] },
  { n: 27, title: 'Which Angles Belong to Which Decay of a Chain?', x: 80, y: 1090, w: 140, h: 80, needs: [6, 7, 17, 18, 22], neededBy: [28, 29], see: [1, 5] },
  { n: 28, title: 'How Is the Amplitude of One Chain Built?', x: 260, y: 1090, w: 140, h: 80, needs: [16, 19, 24, 27], neededBy: [30], see: [3, 18, 23, 29] },
  { n: 29, title: 'Why Can Different Chains Not Simply Be Added?', x: 440, y: 1090, w: 140, h: 80, needs: [6, 7, 27], neededBy: [30], see: [1, 5, 28, 32, 33] },
  { n: 30, title: 'How Do All Parts Form the Full Amplitude?', x: 80, y: 1260, w: 140, h: 80, needs: [16, 17, 24, 28, 29], neededBy: [31, 32, 33], see: [1, 2, 3, 26] },
  { n: 31, title: 'How Does the Amplitude Become an Intensity and a Fit?', x: 260, y: 1260, w: 140, h: 80, needs: [11, 21, 30], neededBy: [], see: [2, 7, 32, 33] },
  { n: 32, title: 'What Must Be Specified for Two Programs to Give the Same Amplitude?', x: 440, y: 1260, w: 140, h: 80, needs: [30], neededBy: [], see: [1, 5, 7, 15, 19, 21, 22, 24, 26, 29, 31] },
  { n: 33, title: 'What Does This Model Not Cover?', x: 620, y: 1260, w: 140, h: 80, needs: [30], neededBy: [], see: [16, 24, 26, 29, 31] },
];
// The reading paths of the outline: the cards that are relevant for a purpose, in the order of their numbers.
export const FAQ_PATHS = [
  { key: 'apply', label: 'Apply', cards: [1, 2, 3, 17, 24, 28, 30, 31, 32] },
  { key: 'derive', label: 'Derive', cards: [4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26] },
  { key: 'implement', label: 'Implement', cards: [5, 6, 7, 19, 22, 23, 24, 27, 29, 32, 33] },
];
