const path = require('path');

module.exports = {
  mode: 'production',
  devtool: 'hidden-source-map',
  output: {
    path: path.resolve(__dirname, '..', './dist'),
    filename: 'bundle.[name].[hash].js',
  },
};
