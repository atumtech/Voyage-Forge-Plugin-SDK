import {
  PLUGIN_API_VERSION,
  createPluginTriggerBuilderExport,
  definePlugin,
  summarizePluginTriggerBudget,
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
    {
      id: "trigger-budget-summary",
      label: "Trigger Budget Summary",
      description: "Exports semantic and mechanical trigger budget counts.",
      run: ({ world }) => {
        const budget = summarizePluginTriggerBudget(world.triggers);
        return {
          filename: "voyage-forge-trigger-budget.json",
          mimeType: "application/json",
          contents: JSON.stringify(budget, null, 2),
        };
      },
    },
  ],
});
