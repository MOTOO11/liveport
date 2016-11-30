"use strict";
import { VoiceParameter } from "./Voice"
export interface Speaker {
    speak(text: string, vParam?:VoiceParameter): void;
    cancel(): void;
    speaking(): boolean;
}
