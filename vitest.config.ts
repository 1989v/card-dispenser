import { defineConfig } from 'vitest/config';

// 판은 DOM 에 선다 — jsdom 으로 만들고, 스핀은 ms=0 으로 즉시 끝내 rAF 없이 검사한다
export default defineConfig({ test: { environment: 'jsdom', include: ['test/**/*.test.ts'] } });
