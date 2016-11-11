import * as Vue from "Vue";
import { Component } from "vue-typed"
import * as child_process from "child_process"
import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import * as io from "socket.io-client";
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import { Thread, Res } from "./Thread";
require("../css/main.css")

@Component()
export default class Application extends Vue {
    speaker: Speaker;
    socket = io.connect("http://localhost:3000");
    // data
    message: string = 'Hello!';
    url: string = "";
    reload: number = 7;
    readingLimit: number = 8;
    dummyText: string = "";
    processing: boolean = false;
    // softalk or bouyomichan
    path: string = "";
    // browser frame size
    width: number; height: number;
    constructor() {
        super();
        console.log("hello application.");
        this.speaker = new SofTalk();
    }

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

    /*
    開始ボタンが押せるならURLは正しい
    リサイズ情報を送信する
    dat取得タイマーと表示＆読み上げ用タイマーを起動する
    */
    start() {
        this.resize();
        this.processing = true;
        // var t = window.setInterval(() => { }, 1000);
    }

    stop() {
        this.processing = false;
        clearInterval(this.datRequestTimer);
        clearInterval(this.displayTimer);
    }

    get executeButtonText() {
        return this.processing ? "停止" : "開始"
    }

    datRequestTimer: number;
    displayTimer: number;

    req() {
        let url = "http://jbbs.shitaraba.net/bbs/rawmode.cgi/radio/15726/1477321418/1";
        rp({ url: url, encoding: null })
            .then((htmlString) => {
                console.log("ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                console.log(decoding);
                this.message = decoding;
            })
            .catch(function (err) {
                console.log("error...");
                console.log(err);
            });
    }
}
window.addEventListener("load", () => {
    var app = new Application();
    app.$mount("#app");
});
