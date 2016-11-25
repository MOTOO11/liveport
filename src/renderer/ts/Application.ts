import * as Vue from "Vue";
import { Component, Watch } from "vue-typed"
import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import { Thread } from "./Thread";
import StringUtil from "./StringUtil";
import ProvideManager from "./ProvideManager";
import { remote, BrowserWindow } from "electron";
const ApplicatonName = require("../../../package.json").name
import * as $ from "jquery"

@Component({})
export default class Application extends Vue {
    provideManager: ProvideManager;
    // data
    message: string = 'こんにちは!';
    url: string = "";
    // dat取得
    reload: number = 7;
    // dat取得タイマーId
    reloadTimerID: number;
    // dat取得カウントダウン
    reloadTimerCountDown: number = this.reload;

    // 表示タイマーID
    displayTimerID: number;
    // 表示カウントダウン
    displayTimerCountDown: number;

    // 読み上げ時間上限
    readingLimit: number = 140;

    // 処理中レス番号
    // ユーザーが変更可能
    nowNumber: number = 0;

    processing: boolean = false;
    thread: Thread;
    // softalk or bouyomichan
    path: string = "";

    // browser frame size
    width: number; height: number;
    constructor() {
        super();
        console.log("hello application.");
        remote.getCurrentWindow().setTitle(ApplicatonName);
        this.provideManager = new ProvideManager();
        this.thread = new Thread();
        this.url = "http://jbbs.shitaraba.net/bbs/read.cgi/game/57693/1479580233/";
        this.loadSettings();
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
    startProvide() {
        // this.present();
    }

    // provide() {
    //     this.provideManager.provide();
    //     this.socket.emit('message', this.message);
    //     if (this.speaking)
    //         this.speaker.speak(this.message);
    //     if (this.processing) {
    //         this.displayTimerID = window.setTimeout(() => {
    //         }, 8000);
    //     }
    // }

    start() {
        this.provideManager.resize(this.width, this.height);
        this.processing = true;
        if (this.url != this.thread.url) {
            this.thread = Thread.threadFactory(this.url);
            console.log("new thread");
        }
        this.startThreadRequest();
        this.startProvide();
    }

    stop() {
        this.processing = false;
        clearTimeout(this.reloadTimerID);
        clearTimeout(this.displayTimerID);
        this.provideManager.cancel();
    }

    get allNum() {
        return this.thread.reses.length;
    }

    voice: number = 0;
    @Watch('voice')
    onVoiceChange(newValue: number, oldValue: number) {
        let path = "E:/tools/softalk/SofTalk.exe";;
        // path = "E:/tools/Output-CommandLine/Output-CommandLine.exe";
        this.voice === 2 ?
            this.provideManager.selectVoice(newValue, path) :
            this.provideManager.selectVoice(newValue);
    }

    latest() {
        this.nowNumber = this.thread.reses.length;
        $('.mdl-layout__content').animate({
            scrollTop:
            $('#MESSAGE-' + this.nowNumber).get(0).offsetTop
        });
    }
    setTitle(name: string) {
        remote.getCurrentWindow().setTitle(name);
    }

    // 表示するものがない時
    dummyText: string = "";

    showDummyTextWindow() {
        var dialog: any = document.querySelector('dialog');
        dialog.showModal();
        dialog.querySelector('.close').addEventListener('click', () => {
            dialog.close();
        });
    }

    replace(msg: string) {
        var utl = StringUtil.urlToLink(msg);
        return StringUtil.anchorToInnerLink(utl);
    }

    // computed
    get validUrl() {
        return Thread.isShitarabaURL(this.url);
    }

    snackbar() {
        var snackbarContainer: any = document.querySelector('#demo-snackbar-example');
        var handler = function (event) {
            console.log("push");
        };
        var data = {
            message: 'Button color changed.',
            timeout: 0,
            actionHandler: handler,
            actionText: 'Undo'
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    loadSettings() {
        this.voice = 1;
        this.provideManager.selectVoice(this.voice);
    }
    saveSettings() {

    }

    test(letter: string, body: string) {
        this.provideManager.provide(letter, body);
    }
}
