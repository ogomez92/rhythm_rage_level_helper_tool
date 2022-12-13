class AriaSpeechEngine {
    private HTMLElement: HTMLDivElement;
    private lastSpokenString: string;

    constructor() {
        const screenReaderElement = document.createElement('div');
        screenReaderElement.setAttribute('aria-live', 'assertive');
        screenReaderElement.setAttribute('aria-atomic', 'true');
        screenReaderElement.setAttribute('aria-relevant', 'text');
        screenReaderElement.setAttribute('role', 'status');
        screenReaderElement.setAttribute('style', 'position: absolute; top: -100px; left: -100px; width: 1px; height: 1px; overflow: hidden;');
        document.body.appendChild(screenReaderElement);
        this.HTMLElement = screenReaderElement;
    }

    speak(text: string) {
        if (text === this.lastSpokenString && text !== '') {
            this.speak('');
        }

        this.HTMLElement.innerText = text;
    }
}

export default AriaSpeechEngine;
