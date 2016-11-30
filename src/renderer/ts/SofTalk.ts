import * as cp from "child_process";
import * as os from "os";
import Logger from "./Logger";
import { VoiceParameter } from "./Voice"
import {Speaker} from "./Speaker"
class SofTalk implements Speaker {
    path: string = "";
    constructor(path: string) {
        this.path = path;
    }
    // 0-100 1-300 1-300
    // speak(text: string, volume: number = 50, rate: number = 100, pitch: number = 100) {
    speak(text: string,vParam:VoiceParameter) {
        var args = "";
        // if (volume) args += " /V:" + volume;
        // if (rate) args += " /S:" + rate;
        // if (pitch) args += " /O:" + pitch;
        args += " /W:" + text.replace(/\n/gi, "  ");
        cp.spawn(this.path, [args]).on("exit", (code) => {
            Logger.log("result", code);
        }).on("error", (err) => {
            Logger.log("result", err.name);
            process.exit(1);
        });
    }

    cancel() {
        var args = " /stop_now";
        cp.exec(this.path + args, (e, s) => {
            console.log(s);
        });
    }
    speaking() {
        this.cancel();
        return false;
    }
}

export default SofTalk;
