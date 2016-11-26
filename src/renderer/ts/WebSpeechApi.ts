class WebSpeechApi implements Speaker {
    constructor() {
    }
    utterances: SpeechSynthesisUtterance[] = [];
    // 0-1 0-10 0-2
    speak(text: string, volume: number = 1, rate: number = 1, pitch: number = 1) {
        let speech = new SpeechSynthesisUtterance(text);
        var voices = window.speechSynthesis.getVoices();
        // 以下オプション設定（日本語は効かないもよう。。）
        speech.voice = voices[7]; // 7:Google 日本人 ja-JP ※他は英語のみ（次項参照）
        // speech.lang = 'ja-JP'; // en-US or ja-JP
        speech.volume = volume; // 音量 min 0 ~ max 1
        speech.rate = rate; // 速度 min 0 ~ max 10
        speech.pitch = pitch; // 音程 min 0 ~ max 2
        speech.text = text;
        this.utterances.push(speech);
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