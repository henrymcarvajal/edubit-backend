const slsw = require('serverless-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: ['pg-promise'],
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  optimization: {
    // We do not want to minimize our code.
    minimize: false
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: 'templates', to: path.join(__dirname, '.webpack', 'service', 'templates')}
      ],
    }),
  ],
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  }
};