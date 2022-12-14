import SpeechManager from "@lib/speech/speech_manager";
import SpeechEngineType from "@lib/speech/enums/speech_engine_type";

describe("Speech Manager", () => {
  let speechManager: SpeechManager;

  beforeEach(() => {
    
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

    speechManager = new SpeechManager();
  });

  it("should initialize with a tts engine but fallback to ARIA because no voices are found", async () => {
    expect(speechManager.getSynthType()).toBe(SpeechEngineType.TTS);

    await speechManager.initialize();
    
    expect(speechManager.getSynthType()).toBe(SpeechEngineType.ARIA);
  });
});
