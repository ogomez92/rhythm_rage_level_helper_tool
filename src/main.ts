import * as dotenv from "dotenv";
import SpeechManager from "@lib/speech/speech_manager";
import SoundManager from "@lib/sound/sound_manager";
import Menu from "@lib/menu/menu";
import TextItem from "./lib/menu/text_item";
import SpeechEngineType from "./lib/speech/enums/speech_engine_type";

window.onload = () => {
  setup();
};

async function setup() {
  document.getElementById("app").focus();
  dotenv.config();

  // const fileManager = new FileManager(process.env.PACK_PATH);

  /*
    const possibleLevels = fileManager
      .getFileList()
      .filter((file) => file.getExtension() === "ogg")
      .filter(
        (file) =>
          file.getSize() > parseInt(process.env.MINIMUM_LEVEL_FILE_SIZE_IN_BYTES)
      );
      */
  const manager = new SpeechManager(SpeechEngineType.ARIA);
  await manager.initialize();
  const sm = new SoundManager();
  sm.setExtension('ogg');
  const items = [
    new TextItem('first', 'hello', manager),
    new TextItem('second', 'fuck', manager),
    new TextItem('third', 'you', manager),
  ]
  const menu = new Menu(items, manager);
menu.setIntroSound(await sm.create('stest/intro'))
menu.setIntroText('hi');
menu.setMoveSound(await sm.create('stest/move'));
menu.setWrapSound(await sm.create('stest/wrap'))
menu.setSelectSound(await sm.create('stest/select'))
  let position = await menu.display();
  console.log(position);
  position = await menu.display();
  console.log(position);
  menu.destroy();
}
