import * as Vue from "Vue";
import { Component } from "vue-typed"
import * as child_process from "child_process"
import SofTalk from "./SofTalk"
import WebspeechApi from "./WebspeechApi"
import * as io from "socket.io-client";

@Component()
export default class Application extends Vue {
    speaker: Speaker;
    socket = io.connect("http://localhost:3000");
    constructor() {
        super();
        console.log("hello world.");
        this.speaker = new SofTalk();
    }
    message: string = 'Hello!'
    speak() {
        this.socket.emit('message', this.message);
        this.speaker.speak(this.message);
    }
}
window.addEventListener("load", () => {
    var app = new Application();
    app.$mount("#app");
    // a.speak("今回もNPC関連は分かりづらいね");
    // a.speaker = new WebspeechApi();
    // a.speak("今回もNPC関連は分かりづらいね");
    // var path = "E:/tools/softalk/SofTalk.exe";

});
