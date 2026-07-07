# Content Plan — 12-week UK-first keyword calendar

The custom domain `thecalculatorhub.co.uk` gives a real edge on `google.co.uk` results. The plan leads with UK-specific content (where competition is lower and your domain is geo-relevant), then layers broader English-speaking content once authority builds.

## Cadence (3–5 hours/week)
- **New calculator** every 2nd week — copy an existing calculator page, swap form fields, add one `Calculators.<key>()` function in `js/main.js`.
- **Article/explainer** on alternating weeks — 600–1,500 words using `content-template.html`, internally linking to a relevant calculator with pre-filled input URLs.
- **Submit each published URL in Google Search Console** → URL inspection → Request indexing. Also submit 3 existing pages per day (quota resets daily).
- **2–3 Reddit/Quora answers per week** linking relevant calculators (r/UKPersonalFinance, r/personalfinance, r/loseit, r/printing). Use nofollow but traffic + brand signals still flow.
- **Weekly**: review Search Console → Performance → sort by impressions. Build follow-up content around what's getting impressions even without clicks.

## Premise
Avoid head terms ("compound interest calculator") directly — Bankrate, NerdWallet and Calculator.net have 10+ years of authority. Target the **queries around** those terms and UK-specific queries where geo-relevance gives you a free ranking boost.

---

## Week-by-week

### Week 1 ✅ — Article: "How Compound Interest Actually Works (With Real Numbers)"
- **Target:** "how does compound interest work", "compound interest example"
- **Intent:** newcomers to investing
- **Internal link:** → compound interest calculator (with a pre-filled example URL)
- **Affiliate:** brokerage sign-up (high RPM, finance vertical)
- **Status:** Published at `how-compound-interest-works.html`

### Week 2 — Calculator: Roll Length Calculator
- **Target:** "roll length calculator", "material on a roll calculator", "calculate film length from diameter"
- **Intent:** printing, packaging, foil/film/paper converters
- **Rationale:** very low competition, evergreen, supports micron/mm/inch — captures technical query traffic that Bankrate doesn't serve.
- **Affiliate:** none (commercial intent is purchasing consumables, not finance products)
- **Status:** Published at `roll-length-calculator.html`

### Week 3 — Article: "The 4% Rule Explained: When It Works (And When It Doesn't)"
- **Target:** "4% rule retirement", "how much do I need to retire UK", "safe withdrawal rate"
- **Links:** retirement calculator + ROI calculator
- **Affiliate:** pensions/ISA provider sign-up, brokerage — high RPM finance vertical

### Week 4 — Calculator: UK Take-home Pay Calculator
- **Target:** "take home pay calculator UK", "after tax salary UK", "net pay calculator"
- **Inputs:** annual salary, pension contribution %, tax code optional
- **Logic:** apply 2024/25 UK income tax bands (20/40/45%), NI (8% employee), pension relief, personal allowance taper
- **Disclaimer:** "rates as of 2024/25 tax year — verify at gov.uk"
- **Rationale:** highest commercial-intent finance volume not yet covered, UK-specific
- **Affiliate:** pension/SIPP providers, ISA providers

### Week 5 — Article: "Minimum Payment vs Avalanche vs Snowball: Real Cost Numbers"
- **Target:** "credit card avalanche vs snowball", "minimum payment debt payoff"
- **Links:** credit card payoff calculator
- **Affiliate:** balance-transfer cards (US + UK), debt consolidation loans

### Week 6 — Calculator: ISA Calculator (Lifetime ISA + standard ISA)
- **Target:** "lifetime ISA calculator", "LISA bonus calculator", "ISA calculator UK"
- **Inputs:** annual contribution, current LISA balance, years to first home / retirement
- **Logic:** Lifetime ISA 25% government bonus up to £4k/yr; standard ISA £20k annual limit, no bonus
- **Disclaimer:** UK tax-year limits; link to gov.uk guidance
- **Rationale:** very UK-specific, very low competition, very high commercial intent
- **Affiliate:** LISA providers, stocks &amp; shares ISA platforms

### Week 7 — Article: "How Much Should I Save Each Month?" (UK cornerstone)
- **Target:** "how much to save each month UK", "50 30 20 rule UK", "savings rate by age"
- **Links:** savings goal calculator + compound interest calculator
- **Affiliate:** high-yield / easy-access savings accounts, regular saver accounts
- **Ambition:** cornerstone article — 1,800+ words. Becomes internal link target for future articles.

