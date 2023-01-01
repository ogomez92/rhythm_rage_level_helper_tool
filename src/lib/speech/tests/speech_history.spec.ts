import SpeechHistory from "@lib/speech/speech_history";
import SpeechManager from "@lib/speech/speech_manager";
import SpeechEngineType from "@lib/speech/enums/speech_engine_type";
import KeyboardKeycode from "@lib/input/enums/keyboard_keycode";
import KeyboardKey from "@lib/input/enums/keyboard_key";

describe('speech history', () => {
    let history: SpeechHistory;
    beforeEach(async () => {
        document.body.innerHTML = `        <div id="root"></div>        `;
        const manager = new SpeechManager(SpeechEngineType.ARIA);

        await manager.initialize();

        history = new SpeechHistory(manager);
    })

    it('tries to access the first element without any elements added', () => {
        const event = new KeyboardEvent("keydown", {
            key: KeyboardKey.Alt,
            which: KeyboardKeycode.ALT,
        });
        document.dispatchEvent(event);

        const event2 = new KeyboardEvent("keydown", {
            key: '1',
            which: KeyboardKeycode.KEY1,
        });
        document.dispatchEvent(event2);

        const ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toMatch(/position: 1/);
    })

    it('tries to access the 10th element without any elements added', () => {
        const event = new KeyboardEvent("keydown", {
            key: KeyboardKey.Alt,
            which: KeyboardKeycode.ALT,
        });
        document.dispatchEvent(event);

        const event2 = new KeyboardEvent("keydown", {
            key: '0',
            which: KeyboardKeycode.KEY0,
        });
        document.dispatchEvent(event2);

        const ariaSpeechText = document.getElementById("ariaSpeech").innerText;

        expect(ariaSpeechText).toMatch(/position: 10/);
    })

    it('Adds some messages and moves among them', () => {
        history.add('first');
        history.add('second');
        history.add('third');
        history.add('fourth');

        const event = new KeyboardEvent("keydown", {
            key: KeyboardKey.Control,
            which: KeyboardKeycode.CTRL,
        });
        document.dispatchEvent(event);

        const event2 = new KeyboardEvent("keydown", {
            key: KeyboardKey.PageUp,
            which: KeyboardKeycode.PAGEUP,
        });
        document.dispatchEvent(event2);

        let ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('first')

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: KeyboardKey.PageDown,
            which: KeyboardKeycode.PAGEDOWN,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('fourth')

        document.dispatchEvent(new KeyboardEvent("keyup", {
            key: KeyboardKey.Control,
            which: KeyboardKeycode.CTRL,
        }));

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: KeyboardKey.PageUp,
            which: KeyboardKeycode.PAGEUP,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('third')

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: KeyboardKey.PageUp,
            which: KeyboardKeycode.PAGEUP,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('second')
        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: KeyboardKey.PageUp,
            which: KeyboardKeycode.PAGEUP,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('first')
        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: KeyboardKey.PageUp,
            which: KeyboardKeycode.PAGEUP,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('first')

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: KeyboardKey.Alt,
            which: KeyboardKeycode.ALT,
        }));

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: '1',
            which: KeyboardKeycode.KEY1,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('fourth')

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: '2',
            which: KeyboardKeycode.KEY2,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toBe('third')

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: '5',
            which: KeyboardKeycode.KEY5,
        }));

        ariaSpeechText = document.getElementById("ariaSpeech").innerText;
        expect(ariaSpeechText).toMatch(/position: 5/)

    })
})