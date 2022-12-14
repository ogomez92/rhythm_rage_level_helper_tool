import SpeechEngine from "@lib/speech/interfaces/speech_engine";

class TTSSpeechEngine implements SpeechEngine {
  private synth: SpeechSynthesis;
  private rate = 1;
  private voices: Map<string, SpeechSynthesisVoice> = new Map();
  private language: string;
  private voice: SpeechSynthesisVoice;

  constructor() {
    this.language = "en";
    this.synth = window.speechSynthesis;
    this.synth.onvoiceschanged = () => this.initialize();
  }

  public async initialize() {
    try {
    await this.populateVoiceList();
    this.setVoice(this.getDefaultVoice());
    } catch(error) {
      throw new Error(`Unable to initialize tts engine`)
    }
  }

  private async populateVoiceList(): Promise<void> {
    try {
    const voices = this.synth.getVoices();
    this.voices = new Map();
    for (let i = 0; i < voices.length; i++) {
      this.voices.set(voices[i].voiceURI, voices[i]);
    }
  } catch(error) {
    throw new Error(`Unable to get voice list`)
  }
  }

  public setLanguage = (language: string) => {
    this.language = language;
    this.setVoice(this.getDefaultVoice());
  };

  private getDefaultVoice = (): SpeechSynthesisVoice => {
    try {
      for (const voice of this.voices.values()) {
        if (voice.default && voice.lang.startsWith(this.language)) {
          return voice;
        }
      }
    } catch (error) {
      throw new error(`Unable to get default voice: ${error}`);
    }

    return this.voices.values().next().value;
  };

  public setVoice = (voice: SpeechSynthesisVoice) => (this.voice = voice);

  public getVoiceList = (): SpeechSynthesisVoice[] => {
    let voiceArray: SpeechSynthesisVoice[] = Array.from(this.voices.values());

    voiceArray = voiceArray.sort(function (a, b) {
      const aname = a.name.toUpperCase();
      const bname = b.name.toUpperCase();

      if (aname < bname) {
        return -1;
      } else if (aname == bname) {
        return 0;
      } else {
        return +1;
      }
    });

    return voiceArray;
  };

  public setRate = (newRate: number) => {
    this.rate = newRate;
  };

  public speak = (text: string) => {
    this.stop();

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = this.voice;
    utterThis.rate = this.rate;
    utterThis.onerror = (error) => {
      throw new Error(`Speech utterance errored out: ${error}`);
    };

    this.synth.speak(utterThis);
  };

  public getRate = (): number => this.rate;

  public stop = () => {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  };

  public destroy = () => {
    this.stop();
    this.synth = undefined;
  };
}

export default TTSSpeechEngine;
