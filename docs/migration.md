# WordPress migration plan (if the redesign goes live)

Nothing here has been executed. It is the plan for moving from the current WordPress theme to the new front end **without losing the archive or search rankings**.

## 1. Keep WordPress, change the front end

- WordPress stays the editing tool, moved to e.g. `cms.skreytumhus.is` (or kept on the same host behind basic auth / noindex).
- The new static front end takes over `www.skreytumhus.is`.
- Nothing is exported or re-imported: posts, media and categories stay in the WP database. The front end reads them at build time.

## 2. URL inventory and redirects (301)

Generate the full map from the API at build time (all 3 169 posts and every category), never by hand:

| Old URL | New URL |
|---|---|
| `/?p=<id>` | `/greinar/<slug>` |
| `/<slug>/` (pretty permalink) | `/greinar/<slug>` |
| `/category/<slug>/`, `/?cat=<id>` | `/flokkur/<slug>` |
| `/?page_id=10` | `/um-mig` |
| `/?page_id=3648` | `/herbergisbreytingar` |
| `/?page_id=68503` | `/tv` |
| `/?s=<q>` | `/leit?q=<q>` |
| `/page/<n>/` | `/greinar?sida=<n>` |
| `/wp-content/uploads/*` | proxy or keep serving from WP (old images are hot-linked from Pinterest etc.) |

Emit these as Netlify `_redirects` with status 301. The demo already handles `?p=` and `/p/:id` client-side as a fallback.

## 3. SEO checklist at launch

- Remove the demo's noindex meta, `robots.txt` Disallow and `X-Robots-Tag` header.
- Canonical URLs → `https://www.skreytumhus.is/greinar/<slug>` (currently they point to the old `?p=` URLs).
- XML sitemap(s) generated at build: split by year (`sitemap-2010.xml` … `sitemap-2026.xml`) + pages + categories, referenced from `robots.txt`.
- Keep titles and slugs identical to WordPress.
- Submit the new sitemap in Google Search Console and watch Coverage for 404s during the first weeks.
- JSON-LD: `BlogPosting` per article and `Person` (Soffía) on Um mig are already implemented. Add `BreadcrumbList`.

## 4. Content clean-up (optional, gradual)

- Old posts contain Facebook emoji images (replaced with text already), inline styles, and dead embeds. The sanitizer handles these at render time. Editing posts in WP is not required.
- Some older images lack generated sizes. Run “Regenerate Thumbnails” in WP, or rely on the image CDN.
- Decide whether the “Sérkjör” discount page should return. It is not in the new navigation.

## 5. Rollback

Because WordPress keeps rendering its own theme until the DNS/host switch, rollback means pointing the domain back. Keep the old theme active on the CMS host for at least a month.
