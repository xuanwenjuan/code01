const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction
      ? 'js/[name].[contenthash:8].js'
      : 'js/[name].js',
    chunkFilename: isProduction
      ? 'js/[name].[contenthash:8].chunk.js'
      : 'js/[name].chunk.js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    publicPath: '/',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
              configFile: path.resolve(__dirname, 'tsconfig.json')
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !isProduction,
              modules: false
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: '咖啡店物料管理系统',
      filename: 'index.html',
      inject: 'body',
      minify: isProduction
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
          }
        : false
    })
  ],
  optimization: {
    minimize: isProduction,
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    compress: true,
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true,
    hot: true,
    open: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
  performance: {
    hints: isProduction ? 'warning' : false,
    maxAssetSize: 512000,
    maxEntrypointSize: 512000
  },
  stats: {
    assets: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }
};
