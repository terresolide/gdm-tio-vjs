var path = require('path')
var webpack = require('webpack')
var PACKAGE = require('./package.json');
var buildVersion = PACKAGE.version;
var buildName = PACKAGE.name;
var {CleanWebpackPlugin} = require('clean-webpack-plugin');
var prodUrl = PACKAGE.production.url + '/' + buildName + '@' + buildVersion +  '/dist/' ;
const VueLoaderPlugin = require('vue-loader/lib/plugin')
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
var pathsToClean = [
  'dist/*.*'
]

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: buildName + '.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
       /* options: {
          loaders: {
        	  i18n: '@kazupon/vue-i18n-loader'
          } 
          // other vue-loader options go here
        }*/
      },
     {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@intlify/vue-i18n-loader'
      },
      {
        test: /\.css$/,
        use: [ 'vue-style-loader','css-loader' ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
     
       {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'url-loader' /*,
          options: {
            limit: 10000,
            name: 'assets/fonts/[name].[hash:7].[ext]'
          }*/
        }]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/img/[name].[hash:7].[ext]',
          esModule: false
        }
      }
    ]
  },
  plugins: [
	  new VueLoaderPlugin() 
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json', '.jsx'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}
if (process.env.NODE_ENV === 'development') {
  module.exports.mode ="development"
	module.exports.output.filename='build.js'
}
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  module.exports.optimization= {
    minimize: true
  }
  module.exports.output.publicPath = prodUrl;
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns:pathsToClean}),
  
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}

