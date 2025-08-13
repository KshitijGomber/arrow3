const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Enable production optimizations
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Entry point
  entry: './src/index.js',
  
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: process.env.NODE_ENV === 'production' 
      ? 'static/js/[name].[contenthash:8].js'
      : 'static/js/bundle.js',
    chunkFilename: process.env.NODE_ENV === 'production'
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    publicPath: '/',
  },
  
  // Optimization settings
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk for third-party libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Material-UI specific chunk
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          chunks: 'all',
          priority: 20,
        },
        // React Query specific chunk
        reactQuery: {
          test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query[\\/]/,
          name: 'react-query',
          chunks: 'all',
          priority: 15,
        },
        // Common chunk for shared code
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // Runtime chunk
    runtimeChunk: {
      name: 'runtime',
    },
    // Minimize in production
    minimize: process.env.NODE_ENV === 'production',
  },
  
  // Performance hints
  performance: {
    maxAssetSize: 512000, // 500kb
    maxEntrypointSize: 512000, // 500kb
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
  },
  
  // Resolve configuration
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
    },
  },
  
  // Module rules
  module: {
    rules: [
      // JavaScript/JSX
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { runtime: 'automatic' }],
            ],
            plugins: [
              // Dynamic imports for code splitting
              '@babel/plugin-syntax-dynamic-import',
              // Tree shaking for Material-UI
              [
                'babel-plugin-import',
                {
                  libraryName: '@mui/material',
                  libraryDirectory: '',
                  camel2DashComponentName: false,
                },
                'core',
              ],
              [
                'babel-plugin-import',
                {
                  libraryName: '@mui/icons-material',
                  libraryDirectory: '',
                  camel2DashComponentName: false,
                },
                'icons',
              ],
            ],
          },
        },
      },
      // CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Images
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]',
        },
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]',
        },
      },
    ],
  },
  
  // Plugins
  plugins: [
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    
    // Bundle analyzer (uncomment to analyze bundle)
    // new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)(),
  ],
  
  // Development server
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    historyApiFallback: true,
    hot: true,
    port: 3000,
  },
};