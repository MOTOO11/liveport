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
const VERSION = require("../../../package.json").version
import * as $ from "jquery"
const SETTINGS = "settings";
@Component({})
export default class Application extends Vue {
    pManager: ProvideManager;
    testMessage: string = 'このテキストはテストメッセージです';
    url: string = "";
    processing: boolean = false;
    thread: Thread;
    constructor() {
        super();
        Logger.log("start", "hello application.");
        this.pManager = new ProvideManager();
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
    @Watch("reload")
    onChangeRTimeLimit() {
        this.reloadTimerCountDown = this.reload;
    }

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

    // 読み上げ時間数上限
    provideTimeLimit: number = 10;
    // 表示タイマーID
    provideTimerID: number;
    // 表示カウントダウン
    provideTimerLimitCountDown: number = this.provideTimeLimit;

    @Watch("provideTimeLimit")
    onChangePTimeLimit() {
        this.provideTimerLimitCountDown = this.provideTimeLimit;
    }
    startProvide() {
        if (!this.processing) return;
        this.provideTimerLimitCountDown = this.provideTimeLimit;
        if (this.thread.bookmark != this.thread.allNum()) {
            let target = this.thread.messages[this.thread.bookmark];
            this.pManager.provide("レス" + target.num + ":", target.text, this.pManager.reading);
            this.thread.next();
            if (this.autoScroll)
                this.scrollTo(this.thread.bookmark);
        } else {
            this.haltProvide();
        }
        this.setProvideTimer();
    }
    stopProvide() {
        clearTimeout(this.provideTimerID);
        this.haltProvide();
    }
    haltProvide() {
        this.pManager.cancel();
        this.provideDummyTest();
    }
    setProvideTimer() {
        if (!this.processing) return;
        if (this.provideTimerLimitCountDown < 0) {
            this.startProvide();
        } else {
            this.provideTimerID = window.setTimeout(() => {
                this.provideTimerLimitCountDown--;
                this.setProvideTimer();;
            }, 1000);
        }
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
        this.thread = new Thread(this.url);
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

    latest() {
        this.thread.latest();;
        this.scrollTo(this.thread.bookmark);
    }

    setTitle(name: string) {
        remote.getCurrentWindow().setTitle(name + " - " + ApplicatonName);
    }

    // 表示するものがない時
    dummyText: string = "";
    provideDummyTest() {
        this.pManager.dummyText(this.dummyText);
    }
    dummyTextTemp: string = "";
    insertDummyText() {
        this.dummyText = this.dummyTextTemp;
        if (!this.processing)
            this.pManager.dummyText(this.dummyText);
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

    snackbar(data: { message: string, timeout: number }) {
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
        this.pManager.provide(letter, body, this.pManager.reading);
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

    @Watch('pManager.reading')
    onrChange(newValue: number, oldValue: number) {
        Logger.log("pManager.reading", this.pManager.reading)
    }

    // softalk or webspeechapi
    path: string = "";
    @Watch("pManager.voice")
    onVoiceChange(newValue: number, oldValue: number) {
        this.pManager.selectVoice(newValue, this.path);
    }

    findSofTalkPathDialog() {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            filters: [
                { name: 'exe', extensions: ['exe'] }
            ]
        }, (paths: string[]) => {
            if (paths) {
                this.path = paths[0];
                this.pManager.selectVoice(VOICE.SOFTALK, this.path);
            }
        });
    }

    existsSofTalkPath() {
        if (this.path == "")
            this.findSofTalkPathDialog();
    }

    get settings() {
        return this.url + this.dummyText
            + this.pManager.vParam.volume
            + this.pManager.vParam.rate
            + this.pManager.vParam.pitch
            + this.pManager.vParam.use
            + this.reload + this.provideTimeLimit + this.pManager.reading
            + this.path + this.pManager.voice;
    }

    loadSettings() {
        let items = localStorage.getItem(SETTINGS);
        var settings = JSON.parse(items);
        if (!settings) {
            this.pManager.selectVoice(this.pManager.voice);
            return;
        }
        try {
            this.url = settings.url;
            if (this.url) {
                this.initUrlSource();
                this.setTitle(this.thread.title);
            };
            this.pManager.vParam.volume = Number(settings.volume);
            this.pManager.vParam.rate = Number(settings.rate);
            this.pManager.vParam.pitch = Number(settings.pitch);
            this.pManager.vParam.use = Boolean(settings.use);
            this.reload = Number(settings.reload);
            this.reloadTimerCountDown = this.reload;
            this.provideTimeLimit = Number(settings.provideTimeLimit);
            this.provideTimerLimitCountDown = this.provideTimeLimit;
            this.pManager.reading = Boolean(settings.reading);
            this.path = settings.path;
            this.dummyTextTemp = this.dummyText = settings.dummyText;
            this.pManager.voice = Number(settings.voice);
            this.pManager.selectVoice(this.pManager.voice, this.path);
            Logger.log("load settings", items);
        } catch (e) {
            console.log("invalid settings error.");
            localStorage.removeItem(SETTINGS);
            this.loadSettings();
        }
    }
    mounted() {
        if (this.thread.bookmark != 0)
            this.scrollTo(this.thread.bookmark);
    };
    saveSettings() {
        localStorage.setItem(SETTINGS, JSON.stringify({
            url: this.url,
            volume: this.pManager.vParam.volume,
            rate: this.pManager.vParam.rate,
            pitch: this.pManager.vParam.pitch,
            use: this.pManager.vParam.use,
            reload: this.reload,
            provideTimeLimit: this.provideTimeLimit,
            reading: this.pManager.reading,
            path: this.path,
            voice: this.pManager.voice,
            dummyText: this.dummyText
        }));
    };
    @Watch("settings")
    onSettingsChange(newValue: number, oldValue: number) {
        this.saveSettings()
        var settings = JSON.parse(localStorage.getItem(SETTINGS));
    }
    version = VERSION;
}
