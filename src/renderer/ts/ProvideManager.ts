import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import { VOICE, VoiceParameter } from "./Voice"
import * as io from "socket.io-client";
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import { Speaker } from "./Speaker"
const port = require("../../../config.json").port
const AA_TEMPLATE = "このメッセージはアスキーアートです。";
const LONG_TEXT_TEMPLATE = "長文のため省略";

export default class ProvideManager {
    speaking: boolean = false;
    socket = io.connect("http://localhost:" + port);
    speaker: Speaker;
    vParam: VoiceParameter = new VoiceParameter();
    constructor() {
    }

    provide(letter: string, body: string, reading: boolean = true) {
        let anchorReplace = StringUtil.anchorToReadable(body);
        let brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
        if (this.isAA(body, 2)) {
            if (reading)
                this.speaker.speak(letter + "\n" + AA_TEMPLATE, this.vParam);
            this.socket.emit("aa", letter + "\r\n" + brReplace);
            return;
        }
        let urlReplace = StringUtil.urlToReadable(brReplace);
        let ZENHANReplace = StringUtil.replaceHANKAKUtoZENKAKU(urlReplace);

        const messenger = () => {
            if (reading)
                this.speaker.speak(letter + "\n" + ZENHANReplace, this.vParam);
            this.socket.emit("message", letter + "\r\n" + urlReplace);
        }
        if (this.speaker.speaking()) {
            this.cancel();
            setTimeout(() => {
                // this.speaker.speak(LONG_TEXT_TEMPLATE);
                messenger();
            }, 1000);
            Logger.log("cancel", "too long text.");
        } else {
            messenger();
        }

    }

    test(letter: string, body: string, reading: boolean = true) {
        this.provide(letter, body, reading);
    }

    dummyText(body: string) {
        this.socket.emit("message", body);;
    }

    isAA(value: string, count?: number): boolean {
        return StringUtil.isAA(value, count);
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

    setParameters(volume: number, rate?: number, pitch?: number) {
        this.vParam.volume = volume;
        if (rate) this.vParam.rate = rate;
        if (pitch) this.vParam.pitch = pitch;
    }
}
