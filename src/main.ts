import * as dotenv from "dotenv";
import * as fs from 'fs';
import path from 'path';

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
  /*
  sound = await sm.create('stest/big');
  await sound.play();
  await TimeHelper.sleep(2000);
  sound.destroy();
  */
  // play all the files in the stest folder using fs module
  const directoryPath = path.join(__dirname, 'stest', 'small');
  const files = await fs.readdirSync(directoryPath);
  
  const oggFiles = files.filter((file) => path.extname(file) === '.ogg');
  for (let i = 0; i < oggFiles.length; i++) {
    const file = oggFiles[i];
    const filePath = path.join(directoryPath, file);
    sound = await sm.create(filePath, true);
    sound.play();
    await TimeHelper.sleep(25);
    sound.destroy();
  }
  for (let i = 0; i < oggFiles.length; i++) {
    const file = oggFiles[i];
    const filePath = path.join(directoryPath, file);
    sound = await sm.create(filePath, true);
    sound.play();
    await TimeHelper.sleep(25);
    sound.destroy();
  }

}
