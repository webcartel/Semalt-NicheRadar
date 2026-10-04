# NicheRadar

## What

NicheRadar is a small AI niche discovery dashboard built on top of
FreeSerp Main (`index=sites`). Answer: "What is happening in this AI niche right now?"

## Why

Founders, indie hackers and PMs want a seconds-fast read on how many
similar AI products are being discovered and how active a niche is —
without subjective verdicts.

## Features

- Idea Check (matching AI products for a free-text niche)
- niche activity (current vs previous discovery window)
- DR distribution (bucketed `total` counts + unknown)
- AI-built signals (`ai=1` share + source breakdown)
- matching AI products (top relevance results)
- niche heatmap (all-time niche size + AI-built share; card layout on mobile)
- market pulse (`stats=1`)
- EN/UA language switcher (header, persisted, browser-detected) + `/about` data page

## Tech

Nuxt 4 / TypeScript / Tailwind / FreeSerp API. No backend, no auth, no DB.
Keyless `GET /api.php`, `native fetch`, `sessionStorage` cache.
Browser calls go through the same-origin Nitro proxy — the upstream
answers browser fetch with a duplicated `Access-Control-Allow-Origin: *, *`
header, so direct browser calls are blocked (see Deploy).

## Run

```bash
npm install
npx nuxi prepare   # generates .nuxt/tsconfig.json (required for typecheck)
npm run dev
```

Probe the API before building UI:

```bash
npm run probe
```

## Build

```bash
npm run typecheck
npm run build
```

## Deploy (Vercel / Netlify)

Browser calls go through the same-origin Nitro proxy
(`server/api/freeserp.get.ts`), which deploys as a serverless function.
No separate backend. Preset is picked at build time:

```bash
NITRO_PRESET=vercel npm run build   # → npx vercel deploy --prebuilt
NITRO_PRESET=netlify npm run build  # → netlify deploy
```

GitHub Pages (static only) is NOT supported: the upstream answers browser
fetch with a duplicated `Access-Control-Allow-Origin: *, *` header, so
direct browser calls are blocked until FreeSerp fixes it.

## API limitations

- `went_live` ≠ official launch date (first confirmed availability in index).
- `first_seen` ≠ verified launch date.
- Fresh records can have incomplete AI enrichment (see SPEC §11 offset window).
- `dr` can be null — show `DR unavailable` explicitly.
- `q` is text search, not semantic search.
- `index=sites` is a discovery/site index, not a complete market database.
- `total` is exact for `index=sites`; do not compute population stats from top-100 relevance slices.

## Not implemented (MVP scope)

Auth, backend, database, accounts, billing, favorites, product
comparison, LLM recommendations, chat, scraping, admin, CMS, analytics,
`index=web` in the main flow.

## Future

Saved reports, shareable niche URLs, historical snapshots, alerts,
API/backend caching, richer niche comparisons.

---

**NicheRadar** — легковаговий дашборд для експрес-аналізу AI-ніш. Відповідає на одне запитання: **«Що відбувається в моїй AI-ніші просто зараз?»** Цільова аудиторія — фаундери, інді-хакери та PM, яким за секунди треба зрозуміти, скільки схожих AI-продуктів уже виявлено і наскільки ніша активна. Жодних суб'єктивних вердиктів — лише дані й прозорі розрахунки, висновки робить користувач.

## Що він робить

**Idea Check** — ядро продукту. Вводиш фразу ніші («AI meeting notes») й отримуєш:
- **Matching AI products** — точну кількість збігів з індексу (напр. 527);
- **Newly detected** — свіжу динаміку знахідок (поточний vs попередній період, у %);
- **Domain Rating** — розподіл за корзинами DR + кількість невідомих;
- **AI-built signals** — частку продуктів, зібраних AI-білдерами, з розбивкою за джерелами (v0, Bolt, Lovable…);
- **Matching products** — топ-8 сайтів за релевантністю з фавіконками, категоріями, DR, датою першого виявлення та AI-самарі.

Плюс два оглядові блоки на головній: **Market Pulse** (статистика індексу — AI-стартапи сьогодні/загалом, топ-ніші) та **AI Market Heatmap** (розмір ніш + частка AI-built; на мобілі — картками, на десктопі — таблицею). Окремі сторінки ніш (`/niche/...`) і сторінка `/about` з методологією даних.

Все двомовне (EN/UA, перемикач у хедері, вибір запам'ятовується, мова браузера визначається автоматично), числа й дати форматуються за локаллю.

## Як він влаштований

- **Стек:** Nuxt 4 + Vue 3 + TypeScript + Tailwind, нуль бекенда/БД/авторизації. Весь API-шар — `services/freeserp.ts`, компоненти URL не будують.
- **Дані:** FreeSerp Main (`index=sites`, 20M+ сайтів). Браузер напряму смикати upstream не може (битий CORS-заголовок), тому запити йдуть через same-origin Nitro-proxy, який на Vercel/Netlify деплоїться як serverless-функція. Повторні GET кешуються в `sessionStorage`, паралелізм обмежено.
- **i18n без залежностей:** типізовані словники `data/i18n/en|uk.ts` (повноту перекладу перевіряє `typecheck`), глобальний стан у `composables/useLocale.ts`.
- **Чесність даних:** `went_live` — це перше підтвердження доступності сайту, а не запуск; свіжі записи можуть не мати DR/AI-розмітки (лаг збагачення ~7 тижнів, задокументовано в `docs/API-NOTES.md`); `index=sites` — discovery-індекс, а не весь ринок.
- **Контроль якості:** `npm run typecheck` + `npm run build` після змін, ручна перевірка UI (375px + десктоп, обидві мови).