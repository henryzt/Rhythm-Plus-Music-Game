const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = () => process.env.NODE_ENV === "production";

module.exports = {
  entry: path.resolve(__dirname, "src", "index.js"),
  mode: "development",
  devtool: "source-map",
  resolve: { extensions: ["*", ".js"] },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  devServer: {
    contentBase: path.resolve(__dirname, "src", "public"),
    port: 3000,
    publicPath: "http://localhost:3000/dist/",
    hotOnly: true,
    historyApiFallback: true,
  },
  optimization: isProduction()
    ? {
        concatenateModules: true,
        mergeDuplicateChunks: true,
        minimize: true,
        nodeEnv: "production",
        providedExports: true,
        removeAvailableModules: true,
        removeEmptyChunks: true,
        sideEffects: true,
        usedExports: true,
      }
    : {},
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production"),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "public", "index.html"),
      inject: "body",
    }),
    new VueLoaderPlugin(),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, "src", "public", "style.css"),
        to: path.resolve(__dirname, "dist", "style.css"),
      },
    ]),
  ],
};
