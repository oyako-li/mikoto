const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  mode: 'electron-renderer',
  target: ['web', 'es5'],
  entry: './src/renderer/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/dist/renderer/'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@framework': path.resolve(__dirname, './Framework')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/renderer/index.html',
      inject: "body",
      chunks: ['index']
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/model', to: 'model' },
        { from: 'live2dcubismcore*', to: 'lib', context: 'Core' },
      ],
    }),
    new WriteFilePlugin()
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '.'),
    watchContentBase: true,
    inline: true,
    hot: true,
    port: 3000,
    host: '0.0.0.0',
    compress: true,
    useLocalIp: true,
    writeToDisk: true
  },
  devtool: 'inline-source-map'
}
