"use strict"
import * as Vue from "Vue";
import { Component, Watch } from "vue-typed"
import { DataSource } from "./DataSource";
import { Shitaraba } from "./Shitaraba";
import { CaveTube } from "./CaveTube";
import { VOICE, VoiceParameter } from "./Voice"
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import ProvideManager from "./ProvideManager";
const CONFIG = require("../../../config.json");
const LETTER: string = CONFIG.letter;
const CustomCss = CONFIG.CustomCss;
import { remote } from "electron";
const ApplicatonName = require("../../../package.json").name
const VERSION = require("../../../package.json").version
import * as $ from "jquery"
import * as fs from "fs";
const SETTINGS = "settings";

@Component({})
export default class Application extends Vue {
    pManager: ProvideManager;
    testMessage: string = 'このテキストはテストメッセージです';
    url: string = "";
    processing: boolean = false;
    thread: DataSource;
    constructor() {
        super();
        Logger.log("start", "hello application.");
        this.pManager = new ProvideManager();
        this.thread = new Shitaraba("dummyThread");
        this.setTitleWithTimer();
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
    newArrival = 0;
    startThreadRequest() {
        if (!this.processing) return;
        this.reloadTimerCountDown = this.reload;
        this.thread.request(
            (newArrival: number) => {
                Logger.log("request success", newArrival.toString());
                this.newArrival = newArrival;
                // if (newArrival > 0)
                // this.snackbar({ message: "新着レス：" + newArrival });
                this.setRequestTimer();
            },
            (err: any) => {
                Logger.log("request failed", err);
                let warn = {
                    message: "ERROR : " + err,
                    timeout: 6000
                }
                this.snackbar(warn);
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

    @Watch("provideTimeLimit")
    onChangePTimeLimit() {
        this.provideTimerLimitCountDown = this.provideTimeLimit;
    }
    // 読み上げ時間数上限
    provideTimeLimit: number = 10;
    // 表示タイマーID
    provideTimerID: number;
    // 表示カウントダウン
    provideTimerLimitCountDown: number = this.provideTimeLimit;

    startProvide() {
        clearTimeout(this.provideTimerID);
        if (!this.processing) return;
        this.provideTimerLimitCountDown = this.provideTimeLimit;
        let provide = () => {
            let target = this.thread.messages[this.thread.bookmark];
            let tmpLetter = LETTER.split("$1");
            let letter = tmpLetter.length > 1 ?
                tmpLetter[0] + target.num + tmpLetter[1]
                : target.num.toString();
            this.pManager.provide(letter + ":", target.text, this.pManager.reading, this.startProvide, this.provideTimeLimit);
            this.thread.next();
            if (this.autoScroll)
                this.scrollTo(this.thread.bookmark);
        }
        if (this.thread.bookmark != this.thread.allNum()) {
            if (this.playingNotificationSound) this.notificationSound(provide);
            else provide();
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
        this.provideDummyText();
    }
    setProvideTimer() {
        if (!this.processing) return;
        if (this.provideTimerLimitCountDown < 0) {
            this.startProvide();
        } else {
            this.provideTimerID = window.setTimeout(() => {
                this.provideTimerLimitCountDown--;
                this.setProvideTimer();
            }, 1000);
        }
    }

    start() {
        this.processing = true;
        if (!this.validate()) {
            this.processing = false;
            return;
        }
        if (this.thread) {
            if (this.url != this.thread.url) {
                this.loadUrlSource();
            }
        } else {
            this.loadUrlSource();
        }
        this.startThreadRequest();
        this.startProvide();
    }

    validate(): boolean {
        if (this.usePath() && this.path === "" && this.pManager.reading && this.processing === true) {
            let warn = {
                message: "ERROR : pathが設定されていません。"
            }
            this.snackbar(warn);
            return false;
        }
        if (
            (/.*\vrx.exe$/.test(this.path) && (this.pManager.voice === VOICE.SOFTALK)) ||
            (/.*\SofTalk.exe$/.test(this.path) && (this.pManager.voice === VOICE.TAMIYASU))
            ){
            let warn = {
                message: "WARN : 読み上げソフトの指定を間違っている可能性があります"
            }
            this.snackbar(warn);
        }

        if (!this.isValidURL()) {
            let warn = {
                message: "ERROR : 対応していないURLです"
            }
            this.snackbar(warn);
            return false;
        }
        return true;
    }

    usePath(): boolean {
        return this.pManager.voice === VOICE.SOFTALK || this.pManager.voice === VOICE.TAMIYASU;
    }
    // refresh
    requestOnce() {
        if (!this.validate()) {
            return;
        }
        this.showListView = false;
        this.loadUrlSource(false);

        this.thread.request(
            (newArrival: number) => {
                Logger.log("request success", newArrival.toString());
            },
            (err: any) => {
                Logger.log("request failed", err);
                let warn = {
                    message: "ERROR : " + err,
                    timeout: 6000
                }
                this.snackbar(warn);
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

    provideDummyText() {
        this.pManager.dummyText(this.dummyText);
    }

    dummyTextTemp: string = "";

    insertDummyText() {
        this.dummyText = this.dummyTextTemp;
        if (!this.processing)
            this.pManager.dummyText(this.dummyText);
    }

    showDummyTextWindow() {
        var dialog: any = document.querySelector("#subtitling");
        dialog.showModal();
        dialog.querySelector('.close').addEventListener('click', () => {
            dialog.close();
        });
    }
    getLists() {
        this.snackbar({ message: "一覧の読み込みを開始", timeout: 1000 });
        this.thread.getLists(() => {
            this.snackbar({ message: "一覧の読み込みに成功", timeout: 1000 });
        }, (err) => {
            this.snackbar({ message: err, timeout: 6000 });
        });
    }

    flipShowListMode() {
        if (!this.showListView) this.getLists();
        this.showListView = !this.showListView;
    }
    showListView = false;

    setUrlFromShowList(url: string) {
        this.url = url;
        this.loadUrlSource();
        this.requestOnce();
    }

    sendMessage() {
        console.log("start send request");
        if (!this.comment.MESSAGE) return;
        const message = {
            NAME: this.comment.NAME, MAIL: this.comment.MAIL, MESSAGE: this.comment.MESSAGE
        }
        this.thread.sendMessage(message, (result: string) => {
            this.snackbar({ message: result });
            this.comment.MESSAGE = "";
        }, (err) => {
            this.snackbar({ message: err });
        });
    }
    showCommentView = false;
    flipCommentMode() {
        this.showCommentView = !this.showCommentView;
    }
    comment = {
        MAIL: "",
        NAME: "",
        MESSAGE: ""
    }

    replace(msg: string) {
        var utl = StringUtil.urlToLink(msg);
        return StringUtil.anchorToInnerLink(utl);
    }

    // computed
    get validUrl() {
        return this.isValidURL();
    }

    snackbar(data: { message: string, timeout?: number } = { message: "info", timeout: 3000 }) {
        var snackbarContainer: any = document.querySelector('#snackbar');
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
        this.pManager.provide(letter, body, this.pManager.reading, null, this.provideTimeLimit);
    }

    autoScroll: boolean = false; cnangeAutoScroll() {
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
        this.setTitleWithTimer();
    }

    @Watch('provideTimerLimitCountDown')
    onTimerChange(newValue: number, oldValue: number) {
        this.setTitleWithTimer();
    }

    setTitleWithTimer() {
        let value = `reload(${this.reloadTimerCountDown}/${this.reload}) voice(${this.provideTimerLimitCountDown}/${this.provideTimeLimit})`
        this.setTitle(value + " - " + this.thread.title);
    }

    @Watch('pManager.reading')
    onrChange(newValue: number, oldValue: number) {
        Logger.log("pManager.reading", this.pManager.reading)
    }

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

    get settings() {
        return this.url + this.dummyText + this.autoScroll
            + this.pManager.vParam.volume
            + this.pManager.vParam.rate
            + this.pManager.vParam.pitch
            + this.pManager.vParam.use
            + this.playingNotificationSound
            + this.reload + this.provideTimeLimit + this.pManager.reading
            + this.path + this.pManager.voice
            + this.comment.NAME + this.comment.MAIL;
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
                if (this.isValidURL())
                    this.loadUrlSource();
                this.setTitleWithTimer();
            };
            this.comment.NAME = settings.NAME;
            this.comment.MAIL = settings.MAIL;
            this.playingNotificationSound = Boolean(settings.playingNotificationSound);
            this.autoScroll = Boolean(settings.autoScroll);
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
            autoScroll: this.autoScroll,
            volume: this.pManager.vParam.volume,
            rate: this.pManager.vParam.rate,
            pitch: this.pManager.vParam.pitch,
            use: this.pManager.vParam.use,
            reload: this.reload,
            provideTimeLimit: this.provideTimeLimit,
            reading: this.pManager.reading,
            path: this.path,
            voice: this.pManager.voice,
            playingNotificationSound: this.playingNotificationSound,
            dummyText: this.dummyText,
            MAIL: this.comment.MAIL,
            NAME: this.comment.NAME
        }));
    };

    @Watch("settings")
    onSettingsChange(newValue: number, oldValue: number) {
        this.saveSettings();
    }

    version = VERSION;

    isValidURL(): boolean {
        if (!this.url) {
            Logger.log("invalid url", "no input.");
            return false;
        }
        return Shitaraba.isValidURL(this.url) || CaveTube.isValidURL(this.url);
    }

    // allocate
    loadUrlSource(load: boolean = true) {
        if (Shitaraba.isValidURL(this.url)) {
            this.thread = new Shitaraba(this.url);
            if (load) {
                this.thread.load();
            }
        }
        if (CaveTube.isValidURL(this.url)) {
            this.thread = new CaveTube(this.url);
            if (load) {
                this.thread.load();
            }
        }
    }

    playingNotificationSound: boolean = false;
    notificationSound(callback: () => void) {
        var path = "";
        let audioDirPath = "./build/assets/audio/";
        fs.readdir(audioDirPath, (err, files) => {
            if (err) { }
            var fileList = [];
            files.filter((file) => {
                return fs.statSync(audioDirPath + file).isFile() && /.*\.mp3$/.test(file); //絞り込み
            }).forEach((file) => {
                fileList.push(file);
            });
            if (fileList.length > 0) {
                console.log("1 : " + fileList[0])
                path = fileList[Math.floor(Math.random() * fileList.length)];
            }
            if (!path) {
                callback();
                return;
            }
            let audio = new Audio("../../assets/audio/" + path);
            audio.onended = callback;
            audio.play();
        });
        let defaultNotificationSound = "../../assets/audio/notification.mp3";
    }

    clearDataSource() {
        for (var a in localStorage) {
            if (a.startsWith("http"))
                DataSource.clearDataSource(a);
        }
        this.snackbar({ message: "キャッシュを消去しました" });
        this.thread = new Shitaraba("dummyThread");
    }

    CSS = {
        body: CustomCss.body,
        res: CustomCss.res,
        num: CustomCss.num,
        name: CustomCss.name,
        mail: CustomCss.mail,
        date: CustomCss.date,
        id: CustomCss.id,
        header: CustomCss.header,
        message: CustomCss.message
    }
}
