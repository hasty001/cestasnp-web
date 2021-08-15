const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: { 
    bundle: ['./src/index.js', "./public/index.css"], 
    book: ['./src/book.js', "./public/book.css"]
  },
  output: {
    path: path.resolve('./build'),
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        react: {
          priority: 10,
          test: /[\\/]node_modules[\\/](core-js|whatwg-fetch|promise-polyfill|react|firebase)/,
          name: 'react',
          enforce: true,
          chunks: 'all'
        },
        shared: {
          test: /[\\/]node_modules[\\/]/,
          name: 'shared',
          enforce: true,
          chunks: 'all'
        }
      }
    }
 },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.jsx', '.html', '.css']
  },
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        loader: 'babel-loader'
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        loader: 'file-loader?name=/img/[hash].[ext]'
      },
      {
        test: /\.css$/,
        loaders: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
        FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_MESSAGING_ID: JSON.stringify(process.env.FIREBASE_MESSAGING_ID),
        SEARCH: JSON.stringify(process.env.SEARCH),
      }
    }),
    new MiniCssExtractPlugin({filename: "[name].css"}),
    new FixStyleOnlyEntriesPlugin(),
    new OptimizeCSSAssetsPlugin({})
  ]
};
