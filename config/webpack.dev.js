/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-template */
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { merge } = require('webpack-merge');
const path = require('path');
const paths = require('./paths');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',

  target: 'web',

  devtool: 'inline-source-map',

  devServer: {
    historyApiFallback: true,
    contentBase: paths.build,
    open: true,
    compress: false,
    hot: true,
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.[js]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [require.resolve('react-refresh/babel')],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
      'src',
      path.resolve(__dirname, '../', 'node_modules', 'ucentral-libs', 'src'),
    ],
    alias: {
      react: path.resolve(__dirname, '../', 'node_modules', 'react'),
      'react-router-dom': path.resolve('./node_modules/react-router-dom'),
      'ucentral-libs': path.resolve(__dirname, '../', 'node_modules', 'ucentral-libs', 'src'),
      graphlib: path.resolve(__dirname, '../', 'node_modules', 'graphlib'),
    },
  },
  plugins: [new ReactRefreshWebpackPlugin()],
});
