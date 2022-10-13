const path = require('path');

module.exports = {
  entry: './src/bloghome.js',
  output: {
    filename: 'blog.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  experiments: {
    topLevelAwait: true,
  },
};