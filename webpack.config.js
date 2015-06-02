var webpack = require("webpack");
var path = require("path");

var plugins = [];

plugins.push(new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify('production'),
  },
}));

plugins.push(new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false
  }
}));

plugins.push(new webpack.NoErrorsPlugin());

module.exports = {
  context: __dirname,
  entry: {
    bundle: './cpu.js'
  },
  output: {
    // path: path.join(__dirname, 'build'),
    publicPath: "/",
    filename: "bundle.js"
  },
  module: {
    loaders: [ { test: /\.js$/, loader: "babel-loader", exclude: /node_modules/ } ]
  },
  plugins: plugins,
  resolve: {
    modulesDirectories: [ './node_modules' ]
  }
};
