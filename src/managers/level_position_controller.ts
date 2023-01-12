import Sound from "@lib/sound/sound";
import SpeechManager from "@lib/speech/speech_manager";
import { DatetimeHelper, TimeInformation } from "@lib/helpers/datetime_helper";
import KeyboardInput from "@lib/input/keyboard_input";
import KeyboardKeycode from "@lib/input/enums/keyboard_keycode";
import EventType from "@lib/events/enums/event_type";
import EventSubscriber from "@lib/events/interfaces/event_subscriber";
import EventNotification from "@lib/events/interfaces/event_notification";

export default class LevelPositionController implements EventSubscriber {
  private sound: Sound;
  private speaker: SpeechManager;
  private input: KeyboardInput;
  private position = 0;

  constructor(sound: Sound, speaker: SpeechManager) {
    this.sound = sound;
    this.speaker = speaker;
    const time: TimeInformation = DatetimeHelper.millisecondsToTime(
      this.sound.getDuration()
    );
    this.speaker.speak(
      `Loaded. Total time is ${time.minutes} minutes, ${time.seconds} seconds`
    );
    this.input = new KeyboardInput();
    this.input.subscribe(EventType.KEYBOARD_KEY_PRESSED, this);
  }

  onNotificationReceived(event: EventNotification): void {
    const key: KeyboardKeycode = event.data;

    if (key == KeyboardKeycode.SPACE) {
      if (this.input.isPressed(KeyboardKeycode.CTRL) && this.sound.isPlaying()) {
        this.position = this.sound.getCurrentTime();
      }

      this.togglePlaybackState();
    }
  }

  private togglePlaybackState = () => {
    if (this.sound.isPlaying()) {
      this.sound.pause();
    } else {
      this.sound.seek(this.position);
      this.sound.play();
    }
  };
}
