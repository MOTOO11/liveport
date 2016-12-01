"use strict"
import * as Vue from "Vue";
import { Component, Watch } from "vue-typed"
import { Thread } from "./Thread";
import { VOICE, VoiceParameter } from "./Voice"
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import ProvideManager from "./ProvideManager";
import { remote } from "electron";
const ApplicatonName = require("../../../package.json").name
import * as $ from "jquery"
const SETTINGS = "settings";

@Component({})
export default class Application extends Vue {
    provideManager: ProvideManager;
    // data
    testMessage: string = 'このテキストはテストメッセージです';
    url: string = "";
    processing: boolean = false;
    thread: Thread;
    constructor() {
        super();
        Logger.log("start", "hello application.");
        this.provideManager = new ProvideManager();
        this.setTitle("");
        this.thread = new Thread();
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
            this.provideManager.provide("レス" + target.num + ":", target.text, this.reading);
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
        this.loadUrl();
        this.startThreadRequest();
        this.startProvide();
    }

    loadUrl() {
        if (this.url != this.thread.url) {
            this.initUrlSource();
            Logger.log("change", "modified thread url.");
        }
    }
    initUrlSource() {
        this.thread = Thread.threadFactory(this.url);
        this.nowNumber = 0;
    }
    // refresh
    requestOnce() {
        if (!this.url) {
            Logger.log("invalid url", "no input.");
            return;
        }
        if (!Thread.isShitarabaURL(this.url)) {
            Logger.log("invalid url", "not shitaraba url.");
            return;
        }
        this.thread = new Thread(this.url);
        this.nowNumber = 0;
        this.thread.request(
            (newArrival: number) => {
                Logger.log("request success", newArrival.toString());
            },
            (err: any) => {
                Logger.log("request failed", err);
            }
        );
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
        remote.getCurrentWindow().setTitle(name + " - " + ApplicatonName);
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
        this.setTitle(this.thread.title);
    }

    @Watch('reading')
    onrChange(newValue: number, oldValue: number) {
        Logger.log("reading", this.reading)
    }

    voice: number = 1;
    // softalk or webspeechapi
    path: string = "";
    @Watch("voice")
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

    get settings() {
        return this.url
            + this.provideManager.vParam.volume
            + this.provideManager.vParam.rate
            + this.provideManager.vParam.pitch
            + this.provideManager.vParam.use
            + this.reload + this.readingTimeLimit + this.reading
            + this.path + this.voice;;
    }

    loadSettings() {
        let items = localStorage.getItem(SETTINGS);
        var settings = JSON.parse(items);
        if (!settings) return;
        this.url = settings.url;
        if (this.url) {
            this.initUrlSource();
            this.setTitle(this.thread.title);
        };
        this.provideManager.vParam.volume = Number(settings.volume);
        this.provideManager.vParam.rate = Number(settings.rate);
        this.provideManager.vParam.pitch = Number(settings.pitch);
        this.provideManager.vParam.use = Boolean(settings.use === "true" ? true : false);
        this.reload = Number(settings.reload);
        this.readingTimeLimit = Number(settings.readingTimeLimit);
        this.reading = Boolean(settings.reading === "true" ? true : false);;
        this.path = settings.path;
        this.voice = Number(settings.voice);
        this.provideManager.selectVoice(this.voice);
        Logger.log("load settings", items);
    }
    saveSettings() {
        localStorage.setItem(SETTINGS, JSON.stringify({
            url: this.url,
            volume: this.provideManager.vParam.volume,
            rate: this.provideManager.vParam.rate,
            pitch: this.provideManager.vParam.pitch,
            use: this.provideManager.vParam.use,
            reload: this.reload,
            readingTimeLimit: this.readingTimeLimit,
            reading: this.reading,
            path: this.path,
            voice: this.voice
        }));
    }
    @Watch("settings")
    onSettingsChange(newValue: number, oldValue: number) {
        this.saveSettings()
        var settings = JSON.parse(localStorage.getItem(SETTINGS));
    }
}
