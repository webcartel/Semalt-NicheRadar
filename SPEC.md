# NicheRadar

## 1. Product

**NicheRadar** — небольшой веб-инструмент для исследования AI-ниш на основе discovery-данных FreeSerp.

Главный вопрос продукта:

> **What is happening in this AI niche right now?**

Пользователь вводит идею или нишу, например:

- AI resume builder
- AI meeting notes
- AI video generator
- AI customer support

Приложение показывает:

- сколько AI-продуктов найдено;
- сколько сайтов было обнаружено как live за выбранный период;
- изменение числа новых обнаружений относительно предыдущего периода;
- распределение Domain Rating;
- долю сайтов, которые FreeSerp классифицирует как AI-built;
- несколько наиболее релевантных найденных продуктов;
- сравнение активности разных AI-ниш.

Приложение **не выносит субъективный verdict** вроде "good opportunity", "bad niche" или "high competition". Оно показывает данные и прозрачные расчёты, оставляя вывод пользователю.

---

# 2. Goal

Показать способность:

1. разобраться с незнакомым публичным API;
2. корректно интерпретировать его данные и ограничения;
3. построить поверх API полезный пользовательский сценарий;
4. использовать AI coding agent для исследования, реализации и проверки;
5. не добавлять ненужную техническую сложность.

FreeSerp Main (`index=sites`) предназначен для поиска и анализа homepage-level site profiles с AI summary, AI taxonomy, Domain Rating, tech/source signals и датами discovery. Он возвращает точный `total` для site index, в отличие от Global web index, где `total` относится к ограниченному candidate pool.

---

# 3. Target audience

Основные пользователи:

- founders;
- indie hackers;
- developers;
- product managers;
- marketers;
- AI enthusiasts.

Основной сценарий:

> "У меня есть идея AI-продукта. Хочу за несколько секунд понять, сколько похожих продуктов уже обнаруживается в этой нише и насколько активно появляются новые."

---

# 4. Non-goals

В MVP НЕ реализовывать:

- authentication;
- backend;
- database;
- user accounts;
- billing;
- favorites;
- product comparison;
- LLM-generated recommendations;
- chat;
- scraping;
- admin panel;
- CMS;
- external analytics;
- `index=web` как часть основного пользовательского сценария.

Не использовать собственную LLM внутри приложения.

---

# 5. Tech stack

- Nuxt 4
- TypeScript
- Tailwind CSS
- Vue 3
- native `fetch`
- browser `sessionStorage`

Backend не требуется.

FreeSerp API является keyless. Основной endpoint — `GET /api.php`.
> Amendment 2026-10-04: SPEC §5 "CORS-open" assumption does not hold —
> upstream answers browser `fetch` with a duplicated
> `Access-Control-Allow-Origin: *, *` header, so direct browser calls are
> blocked. Browser traffic goes through the same-origin Nitro proxy
> (`server/api/freeserp.get.ts`); see `docs/API-NOTES.md`.

---

# 6. Application structure

MVP должен состоять из двух основных страниц.

## `/`

Главная страница и Idea Check.

Содержимое:

1. Hero / search
2. Idea Check result
3. Competition / DR distribution
4. AI-built information
5. Matching products
6. AI Market Heatmap
7. FreeSerp data disclaimer

## `/niche/:category`

Детальная страница выбранной AI-ниши.

Содержимое:

1. название ниши;
2. количество обнаруженных сайтов;
3. динамика;
4. AI-built share;
5. список найденных сайтов.

При нехватке времени допустимо реализовать `/niche/:category` как состояние главной страницы через query parameters.

---

# 7. Main UX

## Hero

Заголовок:

> AI Niche Radar

Подзаголовок:

> Explore new AI products, niche activity and competitive signals.

Search:

```text
[ AI resume builder                         ] [Check niche]
```

Examples:

```text
AI resume builder
AI meeting notes
AI video generator
AI customer support
```

После отправки:

- normalize input;
- debounce не требуется для submit;
- выполнить Idea Check;
- показать loading state;
- сохранить результаты в sessionStorage.

---

# 8. Idea Check

## Input

Пользователь вводит свободный текст.

Пример:

```text
AI resume builder
```

Запрос должен использовать:

```text
index=sites
q=<query>
ai_startups=1
```

`ai_startups=1` использовать обязательно для Idea Check.

FreeSerp рекомендует этот фильтр для поиска настоящих AI-product niches и удаления шума вроде AI-flavoured shops, directories и других нерелевантных категорий.

---

# 9. Idea Check metrics

