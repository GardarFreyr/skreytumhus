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

## Layout regression check

`npm run check:layout` runs `scripts/layout-check.mjs` (puppeteer-core + local Chrome) against `vite preview` on port 4173 (override with `BASE_URL`, `WIDTHS`, `ROUTES`). At 390, 768, 1024, 1440 and 1920px it fails on: empty hero space or a title below the first viewport, caption text outside the photo scrim, uneven card rows, large blank gaps, clipped text, horizontal overflow, broken or non-`cover` images, and CLS ≥ 0.1. Screenshots and `report.json` go to `layout-report/` (git-ignored).

## Topic directory (Efnisorð)

`/efnisord` lists every non-empty WordPress category and tag, fetched at runtime from the REST API (`src/lib/terms.ts`). A category and a tag with the same name, such as "Jól", become one topic. Its page `/efni/<key>` requests posts in *either* term (`tax_relation=OR`), so the article counts and relationships are WordPress's own. In counts, "399+" marks a merged topic: the number is the larger of its terms, and the topic page shows the exact total. Search is partial and case-insensitive. If you type without accents, it matches accented names too ("jol" finds "Jól"). If you type with accents, it matches them exactly. Groups and popular topics in `src/data/termGroups.ts` only *arrange* existing terms. A key that doesn't exist in WordPress is simply not shown.

The compact finder sits at the top of `/greinar`. It is linked from the homepage archive band, the footer and site search, which also shows matching topics.

## Article galleries

Consecutive image blocks in a post form one gallery (`ArticleBody.tsx`). Rows are fixed per breakpoint by `galleryLayout.ts`:

- **Desktop:** 2–3 images per row. 4 → 2+2, 5 → 3+2, 7 → 3+2+2, 10 → 3+3+2+2.
- **Tablet:** rows of 2; an odd total ends on a row of 3.
- **Mobile:** one image per row.

Each image's width is proportional to its own aspect ratio, so the images in a row share one height and are not cropped. `npm run check:gallery` verifies this on real posts (3, 4, 5, 7, 10 and 11-image galleries) and also tests the topic search with Icelandic words.

## Page loading after deploys

Pages are split into lazily loaded chunks with hashed names, and every deploy replaces them. A tab opened before a deploy would otherwise request chunks that no longer exist, giving "Failed to fetch dynamically imported module". Four things guard against that:

- **Real 404s for missing assets:** `netlify.toml` returns a real 404 for missing `/assets/*` files instead of `index.html`. `index.html` itself is never cached.
- **Preloading:** `src/lib/lazyPage.ts` preloads every page chunk (~45 KB in total) once the browser is idle, so an open tab already holds every page.
- **Retry and reload:** if a chunk still fails, it is retried once, then the page reloads once to pick up the new version. A 30-second guard in `sessionStorage` prevents reload loops. `vite:preloadError` is handled the same way.
- **Error boundary:** `RouteError` catches anything left over and keeps the header and footer. It offers "Endurhlaða" and "Á forsíðu".

`npm run check:routes` loads every route directly and through the menu, and simulates a stale tab after a deploy.

## Instagram feed (@skreytum_hus)

The homepage section "Fylgstu með á Instagram" shows the 6 newest posts, or 4 when fewer are available, so the grid never has a lone tile. Each post links to the original on Instagram. Until the feed is connected, the section shows only the heading and the "Fylgja @skreytum_hus" button. It never shows invented posts or stand-in images.

**How it works.** The feed uses Meta's official *Instagram API with Instagram Login*, which is free. All of this runs server-side in Netlify Functions, so the access token never reaches the browser.

- `netlify/functions/instagram.mts`
  - `/api/instagram` returns the feed as JSON.
  - `/api/instagram/img/:id` returns each post's image from our own copy. Instagram's own image links expire, so the images are copied into Netlify Blobs.
- `netlify/functions/instagram-refresh.mts` runs every hour. It fetches new posts and renews the token when it is more than 7 days old. Tokens expire after 60 days, so regular renewal keeps the feed connected.
- **Caching:** the feed is kept for 30 minutes on the server and the Netlify CDN. The last successful feed is kept indefinitely in Netlify Blobs.
- **When Instagram fails:** if the API errors or the token has expired, the last successful posts keep showing, with `status: "stale"`. With nothing saved yet, the section shows only the profile link.
- `npm run test:instagram` tests these rules against a mocked API.

