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
    message: string = 'Hello!';
    constructor() {
        super();
        console.log("hello world.");
        let url = "http://jbbs.shitaraba.net/bbs/rawmode.cgi/radio/15726/1477321418/1";
        // [レス番号]<>[名前]<>[メール]<>[日付]<>[本文]<>[スレッドタイトル]<>[ID]
        // http://jbbs.shitaraba.net/bbs/read.cgi/game/41082/1478090192/

        this.speaker = new SofTalk();
    }
    speak() {
        this.socket.emit('message', this.message);
        this.speaker.speak(this.message);
    }

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
    app.req();
    // a.speak("今回もNPC関連は分かりづらいね");
    // a.speaker = new WebspeechApi();
    // a.speak("今回もNPC関連は分かりづらいね");
    // var path = "E:/tools/softalk/SofTalk.exe";

});
