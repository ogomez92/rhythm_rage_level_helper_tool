import Sound from "@lib/sound/sound";
import path from 'path';
import SoundInformation from "@lib/sound/interfaces/sound_information";
import TimeHelper from "@lib/helpers/time_helper";
import AudioDecoder from "@lib/sound/interfaces/AudioDecoder";
import NativeDecoder from "@lib/sound/decoders/native_decoder";

export default class SoundManager {
  private context: AudioContext;
  private basePath: string = __dirname;
  private sounds: SoundInformation[] = [];
  private loadingPaths: string[] = [];
  private extension = 'ogg';
  private panner: StereoPannerNode;

  constructor() {
    this.context = new AudioContext();
    // Create a dummy panner, otherwise the first panned sound delays a bit
    this.panner = new StereoPannerNode(this.context);
    this.panner.connect(this.context.destination);
  }

  public create = async (filePath: string, fullPathSpecified = false): Promise<Sound> => {
    let builtPath = path.join(this.basePath, filePath + `.${this.extension}`)

    if (fullPathSpecified) {
      builtPath = path.resolve(filePath);
    }

    let buffer: AudioBuffer;
    let sound: Sound;

    buffer = this.getBufferAtPath(builtPath);

    if (buffer) {
      const sound = new Sound(buffer, this.context, builtPath, this);
      this.sounds.push({ buffer: buffer, path: builtPath });

      return sound;
    } else {
      if (this.loadingPaths.includes(builtPath)) {
        while (this.loadingPaths.includes(builtPath)) {
          await TimeHelper.sleep(25);
        }

        buffer = this.getBufferAtPath(builtPath);

        if (!buffer) {
          throw new Error(`Unable to load sound from a preloading buffer at ${this.basePath}/${filePath}.${this.extension}`);
        }
      } else {
        buffer = await this.createBufferFromPath(builtPath);
      }

      sound = new Sound(buffer, this.context, builtPath, this);

      return sound;
    }
  };

  public getBasePath = () => this.basePath;

  public setBasePath = (newPath: string) => (this.basePath = newPath);

  public getExtension = () => this.extension;

  public setExtension = (newExtension: string) => this.extension = newExtension;

  private createBufferFromPath = async (filePath: string) => {
    this.loadingPaths.push(filePath);

    try {
      const decoder: AudioDecoder = new NativeDecoder(this.context);
      const audioBuffer = await decoder.decode(filePath);
      this.sounds.push({ path: filePath, buffer: audioBuffer });
      this.loadingPaths = this.loadingPaths.filter((path) => path !== filePath);
      return audioBuffer;
    } catch (error) {
      this.loadingPaths = this.loadingPaths.filter((path) => path !== filePath);
      throw new Error(`Unable to create buffer for ${filePath}: ${error}`);
    }
  };

  private getBufferAtPath = (path: string): AudioBuffer | undefined => {
    return this.sounds.find((sound) => sound.path === path)?.buffer;
  };

  public freeSound = (sound: Sound) => {
    for (let i = 0; i < this.sounds.length; i++) {
      if (this.sounds[i].path === sound.getFilePath()) {
        this.sounds[i].buffer = null;
        this.sounds[i] = null;
        this.sounds.splice(i, 1);
        break;
      }
    }
  }

  public loadBatch = async (paths: string[], fullPathSpecified = false): Promise<void> => {
    const promises = paths.map((path) => this.create(path, fullPathSpecified));
    try {
      await Promise.all(promises);
    } catch (error) {
      throw new Error(`Error while batch loading: ${error}`)
    }
  }
}
