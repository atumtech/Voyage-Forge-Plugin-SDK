import type { ComponentType } from "react";

export const PLUGIN_API_VERSION = 2 as const;

export type PluginExportScope = "full" | "section";
export type PluginExportSection =
  | "storyStarts"
  | "locations"
  | "quests"
  | "triggers";

export type PluginRecord = Record<string, unknown>;

export const PLUGIN_TRIGGER_BUILDER_FORMAT =
  "voyage-forge.trigger-builder.v1" as const;

export const PLUGIN_TRIGGER_CONSTRAINTS = {
  semanticLimit: 200,
  mechanicalLimit: 500,
  maxTriggerChars: 10000,
  maxConditions: 5,
  maxEffects: 5,
} as const;

export const PLUGIN_TRIGGER_CONDITION_TYPES = [
  "story",
  "action",
  "story-text",
  "action-text",
  "player-level",
  "game-tick",
  "party-realm",
  "party-region",
  "party-location",
  "party-area",
  "known-entity",
  "player-traits",
  "quests-completed",
  "player-resource",
  "read-string",
  "read-number",
  "read-boolean",
  "read-array",
] as const;

export const PLUGIN_TRIGGER_EFFECT_TYPES = [
  "story",
  "quest-progress",
  "quest-init",
  "party-realm",
  "party-region",
  "party-location",
  "party-area",
  "player-resource",
  "known-entity",
  "player-traits",
  "write-string",
  "write-number",
  "write-boolean",
  "write-array",
] as const;

export const PLUGIN_TRIGGER_TEXT_OPERATORS = [
  "equals",
  "notEquals",
  "contains",
  "notContains",
  "regex",
] as const;
export const PLUGIN_TRIGGER_NUMBER_OPERATORS = [
  "equals",
  "notEquals",
  "greaterThan",
  "lessThan",
  "greaterThanOrEqual",
  "lessThanOrEqual",
] as const;
export const PLUGIN_TRIGGER_BOOLEAN_OPERATORS = ["equals", "notEquals"] as const;
export const PLUGIN_TRIGGER_ARRAY_OPERATORS = ["contains", "notContains"] as const;
export const PLUGIN_TRIGGER_NUMERIC_EFFECT_OPERATORS = [
  "set",
  "add",
  "subtract",
  "multiply",
  "divide",
] as const;
export const PLUGIN_TRIGGER_COLLECTION_EFFECT_OPERATORS = [
  "set",
  "add",
  "remove",
] as const;

export const PLUGIN_TRIGGER_CONTRACT = {
  conditionTypes: PLUGIN_TRIGGER_CONDITION_TYPES,
  effectTypes: PLUGIN_TRIGGER_EFFECT_TYPES,
  textOperators: PLUGIN_TRIGGER_TEXT_OPERATORS,
  numberOperators: PLUGIN_TRIGGER_NUMBER_OPERATORS,
  booleanOperators: PLUGIN_TRIGGER_BOOLEAN_OPERATORS,
  arrayOperators: PLUGIN_TRIGGER_ARRAY_OPERATORS,
  numericEffectOperators: PLUGIN_TRIGGER_NUMERIC_EFFECT_OPERATORS,
  collectionEffectOperators: PLUGIN_TRIGGER_COLLECTION_EFFECT_OPERATORS,
  phaseRule:
    "Triggers with action or action-text conditions run in planning; all others run in state.",
  scriptRule:
    "Optional top-level script runs after conditions pass and before typed effects apply.",
  semanticEmbeddingRule:
    "Do not author embeddingId; Voyage generates semantic embeddings.",
} as const;

export type PluginTriggerBudgetKind = "semantic" | "mechanical";

export type PluginTriggerCondition = PluginRecord & {
  type?: unknown;
};

export type PluginTriggerEffect = PluginRecord & {
  type?: unknown;
};

export type PluginTriggerDefinition = PluginRecord & {
  name?: string;
  conditions?: PluginTriggerCondition[];
  effects?: PluginTriggerEffect[];
  recurring?: boolean;
  conditionOperator?: string;
  script?: string;
};

export type PluginTriggerRecord = Record<string, PluginTriggerDefinition>;

export type PluginTriggerBudgetEntry = {
  id: string;
  kind: PluginTriggerBudgetKind;
  charCount: number;
  overCharLimit: boolean;
};

