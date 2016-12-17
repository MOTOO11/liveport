"use strict"
export enum VOICE {
    WSA = 1, SOFTALK = 2, TAMIYASU = 3, BOUYOMI = 4
}
const MAX_RATE = 1.8;
"use strict"
export class VoiceParameter {
    // default value : WebSpeechApi value
    volume: number = 100;
    rate: number = 10;
    pitch: number = 50;
    use: boolean = false;
    constructor(volume: number = 100, rate: number = 10, pitch: number = 50) {
        this.volume = volume;
        this.rate = rate;
        this.pitch = pitch
    }

    quick(magnification: number) {
        let qVParam = new VoiceParameter(this.volume, this.rate, this.pitch);
        qVParam.rate *= (magnification > MAX_RATE ? MAX_RATE : magnification);
        return qVParam;
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
