import * as dotenv from "dotenv";
import SpeechManager from "@lib/speech/speech_manager";
import SoundManager from "@lib/sound/sound_manager";
import Menu from "@lib/menu/menu";
import TextItem from "./lib/menu/text_item";
import SpeechEngineType from "./lib/speech/enums/speech_engine_type";
import FileManager from "./managers/file_manager";

window.onload = () => {
  setup();
};

async function setup() {
  document.getElementById("app").focus();
  dotenv.config();

  const fileManager = new FileManager(process.env.PACK_PATH);

  const possibleLevels = fileManager
    .getFileList()
    .filter((file) => file.getExtension() === "ogg")
    .filter(
      (file) =>
        file.getSize() > parseInt(process.env.MINIMUM_LEVEL_FILE_SIZE_IN_BYTES)
    );

  const speaker = new SpeechManager(SpeechEngineType.ARIA);
  await speaker.initialize();
  const sm = new SoundManager();
  sm.setExtension('ogg');

  const items: TextItem[] = possibleLevels.map((level) =>
    new TextItem(level.getName(), level.getName(), speaker)
  )

  const menu = new Menu(items, speaker);

  await menu.showToUser();
}
