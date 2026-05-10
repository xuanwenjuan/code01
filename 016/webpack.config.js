const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? 'js/[name].js' : 'js/[name].[contenthash:8].js',
    chunkFilename: isDevelopment ? 'js/[name].chunk.js' : 'js/[name].[contenthash:8].chunk.js',
    clean: true,
    publicPath: '/',
    pathinfo: isDevelopment
  },
  mode: isDevelopment ? 'development' : 'production',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
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
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
              modules: false
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: isDevelopment 
            ? 'images/[name][ext][query]' 
            : 'images/[hash][ext][query]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: isDevelopment 
            ? 'fonts/[name][ext][query]' 
            : 'fonts/[hash][ext][query]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: '便利店商品管理系统',
      meta: {
        viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
        description: '小型便利店商品管理系统 - 基于React + TypeScript',
        'X-UA-Compatible': 'IE=edge'
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
      } : false,
      hash: !isDevelopment
    })
  ],
  devtool: isDevelopment ? 'eval-cheap-module-source-map' : 'source-map',
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    static: {
      directory: path.join(__dirname, 'public')
    },
    watchFiles: ['src/**/*', 'public/**/*']
  },
  optimization: {
    minimize: !isDevelopment,
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        default: false,
        defaultVendors: false,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        }
      }
    },
    usedExports: true
  },
  performance: {
    hints: isDevelopment ? false : 'warning',
    maxAssetSize: 500000,
    maxEntrypointSize: 500000
  },
  stats: {
    assets: true,
    colors: true,
    errors: true,
    errorDetails: true,
    hash: true,
    modules: false,
    warnings: true
  },
  target: ['web', 'es2015'],
  cache: isDevelopment ? {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  } : false,
  infrastructureLogging: {
    level: 'warn'
  }
};
