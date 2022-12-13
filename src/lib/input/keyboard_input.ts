import KeyboardKey from "@lib/input/enums/keyboard_key";
import EventManager from "@lib/events/event_manager";
import EventType from "@lib/events/enums/event_type";

class KeyboardInput extends EventManager{
    private _keysDown: Map<KeyboardKey, boolean>;
    private _keysUp: Map<KeyboardKey, boolean>;
    private isInitialized = false;

    constructor() {
        super();

        this._keysDown = new Map();
        this._keysUp = new Map();

        this.setupKeyboardEvents();
    }

    private setupKeyboardEvents() {
        this.isInitialized = true;
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            this.onKeyDown(event.key as unknown as KeyboardKey);
        });

        document.addEventListener("keyup", (event: KeyboardEvent) => {
            this.onKeyUp(event.key as unknown as KeyboardKey);
        });
    }

    public reset(): void {
        this._keysDown.forEach((value, key) => {
            this._keysDown.set(key, false);
        });

        this._keysUp.forEach((value, key) => {
            this._keysUp.set(key, false);
        });

        this.setupKeyboardEvents();
    }

    private onKeyUp(key: KeyboardKey): void {
        this._keysDown.set(key, false);
        this._keysUp.set(key, true);

        this.notify(EventType.KEYBOARD_KEY_RELEASED, key as never)
    }

    private onKeyDown(key: KeyboardKey): void {
        this._keysDown.set(key, true);
        this._keysUp.set(key, false);

        this.notify(EventType.KEYBOARD_KEY_PRESSED, key as never)
    }

    public isDown(key: KeyboardKey): boolean {
        if (!this.isInitialized) {
            this.reset();
            this.setupKeyboardEvents();
        }

        return this._keysDown.get(key) || false;
    }

    public isUp(key: KeyboardKey): boolean {
        if (!this.isInitialized) {
            this.reset();
            this.setupKeyboardEvents();
        }

        return !this._keysUp.get(key) || false;
    }

    public isPressed(key: KeyboardKey): boolean {
        if (!this.isInitialized) {
            this.reset();
            this.setupKeyboardEvents();
        }

        return this._keysDown.get(key) || false;
    }

    public isReleased(key: KeyboardKey): boolean {
        if (!this.isInitialized) {
            this.reset();
            this.setupKeyboardEvents();
        }

        return this._keysUp.get(key) || false;
    }

    public destroy = () => {
        this.isInitialized = false;
        
        document.removeEventListener("keydown", (event: KeyboardEvent) => {
            this.onKeyDown(event.key as unknown as KeyboardKey);
        });

        document.removeEventListener("keyup", (event: KeyboardEvent) => {
            this.onKeyUp(event.key as unknown as KeyboardKey);
        });
    }
}

export default KeyboardInput;
