const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const ROOT_DIR = path.resolve(__dirname, "../../..");

const createApiProxy = () => [
  {
    context: ["/api/auth"],
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  },
  {
    context: ["/api/users"],
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  },
  {
    context: ["/api/appointments"],
    target: "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  },
];

const createSharedConfig = (dependencies = {}, extraSingletons = []) => {
  const singletonPackages = new Set(["react", "react-dom", "react-router-dom", ...extraSingletons]);

  const shared = Object.fromEntries(
    Object.entries(dependencies).map(([name, version]) => [
      name,
      {
        eager: singletonPackages.has(name),
        requiredVersion: version,
        singleton: singletonPackages.has(name),
      },
    ]),
  );

  if (dependencies.react) {
    shared["react/jsx-runtime"] = {
      eager: true,
      requiredVersion: dependencies.react,
      singleton: true,
    };
    shared["react/jsx-dev-runtime"] = {
      eager: true,
      requiredVersion: dependencies.react,
      singleton: true,
    };
  }

  if (dependencies["react-dom"]) {
    shared["react-dom/client"] = {
      eager: true,
      requiredVersion: dependencies["react-dom"],
      singleton: true,
    };
  }

  return shared;
};

const createWebpackConfig = ({
  appDir,
  argv,
  devPort,
  federationPlugin,
  htmlTitle,
  outputPath,
  publicPath,
}) => {
  const mode = argv.mode || "development";
  const isProduction = mode === "production";

  return {
    mode,
    entry: path.resolve(appDir, "src/main.tsx"),
    output: {
      clean: true,
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      path: outputPath || path.resolve(appDir, "dist"),
      publicPath,
    },
    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(appDir, "tsconfig.json"),
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(appDir, "public/index.html"),
        title: htmlTitle,
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProduction),
      }),
      federationPlugin,
    ].filter(Boolean),
    devServer: {
      historyApiFallback: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      hot: true,
      host: "0.0.0.0",
      port: devPort,
      proxy: createApiProxy(),
      static: {
        directory: path.resolve(appDir, "public"),
      },
    },
    infrastructureLogging: {
      level: "warn",
    },
    stats: "minimal",
  };
};

module.exports = {
  ROOT_DIR,
  createSharedConfig,
  createWebpackConfig,
};