export type PluginTriggerBudgetSummary = {
  entries: PluginTriggerBudgetEntry[];
  semanticCount: number;
  mechanicalCount: number;
  semanticLimit: typeof PLUGIN_TRIGGER_CONSTRAINTS.semanticLimit;
  mechanicalLimit: typeof PLUGIN_TRIGGER_CONSTRAINTS.mechanicalLimit;
  maxTriggerChars: typeof PLUGIN_TRIGGER_CONSTRAINTS.maxTriggerChars;
  semanticRemaining: number;
  mechanicalRemaining: number;
  overCharLimitEntries: PluginTriggerBudgetEntry[];
};

export type PluginTriggerBuilderExport = {
  format: typeof PLUGIN_TRIGGER_BUILDER_FORMAT;
  apiVersion: typeof PLUGIN_API_VERSION;
  triggers: PluginTriggerRecord;
  constraints: typeof PLUGIN_TRIGGER_CONSTRAINTS;
  contract: typeof PLUGIN_TRIGGER_CONTRACT;
  budget: PluginTriggerBudgetSummary;
};

export type PluginApiFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;

export type PluginHostApiLimits = {
  allowedPathPrefixes: readonly string[];
  maxConcurrentRequests: number;
  maxRequestsPerWindow: number;
  rateLimitWindowMs: number;
  requestTimeoutMs: number;
};

export type PluginHostApi = {
  buildUrl: (path: string) => string;
  fetch: PluginApiFetch;
  isAuthenticated: () => Promise<boolean>;
  limits: PluginHostApiLimits;
};

export type PluginWorkspaceSection =
  | "aiInstructions"
  | "storySettings"
  | "factions"
  | "death"
  | "realms"
  | "resourceSettings"
  | "locationSettings"
  | "abilities"
  | "skills"
  | "triggers"
  | "worldLore"
  | "itemSettings"
  | "combatSettings"
  | "otherSettings"
  | "skillSettings"
  | "storybookSettings"
  | "attributeSettings"
  | "attributes"
  | "traits"
  | "traitCategories"
  | "items"
  | "locations"
  | "npcs"
  | "storyStarts"
  | "regions"
  | "npcTypes"
  | "nameFilterSettings"
  | "tipSettings"
  | "quests"
  | "mapLayers";

export type PluginWorkspaceMutationResult = {
  ok: true;
  section?: PluginWorkspaceSection;
};

export type PluginWorkspaceApi = {
  readonly: boolean;
  supportedSections: readonly PluginWorkspaceSection[];
  readWorld: () => PluginWorldData;
  readSection: (section: PluginWorkspaceSection) => unknown;
  replaceWorld?: (
    world: PluginWorldData,
    options?: { source?: string },
  ) => Promise<PluginWorkspaceMutationResult>;
  replaceSection?: (
    section: PluginWorkspaceSection,
    value: unknown,
    options?: { source?: string },
  ) => Promise<PluginWorkspaceMutationResult>;
};

export type PluginMarketplaceLifecycleStatus =
  | "draft"
  | "sandbox"
  | "in_review"
  | "approved"
  | "live"
  | "rejected"
  | "suspended";

export type PluginMarketplaceVisibility = "private" | "unlisted" | "public";

export type PluginMarketplaceRole =
  | "plugin_author"
  | "plugin_reviewer"
  | "plugin_admin";

export type PluginMarketplaceCapability =
  | "workspace.read"
  | "workspace.write"
  | "workspace.write.triggers"
  | "api.fetch"
  | "ui.panel"
  | "exporter";

export type PluginMarketplacePanelManifest = {
  id: string;
  label: string;
  entryUrl: string;
  sandbox?: string;
  requiredCapabilities?: PluginMarketplaceCapability[];
};

export type PluginMarketplaceArchivePanelManifest = Omit<
  PluginMarketplacePanelManifest,
  "entryUrl"
> & {
  /**
   * Optional in uploaded archives. Forge rewrites reviewed marketplace panels to
   * the immutable hosted artifact URL before public install.
   */
  entryUrl?: string;
};

export type PluginMarketplaceArchiveManifest = {
  name?: string;
  displayName?: string;
  summary?: string;
  description?: string;
  version?: string;
  tags?: string[];
  capabilities?: PluginMarketplaceCapability[];
  panels?: PluginMarketplaceArchivePanelManifest[];
  authorProfile?: PluginMarketplaceAuthorProfile;
  author?: string | PluginMarketplaceAuthorProfile;
  authors?: string[];
  credits?: string[];
};

