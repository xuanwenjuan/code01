const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  entry: {
    main: './src/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
    chunkFilename: isDevelopment ? 'js/[name].chunk.js' : 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true,
    publicPath: '/',
    pathinfo: isDevelopment
  },
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@types': path.resolve(__dirname, 'src/types')
    },
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
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
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
              importLoaders: 0,
              modules: false
            }
          }
        ],
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
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
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      title: '小型书店图书管理系统',
      filename: 'index.html',
      inject: 'body',
      minify: !isDevelopment ? {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
        minifyJS: true
      } : false,
      meta: {
        viewport: 'width=device-width, initial-scale=1.0',
        description: '小型书店图书管理系统 - 本地数据持久化、完整的图书管理功能'
      }
    }),
    ...(!isDevelopment ? [
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        ignoreOrder: true
      })
    ] : [])
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/'
    },
    port: 3000,
    host: '0.0.0.0',
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    watchFiles: ['src/**/*', 'public/**/*']
  },
  optimization: {
    moduleIds: isDevelopment ? 'named' : 'deterministic',
    chunkIds: isDevelopment ? 'named' : 'deterministic',
    runtimeChunk: 'single',
    removeAvailableModules: !isDevelopment,
    removeEmptyChunks: !isDevelopment,
    splitChunks: {
      chunks: 'all',
      minSize: isDevelopment ? 0 : 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: isDevelopment ? 'vendors' : 'vendors'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: isDevelopment ? 'react' : 'react',
          priority: 20
        }
      }
    },
    ...(!isDevelopment ? {
      minimize: true,
      usedExports: true,
      sideEffects: true,
      concatenateModules: true
    } : {})
  },
  performance: {
    hints: isDevelopment ? false : 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    }
  },
  stats: {
    children: false,
    modules: false,
    chunks: false,
    chunkModules: false,
    assets: true,
    colors: true,
    timings: true,
    errors: true,
    warnings: true,
    errorDetails: true
  },
  cache: isDevelopment ? {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  } : false,
  watchOptions: isDevelopment ? {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000
  } : undefined
};
