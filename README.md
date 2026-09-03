# card-dispenser

**Language:** [English](README.md) | [한국어](README.ko.md)

> Cards stand edge-on around a rotating drum. The one that reaches the front rises to face you.
> Scroll it, drag it, or press **spin** and let it land on one.

[![npm](https://img.shields.io/npm/v/card-dispenser.svg)](https://www.npmjs.com/package/card-dispenser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#size)

Live demo: https://1989v.github.io/card-dispenser/

## Why this exists

A list of 80 places, 76 games, or 24 products is a wall. A dispenser holds all of them *visibly* —
dense when there are many, sparse when there are few — and lets a person pull one out. Put the
results of the filters they already set into it, and "pick something for me" becomes a physical gesture
instead of a `Math.random()` behind a button.

- **One angle drives everything.** Drum angle = the angle scroll gives (`setAngle`) + the angle the
  user gives (drag, spin). A card's "pulled-out amount" depends only on its angular distance from the
  front, so scroll-scrub, drag and spin all go through one layout function.
- **Real counts, cheap DOM.** Every item gets a slot, but a card's face is rendered only once it comes within
  five steps of the front. Hundreds of slots, a handful of renders at a time.
- **Picks are always real.** With `minCards`, a short list is repeated around the drum so it doesn't look
  empty, but slot *s* maps to `items[s % n]` — the thing that lands is always an actual item.
- **Two phases.** While the drum is *moving* (spin, drag, scroll) the card passing the front only nudges up out of
  the deck (`peek`). Only when the drum *stops* — the spin lands, a drag snaps, scrolling goes quiet for `idleMs` —
  does the front card fully rise and turn to face you. A roulette whose cards keep jumping out shows motion, not a pick.
- **Quiet spins.** While spinning, `onChange` is held back and fired once when the drum stops. Titles that
  flicker past at 30 fps are unreadable.
- **Zero dependencies.** DOM + CSS 3D. Framework-agnostic; a React wrapper is ~20 lines of `useEffect`.

## Install

```bash
npm i card-dispenser
```

```ts
import { createDispenser, escapeHtml } from 'card-dispenser';
import 'card-dispenser/card-dispenser.css';
```

## Usage

```ts
const host = document.querySelector('#dispenser'); // position: relative, with a size

const d = createDispenser(host, {
  items: places,                       // anything
  minCards: 24,                        // repeat a short list around the drum (picks stay real)
  render: (p, i) => `
    <div class="cd-photo" style="background-image:url('${p.img}')"></div>
    <div class="cd-body">
      <span class="cd-seal">${escapeHtml(p.kind)}</span>
      <b class="cd-title">${escapeHtml(p.title)}</b>
      <span class="cd-meta">${escapeHtml(p.district)}</span>
    </div>`,
  onChange: (p) => show(p),            // front card changed (held back during a spin)
});

// scroll-scrub (desktop): rotate 110° while the section passes through the viewport
addEventListener('scroll', () => {
  const r = section.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
  d.setAngle(-p * 110);
}, { passive: true });

button.onclick = () => d.spinTo('random').then(show);   // two turns, eases out, lands on one
```

The host gets `role="listbox"`, `tabindex="0"`, and `class="cd"`. It should be a positioned box with a
size — the drum scales itself to the host width (`--cd-s`).

## API

| Method | What |
|---|---|
| `setAngle(deg)` | Angle from outside (scroll). Added to the user's `offset`. |
| `rotateBy(deg)` · `snap()` | Turn by an amount · settle the nearest card at the front (after a drag). |
| `spinTo(index \| 'random', ms = 2600)` | Two full turns, eases out, stops. Resolves with the item. `'random'` excludes the current one. |
| `current()` · `currentIndex()` | The front item and its index in `items`. |
| `destroy()` | Remove everything and listeners. |

Options: `items` `render` `onChange` `minCards` `radius` `cardW` `cardH` `tilt` `lift` `forward`
`pullScale` `peek` `revealMs` `idleMs` `dwell` `ticksEvery` `label`. Defaults are tuned for a 520–600 px wide host.
`peek` (18 px) is how far a passing card nudges up while the drum moves; `revealMs` (360) is the rise once it
stops; `idleMs` (260) is how long `setAngle` must stay quiet before the drum counts as stopped.

Only cards within five steps of the front have `render` called (once each, as they come around).

Pure helpers are exported for tests: `pullAmount(angleDistance, step, dwell)`, `slotCount(n, minCards)`,
`escapeHtml(value)`.

## Input policy

| Input | Desktop (`pointer: fine`) | Touch (`pointer: coarse`) |
|---|---|---|
| Scroll | you call `setAngle` | **don't** — a drum moving under the thumb is unreadable and fights momentum scrolling |
| Horizontal drag | rotates, snaps on release | same (`touch-action: pan-y` keeps vertical scroll) |
| ← → | one card | — |
| Spin button | available | the **primary** control: 44 px, put the result right under the drum |

This is a recommendation, not enforced by the library — `matchMedia('(pointer: coarse)')` on the caller
side decides whether to wire scroll.

## Theming

All colour lives in `--cd-*` custom properties on `.cd`. Defaults are a warm paper/ink palette;
override them from your tokens:

```css
.cd {
  --cd-face-bg: #f9f8f2;  --cd-face-fg: #1d1d1f;  --cd-back-bg: #1d1d1f;
  --cd-line: #b38b6d;     --cd-edge: #6f5236;     --cd-mark: #a2231d;
  --cd-disc: #141414;     --cd-hub: #232326;      --cd-meta: #8a6346;
  --cd-seal-bg: var(--cd-back-bg); --cd-seal-fg: var(--cd-face-bg);
  --cd-photo-empty: #e3e3dd; --cd-mono: ui-monospace, monospace;
}
```

Face layout helpers: `.cd-photo`, `.cd-body` (`--text` for text-only cards), `.cd-seal`, `.cd-title`
(`--wrap` for 3 lines), `.cd-meta`, `.cd-num`. You can ignore them and render any markup.

## Accessibility & motion

`role="listbox"` host, `role="option"` cards with `aria-selected`, front index in an `aria-live` region.
Under `prefers-reduced-motion` spins and snaps complete instantly.

## The 3D gotcha

`.cd-world` uses `rotateX(-tilt)`. The sign matters: with a positive tilt the front (+Z) of the drum
ends up at the *top* of the screen and you are looking at it from below. The pulled card counter-rotates
with `rotateX(+tilt)` so it faces the camera squarely.

## Size

ESM + CJS + types. `index.js` 2.1 KB gzip + `card-dispenser.css` 2.1 KB gzip. `dependencies: {}` (enforced by `npm run no-deps`).

## License

MIT
