/*
 * Beam-Frame MAS 1.1.0 checks: support settlements against exact formulas,
 * EI-direct sections, and two textbook problems against independent solutions.
 * Reads the solver straight out of index.html.   Usage:  node tests/beam-frame.js
 */
"use strict";
const fs = require("fs"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const a = html.indexOf("function sectionProps(s) {"), b = html.indexOf("/* ================= Helpers");
if (a < 0 || b < 0) { console.error("Solver not found in index.html"); process.exit(1); }
const { analyzeFrame } = new Function(html.slice(a, b) + "\nreturn { analyzeFrame };")();
let fails = 0; const ck = (lab, got, exp, tol = 1e-9) => { const ok = Math.abs(got - exp) <= tol; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${lab}: ${got.toFixed(4)} (expected ${exp})`); };
const mat = [{ id: 'm', name: 'c', E: 200, nu: 0.3, rho: 0 }], cs = [{ id: 'D', name: 'D', type: 'dead', selfWeight: false }];
// 1. Fixed-fixed beam, settlement Δ at the right end: V = 12EIΔ/L³, M = 6EIΔ/L² (exact)
{ const EI = 2e4, L = 6, D = 0.01, m = { nodes: [{ id: 1, x: 0, y: 0, support: 'fixed' }, { id: 2, x: L, y: 0, support: 'fixed' }], members: [{ id: 1, i: 1, j: 2, section: 's' }], materials: mat,
    sections: [{ id: 's', name: 'EI', type: 'ei', EI, rigid: true }], cases: cs, loads: [{ id: 1, case: 'D', on: 'settle', node: 2, dx: 0, dy: -D, rz: 0 }] };
  const r = analyzeFrame(m); const R1 = r.caseRes.D.R.get(1), R2 = r.caseRes.D.R.get(2);
  ck('settlement: shear 12EIΔ/L³ (kN)', R1[1], 12 * EI * D / L ** 3, 1e-9); ck('settlement: end moment 6EIΔ/L² (kN·m)', R1[2], 6 * EI * D / L ** 2, 1e-9); ck('settlement: joint 2 moves exactly Δ (m)', r.caseRes.D.d[3 * 1 + 1], -D, 1e-15); ck('settlement: equilibrium ΣFy', R1[1] + R2[1], 0, 1e-9); }
// 2. Problem 1 (expected values from an independent stiffness solution in Python): fixed a, 2EI over ab (5 m), EI over bc (5 m), w = 10 kN/m on ab, Δc = wL/48EI downward
{ const EI = 1e5, L = 5, w = 10, m = { nodes: [{ id: 1, x: 0, y: 0, support: 'fixed' }, { id: 2, x: L, y: 0, support: 'free' }, { id: 3, x: 2 * L, y: 0, support: 'fixed' }],
    members: [{ id: 1, i: 1, j: 2, section: 's2' }, { id: 2, i: 2, j: 3, section: 's1' }], materials: mat, cases: cs,
    sections: [{ id: 's2', name: '2EI', type: 'ei', EI: 2 * EI, rigid: true }, { id: 's1', name: 'EI', type: 'ei', EI, rigid: true }],
    loads: [{ id: 1, case: 'D', on: 'member', member: 1, type: 'dist', dir: 'gravity', full: true, w1: w, w2: w }, { id: 2, case: 'D', on: 'settle', node: 3, dx: 0, dy: -w * L / (48 * EI), rz: 0 }] };
  const r = analyzeFrame(m), Ra = r.caseRes.D.R.get(1), Rc = r.caseRes.D.R.get(3);
  ck('problem 1: Ra (kN)', Ra[1], 41.684848, 1e-6); ck('problem 1: Ma (kN·m)', Ra[2], 62.606061, 1e-6); ck('problem 1: Rc (kN)', Rc[1], 8.315152, 1e-6); ck('problem 1: Mc (kN·m)', -Rc[2], 20.757576, 1e-6); }
// 3. Problem 2 (expected values from the force method by hand: Dy = 8640/2304 = 3.75 k): A fixed (0, 3 ft), B (0, 15), C (12, 15), D (12, 0) roller; 10 k at B; EI constant, axially rigid (kip, ft converted to kN, m)
{ const ft = 0.3048, k = 4.4482216152605, EI = 5e4, m = { nodes: [{ id: 1, x: 0, y: 3 * ft, support: 'fixed' }, { id: 2, x: 0, y: 15 * ft, support: 'free' }, { id: 3, x: 12 * ft, y: 15 * ft, support: 'free' }, { id: 4, x: 12 * ft, y: 0, support: 'rollerX' }],
    members: [{ id: 1, i: 1, j: 2, section: 's' }, { id: 2, i: 2, j: 3, section: 's' }, { id: 3, i: 3, j: 4, section: 's' }], materials: mat, cases: cs,
    sections: [{ id: 's', name: 'EI', type: 'ei', EI, rigid: true }], loads: [{ id: 1, case: 'D', on: 'node', node: 2, Fx: 10 * k, Fy: 0, Mz: 0 }] };
  const r = analyzeFrame(m), RA = r.caseRes.D.R.get(1), RD = r.caseRes.D.R.get(4), kft = k * ft;
  ck('problem 2: Dy (kip)', RD[1] / k, 3.75, 1e-6); ck('problem 2: Ax (kip)', RA[0] / k, -10, 1e-6); ck('problem 2: Ay (kip)', RA[1] / k, -3.75, 1e-6); ck('problem 2: MA (kip·ft)', RA[2] / kft, 75, 1e-5);
  const MB = r.caseRes.D.mem[1].M[0] / kft; ck('problem 2: moment at B in BC (kip·ft, magnitude)', Math.abs(MB), 45, 1e-5); ck('problem 2: moment at C (kip·ft)', r.caseRes.D.mem[1].M[r.caseRes.D.mem[1].M.length - 1] / kft, 0, 1e-5); }
// 4. Concentrated moments on members (new in 1.1.0)
{
const base = (nodes, members, loads) => ({ nodes, members, loads, materials: [{ id: 'm', name: 'c', E: 200, nu: 0.3, rho: 0 }], sections: [{ id: 's', name: 'EI', type: 'ei', EI: 1e5, rigid: true }], cases: [{ id: 'D', name: 'D', type: 'dead', selfWeight: false }] });
const M0 = 30, L = 6, a = 2, b = L - a;
// 1. simply supported, couple M0 (anticlockwise) at a: Ra = +M0/L, Rb = −M0/L, M jumps by −M0
{ const r = analyzeFrame(base([{ id: 1, x: 0, y: 0, support: 'pin' }, { id: 2, x: L, y: 0, support: 'rollerX' }], [{ id: 1, i: 1, j: 2, section: 's' }], [{ id: 1, case: 'D', on: 'member', member: 1, type: 'moment', M: M0, a }]));
  const c = r.caseRes.D, m = r.mem[0], k = m.xs.findIndex(x => Math.abs(x - a) < 1e-12);
  ck('simple beam: left reaction M0/L', c.R.get(1)[1], M0 / L); ck('simple beam: right reaction −M0/L', c.R.get(2)[1], -M0 / L);
  ck('simple beam: M just before a = (M0/L)·a', c.mem[0].M[k], M0 / L * a); ck('simple beam: M just after a = (M0/L)·a − M0', c.mem[0].M[k + 1], M0 / L * a - M0);
  ck('simple beam: equilibrium moment residual', c.eq.M, 0); }
// 2. fixed-fixed: member couple vs the same beam split at a with a joint moment (independent code path)
{ const one = analyzeFrame(base([{ id: 1, x: 0, y: 0, support: 'fixed' }, { id: 2, x: L, y: 0, support: 'fixed' }], [{ id: 1, i: 1, j: 2, section: 's' }], [{ id: 1, case: 'D', on: 'member', member: 1, type: 'moment', M: M0, a }])).caseRes.D;
  const two = analyzeFrame(base([{ id: 1, x: 0, y: 0, support: 'fixed' }, { id: 3, x: a, y: 0, support: 'free' }, { id: 2, x: L, y: 0, support: 'fixed' }], [{ id: 1, i: 1, j: 3, section: 's' }, { id: 2, i: 3, j: 2, section: 's' }], [{ id: 1, case: 'D', on: 'node', node: 3, Fx: 0, Fy: 0, Mz: M0 }])).caseRes.D;
  [0, 1, 2].forEach(i => { ck(`fixed beam: left reaction component ${['Rx', 'Ry', 'M'][i]} (member couple = split beam + joint moment)`, one.R.get(1)[i], two.R.get(1)[i]); ck(`fixed beam: right reaction component ${['Rx', 'Ry', 'M'][i]}`, one.R.get(2)[i], two.R.get(2)[i]); });
  // 3. textbook fixed-end moments for a couple: M_A = M0·b(2a − b)/L², M_B = M0·a(2b − a)/L² (magnitudes), V = 6·M0·a·b/L³
  ck('fixed beam: |M at A| = M0·b(2a − b)/L²', Math.abs(one.R.get(1)[2]), Math.abs(M0 * b * (2 * a - b) / L ** 2)); ck('fixed beam: |M at B| = M0·a(2b − a)/L²', Math.abs(one.R.get(2)[2]), Math.abs(M0 * a * (2 * b - a) / L ** 2)); ck('fixed beam: |shear| = 6·M0·a·b/L³', Math.abs(one.R.get(1)[1]), 6 * M0 * a * b / L ** 3); }
}
// 5. E and I typed separately: E (GPa) × I (10⁶ mm⁴) = EI (kN·m²); 2EI/EI problem 1 must give the same reactions
{ const L5 = 5, w = 10, m = { nodes: [{ id: 1, x: 0, y: 0, support: 'fixed' }, { id: 2, x: L5, y: 0, support: 'free' }, { id: 3, x: 2 * L5, y: 0, support: 'fixed' }],
    members: [{ id: 1, i: 1, j: 2, section: 's2' }, { id: 2, i: 2, j: 3, section: 's1' }], materials: [{ id: 'm', name: 'c', E: 200, nu: 0.3, rho: 0 }], cases: [{ id: 'D', name: 'D', type: 'dead', selfWeight: false }],
    sections: [{ id: 's2', name: '2EI', type: 'ei', eE: 200, eI: 1000, rigid: true }, { id: 's1', name: 'EI', type: 'ei', eE: 200, eI: 500, rigid: true }],
    loads: [{ id: 1, case: 'D', on: 'member', member: 1, type: 'dist', dir: 'gravity', full: true, w1: w, w2: w }, { id: 2, case: 'D', on: 'settle', node: 3, dx: 0, dy: -w * L5 / (48 * 1e5), rz: 0 }] };
  const r = analyzeFrame(m), Ra = r.caseRes.D.R.get(1), Rc = r.caseRes.D.R.get(3);
  ck('E and I typed separately: problem 1 Ra (kN)', Ra[1], 41.684848, 1e-6); ck('E and I typed separately: problem 1 Ma (kN·m)', Ra[2], 62.606061, 1e-6); ck('E and I typed separately: problem 1 Rc (kN)', Rc[1], 8.315152, 1e-6); }
console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
process.exit(fails ? 1 : 0);
