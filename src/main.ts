import * as dotenv from "dotenv";
import EventType from "./lib/events/enums/event_type";
import EventNotification from "./lib/events/interfaces/event_notification";
import EventSubscriber from "./lib/events/interfaces/event_subscriber";
import KeyboardInput from "./lib/input/keyboard_input";
import SpeechManager from "@lib/speech/speech_manager";
// import FileManager from "./managers/file_manager";
import SoundManager from "@lib/sound/sound_manager";
import TimeHelper from "./lib/helpers/time_helper";

window.onload = () => {
  setup();
};

async function setup() {
  document.getElementById("app").focus();
  dotenv.config();

  // const fileManager = new FileManager(process.env.PACK_PATH);

  class LetterSpeaker implements EventSubscriber {
    private aria = new SpeechManager();

    constructor() {
      this.aria.initialize();
    }

    public onNotificationReceived(event: EventNotification): void {
      this.aria.speak(event.data);
    }
  }
  /*
    const possibleLevels = fileManager
      .getFileList()
      .filter((file) => file.getExtension() === "ogg")
      .filter(
        (file) =>
          file.getSize() > parseInt(process.env.MINIMUM_LEVEL_FILE_SIZE_IN_BYTES)
      );
      */
  const input = new KeyboardInput();
  const letterSpeaker = new LetterSpeaker();
  input.subscribe(EventType.CHARACTER_TYPED, letterSpeaker);

  const sm = new SoundManager();
  let sound;
  sound = await sm.create('stest/test');
  await sound.play();
  await TimeHelper.sleep(5000);
  sound.destroy();
  sound = await sm.create('stest/test');
  await sound.play();
  await TimeHelper.sleep(5000);
  sound.destroy();
  sound = await sm.create('stest/test');
  await sound.play();
  await TimeHelper.sleep(5000);
  sound.destroy();
  sound = await sm.create('stest/test');
  await sound.play();
  await TimeHelper.sleep(5000);
  sound.destroy();

}
