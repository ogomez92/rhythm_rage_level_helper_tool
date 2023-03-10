import MenuItem from "@lib/menu/interfaces/menu_item";
import SpeechManager from "@lib//speech/speech_manager";
import KeyboardKey from "../input/enums/keyboard_key";
import LocalizationService from "../localization/localization_service";

export default class TextItem implements MenuItem {
    private text: string;
    private id: string;
    private speaker: SpeechManager;
    private shortcut: KeyboardKey | string;

    constructor(id: string, text: string, speaker: SpeechManager, shortcut: string | KeyboardKey = null) {
        this.id = id;
        this.speaker = speaker;
        this.text = text;
        this.shortcut = shortcut;
    }

    public getID = (): string => this.id;

    public destroy = () => {
        this.speaker.destroy();
    }

    public focus = () => {
        this.speaker.speak(this.text);
    }

    public getHelpText= (): string => {
        let helpText = '';
        if (this.shortcut) {
            helpText += `${LocalizationService.translate('libMenuShortcutKeyInfo', {key: this.shortcut})} `
        }

        helpText += LocalizationService.translate('libMenuTextItemSelectInfo', {itemName: this.text})

        return helpText;
    }

    public getShortcut = (): string => this.shortcut;

    public unfocus = () => this.speaker.speak('');

    public isSelectable = (): boolean => true;
}
