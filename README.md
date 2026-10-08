# MORPH

**A Chrome extension that rearranges any portfolio website for what you're looking for.**

Every portfolio shows the same page to everyone, whether you're hiring, looking for a freelancer, or checking out someone's design work. MORPH reads a portfolio's sections, asks an AI how a recruiter, client, or designer would want them ordered, and animates the page into that order. It never edits a site's content. It only reorders, dims, and highlights what is already there.

Live backend and demo site: https://morph-inky.vercel.app

## What it does

Click the extension, pick who you are, and the page rearranges itself.

| You pick | You see first |
|---|---|
| I'm hiring | Skills, experience, projects, resume |
| I need a freelancer | Services, testimonials, process, contact |
| I'm a designer | Case studies, visuals, process |

The best matches get a purple bar, the least relevant sections are dimmed, and a small pill explains why the AI chose this order. **Show original** restores the page.

## How it works

```
  Portfolio page (any site)
        |  click MORPH, pick a persona
        v
  Extension (extension/morph.js)
    1. find the page's sections
    2. collect each heading + a short text snippet
        |
        v   POST /api/reorder
  Brain (Next.js on Vercel, app/api/reorder)
    3. LLM proposes an order + which sections to dim
    4. server validates it (every section once, intro stays first)
        |
        v
  Extension
    5. animate sections into the new order
    6. show the "why" pill with a Show original button
```

If the brain is unreachable, the extension falls back to local keyword scoring, so it still does something.

**Finding sections.** MORPH first looks for in-page nav links (`#about`, `#projects`) and uses the sections they point to. If that fails, it looks for the container with the most large, stacked blocks.

## What's in this repo

This repo holds two parts that share one brain.

**1. The Chrome extension (`extension/`)** is the product. It is a Manifest V3 extension with a popup and a content script, and it only runs when you click it (`activeTab`).

**2. The web app (`app/`)** is the backend plus a demo site:
- `/api/reorder` is the brain for the extension.
- The home page is a demo of the same idea from the **site owner's** side. It picks a layout for each visitor:
  - an instant rule-based layout from the referrer and UTM source
  - an AI refinement about 3 seconds later, from coarse signals (source, screen size, scroll depth)
  - a learning loop that chooses between the AI's layout, a preset, and the default by click-through rate, exploring a random one 20% of the time
- `/dashboard` shows views, clicks, conversion per layout, and the AI's reasoning log.

```
app/
  page.tsx               demo site (renders <Morph />)
  dashboard/page.tsx     live stats + decision log
  api/reorder/route.ts   extension brain: sections -> order
  api/morph/route.ts     site brain: signals -> layout + learning loop
  api/track/route.ts     event logging -> Supabase
components/
  Morph.tsx              renderer + "why this layout?" popover
  Tracker.tsx            view and click tracking
  blocks/                the 6 demo portfolio blocks
extension/
  manifest.json  popup.html  popup.js  morph.js
lib/store.ts             Supabase REST helper
morph/                   layout spec (zod) + block registry
```

## Tech stack

Next.js, TypeScript, Tailwind CSS, Framer Motion, zod, Supabase (Postgres), Groq (any OpenAI-compatible LLM API), Vercel, Chrome Extension Manifest V3.

## Run it yourself

**1. Web app**

```bash
git clone https://github.com/fenderricky/morph.git
cd morph
npm install
```

Create `.env.local` (it is gitignored) with:

| Variable | What it is |
|---|---|
| `LLM_API_KEY` | API key for your LLM provider (Groq by default) |
| `LLM_BASE_URL` | e.g. `https://api.groq.com/openai/v1` |
| `LLM_MODEL` | a chat model your key can use, e.g. `openai/gpt-oss-20b` |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SECRET_KEY` | your Supabase **secret** key (server-only, never the publishable key) |

Create the events table in the Supabase SQL editor:

```sql
create table events (
  id bigint generated always as identity primary key,
  t timestamptz default now(),
  type text not null,
  sid text,
  layout text not null,
  persona text,
  source text,
  reasoning text
);
alter table events enable row level security;
```

Then `npm run dev` and open http://localhost:3000. On Windows PowerShell, if scripts are blocked, use `npm.cmd` or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

To deploy, import the repo on Vercel and add the same five variables.

**2. Chrome extension**

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and select the `extension/` folder.
3. Pin MORPH, open a portfolio site, and click it.

To use your own backend, change `API` in `extension/popup.js` and `host_permissions` in `extension/manifest.json` to your deployment's URL.

## API

| Endpoint | Purpose |
|---|---|
| `POST /api/reorder` | Body: `{ persona: "recruiter" \| "client" \| "designer", sections: [{ heading, snippet }] }`. Returns `{ order, dim, reasoning }`, or `{ order: null }` on failure. |
| `POST /api/morph` | Body: coarse visitor signals. Returns a validated layout for the demo site. |
| `POST /api/track` | Logs a `view` or `convert` event for the demo site. |

`/api/reorder` is cached for 30 minutes and limited to 30 requests per IP per 10 minutes (best effort).

## Privacy

- The extension runs only when you click it. It reads section headings and the first ~200 characters of each section's text, and sends them to the brain, which passes them to the LLM provider. Nothing from the extension is stored.
- The demo site logs coarse signals only (traffic source, screen size, scroll depth), with no names, emails, or fingerprints.
- It reorders and styles existing sections only. It never changes a site's text, links, or code.

## Known limitations

- Section detection is heuristic. Unusual layouts may say "No sections found".
- Sites that re-render their own sections may undo the reorder.
- The reorder is not remembered across page reloads.
- It can't run on `chrome://` pages or the Chrome Web Store.
- The free LLM tier has rate limits.

## Status and roadmap

- [x] Demo site engine: instant rules, AI layout, learning loop, trust popover
- [x] Event tracking and live dashboard (Supabase)
- [x] Deployed on Vercel
- [x] Extension v0.2 with an AI reorder endpoint
- [ ] Test and tune section detection across many real portfolios
- [ ] Send extension usage to the dashboard
- [ ] Harden rate limiting
- [ ] Chrome Web Store listing and demo video
- [ ] Design pass on the demo site

## Author

Built by Ricky Fender ([@fenderricky](https://github.com/fenderricky)).
