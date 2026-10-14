import path from 'path';

export default {
  module: {
    rules: [
      {
        test: /^(?!.*\.(co|cy|spec)\.ts$).*\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['babel-plugin-istanbul'],
          },
        },
        enforce: 'post',
        include: path.join(__dirname, '..', 'src'),
        exclude: [/node_modules/, /cypress/, /(ngfactory|ngstyle)\.js/],
      },
    ],
  },
};
