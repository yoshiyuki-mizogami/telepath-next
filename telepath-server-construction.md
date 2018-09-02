# テレパスサーバ構築ログ

## Mongodbのインストール
[Mongo 32bit](https://www.mongodb.org/dl/win32/i386)
より、バージョン3.2のlatest msiを選択(Windows 32bitだと3.2までしか対応してない)  
64bitになったら最新でGo

----nobeメモ_￠----
latestで検索して、v3.2と書かれている「～ｖ3.2～.msi」のnameの所をクリック。
ダウンロードされたファイルを実行し、選択させる画面では「complete」を選択。
インストールされる場所としては、聞かれないので、探しましょう。
私の場合は、下記のミドルウェア本体　インストール場所例にありました。


## PATHを通す
`D:\mongodb\mongodb\`  
にインストールすると、更にbinディレクトリが中にできるのでPATHを通す=>mongoコマンドが使えるようになる  

現在10.26.196.243の共有端末をサーバとして利用している。  

## 各コンポーネント配置ディレクトリ  
D:\mongodbでの構築例。

Telepath-Nextサーバプログラム  
`D:\telepath-next-server`

MongoDB DB Rootディレクトリ  
`D:\mongodb`  

MongoDBのデータベース本体格納場所  
`D:\mongodb\db`

MongoDB ミドルウェア本体  
インストール場所  
例：`C:\Program Files\MongoDB\Server\3.2\bin`

MongoDB ログディレクトリ(作っておく)  
`D:\mongodb\mongodb\logs`  

MongoDB configファイル(作っておく)  
`D:\mongodb\mongodb\config`  

[mongodb\mongodb.conf](mongodb\mongodb.conf)  
上記のファイルを
`D:\mongodb\mongodb\config`に置く


同一の構成で作ることを前提にする。  
`/mongodb/mongodb.conf`をコンフィグ配置場所へ置く

ポータビリティを考えて全て１つのディレクトリの中に入るようにしている

## mongodb をWindowsのサービスに登録する
```sh
#管理者で起動したCMDより(サービス登録は管理者権限でないとできません)
mongod.exe --install --serviceName mongodb --config "D:\mongodb\mongodb\config\mongo.conf" 
```
とすることで、WindowsのサービスにMongodbが登録されるので
```sh
# as administrator
sc start mongodb
sc stop mongodb
```
で起動、停止ができるようになる

## 管理ユーザ、接続ユーザの作成
一度configのsecurity.authorizationをdisabledにして立ち上げ、管理ユーザを作成する(そうしないとそもそも誰も入れない)  
security.authorizationが有効になっていると、認証無では、何もできない。  
security.authorizationを無効とすることで認証なしで全ての操作が出来る

security.authorizationがenableで認証無でログインした場合
```sh
show dbs
-> "errmsg" : "not authorized on admin to execute command～”
```


```sh
sc start mongodb
#ローカルサーバへのログインは引数なしで
mongo
```

```js
// スーパーユーザ(systemSuper)作成 
use admin
db.createUser({
  user:'systemSuper',
  pwd:'systemDev',
  roles:[
    {
      role:'root',
      db:'admin'
    }
  ]
})
//telepathDBに接続用ユーザ作成
use telepath
db.createUser({
  user:'telepathUser',
  pwd:'telepathPassword',
  roles:[
    {
      role:'dbOwner',
      db:'telepath'
    }
  ]
})
```
ここまでできたら一度mongodbを落として、  
configのsecurity.authorizationをenabledにして立ち上げ直し、  
systemSuper、及びtelepathUserでログインを確認
```sh
sc stop mongodb
# turn security.authorization enabled
sc start mongodb
```
```sh
mongo -u systemSuper -p systemDev --authenticationDatabase admin
#ログアウト
mongo -u telepathUser -p telepathPassword --authenticationDatabase telepath
# telepathUserはshow dbsできない。
```

## Backup Restore
mongoのインストールとともに  
mongoコマンドのほか、Utilityとしてmongodump, mongorestoreコマンドがbinに入っているのでバックアップ等はそれを使う
```sh
#ローカルホストからbkupフォルダへバックアップ
mongodump /v /host:localhost /username:systemSuper /password:systemDev /db:telepath /authenticationDatabase:admin /out:bkup
#バックアップしたファイルからレストア
mongorestore /v /host:localhost /username:systemSuper /password:systemDev /authenticationDatabase:admin /db:telepath bkup-\telepath

## 基本操作

```sh
# DB一覧(要admin権限)
show dbs
# 対象DBへ移動
use $dbname
# コレクション一覧
show collections
```

### 最初の管理ユーザ登録
$var
```js
use telepath
db.users.insertOne({
  name:'$first_admin_user_name',
  account:'$first_admin_user_account',
  pwd:'$initial_pwd',
  root:true
})
```

### コレクションからのドキュメント検索
```js
//find 検索結果をカーソルで返す
db.users.find({name:'山田 太郎'})
//カーソルが返ってくるので量が多い時はitでページ送りする
//一括で全て出力したいのであれば.toArray()とする(大量の出力の際は注意)
//findOne 単一オブジェクトを返す
db.users.findOne({name:'山田 花子'})
//正規表現による検索
db.users.findOne({name:/^山本/})
//出力フィールドを限定
db.users.find({}, {name:true, account:true})

//高度な検索 $で始まる特殊な識別子を使う
//入れ子が多くなるので別で作って貼り付けるようにしたほうがいい
//AND検索(別フィールドをAND条件にするなら単にオブジェクトの別フィールドに書けばいい)
db.users.find({$and:[
  {
    name:/^山/
  },
  {
    name:/郎$/
  }
]}) //=>山田で始まり、郎で終わる名前
//OR検索
db.users.find({$or:[
  {
    name:/^山田/
  },
  {
    name:/太郎$/
  }
]})//=>山田で始まるか、太郎で終わる名前
//以上/以下
db.users.find({
    lastLogin:{
      $gte:new Date('2018/05/01'),
      $lte:new Date('2018/06/01')
    }
})//=>最後のログインが特定期間である
// aggregation で配列に渡した集約処理をパイプライン処理する。
// apps のauthorにはObjectIDが使われているので、usersから実ユーザを引っ張ってくる
db.apps.aggregate([
  {
    $lookup:{
      from:'users',//users コレクション から
      localField:'author', //自コレクションのauthorと
      foreignField:'_id',//users の_idを結びつけて
      as:'author'//authorとして当てはめる
    }
  },
  /*特定フィールドのみ*/
  {
    $project:{
      name:1,//trueを略
      caption:1,
      description:1,
      'author.name':1
    }
  },
  /*lookupした部分が配列になるので$unwindして平坦にする*/
  {
    $unwind:'$author'
  }
]).toArray()

//終了
exit
```
完全なドキュメント
[MongoDB query doc](https://docs.mongodb.com/manual/tutorial/query-documents/)

## ROBO T3
[ROBO T3](https://robomongo.org/)というMongoの高機能なGUIクライアントがあるが、64bit版しかないので現状導入していない  
端末変わったら入れると幸せになれるかもしれない。
