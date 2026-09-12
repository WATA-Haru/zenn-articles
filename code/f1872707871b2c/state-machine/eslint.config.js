import pluginVue from "eslint-plugin-vue";
import vueTsConfig from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  ...pluginVue.configs["flat/recommended"],
  ...vueTsConfig(),
  prettierConfig,
  {
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
];
