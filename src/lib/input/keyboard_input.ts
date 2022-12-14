import KeyboardKeycode from "@lib/input/enums/keyboard_keycode";
import EventManager from "@lib/events/event_manager";
import EventType from "@lib/events/enums/event_type";

class KeyboardInput extends EventManager {
  private _keysDown: Map<KeyboardKeycode, boolean>;
  private isInitialized = false;

  constructor() {
    super();

    this._keysDown = new Map();

    this.setupKeyboardEvents();
  }

  private setupKeyboardEvents() {
    this.isInitialized = true;

    document.addEventListener("keydown", (event: KeyboardEvent) => {
      this.onKeyDown(event.which as KeyboardKeycode);

      if (event.key.length == 1) {
        this.onCharacterType(event.key);
      }
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      this.onKeyUp(event.which as KeyboardKeycode);
    });
  }

  public reset(): void {
    this._keysDown.forEach((value, key) => {
      this._keysDown.delete(key);
    });

    this.setupKeyboardEvents();
  }

  private onKeyUp(key: KeyboardKeycode): void {
    this._keysDown.delete(key);

    this.notify(EventType.KEYBOARD_KEY_RELEASED, key as never);
  }

  private onKeyDown(key: KeyboardKeycode): void {
    this._keysDown.set(key, true);

    this.notify(EventType.KEYBOARD_KEY_PRESSED, key as never);
  }

  private onCharacterType(character: string): void {
    this.notify(EventType.CHARACTER_TYPED, character as never);
  }

  public isPressed(key: KeyboardKeycode): boolean {
    if (!this.isInitialized) {
      this.reset();
      this.setupKeyboardEvents();
      return false;
    }

    return this._keysDown.get(key) || false;
  }

  public isReleased(key: KeyboardKeycode): boolean {
    if (!this.isInitialized) {
      this.reset();
      this.setupKeyboardEvents();
    }

    return !this._keysDown.get(key) || true;
  }

  public destroy = () => {
    this.isInitialized = false;

    document.removeEventListener("keydown", (event: KeyboardEvent) => {
      this.onKeyDown(event.key as unknown as KeyboardKeycode);
    });

    document.removeEventListener("keyup", (event: KeyboardEvent) => {
      this.onKeyUp(event.key as unknown as KeyboardKeycode);
    });
  };

  public getKeysPressed = () => this._keysDown;
}

export default KeyboardInput;
