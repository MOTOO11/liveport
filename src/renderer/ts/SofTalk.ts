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
    // 0-100 1-300 1-300
    speak(text: string, vParam: VoiceParameter) {
        var args = "";
        args += " /V:" + (vParam.use ? vParam.adjustmentVolume(0, 100) : defaultParameter.volume);
        args += " /S:" + (vParam.use ? vParam.adjustmentRate(1, 300) : defaultParameter.rate);
        args += " /O:" + (vParam.use ? vParam.adjustmentPitch(1, 300) : defaultParameter.pitch);
        args += " /W:" + text.replace(/\n/gi, "  ");
        
        // console.log(this.path +" " +args);
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
