"use strict";
import * as Vue from "Vue";
import { Component } from "vue-typed"
import * as io from "socket.io-client";
const config = require("../../../config.json");
const MODE = {
    MESSAGE: "message",
    AA: "aa"
}
@Component()
export default class Browser extends Vue {
    mode: string = MODE.MESSAGE;
    body: string = "字幕表示テスト";
    fontSize: string = config.textFontSize;
    constructor() {
        super();
    }
    onMessage(message: string) {
        if (message.split("\n").length > config.textLineLimit) {
            this.onAa(message);
            return;
        }
        this.mode = MODE.MESSAGE;
        this.body = message;
        // this.fontSize = "3vw";
        this.fontSize = config.textFontSize;
    }
    onAa(aa: string) {
        this.mode = MODE.AA;
        this.body = aa;
        let ratio = window.innerHeight / window.innerWidth;
        var maxWidth = this.strLength(aa.split("\n").sort((a, b) => {
            return b.length - a.length;
        })[0], "UTF-8") * ratio;
        var height = aa.split("\n").length * 1.2;
        var size = 100 / (Math.max(maxWidth, height));
        // console.log("width:%s", maxWidth);
        // console.log("height:%s", height);
        // console.log("size:%s", size);
        this.fontSize = size + "vmin";
    }
    setFontSize(size: number) {
        this.fontSize = size + "vmin";
    }
    clear() {
        this.body = "";
    }

    strLength(str, encode) {
        var count = 0,
            setEncode = 'Shift_JIS',
            c: any;

        if (encode && encode !== '') {
            if (encode.match(/^(SJIS|Shift[_\-]JIS)$/i)) {
                setEncode = 'Shift_JIS';
            } else if (encode.match(/^(UTF-?8)$/i)) {
                setEncode = 'UTF-8';
            }
        }

        for (var i = 0, len = str.length; i < len; i++) {
            var c = str.charCodeAt(i);
            if (setEncode === 'UTF-8') {
                if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
                    count += 1;
                } else {
                    count += 2;
                }
            } else if (setEncode === 'Shift_JIS') {
                if ((c >= 0x0 && c < 0x81) || (c == 0xa0) || (c >= 0xa1 && c < 0xdf) || (c >= 0xfd && c < 0xff)) {
                    count += 1;
                } else {
                    count += 2;
                }
            }
        }
        return count / 2;
    };

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
