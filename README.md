# Skreytum Hús — redesign demo

A multi-page React redesign of [skreytumhus.is](https://www.skreytumhus.is/) built as a **demo for Soffía Dögg Garðarsdóttir**. Every post, photo and quote you see is loaded live, read-only, from the existing WordPress site. Nothing is invented, and nothing on the live site is changed.

> **Status: demo.** It does not replace the live site, is configured to stay out of search engines, and has known limitations (see below).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ on http://localhost:4173
npm run lint
```

Node 20+ (Netlify config pins 22).

## Routes

| Route | Page |
|---|---|
| `/` | Forsíða — hero, latest posts, topics, before/after, Soffía, TV, archive |
| `/greinar` | All 3 000+ posts: topic chips, year filter (`?ar=2015`), pagination (`?sida=3`) |
| `/flokkur/:slug`, `/flokkur/id/:id` | Topic (grouped categories) or any WordPress category |
| `/greinar/:slug` | Article: sanitized WP content, image galleries + lightbox, share, tags, related |
| `/innblastur` | Visual discovery grid, category filters (`?flokkur=139`), load-more |
| `/herbergisbreytingar`, `/herbergisbreytingar/:slug` | Room makeovers: verified before/after slider, recent and archived projects |
| `/tv` | All five TV seasons + DIY clips, linking to Vísir |
| `/um-mig` | Biography (original text from the WP “Um mig” page) |
| `/samband` | Contact via e-mail (mailto) |
| `/leit?q=` | Full-text search across the archive (WordPress search) |
| `/p/:id` | Legacy `?p=ID` links → redirect to `/greinar/:slug` |
| `*` | 404 |

## Stack

Vite 6 · React 19 · TypeScript · Tailwind CSS v4 (`@theme` design tokens in `src/index.css`) · React Router 7 (lazy routes) · DOMPurify · lucide-react · self-hosted fonts (Cormorant Garamond, DM Sans).

```
src/
  lib/          wp.ts (read-only REST adapter), html.ts (sanitize/rewrite), seo.ts, format.ts, useAsync.ts
  data/         verified static data: site, taxonomy (topics → WP category IDs), tv, projects
  features/     article hooks (list, single, related)
  components/   layout/ (Header, Footer, Wordmark), editorial/ (cards, grid, ArticleBody, Lightbox, BeforeAfter, ShareBar), ui/
  pages/        one file per route
docs/           content inventory, architecture decision, WordPress migration plan
```

## Deploying a preview (Netlify)

`netlify.toml` is ready: build `npm run build`, publish `dist`, SPA fallback, and `X-Robots-Tag: noindex, nofollow` on every response.

1. In Netlify: **Add new site → Import from Git →** this repo, branch `react-site`.
2. Accept the detected settings and deploy. You get a `*.netlify.app` URL.
3. **Do not** attach the `skreytumhus.is` domain. The production domain stays on WordPress.

## How the demo avoids competing with the live site

- `<meta name="robots" content="noindex, nofollow">` in `index.html`
- `public/robots.txt` → `Disallow: /`
- `X-Robots-Tag: noindex, nofollow` header (Netlify)
- Each article's `<link rel="canonical">` points to the original post on skreytumhus.is

## Verified vs. not verified

**Measured.** Lighthouse 12.6, production build on `vite preview`, 20 Nov 2026:

| Page | Perf (mobile / desktop) | A11y | Best practices | SEO* |
|---|---|---|---|---|
| `/` | 76 / 90 | 100 / 98 | 100 | 69 |
| `/greinar/kozy-fyrir-og-eftir` | 78 / 94 | 100 | 100 | 69 |

\*SEO is 69 **on purpose**: the only failing audit is “page is blocked from indexing” (the demo's noindex). The 98 accessibility score had two issues, heading order and the logo's accessible name; both were fixed afterwards but not re-measured.

Mobile performance misses the ≥90 target. LCP is about 5.2 s on simulated slow 4G, and the cause is architectural. The page must load JS, then call the WordPress API about 1 s later, then load the image. WordPress also serves un-optimized JPEGs with no WebP, and some posts have no resized versions. The production architecture in `docs/architecture.md` (static generation plus an image CDN) removes the API round-trip and is the fix. It is not done in this demo.

**Browser-tested** (in-app Chromium, 1440px and 375px):
- 15 routes: no broken images, no horizontal overflow, no console errors
- Mobile menu
- Legacy redirect
- Search with results and with no results
- 404
- Before/after slider (pointer + keyboard)
- Lightbox (keys and counter)
- Icelandic dates

**Not tested:** Safari/Firefox, real devices, screen readers (VoiceOver/NVDA), 1920px+ visual QA, and the Netlify deployment itself (no credentials were available).

## Known limitations

- **Runtime dependency on the live WordPress API.** If skreytumhus.is is down or blocks cross-origin requests, the demo shows error states with a retry button.
- **No social links.** None could be verified on the current site, so the footer has none. Add them in `src/data/site.ts → social` once Soffía confirms the URLs.
- **Contact is mailto only.** No form backend is configured, so the form opens the visitor's e-mail app, and the page says so. There is no fake success message. See `docs/architecture.md` for wiring up a real form.
- **TV episodes are linked, not embedded.** Links are the ones Soffía published in each post. Season 5 posts link to the series page rather than individual episodes. S3E4 has no link. Playback on Vísir/Stöð 2+ (possibly subscription-only) was not verified.
- **Before/after slider uses one verified pair** (post 93421, photos from the same post). Other projects show their normal photos.
- **Article content is the original WordPress HTML**, sanitized. Old posts may contain dated formatting, external embeds that are stripped (only YouTube/Vimeo/Vísir iframes are allowed), or dead links.
- **Search is WordPress's built-in search.** Relevance is basic.
- **The archive is not imported.** It is read live, so the demo itself contains no copy of the 3 169 posts.

## Advertisements

The three advertisers in the live site's AdRotate sidebar appear here with their **original banner files**. The files are copied unchanged into `public/ads/`, and the details are in `src/data/ads.ts`. The links go exactly where the live banners point:

| Advertiser | Banner | Link |
|---|---|---|
| Slippfélagið | 200×720, rotates versions A/B/C like the live site | https://slippfelagid.is/litir-og-litakort/skreytum-hus/ |
| Húsgagnahöllin | 200×300 “jólabretti” | https://husgagnahollin.is/ |
| Dorma | 200×300 “Kosy bamboo” | https://dorma.is/ |

**Where they appear:**
- **Homepage and article pages, 1280px and wider:** a right-hand sidebar. Húsgagnahöllin and Dorma are at the top, and the Slippfélagið banner stays in view while scrolling.
- **Smaller screens:** an ad block between sections. On the homepage it comes after “Nýjustu færslurnar”; on article pages it comes after the article and before related posts.

**Labelling:** every banner is marked “Auglýsing” with the advertiser's name, sits in its own frame, and links with `rel="sponsored"` in a new tab.

**Not included:** the live sidebar also has a Skreytum Hús TV / Vísir promo. It isn't a third-party advert, and the TV page already covers the show. The banners are only 200px wide at source, so they are never shown larger than that. Clicks are not counted (the live site uses AdRotate tracking).
