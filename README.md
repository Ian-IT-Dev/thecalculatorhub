# Calculator Hub

A free, fast, no-signup collection of **14 online calculators** targeting evergreen finance, loan, health and math search demand. Static HTML/CSS/vanilla JS — zero hosting cost, zero dependencies, instant load, works offline (installable PWA).

## Calculators
| Finance & debt | Health & everyday |
|---|---|
| Compound Interest (with weekly option + chart) | BMI (metric/imperial + gauge) |
| Savings Goal (monthly + weekly + chart) | Calorie / TDEE (Mifflin-St Jeor) |
| Retirement / 401(k) (projection chart) | Percentage |
| ROI (annualized + bar chart) | Tip |
| Loan Payoff (amortization chart) | Unit Converter (length, mass, volume, speed, time, temperature) |
| Mortgage (PITI + HOA + amortization) | |
| Credit Card Payoff (months to debt-free) | |
| Hourly to Salary | |
| Sales Tax | |

All calculations run client-side. No data leaves the browser. Inputs persist in `localStorage` and can be shared via URL.

## Features
- **Live recalculation** as you type (debounced)
- **Currency detection + switching** — auto-detects from browser locale, 26 currencies, persisted
- **Weekly amounts** shown under monthly results on loan/savings/credit-card/mortgage calculators
- **Dark mode** — follows system preference, manual toggle, persisted, charts adapt
- **SVG charts** — hand-rolled line, bar and gauge charts, no dependencies
- **Shareable URLs** — inputs encoded in the query string, "Share" button copies a link
- **CSV export** of amortization/year-by-year schedules
- **Print** button (print-optimized CSS)
- **PWA** — manifest + offline service worker + install icon
- **SEO** — per-page meta, canonical, Open Graph, WebApplication + FAQ JSON-LD, sitemap, robots
- **Accessible** — semantic forms, labels, ARIA, focus styles, reduced-motion support

## File structure
```
index.html                        # hub landing (14 cards + SEO content)
<name>-calculator.html / .html    # 14 calculator pages
css/style.css                      # responsive + dark-mode + components
js/main.js                         # engine: registry, charts, currency, theme, PWA reg
sw.js                              # offline service worker
manifest.webmanifest               # PWA manifest
icon.svg                           # app icon
sitemap.xml / robots.txt           # SEO
404.html                           # friendly not-found page
```

## Deploy free (GitHub Pages) with custom domain
The custom domain `thecalculatorhub.co.uk` is already wired into every canonical URL, the sitemap, `robots.txt`, and the `SITE_DOMAIN` constant in `js/integrations.js`. The `CNAME` file is included.

1. Create a free GitHub account, then a **public** repo named `calculator-hub`.
2. Upload every file in this folder to the repo (including the `CNAME` file — GitHub reads it to know the custom domain).
3. Settings → Pages → Source: Deploy from branch → `main` / root → Save.
4. Set DNS at your domain registrar (generic steps, works on GoDaddy/Google Domains/123-reg/any):
   - **A records** (apex `thecalculatorhub.co.uk`) pointing at GitHub Pages IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - **CNAME record** `www` → `IanT-IT-DEV.github.io` (so `www.thecalculatorhub.co.uk` redirects to the apex).
5. Back in the repo: Settings → Pages → Custom domain → type `thecalculatorhub.co.uk` → Save → tick "Enforce HTTPS" once the certificate provisions (GitHub issues a free Let's Encrypt cert, ~5–15 min after DNS resolves).
6. Live at `https://thecalculatorhub.co.uk/` once DNS propagates (can be near-instant or up to ~24h).
7. Verify sitemap: `https://thecalculatorhub.co.uk/sitemap.xml`.
8. Add the site to Google Search Console and request indexing of every page.

> The service worker only activates on `http(s)`, so it runs on GitHub Pages but is skipped when previewing from `file://`.
> Note for `.co.uk`: the registry may enforce DNS through their approved nameservers — set the A records at whatever DNS panel your registrar exposes. If unsure, you can transfer nameservers to Cloudflare (free) for faster DNS + free CDN + DDoS protection.

## Test locally
Open `index.html` in any browser. Each calculator auto-runs on load and updates live as you change inputs. Try: switch currency in the header, toggle the theme (◐), open the nav menu (☰), click Share on any calculator and paste the URL into a new tab — the inputs restore.

## Monetize (autonomous income) — in order of how fast traffic unlocks it
1. **Affiliate links** (fastest to start earning) — add contextual links inside the "content" sections: high-yield savings referrals, brokerage sign-up bonuses, budgeting apps. Disclose affiliates in the footer.
2. **Google AdSense** (passive once approved) — needs real content + traffic. Submit to Search Console first; apply once you have meaningful visitors. Paste ad units into the existing `result` blocks and any `.content` section.
3. **Donations** — add a "Buy me a coffee" link in the footer. Zero friction, low but non-zero income.

## Grow traffic (the real work — passive income needs visitors)
- **Add more calculators** — each targets new long-tail queries. Good next targets: paycheck/take-home, net worth, inflation, discounted cash flow, breakeven, investment fee drag, credit utilization, auto loan.
- **Expand the explainer content** on each page to 400–700 words answering real search questions.
- **Backlinks** — submit to free directories, answer finance/health questions on Reddit/Quora linking to the relevant calculator.
- **Search Console** — watch which queries you get impressions for, then build pages targeting actual demand.
- **Keep it fast** — the site is already static and small; page speed and mobile-friendliness are ranking factors.

## Realistic timeline (honest)
- Day 1: deployed, indexed.
- Weeks 1–4: Search Console shows impressions on long-tail; few clicks.
- Months 2–4: persistent traffic starts for low-competition queries if you keep adding pages.
- AdSense approval + first pennies: typically a few months in, once traffic is meaningful.
- Passive income scales with traffic volume — it compounds, not explodes.

This is a slow-and-steady, genuinely passive channel. It costs nothing to run and lasts indefinitely once built, which is its main advantage.

## Disclaimer
Educational tool. Calculator results are estimates and are not financial or medical advice.