const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = (env, argv) => {
  const config = {
    resolve: {
      alias: {
        '@': './src',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.wasm'],
    },
    entry: './src/index.tsx',
    output: {
      filename: '[id].[hash].js',
    },
    module: {
      rules: [
        {
          test: /\.(js|ts)[x]?$/,
          exclude: /node_modules/,
          include: [`${__dirname}/src`, `${__dirname}/pkg`],
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: ['@babel/plugin-syntax-dynamic-import'],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.ejs',
        filename: './index.html',
        chunksSortMode: 'none',
        minify: {
          // 压缩HTML文件
          removeComments: true, // 移除HTML中的注释
          collapseWhitespace: true, // 删除空白符与换行符
          minifyCSS: true, // 压缩内联css
        },
      }),
      new CopyWebpackPlugin([
        {
          from: './public',
          to: '.',
        },
      ]),
      new WasmPackPlugin({
        crateDirectory: '.',
      }),
    ],
  };
  if (argv.mode === 'development') {
    // config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.devServer = {
      port: 3000,
      // hot: true,
    };
  }
  if (argv.mode === 'production') {
    config.plugins.push(
      new UglifyJsPlugin({
        uglifyOptions: {
          parallel: true,
          compress: {
            warnings: true,
            dead_code: true,
            drop_debugger: true,
            drop_console: true,
          },
        },
      }),
    );
    config.plugins.push(new CleanWebpackPlugin());
  }
  return config;
};
