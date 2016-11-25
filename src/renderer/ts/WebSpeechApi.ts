class WebSpeechApi implements Speaker {
    speech: SpeechSynthesisUtterance = new SpeechSynthesisUtterance();
    constructor() {
        this.speech = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        // 以下オプション設定（日本語は効かないもよう。。）
        this.speech.voice = voices[7]; // 7:Google 日本人 ja-JP ※他は英語のみ（次項参照）
        this.speech.lang = 'ja-JP'; // en-US or ja-JP
    }
    // 0-1 0-10 0-2
    speak(text: string, volume: number = 1, rate: number = 1, pitch: number = 1) {
        this.speech.volume = volume; // 音量 min 0 ~ max 1
        this.speech.rate = rate; // 速度 min 0 ~ max 10
        this.speech.pitch = pitch; // 音程 min 0 ~ max 2
        this.speech.text = text;
        speechSynthesis.speak(this.speech);
    }
    cancel() {
        speechSynthesis.pause();
        speechSynthesis.cancel();
    }
    speaking() {
        return speechSynthesis.speaking;
    }
}

export default WebSpeechApi;