## 9.1 Matching products

Запрос:

```text
q=<query>
ai_startups=1
size=1
```

Использовать:

```text
response.total
```

Это значение является точным `total` для FreeSerp Main site index.

UI:

```text
73
matching AI products
```

Не называть это "73 competitors".

---

# 10. New entrants

Использовать два одинаковых query с разными датами:

```text
Current period:
from_date = T1
to_date   = T2

Previous period:
from_date = T3
to_date   = T4
```

Оба запроса:

```text
index=sites
q=<query>
ai_startups=1
size=1
```

Количество брать из `total`.

Показывать:

```text
Newly detected

Last 30 days     18
Previous 30 days 13
Change           +38%
```

Формула:

```text
change = ((current - previous) / previous) * 100
```

Если `previous === 0`:

```text
Change: —
```

Не отображать бесконечный процент.

### Важное правило

Не использовать формулировку:

```text
Market growth +38%
```

Использовать:

```text
New-site discovery +38%
```

или:

```text
Newly detected products +38%
```

Причина: `went_live` отражает первое подтверждение доступности сайта в индексе и не является гарантированной официальной датой запуска бизнеса. `first_seen` также не должен интерпретироваться как launch date.

---

# 11. Date-window caveat

Свежие записи могут иметь неполные AI metadata, поскольку обнаружение, категоризация и другие enrichment-процессы могут происходить с задержкой.

Поэтому реализация должна предусматривать два режима:

```text
A. Exact recent window
B. Offset window
```

Для MVP использовать **offset window**, если предварительное API-тестирование подтверждает наличие заметного lag.

Например:

```text
Recent period:
T-33 ... T-3

Previous:
T-63 ... T-34
```

В README явно объяснить причину offset.

Если тестирование показывает, что задержка не оказывает существенного влияния, использовать обычные 30-дневные окна.

---

# 12. DR distribution

Не вычислять медиану по top-100.

Причина:

`size=100` возвращает релевантные результаты, поэтому распределение DR такой выборки не является распределением всей найденной ниши.

Для точного распределения использовать несколько запросов с:

```text
size=1
dr_min
dr_max
```

Пример buckets:

```text
0–4
5–9
10–19
20–29
30–49
50–100
```

Каждый bucket:

```text
index=sites
q=<query>
ai_startups=1
dr_min=<min>
dr_max=<max>
size=1
```

Каждый `total` — количество сайтов в соответствующем диапазоне.

Также показать:

```text
DR unavailable
```

Количество:

```text
unknown =
matching_total - sum(all DR buckets)
```

Поскольку у новых доменов DR может отсутствовать.

UI:

```text
Domain Rating distribution

0–4       ███████████████ 31
5–9       ██████████      22
10–19     █████            12
20–29     ██                5
30–49     █                  3
50–100                       0
Unknown   ████              8
```

---

# 13. AI-built share

Проверить экспериментом, совместимы ли:

```text
ai=1
ai_startups=1
```

Если да, использовать:

```text
ai-built total =
q=<query>
ai_startups=1
ai=1
size=1
```

Формула:

```text
ai_built_share =
ai_built_total / matching_total * 100
```

UI:

```text
AI-built signals

24 / 73
33%
```

Ниже показать breakdown:

```text
Lovable
v0
Bolt
Base44
ai_likely
```

Значения `ai_source` брать только из фактически возвращаемых API values / help response, не придумывать собственные значения.

FreeSerp документирует `ai=1` как фильтр по AI-building sources, включая `ai_likely`, `lovable`, `base44`, `v0` и `bolt`.

---

# 14. Matching products

Для списка использовать:

```text
index=sites
q=<query>
ai_startups=1
sort=relevance
size=8
```

Показывать:

```text
Product name / title
domain
ai_summary
ai_categories
dr
went_live
ai_source
```

Карточка:

```text
ResumeFlow
resumeflow.ai

AI-powered resume creation and optimization...

AI Resume
DR 12
Live since Sep 2026
AI-built: Lovable

[Open site]
```

### Naming rule

Не использовать:

```text
Launched Sep 2026
```

Использовать:

```text
Live since Sep 2026
```

или:

```text
First detected Sep 2026
```

---

# 15. Heatmap

Heatmap показывает относительную активность AI-ниш.

Столбцы:

```text
Niche
Last 7d
Previous 7d
Change
```

Пример:

```text
AI Agents             184    121    +52%
Image Generation      143    136     +5%
Video Generation       97     61    +59%
AI Search              76     48    +58%
Voice & TTS             64     70     -9%
Code & Dev Tools       118     93    +27%
```