### Week 8 — Article: "TDEE vs BMR: What's The Difference And Which Matters?"
- **Target:** "tdee vs bmr", "how to calculate tdee"
- **Links:** calorie calculator + BMI calculator
- **Affiliate:** food scale (Amazon) + meal-plan prep services

### Week 9 — Calculator: Net Worth by Age UK
- **Target:** "average net worth UK by age", "net worth calculator UK"
- **Logic:** compare user's net worth to ONS median by age band (2024 data)
- **Disclaimer:** ONS data, ages 18-65+, England &amp; Wales
- **Affiliate:** budgeting apps, investing apps

### Week 10 — Article: "Rent vs Buy UK 2026 (With Real Numbers)"
- **Target:** "rent vs buy UK 2026", "should I rent or buy UK"
- **Links:** mortgage calculator
- **Affiliate:** mortgage brokers, comparison sites

### Week 11 — Calculator: Credit Utilisation Calculator
- **Target:** "credit utilisation calculator", "how to calculate credit utilisation"
- **Rationale:** short, evergreen, complements the credit-card payoff page
- **Affiliate:** credit-building cards, credit monitoring services

### Week 12 — Pillar Article: "12 Best Personal Finance Calculators UK 2026"
- **Target:** "best personal finance calculators UK", "free financial calculators UK"
- **Purpose:** pillar page internally linking to all finance calculators — strong internal-linking signal, earns backlinks naturally
- **Affiliate:** none — keep editorial-feeling for AdSense RPM

---

## Keyword research workflow

1. **Search Console → Performance** once you have 200+ impressions. Sort by CTR; build around what's already working.
2. **Google autocomplete** + "People also ask" boxes — answer each one as an H2 inside the closest existing article.
3. **`answerthepublic.com`** (free tier) for adjacent queries.
4. **Aim for zero-difficulty** long tail first — phrases with specific numbers (£200/month for 20 years).
5. **UK variants first**: append "UK" to head terms; Bankrate/NerdWallet don't optimise for these and you have a geo-advantage.

## Backlink outreach targets

### UK-first (start month 2)
- **r/UKPersonalFinance** (Reddit, ~500k members) — answer genuinely, link calculators when relevant.
- **MoneySavingExpert forum** — sign up, answer questions, link when genuinely useful.
- **UK finance blogs** — Be Clever With Your Cash, The Humble Penny, Old Husband Money. Guest post pitch once you have 10+ pages live.
- **HARO / ResponseSource** — quote requests from UK finance journalists at The Times, FT, Guardian, Telegraph money desks.

### Broader (start month 3+)
- **r/personalfinance, r/investing, r/loseit, r/Fitness** (Reddit) — link when calculators genuinely answer questions.
- **Medium republish** — republish articles via Medium's "Import a story" feature with canonical back to the site; gives backlink + new audience.
- **GitHub repo README** — backlink from `github.com/IanT-IT-Dev/thecalculatorhub` to the live domain.

## Content rules of thumb

- Always include a worked numeric example (use £ for UK-first pieces; $ acceptable for global calculators).
- Embed at least one calculator link with **pre-filled inputs in the URL** (uses the Shareable URL feature built into `js/main.js`).
- Include a FAQ JSON-LD section targeting "People also ask" questions — schema is already wired in `content-template.html`.
- Use `content-template.html` as the starting scaffold for every new article.
- Affiliate links always appear *after* the substantive content, never as the lead.

## Expected outcome (honest estimate)

By end of week 12 you should have **27+ pages** indexed (15 originals + 12 new) with a few hundred to a couple thousand monthly visitors — the realistic threshold to apply for AdSense. Apply in week 13 if traffic is meaningful.

If you keep the cadence beyond 12 weeks, the site should reach $50–$300/month by month 9–12 from AdSense + affiliate — and compounds from there. Faster growth requires more content or stronger backlinks.

## How to update UK tax/year-dependent data

The UK take-home pay calculator (Week 4) and any calculator using UK tax bands (income tax bands, NI rates, ISA limits, LISA bonus, Stamp Duty thresholds) will need annual updates each April. Add the data as a constant in `js/main.js` with the tax year in the variable name, plus a footer disclaimer stating "rates as of [tax year] — verify at gov.uk".