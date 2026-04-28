import {
  PLUGIN_API_VERSION,
  type PluginMarketplaceArchiveManifest,
  type PluginRecord,
  type PluginSandboxClientMessage,
  type PluginSandboxClientReplaceSectionMessage,
  type PluginSandboxHostMessage,
  type PluginSandboxHostResponseMessage,
  type PluginSandboxHostSnapshotMessage,
  type PluginWorkspaceSection,
  type PluginWorldData,
} from "@voyage-forge/plugin-sdk";

export const WORLD_PUPPETEER_UPSTREAM_URL =
  "https://github.com/nikolaj-lat/World-Puppeteer" as const;

export const WORLD_PUPPETEER_SECTION =
  "worldLore" as const satisfies PluginWorkspaceSection;

export const WORLD_PUPPETEER_EXAMPLE_MANIFEST = {
  name: "World Puppeteer Example",
  summary:
    "A complete sandboxed marketplace example inspired by BinKompliziert's interview-first world builder.",
  version: "0.1.0",
  tags: ["worldbuilding", "claude", "marketplace", "example"],
  capabilities: ["ui.panel", "workspace.read", "workspace.write"],
  panels: [
    {
      id: "director",
      label: "World Puppeteer",
      entryUrl: "dist/index.html",
      sandbox: "allow-forms allow-popups allow-scripts",
      requiredCapabilities: ["ui.panel", "workspace.read", "workspace.write"],
    },
  ],
  authorProfile: {
    displayName: "BinKompliziert",
    username: "nikolaj-lat",
    role: "Original World Puppeteer creator",
    bio: "Creator of the Claude Code World Puppeteer workflow adapted here as a Forge marketplace SDK example.",
    profileUrl: "https://github.com/nikolaj-lat",
    credits: [
      "Original World Puppeteer workflow by BinKompliziert / nikolaj-lat",
      "Portable Forge marketplace example maintained by Voyage Forge",
    ],
    links: [{ label: "World Puppeteer", url: WORLD_PUPPETEER_UPSTREAM_URL }],
  },
} satisfies PluginMarketplaceArchiveManifest;

export type WorldPuppeteerLoreEntry = PluginRecord & {
  id: string;
  name: string;
  summary: string;
  description: string;
  source: "world-puppeteer-marketplace-example";
  createdAt: string;
  updatedAt: string;
  tags: string[];
  credits: string[];
};

export type WorldPuppeteerDraft = {
  section: typeof WORLD_PUPPETEER_SECTION;
  value: PluginRecord;
  entry: WorldPuppeteerLoreEntry;
};

const asRecord = (value: unknown): PluginRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as PluginRecord)
    : {};

const countRecord = (value: unknown): number => Object.keys(asRecord(value)).length;

const firstNamedEntry = (value: unknown): string | null => {
  const record = asRecord(value);
  for (const [id, entry] of Object.entries(record)) {
    const maybeEntry = asRecord(entry);
    if (typeof maybeEntry.name === "string" && maybeEntry.name.trim()) {
      return maybeEntry.name.trim();
    }
    if (id.trim()) {
      return id.trim();
    }
  }
  return null;
};

const normalizeTitle = (prompt: string): string => {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return "World Puppeteer Seed";
  }
  const firstLine = trimmed.split(/\r?\n/u).find(Boolean) ?? trimmed;
  return firstLine.length > 72 ? `${firstLine.slice(0, 69)}...` : firstLine;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 48) || "seed";

const summarizeCurrentWorld = (world: PluginWorldData): string[] => {
  const anchors = [
    firstNamedEntry(world.realms),
    firstNamedEntry(world.regions),
    firstNamedEntry(world.locations),
    firstNamedEntry(world.npcs),
    firstNamedEntry(world.quests),
  ].filter((value): value is string => Boolean(value));

  return [
    `${countRecord(world.realms)} realms`,
    `${countRecord(world.regions)} regions`,
    `${countRecord(world.locations)} locations`,
    `${countRecord(world.npcs)} NPCs`,
    `${countRecord(world.quests)} quests`,
    anchors.length ? `Anchors: ${anchors.join(", ")}` : "Anchors: none yet",
  ];
};

export const createWorldPuppeteerDraft = (
  world: PluginWorldData,
  prompt: string,
  createdAt = new Date(),
): WorldPuppeteerDraft => {
  const isoDate = createdAt.toISOString();
  const title = normalizeTitle(prompt);
  const existingLore = asRecord(world.worldLore);
  const id = `world_puppeteer_${slugify(title)}_${isoDate.replace(/\D/gu, "").slice(0, 14)}`;
  const worldSummary = summarizeCurrentWorld(world);
  const focus =
    prompt.trim() ||
    "Ask focused interview questions, then expand this seed with the upstream World Puppeteer workflow.";

  const entry: WorldPuppeteerLoreEntry = {
    id,
    name: title,
    summary: "A staged World Puppeteer planning seed generated inside a Forge marketplace panel.",
    description: [
      `Focus: ${focus}`,
      `Current world snapshot: ${worldSummary.join("; ")}.`,
      "Next step: hand this seed to a Claude, Direct Claude, or Oracle-backed adapter that can interview the author and expand structured Forge sections.",
    ].join("\n\n"),
    source: "world-puppeteer-marketplace-example",
    createdAt: isoDate,
    updatedAt: isoDate,
    tags: ["world-puppeteer", "worldbuilding", "draft"],
    credits: [
      "Original World Puppeteer workflow by BinKompliziert / nikolaj-lat",
      "Portable Forge marketplace example maintained by Voyage Forge",
    ],
    upstreamUrl: WORLD_PUPPETEER_UPSTREAM_URL,
  };

  return {
    section: WORLD_PUPPETEER_SECTION,
    value: {
      ...existingLore,
      [id]: entry,
    },
    entry,
  };
};

export const createReadyMessage = (): PluginSandboxClientMessage => ({
  type: "voyage-forge.plugin.ready",
  requestId: `world-puppeteer-ready-v${PLUGIN_API_VERSION}`,
});

export const createReplaceSectionMessage = (
  draft: WorldPuppeteerDraft,
  requestId = `world-puppeteer-apply-${draft.entry.id}`,
): PluginSandboxClientReplaceSectionMessage => ({
  type: "voyage-forge.plugin.replaceSection",
  requestId,
  section: draft.section,
  value: draft.value,
});

export const createNotifyMessage = (
  message: string,
  level: "info" | "success" | "warning" | "error" = "info",
): PluginSandboxClientMessage => ({
  type: "voyage-forge.plugin.notify",
  level,
  message,
});

export const isSnapshotMessage = (
  message: PluginSandboxHostMessage,
): message is PluginSandboxHostSnapshotMessage =>
  message.type === "voyage-forge.host.snapshot";

export const getResponseText = (
  message: PluginSandboxHostResponseMessage,
): string =>
  message.ok
    ? `Forge accepted ${message.section ?? "the workspace update"}.`
    : message.error || "Forge rejected the workspace update.";
