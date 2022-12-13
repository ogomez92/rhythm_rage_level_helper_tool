interface SpeechEngine {
speak(text: string): void;
stop(): void;
initialize?(): void;
setLanguage?(language: string): void;
setVoice?(voice: SpeechSynthesisVoice): void;
getVoiceList?(): SpeechSynthesisVoice[];
setRate?(rate: number): void;
getRate?(): number;

}

export default SpeechEngine;
