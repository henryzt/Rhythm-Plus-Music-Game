const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = () => process.env.NODE_ENV === "production";

module.exports = {
  entry: ["babel-polyfill", path.resolve(__dirname, "src", "index.js")],
  mode: "development",
  devtool: "source-map",
  resolve: { extensions: ["*", ".js"] },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  devServer: {
    contentBase: path.resolve(__dirname, "src", "public"),
    host: "0.0.0.0",
    port: 3000,
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
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
      },
      {
        test: /\.css$/,
        use: [
          "vue-style-loader",
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "public", "index.html"),
      inject: "body",
    }),
    new VueLoaderPlugin(),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, "src", "public"),
      },
    ]),
  ],
};
