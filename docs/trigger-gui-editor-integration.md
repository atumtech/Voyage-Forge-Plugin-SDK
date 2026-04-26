# Visual Trigger Editor Example

This is a concrete example for plugin authors building a visual trigger editor. For general plugin development, start with [`plugin-author-guide.md`](./plugin-author-guide.md).

Trigger editors are bridge plugins. They read Forge world data, package a trigger payload for an external or embedded editor, and return edited JSON through an import/export handoff.

The short version for trigger editors:

- Use `@voyage-forge/plugin-sdk` as the only Forge dependency.
- Read triggers from the `world` snapshot passed to a plugin panel or exporter.
- Exchange trigger data with the `voyage-forge.trigger-builder.v1` payload.
- Validate against the SDK's public trigger constraints before returning data.
- Use `host.api.fetch()` for approved authenticated Forge API routes from inside Forge.
- Treat local Forge project writes as a separate capability until Forge exposes a versioned write API.

## Pick An Integration Shape

There are two practical shapes.

### External Editor

Use this if the trigger builder is a separate web app, desktop app, or hosted tool.

1. Forge exports a `voyage-forge.trigger-builder.v1` JSON file.
2. The editor imports that JSON and presents a visual trigger builder.
3. The editor validates counts and per-trigger size limits.
4. The editor exports an updated payload or plain trigger record.
5. The user brings the JSON back into Forge through the normal JSON/import workflow.

This is the safest path because the editor does not need to run inside Forge.

### Embedded Forge Panel

Use this if the editor should appear inside the Forge workspace as a plugin panel.

The panel receives `PluginPanelProps`, including the read-only `world` snapshot and authenticated `host.api` helpers. The panel can show a GUI, derive trigger state, call approved Forge API routes, and generate downloadable JSON. It cannot directly save edited triggers back into the open Forge project through the public SDK yet.

```tsx
import React from "react";
import {
  PLUGIN_API_VERSION,
  definePlugin,
  getPluginWorldTriggers,
  summarizePluginTriggerBudget,
  type PluginPanelProps,
} from "@voyage-forge/plugin-sdk";

const TriggerEditorPanel: React.FC<PluginPanelProps> = ({ host, world }) => {
  const triggers = getPluginWorldTriggers(world);
  const budget = summarizePluginTriggerBudget(triggers);
  const canCallForgeApi = Boolean(host.api);

  return (
    <section>
      <h2>Trigger Editor</h2>
      <p>
        {budget.semanticCount} semantic / {budget.mechanicalCount} mechanical
        triggers
      </p>
      <p>Authenticated API: {canCallForgeApi ? "available" : "unavailable"}</p>
      {/* Mount a visual editor here. */}
    </section>
  );
};

export default definePlugin({
  id: "com.example.trigger-editor",
  name: "Trigger Editor",
  version: "1.0.0",
  apiVersion: PLUGIN_API_VERSION,
  panels: [{ id: "editor", label: "Trigger Editor", component: TriggerEditorPanel }],
});
```

## Install the SDK

```bash
npm install @voyage-forge/plugin-sdk
```

Peer dependency:

- `react`: `^18.0.0 || ^19.0.0`

## Export Triggers From Forge

A portable bridge plugin can add an export action that gives the editor the current trigger payload:

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
      description: "Exports Forge triggers for a visual editor.",
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

See [`examples/trigger-builder-bridge`](../examples/trigger-builder-bridge) for a typechecked example.

## Call Authenticated Forge APIs

Plugins running inside Forge receive `host.api`. Use it for approved authenticated API calls instead of reading session tokens or importing Forge app modules.

In v0.3.0, the host API is deliberately narrow: `/api/compute/*` only, auth preflight required, Forge-owned auth headers only, credentials included, and per-plugin request limits applied.

```ts
const response = await host.api?.fetch("/api/compute/dedup-groups", {
  body: JSON.stringify({ world }),
  headers: { "Content-Type": "application/json" },
  method: "POST",
});
```

If the editor needs an API route that does not exist yet, define that route in Forge with normal app auth, add it to the plugin host allowlist, and call it through `host.api.fetch()`.

## Payload Contract

The exported payload uses this shape:

```ts
type TriggerBuilderPayload = {
  format: "voyage-forge.trigger-builder.v1";
  apiVersion: 1;
  triggers: Record<string, TriggerDefinition>;
  constraints: {
    semanticLimit: 200;
    mechanicalLimit: 500;
    maxTriggerChars: 10000;
  };
  budget: TriggerBudgetSummary;
};
```

Example payload:

