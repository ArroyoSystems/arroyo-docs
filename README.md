# Arroyo Docs

This repo contains the source code to documentation website (https://doc.arroyo.dev) for [Arroyo](https://arroyo.dev).

## Doc development

We use [mintlify](https://mintlify.com) for our docs. The live website is automatically rebuilt on every merge to this
repo. To develop docs locally, you can install the mintlify dev CLI:

```bash
$ npm i -g mintlify
```

Then changes can be previewed by running this command in the root of the repository:

```bash
$ mintlify dev
```

**Note: Mintlify is not currently compatible with Node 20. Node 18 is recommended.**

## Updating the API Reference

We use the [mintlify scraper](https://mintlify.com/docs/api-playground/openapi-generation)
to generate the pages. After copying the latest `api-spec.json` into this repo, run:

```bash
$ npx @mintlify/scraping@latest openapi-file api-spec.json -o api-reference --overwrite
```
