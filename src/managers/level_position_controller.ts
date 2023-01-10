import Sound from "@lib/sound/sound";
import SpeechManager from "@lib/speech/speech_manager";

export default class LevelPositionController {
    private sound: Sound;
    private speaker: SpeechManager

    constructor(sound: Sound, speaker: SpeechManager) {
        this.sound = sound;
        this.speaker = speaker;
        this.speaker.speak(`Loaded. Total time is ${sound.getDuration()}`)
    }
}