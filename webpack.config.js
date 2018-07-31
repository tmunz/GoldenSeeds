const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const contentBase ='/dist';

module.exports = {
  entry: {
    main: './src/index.tsx',
    vendor: [
      'react-hot-loader/patch',
      './src/polyfills/index.js'
    ]
  },
  output: {
    path: __dirname + contentBase,
    publicPath: '/',
    filename: 'bundle.js'
  },
  devtool: 'cheap-eval-source-map',
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    inline: true,
    historyApiFallback: true,
    port: 8880,
    contentBase: '.' + contentBase,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader!ts-loader'
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
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
    extensions: ['*', '.js', '.ts', '.tsx']
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html'
    })
  ]
};
