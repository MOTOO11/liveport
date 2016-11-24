import * as Vue from "Vue";
import { Component, Watch } from "vue-typed"
import * as child_process from "child_process"
import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import * as io from "socket.io-client";
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import { Thread, Res } from "./Thread";
import StringUtil from "./StringUtil";
import { remote, BrowserWindow } from "electron";
const ApplicatonName = require("../../../package.json").name
import * as $ from "jquery"

@Component({})
export default class Application extends Vue {
    speaker: Speaker;
    speaking: boolean = false;
    socket = io.connect("http://localhost:3000");
    // data
    message: string = 'こんにちは!';
    url: string = "";
    // dat取得
    reload: number = 7;
    // dat取得タイマーId
    reloadTimerID: number;
    // dat取得カウントダウン
    reloadTimerCountDown: number;

    // 表示タイマーID
    displayTimerID: number;
    // 表示カウントダウン
    displayTimerCountDown: number;

    // 読み上げ時間上限
    readingLimit: number = 8;

    // 処理中レス番号
    // ユーザーが変更可能
    nowNumber: number = 0;

    // 表示するものがない時
    dummyText: string = "";
    processing: boolean = false;
    thread: Thread;
    // softalk or bouyomichan
    path: string = "";

    // browser frame size
    width: number; height: number;
    constructor() {
        super();
        console.log("hello application.");
        this.speaker = new SofTalk();
        remote.getCurrentWindow().setTitle(ApplicatonName);
        this.thread = new Thread();
        this.url = "http://jbbs.shitaraba.net/bbs/read.cgi/game/57693/1479580233/";
    }

    datRequestSuccess(newArrival: number) {
        console.log("request success :" + newArrival);
        this.setRequestTimer();
    };
    datRequestFailed(err: any) {
        console.log("request failed :" + err);
        this.setRequestTimer();
    };
    setRequestTimer() {
        // if (this.processing) {
        //     this.reloadTimerID = window.setTimeout(() => {
        //         this.startThreadRequest();
        //     }, this.reload * 1000);
        // }
    }

    startThreadRequest() {
        this.thread.request(this.datRequestSuccess, this.datRequestFailed);
    }
    startDisplay() {
        // this.present();
    }

    // computed
    get validUrl() {
        return Thread.isShitarabaURL(this.url);
    }

    present() {
        this.socket.emit('message', this.message);
        if (this.speaking)
            this.speaker.speak(this.message);
        if (this.processing) {
            this.displayTimerID = window.setTimeout(() => {
            }, 8000);
        }
    }

    test() {
        var snackbarContainer: any = document.querySelector('#demo-snackbar-example');
        var handler = function (event) {
            console.log("push");
        };
        var data = {
            message: 'Button color changed.',
            timeout: 2000,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    _speak(message: string) {
        this.speaker.speak(message);
    }

    resize() {
        this.socket.emit('resize', {
            width: this.width, height: this.height
        });
    }

    replace(msg: string) {
        var utl = StringUtil.urlToLink(msg);
        return StringUtil.anchorToInnerLink(utl);
    }

    /*
    開始ボタンが押せるならURLは正しい
    ：URLが変わっている場合はthreadをnewする
    リサイズ情報を送信する
    dat取得タイマーと表示＆読み上げ用タイマーを起動する
        ・並列処理
            ・datリクエスト開始
            ・成功した場合はthread.resesに新着レスが追加される
            ・新着があった場合はsuccess callbackにtrueが入る
            ・失敗した場合は失敗した事を通知する（トースト）
            ・成功失敗にかかわらずprocessingがtrueなら次のタイマーを設定する

            ・表示していないレスがあれば表示
            ・displaycountで次に移る
            ・nowNumberと allNumが一緒ならば処理を実行せずに次のタイマーを設定する
    */
    start() {
        this.resize();
        this.processing = true;
        // this.thread = new Thread(this.url);
        remote.getCurrentWindow().setTitle("start");
        $("html, body").animate({ scrollTop: 0 }, 1000);
        // this.$forceUpdate();
        // this.startDisplay();
        // this.startThreadRequest();
        this.url = "http://jbbs.shitaraba.net/bbs/read.cgi/computer/38088/1479927578/";
        if (this.url != this.thread.url)
            this.thread = Thread.threadFactory(this.url);
        // this.thread.request(this.success, this.failed);
        this.thread.request(this.datRequestSuccess, this.datRequestFailed);
    }

    stop() {
        this.processing = false;
        // clearInterval(this.reloadTimerID);
        // clearInterval(this.displayTimerID);
    }

    get allNum() {
        return this.thread.reses.length;
    }

    voice: number = 1;
    @Watch('voice')
    onVoiceChange(newValue: number, oldValue: number) {
        if (newValue === 1) {
            this.speaker = new WebspeechApi();
        } else if (newValue === 2) {
            this.speaker = new SofTalk();
        }
        console.log("change speaker : " + newValue)
    }

}
