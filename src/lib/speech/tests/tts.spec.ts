import TTSSpeechEngine from "@lib/speech/tts_speech";
import Language from "@lib/localization/enums/language";

describe("TTS engine", () => {
  it("Should throw an error upon initialization because there aren't any voices available", async () => {
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

    const speech = new TTSSpeechEngine();

    await expect(speech.initialize()).rejects.toThrow(
      "Unable to initialize tts engine"
    );
  });

  it("should correctly initialize text to speech tts with mocked voices", async () => {
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

    await speech.initialize();

    expect(speech.getCurrentVoiceName()).toBe("test1");
    expect(speech.getVoiceList()).toHaveLength(4);
    expect(speech.getVoiceListForCurrentLanguage()).toHaveLength(2);
  });

  it("Changes the language of the engine and gets the new voices", async () => {
    const speech = new TTSSpeechEngine();

    await speech.initialize();

    speech.setLanguage(Language.SPANISH);

    expect(speech.getCurrentVoiceName()).toBe("estest1");
    expect(speech.getVoiceList()).toHaveLength(4);
    expect(speech.getVoiceListForCurrentLanguage()).toHaveLength(2);
    expect(speech.getCurrentVoiceName()).toBe("estest1");
  });
  it("Throws an error if an invalid language is given and falls back to English", async () => {
    const speech = new TTSSpeechEngine();

    await speech.initialize();

    expect(() => speech.setLanguage(Language.UNKNOWN)).toThrow();

    expect(speech.getCurrentVoiceName()).toBe("test1");
  });

  it("throws an error if speak is used before initialization", () => {
    const speech = new TTSSpeechEngine();

    expect(() => speech.speak("test")).toThrow(/before initialization/);
  });

  it("correctly speaks an utterance", async () => {
    const TEST_MESSAGE = "test";

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: jest.fn().mockImplementation(() => ({
        addEventListener: jest.fn(),
      })),
    });

    const speech = new TTSSpeechEngine();

    await speech.initialize();

    speech.speak(TEST_MESSAGE);

    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });
});
