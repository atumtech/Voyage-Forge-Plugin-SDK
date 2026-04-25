import type { ComponentType } from "react";

export const PLUGIN_API_VERSION = 1 as const;

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
  budget: PluginTriggerBudgetSummary;
};

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
