const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

let config = {
  entry: {
    site: path.resolve(__dirname, "src") + "/index.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules|\.d\.ts$/,
      },
      {
        test: /\.d\.ts$/,
        loader: "ignore-loader",
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /(node_modules)/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
        options: {
          outputPath: "../dist/images",
          name: "[name].[ext]",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          {
            loader: "extract-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      "@fortawesome/fontawesome-free-solid$":
        "@fortawesome/fontawesome-free-solid/shakable.es.js",
    },
    extensions: [
      ".js",
      ".ts",
      ".tsx",
      ".css",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".md",
    ],
  },
  output: {
    //filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "dist"),
    clean: false,
  },

  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        crypto: {
          name: "crypto-node-modules",
          minChunks: 2,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: (module) => {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace("@", "")}`;
          },
        },
      },
    },
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: path.join(__dirname, "./src/index.html"),
    }),
    // new CopyPlugin({
    //   patterns: [
    //     // {
    //     //   from: path.resolve(__dirname, "src/index.html"),
    //     //   to: path.resolve(__dirname, "dist"),
    //     // },
    //     {
    //       from: path.resolve(__dirname, "src/styles.css"),
    //       to: path.resolve(__dirname, "dist/css"),
    //     },
    //   ],
    // }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
};

module.exports = (_, argv) => {
  if (argv.mode === "development") {
    config.devtool = "source-map";
    config.output.filename = "[name].js";
  } else {
    config.devtool = "source-map";
    config.output.filename = "[name].[chunkhash].js";
  }
  return config;
};
