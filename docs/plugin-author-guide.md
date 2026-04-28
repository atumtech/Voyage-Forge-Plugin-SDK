# Plugin Author Guide

This guide is for anyone building a portable plugin for Voyage Forge with `@voyage-forge/plugin-sdk`.

The SDK is small on purpose. A plugin can add workspace panels, add export actions, and read the current world snapshot. Do not import Forge app internals, private stores, or backend routes.

## Install

```bash
npm install @voyage-forge/plugin-sdk
```

Peer dependency:

- `react`: `^18.0.0 || ^19.0.0`

## Mental Model

| Concept | What it does |
| --- | --- |
| `definePlugin` | Keeps your plugin definition typed without changing it at runtime. |
| `PLUGIN_API_VERSION` | Identifies the host API version your plugin expects. |
| `PluginDefinition` | The root object with `id`, `name`, optional `version`, panels, and exporters. |
| Panels | React components rendered inside the Forge workspace. |
| Exporters | Functions that generate downloadable files from the current world. |
| `PluginWorldData` | Read-only snapshot of the current world JSON. |
| `host.api` | Authenticated Forge API helper passed to panels and exporters. |
| `host.workspace` | Plugin API v2 bridge for scoped reads and reviewed writes. |

## Minimal Panel

```tsx
import React from "react";
import {
  PLUGIN_API_VERSION,
  definePlugin,
  type PluginPanelProps,
} from "@voyage-forge/plugin-sdk";

const OverviewPanel: React.FC<PluginPanelProps> = ({ plugin, world }) => {
  const locationCount = Object.keys(world.locations ?? {}).length;

  return (
    <section>
      <h2>{plugin.name}</h2>
      <p>{locationCount} locations in this world.</p>
    </section>
  );
};

export default definePlugin({
  id: "com.example.world-overview",
  name: "World Overview",
  version: "1.0.0",
  apiVersion: PLUGIN_API_VERSION,
  panels: [
    {
      id: "overview",
      label: "Overview",
      component: OverviewPanel,
    },
  ],
});
```

## Minimal Exporter

```ts
import {
  PLUGIN_API_VERSION,
  definePlugin,
} from "@voyage-forge/plugin-sdk";

export default definePlugin({
  id: "com.example.world-report",
  name: "World Report",
  version: "1.0.0",
  apiVersion: PLUGIN_API_VERSION,
  exporters: [
    {
      id: "summary-json",
      label: "World Summary JSON",
      description: "Exports a small JSON summary of the current world.",
      run: ({ world }) => ({
        filename: "world-summary.json",
        mimeType: "application/json",
        contents: JSON.stringify(
          {
            locations: Object.keys(world.locations ?? {}).length,
            quests: Object.keys(world.quests ?? {}).length,
            triggers: Object.keys(world.triggers ?? {}).length,
          },
          null,
          2,
        ),
      }),
    },
  ],
});
```

## Authenticated Forge API Calls

Plugins running inside Forge receive `host.api`. Use it for calls to approved Forge API routes that require the user's app session.

Do not read session tokens from storage. Do not rebuild auth headers in plugin code. `host.api.fetch()` uses Forge's existing account/session transport and includes credentials for cookie-backed sessions.

The v0.4.0 / Plugin API v2 host API is still allowlisted:

- `host.api.fetch()` checks the current Forge account session before the API call.
- Root-relative paths under approved Forge API prefixes are available, including `/api/compute/`, `/api/plugin-marketplace/`, `/api/plugins/`, `/api/projects/`, and `/api/workspaces/`.
- Caller-provided `Authorization` and `X-VoyageForge-Session` headers are stripped and replaced by Forge.
- Requests include cookies with `credentials: "include"`.
- The host applies a timeout plus per-plugin concurrency and rate limits.
- API routes still need server-side auth, body limits, and rate limits. Client guardrails are not a replacement for backend enforcement.

