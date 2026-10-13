# Fieldwork · Cybersecurity portfolio

A static Astro portfolio with a macOS-inspired React desktop (menu bar, desktop folders, windows, and a dock). No server, database, authentication, analytics, or external fonts are required.

## Develop and validate

Use Node **22.12+** and npm.

```sh
npm install
npm run dev -- --background
npx astro dev status
npx astro dev logs
npx astro dev stop
```

| Command | Purpose |
| --- | --- |
| `npm run lint` | Repository Biome checks |
| `npm run format` | Biome formatting |
| `npm run typecheck` | Generate Astro types and check TypeScript/React |
| `npm test` | Vitest + Testing Library component tests |
| `npm run test:smoke` | Chromium desktop, mobile, and no-JavaScript smoke checks against a running site |
| `npm run build` | Produce the static site in `dist/` |
| `npm run preview` | Serve the production build |

Smoke tests use the already installed Playwright package without an additional runner or E2E configuration. They can run against the dev server, but a production preview is recommended: Astro's development toolbar can overlap mobile dock controls and intercept taps. Run `npm run build`, start `npm run preview -- --port 4323` in a separate terminal, then run `PORTFOLIO_URL=http://localhost:4323 npm run test:smoke`. If Chromium is unavailable, install it with `npx playwright install chromium`.

The scaffold uses TypeScript 7.0, which the current `astro check` command does not support. `typecheck` validates `.ts` and `.tsx`; the Astro production build validates template compilation, but is not a complete Astro-template type check. Upgrade this tooling deliberately when Astro's TypeScript 7 integration is supported. Biome currently analyzes Astro frontmatter but not template usages; narrowly scoped suppressions document those false positives.

## Customize before publishing

- **Profile**: edit `src/content/profile/main.md` frontmatter for your name, role, site description, email, social URLs, location, and resume settings. The desktop welcome, page metadata, and contact links all use this single source.
- **Window content**: edit `src/content/windows/*.md` for biography, introductions, resume summary, contact text, and dock app descriptions. These are plain Markdown files: use headings, paragraphs, lists, images, links, and code without importing components. Astro adds the styled profile, links, entry cards, and resume controls around the Markdown. The optional `lead` frontmatter field renders the large opening line. Set `template: false` after replacing a window's placeholders to remove its template notice.
- **Dock applications**: edit `apps` in `src/data/portfolio.ts` for titles, categories, icons, and colors; descriptions live in `src/content/windows/app-*.md`. For a new app, add its Markdown file and a named `WindowSection` slot in `src/pages/index.astro` (for example, `slot="vscode"` with `id="app-vscode"`). The slot name is the ID without `app-`.

  Icons go in `public/dock/` and are referenced from the site root, so `public/dock/figma.webp` is `icon: "/dock/figma.webp"`. SVG is preferred; raster files should be at least 128px. Use lowercase, hyphenated names with the file's real extension.

  Set `tile: true` for a bare logo on a transparent background: it is inset on a rounded tile using the entry's `colors`, matching the macOS dock. Leave `tile` unset for icons that already include their own rounded-square background.

  A non-square logo is fine: the tile is always square and the logo is centred inside it. Icons must, however, fill their canvas edge to edge, or they render smaller than their neighbours. Check with `magick <file> -format "%wx%h %@\n" info:`, and crop any built-in margin: adjust the `viewBox` of an SVG (as done for `iterm2.svg`, whose source carried a drop-shadow margin), or `magick <file> -trim +repage <file>` for a raster.

  An entry with no `icon` falls back to the built-in `glyph` shapes in `src/components/desktop/Icon.tsx`, which is useful for an app whose logo you have not added yet.

  App icons are trademarks of their owners. Prefer official brand assets where a company publishes them.
