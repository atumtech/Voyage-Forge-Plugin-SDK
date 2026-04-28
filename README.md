# Voyage Forge Plugin SDK

Public TypeScript SDK for building Voyage Forge plugins.

The SDK contains the stable authoring surface for plugins that run inside Voyage Forge:

- `definePlugin`
- `PLUGIN_API_VERSION`
- panel and exporter types
- authenticated host API helpers
- optional `host.workspace` helpers for reviewed, section-scoped writes
- marketplace listing, sandbox panel, lifecycle, capability, role, and bridge message types
- world snapshot types
- optional helpers for specialized integrations, including trigger builders

For a portable plugin, depend on `@voyage-forge/plugin-sdk`, React, and your own code. Do not import Forge app internals.

## Install

```bash
npm install @voyage-forge/plugin-sdk
```

Peer dependency:

- `react`: `^18.0.0 || ^19.0.0`

## Minimal Plugin

```tsx
import React from "react";
import {
  PLUGIN_API_VERSION,
  definePlugin,
  type PluginPanelProps,
} from "@voyage-forge/plugin-sdk";

const ExamplePanel: React.FC<PluginPanelProps> = ({ world }) => (
  <pre>{JSON.stringify(Object.keys(world ?? {}), null, 2)}</pre>
);

export default definePlugin({
  id: "com.example.hello",
  name: "Hello",
  version: "1.0.0",
  apiVersion: PLUGIN_API_VERSION,
  panels: [{ id: "main", label: "Hello", component: ExamplePanel }],
});
```

## What Plugins Can Do

The current public plugin surface supports:

- Workspace panels rendered inside Forge while a project is open.
- Export actions that generate downloadable files from the current world snapshot.
- Read-only access to world data through typed SDK props and export context.
- Reviewed Plugin API v2 workspace writes through `host.workspace.replaceSection()`.
- Authenticated calls to approved Forge API routes through `host.api.fetch()`.
- Marketplace metadata types for catalog pages, sandbox panels, and staged review.
- Specialized helper APIs for common integration patterns, such as trigger-builder JSON exchange.

Plugins can call approved authenticated Forge API routes from inside Forge. Reviewed Plugin API v2 hosts may also pass `host.workspace`, allowing section-scoped writes such as replacing `triggers` from an embedded trigger GUI.

## Guides

- [`docs/plugin-author-guide.md`](./docs/plugin-author-guide.md): start here for general plugin authoring.
- [`examples/trigger-builder-bridge`](./examples/trigger-builder-bridge): a typechecked example plugin.
- [`docs/trigger-builder-plugin-integration.md`](./docs/trigger-builder-plugin-integration.md): trigger-builder payload and bridge details.
- [`docs/trigger-gui-editor-integration.md`](./docs/trigger-gui-editor-integration.md): a concrete visual trigger editor example.

## Marketplace Archive Metadata

Forge detects marketplace metadata from the plugin archive. Include `README.md`, `package.json`, and either a `voyageForge` object in `package.json` or a root manifest such as `voyageforge.plugin.json`, `.voyageforge/plugin.json`, `forge.plugin.json`, or `plugin.json`.

The README becomes the public marketplace description. Package or manifest metadata supplies name, summary, version, tags, capabilities, and panel declarations.

Add optional author credits with `voyageForge.authorProfile`:

```json
{
  "voyageForge": {
    "authorProfile": {
      "displayName": "Example Studio",
      "role": "Plugin author",
      "profileUrl": "https://example.com",
      "credits": ["UI design", "Trigger validation"]
    }
  }
}
```

## Specialized Example: Trigger Builders

External trigger builders can use the SDK without importing Forge internals:

```ts
import {
  createPluginTriggerBuilderExport,
  summarizePluginTriggerBudget,
} from "@voyage-forge/plugin-sdk";

const payload = createPluginTriggerBuilderExport(world);
const budget = summarizePluginTriggerBudget(payload.triggers);
```

The payload format is `voyage-forge.trigger-builder.v1` and includes:

- the current trigger record
- Forge trigger constraints
- semantic and mechanical trigger budget counts
- per-trigger serialized size warnings

Trigger tools can still round-trip through exporter/import workflows. Reviewed embedded trigger GUI plugins can use `host.workspace.replaceSection("triggers", nextTriggers)` when the host grants that capability.

## Development

```bash
npm install
npm run verify
```

Useful scripts:

- `npm run typecheck`
- `npm run build`
- `npm run example:typecheck`
- `npm run dry-run`

## Versioning

`PLUGIN_API_VERSION` describes host compatibility. Additive helper exports can ship as npm minor versions without changing it. Bump `PLUGIN_API_VERSION` only when the host contract changes in a way that may reject or break existing plugins.

## License

MIT. See [`LICENSE`](./LICENSE).
