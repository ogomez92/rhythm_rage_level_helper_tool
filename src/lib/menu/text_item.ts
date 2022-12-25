import MenuItem from "@lib/menu/interfaces/menu_item";
import SpeechManager from "@lib//speech/speech_manager";
import KeyboardKey from "../input/enums/keyboard_key";

export default class TextItem implements MenuItem {
    private text: string;
    private id: string;
    private speaker: SpeechManager;
    private shortcut: KeyboardKey;

    constructor(id: string, text: string, manager: SpeechManager) {
        this.id = id;
        this.speaker = manager;
        this.text = text;
    }

    public getID = (): string => this.id;

    public destroy = () => {
        this.speaker.destroy();
    }

    public focus = () => {
        this.speaker.speak(this.text);
    }

    public addShortcut = (key: KeyboardKey) => this.shortcut = key;

    public speakHelp = () => {
        // Todo: translate this
        let helpText = '';
        if (this.shortcut) {
            helpText += `You can pres: ${this.shortcut}, to activate this option.`
        }

        helpText += `To select ${this.text}, Press enter.`

        this.speaker.speak(helpText);
    }
}
