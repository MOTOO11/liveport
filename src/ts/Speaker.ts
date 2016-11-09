"use strict";
interface Speaker {
    speak(text: string, volume?: number, rate?: number, pitch?: number): void;
    cancel(): void;
    speaking(): boolean;
    // clear():void;
}