**What Soffía needs to connect (one time):**
1. @skreytum_hus must be a *professional* Instagram account (Creator or Business). Switching is free: Settings → Account type and tools.
2. Create a Meta developer app at developers.facebook.com:
   - app type **Business**;
   - add the **Instagram** product, then choose **API setup with Instagram login**;
   - under **Roles**, add @skreytum_hus as an **Instagram Tester**, then accept the invitation in the Instagram app or website.
3. In the app's Instagram API setup, click **Generate token** next to @skreytum_hus and sign in as Soffía. Copy the long-lived token.
4. In Netlify, go to Site configuration → Environment variables. Add `INSTAGRAM_ACCESS_TOKEN` with the token, scoped to Functions, then redeploy.

After the redeploy, `https://skreytumhus.netlify.app/api/instagram` should return `"status":"ok"` with her posts. From then on, the feed updates and renews its token by itself.

## Article likes (♥)

Every article has a heart button, in the header next to the reading time and again at the end above the share buttons. Visitors don't need to log in.

- **Why not WordPress?** skreytumhus.is has no likes plugin or likes API. Its REST API offers only `wp/v2`, Akismet, BackWPup and WordPress Popular Posts (page views, not likes), so likes are stored here instead. WordPress is not modified.
- **Storage:** `netlify/functions/likes.mts` (`GET`/`POST /api/likes/:postId`) stores likes in Netlify Blobs (store `likes`, strong consistency). They are shared across all visitors and devices. No extra service, account or credential is needed.
- **Article ID:** the stable WordPress post ID. The ID is accepted only after WordPress confirms that it is a published post.
- **One like per visitor:** each visitor gets a random ID in an HttpOnly cookie. A like is stored as one record per visitor and article, so double-clicks and repeated requests never raise the count. The count shown is always the number of stored likes; nothing is invented. Clicking again removes the like.
- **Abuse protection:**
  - At most 6 likes per article from one IP address (several people at home can still like), and at most 60 changes per hour from one IP.
  - Requests from other websites are refused.
  - IP addresses are stored only as salted hashes.
- If the service can't be reached, the button is hidden rather than showing a wrong number.
- `npm run test:likes` tests the rules against a mock store. `BASE_URL=https://skreytumhus.netlify.app npm run check:likes` tests the real thing in two separate browsers and removes its test likes afterwards.

## Footer logo

The footer uses `public/brand/logo-white.(webp|png)`, a transparent all-white version of the original logo, including the script "Skreytum", the serif "Hús" and the hearts. It was extracted from the owner's white logo file by keeping only the white lettering, without the dark glow. It is 1335 px wide, so it stays sharp on retina screens. `npm run check:footer` checks it at 390, 768, 1440 and 1920 px.

## "Fara efst" (floating)

A round button with an up arrow, horizontally centred near the bottom of the screen: 50 px on phones and tablets, 58 px from 1024 px up. It is the only back-to-top button on the site.
- It appears after about 400 px of scrolling and stays while you scroll. It scrolls smoothly to the top, or jumps when the visitor prefers reduced motion.
- **It never blocks anything.** It hides while an ad or a small control (link, button, form field) would be under it, and while the image viewer or the mobile menu is open. It may sit over a corner of large clickable areas, such as gallery photos and article cards, which stay usable. There is no cookie notice on the site.

## Previous / next article

At the end of every article, "← Fyrri grein" and "Næsta grein →" link to the actual adjacent WordPress posts by publication date, using `before=` and `after=` REST queries. Posts published in the same second (two pairs exist) are ordered by post ID, so none is skipped. Each link shows the title, the date and a thumbnail when the post has one.
- Two columns on desktop, stacked on mobile. A direction with no post (the oldest or newest article) is not shown.
- `npm run check:nav` compares the links with WordPress directly, opens them, reloads, checks the oldest and newest posts, and tests the floating button at 390, 768, 1440 and 1920 px.
