import Sound from "@lib/sound/sound";
import SoundInformation from "@lib/sound/interfaces/sound_information";

export default class SoundManager {
  private context: AudioContext;
  private basePath: string = __dirname;
  private sounds: SoundInformation[];
  private panner: StereoPannerNode;

  constructor() {
    this.context = new AudioContext();
    // Create a dummy panner, otherwise the first panned sound delays a bit
    this.panner = new StereoPannerNode(this.context);
    this.panner.connect(this.context.destination);
  }

  public create = async (filePath: string): Promise<Sound> => {
    let buffer: AudioBuffer;
    let sound: Sound;

    buffer = this.getBufferAtPath(filePath);
    if (buffer) {
      const sound = new Sound(buffer, this.context, filePath, this);
      this.sounds.push({ buffer: buffer, path: filePath });

      return sound;
    } else {
      buffer = await this.createBufferFromPath(filePath);
      sound = new Sound(buffer, this.context, filePath, this);

      return sound;
    }
  };

  public getBasePath = () => this.basePath;

  public setBasePath = (newPath: string) => (this.basePath = newPath);

  private createBufferFromPath = async (filePath: string) => {
    try {
      const response = await fetch(`${this.basePath}/${filePath}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.sounds.push({ path: `${this.basePath}/${filePath}`, buffer: audioBuffer });
      return audioBuffer;
    } catch (error) {
      throw new Error(`Unable to create buffer for ${filePath}: ${error}`);
    }
  };

  public getBufferAtPath = (path: string): AudioBuffer | undefined => {
    return this.sounds.find((sound) => sound.path === path)?.buffer;
  };

  public freeSound =(sound: Sound) => {
    for (let i = 0; i < this.sounds.length; i++) {
      if (this.sounds[i].path === sound.getFilePath()) {
        this.sounds.splice(i, 1);
        break;
      }
    }
  }
}
