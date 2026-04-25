# Trigger Builder Bridge Example

This portable plugin shows how to export Forge triggers for an external trigger builder using only `@voyage-forge/plugin-sdk`.

It contributes two export actions:

- `Trigger Builder JSON`: emits the `voyage-forge.trigger-builder.v1` payload.
- `Trigger Budget Summary`: emits budget counts and per-trigger size warnings.

From the repository root:

```bash
npm run example:typecheck
```

For the full editor integration workflow, see [`../../docs/trigger-gui-editor-integration.md`](../../docs/trigger-gui-editor-integration.md).
