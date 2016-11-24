import * as cp from "child_process";
import * as os from "os";
class SofTalk implements Speaker {
    path = "E:/tools/softalk/SofTalk.exe";;
    // path = "E:/tools/Output-CommandLine/Output-CommandLine.exe";
    constructor() {
    }
    // 0-100 1-300 1-300
    speak(text: string, volume: number = 50, rate: number = 100, pitch: number = 100) {
        var args = "";
        args += " /V:" + volume;
        args += " /S:" + rate;
        args += " /O:" + pitch;
        args += " /W:" + text.replace(/\n/gi, "\t");
        cp.exec(this.path + args, (e, s) => {
            console.log(s);
        });
    }
    // 0-100 1-300 1-300
    _speak(text: string) {
        var args = "";
        args += " /W:" + text.replace(/\n/g, "\t");
        cp.exec(this.path + args, (e, s) => {
            console.log(s);
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