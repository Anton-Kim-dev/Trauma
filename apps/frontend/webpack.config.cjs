const { container } = require("webpack");
const { createSharedConfig, createWebpackConfig } = require("@trauma/build-config/webpack/createConfig");
const packageJson = require("./package.json");

const { ModuleFederationPlugin } = container;

module.exports = (_env, argv) =>
  createWebpackConfig({
    appDir: __dirname,
    argv,
    devPort: 3201,
    htmlTitle: "Redux Remote",
    publicPath: "auto",
    federationPlugin: new ModuleFederationPlugin({
      name: "reduxApp",
      filename: "remoteEntry.js",
      exposes: {
        "./ReduxRemoteApp": "./src/ReduxRemoteApp",
      },
      shared: createSharedConfig(packageJson.dependencies, ["react-redux", "@reduxjs/toolkit"]),
    }),
  });
