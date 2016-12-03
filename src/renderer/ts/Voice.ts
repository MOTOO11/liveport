"use strict"
export enum VOICE {
    WSA = 1, SOFTALK = 2
}

"use strict"
export class VoiceParameter {
    // default value : WebSpeechApi value
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
        return ((max - min) * this.volume) / 100;
    }
    adjustmentRate(min: number, max: number) {
        return ((max - min) * this.rate) / 100;
    }
    adjustmentPitch(min: number, max: number) {
        return ((max - min) * this.pitch) / 100;
    }
}