- **Wallpaper**: the desktop background is the `--wallpaper` colour in `src/styles/global.css`. Swap it for a `background-image` on `.desktop` in `src/styles/desktop.css` when you have an image.
- **Projects, write-ups, experience, and certifications**: add, edit, or remove `.md` files in the corresponding `src/content/` folders. New files automatically appear as cards; no React edits are needed. Frontmatter supports `title` (required), `order` (ascending, defaults to 0), `eyebrow`, `summary`, `tools`, `concepts`, `linkLabel`, and `href`. Ties are ordered by file ID. The Markdown body appears inside the card. A `linkLabel` without `href` renders a disabled placeholder; add an HTTP(S) `href` to enable the link. Remove example entries that do not apply. No employment or credentials are claimed.
- **Resume**: place your actual PDF at `public/resume.pdf`, or set another URL in the profile Markdown's `resume` field, then set `resumeReady: true`. Until then the primary resume action is intentionally disabled rather than linking to a missing file.
- **Brand and metadata**: the name and description come from the profile Markdown. Desktop chrome and folder definitions remain in `src/data/portfolio.ts`; styling stays in `src/styles/`. Existing scaffold favicons are preserved; replace them with your own branding if desired. Add a canonical URL/social image only when the real public domain and image exist.
- **No-JavaScript overview**: automatically renders the same Markdown windows and cards. You do not need to maintain a second copy of the content.

Example project (`src/content/projects/my-project.md`):

```markdown
---
title: Home Security Lab
order: 3
summary: A lab for practising network monitoring.
tools: [Wireshark, Linux]
concepts: [Network segmentation, Traffic analysis]
linkLabel: Project repository
href: https://github.com/YOUR_USERNAME/your-project
---

## What I built

Describe your approach here.

## What I learned

- A finding supported by evidence.
- A defensive takeaway.
```

Content collections validate frontmatter during development/build. Markdown content cannot import or execute components, which keeps editing simple and content-focused. Changes update in the dev server; rebuild/redeploy to publish them. Keep desktop window actions and reusable presentation in the existing React and Astro components.

All outward profile links are labeled as template values in the windows. GitHub and LinkedIn open in a new tab; email uses a `mailto:` link. Window state is intentionally session-local and is not persisted across a reload.

## Structure and interactions

- Astro owns the page shell, metadata, Markdown content collections, static welcome content, and no-JavaScript overview.
- `Desktop` is a single server-rendered React island hydrated with `client:load` because the workspace needs to respond immediately.
- `windowManager.ts` centralizes typed open/minimize/close/focus state. Array order controls stacking, with one instance per section.
- `MenuBar`, `DesktopIcon`, `DesktopWindow`, and `Dock` provide reusable UI. Astro renders Markdown into named slots for the React desktop; `WindowContent` places the matching slot in a window and retains the interactive resume shortcut. Local SVGs avoid an icon dependency.
- Desktop folders stack vertically in the top-right corner and wrap into new columns to the left when the viewport is short, like Finder.
- Windows use macOS traffic-light controls (close, minimize, zoom). Drag a window by its title bar (clamped to the desktop) or double-click the title bar to zoom. CSS keeps windows inside the desktop above the dock, including short viewports. There is no resizing.
- The dock magnifies icons under the mouse, shows tooltips, and marks running apps with a dot. Section windows that are open appear after the dock separator.
- Mouse: click a folder to select it, double-click to open. Touch/pen: tap once. Keyboard/assistive technology: activate the native button with Enter or Space.
- Opening/restoring focuses the window title. Closing/minimizing focuses the next visible window or the originating desktop icon. Escape closes the focused window, not a window while focus is elsewhere.
- Window controls and dock items remain keyboard-accessible. Clicking the active window's dock item minimizes it; another item opens, restores, or raises its window.
- At widths of 700px or less (or short touch-device landscape viewports), only the active window is visible, with the desktop behind it inert. Other open windows stay accessible through the horizontally scrollable dock. Minimized windows retain their content and scroll position.
- Reduced-motion preferences remove window animations and dock magnification. The clock uses the visitor's local time and updates automatically.

Component tests cover all icons and content slots, mouse and keyboard activation, focus movement, close/minimize/restore, stacking, unique instances, mobile switching, dock interest apps, folder selection, window zoom, resume navigation, missing-content errors, and clock cleanup. Browser smoke checks exercise actual Markdown window/card rendering, shared profile data, disabled placeholder links/resume, real Enter/Space behavior, touch taps, viewport constraints, hydration errors, and the shared no-JavaScript content.

## Cloudflare Pages

Keep the existing static Astro output: no Cloudflare adapter is needed for these pages. In Cloudflare Pages set:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22.12 or newer

The installed Cloudflare packages are left unchanged for future use. Do not add server output or an adapter unless the site's requirements change.
