// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';


import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://doc.arroyo.dev',

  integrations: [
      starlight({
          title: 'Arroyo Documentation',
      logo: {
          light: './src/assets/logo/light.svg',
          dark: './src/assets/logo/dark.svg',
          replacesTitle: true,
      },
          favicon: '/favicon.png',
          social: [
              { icon: 'github', label: 'GitHub', href: 'https://github.com/ArroyoSystems/arroyo' },
              { icon: 'discord', label: 'Discord', href: 'https://discord.gg/cjCr5rVmyR' },
              { icon: 'x.com', label: 'Twitter', href: 'https://twitter.com/ArroyoSystems' },
              { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/arroyo-systems' },
          ],
          customCss: [
              './src/styles/global.css',
          ],
          head: [
              // Google Analytics
              {
                  tag: 'script',
                  attrs: {
                      src: 'https://www.googletagmanager.com/gtag/js?id=G-YV6B37JRYM',
                      async: true,
                  },
              },
              {
                  tag: 'script',
                  content: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', 'G-YV6B37JRYM');
                  `,
              },
          ],
          sidebar: [
              {
                  label: 'Home',
                  items: [
                      { label: 'Introduction', slug: 'index' },
                      { label: 'Getting Started', slug: 'getting-started' },
                      { label: 'Concepts', slug: 'concepts' },
                      { label: 'Architecture', slug: 'architecture' },
                      { label: 'Configuration', slug: 'configuration' },
                  ],
              },
              {
                  label: 'Tutorial',
                  items: [
                      { label: 'First Pipeline', slug: 'tutorial/first-pipeline' },
                      { label: 'Mastodon Trends', slug: 'tutorial/mastodon' },
                      { label: 'Kafka', slug: 'tutorial/kafka' },
                      { label: 'Debezium', slug: 'tutorial/debezium' },
                      { label: 'Parsing with UDFs', slug: 'tutorial/udfs' },
                  ],
              },
              {
                  label: 'Sources and Sinks',
                  items: [
                      { label: 'Overview', slug: 'connectors/overview' },
                      { label: 'Formats', slug: 'connectors/formats' },
                      {
                          label: 'Connectors',
                          collapsed: true,
                          items: [
                              { label: 'Blackhole', slug: 'connectors/blackhole' },
                              { label: 'Confluent', slug: 'connectors/confluent' },
                              { label: 'Delta Lake', slug: 'connectors/delta' },
                              { label: 'File System', slug: 'connectors/filesystem' },
                              { label: 'Fluvio', slug: 'connectors/fluvio' },
                              { label: 'Impulse', slug: 'connectors/impulse' },
                              { label: 'Iceberg', slug: 'connectors/iceberg' },
                              { label: 'Kafka', slug: 'connectors/kafka' },
                              { label: 'Kinesis', slug: 'connectors/kinesis' },
                              { label: 'MQTT', slug: 'connectors/mqtt' },
                              { label: 'MySQL', slug: 'connectors/mysql' },
                              { label: 'NATS', slug: 'connectors/nats' },
                              { label: 'Polling HTTP', slug: 'connectors/polling-http' },
                              { label: 'Postgres', slug: 'connectors/postgres' },
                              { label: 'RabbitMQ', slug: 'connectors/rabbitmq' },
                              { label: 'Redis', slug: 'connectors/redis' },
                              { label: 'Redpanda', slug: 'connectors/redpanda' },
                              { label: 'Server-Sent Events', slug: 'connectors/server-sent-events' },
                              { label: 'Webhook', slug: 'connectors/webhook' },
                              { label: 'WebSocket', slug: 'connectors/websocket' },
                          ],
                      },
                  ],
              },
              {
                  label: 'SQL Reference',
                  items: [
                      { label: 'SQL Data Types', slug: 'sql/data-types' },
                      { label: 'SELECT Statements', slug: 'sql/select-statements' },
                      { label: 'DDL Statements', slug: 'sql/ddl' },
                      { label: 'Streaming Windows', slug: 'sql/windows' },
                      { label: 'Joins', slug: 'sql/joins' },
                      { label: 'Updating Tables', slug: 'sql/updating-tables' },
                      {
                          label: 'Scalar Functions',
                          collapsed: true,
                          items: [
                              { label: 'Math', slug: 'sql/scalar-functions/math' },
                              { label: 'Conditional', slug: 'sql/scalar-functions/conditional' },
                              { label: 'String', slug: 'sql/scalar-functions/string' },
                              { label: 'Binary String', slug: 'sql/scalar-functions/binary-string' },
                              { label: 'Regex', slug: 'sql/scalar-functions/regex' },
                              { label: 'JSON', slug: 'sql/scalar-functions/json' },
                              { label: 'Time and Date', slug: 'sql/scalar-functions/time-and-date' },
                              { label: 'Array', slug: 'sql/scalar-functions/array' },
                              { label: 'Struct', slug: 'sql/scalar-functions/struct' },
                              { label: 'Hashing', slug: 'sql/scalar-functions/hashing' },
                              { label: 'Other', slug: 'sql/scalar-functions/other' },
                          ],
                      },
                      { label: 'Aggregate Functions', slug: 'sql/aggregate-functions' },
                      { label: 'Window Functions', slug: 'sql/window-functions' },
                  ],
              },
              {
                  label: 'User-Defined Functions',
                  items: [
                      { label: 'UDF Overview', slug: 'udfs/overview' },
                      {
                          label: 'Rust',
                          collapsed: true,
                          items: [
                              { label: 'UDFs', slug: 'udfs/rust/udfs' },
                              { label: 'UDAFs', slug: 'udfs/rust/udafs' },
                              { label: 'Async UDFs', slug: 'udfs/rust/async-udfs' },
                          ],
                      },
                      {
                          label: 'Python',
                          collapsed: true,
                          items: [
                              { label: 'UDFs', slug: 'udfs/python/udfs' },
                          ],
                      },
                  ],
              },
              {
                  label: 'Deployment',
                  items: [
                      { label: 'Overview', slug: 'deployment/overview' },
                      { label: 'Pipeline Clusters', slug: 'deployment/pipeline-clusters' },
                      { label: 'Kubernetes', slug: 'deployment/kubernetes' },
                      { label: 'VMs and Bare-metal', slug: 'deployment/vm' },
                  ],
              },
              {
                  label: 'Arroyo Development',
                  items: [
                      { label: 'Developer Setup', slug: 'developing/dev-setup' },
                  ],
              },
              {
                  label: 'Releases',
                  collapsed: true,
                  items: [
                      { label: 'v0.15.0', slug: 'releases/v0.15.0' },
                      { label: 'v0.14.0', slug: 'releases/v0.14.0' },
                      { label: 'v0.13.0', slug: 'releases/v0.13.0' },
                      { label: 'v0.12.0', slug: 'releases/v0.12.0' },
                      { label: 'v0.11.0', slug: 'releases/v0.11.0' },
                      { label: 'v0.10.0', slug: 'releases/v0.10.0' },
                      { label: 'v0.9.0', slug: 'releases/v0.9.0' },
                      { label: 'v0.8.0', slug: 'releases/v0.8.0' },
                      { label: 'v0.7.0', slug: 'releases/v0.7.0' },
                      { label: 'v0.6.0', slug: 'releases/v0.6.0' },
                      { label: 'v0.5.0', slug: 'releases/v0.5.0' },
                      { label: 'v0.4.0', slug: 'releases/v0.4.0' },
                      { label: 'v0.3.0', slug: 'releases/v0.3.0' },
                      { label: 'v0.2.0', slug: 'releases/v0.2.0' },
                  ],
              },
              {
                  label: 'API Reference',
                  link: '/api/',
              },
          ],
      }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
