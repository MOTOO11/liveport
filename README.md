## liveport  - live broadcast support tool.
##### 使い方
* liveport.exeを起動
* obs studio/ソース/BrowserSourceを追加　ダイアログに以下を入力
  * URL : http://localhost:3000
  * CSS : body { background-color: rgba(0, 0, 0, 0);  overflow: hidden; color:white;}
  * CSSはカスタマイズ可能(;で区切り)
  * background-color: rgba(0, 0, 0, 0);背景透過（必須）
  * overflow: hidden;長い文章を途中で省略する（必須）
  * color:white;文字の色（変更可能）
* URLを入力後、**[▶]読み込み開始**ボタンを押す。



* ver 0.0.1 (161204)
  * 初版
