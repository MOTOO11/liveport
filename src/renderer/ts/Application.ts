"use strict"
import * as Vue from "Vue";
import { Component, Watch } from "vue-typed"
import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import { Thread } from "./Thread";
import { VOICE } from "./Voices"
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import ProvideManager from "./ProvideManager";
import { remote } from "electron";
const ApplicatonName = require("../../../package.json").name
import * as $ from "jquery"
let APP_TITLE: string;

@Component({})
export default class Application extends Vue {
    provideManager: ProvideManager;
    // data
    message: string = 'このテキストはテストメッセージです';
    url: string = "";
    processing: boolean = false;
    thread: Thread;
    constructor() {
        super();
        Logger.log("start", "hello application.");
        APP_TITLE = ApplicatonName;
        remote.getCurrentWindow().setTitle(APP_TITLE);
        this.provideManager = new ProvideManager();
        this.thread = new Thread();
        this.url = "http://jbbs.shitaraba.net/bbs/read.cgi/netgame/12802/1478775754/";
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
                Logger.log("request success", newArrival.toString());
                this.setRequestTimer();
            },
            (err: any) => {
                Logger.log("request failed", err);
                this.setRequestTimer();
            }
        );
    }
    stopThreadRequest() {
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
    provideTimeLimit: number = 9;

    // 読み上げ時間数上限
    readingTimeLimit: number = 10;
    // 処理中レス番号
    // ユーザーが変更可能
    nowNumber: number = 0;
    reading: boolean = true;

    startProvide() {
        if (!this.processing) return;
        clearTimeout(this.provideTimerID);
        if (this.nowNumber != this.allNum()) {
            let target = this.thread.reses[this.nowNumber];
            this.provideManager.provide("レス" + target.num, target.text, this.reading);
            this.nowNumber++;
            if (this.autoScroll)
                this.scrollTo(this.nowNumber);
        } else {
            this.provideManager.dummyText(this.dummyText);
        }
        this.setProvideTimer();
    }
    stopProvide() {
        clearTimeout(this.provideTimerID);
        this.provideManager.cancel();
        this.provideDummyTest();
    }
    setProvideTimer() {
        if (!this.processing) return;
        this.provideTimerID = window.setTimeout(() => {
            this.startProvide();
        }, this.readingTimeLimit * 1000);
    }

    start() {
        this.processing = true;
        if (this.url != this.thread.url) {
            this.thread = Thread.threadFactory(this.url);
            this.nowNumber = 0;
            Logger.log("change", "modified thread url.");
        }
        this.startThreadRequest();
        this.startProvide();
    }

    stop() {
        this.processing = false;
        this.stopThreadRequest();
        this.stopProvide();
    }

    allNum() {
        return this.thread.reses.length;
    }

    latest() {
        this.nowNumber = this.thread.reses.length;
        this.scrollTo(this.nowNumber);
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
        if (this.processing) return;
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

    snackbar(data: {}) {
        var snackbarContainer: any = document.querySelector('#demo-snackbar-example');
        // var handler = function (event) {
        //     Logger.log("snackbar", "");
        // };
        // var data = {
        //     message: 'Button color changed.',
        //     timeout: 0,
        //     actionHandler: handler,
        //     actionText: 'Undo'
        // };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    loadSettings() {
        this.voice = VOICE.WSA;
        this.provideManager.selectVoice(this.voice);
    }
    saveSettings() {

    }

    test(letter: string, body: string) {
        this.provideManager.test(letter, body, this.reading);
    }

    autoScroll: boolean = false;
    cnangeAutoScroll() {
        this.autoScroll = !this.autoScroll;
    }
    scrollTo(value: number, duration?: number) {
        $('.mdl-layout__content').animate({
            scrollTop:
            $('#MESSAGE-' + value).get(0).offsetTop
        }, duration ? duration : 1000);
    }

    @Watch('thread.title')
    onTitleChange(newValue: number, oldValue: number) {
        this.setTitle(APP_TITLE + " - " + this.thread.title);
    }

    @Watch('reading')
    onrChange(newValue: number, oldValue: number) {
        Logger.log("reading",this.reading)
    }

    voice: number = 0;
    // softalk or bouyomichan
    path: string = "";
    @Watch('voice')
    onVoiceChange(newValue: number, oldValue: number) {
        switch (this.voice) {
            case VOICE.WSA:
                this.provideManager.selectVoice(newValue);
                break;
            case VOICE.SOFTALK:
                this.provideManager.selectVoice(newValue, this.path);
                break;
        }
    }

    findSofTalkPathDialog() {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            filters: [
                { name: 'exe', extensions: ['exe'] }
            ]
        }, (paths: string[]) => {
            if (paths) {
                this.path = paths[0];
                if (this.voice === VOICE.SOFTALK)
                    this.provideManager.selectVoice(VOICE.SOFTALK, this.path);
            }
        });
    }

    existsSofTalkPath() {
        if (this.path == "")
            this.findSofTalkPathDialog();
    }
}