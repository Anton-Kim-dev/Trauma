const { container } = require("webpack");
const { createSharedConfig, createWebpackConfig } = require("@trauma/build-config/webpack/createConfig");
const packageJson = require("./package.json");

const { ModuleFederationPlugin } = container;

module.exports = (_env, argv) =>
  createWebpackConfig({
    appDir: __dirname,
    argv,
    devPort: 3202,
    htmlTitle: "MobX Remote",
    publicPath: "auto",
    federationPlugin: new ModuleFederationPlugin({
      name: "mobxApp",
      filename: "remoteEntry.js",
      exposes: {
        "./MobxRemoteApp": "./src/MobxRemoteApp",
      },
      shared: createSharedConfig(packageJson.dependencies, ["mobx", "mobx-react-lite"]),
    }),
  });
