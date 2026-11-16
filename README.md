# Arroyo Docs

This repo contains the source code to documentation website (https://doc.arroyo.dev) for [Arroyo](https://arroyo.dev).
Docs are developed as mdx (Markdown with embedded components).

We welcome contributions and fixes! Just open a PR.

## Doc development

We use [Nimbus](https://nimbus-docs.com/), an [Astro](https://astro.build/)-based
docs framework, for our docs. The live website is automatically rebuilt on every
merge to this repo.

Pages live in `src/content/docs/`; the sidebar is configured in `astro.config.ts`.
Shared snippets live in `src/content/partials/` and are included with
`<Render file="..." />`. Components like `<Aside>`, `<Tabs>` and `<TabItem>` are
available in every page without an import (see `src/components.ts`).

The REST API reference at `/api` is generated from `api-spec.json`, which
`scripts/transform-openapi.js` flattens into `src/api/openapi.json` before every
`dev` and `build`.

Docs require Node 22.23.4 or later (`nvm use` picks up `.nvmrc`), and can be developed locally:

```bash
$ pnpm install
$ pnpm run dev
```

or built statically and previewed with

```bash
$ pnpm run build
$ pnpm run preview
```

Check for broken links and other authoring mistakes with

```bash
$ pnpm run lint:docs
```
