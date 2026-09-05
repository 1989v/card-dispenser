# card-dispenser

**Language:** [English](README.md) | [한국어](README.ko.md)

> 회전판에 옆으로 꽂힌 카드 중 정면에 온 하나가 일어난다.
> 스크롤로 돌리고, 끌어서 돌리고, "뽑기"로 두 바퀴 돌려 하나를 세운다.

[![npm](https://img.shields.io/npm/v/card-dispenser.svg)](https://www.npmjs.com/package/card-dispenser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#크기)

데모: https://1989v.github.io/card-dispenser/

## 왜 만들었나

관광지 80곳, 게임 76종, 상품 24개의 목록은 벽이다. 디스펜서는 그 전부를 **보이게** 든다 — 많으면
촘촘하고 적으면 성기다 — 그리고 하나를 뽑게 한다. 이미 건 필터의 결과를 그대로 꽂으면 "이 조건에서
아무거나"가 버튼 뒤의 `Math.random()` 이 아니라 손에 잡히는 동작이 된다.

- **각도 하나로 움직인다.** 드럼 각 = 스크롤이 주는 각(`setAngle`) + 사용자가 주는 각(드래그·스핀).
  카드의 "뽑힘 정도"는 정면과의 각 거리로만 정해지므로 스크럽·드래그·스핀이 전부 같은 layout 을 지난다.
- **실제 개수, 싼 DOM.** 항목마다 칸을 주되 앞면은 정면 다섯 칸 안으로 들어올 때 한 번 그린다. 칸 수백, 렌더는 그때그때 몇 장.
- **뽑히는 건 실제 항목뿐.** `minCards` 로 짧은 목록을 돌려 채워도 칸 s 는 `items[s % n]` 이다.
- **두 단계.** 판이 **움직이는 동안**(스핀·드래그·스크롤)에는 정면을 지나는 카드가 덱에서 살짝 위로 밀려 올라오기만
  하고(`peek`), 판이 **멈춘 뒤**(스핀 종료·스냅·스크롤이 `idleMs` 만큼 조용)에야 정면 카드가 완전히 나와 얼굴을 보인다.
  룰렛이 돌 때마다 카드가 통째로 튀어나오면 무엇이 뽑혔는지가 아니라 움직임만 보인다.
- **조용한 스핀.** 도는 동안 `onChange` 를 미루고 멈춘 뒤 한 번만. 빠르게 지나가는 제목은 읽을 수 없다.
- **의존성 0.** DOM + CSS 3D. 프레임워크를 모른다 — React 다리는 `useEffect` 스무 줄이다.

## 설치

```bash
npm i card-dispenser
```

```ts
import { createDispenser, escapeHtml } from 'card-dispenser';
import 'card-dispenser/card-dispenser.css';
```

## 쓰기

```ts
const d = createDispenser(host, {
  items,                                   // 무엇이든
  minCards: 24,                            // 모자라면 있는 것을 돌려 채운다 — 뽑히는 건 실제 항목뿐
  render: (it, i) => `<div class="cd-photo" style="background-image:url('${it.img}')"></div>
    <div class="cd-body"><span class="cd-seal">${escapeHtml(it.kind)}</span>
    <b class="cd-title">${escapeHtml(it.title)}</b></div>`,
  onChange: (it) => show(it),              // 정면 카드가 바뀔 때. 스핀 중엔 쉬고 멈춘 뒤 한 번
  onActivate: (it) => location.assign(it.url), // 일어난 카드를 탭·클릭·Enter
});
d.setAngle(-scrollProgress * 110);         // 스크롤 스크럽 (터치 기기에서는 하지 않는다)
d.spinTo('random').then(show);             // 뽑기
d.destroy();
```

| 메서드 | 무엇 |
|---|---|
| `setAngle(deg)` | 바깥(스크롤)이 주는 각. 사용자 조작 offset 과 더해진다 |
| `rotateBy(deg)` · `snap()` | 한 칸 넘기기 · 가장 가까운 카드에 맞춰 세우기 |
| `spinTo(i \| 'random', ms)` | 두 바퀴 돌아 느려지며 멈춘다. Promise 로 뽑힌 항목 |
| `current()` · `currentIndex()` | 정면 항목 |
| `onActivate(item, i)` (옵션) | 완전히 일어난 정면 카드를 탭·클릭하거나 Enter/Space. 끌다 놓은 것은 아니다 |
| `destroy()` | 전부 치운다 |

옵션: `radius` `cardW` `cardH` `tilt`(내려다보는 각, 18) `tiltMin` `tiltMax` `tiltDrag` `lift` `forward`
`pullScale` `peek`(움직일 때 올라오는 높이, 32) `revealMs`(멈춘 뒤 일어나는 시간, 360)
`peekSpread`(peek 이 걸리는 폭, 4칸) `peekCurve`(어깨가 떨어지는 속도, 4) `idleMs`(스크롤이 이만큼 조용하면 멈춘 것, 260) `dwell` `photoSteps`(2) `ticksEvery`
`lite` `nearSteps` `label`.

**그림이 가장 비싸다.** 판이 돌면 모든 카드가 정면을 지나므로, 얼굴에 주소를 그대로 박으면 스핀 한 번에 전부 내려받는다
(실측: 40장 판에서 멈춰 있을 때 18장 → 스핀 뒤 49장). 주소 대신 `<div class="cd-photo" data-src="…">` 로 두면
정면 ±`photoSteps`(2) 칸에 들어오고 **판이 멈춘 뒤에야** 붙는다. 옆으로 선 카드의 그림은 어차피 보이지 않는다.

`peek` 은 **여러 장에 걸쳐** 걸린다(`peekSpread`). 한 장만 올라오게 두면 스핀이 한 칸을 수십 ms 만에 지나가
눈에 안 보인다 — 물결이 판을 도는 것으로 읽혀야 뽑히는 과정이 보인다. 다만 어깨까지 고르게 올라오면
**삼각산 하나가 판을 도는 것처럼** 보이므로, `peekCurve` 로 주변이 먼저 내려앉게 한다(1 = 대칭 언덕).
세 값은 [튜너 페이지](https://1989v.github.io/card-dispenser/)에서 돌려 보며 고르고, 고른 값이 코드로 찍힌다.
`lite: true` 는 터치 기기용이다. 정면에서 `nearSteps`(7)칸 밖의 카드는 보이는 면 하나와 옆면 하나, 요소 둘만 남긴다.
카드 한 장이 3D 요소 다섯 개 = 컴포지터 레이어 다섯 개라 80장짜리 판이 폰에서 400 레이어를 넘겼다 — 거기서는 장수도 줄인다(40장이면 된다).

## 입력 정책

| 입력 | 데스크탑(pointer: fine) | 터치(pointer: coarse) |
|---|---|---|
| 스크롤 | 호출부가 `setAngle` 로 돌린다 | **돌리지 않는다** — 엄지 아래에서 판이 계속 움직이면 읽을 수 없고 관성 스크롤과 싸운다 |
| 가로 끌기 | 돈다, 놓으면 snap | 같음 (`touch-action: pan-y` 라 세로 스크롤은 그대로) |
| ← → | 한 칸 | — |
| 뽑기 버튼 | 있음 | **주 조작**. 44px 이상, 뽑힌 것은 판 바로 아래에 |

## 색

전부 `.cd` 의 `--cd-*` 변수다. 기본값은 한지·먹·황토 계열이고 쓰는 쪽이 자기 토큰으로 덮는다
(`--cd-face-bg` `--cd-face-fg` `--cd-back-bg` `--cd-line` `--cd-edge` `--cd-mark` `--cd-disc` `--cd-hub` `--cd-meta` `--cd-seal-bg` `--cd-seal-fg`).

## 3D 함정

`.cd-world` 의 `rotateX` 는 **음수**여야 정면(+Z)이 화면 아래·가까운 쪽으로 온다. 양수면 아래에서
올려다본 그림이 된다. 뽑힌 카드는 `rotateX(+tilt)` 로 되돌려 카메라를 본다.

## 접근성

호스트는 `role="listbox"` + `tabindex=0`, 카드는 `role="option"` + `aria-selected`, 정면 번호는 `aria-live`.
`prefers-reduced-motion` 이면 스핀·스냅이 즉시 끝난다.

## 성능

카드 한 장이 3D 요소 다섯 개(앞·뒤·옆면 셋)라 판 하나가 수백 레이어다. 화면 밖 판은 `content-visibility: auto` 로
아예 그리지 않고, `will-change` 는 움직이는 동안(`.cd.is-live`)에만 건다. 터치 기기에서는 스크롤로 `setAngle` 을 부르지 않는다.

## 크기

ESM + CJS + 타입. `index.js` gzip 2.1KB + `card-dispenser.css` gzip 2.1KB. `dependencies: {}` (`npm run no-deps` 가 지킨다).

## License

MIT
