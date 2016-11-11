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
    url: string = "";
    reload: number = 7;
    dummyText: string = "";
    constructor() {
        super();
        console.log("hello world.");
        this.speaker = new SofTalk();
    }
    speak(msg: string) {
        this.socket.emit('message', msg);
        this.speaker.speak(msg);
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
});
