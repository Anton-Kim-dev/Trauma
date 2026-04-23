const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const makeConfig = require("@trauma/webpack-config");

module.exports = (env, argv) => {
  const config = makeConfig(env, argv);
  const isProduction = argv.mode === "production";
  
  const DASHBOARD_URL = process.env.DASHBOARD_URL || (isProduction ? "/dashboard" : "http://localhost:3001");
  const MEDICAL_URL = process.env.MEDICAL_URL || (isProduction ? "/medical" : "http://localhost:3002");

  return {
    ...config,
    output: {
      publicPath: "auto",
    },
    devServer: {
      ...config.devServer,
      port: 3000,
    },
    plugins: [
      ...config.plugins,
      new ModuleFederationPlugin({
        name: "host",
        remotes: {
          dashboard: `dashboard@${DASHBOARD_URL}/remoteEntry.js`,
          medical: `medical@${MEDICAL_URL}/remoteEntry.js`,
        },
        shared: {
          react: { singleton: true, eager: true, requiredVersion: "18.3.1" },
          "react-dom": { singleton: true, eager: true, requiredVersion: "18.3.1" },
          "react/jsx-runtime": { singleton: true, eager: true, requiredVersion: "18.3.1" },
          "react-router-dom": { singleton: true, eager: true, requiredVersion: ">=7.0.0" },
          mobx: { singleton: true, eager: true },
          "mobx-react-lite": { singleton: true, eager: true },
        },
      }),
    ],
  };
};

