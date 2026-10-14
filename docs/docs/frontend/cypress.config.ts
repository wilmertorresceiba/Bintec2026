import { defineConfig } from "cypress";
import coverageWebpack from "./cypress/coverage.webpack";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4200",
  },
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
      webpackConfig: coverageWebpack,
    },
    specPattern: "cypress/component/**/*.cy.ts",
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("@cypress/code-coverage/task")(on, config);
      return config;
    },
  },
});