Для каждой категории:

```text
index=sites
ai_startups=1
ai_categories=<category>
from_date=<start>
to_date=<end>
size=1
```

Использовать exact `total`.

### Category source

Не придумывать taxonomy.

Сначала получить актуальные допустимые значения через:

```text
help=1
```

или эквивалентный documentation/MCP response.

Затем сохранить используемый набор категорий в:

```text
src/data/aiCategories.ts
```

Runtime запрос к `help=1` для каждого открытия страницы не нужен.

---

# 16. Heatmap metrics

Основная метрика:

```text
newly detected sites
```

Дополнительно предусмотреть переключатель:

```text
Metric:
[New sites] [AI-built %]
```

Но если реализация затягивается, оставить только:

```text
New sites
```

Для AI-built percentage запросить:

```text
ai=1
ai_startups=1
ai_categories=<category>
```

только после подтверждения совместимости параметров.

---

# 17. Market Pulse

Отдельный небольшой блок сверху или под Heatmap.

Получать через:

```text
stats=1
```

Использовать только фактически предоставляемые поля:

```text
new.today
new.last_7d
ai_startups.today
ai_startups.last_7d
top_ai_categories
top_ai_source
```

`stats=1` предоставляет агрегированную статистику, включая daily/new-site data, AI-startup counts и top AI categories/source.

UI:

```text
MARKET PULSE

AI startups detected today
72

AI startups — last 7 days
431

Top AI niches
AI Agents
Image Generation
Code & Dev Tools
```

Не строить AI-daily line chart напрямую из `by_day` без дополнительных AI-filtered requests, потому что `by_day` относится к общей new-site статистике, а AI startup counts представлены отдельно.

---

# 18. Loading states

Каждый аналитический блок должен иметь собственное состояние:

```text
Loading...
```

Не блокировать весь интерфейс, если одна вторичная метрика ещё загружается.

Основной результат:

```text
Searching FreeSerp...
```

---

# 19. Error handling

Обработать:

### API unavailable

```text
FreeSerp is temporarily unavailable.
Please try again.
```

### Empty result

```text
No AI products found for this query.
Try a broader phrase.
```

### Partial analytics failure

Например DR buckets не загрузились.

Основной результат всё равно показывается.

```text
Some analytics could not be loaded.
```

Не показывать fabricated values.

---

# 20. Caching

Использовать `sessionStorage`.

Ключ:

```text
freeserp:<normalized-request-url>
```

Значение:

```json
{
  "timestamp": 123456789,
  "data": {}
}
```

TTL:

```text
5 minutes
```

Кэшировать GET API responses.

Особенно важно для Heatmap, где используется несколько запросов.

---

# 21. Request concurrency

Не запускать 20–30 запросов одновременно.

Максимум:

```text
3 concurrent requests
```

Использовать небольшой request pool / queue.

Пример:

```text
Request 1
Request 2
Request 3
   ↓
Request 4
Request 5
...
```

Это касается:

- Heatmap;
- DR buckets;
- AI-source breakdown;
- parallel Idea Check metrics.

---

# 22. API abstraction

Вся работа с FreeSerp должна находиться в одном слое.

Например:

```text
src/
  composables/
    useFreeSerp.ts

  services/
    freeserp.ts

  types/
    freeserp.ts
```

Компоненты не должны самостоятельно собирать URL.

Предоставить методы:

```ts
searchSites()
getStats()
countByDateRange()
countByDrRange()
countByCategory()
countAiBuilt()
```

---

# 23. TypeScript types

Типизировать API response.

Минимум:

```ts
interface FreeSerpSiteResult {
  domain: string
  url: string
  title: string
  ai_summary?: string | null
  category?: string | null
  ai_categories?: string[] | string | null
  ai_source?: string | null
  dr?: number | null
  went_live?: string | null
  first_seen?: string | null
  tld?: string | null
}

interface FreeSerpResponse {
  ok: boolean
  index: string
  query?: string
  total: number
  count: number
  from: number
  size: number
  results?: FreeSerpSiteResult[]
}
```

Реальную структуру нужно сначала проверить API response и скорректировать types под него.

---

# 24. API investigation before implementation

ПЕРЕД созданием UI провести API probe.

Создать:

```text
scripts/
  freeserp-probe.mjs
```

Проверить:

### Test 1
Как работает multi-word `q`.

```text
q="AI meeting notes"
```

Проверить несколько результатов вручную.

### Test 2
Совместимость:

