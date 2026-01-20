// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Loggator",
      description:
        "Docker Log Aggregator with AI-Search powered by Meilisearch and OpenRouter",
      logo: {
        src: "./public/logo.png",
        replacesTitle: false,
      },
      favicon: "/logo.png",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/MBeggiato/loggator",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "introduction" },
            { label: "Quick Start", slug: "guides/quickstart" },
            { label: "Installation", slug: "guides/installation" },
          ],
        },
        {
          label: "Configuration",
          items: [
            {
              label: "Environment Variables",
              slug: "configuration/environment",
            },
            { label: "Docker Setup", slug: "configuration/docker" },
            { label: "AI Assistant", slug: "configuration/ai-assistant" },
          ],
        },
        {
          label: "Features",
          items: [
            { label: "Log Search", slug: "features/log-search" },
            { label: "AI Chat Assistant", slug: "features/ai-assistant" },
            { label: "Real-time Dashboard", slug: "features/dashboard" },
            {
              label: "Container Monitoring",
              slug: "features/container-monitoring",
            },
          ],
        },
        {
          label: "API Reference",
          items: [
            { label: "Overview", slug: "api/overview" },
            { label: "Chat API", slug: "api/chat" },
            { label: "Logs API", slug: "api/logs" },
            { label: "Containers API", slug: "api/containers" },
          ],
        },
        {
          label: "Development",
          items: [
            { label: "Local Setup", slug: "development/local-setup" },
            { label: "Architecture", slug: "development/architecture" },
            { label: "Contributing", slug: "development/contributing" },
          ],
        },
      ],
    }),
  ],
});
