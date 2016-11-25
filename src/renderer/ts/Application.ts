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
    processing: boolean = false;
    thread: Thread;

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

    // dat取得
    reload: number = 7;
    // dat取得タイマーId
    reloadTimerID: number;
    // dat取得カウントダウン
    reloadTimerCountDown: number = this.reload;

    startThreadRequest() {
        if (!this.processing) return;
        this.reloadTimerCountDown = this.reload;
        this.thread.request(
            (newArrival: number) => {
                console.log("request success :" + newArrival);
                this.setRequestTimer();
            },
            (err: any) => {
                console.log("request failed :" + err);
                this.setRequestTimer();
            }
        );
    }
    stopThreadRequest(){
        clearTimeout(this.reloadTimerID);
    }

    setRequestTimer() {
        if (!this.processing) return;
        if (this.reloadTimerCountDown < 0) {
            this.startThreadRequest();
        } else {
            this.reloadTimerID = window.setTimeout(() => {
                this.reloadTimerCountDown--;
                this.setRequestTimer();
            }, 1000);
        }
    }

    // 表示タイマーID
    provideTimerID: number;
    // 表示カウントダウン
    // provideTimerCountDown: number;
    provideTimeLimit: number = 7;

    // 読み上げ文字数上限
    readingLimit: number = 140;
    // 処理中レス番号
    // ユーザーが変更可能
    nowNumber: number = 0;

    startProvide() {
        if (this.nowNumber != this.allNum()) {
            this.nowNumber++;
            let target = this.thread.reses[this.nowNumber];
            // this.provideManager.provide();
        } else {
            this.provideManager.dummyText(this.dummyText);
        }
        this.setProvideTimer();
    }

    setProvideTimer() {
        if (this.processing) {
            this.provideTimerID = window.setTimeout(() => {
                this.setProvideTimer();
            }, this.provideTimeLimit * 1000);
        }
    }

    start() {
        this.provideManager.resize(this.width, this.height);
        this.processing = true;
        if (this.url != this.thread.url) {
            this.thread = Thread.threadFactory(this.url);
            console.log("change thread url.");
        }
        this.startThreadRequest();
        // this.startProvide();
    }

    stop() {
        this.processing = false;
        this.stopThreadRequest();
        clearTimeout(this.provideTimerID);
        this.provideManager.cancel();
        this.provideDummyTest();
    }

    allNum() {
        return this.thread.reses.length;
    }

    voice: number = 0;
    // softalk or bouyomichan
    path: string = "";
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
    provideDummyTest() {
        this.provideManager.dummyText(this.dummyText);
    }
    @Watch('dummyText')
    onDummyTextChange(newValue: number, oldValue: number) {
        this.provideManager.dummyText(this.dummyText);
    }

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