export type PluginMarketplaceAuthorLink = {
  label: string;
  url: string;
};

export type PluginMarketplaceAuthorProfile = {
  displayName?: string;
  username?: string;
  pronouns?: string;
  role?: string;
  bio?: string;
  profileUrl?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  discordUsername?: string;
  discordUserId?: string;
  credits?: string[];
  links?: PluginMarketplaceAuthorLink[];
};

export type PluginMarketplaceListing = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  version: string;
  authorName: string;
  authorProfile?: PluginMarketplaceAuthorProfile;
  status: PluginMarketplaceLifecycleStatus;
  visibility: PluginMarketplaceVisibility;
  readmeMarkdown: string;
  tags: string[];
  capabilities: PluginMarketplaceCapability[];
  panels: PluginMarketplacePanelManifest[];
  installed?: boolean;
  installedVersion?: string;
  updatedAt: string;
};

export type PluginSandboxHostSnapshotMessage = {
  type: "voyage-forge.host.snapshot";
  requestId?: string;
  apiVersion: typeof PLUGIN_API_VERSION;
  plugin: PluginDescriptor;
  listing: Pick<
    PluginMarketplaceListing,
    "id" | "slug" | "name" | "version" | "capabilities"
  >;
  world: PluginWorldData;
  workspace: {
    readonly: boolean;
    supportedSections: readonly PluginWorkspaceSection[];
  };
};

export type PluginSandboxHostResponseMessage = {
  type: "voyage-forge.host.response";
  requestId?: string;
  ok: boolean;
  section?: PluginWorkspaceSection;
  error?: string;
};

export type PluginSandboxHostMessage =
  | PluginSandboxHostSnapshotMessage
  | PluginSandboxHostResponseMessage;

export type PluginSandboxClientReadyMessage = {
  type: "voyage-forge.plugin.ready";
  requestId?: string;
};

export type PluginSandboxClientReplaceSectionMessage = {
  type: "voyage-forge.plugin.replaceSection";
  requestId?: string;
  section: PluginWorkspaceSection;
  value: unknown;
};

export type PluginSandboxClientNotifyMessage = {
  type: "voyage-forge.plugin.notify";
  level?: "info" | "success" | "warning" | "error";
  message: string;
};

export type PluginSandboxClientMessage =
  | PluginSandboxClientReadyMessage
  | PluginSandboxClientReplaceSectionMessage
  | PluginSandboxClientNotifyMessage;

export const isPluginRecord = (value: unknown): value is PluginRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeTriggerType = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const SEMANTIC_TRIGGER_TYPE_PATTERN = /^(story|action|semantic)(?:$|[-_\s])/;

export const isPluginSemanticTriggerConditionType = (
  value: unknown,
): boolean => {
  const normalized = normalizeTriggerType(value);
  if (!normalized) {
    return false;
  }
  return SEMANTIC_TRIGGER_TYPE_PATTERN.test(normalized);
};

export const classifyPluginTriggerBudgetKind = (
  value: unknown,
): PluginTriggerBudgetKind => {
  if (!isPluginRecord(value) || !Array.isArray(value.conditions)) {
    return "mechanical";
  }

  return value.conditions.some(
    (entry) =>
      isPluginRecord(entry) && isPluginSemanticTriggerConditionType(entry.type),
  )
    ? "semantic"
    : "mechanical";
};

export const getPluginTriggerSerializedCharCount = (value: unknown): number => {
  try {
    return JSON.stringify(value ?? null, null, 2).length;
  } catch {
    return 0;
  }
};

export const getPluginWorldTriggers = (
  world: PluginWorldData,
): PluginTriggerRecord => {
  const triggers = isPluginRecord(world.triggers) ? world.triggers : {};
  return Object.fromEntries(
    Object.entries(triggers).filter(([, trigger]) => isPluginRecord(trigger)),
  ) as PluginTriggerRecord;
};

