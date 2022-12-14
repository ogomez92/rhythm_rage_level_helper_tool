import KeyboardInput from "@lib/input/keyboard_input";
import EventType from "@lib/events/enums/event_type";
import KeyboardKeycode from "@lib/input/enums/keyboard_keycode";
import KeyboardKey from "@lib/input/enums/keyboard_key";
import EventManager from "@lib/events/event_manager";
import EventNotification from "@lib/events/interfaces/event_notification";

describe("KeyboardInput", () => {
  let keyboardInput: KeyboardInput;

  beforeEach(() => {
    keyboardInput = new KeyboardInput();
  });

  it("should be correctly initialized", () => {
    expect(keyboardInput.getKeysPressed()).toEqual(new Map());
    expect(keyboardInput.getKeysReleased()).toEqual(new Map());
  });

  it("Expects a key to be pressed ", () => {
    const event = new KeyboardEvent("keydown", {
      key: KeyboardKey.Enter,
      which: KeyboardKeycode.ENTER,
    });
    document.dispatchEvent(event);

    expect(keyboardInput.getKeysPressed().size).toEqual(1);
    expect(
      keyboardInput.getKeysPressed().get(KeyboardKeycode.ENTER)
    ).toBeTruthy();
    expect(keyboardInput.isPressed(KeyboardKeycode.ENTER)).toBeTruthy;
  });

  it("Tests the press and release of the enter key", () => {
    const event = new KeyboardEvent("keydown", {
      key: KeyboardKey.Enter,
      which: KeyboardKeycode.ENTER,
    });
    document.dispatchEvent(event);

    const event2 = new KeyboardEvent("keyup", {
      key: KeyboardKey.Enter,
      which: KeyboardKeycode.ENTER,
    });
    document.dispatchEvent(event2);

    expect(keyboardInput.getKeysPressed().size).toEqual(0);
    expect(keyboardInput.getKeysReleased().size).toEqual(1);
    expect(
      keyboardInput.getKeysReleased().get(KeyboardKeycode.ENTER)
    ).toBeTruthy();
    expect(keyboardInput.isPressed(KeyboardKeycode.ENTER)).toBeFalsy;
  });

  it("Tests press and release of Alt + F4", () => {
    const event = new KeyboardEvent("keydown", {
      key: KeyboardKey.Alt,
      which: KeyboardKeycode.ALT,
    });
    document.dispatchEvent(event);

    const event2 = new KeyboardEvent("keydown", {
      key: KeyboardKey.F4,
      which: KeyboardKeycode.F4,
    });
    document.dispatchEvent(event2);
    expect(keyboardInput.getKeysPressed().size).toBe(2);
    expect(keyboardInput.isPressed(KeyboardKeycode.ALT)).toBeTruthy;
    expect(keyboardInput.isPressed(KeyboardKeycode.F4)).toBeTruthy;
    const event3 = new KeyboardEvent("keyup", {
      key: KeyboardKey.Alt,
      which: KeyboardKeycode.ALT,
    });
    document.dispatchEvent(event3);

    const event4 = new KeyboardEvent("keyup", {
      key: KeyboardKey.F4,
      which: KeyboardKeycode.F4,
    });
    document.dispatchEvent(event4);
    expect(keyboardInput.getKeysPressed().size).toBe(0);
    expect(keyboardInput.getKeysReleased().size).toBe(2);
    expect(keyboardInput.isPressed(KeyboardKeycode.ALT)).toBeFalsy;
    expect(keyboardInput.isPressed(KeyboardKeycode.F4)).toBeFalsy;
    keyboardInput.reset();
    expect(keyboardInput.getKeysReleased().size).toBe(0);
  });

  it("tests the reset event with the A key", () => {
    const event = new KeyboardEvent("keydown", {
      key: "a",
      which: KeyboardKeycode.KEYA,
    });
    document.dispatchEvent(event);
    expect(keyboardInput.getKeysPressed().size).toBe(1);
    expect(keyboardInput.isPressed(KeyboardKeycode.KEYA)).toBeTruthy;
    keyboardInput.reset();
    expect(keyboardInput.getKeysPressed().size).toBe(0);
    expect(keyboardInput.getKeysReleased().size).toBe(0);
  });

  it("tests the onCharacterTyped event", () => {
    const eventReceiver = new KeyboardEventReceiver();
    keyboardInput.subscribe(EventType.CHARACTER_TYPED, eventReceiver);
    keyboardInput.subscribe(EventType.KEYBOARD_KEY_PRESSED, eventReceiver);
    keyboardInput.subscribe(EventType.KEYBOARD_KEY_RELEASED, eventReceiver);
    const event = new KeyboardEvent("keydown", {
      key: "a",
      which: KeyboardKeycode.KEYA,
    });
    document.dispatchEvent(event);

    expect(eventReceiver.getCharactersTyped()).toBe("a");
    expect(eventReceiver.getKeysPressed().size).toBe(1);

    const event2 = new KeyboardEvent("keyup", {
      key: "a",
      which: KeyboardKeycode.KEYA,
    });
    document.dispatchEvent(event2);
    expect(eventReceiver.getKeysReleased().size).toBe(1);
  });

  it("Uses the keyboard event receiver to check F4 pressed and that the Alt key is down", () => {
    const eventReceiver = new KeyboardEventReceiver();
    keyboardInput.subscribe(EventType.CHARACTER_TYPED, eventReceiver);
    keyboardInput.subscribe(EventType.KEYBOARD_KEY_PRESSED, eventReceiver);
    keyboardInput.subscribe(EventType.KEYBOARD_KEY_RELEASED, eventReceiver);
    const event = new KeyboardEvent("keydown", {
      key: KeyboardKey.F4,
      which: KeyboardKeycode.F4,
    });
    document.dispatchEvent(event);

    const event2 = new KeyboardEvent("keydown", {
      key: KeyboardKey.Alt,
      which: KeyboardKeycode.ALT,
    });
    document.dispatchEvent(event2);
    expect(eventReceiver.getKeysPressed().size).toBe(2);
    expect(keyboardInput.isPressed(KeyboardKeycode.ALT)).toBeTruthy;
    expect(keyboardInput.isPressed(KeyboardKeycode.F4)).toBeTruthy;
    expect(eventReceiver.isPressed(KeyboardKeycode.F4)).toBeTruthy;
    expect(eventReceiver.isPressed(KeyboardKeycode.ALT)).toBeTruthy;
  });
});

