'use strict';
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob-all')

require('dotenv').config()

const devMode = !(process.env.NODE_ENV === 'production');

let webpackConfig = {
  mode: devMode ? 'development' : 'production',
  devtool: 'inline-cheap-source-map',
  entry: {
    page: './src/page',
    background: './src/background'
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CopyWebpackPlugin([{
      from: '**/*',
      context: 'src',
      ignore: ['*.ts', '*.d.ts', '*.vue', '*.js', '*.example', '@types', '*.svg']
    }]),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new PurgecssPlugin({
      paths: glob.sync([
        path.join(__dirname, './src/index.html'),
        path.join(__dirname, './src/**/*.vue'),
        path.join(__dirname, './src/**/*.ts')
      ])
    }),
    new VueLoaderPlugin(),
    new webpack.EnvironmentPlugin(['IMGUR_CLIENT_IDS', 'RELEASE_NOTE_URL'])
  ],
  output: {
    path: path.join(__dirname, 'extension_dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.tsx?$/,
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/],
      }
    }, {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? { loader: 'style-loader', options: { insertAt: 'top' } } : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
    }, {
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.svg$/,
      loader: 'vue-svg-loader',
      options: {
        svgo: {
          plugins: [
            {removeDoctype: true},
            {removeComments: true}
          ]
        }
      }
    }]
  }
};

if (process.env.NODE_ENV === 'production') {
  delete webpackConfig.devtool

  webpackConfig.plugins = webpackConfig.plugins.concat([
    new CleanWebpackPlugin([
      path.join(__dirname, 'extension_dist')
    ]),
    new OptimizeCSSAssetsPlugin()
  ])
}

module.exports = webpackConfig;
