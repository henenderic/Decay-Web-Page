// Small linear algebra for the computation core: real matrices and vectors as arrays of numbers, complex 2×2 matrices for the spinors.
// Everything here is as simple as the calculation needs (the matrices are 2×2, 3×3 or 4×4); there is no dependence on a library.

export const zeros = n => new Array(n).fill(0);
export const eye = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
export const diag = values => values.map((v, i) => values.map((_, j) => (i === j ? v : 0)));
export const copy = matrix => matrix.map(row => row.slice());
export const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));

export function matmul(A, B) {
  const n = A.length, m = B[0].length, k = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { let s = 0; for (let l = 0; l < k; l++) s += A[i][l] * B[l][j]; C[i][j] = s; }
  return C;
}
export function matvec(A, v) {
  return A.map(row => { let s = 0; for (let l = 0; l < v.length; l++) s += row[l] * v[l]; return s; });
}
export const add = (a, b) => a.map((x, i) => x + b[i]);
export const sub = (a, b) => a.map((x, i) => x - b[i]);
export const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
export const norm = v => Math.sqrt(dot(v, v));
export const flat = x => (Array.isArray(x) ? x.flatMap(flat) : [x]);
export const maxAbs = x => Math.max(...flat(x).map(Math.abs));

/** The sum of vectors, starting from zero (as `sum(vectors, zeros)`). */
export const sumVectors = (vectors, n = 4) => vectors.reduce((total, v) => add(total, v), zeros(n));

/** Determinant by Gaussian elimination with partial pivoting (the matrices are 3×3 and 4×4). */
export function det(matrix) {
  const a = copy(matrix), n = a.length;
  let sign = 1, d = 1;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (a[p][c] === 0) return 0;
    if (p !== c) { [a[p], a[c]] = [a[c], a[p]]; sign = -sign; }
    d *= a[c][c];
    for (let r = c + 1; r < n; r++) { const f = a[r][c] / a[c][c]; for (let k = c; k < n; k++) a[r][k] -= f * a[c][k]; }
  }
  return sign * d;
}

// ------------------------------------------------------------------ complex numbers as [re, im] and complex 2×2 matrices
export const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cexp = (re, im) => [Math.exp(re) * Math.cos(im), Math.exp(re) * Math.sin(im)];       // exp(re + i im)
export const cneg = a => [-a[0], -a[1]];
export const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export const ceye = () => [[[1, 0], [0, 0]], [[0, 0], [1, 0]]];
export const cmatmul = (A, B) => A.map((row, i) => B[0].map((_, j) => row.reduce((s, a, k) => cadd(s, cmul(a, B[k][j])), [0, 0])));
export function cinv2(A) {
  const d = cadd(cmul(A[0][0], A[1][1]), cneg(cmul(A[0][1], A[1][0])));
  return [[cdiv(A[1][1], d), cdiv(cneg(A[0][1]), d)], [cdiv(cneg(A[1][0]), d), cdiv(A[0][0], d)]];
}
export const cmaxAbsDiff = (A, B) => Math.max(...A.flatMap((row, i) => row.flatMap((a, j) => [Math.abs(a[0] - B[i][j][0]), Math.abs(a[1] - B[i][j][1])])));
