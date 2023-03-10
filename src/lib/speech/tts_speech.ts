import SpeechEngine from "@lib/speech/interfaces/speech_engine";
import Language from "@lib/localization/enums/language";
import LocalizationService from "@lib/localization/localization_service";

const LANGUAGE_USED = LocalizationService.getDefaultLanguage();

class TTSSpeechEngine implements SpeechEngine {
  private synth: SpeechSynthesis;
  private rate = 1;
  private voices: Map<string, SpeechSynthesisVoice> = new Map();
  private language: Language;
  private voice: SpeechSynthesisVoice;
  private isReady = false;

  constructor(language = LANGUAGE_USED) {
    this.language = language;
  }

  public async initialize(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('This browser does not support text to speech, no voices are available.'));
      }
      this.synth = window.speechSynthesis;
      this.synth.onvoiceschanged = () => {
        this.populateVoiceList();

        if (this.voices.size == 0) {
          return;
        }

        this.setVoice(this.getDefaultVoice());
        resolve(true);
      };
    });
  }

  private async populateVoiceList(): Promise<void> {
    try {
      const voices = this.synth.getVoices();
      this.voices = new Map();

      for (let i = 0; i < voices.length; i++) {
        this.voices.set(voices[i].voiceURI, voices[i]);
      }
    } catch (error) {
      throw new Error(`Unable to get voice list: ${error}`);
    }
  }

  public setLanguage = (language: Language) => {
    const oldLanguage = this.language;
    try {
      this.language = language;
      this.setVoice(this.getDefaultVoice());
    } catch (error) {
      this.language = oldLanguage;
      throw new Error(`Invalid language for tts specified: ${error}`);
    }
  };

  private getDefaultVoice = (): SpeechSynthesisVoice => {

    for (const voice of this.voices.values()) {
      if (voice.default && voice.lang.startsWith(this.language)) {
        return voice;
      }
    }
    for (const voice of this.voices.values()) {
      if (voice.lang.startsWith(this.language)) {
        return voice;
      }
    }

    throw new Error(
      `Unable to get default voice: Language given was ${this.language}`
    );
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

  public getVoiceListForCurrentLanguage = (): SpeechSynthesisVoice[] => {
    let voiceArray: SpeechSynthesisVoice[] = Array.from(this.voices.values());

    voiceArray = voiceArray.filter((voice) =>
      voice.lang.startsWith(this.language)
    );

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
    if (this.voices.size === 0) {
      throw new Error(`Speak cannot be used when no voices are available`);
    }

    this.stop();
    try {
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.voice = this.voice;
      utterThis.rate = this.rate;
      utterThis.onerror = (error) => {
        throw new Error(`Speech utterance errored out: ${error}`);
      };

      this.synth.speak(utterThis);
    } catch (error) {
      throw new Error(
        `There was an error creating the speech utterance: ${error}`
      );
    }
  };

  public getRate = (): number => this.rate;

  public stop = () => {
    if (!this.synth) {
      return;
    }

    if (this.synth.speaking) {
      this.synth.cancel();
    }
  };

  public destroy = () => {
    this.stop();
    this.synth = undefined;
  };

  public getCurrentVoiceName = (): string => this.voice.name;

  public getLanguage = () => this.language;
}

export default TTSSpeechEngine;
