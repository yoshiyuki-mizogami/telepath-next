const path = require('path')
const {VueLoaderPlugin} = require('vue-loader')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const base = {
  target:'electron-renderer',
  mode:'production',
  entry:{
    main:'./manager/src/js/main.js'
  },
  output:{
    path:path.resolve(__dirname, 'manager/app/bundle/'),
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
  ]
}
module.exports = base
