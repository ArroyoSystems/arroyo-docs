import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";

/** A sidebar link to a docs page, by its slug ("" for the home page). */
const page = (label: string, slug: string) => ({
  label,
  link: slug === "" ? "/" : `/${slug}/`,
});

const connectors: [string, string][] = [
  ["Blackhole", "blackhole"],
  ["Confluent", "confluent"],
  ["Delta Lake", "delta"],
  ["File System", "filesystem"],
  ["Fluvio", "fluvio"],
  ["Impulse", "impulse"],
  ["Iceberg", "iceberg"],
  ["Kafka", "kafka"],
  ["Kinesis", "kinesis"],
  ["MQTT", "mqtt"],
  ["MySQL", "mysql"],
  ["NATS", "nats"],
  ["Polling HTTP", "polling-http"],
  ["Postgres", "postgres"],
  ["RabbitMQ", "rabbitmq"],
  ["Redis", "redis"],
  ["Redpanda", "redpanda"],
  ["Server-Sent Events", "server-sent-events"],
  ["Webhook", "webhook"],
  ["WebSocket", "websocket"],
];

const scalarFunctions: [string, string][] = [
  ["Math", "math"],
  ["Conditional", "conditional"],
  ["String", "string"],
  ["Binary String", "binary-string"],
  ["Regex", "regex"],
  ["JSON", "json"],
  ["Time and Date", "time-and-date"],
  ["Array", "array"],
  ["Struct", "struct"],
  ["Hashing", "hashing"],
  ["Other", "other"],
];

// Newest first.
const releases = [
  "0.16.0", "0.15.0", "0.14.0", "0.13.0", "0.12.0", "0.11.0", "0.10.0",
  "0.9.0", "0.8.0", "0.7.0", "0.6.0", "0.5.0", "0.4.0", "0.3.0", "0.2.0",
];

const nimbusConfig = defineNimbusConfig({
  site: "https://doc.arroyo.dev",
  title: "Arroyo Documentation",
  description:
    "Documentation for Arroyo, a distributed stream processing engine written in Rust.",
  locale: "en",
  github: "https://github.com/ArroyoSystems/arroyo",
  editPattern:
    "https://github.com/ArroyoSystems/arroyo-docs/edit/main/{path}",
  socialImageAlt: "Arroyo documentation",
  head: [
    // Google Analytics
    {
      tag: "script",
      attrs: {
        src: "https://www.googletagmanager.com/gtag/js?id=G-YV6B37JRYM",
        async: "async",
      },
    },
    {
      tag: "script",
      content: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-YV6B37JRYM');
      `,
    },
  ],
  sidebar: {
    items: [
      {
        label: "Home",
        items: [
          page("Introduction", ""),
          page("Getting Started", "getting-started"),
          page("Concepts", "concepts"),
          page("Architecture", "architecture"),
          page("Configuration", "configuration"),
        ],
      },
      {
        label: "Tutorial",
        autogenerate: { directory: "tutorial" },
      },
      {
        label: "Sources and Sinks",
        items: [
          page("Overview", "connectors"),
          page("Formats", "connectors/formats"),
          {
            label: "Connectors",
            collapsed: true,
            items: connectors.map(([label, slug]) =>
              page(label, `connectors/${slug}`),
            ),
          },
        ],
      },
      {
        label: "SQL Reference",
        items: [
          page("Overview", "sql"),
          page("SQL Data Types", "sql/data-types"),
          page("SELECT Statements", "sql/select-statements"),
          page("DDL Statements", "sql/ddl"),
          page("Streaming Windows", "sql/windows"),
          page("Joins", "sql/joins"),
          page("Updating Tables", "sql/updating-tables"),
          {
            label: "Scalar Functions",
            collapsed: true,
            items: scalarFunctions.map(([label, slug]) =>
              page(label, `sql/scalar-functions/${slug}`),
            ),
          },
          page("Aggregate Functions", "sql/aggregate-functions"),
          page("Window Functions", "sql/window-functions"),
        ],
      },
      {
        label: "User-Defined Functions",
        items: [
          page("UDF Overview", "udfs"),
          {
            label: "Rust",
            collapsed: true,
            items: [
              page("UDFs", "udfs/rust/udfs"),
              page("UDAFs", "udfs/rust/udafs"),
              page("Async UDFs", "udfs/rust/async-udfs"),
            ],
          },
          {
            label: "Python",
            collapsed: true,
            items: [page("UDFs", "udfs/python/udfs")],
          },
        ],
      },
      {
        label: "Deployment",
        items: [
          page("Overview", "deployment"),
          page("Pipeline Clusters", "deployment/pipeline-clusters"),
          page("Kubernetes", "deployment/kubernetes"),
          page("VMs and Bare-metal", "deployment/vm"),
        ],
      },
      {
        label: "Arroyo Development",
        items: [page("Developer Setup", "developing/dev-setup")],
      },
      {
        label: "Releases",
        collapsed: true,
        items: releases.map((v) => page(`v${v}`, `releases/v${v}`)),
      },
    ],
  },
  // The REST API reference, served where its route file is
  // (src/pages/api/ → /api). The spec is generated from ./api-spec.json by
  // scripts/transform-openapi.js, which runs before `dev` and `build`.
  // See https://nimbus-docs.com/api-reference/
  api: [
    {
      collection: "api",
      label: "Arroyo REST API",
      spec: "./src/api/openapi.json",
      routes: { convention: "resource-action-v2" },
    },
  ],
});

export default defineConfig({
  // nimbus:adapter
  output: "static",
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in. These two catch frontmatter that doesn't
      // match the content schema and broken internal links. See
      // `nimbus-docs lint --help` for the others.
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      markdown: {
        // Wrap wide tables so they scroll instead of overflowing the page
        // (styled by `.nb-table-scroll` in src/styles/prose.css).
        hastPlugins: [tableScroll()],
        // `## Install {#install}` gives a heading a fixed id. A heading that
        // ends in other `{…}` text is read as attributes too; remove this to
        // keep it as text.
        features: { headingAttributes: true },
      },
    }),
  ],
});
