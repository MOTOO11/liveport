import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import * as io from "socket.io-client";
import StringUtil from "./StringUtil";

export default class ProvideManager {
    speaking: boolean = false;
    socket = io.connect("http://localhost:3000");
    speaker: Speaker;
    AA_TEMPLATE = "アスキーアートです。";
    constructor() {

    }

    provide(letter: string, body: string) {
        if (this.isAA(body)) {
            this.socket.emit("aa", letter + "\r\n" + body);
            this.speaker.speak(letter + "\n" + this.AA_TEMPLATE);
        } else {
            this.socket.emit("message", letter + "\r\n" + body);
            var urlReplace = StringUtil.urlToReadable(body);
            var anchorReplace = StringUtil.anchorToReadable(urlReplace);
            this.speaker.speak(letter + "\n" + anchorReplace);
        }
    }

    dummyText(body: string) {
        this.socket.emit("message", body);;
    }

    isAA(value: string): boolean {
        return false;
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
        console.log("select speaker : " + value)
        if (value === 1) {
            this.speaker = new WebspeechApi();
        } else if (value === 2) {
            this.speaker = new SofTalk(path);
        }
    }

    cancel() {
        this.speaker.cancel();
    }
}