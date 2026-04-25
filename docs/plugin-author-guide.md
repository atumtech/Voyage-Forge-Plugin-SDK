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

The public SDK does not currently expose a direct save API. If your plugin edits data, return it through a download, copy-to-clipboard flow, or import workflow until Forge adds a versioned write capability.

## Verify Locally

```bash
npm run typecheck
npm run build
```

If you add or update examples in this repository, also run:

```bash
npm run example:typecheck
```
