var webpack = require('webpack');
var path = require('path');
var dev = process.argv.indexOf('--dev') !== -1;

module.exports = {
  entry: path.resolve(__dirname, 'src/_index.js'),
  output: {
    libraryTarget: 'var',
    library: ['rey'],
    filename: dev ? 'rey.dev.js' : 'rey.js',
    path: path.resolve(__dirname, 'dist'),
    sourcePrefix: '  '
  },

  cache: false,
  debug: false,
  devtool: false,

  stats: {
    colors: true,
    warnings: false
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin()
  ].slice(dev ? 2 : 0),

  resolveLoader: {
    modulesDirectories: [
      path.resolve(__dirname, 'node_modules')
    ]
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        compact: false,
        babelrc: false,
        presets: ['babel-preset-es2015', 'babel-preset-stage-0'].map(require.resolve)
      },
      include: [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, 'test')
      ]
    }]
  }
};
