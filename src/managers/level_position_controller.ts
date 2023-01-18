import Sound from "@lib/sound/sound";
import SpeechManager from "@lib/speech/speech_manager";
import { DatetimeHelper, TimeInformation } from "@lib/helpers/datetime_helper";
import KeyboardInput from "@lib/input/keyboard_input";
import KeyboardKeycode from "@lib/input/enums/keyboard_keycode";
import EventType from "@lib/events/enums/event_type";
import EventSubscriber from "@lib/events/interfaces/event_subscriber";
import EventNotification from "@lib/events/interfaces/event_notification";
import ClipboardHelper from "@lib/helpers/clipboard_helper";

export default class LevelPositionController implements EventSubscriber {
  private sound: Sound;
  private speaker: SpeechManager;
  private input: KeyboardInput;
  private position = 0;
  private startMarker = 0;
  private tempoInMS = 1000;
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
    switch (key) {
      case KeyboardKeycode.SPACE:
        if (
          this.input.isPressed(KeyboardKeycode.CTRL) &&
          this.sound.isPlaying()
        ) {
          this.position = this.sound.getCurrentTime();
        }

        this.togglePlaybackState();
        break;
      case KeyboardKeycode.KEYH:
        this.tapTempo();
        break;
      case KeyboardKeycode.KEYM:
        this.speaker.speak(`start marker set at ${this.position}`);
        this.startMarker = this.position;
        break;
      case KeyboardKeycode.ENTER:
        this.speakAndCopyTempo();
        break;
      case KeyboardKeycode.RIGHTARROW: {
        let multiplier = 1;
        if (this.input.isPressed(KeyboardKeycode.SHIFT)) {
          multiplier += 4;
        }
        if (this.input.isPressed(KeyboardKeycode.ALT)) {
          multiplier += 9;
        }

        this.increasePositionBy(5, multiplier);
        break;
      }
      case KeyboardKeycode.LEFTARROW: {
        let multiplier = 1;
        if (this.input.isPressed(KeyboardKeycode.SHIFT)) {
          multiplier += 4;
        }
        if (this.input.isPressed(KeyboardKeycode.CTRL)) {
          multiplier += 9;
        }

        this.decreasePositionBy(5, multiplier);
        break;
      }
      case KeyboardKeycode.PAGEDOWN: {
        let multiplier = 1;
        if (this.input.isPressed(KeyboardKeycode.SHIFT)) {
          multiplier += 3;
        }
        if (this.input.isPressed(KeyboardKeycode.ALT)) {
          multiplier += 7;
        }

        this.increasePositionBy(this.tempoInMS, multiplier);
        break;
      }
      case KeyboardKeycode.PAGEUP: {
        let multiplier = 1;
        if (this.input.isPressed(KeyboardKeycode.SHIFT)) {
          multiplier += 3;
        }
        if (this.input.isPressed(KeyboardKeycode.ALT)) {
          multiplier += 7;
        }

        this.decreasePositionBy(this.tempoInMS, multiplier);
        break;
      }
      case KeyboardKeycode.HOME:
        this.position = this.startMarker;
        this.sound.seek(this.position);
        break;
      case KeyboardKeycode.END:
        this.position = this.sound.getDuration();
        this.sound.seek(this.position);
        break;
    }
  }

  private togglePlaybackState = () => {
    if (this.sound.isPlaying()) {
      this.sound.stop();
    } else {
      if (this.position >= this.sound.getDuration()) {
        this.speaker.speak("jump to start marker");
        this.position = this.startMarker;
      }
      
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
      this.speaker.speak(
        `Tempo calculation done, ${Math.round(this.tempoInMS)} ms`
      );

      this.tempos = [];
    }
  };

  public increasePositionBy = (amount: number, multiplier = 1) => {
    this.position += amount * multiplier;
    if (this.position > this.sound.getDuration()) {
      this.position = this.sound.getDuration();
    }
    this.sound.seek(this.position);
  };

  public decreasePositionBy = (amount: number, multiplier = 1) => {
    this.position -= amount * multiplier;
    if (this.position < this.startMarker) {
      this.position = this.startMarker;
    }
    this.sound.seek(this.position);
  };

  public speakAndCopyTempo = () => {
    const roundedPositionString = Math.ceil(this.position).toString();
    this.speaker.speak(roundedPositionString);
    ClipboardHelper.copyTextToClipboard(roundedPositionString);
  };

  public pauseInput = () => this.input.pause();

  public resumeInput = () => this.input.reset();
}
