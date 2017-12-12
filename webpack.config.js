// const uglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    settings: './src/settings.js'
  },
  output: {
    filename: './assets/[name].bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  // plugins: [
  //   new uglifyJsPlugin()
  // ]
};
