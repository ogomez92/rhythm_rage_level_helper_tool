import SpeechManager from "@lib/speech/speech_manager";
import KeyboardInput from "@lib/input/keyboard_input";
import EventType from "@lib/events/enums/event_type";
import EventSubscriber from "@lib/events/interfaces/event_subscriber";
import EventNotification from "@lib/events/interfaces/event_notification";
import KeyboardKeycode from "@lib/input/enums/keyboard_keycode";

export default class SpeechHistory implements EventSubscriber {
    private buffer: string[];
    private speaker: SpeechManager;
    private input: KeyboardInput;
    private position: number;
    private active: boolean;

    constructor(speechManager: SpeechManager) {
        this.input = new KeyboardInput();
        this.active = true;
        this.input.subscribe(EventType.KEYBOARD_KEY_PRESSED, this)
        this.speaker = speechManager;
        this.buffer = [];
        this.position = 0;
    }

    public onNotificationReceived = (event: EventNotification): void => {
        const keyPressed: any = event.data;

        if (keyPressed >= KeyboardKeycode.KEY0 && keyPressed <= KeyboardKeycode.KEY9) {
            if (this.input.isPressed(KeyboardKeycode.ALT)) {
                let positionToSpeak = keyPressed - KeyboardKeycode.KEY0;
                if (positionToSpeak == 0) {
                    positionToSpeak = 10;
                }

                this.speakBufferMessageAtPositionFromBottom(positionToSpeak);
            }
        }
        else if (keyPressed == KeyboardKeycode.PAGEDOWN) {
            this.increasePosition();
            this.speakBufferMessageAtPosition(this.position);
        }
        else if (keyPressed == KeyboardKeycode.PAGEUP) {
            this.decreasePosition();
            this.speakBufferMessageAtPosition(this.position);
        }
    }

    public decreasePosition = () => {
        if (this.input.isPressed(KeyboardKeycode.CTRL)) {
            this.position = 0;
            return;
        }

        if (this.position > 0) {
            this.position--;
        }
    }

    public increasePosition = () => {
        if (this.input.isPressed(KeyboardKeycode.CTRL)) {
            this.position = this.buffer.length - 1;
            return;
        }

        if (this.position < this.buffer.length - 1) {
            this.position++;
        }
    }

    public speakBufferMessageAtPosition = (position = this.position) => {
        this.stop();

        if (position >= 0 && position < this.buffer.length) {
            this.speaker.speak(this.buffer[position]);
        }
        else {
            // Todo: Translate this
            this.speaker.speak(`No message at position ${position}`);
        }
    }

    public speakBufferMessageAtPositionFromBottom = (position = this.position) => {
        this.stop();
        if (position > 0 && position <= this.buffer.length) {
            this.speaker.speak(this.buffer[this.buffer.length - position]);
        }
        else {
            this.speaker.speak(`No message at position ${position}`);
        }
    }

    public add = (text: string) => {
        this.speaker.speak(text);
        this.buffer.push(text);
        this.cleanup();
    }

    public stop = () => this.speaker.stop();

    public getPosition = (): number => this.position;

    public cleanup = () => {
        if (this.buffer.length > 100) {
            this.buffer.shift();
        }
    }

    public destroy = () => {
        this.input.destroy();
        this.input = null;
        this.speaker = null;
        this.buffer = null;
    }
}