```text
ai=1
ai_startups=1
```

### Test 3
Границы:

```text
from_date
to_date
```

Проверить inclusive/exclusive behavior.

### Test 4
Совместимость:

```text
q
ai_startups
ai_categories
from_date
to_date
```

### Test 5
DR ranges.

Проверить:

```text
dr_min=0
dr_max=4
```

и соседние ranges.

### Test 6
Latency.

Проверить серию:

```text
10–15 size=1 requests
```

и измерить общее время.

Результаты сохранить в:

```text
docs/API-NOTES.md
```

---

# 25. Project files

Итоговая структура:

```text
NicheRadar/

├── pages/
│   ├── index.vue
│   └── niche/
│       └── [category].vue
│
├── components/
│   ├── SearchHero.vue
│   ├── IdeaCheck.vue
│   ├── MetricCard.vue
│   ├── DiscoveryTrend.vue
│   ├── DrDistribution.vue
│   ├── AiBuiltBreakdown.vue
│   ├── ProductCard.vue
│   ├── ProductList.vue
│   ├── MarketHeatmap.vue
│   ├── MarketPulse.vue
│   └── ApiDisclaimer.vue
│
├── composables/
│   ├── useNicheRadar.ts
│   ├── useFreeSerp.ts
│   └── useSessionCache.ts
│
├── services/
│   └── freeserp.ts
│
├── types/
│   └── freeserp.ts
│
├── utils/
│   ├── dateRanges.ts
│   ├── metrics.ts
│   └── normalizeQuery.ts
│
├── data/
│   └── aiCategories.ts
│
├── scripts/
│   └── freeserp-probe.mjs
│
├── docs/
│   └── API-NOTES.md
│
├── AGENTS.md
├── AI-WORKLOG.md
├── README.md
├── SPEC.md
└── package.json
```

---

# 26. AGENTS.md

В корне проекта создать `AGENTS.md`.

Он должен содержать:

```md
# Project Instructions

## Product

NicheRadar is a small AI niche discovery dashboard built on top of
FreeSerp Main (`index=sites`).

## Rules

- Do not invent FreeSerp fields.
- Inspect API responses before implementing assumptions.
- Use `ai_startups=1` for Idea Check queries.
- Prefer exact `total` values from `index=sites`.
- Do not describe `went_live` as an official launch date.
- Do not generate subjective market verdicts.
- Do not add authentication, database or backend.
- Keep API logic outside Vue components.
- Keep request concurrency at 3.
- Cache repeated GET requests in sessionStorage.
- Handle null DR explicitly.
- Do not use `index=web` in the MVP.
- Run typecheck and build after meaningful changes.
- Review the final UI manually.
```

`AGENTS.md` подходит и для OpenCode, и для Pi как persistent project instructions.

---

# 27. AI-WORKLOG.md

Не писать огромную историю всех действий.

Фиксировать только важные решения:

```md
# AI Development Worklog

## API investigation

### Question
Does multi-word q behave as expected?

### Test
...

### Result
...

### Decision
...

## API investigation

### Question
Can ai=1 and ai_startups=1 be combined?

### Result
...

### Decision
...

## Implementation

### AI-generated
...

### Manually changed
...

### Why
...
```

Цель файла — показать **контроль AI**, а не количество промптов.

---

# 28. README

README должен содержать:

## What

Короткое описание NicheRadar.

## Why

Какую проблему решает.

## Features

- Idea Check
- niche activity
- DR distribution
- AI-built signals
- matching AI products
- niche heatmap
- market pulse

## Tech

Nuxt 4 / TypeScript / Tailwind / FreeSerp API.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API limitations

Обязательно описать:

- `went_live` ≠ official launch date;
- `first_seen` ≠ verified launch date;
- fresh records can have incomplete enrichment;
- `dr` can be null;
- `q` is text search, not semantic search;
- `index=sites` is a discovery/site index, not a complete market database.

## Not implemented

Коротко перечислить сознательно не реализованные функции.

## Future

Например:

- saved reports;
- shareable niche URLs;
- historical snapshots;
- alerts;
- API/backend caching;
- richer niche comparisons.

---

# 29. Design

Стиль:

**modern B2B analytics / Linear / Vercel-like**

Не использовать:

- purple AI gradients;
- glowing cards;
- excessive glassmorphism;
- animated backgrounds;
- stock illustrations;
- cartoon AI robots.

Основной принцип:

```text
Data first
Minimal decoration
Clear hierarchy
```

Desktop-first:

```text
max-width: 1200px
```

