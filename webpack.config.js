const path = require('path')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const {VueLoaderPlugin} = require('vue-loader')
module.exports = {
  target:'electron-renderer',
  mode:'production',
  node:{
    __dirname:true,
    __filename:true
  },
  externals:{
    asar:"require('asar')"
  },
  entry:{
    main:'./src/js/main.js',
    'image-trimmer':'./src/js/other-window/image-trimmer.js',
  },
  output:{
    path:path.resolve(__dirname, 'app/bundle/'),
    filename:'[name].js'
  },
  module:{
    rules:[
      {
        test:/\.vue$/,
        loader:'vue-loader'
      },
      {
        test:/\.stylus$/,
        use:[
          MiniCSSExtractPlugin.loader,
          'css-loader',
          'stylus-loader'
        ]
      }
    ]
  },
  plugins:[
    new VueLoaderPlugin(),
    new MiniCSSExtractPlugin({
      filename:'[name].css'
    })
  ],
  devtool:'cheap-eval-source-map'
}
