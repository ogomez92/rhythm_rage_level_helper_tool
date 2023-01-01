import MenuItem from "@lib/menu/interfaces/menu_item";
import Sound from "@lib/sound/sound";
import KeyboardKey from "../input/enums/keyboard_key";
import LocalizationService from "../localization/localization_service";

export default class SoundItem implements MenuItem {
    private text: string;
    private id: string;
    private sound: Sound;
    private shortcut: KeyboardKey | string;

    constructor(id: string, sound: Sound, shortcut: string | KeyboardKey = null) {
        this.id = id;
        this.sound = sound;
        this.shortcut = shortcut;
    }

    public getID = (): string => this.id;

    public destroy = () => {
        this.sound.destroy();
    }

    public focus = () => {
        this.sound.stop().play();
    }

    public getHelpText= (): string => {
        let helpText = '';
        if (this.shortcut) {
            helpText += `${LocalizationService.translate('libMenuShortcutKeyInfo', {key: this.shortcut})} `;
        }

        helpText += LocalizationService.translate('libMenuEnterToSelect');

        return helpText;
    }

    public getShortcut = (): string => this.shortcut;

    public unfocus = () => this.sound.stop();

    public isSelectable = (): boolean => true;
}
