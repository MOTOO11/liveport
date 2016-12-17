import * as cp from "child_process";
import * as os from "os";
import Logger from "./Logger";
import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
const defaultParameter = {
    volume: 50,
    rate: 100,
    pitch: 100
}
class SofTalk implements Speaker {
    path: string = "";
    constructor(path: string) {
        this.path = path;
    }
    speak(text: string, vParam: VoiceParameter, callback?: () => any) {
        var args = "";
        args += " /Talk " + "\"" + text.replace(/\n/gi, "  ") + "\"";
        if (vParam.use) args += " " + vParam.adjustmentRate(50, 300);
        if (vParam.use) args += " " + vParam.adjustmentPitch(50, 200);
        if (vParam.use) args += " " + vParam.adjustmentVolume(0, 100);
        //voice-type
        if (vParam.use) args += " 0";

        console.log(this.path + " " + args);
        cp.exec(this.path + args, (e, s) => {
            Logger.log("result", s);
        })
    }

    cancel() {
        var args = " /C";
        cp.exec(this.path + args, (e, s) => {
            var args = " /S";
            cp.exec(this.path + args, (e, s) => {
                console.log(s);
            });
        });
    }
    speaking() {
        return true;
    }
}

export default SofTalk;
