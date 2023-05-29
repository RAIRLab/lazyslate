const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  cache: false,
  entry: './src/app.ts',
  module: {
    rules: [
      {test: /\.ts?$/, use: 'ts-loader', exclude: /node_modules/},
      {test: /\.css$/, use: ["style-loader", "css-loader"], exclude: /node_modules/}
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    filename: 'app.js',
    clean: true,
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
  ]
};