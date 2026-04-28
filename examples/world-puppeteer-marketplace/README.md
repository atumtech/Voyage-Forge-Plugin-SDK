# World Puppeteer Marketplace Example

This is a complete marketplace archive example for a Forge plugin inspired by [World Puppeteer](https://github.com/nikolaj-lat/World-Puppeteer), the Claude Code worldbuilding workflow created by BinKompliziert / nikolaj-lat.

Use this example to study the files Forge expects from a marketplace upload:

- `README.md`: public marketplace description.
- `package.json`: package metadata plus a `voyageForge` marketplace block.
- `voyageforge.plugin.json`: explicit Forge manifest metadata.
- `dist/index.html`: sandboxed panel artifact loaded by Forge after install.
- `src/index.ts`: typechecked source for the bridge messages and world-lore patch model.

The checked-in panel is intentionally portable. It creates a deterministic world-lore draft from the current Forge world snapshot and writes it back through the reviewed `voyage-forge.plugin.replaceSection` bridge. The maintained Forge plugin can use richer adapters, including Direct Claude and Oracle routing, but those private app integrations are not required for a public SDK example.

## Credits

- Original World Puppeteer workflow: BinKompliziert / nikolaj-lat.
- Upstream repository: <https://github.com/nikolaj-lat/World-Puppeteer>
- Marketplace adaptation example: Voyage Forge.

## Archive Layout

When packaging a marketplace upload from this example directory, zip the archive root so these files are at the top level:

```bash
zip -r world-puppeteer-marketplace-example.zip README.md package.json voyageforge.plugin.json dist
```

Forge reads the README and manifest from the archive automatically. The package and manifest both include author profile metadata so the marketplace page can credit the original creator without exposing source code.

## Local Verification

From the SDK repository root:

```bash
npm run example:world-puppeteer:typecheck
```

The HTML artifact is static so it can be opened directly, but it only receives a world snapshot and write permissions when Forge loads it as an installed marketplace panel.
