import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const common: Configuration = {
  mode: isDev ? 'development' : 'production',
  externals: {fsevents:'fsevents', serialport: "serialport"},
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
    alias: {
      '@framework/*': './Framework/*',
      '@type/*': './src/types/*',
    }
  },
  output: {
    publicPath: './dist/',
    assetModuleFilename: 'assets/[name][ext]',
    filename: "[name].js",
    library: { type: 'commonjs2' }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(ico|png|svg|eot|woff?2?)$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.pug$/,
        use: ['pug-loader']
      }
    ],
  },
  watch: isDev,
  devtool: isDev ? 'source-map' : undefined,
};

const main: Configuration = {
  ...common,
  target: 'electron-main',
  entry: { main: './src/main/index.ts' },
};

const preload: Configuration = {
  ...common,
  target: 'electron-preload',
  entry: { preload: './src/main/preload.ts' },
  resolve: {
    alias:{
      '@preload': path.resolve(__dirname, 'src/main/preload'),
    }
  }
};

const renderer: Configuration = {
  ...common,
  target: 'web',
  entry: { index: './src/renderer/index.tsx' },
  plugins: [
    new HtmlWebpackPlugin({ template: './src/renderer/index.html' , publicPath: './'}),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: './src/model', to: 'model' },
        { from: './templates', to: 'templates' },
        { from: './views', to: 'views' },
        { from: './.log', to: 'log' },
        { from: 'live2dcubismcore*', to: 'lib', context: 'Core' },
      ],
    }),
  ],
};

export default [main, preload, renderer];
