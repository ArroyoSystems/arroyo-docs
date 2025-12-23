# Arroyo Docs

This repo contains the source code to documentation website (https://doc.arroyo.dev) for [Arroyo](https://arroyo.dev).
Docs are developed as mdx (Markdown with embedded React components). 

We welcome contributions and fixes! Just open a PR.

## Doc development

We use [Starlight](https://starlight.astro.build/) for our docs. The live
website is automatically rebuilt on every merge to this repo. 

Docs can be developed locally:

```bash
$ pnpm install
$ pnpm run dev
```

or built statically and previewed with

```bash
$ pnpm run build
$ pnpm run preview
```