export const summarizePluginTriggerBudget = (
  value: unknown,
): PluginTriggerBudgetSummary => {
  const record = isPluginRecord(value) ? value : {};
  const entries: PluginTriggerBudgetEntry[] = Object.entries(record).map(
    ([id, triggerValue]) => {
      const charCount = getPluginTriggerSerializedCharCount(triggerValue);
      return {
        id,
        kind: classifyPluginTriggerBudgetKind(triggerValue),
        charCount,
        overCharLimit:
          charCount > PLUGIN_TRIGGER_CONSTRAINTS.maxTriggerChars,
      };
    },
  );

  const semanticCount = entries.filter(
    (entry) => entry.kind === "semantic",
  ).length;
  const mechanicalCount = entries.length - semanticCount;

  return {
    entries,
    semanticCount,
    mechanicalCount,
    semanticLimit: PLUGIN_TRIGGER_CONSTRAINTS.semanticLimit,
    mechanicalLimit: PLUGIN_TRIGGER_CONSTRAINTS.mechanicalLimit,
    maxTriggerChars: PLUGIN_TRIGGER_CONSTRAINTS.maxTriggerChars,
    semanticRemaining: Math.max(
      0,
      PLUGIN_TRIGGER_CONSTRAINTS.semanticLimit - semanticCount,
    ),
    mechanicalRemaining: Math.max(
      0,
      PLUGIN_TRIGGER_CONSTRAINTS.mechanicalLimit - mechanicalCount,
    ),
    overCharLimitEntries: entries.filter((entry) => entry.overCharLimit),
  };
};

export const createPluginTriggerBuilderExport = (
  world: PluginWorldData,
): PluginTriggerBuilderExport => {
  const triggers = getPluginWorldTriggers(world);
  return {
    format: PLUGIN_TRIGGER_BUILDER_FORMAT,
    apiVersion: PLUGIN_API_VERSION,
    triggers,
    constraints: PLUGIN_TRIGGER_CONSTRAINTS,
    contract: PLUGIN_TRIGGER_CONTRACT,
    budget: summarizePluginTriggerBudget(triggers),
  };
};

export interface PluginWorldData extends Record<string, unknown> {
  configVersion?: string;
  heroesVersion?: number;
  aiInstructions?: PluginRecord;
  narratorStyle?: string;
  embeddings?: PluginRecord;
  storySettings?: PluginRecord;
  factions?: PluginRecord;
  death?: PluginRecord;
  realms?: PluginRecord;
  resourceSettings?: PluginRecord;
  locationSettings?: PluginRecord;
  abilities?: PluginRecord;
  skills?: PluginRecord;
  triggers?: PluginRecord;
  worldLore?: PluginRecord;
  itemSettings?: PluginRecord;
  combatSettings?: PluginRecord;
  otherSettings?: PluginRecord;
  skillSettings?: PluginRecord;
  storybookSettings?: PluginRecord;
  attributeSettings?: PluginRecord;
  attributes?: PluginRecord;
  traits?: PluginRecord;
  traitCategories?: PluginRecord;
  items?: PluginRecord;
  locations?: PluginRecord;
  npcs?: PluginRecord;
  storyStarts?: PluginRecord;
  regions?: PluginRecord;
  npcTypes?: PluginRecord;
  nameFilterSettings?: PluginRecord;
  tipSettings?: PluginRecord;
  quests?: PluginRecord;
  mapLayers?: string[];
}

export type PluginHostContext = {
  application: "voyage-forge";
  pluginApiVersion: typeof PLUGIN_API_VERSION;
  api?: PluginHostApi;
  workspace?: PluginWorkspaceApi;
};

export type PluginDescriptor = {
  id: string;
  name: string;
  version?: string;
  apiVersion: number;
};

export type PluginExportResult = {
  contents: string;
  filename: string;
  mimeType?: string;
};

export type PluginExportContext = {
  host: PluginHostContext;
  plugin: PluginDescriptor;
  world: PluginWorldData;
  scope: PluginExportScope;
  section?: PluginExportSection;
  stable: boolean;
  exportFullWorld: () => string;
  exportSection: (section: PluginExportSection) => string;
};

export type PluginExporter = {
  id: string;
  label: string;
  description?: string;
  run: (
    context: PluginExportContext,
  ) => PluginExportResult | Promise<PluginExportResult>;
};

export type PluginPanelProps = {
  host: PluginHostContext;
  plugin: PluginDescriptor;
  world: PluginWorldData;
};

export type PluginPanel = {
  id: string;
  label: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  component: ComponentType<PluginPanelProps>;
};

export type PluginDefinition = {
  id: string;
  name: string;
  version?: string;
  apiVersion?: number;
  panels?: PluginPanel[];
  exporters?: PluginExporter[];
};

export const definePlugin = <T extends PluginDefinition>(plugin: T): T => plugin;
