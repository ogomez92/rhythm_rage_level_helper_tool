const path = require('path')

module.exports = function (env, argv) {
  const config = {
    target: 'node',
    externalsPresets: { electronRenderer: true },
    devtool: 'inline-source-map',
    entry: './src/main.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@src': path.resolve(__dirname, 'src'),
        '@lib': path.resolve(__dirname, 'src', 'lib'),
      }
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname)
    }
  }

  return config
}
