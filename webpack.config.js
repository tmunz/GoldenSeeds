const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const Path = require('path');
const dist = Path.join(__dirname, 'docs');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: dist,
    publicPath: './',
    filename: 'bundle.[name].[hash].js',
  },
  devtool: 'cheap-eval-source-map',
  devServer: {
    inline: true,
    port: 8888,
    historyApiFallback: true,
    publicPath: '/',
    hot: true,
  },
  module: {
    rules: [{
      test: /\.(j|t)sx?$/,
      loader: 'babel-loader',
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      exclude: /\.icon\.svg$/,
      loader: 'file-loader?name=[name].[ext]'
    }, {
      test: /\.jpe?g$|\.gif$|\.png$/i,
      loader: 'file-loader?name=[name].[ext]'
    }, {
      test: /\.css$|\.styl$/,
      use: [
        'style-loader',
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: () => [require('autoprefixer')]
          }
        },
        'stylus-loader'
      ],
    }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.styl']
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new Webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ]
};