```ts
import {
  PLUGIN_API_VERSION,
  definePlugin,
} from "@voyage-forge/plugin-sdk";

export default definePlugin({
  id: "com.example.authenticated-report",
  name: "Authenticated Report",
  version: "1.0.0",
  apiVersion: PLUGIN_API_VERSION,
  exporters: [
    {
      id: "compute-report",
      label: "Compute Report",
      run: async ({ host, world }) => {
        if (!host.api) {
          throw new Error("This Forge host does not expose authenticated API helpers.");
        }

        const response = await host.api.fetch("/api/compute/dedup-groups", {
          body: JSON.stringify({ world }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Forge API request failed with ${response.status}`);
        }

        return {
          filename: "compute-report.json",
          mimeType: "application/json",
          contents: await response.text(),
        };
      },
    },
  ],
});
```

## Workspace Writes

Reviewed Plugin API v2 hosts may pass `host.workspace` to panels. Use it for scoped project updates instead of importing Forge stores:

```ts
await host.workspace?.replaceSection?.("triggers", nextTriggers, {
  source: "trigger-builder",
});
```

The host decides which sections are writable. Marketplace trigger GUI plugins should request `workspace.write.triggers`, then write only the `triggers` section after local validation.

## Marketplace Manifests

Marketplace catalog responses expose metadata, lifecycle state, capabilities, README markdown, and sandbox panel manifests. They should not expose submitted source code.

Marketplace uploads detect metadata from the archive itself. Include `README.md` for the public description, `package.json` for `name`, `description`, `version`, and optional `keywords`, plus either a `voyageForge` object in `package.json` or a root manifest such as `voyageforge.plugin.json`, `.voyageforge/plugin.json`, `forge.plugin.json`, or `plugin.json`.

Example package metadata:

```json
{
  "name": "@example/trigger-builder",
  "description": "Adds a visual trigger builder panel.",
  "version": "1.0.0",
  "keywords": ["triggers", "gui"],
  "voyageForge": {
    "authorProfile": {
      "displayName": "Example Studio",
      "username": "example-studio",
      "role": "Plugin author",
      "bio": "Builds workflow tools for Voyage Forge.",
      "profileUrl": "https://example.com",
      "discordUsername": "example",
      "credits": ["UI design", "Trigger validation"],
      "links": [{ "label": "Docs", "url": "https://example.com/docs" }]
    },
    "capabilities": ["ui.panel", "workspace.read", "workspace.write.triggers"],
    "panels": [
      {
        "id": "builder",
        "label": "Trigger Builder",
        "requiredCapabilities": [
          "ui.panel",
          "workspace.read",
          "workspace.write.triggers"
        ]
      }
    ]
  }
}
```

Useful SDK types:

- `PluginMarketplaceListing`
- `PluginMarketplaceLifecycleStatus`
- `PluginMarketplaceCapability`
- `PluginMarketplacePanelManifest`
- `PluginMarketplaceArchiveManifest`
- `PluginMarketplaceArchivePanelManifest`
- `PluginMarketplaceRole`
- `PluginSandboxHostMessage`
- `PluginSandboxClientMessage`

For an archive-shaped reference, see [`../examples/world-puppeteer-marketplace`](../examples/world-puppeteer-marketplace). It includes a public README, package metadata, `voyageforge.plugin.json`, author profile credits, and a sandboxed panel artifact that writes a staged `worldLore` entry through the reviewed bridge.

## Good Plugin Ideas

Portable plugins are a good fit for things like:

- world quality reports
- custom export formats
- dashboards for quests, NPCs, locations, or economy data
- validation helpers that explain issues before export
- writer-facing planning tools
- bridge plugins for external tools

Trigger builders are one example of a bridge plugin. See [`trigger-builder-plugin-integration.md`](./trigger-builder-plugin-integration.md) for that workflow.

## Boundaries

For portable plugins:

- import only from `@voyage-forge/plugin-sdk`, React, and their own package
- use `host.api.fetch()` for authenticated Forge API calls
- treat `world` as read-only
- preserve unknown world fields when transforming JSON
- keep expensive work out of module top level
- set `apiVersion: PLUGIN_API_VERSION`

Do not depend on:

- Forge's internal Zustand stores
- private validation modules
- private backend routes
- undocumented runtime globals
- arbitrary `@/` imports from the app source tree

## Returning Edited Data

Export/download handoffs are still valid for portable external tools. Embedded reviewed plugins can use `host.workspace.replaceSection()` for approved section-scoped writes.

## Verify Locally

```bash
npm run typecheck
npm run build
```

If you add or update examples in this repository, also run:

```bash
npm run example:typecheck
```

You can run one example at a time while iterating:

```bash
npm run example:trigger-builder:typecheck
npm run example:world-puppeteer:typecheck
```