Но интерфейс должен нормально работать на mobile.

---

# 30. Visualization rules

Графики должны быть простыми.

Предпочтение:

- horizontal bars;
- compact histogram;
- heatmap/table;
- metric cards.

Не использовать сложные chart libraries, если они не нужны.

Для MVP допустимо реализовать визуализации через обычный HTML/CSS.

---

# 31. Performance

Не делать повторные API requests при каждом render.

Не использовать:

```text
watchEffect -> API request
```

без строгого контроля.

Search запускается только после submit.

Heatmap запускается один раз при загрузке/инициализации.

Use:

```text
computed
shallowRef
sessionStorage cache
```

где это действительно необходимо.

---

# 32. Acceptance criteria

Проект считается готовым, если:

### Functional

- пользователь может ввести AI niche;
- выполняется реальный FreeSerp API request;
- отображается exact matching count;
- отображается current/previous discovery count;
- рассчитывается изменение;
- отображается DR distribution;
- отдельно отображается DR unknown;
- отображается AI-built information;
- отображаются реальные matching sites;
- Heatmap получает данные через API;
- Market Pulse использует `stats=1`;
- ошибки и empty states обработаны.

### Technical

- TypeScript без ошибок;
- production build проходит;
- нет hardcoded fake metrics;
- API logic централизована;
- concurrency ≤ 3;
- cache работает;
- нет API key;
- нет backend;
- нет authentication.

### Product

Пользователь должен за один сценарий:

```text
Enter idea
   ↓
Check niche
   ↓
See numbers
   ↓
Inspect competitors
   ↓
Explore related niches
```

---

# 33. Priority order

Если время ограничено, реализовывать строго в таком порядке:

## P0

1. API probe
2. API service
3. Search
4. Matching total
5. Product list
6. Loading/error states

## P1

7. Current/previous discovery
8. DR distribution
9. AI-built share

## P2

10. Heatmap
11. Market Pulse

## P3

12. visual polish
13. responsive polish
14. README
15. AI-WORKLOG

Если времени недостаточно, **не жертвовать корректностью API ради дополнительных экранов**.

---

# 34. Development workflow with Pi / OpenCode

Работать итерациями.

### Step 1 — Research

Задача agent:

```text
Read SPEC.md.

Do not write application code yet.

Inspect the FreeSerp documentation and run API probes.

Verify:
1. multi-word q behavior;
2. ai + ai_startups compatibility;
3. date boundary behavior;
4. ai_categories + q + dates;
5. DR bucket behavior;
6. request latency.

Create docs/API-NOTES.md with factual findings.

Do not make assumptions where the API result is unclear.
```

### Step 2 — Architecture

```text
Based on SPEC.md and API-NOTES.md,
design the minimal Nuxt 4 architecture.

Do not implement UI yet.

List:
- API service
- types
- composables
- metric utilities
- caching
- request concurrency
- page/component structure

Keep the implementation small enough for a 2–4 hour test task.
```

### Step 3 — Implementation

```text
Implement the MVP according to SPEC.md.

Start with:
1. FreeSerp service
2. TypeScript types
3. caching
4. request pool
5. Idea Check
6. product results

After each meaningful step:
- run typecheck;
- inspect API response shape;
- fix issues before continuing.
```

### Step 4 — Analytics

```text
Implement:
- discovery trend
- DR distribution
- AI-built share

Use exact total values where required.

Do not calculate population-wide statistics from the top 100 relevance results.
```

### Step 5 — Polish

```text
Review the complete application as a product.

Check:
- visual hierarchy;
- loading states;
- error states;
- mobile;
- long queries;
- null values;
- zero-result niches;
- slow API responses.

Remove unnecessary complexity.
```

### Step 6 — Review

Для OpenCode можно использовать отдельного read-only reviewer agent; OpenCode поддерживает project-level subagents в `.opencode/agents/`.

Reviewer prompt:

```text
Review the current NicheRadar implementation against SPEC.md.

Do not modify files.

Check:
- API correctness
- incorrect assumptions
- metric calculation errors
- null handling
- request duplication
- excessive complexity
- UX bugs
- TypeScript issues
- misleading product wording

Return findings ordered by severity.
```

---

# 35. Definition of Done

Финальный проект должен выглядеть как:

> a small, credible product built around a real data source

а не как:

> a technical API demo.

Основной критерий качества:

```text
Simple implementation
+
Correct API interpretation
+
Useful product flow
+
Transparent metrics
```

Никаких fake insights и субъективных market verdicts.