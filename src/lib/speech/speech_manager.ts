import SpeechEngine from "@lib/speech/interfaces/speech_engine";
import SpeechEngineType from "@lib/speech/enums/speech_engine_type";
import TTSSpeechEngine from "@lib/speech/tts_speech";
import AriaSpeechEngine from "@lib/speech/aria_speech";

export default class SpeechManager {
  private synth: SpeechEngine;
  private synthType: SpeechEngineType;

  constructor(type: SpeechEngineType = SpeechEngineType.TTS) {
    this.synthType = type;
  }

  async initialize() {
    this.destroy();

    switch (this.synthType) {
      case SpeechEngineType.TTS:
        try {
          this.synth = new TTSSpeechEngine();
          await this.synth.initialize();
        } catch (error) {
          console.log(`TTS could not be initialized, going back to ARIA`);
          this.synth.destroy();
          this.synth = new AriaSpeechEngine();
          this.synthType = SpeechEngineType.ARIA;
        }
        break;
      case SpeechEngineType.ARIA:
        this.synth = new AriaSpeechEngine();
        break;
    }
  }

  public isConfigureable = () => this.synthType !== SpeechEngineType.ARIA;

  public getSynthType = () => this.synthType;

  public speak = (text: string) => {
    try {
      this.synth.speak(text);
    } catch (error) {
      throw new Error(`Speech failed: ${error}`);
    }
  };

  public stop = () => this.synth.stop();

  public destroy = () => {
    if (this.synth) {
      this.synth.destroy();
      this.synth = undefined;
      this.synthType = undefined;
    }
  };
}
