const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const makeConfig = require("@trauma/webpack-config");

module.exports = (env, argv) => {
  const config = makeConfig(env, argv);
  
  return {
    ...config,
    output: {
      publicPath: "auto",
    },
    devServer: {
      ...config.devServer,
      port: 3001,
    },
    plugins: [
      ...config.plugins,
      new ModuleFederationPlugin({
        name: "dashboard",
        filename: "remoteEntry.js",
        exposes: {
          "./AdminDashboard": "./src/remote/AdminDashboardRemote",
          "./DoctorDashboard": "./src/remote/DoctorDashboardRemote",
          "./PatientDashboard": "./src/remote/PatientDashboardRemote",
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
