"use strict"
export enum VOICE {
    WSA = 1, SOFTALK = 2
}

"use strict"
export class VoiceParameter {
    // default value : WebSpeechApi value
    // percentage
    volume: number = 100;
    rate: number = 100;
    pitch: number = 50;
    use:boolean=true;
    // 後に使えているコメント数
    busy: number = 0;
    constructor() { }
    setParameters(volume: number, rate?: number, pitch?: number) {
        this.volume = volume;
        if (rate) this.rate = rate;
        if (pitch) this.pitch = pitch;
    }

    init() {
        this.volume = 100;
        this.rate = 100;
        this.pitch = 50;
    }

    adjustmentVolume(min: number, max: number) {
        return Math.floor(((max - min) * this.volume) / 100);
    }
    adjustmentRate(min: number, max: number) {
        return Math.floor(((max - min) * this.rate) / 100);
    }
    adjustmentPitch(min: number, max: number) {
        return Math.floor(((max - min) * this.pitch) / 100);
    }
}