```json
{
  "format": "voyage-forge.trigger-builder.v1",
  "apiVersion": 1,
  "triggers": {
    "enter_smugglers_den": {
      "name": "Enter Smugglers Den",
      "recurring": false,
      "conditionOperator": "and",
      "conditions": [
        {
          "type": "location",
          "operator": "is",
          "value": "smugglers_den"
        }
      ],
      "effects": [
        {
          "type": "story",
          "text": "The air thickens with pipe smoke and whispered bets."
        }
      ],
      "script": ""
    }
  },
  "constraints": {
    "semanticLimit": 200,
    "mechanicalLimit": 500,
    "maxTriggerChars": 10000
  },
  "budget": {
    "entries": [
      {
        "id": "enter_smugglers_den",
        "kind": "mechanical",
        "charCount": 409,
        "overCharLimit": false
      }
    ],
    "semanticCount": 0,
    "mechanicalCount": 1,
    "semanticLimit": 200,
    "mechanicalLimit": 500,
    "maxTriggerChars": 10000,
    "semanticRemaining": 200,
    "mechanicalRemaining": 499,
    "overCharLimitEntries": []
  }
}
```

## Trigger Definition Rules

The SDK keeps trigger definitions flexible so external editors can preserve Forge fields they do not understand.

Known top-level fields:

- `name`: human-readable label for the trigger.
- `conditions`: optional array of condition objects.
- `effects`: optional array of effect objects.
- `recurring`: whether the trigger can fire repeatedly.
- `conditionOperator`: optional condition join mode, usually `and`.
- `script`: optional JavaScript trigger script.

Recommended editor behavior:

- Preserve unknown fields when loading and saving.
- Preserve condition and effect objects the editor does not recognize.
- Use stable trigger IDs as object keys, such as `enter_smugglers_den`.
- Avoid rewriting IDs unless the user explicitly renames a trigger.
- Prefer empty arrays over missing arrays when the editor creates new triggers.
- Keep `script` as a string, even if your GUI does not edit scripts.

## Budget and Validation

Use the SDK helpers before exporting edited data:

```ts
import {
  PLUGIN_TRIGGER_CONSTRAINTS,
  summarizePluginTriggerBudget,
  type PluginTriggerRecord,
} from "@voyage-forge/plugin-sdk";

export const validateTriggersForForge = (triggers: PluginTriggerRecord) => {
  const budget = summarizePluginTriggerBudget(triggers);

  return {
    budget,
    canExport:
      budget.semanticCount <= PLUGIN_TRIGGER_CONSTRAINTS.semanticLimit &&
      budget.mechanicalCount <= PLUGIN_TRIGGER_CONSTRAINTS.mechanicalLimit &&
      budget.overCharLimitEntries.length === 0,
  };
};
```

Forge classifies a trigger as semantic when any condition type starts with `story`, `action`, or `semantic` followed by the end of the string or a delimiter (`-`, `_`, or whitespace). All other triggers count as mechanical.

Your editor should block or warn when:

- semantic triggers exceed `constraints.semanticLimit`
- mechanical triggers exceed `constraints.mechanicalLimit`
- any trigger's pretty-printed JSON exceeds `constraints.maxTriggerChars`
- JSON cannot be serialized
- a trigger is not an object

## Returning Edited Triggers

Until Forge exposes a public write API, return one of these JSON shapes to the user:

```ts
type PreferredReturnPayload = {
  format: "voyage-forge.trigger-builder.v1";
  apiVersion: 1;
  triggers: PluginTriggerRecord;
  constraints: typeof PLUGIN_TRIGGER_CONSTRAINTS;
  budget: PluginTriggerBudgetSummary;
};
```

or:

```ts
type PlainTriggerRecord = PluginTriggerRecord;
```

The preferred payload is better because it lets Forge and the user see which constraints the editor validated against.

## UX Recommendations

For a visual editor, make these states visible:

- semantic trigger count and remaining slots
- mechanical trigger count and remaining slots
- per-trigger size meter
- unknown condition/effect warning that says the data will be preserved
- script present indicator, even if scripts are edited in a raw text view
- export readiness summary before the user downloads JSON

Good labels for user-facing actions:

- `Import Forge Trigger JSON`
- `Validate for Forge`
- `Export for Forge`
- `Download Forge Trigger Payload`

## Current Limitation: No Portable Save API

Portable plugins cannot currently call `saveTriggers`, patch the world store, or apply edited data back into the open Forge project.

Do not depend on:

- Forge's internal Zustand stores
- private validation modules
- private backend routes
- undocumented globals
- arbitrary `@/` imports from the app source tree

When Forge adds direct save-back, it should be a versioned SDK capability so external editors can handle validation failures and host compatibility cleanly.

## Integration Checklist

Before sharing the editor with Forge users:

- Import only from `@voyage-forge/plugin-sdk`.
- Use `host.api.fetch()` for authenticated Forge API calls.
- Accept `voyage-forge.trigger-builder.v1` payloads.
- Preserve unknown trigger, condition, and effect fields.
- Validate counts and per-trigger size before export.
- Export updated data as the same payload format when possible.
- Document that save-back is currently a JSON/import handoff.
- Test against the typechecked bridge example in this repository.
