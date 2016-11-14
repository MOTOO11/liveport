import * as Vue from "Vue";
import { Component } from "vue-typed"
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
    socket = io.connect("http://localhost:3000");
    // data
    message: string = 'Hello!';
    url: string = "";
    reload: number = 7;
    readingLimit: number = 8;
    // 処理中
    readingNum: number = 0;

    datRequestTimer: number;
    datRequestTimerCount: number;
    displayTimer: number;
    displayTimerCount: number;
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
        let url = "http://jbbs.shitaraba.net/bbs/read.cgi/game/57693/1478785363/";
        this.thread = new Thread(url);
        this.thread.request(this.success, this.failed);
    }

    success = () => { console.log("success.") };
    failed = () => { console.log("success.") };

    // computed
    get validUrl() {
        return Thread.isShitarabaURL(this.url);
    }


    speak() {
        this.socket.emit('message', this.message);
        this.speaker.speak(this.message);
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
    リサイズ情報を送信する
    dat取得タイマーと表示＆読み上げ用タイマーを起動する
    */
    start() {
        this.resize();
        this.processing = true;
        this.thread = new Thread(this.url);
        remote.getCurrentWindow().setTitle("start");
        // var t = window.setInterval(() => { }, 1000);
    }

    stop() {
        this.processing = false;
        clearInterval(this.datRequestTimer);
        clearInterval(this.displayTimer);
    }

    get allNum() {
        return this.thread.reses.length;
    }
}
