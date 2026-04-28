# Trigger Builder Plugin Integration

This guide covers one specialized plugin pattern: connecting an external trigger builder to Voyage Forge through `@voyage-forge/plugin-sdk`.

For general plugin authoring, start with [`plugin-author-guide.md`](./plugin-author-guide.md). If you are building a visual trigger editor, see [`trigger-gui-editor-integration.md`](./trigger-gui-editor-integration.md) for the recommended user workflow, embedded-panel option, validation checklist, and UX guidance.

## Current Contract

Forge plugins can read the current world snapshot and export files. Plugin API v2 also exposes reviewed, section-scoped workspace writes through `host.workspace`, which is the preferred path for embedded trigger GUI plugins.

For trigger builders, the supported exchange format is:

```ts
import {
  PLUGIN_TRIGGER_BUILDER_FORMAT,
  createPluginTriggerBuilderExport,
} from "@voyage-forge/plugin-sdk";

const payload = createPluginTriggerBuilderExport(world);

console.log(payload.format === PLUGIN_TRIGGER_BUILDER_FORMAT);
```

The payload contains:

- `format`: currently `voyage-forge.trigger-builder.v1`
- `apiVersion`: the Forge plugin API version used to create the payload
- `triggers`: a record of trigger definitions from `world.triggers`
- `constraints`: Forge trigger limits for external validation
- `budget`: semantic/mechanical counts, remaining slots, and per-trigger size warnings

## Trigger Constraints

Validate against the exported constraints before handing trigger data back to Forge:

- Semantic triggers: `200`
- Mechanical triggers: `500`
- Serialized characters per trigger: `10000`

Forge classifies a trigger as semantic when any condition type starts with `story`, `action`, or `semantic` followed by the end of the string or a delimiter (`-`, `_`, or whitespace). Other triggers count against the mechanical budget.

## Exporter Example

Portable plugins can expose a trigger export action like this:

```ts
import {
  PLUGIN_API_VERSION,
  createPluginTriggerBuilderExport,
  definePlugin,
} from "@voyage-forge/plugin-sdk";

export default definePlugin({
  id: "com.example.trigger-builder-bridge",
  name: "Trigger Builder Bridge",
  version: "1.0.0",
  apiVersion: PLUGIN_API_VERSION,
  exporters: [
    {
      id: "trigger-builder-json",
      label: "Trigger Builder JSON",
      description: "Exports Forge triggers for an external trigger builder.",
      run: ({ world }) => ({
        filename: "voyage-forge-triggers.json",
        mimeType: "application/json",
        contents: JSON.stringify(
          createPluginTriggerBuilderExport(world),
          null,
          2,
        ),
      }),
    },
  ],
});
```

## Embedded Trigger GUI Workflow

Reviewed marketplace trigger GUI plugins can run inside Forge as sandboxed panels:

1. Forge sends the current world snapshot and capability manifest to the sandboxed panel.
2. The plugin edits triggers locally and validates against `constraints` and `contract`.
3. The plugin sends a host bridge request to replace only the `triggers` section.
4. Forge applies the write through `host.workspace.replaceSection("triggers", nextTriggers)`.

Plugins should request the `workspace.write.triggers` marketplace capability instead of using broad workspace writes.

## Round-Trip Workflow

For external tools that do not run inside Forge, use this workflow:

1. The user exports `voyage-forge.trigger-builder.v1` JSON from Forge.
2. The external builder imports the payload, edits or generates trigger definitions, and validates against `constraints`.
3. The external builder returns either the same payload format with updated `triggers` or a plain trigger record.
4. The user imports or pastes the result through Forge's normal JSON/import tooling.

This keeps external tools portable and avoids coupling them to Forge stores, validation modules, or private backend routes.

## API Direction

Keep trigger writes versioned and section-scoped. Do not expose internal stores or private backend routes to achieve trigger edits.
