# AriannA 2 Beta — By the Numbers

> **Architecture:** AriannA 2.0. Where older examples describe a different DOM ownership model, `ARCHITECTURE.md` is authoritative: **Real executes DOM mutations; Template plans; Virtual reconciles; Component orchestrates.**

| Metric | Value | Source |
|---|---:|---|
| **Codebase** | | |
| Total TypeScript lines | 78,146 | measured |
| Total `.ts` files | 211 | measured |
| Lines — `core/` | 26,915 | measured |
| Lines — `components/` | 35,376 | measured |
| Lines — `additionals/` | 15,855 | measured |
| Files — `core/` | 23 | measured |
| Files — `components/` | 162 | measured |
| Files — `additionals/` | 26 | measured |
| External dependencies | 0 | measured |
| **Components** | | |
| Total components | 162 | measured |
| Categories | 16 | measured |
| Modifiers · Graphics · Inputs | 26 · 20 · 17 | measured |
| Display · Finance · Layout | 14 · 13 · 11 | measured |
| Payments · Navigation · Audio | 10 · 8 · 8 | measured |
| Shipments · Maps · Animations | 7 · 7 · 6 | measured |
| Composite · Charts · Video · Data | 4 · 4 · 3 · 3 | measured |
| **Additional Modules** | | |
| `additionals` modules | 26 | measured |
| Named modules: AI, Physics, Three, Two, Midi, Latex, Geometry, Finance, Audio, Video, Math, Colors, Data, IO, Network, Animation, Docs, Less, Sass, Scss, Stylus | 21 named | measured |
| **Architecture** | | |
| Supported namespaces | 4 (HTML, SVG, MathML, X3D) | measured |
| Verified creation paths | 6 | measured |
| Core modules with a registered service | 15 | measured |
| Public barrel exports | 55 | measured |
| **Build** | | |
| `arianna.js` — unminified | 682.1 KB | build |
| `arianna.min.js` | 181.8 KB | build |
| `arianna.min.js.gz` | **45.9 KB** | build |
| `arianna-components.min.js.gz` | 132.9 KB | build |
| `arianna-additionals.min.js.gz` | 73.5 KB | build |
| Generated `.d.ts` declarations | 204 | build |
| Single-file `AriannA.ts` aggregate | 3.21 MB | build |
| Build time | ~10.3 s | build |
| **Verification** | | |
| Playground examples | 60 | measured |
| Examples executed without errors | 60 / 60 | executed |
| `tsc` errors — `core/` | 14 | measured |
| `tsc` errors — `additionals/` | **0** | measured |
| `tsc` errors — `components/` | 277 (2 root causes) | measured |
| Components still to migrate | 93 / 162 | measured |
| **Development** | | |
| Legacy — duration | 3 years | author-reported |
| Legacy — hours per day | 4 h | author-reported |
| Legacy — estimated total hours | ~4,380 h | calculated |
| v2 — start date | April 1, 2026 | author-reported |
| v2 — audit date | August 5, 2026 | — |
| v2 — duration | 4 months (127 days) | calculated |
| v2 — AI assistants used | 3 | author-reported |
| Legacy lines per hour | ~18 | calculated |
| **v1 History** | | |
| Public version available online | 1.6 (`ariannajs.dev`) | author-reported |
| Copyright years stated in the source code | 2012–2026 | measured |
| Years from the first line of code to the v2 beta | 14 | calculated |

---

*Measured* = counted by running commands against the codebase. *Build* = output produced by
`npm run build`. *Executed* = verified in Chromium. *Author-reported* = provided
by the author. *Calculated* = derived from the preceding figures.
