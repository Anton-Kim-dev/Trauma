const { container } = require("webpack");
const { createWebpackConfig } = require("@trauma/build-config/webpack/createConfig");

const { ModuleFederationPlugin } = container;

const createRemoteUrl = (name, devUrl, prodUrl, isProduction) => `${name}@${isProduction ? prodUrl : devUrl}`;

module.exports = (_env, argv) => {
  const isProduction = (argv.mode || "development") === "production";

  return createWebpackConfig({
    appDir: __dirname,
    argv,
    devPort: 3200,
    htmlTitle: "Trauma Host",
    publicPath: "/",
    federationPlugin: new ModuleFederationPlugin({
      name: "host",
      remotes: {
        mobxApp: createRemoteUrl("mobxApp", "http://localhost:3202/remoteEntry.js", "/remotes/mobx/remoteEntry.js", isProduction),
        reduxApp: createRemoteUrl("reduxApp", "http://localhost:3201/remoteEntry.js", "/remotes/redux/remoteEntry.js", isProduction),
      },
      shared: {
        react: {
          eager: true,
          requiredVersion: "^19.2.0",
          singleton: true,
        },
        "react/jsx-dev-runtime": {
          eager: true,
          requiredVersion: "^19.2.0",
          singleton: true,
        },
        "react/jsx-runtime": {
          eager: true,
          requiredVersion: "^19.2.0",
          singleton: true,
        },
        "react-dom": {
          eager: true,
          requiredVersion: "^19.2.0",
          singleton: true,
        },
        "react-dom/client": {
          eager: true,
          requiredVersion: "^19.2.0",
          singleton: true,
        },
        "react-router-dom": {
          eager: true,
          requiredVersion: "^7.13.1",
          singleton: true,
        },
      },
    }),
  });
};
