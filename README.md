# 立体四目並べの棋譜管理アプリ

## アプリUI
<img width="1440" alt="2025-01-11" src="https://github.com/user-attachments/assets/67206450-013e-4903-b69b-a1289d0ab336" />

## はじめに
タイトルのとおりです。  
立体四目並べの研究に役立つように棋譜の管理をするためのwebアプリを作成しました。  
ローカルでnode.jsを使ってサーバーを起動し、ブラウザでhttp://localhost:8000 に接続して使用します。  

### 注意
localhostで動かすことのみを想定しているのでセキュリティの諸々は一切考慮していません。  
本アプリ制作者は本アプリの使用により生じた損害について一切の責任を負いません。  
公開サーバーで実行するなどの場合は自己責任でお願いします。  

## 動作環境
Linuxで作成しましたが、macでも動くことを確認しています。
以下のとおりです。  
```vb
Linux
>> cat /etc/os-release
PRETTY_NAME="Debian GNU/Linux 10 (buster)"
NAME="Debian GNU/Linux"
VERSION_ID="10"
VERSION="10 (buster)"
VERSION_CODENAME=buster
ID=debian
HOME_URL="https://www.debian.org/"

>> node -v
v16.20.2

macOS
>> sw_vers
ProductName:	macOS
ProductVersion:	14.3.1
BuildVersion:	23D60

>> node -v
v22.12.0
```
## 環境構築
```vb
>> apt-get install nodejs npm

>> node -V
v22.12.0

>> npm install
```

## 使い方
server.jsと同じディレクトリに移動。
そこでnpm start
```vb
>> cd /path/to/your/directory
>> npm start
> threejs_cube@1.0.0 start
> node server.js

Server is running on http://localhost:8000
```
これが表示されたらブラウザでhttp://localhost:8000 にアクセスしてください。  
※javascriptは有効にしてください。

## 機能
3D Viewer  
- 盤面を3次元で表現し、インタラクティブな操作ができるviewerを実装しました。  
- 柱をクリックすると球が出ます(柱ならどこをクリックしてもOKです)  
- 回すときはドラッグしてください。  
- スクロールすると盤面の拡大・縮小ができます。  

1手戻るボタン  
- 1手戻ることができます。  
- 「1手進む」ボタンと合わせてご活用ください。  

1手進むボタン  
- 1手進むことができます。  

resetボタン  
- 盤面を初期状態に戻します。  
- 初期状態からはreset前の状態に戻れませんのでご注意ください。  
- 警告は出ません。  

保存ボタン  
- viewerに表示されている盤面をローカルファイルに保存します。  
- 保存した棋譜には解析コードを適用し、自動的に樹形図化して画面右上の棋譜treeに表示されます。

棋譜Tree  
- ゲーム進行を樹形図に見立てて棋譜同士の位置関係を可視化しました。
- 保存した棋譜にMD5ベースのHashによって生成したIDを割り振り、解析を加えた後、樹形図として表示します。  
- 解析では、既に保存されているそれぞれの棋譜との共通項を見つけ出して抽出し、ゲーム進行における分岐点、つまり樹形図の分岐点を見つけています。  
- 例えば、A「0, 15, 3, 12, 1, 2, 13」と、B「0, 15, 3, 12, 13, 1」があったとき、共通項Cは「0, 15, 3, 12」ですので、  
以下のように表現されます(Cは勝手に樹形図に追加されます)。
```
└── C  
    ├─── A  
    └─── B  
```

棋譜Treeの検索
- 棋譜のIDを検索boxにいれると、棋譜検索の結果を表示の緑の部分に棋譜が表示されます。  
- 検索する際のIDは4文字の英数字なので、「_s」や「_g」を含めないでください。  

棋譜を3D viewerにセット
- SETボタンを押すと、緑の部分に表示された棋譜を3D viewerで見られるようになります。
- 手順も保存されているので「1手戻る」「1手進む」ボタンを使用することができます。

※保存した棋譜を消去したい場合は、ローカルの「/path/to/directory/public/python」にあるkifu.csvから手動で削除してください。  
hash対応表は同ディレクトリのunhash.csvにあるのでそのときは参考にしてください。
