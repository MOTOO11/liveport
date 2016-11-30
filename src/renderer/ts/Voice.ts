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
    // 後に使えているコメント数
    busy: number = 0;
    constructor() { }

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
