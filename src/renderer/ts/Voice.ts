"use strict"
export enum VOICE {
    WSA = 1, SOFTALK = 2
}

"use strict"
export class VoiceParameter {
    // default value : WebSpeechApi value
    // percentage
    volume: number = 100;
    rate: number = 10;
    pitch: number = 50;
    use: boolean = true;
    constructor(volume: number = 100, rate: number = 10, pitch: number = 50) {
        this.volume = volume;
        this.rate = rate;
        this.pitch = pitch
    }

    adjustmentVolume(min: number, max: number) {
        var v = ((max - min) * this.volume) / 100;
        return v;
        // return v < 1 ? v : Math.floor(v);
    }
    adjustmentRate(min: number, max: number) {
        var r = ((max - min) * this.rate) / 100;
        return r;
        // return r < 1 ? r : Math.floor(r);
    }
    adjustmentPitch(min: number, max: number) {
        var p = ((max - min) * this.pitch) / 100;
        return p;
        // return p < 1 ? p : Math.floor(p);
    }
}
