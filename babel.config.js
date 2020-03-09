module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['@babel/env', {
        useBuiltIns: 'usage',
        corejs: '3.0.0',
        shippedProposals: true,
        targets: {
          node: '13.6',
        },
      }],
      ['@babel/react', {
        development: process.env.development,
      }],
      ['@babel/typescript', {
        allExtensions: true,
        isTSX: true,
        targets: {
          browsers: '> 0.5%'
        }
      }],
    ],
    plugins: [
      '@babel/proposal-class-properties',
    ],
  };
};
