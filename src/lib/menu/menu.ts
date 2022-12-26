import MenuItem from "@lib/menu/interfaces/menu_item";
import KeyboardInput from "@lib/input/keyboard_input";
import Sound from "@lib/sound/sound";
import SpeechManager from "@lib/speech/speech_manager";
import EventSubscriber from "@lib/events/interfaces/event_subscriber";
import EventNotification from "@lib/events/interfaces/event_notification";
import EventType from "../events/enums/event_type";
import KeyboardKeycode from "../input/enums/keyboard_keycode";
import TimeHelper from "@lib/helpers/time_helper";

export default class Menu implements EventSubscriber {
    private items: MenuItem[];
    private input: KeyboardInput
    private timeToWaitUntilHelp = 1250;
    private itemHelpTimeout: number;
    private currentPosition = -1;
    private introSound: Sound;
    private introText: string;
    private moveSound: Sound;
    private wrapSound: Sound;
    private selectSound: Sound;
    private selectedPositionID: string;
    private speaker: SpeechManager


    constructor(items: MenuItem[], speechManager: SpeechManager) {
        this.items = items;
        this.input = new KeyboardInput();
        this.speaker = speechManager;
    }

    public setIntroSound = (sound: Sound) => {
        this.introSound = sound;
    }

    public destroy = () => {
        if (this.itemHelpTimeout) {
            clearTimeout(this.itemHelpTimeout);
        }

        this.input.destroy();

        this.items.forEach(item => {
            item.destroy();
        });

        if (this.introSound) {
            this.introSound.destroy();
        }

        if (this.moveSound) {
            this.moveSound.destroy();
        }

        if (this.wrapSound) {
            this.wrapSound.destroy();
        }

        if (this.selectSound) {
            this.selectSound.destroy();
        }
    }

    public setIntroText = (text: string) => this.introText = text;

    public setMoveSound = (sound: Sound) => this.moveSound = sound;

    public setWrapSound = (sound: Sound) => this.wrapSound = sound;

    public setSelectSound = (sound: Sound) => this.selectSound = sound;

    private moveBufferDown = () => {
        this.currentPosition++;

        if (this.currentPosition >= this.items.length) {
            this.currentPosition = 0;
            this.playWrapSound();
        } else {
            this.playMoveSound();
        }

        this.speaker.speak(this.currentPosition.toString());
        this.items[this.currentPosition].focus();
        this.prepareHelp();
    }

    private moveBufferUp = () => {
        this.currentPosition--;
        if (this.currentPosition < 0) {
            this.currentPosition = this.items.length - 1;
            this.playWrapSound();
        } else {
            this.playMoveSound();
        }
        this.speaker.speak(this.currentPosition.toString());
        this.items[this.currentPosition].focus();
        this.prepareHelp();
    }

    private prepareHelp = () => {
        if (this.itemHelpTimeout) {
            clearTimeout(this.itemHelpTimeout);
        }

        this.itemHelpTimeout = window.setTimeout(() => {
            this.items[this.currentPosition].speakHelp();
        }, this.timeToWaitUntilHelp);
    }

    public setTimeToWaitUntilHelp = (time: number) => this.timeToWaitUntilHelp = time;

    public display = async (): Promise<string> => {
        if (this.introSound) {
            this.introSound.stop().play();
        }

        if (this.introText) {
            this.speaker.speak(this.introText);
        }

        this.input.subscribe(EventType.KEYBOARD_KEY_PRESSED, this);

        this.selectedPositionID = null;

        await TimeHelper.waitUntil(() => this.selectedPositionID !== null);

        this.playSelectSound();
        const selectedOption = this.selectedPositionID;

        this.reset();

        return selectedOption;
    }

    public onNotificationReceived = (event: EventNotification) => {
        const data = event.data;

        switch (data) {
            case KeyboardKeycode.ENTER:
                if (this.currentPosition >= 0) {
                    this.selectedPositionID = this.items[this.currentPosition].getID();
                }
                break;
            case KeyboardKeycode.DOWNARROW:
                this.moveBufferDown();
                break;
            case KeyboardKeycode.UPARROW:
                this.moveBufferUp();
                break;
        }
    }

    public reset = (removeIntro = true) => {
        this.input.unsubscribe(EventType.KEYBOARD_KEY_PRESSED, this)
        this.selectedPositionID = null;

        if (this.itemHelpTimeout) {
            clearTimeout(this.itemHelpTimeout);
        }

        if (removeIntro) {
            this.introSound.destroy();
            this.introSound = null;
        }
    }

    private playWrapSound = () => {
        if (this.wrapSound) {
            this.wrapSound.stop().play();
        }
    }

    private playMoveSound = () => {
        if (this.moveSound) {
            this.moveSound.stop().play();
        }
    }

    private playSelectSound = () => {
        if (this.selectSound) {
            this.selectSound.stop().play();
        }
    }
}
