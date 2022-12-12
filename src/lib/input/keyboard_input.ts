import KeyboardKey from "@lib/input/enums/keyboard_key";

class KeyboardInput {
    private _keys: Map<KeyboardKey, boolean>;
    private _keysDown: Map<KeyboardKey, boolean>;
    private _keysUp: Map<KeyboardKey, boolean>;

    constructor() {
        this._keys = new Map();
        this._keysDown = new Map();
        this._keysUp = new Map();

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
    }

    public onKeyUp(key: KeyboardKey): void {
        this._keysDown.set(key, false);
        this._keysUp.set(key, true);
    }

    public onKeyDown(key: KeyboardKey): void {
        this._keysDown.set(key, true);
        this._keysUp.set(key, false);
    }

    public isDown(key: KeyboardKey): boolean {
        return this._keys.get(key) || false;
    }

    public isUp(key: KeyboardKey): boolean {
        return !this._keys.get(key) || false;
    }

    public isPressed(key: KeyboardKey): boolean {
        return this._keysDown.get(key) || false;
    }

    public isReleased(key: KeyboardKey): boolean {
        return this._keysUp.get(key) || false;
    }

    public destroy = () => {
        document.removeEventListener("keydown", (event: KeyboardEvent) => {
            this.onKeyDown(event.key as unknown as KeyboardKey);
        });

        document.removeEventListener("keyup", (event: KeyboardEvent) => {
            this.onKeyUp(event.key as unknown as KeyboardKey);
        });
    }
}

export default KeyboardInput;
