<p align="center"><img src="icon-192.png" width="96" alt="Beam-Frame MAS"></p>

<h1 align="center">Beam-Frame MAS</h1>

<p align="center"><b>Free beam and plane-frame analysis for engineering students. Version 1.1.0.</b><br>
Build beams span by span or draw frames on an ETABS-style grid, give each member its own EI, add support settlements, and get exact shear force, bending moment, axial force and deflection diagrams, saved as a PDF if you want.</p>

<p align="center">
  <a href="https://al-shahriar-12.github.io/beam-frame-mas/"><b>Open Beam-Frame MAS</b></a> ·
  <a href="#how-to-use">How to use</a> ·
  <a href="#worked-problems">Worked problems</a> ·
  <a href="#how-accurate-is-it">Accuracy</a> ·
  <a href="#author">Author</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-1B2559" alt="Version 1.1.0">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/works-offline-orange" alt="Works offline">
</p>

<p align="center">
  <img src="screenshots/screenshot-1-beam-bmd.png" width="220" alt="Bending moment on a fixed beam with 2EI and EI spans">
  <img src="screenshots/screenshot-2-whole-beam.png" width="220" alt="Whole-beam shear force and bending moment diagrams">
  <img src="screenshots/screenshot-3-loads.png" width="220" alt="The Loads editor with a UDL, a settlement and a moment">
  <img src="screenshots/screenshot-4-portal.png" width="220" alt="Bending moment on a portal with unequal columns">
</p>

## What's new in 1.1.0

Beam-Frame MAS brings [Flexure MAS](https://al-shahriar-12.github.io/flexure-mas/) and [Frame MAS](https://al-shahriar-12.github.io/frame-mas/) together, and adds what textbook problems need:

- **Beam builder:** type the span lengths, pick a support at each point (fixed, pinned, roller, guided, none, or an internal hinge), and give each span its own E and I. A label shows each span as a multiple of the smallest EI, such as 2EI.
- **Loads editor, as in Flexure MAS:** in **Model → Loads**, add point loads, UDL and UVL, concentrated moments anywhere along a member, and joint loads; choose the span, the position and the value.
- **Each member's own stiffness:** different sections per member, or **E and I typed directly** (EI = E × I is shown), with an *axially rigid* option to neglect axial shortening as most textbooks do. Stiffer members are drawn wider, so a 2EI span looks thicker than an EI span.
- **Support settlements:** a prescribed movement (Δx, Δy or rotation) at any restrained support, in any load case.
- **Whole-beam diagrams:** one continuous shear force, bending moment and deflection chart along the full beam, with exact peaks and where they occur.
- **Save as PDF:** the moment, shear and axial force diagrams, deflected shape and loads, whole-beam or member charts, and reaction and member-force tables, on A4 pages with selectable text.

Everything from Frame MAS stays: drawing on a grid, rigid and hinged joints, trusses, load cases and combinations (BNBC 2020 and ASCE 7-16), envelopes, exact diagram values, 3D, five unit systems, light and dark appearance, and `.frmas` project files, so Frame MAS projects open as they are.

## How to use

1. Open **https://al-shahriar-12.github.io/beam-frame-mas/** on a phone or computer. It opens with a worked example.
2. For a beam, go to **Model → Grid → Build a beam**. For a frame, draw members in **Frame** or use **Build a regular frame**.
3. Add loads in **Model → Loads**: point load, UDL / UVL, moment or joint load. You can also tap a member or joint on the drawing; a joint’s settings hold its coordinates, support and settlement.
4. For "2EI / EI" problems, choose the section shape **E and I directly** in **Model → Sections**, or set E and I for each span in the beam builder.
5. Read the diagrams in **Frame**, the exact values in **Diagram values**, and tap **Save as PDF** to keep them.

**Install it as an app:** on Android, open the site in Chrome and choose **Install app**. On iPhone, use Safari → Share → **Add to Home Screen**.

## Worked problems

Both are built in as examples and saved in [`examples/`](examples).

| Problem | Beam-Frame MAS | Independent check |
| --- | --- | --- |
| Fixed beam a–b–c, 2EI over ab and EI over bc (5 m each), 10 kN/m on ab, settlement at c of wL/48EI | Ra = 41.68 kN, Ma = 62.61 kN·m, Rc = 8.32 kN, Mc = 20.76 kN·m | Stiffness method in Python: the same to 6 decimals |
| Portal: A fixed, D on a roller 3 ft lower, columns 12 ft and 15 ft, beam 12 ft, 10 k at B | Ax = 10 k, Ay = 3.75 k, MA = 75 k·ft, Dy = 3.75 k, MB = 45 k·ft | Force method by hand: Dy = 8640/2304 = 3.75 k |

## How accurate is it?

Beam-Frame MAS uses the direct stiffness method with Euler–Bernoulli members including axial deformation. Hinges are condensed, member loads use exact fixed-end forces, settlements are prescribed displacements, and combinations are exact superposition. Peak moments are found exactly where the shear is zero.

`tests/verify.js` runs the solver from `index.html` against 27 hand calculations; `tests/beam-frame.js` (31 checks) tests settlements against 12EIΔ/L³ and 6EIΔ/L², concentrated moments against exact statics, a split-beam model and the fixed-end moments M₀b(2a−b)/L² and M₀a(2b−a)/L², E and I typed separately, and both worked problems against their independent solutions:

```bash
node tests/verify.js
node tests/beam-frame.js
```

[verification.png](verification.png) plots the app's shear, moment and deflection for both problems over the independent solutions; they agree to about 10⁻⁶.

Assumptions: linear elastic plane structures, small displacements and no shear deformation. Use it for learning and checking; confirm design work with your code of practice.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | The whole app: solver, beam builder, drawing, diagrams, PDF writer, 3D view |
| `three.min.js` | three.js r128 for the 3D view (MIT licence) |
| `manifest.webmanifest`, `sw.js`, icons | Installable app and offline use |
| `og-image.png`, `sitemap.xml` | Link previews and Google indexing |
| `verification.png` | The comparison plots |
| `FRMAS-FORMAT.md` | The `.frmas` file format, including EI-direct sections and settlements |
| `examples/`, `screenshots/`, `tests/` | The two worked problems, README pictures, test scripts |

## Licence

MIT: use, copy, change and share it freely, including in courses. three.js is MIT-licensed; the Barlow fonts in `index.html` use the SIL Open Font License ([OFL.txt](OFL.txt)).

## Also from MAS Studio

- **[Flexure MAS](https://al-shahriar-12.github.io/flexure-mas/)**: beam analysis with biaxial bending, torsion and 3D.
- **[Frame MAS](https://al-shahriar-12.github.io/frame-mas/)**: 2D frame and truss analysis on an ETABS-style grid.
- **[BNBC Frame MAS](https://al-shahriar-12.github.io/bnbc-frame-mas/)**: BNBC 2020 loads, frame analysis and drift checks.

## Author

<img src="author.jpg" width="130" align="left" alt="MD Al Shahriar" style="border-radius:50%;margin-right:16px">

**MD Al Shahriar**<br>
BSc. in Civil Engineering, Bangladesh University of Engineering and Technology (BUET)<br>
MAS Studio · GitHub: [@Al-Shahriar-12](https://github.com/Al-Shahriar-12)

<br clear="left">

If this app helped you, please remember its author in your duas.
