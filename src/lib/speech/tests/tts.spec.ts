import TTSSpeechEngine from "@lib/speech/tts_speech";
import Language from "@lib/localization/enums/language";

describe("TTS engine", () => {
  it("Should throw an error upon initialization because there aren't any voices available", async () => {
    const speech = new TTSSpeechEngine();

    // call intialize and expect it to reject
    await expect(speech.initialize()).rejects.toThrow(/no voices/);
  });

  it("should correctly initialize text to speech tts with mocked voices", async () => {
    const mockSpeechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      onvoiceschanged: jest.fn(),
      getVoices: jest.fn(),
    };

    Object.defineProperty(window, "speechSynthesis", {
      value: mockSpeechSynthesis,
    });

    const voiceMock = jest.fn(() => [
      {
        name: "test1",
        voiceURI: "test1",
        lang: "en",
        default: true,
      },
      {
        name: "test2",
        voiceURI: "test2",
        lang: "en",
        default: false,
      },
      {
        name: "estest1",
        voiceURI: "estest1",
        lang: "es",
        default: true,
      },
      {
        name: "estest2",
        voiceURI: "estest2",
        lang: "es",
        default: false,
      },
    ]);

    Object.defineProperty(window.speechSynthesis, "getVoices", {
      value: voiceMock,
    });

    const speech = new TTSSpeechEngine();

    speech.initialize().then(() => {
      expect(speech.getCurrentVoiceName()).toBe("test1");
      expect(speech.getVoiceList()).toHaveLength(4);
      expect(speech.getVoiceListForCurrentLanguage()).toHaveLength(2);
    });

    window.speechSynthesis.onvoiceschanged(new Event("onvoiceschanged"));
  });

  it("Changes the language of the engine and gets the new voices", async () => {
    const speech = new TTSSpeechEngine();

    speech.initialize().then(() => {
      speech.setLanguage(Language.SPANISH);

      expect(speech.getCurrentVoiceName()).toBe("estest1");
      expect(speech.getVoiceList()).toHaveLength(4);
      expect(speech.getVoiceListForCurrentLanguage()).toHaveLength(2);
      expect(speech.getCurrentVoiceName()).toBe("estest1");
    });
    window.speechSynthesis.onvoiceschanged(new Event("onvoiceschanged"));
  });

  it("Throws an error if an invalid language is given and falls back to the previously used language", async () => {
    const speech = new TTSSpeechEngine();

    speech.initialize().then(() => {
      const currentLanguage: Language = speech.getLanguage();

      expect(() => speech.setLanguage(Language.UNKNOWN)).toThrow();
      expect(speech.getCurrentVoiceName()).toBe("test1");
      expect(speech.getLanguage()).toBe(currentLanguage);
    });
    window.speechSynthesis.onvoiceschanged(new Event("onvoiceschanged"));
  });

  it("throws an error if speak is used before initialization", () => {
    const speech = new TTSSpeechEngine();

    expect(() => speech.speak("test")).toThrow(/no voices are available/);
  });

  it("correctly speaks an utterance", async () => {
    const TEST_MESSAGE = "test";

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
      })),
    });

    const speech = new TTSSpeechEngine();
    speech.initialize().then(() => {
      speech.speak(TEST_MESSAGE);

      expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
    });
    window.speechSynthesis.onvoiceschanged(new Event("onvoiceschanged"));
  });

  it("correctly uses the stop function", async () => {
    const speech = new TTSSpeechEngine();

    speech.initialize().then(() => {
      expect(() => speech.stop()).not.toThrow();
    });

    window.speechSynthesis.onvoiceschanged(new Event("onvoiceschanged"));
  });
});
