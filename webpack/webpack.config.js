const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = ({ env }) => {
  const config = env === "production" ? require('./webpack.prod.js') : require('./webpack.dev.js');
  return merge(common(env), config);
};
