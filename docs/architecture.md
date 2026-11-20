# Architecture decision

## Now: client-rendered demo on a read-only WordPress adapter

The demo is a Vite + React SPA. All content is fetched at runtime from the existing WordPress REST API through `src/lib/wp.ts`, which only makes GET requests.

**Why:** it shows the real, complete archive (3 169 posts, search, categories, years) without copying or migrating anything. It also needs no access to the WordPress admin, and it cannot affect the live site.

**Costs (accepted for a demo):**
- Content appears only after JS and an API call, so mobile LCP is about 5 s on slow 4G.
- Not crawlable without JS. This is irrelevant for a noindex demo but unacceptable in production.
- It depends on the live API being up and CORS staying open.

## Recommended for production: headless WordPress + static generation

Keep WordPress as the CMS Soffía already knows. Render the public site with **Astro** (or Next.js), pre-built to static HTML:

1. **Build time / ISR:** fetch posts via REST (or WPGraphQL) and generate `/greinar/<slug>` etc. as static HTML. Incremental rebuilds are triggered by a WP webhook on publish/update (e.g. a Netlify build hook).
2. **Reuse this codebase:** components in `src/components`, the design tokens in `src/index.css`, and the logic in `lib/html.ts` (sanitizing, link rewriting) carry over almost unchanged. Astro can render the React components directly (`@astrojs/react`), so the islands that need JS (Lightbox, BeforeAfter, mobile menu, filters) stay interactive.
3. **Images:** serve through an image CDN or Netlify Image CDN with AVIF/WebP and correct `sizes`. This is the single biggest performance win: WP serves un-optimized JPEGs today.
4. **Search:** pre-build an index (Pagefind) for instant client search, or keep proxying WordPress search.
5. **SEO:** real per-page `<title>`/meta/OG/JSON-LD in the HTML, an XML sitemap generated at build, and canonical URLs on the production domain.

Expected result: LCP < 2 s on mobile, Lighthouse ≥ 90 across the board, and no runtime dependency on WordPress for readers.

## Contact form

There is no form backend in the demo, so `/samband` builds a `mailto:` link and says so plainly. To make it a real form, use one of:
- **Netlify Forms:** add `data-netlify="true"` plus a hidden `form-name` and keep the fields. Notifications go to Soffía's e-mail. Add a honeypot.
- **A serverless function** (Netlify/Vercel) posting to a transactional mail API (Postmark, Resend), with spam protection (Turnstile).

Only show a success message after the backend confirms delivery.
