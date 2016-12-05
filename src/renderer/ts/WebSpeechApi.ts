import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
const defaultParameter = {
    volume: 1,
    rate: 1,
    pitch: 1
}
class WebSpeechApi implements Speaker {
    speech = new SpeechSynthesisUtterance();
    constructor() {
        var voices = window.speechSynthesis.getVoices();
        // 以下オプション設定（日本語は効かないもよう。。）
        this.speech.voice = voices[7]; // 7:Google 日本人 ja-JP ※他は英語のみ（次項参照）
        this.speech.lang = 'ja-JP'; // en-US or ja-JP
    }
    // 0-1 0-10 0-2
    speak(text: string, vParam: VoiceParameter, callback?: () => any) {
        // 音量 min 0 ~ max 1
        this.speech.volume = vParam.use ? vParam.adjustmentVolume(0, 1) : defaultParameter.volume;
        // 速度 min 0 ~ max 10
        this.speech.rate = vParam.use ? vParam.adjustmentRate(0, 10) : defaultParameter.rate;
        // 音程 min 0 ~ max 2
        this.speech.pitch = vParam.use ? vParam.adjustmentPitch(0, 2) : defaultParameter.pitch;
        this.speech.text = text;
        if (callback)
            this.speech.onend = callback;
        speechSynthesis.speak(this.speech);
    }

    cancel() {
        var callback = () => {
            console.log("overwrite onend callback");
        }
        this.speech.onend = callback;
        speechSynthesis.cancel();
    }
    
    speaking() {
        return speechSynthesis.speaking;
    }

}

export default WebSpeechApi;
