# Nonogram Maker

Turn any picture into a nonogram (picross) puzzle in your browser, then share it as a link.

**Play:** https://tjagithub.github.io/nonogram-maker/

1. Choose an image. Photos, drawings and transparent PNGs all work.
2. Pick 8×8, 16×16 or 32×32. The preview shows the puzzle you will get.
3. Generate it, then use **Copy share link**. The whole puzzle is in the URL (`?nonogram=...`), about 170 characters at 32×32, so nothing is uploaded anywhere.

Transparent images use their outline. Opaque images are split into light and dark with Otsu's method, and the smaller side becomes the picture. **Swap filled and empty** flips that.

## Develop

```bash
npm ci
npm run dev        # http://localhost:5173
npm run build
npm run test:e2e   # Playwright; run `npx playwright install chromium` once
```

React 19, TypeScript, Vite and Tailwind. The share code is one byte for the size followed by the cells packed 8 per byte, base64url-encoded (`src/utils/shareCode.ts`).
