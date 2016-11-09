class SofTalk implements Speaker {
    cp = require("child_process");
    path = "E:/tools/softalk/SofTalk.exe";
    constructor() {
    }
    // 0-100 1-300 1-300
    speak(text: string, volume: number = 50, rate: number = 100, pitch: number = 100) {
        var args = "";
        args += " /V:" + volume;
        args += " /S:" + rate;
        args += " /O:" + pitch;
        args += " /W:" + text.replace(/\n/g, "。");
        this.cp.exec(this.path + args, (e, s) => {
            console.log(s);
        });
    }
    // 0-100 1-300 1-300
    _speak(text: string) {
        var args = "";
        args += " /W:" + text.replace(/\n/g, "。");
        this.cp.exec(this.path + args, (e, s) => {
            console.log(s);
        });
    }

    cancel() {
        var args = " /stop_now";
        this.cp.exec(this.path + args, (e, s) => {
            console.log(s);
        });
    }
    speaking() {
        this.cancel();
        return false;
    }
}

export default SofTalk;