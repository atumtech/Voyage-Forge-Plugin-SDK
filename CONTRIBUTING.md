# Contributing

Thanks for helping improve the Voyage Forge Plugin SDK.

## Local Checks

Run these before opening a pull request:

```bash
npm install
npm run verify
```

`npm run verify` typechecks the SDK, builds the package, and typechecks the example plugin.

## API Changes

Keep the SDK small and stable:

- Additive types and helper functions can usually ship as minor versions.
- Host behavior changes may require a `PLUGIN_API_VERSION` bump.
- Do not expose Voyage Forge app internals, store shapes, private backend routes, or proprietary assets through this SDK.
- Prefer typed exchange formats and explicit host capabilities over generic access to app internals.

## Trigger Builder Changes

Trigger-builder helpers should remain portable. If you change trigger constraints, payload shape, or budget classification, update:

- `src/index.ts`
- `docs/trigger-builder-plugin-integration.md`
- `examples/trigger-builder-bridge/src/index.ts`
- `README.md`

## Release Notes

For user-visible changes, update `CHANGELOG.md` with a short note under `Unreleased`.
