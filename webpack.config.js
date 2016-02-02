module.exports = {
  entry: "./assets/js/app.js",
  output: {
    path: "./assets/js/dependencies",
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /.js?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015']
      }
    }]
  }
}
