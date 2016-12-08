import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import Tamiyasu from "./Tamiyasu"
import { VOICE, VoiceParameter } from "./Voice"
import * as io from "socket.io-client";
import StringUtil from "./StringUtil";
import Logger from "./Logger";
import { Speaker } from "./Speaker"
const CONFIG = require("../../../config.json");
const SystemDictionary = CONFIG.SystemDictionary;
const NgDictionary: string[] = CONFIG.NgDictionary;
const port = CONFIG.port
const AA_TEMPLATE = "このメッセージはアスキーアートです。";
const LONG_TEXT_TEMPLATE = "長文のため省略";
const MODE = {
    AA: "aa",
    MESSAGE: "message"
}
export default class ProvideManager {
    speaking: boolean = false;
    socket = io.connect("http://localhost:" + port);
    speaker: Speaker;
    vParam: VoiceParameter = new VoiceParameter();
    voice: number = VOICE.WSA;
    reading: boolean = true;
    constructor() { }

    provide(letter: string, body: string, reading: boolean = true, callback?: () => any, timeLimit?: number) {
        if (this.containsNg(body)) {
            const ng = () => {
                if (reading) {
                    this.speak(letter + "\n" + CONFIG.SystemDictionary.NG.reading, callback,timeLimit);
                }
                this.socket.emit(MODE.MESSAGE, letter + "\r\n" + CONFIG.SystemDictionary.NG.reading);
            }
            if (this.speaker.speaking()) {
                this.cancel(ng);
                Logger.log("cancel", "too long text.");
            } else {
                ng();
            }
            return;
        }
        let anchorReplace = StringUtil.anchorToPlain(body);
        let brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
        const aa = () => {
            if (reading)
                this.speak(letter + "\n" + SystemDictionary.AA.reading, callback,timeLimit);
            this.socket.emit(MODE.AA, letter + "\r\n" + brReplace);
        }

        if (this.isAA(brReplace, CONFIG.textLineLimit)) {
            if (this.speaker.speaking()) {
                this.cancel(aa);
                Logger.log("cancel", "too long text.");
            } else {
                aa();
            }
            return;
        }

        const messenger = () => {
            if (reading) {
                let anchorReplace = StringUtil.anchorToReadable(body);
                let brReplace = StringUtil.replaceBr2NewLine(anchorReplace);
                let urlReplace = StringUtil.urlToReadable(brReplace);
                let userDictionary = StringUtil.applyUserDictionary(urlReplace);
                let ZENHANReplace = StringUtil.replaceHANKAKUtoZENKAKU(userDictionary);
                this.speak(letter + "\n" + ZENHANReplace, callback,timeLimit);
            }
            this.socket.emit(MODE.MESSAGE, letter + "\r\n" + brReplace);
        }
        if (this.speaker.speaking()) {
            this.cancel(messenger);
            Logger.log("cancel", "too long text.");
        } else {
            messenger();
        }
    }
    speak(body: string, callback?: () => any, timeLimit?: number) {
        let text = body;
        if (this.voice === VOICE.TAMIYASU) {
            text = Tamiyasu.calcStringSize(body,timeLimit);
        }
        this.speaker.speak(text, this.vParam, callback);
    }
    containsNg(text: string): boolean {
        return StringUtil.containsNg(text);
    }

    dummyText(body: string) {
        this.socket.emit(MODE.AA, body);
    }

    isAA(value: string, count?: number): boolean {
        return StringUtil.isAA(value, count);
    }

    selectVoice(value: number, path?: string) {
        Logger.log("select speaker", value.toString());
        if (value === VOICE.WSA) {
            this.speaker = new WebspeechApi();
        } else if (value === VOICE.SOFTALK) {
            this.speaker = new SofTalk(path);
        } else if (value === VOICE.TAMIYASU) {
            this.speaker = new Tamiyasu(path);
        }
    }

    cancel(callback?: () => void) {
        this.speaker.cancel();
        setTimeout(() => {
            if (callback) callback();
        }, 1000);
    }
}
