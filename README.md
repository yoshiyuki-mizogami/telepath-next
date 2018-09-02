# telepath-next
Telepath Next generation

## サーバ構築
[サーバ設定](telepath-server-construction.md)

接続先情報が`server/share.json`に書かれているので、  
現行のサーバとは別で構築したい場合などに修正。

## ネイティブモジュールがあるので、windows-build-toolsをインストール
```sh
#管理者権限で立ち上げたCMDから
npm i -g windows-build-tools
```
もしくは
```sh
set NODE_TSL_REJECT_UNAUTHRIZED=0
```
で証明書エラーをパスするようにすることでコンパイル済みバイナリが落とせる

## 開発用インストール
```sh
npm i
```

## 開発用の起動 webpackのwatch
```sh
gulp dev
```

## ローカルサーバ起動
```sh
gulp boot-server
```

## ローカルサーバへ接続
```sh
gulp dev-local
```

## リリース用コンパイル
```sh
gulp compile-product
```

## asarのデプロイ
自動アップデートを実現するため、サーバにasarをアップロードし、  
DB上の最新バージョンでなければasarを送信してローカルのプログラムを上書きする
```sh
#サーバ上のasarの更新
gulp deploy-asar
#DB上のversionをローカルのバージョンと同期
gulp sync-ver
# サーバでバージョン情報を読み込み直し
gulp reload-server-funcs
```

## サーバプログラムの修正反映
```sh
gulp deploy-server
# 無停止
gulp reload-server-funcs
```

## インストーラのデプロイ
インストーラをビルドしてシェアポイント上のインストーラを更新  
asarによって最新になるので、この操作が必要なのは、Electron自体のバージョンアップがあり、最新の機能を使いたい時
```sh
gulp deploy
```


## crt create process
```sh
openssl genrsa 2048 > mine.key

openssl -req -new -key mine.key -subj "/C-JP/ST=Tokyo-to/L=Minato/O=ComEng/OU=IT dept./CN=SYstemDevCA" > mine.csr
# piriod is a dicade
openssl x509 -days 3650 -req -signkey mine.key min.key < mine.csr > mine.crt
openssl pkcs12 -export -inkey mine.key -in mine.crt > mine.pfx
# ask passprase
```

## Telepath app package.json scheme

```json
{
  /* requires */
  "name":"Stirng as app name as ID for TLApp",
  "caption":"String as app Title showed on app store search result",
  "description":"String as app description. Showed on app store detail view",
  "icon":"String as app icon png path, relative from app root dir",
  "window":"Object as Electron window parameters",
  "version":"String as semantic versioning",
  "main":"Stirng as first load html path relative app root dir",
  /*optional*/
  "unpack":"Boolean as unpack all app resources default false",
  "devtool":"String pass to Electron Browerwindow.addDevToolsExtension relative app root dir for test local app"
}
```

## Telepath app functions

```js
const {ipcRenderer} = require('electron')
const srcFile = 'c:\\sample.txt' //ファイルシェルで暗号化されたファイル(暗号化されていなくてもOK)
/* レスポンスで利用されるイベント名(自分で決める)
 * 複数のファイルを一括で解除する場合、イベント名に数字をつけるなどしてずらさないと、onceによって1対1の関係にならないため注意 */
const unprotectedEvent = 'unprotected'
ipcRenderer.send('unprotect-fileshell', srcFile, unprotectedEvent)

ipcRenderer.once(unprotectedEvent, (ev, unprotectedFilePath)=>{
  console.log(unprotectedFilePath) // tmpに保存された暗号化解除されたファイルパス
})
```
## is test check
```js
/* in renderer process*/
const {remote}= require('electron')
const w = remote.getCurrentWindow()
w.TL_TEST // => true is test local app
```

## CLIからテレパスアプリをアップロード 
```sh
[your installed telepath exe path] --upload [your/upload/package.path]
```
example
```sh
%userprofile%\Programs\telepath-next\TelepathNext.exe --upload D:\my-pj\package.json
```
コマンドラインのみでアップ出来るわけではなく、  
テレパスは起動中かつログイン中であること  
(現状のログインユーザ情報を基にアップロードする)

