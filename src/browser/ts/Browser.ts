"use strict";
import * as Vue from "Vue";
import { Component } from "vue-typed"
import * as io from "socket.io-client";
const MODE = {
    MESSAGE: "message",
    AA: "aa"
}
@Component()
export default class Browser extends Vue {
    mode: string = MODE.MESSAGE;
    body: string = "字幕表示テスト";
    fontSize: string = "3.3vw";
    constructor() {
        super();
    }
    onMessage(message: string) {
        this.mode = MODE.MESSAGE;
        this.body = message;
        this.fontSize="3.3vw";
    }
    onAa(aa: string) {
        this.mode = MODE.AA;
        this.body = aa;
        var width = aa.split("\n").sort((a, b) => {
            return b.length - a.length;
        })[0].length;
        var height = aa.split("\n").length;
        var size = Math.floor(100 / (Math.max(width, height)));
        console.log("width:%s", width);
        console.log("height:%s", height);
        console.log("size:%s", size);
        this.setFontSize(size);
    }
    setFontSize(size: number) {
        this.fontSize = size + "vmin";
    }
    clear() {
        this.body = "";
    }


}
window.addEventListener("load", () => {
    var app = new Browser();
    app.$mount("#app");
    var socket = io.connect();
    socket.on('message', (msg) => {
        app.onMessage(msg);
    });
    socket.on('aa', (msg) => {
        app.onAa(msg);
    });
});
