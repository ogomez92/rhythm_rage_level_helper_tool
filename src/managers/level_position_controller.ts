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
  private tempoInMS = 0;
  private tempos: number[] = [];

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
      if (
        this.input.isPressed(KeyboardKeycode.CTRL) &&
        this.sound.isPlaying()
      ) {
        this.position = this.sound.getCurrentTime();
      }

      this.togglePlaybackState();
    } else if (key == KeyboardKeycode.KEYH) {
      this.tapTempo();
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

  public tapTempo = () => {
    this.tempos.push(performance.now());
    if (this.tempos.length >= 8) {
      let sum = 0;
      for (let i = 1; i < this.tempos.length; i++) {
        sum += this.tempos[i] - this.tempos[i - 1];
      }

      this.tempoInMS = sum / (this.tempos.length - 1);
      this.speaker.speak(`Tempo calculation done, ${Math.round(this.tempoInMS)} ms`);

      this.tempos = [];
    }
  };
}
