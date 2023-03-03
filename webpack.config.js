const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');

module.exports = {
  mode: 'electron-renderer',
  target: ['web', 'es5'],
  entry: './src/renderer/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/dist/renderer/',
    library: { type: 'commonjs2' }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@framework': path.resolve(__dirname, './Framework'),
      '@type': path.resolve(__dirname, './src/types')
    }
  },
  module: {
    rules: [
      {
        test: /.*.[t]sx?$/,
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
    static: {
      directory: path.join(__dirname, "dist"),
    },
    hot: true,
    port: 3000,
    compress: true,
  },
  devtool: 'inline-source-map',
  externals: {
    serialport: "serialport",
 },
}
