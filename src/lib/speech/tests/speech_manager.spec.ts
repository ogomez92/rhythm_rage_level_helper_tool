import SpeechManager from "@lib/speech/speech_manager";
import SpeechEngineType from "@lib/speech/enums/speech_engine_type";

describe("Speech Manager", () => {
  let speechManager: SpeechManager;

  it("should initialize with a tts engine but fallback to ARIA because no voices are found", async () => {
    speechManager = new SpeechManager();

    expect(speechManager.getSynthType()).toBe(SpeechEngineType.TTS);

    await speechManager.initialize();

    expect(speechManager.getSynthType()).toBe(SpeechEngineType.ARIA);
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

    speechManager = new SpeechManager();

    expect(speechManager.getSynthType()).toBe(SpeechEngineType.TTS);

    speechManager.initialize().then(() => {
      expect(speechManager.getSynthType()).toBe(SpeechEngineType.TTS);
    });
    
    window.speechSynthesis.onvoiceschanged(new Event("onvoiceschanged"));
  });
});
