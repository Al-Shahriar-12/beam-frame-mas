# Checks

Both scripts read the solver straight out of `../index.html`. With Node.js 18 or newer, run them from the repository folder:

```bash
node tests/verify.js
node tests/beam-frame.js
```

- `verify.js`: 27 checks against hand calculations.
- `beam-frame.js`: 31 checks: support settlements against 12EIΔ/L³ and 6EIΔ/L², concentrated moments against exact statics, a split-beam model and the textbook fixed-end moments, E and I typed separately, and the two worked problems against an independent stiffness solution and the force method.

Each prints PASS or FAIL per check and ends with ALL PASSED.
