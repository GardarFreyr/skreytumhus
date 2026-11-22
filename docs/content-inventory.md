# Content & structure inventory — skreytumhus.is

Audited November 2026 via the public, read-only WordPress REST API (`https://www.skreytumhus.is/?rest_route=/wp/v2/…`). `/wp-json/` is blocked by the host's mod_security and returns HTML/406. Requests via `?rest_route=` work with CORS. Nothing was written to the site.

## Volume

| Type | Count | Notes |
|---|---|---|
| Posts | 3 169 | Sept 2010 → present, ~2–4 per week recently |
| Pages | ~20 | Um mig (10), Herbergisbreytingar (3648), Sjónvarpsþættirnir (68503), Umfjöllun (3239), Sérkjör (35297) and others |
| Author | 1 | “Soffia – Skreytum Hús…” |
| Media | tens of thousands | Featured images on nearly all posts; WP generates 300–2048 px sizes for most, but not all |

## Categories in use (grouped into 5 demo topics)

| Demo topic | WordPress categories (ID) |
|---|---|
| Heimili og innblástur | Mitt heimili 102, Innlit 139, Innblástur 130, Heimili 192 (+ Stofur 136, Eldhús 149, Svefnherbergi 131 as filters) |
| Herbergisbreytingar | Fyrir/eftir 109, Breytingar 111, barnaherbergi 116, Stelpuherbergi 115, Strákaherbergi 121, Eldhús Breytingar 142 |
| Skreytingar og DIY | DIY 104, Skreytingar 105, Borðskreytingar 132, Ör-próject 168, Endurvinnslan 140 |
| Blóm og árstíðir | Blóm 123, Jól 150, Páskar 103, Haust 191, Kransar 153, Aðventukransar 219 |
| Lífsstíll | Fjölskyldan 156, Ferðir 162, Pælingar 107, Veislur 128, Afmæli 125 |
| (TV) | SkreytumHúsTv 398, TV-show 159 |
| (Disclosure) | Samstarf 293, AD 448; tags samstarf 305, AD 449 → shown as a “Samstarf” badge |

The grouping is an editorial proposal for navigation only. Every original category stays reachable at `/flokkur/:slug`.

## Verified facts used in the design

| Fact | Source |
|---|---|
| Name Soffía Dögg Garðarsdóttir, nickname Dossa, floristry background, blog started Sept 2010 | “Um mig” page (ID 10) |
| E-mail soffia@skreytumhus.is | Confirmed by the site owner, Nov 2026 (replaces the older address on the Herbergisbreytingar page, ID 3648) |
| Instagram @skreytum_hus | Reels Soffía links as her own from posts 95235 (“reel á Instagram með þessum vasa”) and 96003 (lamp video) are published by @skreytum_hus |
| Quote “Ég hef verið að taka það að mér að breyta herbergjum…” | Page 3648 |
| 26 archived makeover projects, in Soffía's own order | Links on page 3648 → `src/data/projects.ts` |
| Before/after pair | Post 93421 “Kózý – fyrir og eftir…”; both photos and the quote come from that post |
| TV: 5 seasons × 6 episodes + 4 DIY clips, with Vísir links | Individual episode posts (category 398) → `src/data/tv.ts` |
| Portrait photo | Media library, used on the original site |

## Not found / not used

- **Social media links:** none in the theme, menus or pages, so none are shown.
- **Testimonials, client logos, press quotes:** not shown. Umfjöllun (3239) is linked to, not reproduced.
- **Newsletter / shop:** none exist, so none were added.
- **Sérkjör (35297):** discount codes with partners. Not reproduced because the offers may be outdated. Can be added once confirmed.

## URL patterns on the live site

- Posts: `/?p=ID` and pretty permalinks `/<slug>/` (both seen in content)
- Categories: `/?cat=ID`, `/category/<slug>/`
- Pages: `/?page_id=ID`
- Search: `/?s=term`
- Uploads: `/wp-content/uploads/YYYY/MM/<file>`

The demo rewrites links inside posts: `?p=` → `/p/ID` → `/greinar/slug`, `?cat=` → `/flokkur/id/ID`, known `page_id`s → the matching page, and `?s=` → `/leit`.
