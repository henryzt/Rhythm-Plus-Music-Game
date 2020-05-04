module.exports = {
  entry: __dirname + "/src/app/javascript/main.js", // webpack entry point. Module to start building dependency graph
  output: {
    path: __dirname + "/dist", // Folder to store generated bundle
    filename: "bundle.js", // Name of generated bundle after build
    publicPath: "/", // public URL of the output directory when referenced in a browser
  },
  module: {
    // where we defined file patterns and their loaders
    rules: [],
  },
  devServer: {
    // configuration for webpack-dev-server
    contentBase: "./src/public", //source of static assets
    port: 7700, // port to run dev-server
  },
};
