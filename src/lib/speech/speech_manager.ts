import SpeechEngine from "@lib/speech/interfaces/speech_engine";
import SpeechEngineType from "@lib/speech/enums/speech_engine_type";
import TTSSpeechEngine from "lib/speech/tts_speech";
import AriaSpeechEngine from "@lib/speech/aria_speech";

export default class SpeechManager {
  private synth: SpeechEngine;
  private synthType: SpeechEngineType;

  constructor(type: SpeechEngineType = SpeechEngineType.TTS) {
    this.synthType = type;
  }

  async initialize() {
    switch (this.synthType) {
      case SpeechEngineType.TTS:
        this.synth = new TTSSpeechEngine();
        await this.synth.initialize();
        break;
      case SpeechEngineType.ARIA:
        this.synth = new AriaSpeechEngine();
        break;
    }
  }

  public isConfigureable = () => this.synthType !== SpeechEngineType.ARIA;

  public speak = (text: string) => this.synth.speak(text);

  public stop = () => this.synth.stop();
}
