import { VoiceParameter } from "./Voice"
import { Speaker } from "./Speaker"
const defaultParameter = {
    volume: 1,
    rate: 1,
    pitch: 1
}
class WebSpeechApi implements Speaker {
    constructor() {
    }
    // 0-1 0-10 0-2
    speak(text: string, vParam: VoiceParameter) {
        let speech = new SpeechSynthesisUtterance(text);
        var voices = window.speechSynthesis.getVoices();
        // 以下オプション設定（日本語は効かないもよう。。）
        speech.voice = voices[7]; // 7:Google 日本人 ja-JP ※他は英語のみ（次項参照）
        speech.lang = 'ja-JP'; // en-US or ja-JP
        // 音量 min 0 ~ max 1
        speech.volume = vParam.use ? vParam.adjustmentVolume(0, 1) : defaultParameter.volume;
        // 速度 min 0 ~ max 10
        speech.rate = vParam.use ? vParam.adjustmentRate(0, 10) : defaultParameter.rate;
        // 音程 min 0 ~ max 2
        speech.pitch = vParam.use ? vParam.adjustmentPitch(0, 2) : defaultParameter.pitch;
        speech.text = text;
        speechSynthesis.speak(speech);
    }
    cancel() {
        speechSynthesis.cancel();
    }
    speaking() {
        return speechSynthesis.speaking;
    }
}

export default WebSpeechApi;
