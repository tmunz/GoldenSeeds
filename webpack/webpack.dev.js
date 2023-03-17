const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '..', 'public'),
    },
    compress: true,
    port: 8888,
    hot: true,
    open: true,
    client: {
      overlay: false,
    },
    historyApiFallback: true,
  },
  plugins: [new ReactRefreshWebpackPlugin()],
};
