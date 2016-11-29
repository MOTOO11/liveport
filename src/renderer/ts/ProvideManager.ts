import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import { VOICE } from "./Voices"
import * as io from "socket.io-client";
import StringUtil from "./StringUtil";
import Logger from "./Logger";
const port = require("../../../config.json").port
const AA_TEMPLATE = "このメッセージはアスキーアートです。";
const LONG_TEXT_TEMPLATE = "長文のため省略";

export default class ProvideManager {
    speaking: boolean = false;
    socket = io.connect("http://localhost:" + port);
    speaker: Speaker;
    constructor() {

    }

    provide(letter: string, body: string, reading: boolean = true) {
        if (this.isAA(body,2)) {
            var brReplace = StringUtil.replaceBr2NewLine(body);
            if (reading)
                this.speaker.speak(letter + "\n" + AA_TEMPLATE);
            this.socket.emit("aa", letter + "\r\n" + brReplace);
            return;
        }
        var anchorReplace = StringUtil.anchorToReadable(body);
        var brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
        var urlReplace = StringUtil.urlToReadable(brReplace);
        var ZENHANReplace = StringUtil.replaceHANKAKUtoZENKAKU(urlReplace);
        if (this.speaker.speaking()) {
            this.cancel();
            setTimeout(() => {
                // this.speaker.speak(LONG_TEXT_TEMPLATE);
                if (reading)
                    this.speaker.speak(letter + "\n" + ZENHANReplace);
                this.socket.emit("message", letter + "\r\n" + ZENHANReplace);
            }, 1000);
            Logger.log("cancel", "too long text.");
        } else {
            if (reading)
                this.speaker.speak(letter + "\n" + ZENHANReplace);
            this.socket.emit("message", letter + "\r\n" + brReplace);
        }

    }

    test(letter: string, body: string, reading: boolean = true) {
        this.provide(letter, body, reading);
    }

    dummyText(body: string) {
        this.socket.emit("message", body);;
    }

    isAA(value: string,count?:number): boolean {
        return StringUtil.isAA(value,count);
    }

    _speak(message: string) {
        this.speaker.speak(message);
    }

    resize(width: number, height: number) {
        this.socket.emit("resize", {
            width: width, height: height
        });
    }

    selectVoice(value: number, path?: string) {
        Logger.log("select speaker", value.toString());
        if (value === VOICE.WSA) {
            this.speaker = new WebspeechApi();
        } else if (value === VOICE.SOFTALK) {
            this.speaker = new SofTalk(path);
        }
    }

    cancel() {
        this.speaker.cancel();
    }
}