class KeyboardEventReceiver extends EventManager {
  private keysPressed: Map<KeyboardKeycode, boolean>;
  private keysReleased: Map<KeyboardKeycode, boolean>;
  private charactersTyped: string;

  constructor() {
    super();
    this.keysPressed = new Map();
    this.keysReleased = new Map();
  }

  public getKeysPressed(): Map<KeyboardKeycode, boolean> {
    return this.keysPressed;
  }

  public getKeysReleased(): Map<KeyboardKeycode, boolean> {
    return this.keysReleased;
  }

  public onKeyPressed(keycode: KeyboardKeycode) {
    this.keysPressed.set(keycode, true);
  }

  public onKeyReleased(keycode: KeyboardKeycode) {
    this.keysReleased.set(keycode, true);
  }

  public onCharacterTyped(character: string) {
    this.charactersTyped = character;
  }

  public getCharactersTyped = () => this.charactersTyped;

  public onNotificationReceived = (e: EventNotification) => {
    switch (e.type) {
      case EventType.CHARACTER_TYPED:
        this.onCharacterTyped(e.data as string);
        break;
      case EventType.KEYBOARD_KEY_PRESSED:
        this.onKeyPressed(e.data as KeyboardKeycode);
        break;
      case EventType.KEYBOARD_KEY_RELEASED:
        this.onKeyReleased(e.data as KeyboardKeycode);
        break;
    }
  };

  public isPressed = (keycode: KeyboardKeycode) => {
    return this.keysPressed.has(keycode);
  }
}
