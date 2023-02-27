const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const package = require('../package.json');

module.exports = {
  entry: {
    app: path.resolve(__dirname, "..", "./src/index.tsx"),
  },
  module: {
    rules: [{
      test: /\.(j|t)sx?$/,
      loader: 'babel-loader',
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      exclude: /\.icon\.svg$/,
      type: "asset/resource",
    }, {
      test: /\.jpe?g$|\.gif$|\.png$/i,
      type: "asset/resource",
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
                  "autoprefixer",
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
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./public/index.html"),
    }),
    new webpack.DefinePlugin({
      'process.env':{
        'APP_VERSION': JSON.stringify(package.version),
      }
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.styl']
  },
};
