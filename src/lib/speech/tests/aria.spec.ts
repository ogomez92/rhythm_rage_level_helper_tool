import AriaSpeechEngine from "@lib/speech/aria_speech";

describe("AriaSpeechEngine", () => {
  let engine: AriaSpeechEngine;

  beforeEach(() => {
    document.body.innerHTML = `        <div id="root"></div>        `;
    engine = new AriaSpeechEngine();
  });

  it("properly creates html element with the right text", () => {
    const text = "Test text";
    engine.speak(text);
    const ariaLiveElement = document.getElementById("ariaSpeech");
    expect(ariaLiveElement).not.toBeNull();
    expect(ariaLiveElement?.innerText).toBe(text);
  });

  it('Tests that ARIA speech is successfully removed from the HTML', () => {
    const text = "Test text";
    engine.speak(text);
    const ariaLiveElement = document.getElementById("ariaSpeech");
    expect(ariaLiveElement).not.toBeNull();

    engine.destroy();
    expect(document.getElementById("ariaSpeech")).toBeNull();
  })

  it('Tests that when stop is called the inner text is emptied', () => {
    const text = "Test text";
    engine.speak(text);
    const ariaLiveElement = document.getElementById("ariaSpeech");
    expect(ariaLiveElement).not.toBeNull();

    engine.stop();
    expect(ariaLiveElement?.innerText).toBe('');
  })

});
