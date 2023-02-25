const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const dev = require("./webpack.dev.js");
const prod = require("./webpack.prod.js");

module.exports = ({ env }) => {
  const config = env === "production" ? prod : dev;
  return merge(common, config);
};
