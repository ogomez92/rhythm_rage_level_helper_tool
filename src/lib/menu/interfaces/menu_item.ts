import KeyboardKey from "@lib/input/enums/keyboard_key";
import Sound from "@lib/sound/sound";

export default interface MenuItem {
    getID(): string;
    addShortcut(key: KeyboardKey): void;
    destroy(): void;
    focus(): void;
    speakHelp(): void;
}
