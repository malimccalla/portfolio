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

Smoke tests use the already installed Playwright package without an additional runner or E2E configuration. Start the dev server first (or point `PORTFOLIO_URL` at your local preview). If Chromium is unavailable, install it with `npx playwright install chromium`.

The scaffold uses TypeScript 7.0, which the current `astro check` command does not support. `typecheck` validates `.ts` and `.tsx`; the Astro production build validates template compilation, but is not a complete Astro-template type check. Upgrade this tooling deliberately when Astro's TypeScript 7 integration is supported. Biome currently analyzes Astro frontmatter but not template usages; narrowly scoped suppressions document those false positives.

## Customize before publishing

- **`src/data/portfolio.ts`**: replace `[Your name]`, the description, role, GitHub and LinkedIn usernames, and `your.name@example.com`. These are explicitly placeholders, not personal claims.
- **`src/components/desktop/WindowContent.tsx`**: replace bracketed biography, focus areas, learning, experience, certification, and contact details. Remove entries that do not apply. No employment or credentials are claimed.
- **Dock applications**: edit `apps` in `src/data/portfolio.ts`. Each entry needs a `title`, `category`, `summary`, and `colors`; the window body lives in `WindowContent.tsx`.

  Icons go in `public/dock/` and are referenced from the site root, so `public/dock/figma.webp` is `icon: "/dock/figma.webp"`. SVG is preferred; raster files should be at least 128px. Use lowercase, hyphenated names with the file's real extension.

  Set `tile: true` for a bare logo on a transparent background: it is inset on a rounded tile using the entry's `colors`, matching the macOS dock. Leave `tile` unset for icons that already include their own rounded-square background.

  A non-square logo is fine: the tile is always square and the logo is centred inside it. Icons must, however, fill their canvas edge to edge, or they render smaller than their neighbours. Check with `magick <file> -format "%wx%h %@\n" info:`, and crop any built-in margin: adjust the `viewBox` of an SVG (as done for `iterm2.svg`, whose source carried a drop-shadow margin), or `magick <file> -trim +repage <file>` for a raster.

  An entry with no `icon` falls back to the built-in `glyph` shapes in `src/components/desktop/Icon.tsx`, which is useful for an app whose logo you have not added yet.

  App icons are trademarks of their owners. Prefer official brand assets where a company publishes them.
- **Wallpaper**: the desktop background is the `--wallpaper` colour in `src/styles/global.css`. Swap it for a `background-image` on `.desktop` in `src/styles/desktop.css` when you have an image.
- **Projects and write-ups**: replace the sample data in `src/data/portfolio.ts`. Each card shows a title, summary, tools, security concepts, and a disabled link placeholder. Add an entry's optional `href` when a real URL is available; it becomes a working link automatically.
- **Resume**: place your actual PDF at `public/resume.pdf`, or set another URL in `profile.resume`, then set `profile.resumeReady` to `true`. Until then the primary resume action is intentionally disabled rather than linking to a missing file.
- **Brand and metadata**: edit the static welcome text in `src/pages/index.astro` and metadata in `src/layouts/Layout.astro`. Existing scaffold favicons are preserved; replace them with your own branding if desired. Add a canonical URL/social image only when the real public domain and image exist.
- **No-JavaScript overview**: keep the fallback in `src/pages/index.astro` consistent when editing biographical content; project/write-up summaries and profile links already share the data model.

All outward profile links are labeled as template values in the windows. GitHub and LinkedIn open in a new tab; email uses a `mailto:` link. Window state is intentionally session-local and is not persisted across a reload.

## Structure and interactions

- Astro owns the page shell, metadata, static welcome content, and no-JavaScript overview.
- `Desktop` is a single server-rendered React island hydrated with `client:load` because the workspace needs to respond immediately.
- `windowManager.ts` centralizes typed open/minimize/close/focus state. Array order controls stacking, with one instance per section.
- `MenuBar`, `DesktopIcon`, `DesktopWindow`, `Dock`, and `WindowContent` provide reusable UI. Local SVGs avoid an icon dependency.
- Desktop folders stack vertically in the top-right corner and wrap into new columns to the left when the viewport is short, like Finder.
- Windows use macOS traffic-light controls (close, minimize, zoom). Drag a window by its title bar (clamped to the desktop) or double-click the title bar to zoom. CSS keeps windows inside the desktop above the dock, including short viewports. There is no resizing.
- The dock magnifies icons under the mouse, shows tooltips, and marks running apps with a dot. Section windows that are open appear after the dock separator.
- Mouse: click a folder to select it, double-click to open. Touch/pen: tap once. Keyboard/assistive technology: activate the native button with Enter or Space.
- Opening/restoring focuses the window title. Closing/minimizing focuses the next visible window or the originating desktop icon. Escape closes the focused window, not a window while focus is elsewhere.
- Window controls and dock items remain keyboard-accessible. Clicking the active window's dock item minimizes it; another item opens, restores, or raises its window.
- At widths of 700px or less (or short touch-device landscape viewports), only the active window is visible, with the desktop behind it inert. Other open windows stay accessible through the horizontally scrollable dock. Minimized windows retain their content and scroll position.
- Reduced-motion preferences remove window animations and dock magnification. The clock uses the visitor's local time and updates automatically.

Component tests cover all icons and content sections, mouse and keyboard activation, focus movement, close/minimize/restore, stacking, unique instances, mobile switching, dock interest apps, folder selection, window zoom, resume availability, and clock cleanup. Browser smoke checks exercise real Enter/Space behavior, touch taps, viewport constraints, hydration errors, and the no-JavaScript overview.

## Cloudflare Pages

Keep the existing static Astro output: no Cloudflare adapter is needed for these pages. In Cloudflare Pages set:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22.12 or newer

The installed Cloudflare packages are left unchanged for future use. Do not add server output or an adapter unless the site's requirements change.
