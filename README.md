## liveport  - live broadcast support tool.
したらば掲示板の読み込み、ブラウザ上に表示・読み上げ(v0.0.1)
### 使い方
* liveport.exeを起動
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
* URLを入力後、**[▶]読み込み開始**ボタンを押す。
* 詳細な設定は[resources/app/config.json]



* ver 0.0.1
  * 初版
