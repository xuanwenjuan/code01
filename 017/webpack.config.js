const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
    main: './src/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment 
      ? '[name].bundle.js' 
      : '[name].[contenthash:8].bundle.js',
    chunkFilename: isDevelopment 
      ? '[name].chunk.js' 
      : '[name].[contenthash:8].chunk.js',
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'src')
    ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: isDevelopment,
              experimentalWatchApi: true,
              compilerOptions: {
                module: 'ESNext',
                sourceMap: isDevelopment
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
              importLoaders: 0
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      'process.env.VERSION': JSON.stringify(require('./package.json').version)
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: '小型花店花卉管理系统',
      meta: {
        viewport: 'width=device-width, initial-scale=1.0',
        description: '小型花店花卉管理系统 - 基于React和TypeScript'
      },
      inject: 'body',
      minify: !isDevelopment ? {
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
      } : false
    }),
    ...(!isDevelopment ? [new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    })] : [])
  ],
  optimization: {
    minimize: !isDevelopment,
    minimizer: !isDevelopment ? [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 2020
          },
          compress: {
            ecma: 2020,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true,
            passes: 3
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 2020,
            comments: false,
            ascii_only: true
          }
        },
        parallel: true,
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ] : [],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 20
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    port: 3000,
    host: 'localhost',
    hot: true,
    historyApiFallback: true,
    open: true,
    compress: true,
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    devMiddleware: {
      stats: 'minimal'
    }
  },
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  stats: {
    preset: isDevelopment ? 'minimal' : 'normal',
    assets: true,
    colors: true,
    errors: true,
    warnings: true,
    modules: false,
    performance: !isDevelopment
  },
  performance: {
    hints: isDevelopment ? false : 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  mode: isDevelopment ? 'development' : 'production',
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
    buildDependencies: {
      config: [__filename]
    }
  }
};