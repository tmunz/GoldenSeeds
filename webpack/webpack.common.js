const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const package = require('../package.json');

module.exports = (env) => ({
  entry: {
    app: path.resolve(__dirname, '..', './src/index.tsx'),
  },
  module: {
    rules: [{
      test: /\.(j|t)sx?$/,
      loader: 'babel-loader',
    }, {
      test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      type: 'asset/resource',
    }, {
      test: /\.jpe?g$|\.gif$|\.png$/i,
      type: 'asset/resource',
    }, {
      test: /\.css$|\.styl$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                [
                  'autoprefixer',
                  {
                    // Options
                  },
                ],
              ],
            },
          },
        },
        'stylus-loader'
      ],
    }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '..', './public/') }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', './template/index.html'),
    }),
    new webpack.DefinePlugin({
      "process.env": {
        "APP_VERSION": JSON.stringify(package.version),
        "MODE": JSON.stringify(env),
      }
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.styl']
  },
});
