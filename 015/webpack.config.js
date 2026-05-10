const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: {
    main: './src/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? '[name].bundle.js' : '[name].[contenthash:8].bundle.js',
    chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true,
    pathinfo: false
  },
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  target: isDevelopment ? 'web' : 'browserslist',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@styles': path.resolve(__dirname, 'src/styles')
    },
    symlinks: false
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
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              compilerOptions: {
                sourceMap: isDevelopment
              }
            }
          }
        ],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: isDevelopment ? 'images/[name][ext]' : 'images/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: isDevelopment ? 'fonts/[name][ext]' : 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: '校园社团物资管理系统',
      inject: 'body',
      meta: {
        viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
        description: '高效管理各类物资，实现领用归还的全流程记录',
        'Content-Type': {
          'http-equiv': 'Content-Type',
          content: 'text/html; charset=utf-8'
        }
      },
      minify: !isDevelopment
        ? {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            minifyCSS: true
          }
        : false
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      'process.env.APP_VERSION': JSON.stringify('1.0.0'),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString())
    }),
    ...(isDevelopment ? [new webpack.HotModuleReplacementPlugin()] : []),
    new webpack.ids.HashedModuleIdsPlugin()
  ],
  optimization: {
    minimize: !isDevelopment,
    nodeEnv: isDevelopment ? 'development' : 'production',
    runtimeChunk: 'single',
    removeAvailableModules: false,
    removeEmptyChunks: true,
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'vendors'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 10
        }
      }
    },
    chunkIds: isDevelopment ? 'named' : 'deterministic',
    moduleIds: isDevelopment ? 'named' : 'deterministic'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/'
    },
    port: 3000,
    host: '127.0.0.1',
    open: false,
    hot: true,
    historyApiFallback: true,
    compress: true,
    liveReload: true,
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: false,
        ignored: '/node_modules/'
      }
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true
      },
      progress: true,
      logging: 'info'
    },
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  stats: {
    colors: true,
    timings: true,
    reasons: isDevelopment,
    assets: false,
    modules: false,
    entrypoints: false,
    children: false,
    errors: true,
    warnings: true,
    errorDetails: true
  },
  performance: {
    hints: isDevelopment ? false : 'warning',
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
    assetFilter: (assetFilename) => {
      return !assetFilename.endsWith('.map');
    }
  },
  cache: {
    type: isDevelopment ? 'memory' : 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
