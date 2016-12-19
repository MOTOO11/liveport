## liveport  - live broadcast support tool.
したらば掲示板・CaveTubeのコメントを、ブラウザ上に表示・読み上げ  
### [download](https://github.com/odangosan/liveport/releases)
### 概要
したらば掲示板・CaveTubeのコメントを、読み上げます。  
OBS Studioを使用している場合、字幕をOBS Studio内で表示することが出来ます。
### 使い方
#### スレッドビューワーとして使う場合
* liveport.exeを起動
* またはliveport.exe [URL] として起動
#### OSB Studioで使う場合
* liveport.exe [server] 引数をつけて起動
 * 2つ以上[server]として立ち上げるとエラーが発生します
* OBS Studioの設定
  * ソース/BrowserSourceを追加
  * ダイアログに以下を入力
    * URL : http://localhost:3000
    * CSS :  
  body {  
    background-color: rgba(0, 0, 0, 0);  
    overflow: hidden;  
    color:white;  
    }
    * CSSはカスタマイズ可能
    * font-sizeは設定不可(config.jsonで設定)
    * background-color: rgba(0, 0, 0, 0); 背景透過（必須）
    * overflow: hidden; 長い文章を途中で省略する（必須）
    * color:white; 文字の色（変更可能）
    * [縁取り文字サンプル](https://gist.github.com/odangosan/ca0136457358747a7bd8dae1bcd39f49)
* タイトルバーにURLを入力後、**[▶]読み込み開始**ボタンを押す

#### 詳細設定
* [resources/app/build/config.json]を編集すると設定を変更できます
  * 初回起動時に作成されます
  * NGワード・読み替え・表示装飾など
* 着信音は[resources/app/build/assets/audio]フォルダ内のmp3ファイルがランダムに使用されます
* データは以下に保存されます
  * C:\Users\%USERNAME%\AppData\Roaming\liveport\
  * アンインストールする際にはこのフォルダも削除してください

### 対応しているURL
 * したらば[http://jbbs.shitaraba.net/bbs/read.cgi/[ジャンル]/[掲示板ID]/[スレッドID]/]
 * CaveTube[https://www.cavelis.net/live/[配信名]] 

### 読み上げボイスを変える
 * デフォルトの[WSA]を使うためには
  * [Microsoft Server Speech Text to Speech Voice (ja-JP, Haruka)]のインストールが必要です
 * sofTalkを使う場合は[Softalk/vrsのパス]でSofTalk.exeを選択する
 * 民安Talkを使う場合は[Softalk/vrsのパス]でvrx.exeを選択する
   * ※民安Talkを使う場合、読み上げ時間制限の設定値により民安Talkに送られる文章が途中で省略される場合があります
 * 棒読みちゃんを使う場合は棒読みちゃん.exeを先に起動しておく
   * パスには同梱の[RemoteTalk/RemoteTalk.exe]を選択する

* ver 1.0.0
  * 初版
