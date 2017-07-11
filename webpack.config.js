/**
 * Dependencies
 */
var webpack = require('webpack');
var path = require('path');

console.log("Path", path.join(__dirname, '/views/'));
/**
 * Webpack config
 */
module.exports = {
  devtool: 'inline-source-map',

  entry: [
    './app/main'
  ],

  output: {
    path: path.join(__dirname, '/views/'),
    publicPath: '/',
    filename: 'bundle.js'
  },

  module: {
    loaders: [{
      test: /\.js?$/,
      loaders:  ['babel'],
      exclude: [/node_modules/, /bower_components/]
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }]
  }
};
