import Sound from "@lib/sound/sound";
import SpeechManager from "@lib/speech/speech_manager";
import { DatetimeHelper, TimeInformation } from "@lib/helpers/datetime_helper";

export default class LevelPositionController {
    private sound: Sound;
    private speaker: SpeechManager

    constructor(sound: Sound, speaker: SpeechManager) {
        this.sound = sound;
        this.speaker = speaker;
        const time: TimeInformation = DatetimeHelper.millisecondsToTime(this.sound.getDuration())
        this.speaker.speak(`Loaded. Total time is ${time.minutes} minutes, ${time.seconds} seconds`)
    }
}