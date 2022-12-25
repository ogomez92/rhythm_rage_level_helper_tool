import StreamedSound from "@lib/sound/streamed_sound";
import Sound from "@lib/sound/sound";
import path from 'path';
import SoundInformation from "@lib/sound/interfaces/sound_information";
import TimeHelper from "@lib/helpers/time_helper";
import DecoderProvider from "@lib/sound/decoders/decoder_provider";

export default class SoundManager {
  private context: AudioContext;
  private basePath: string = __dirname;
  private sounds: SoundInformation[] = [];
  private soundMap: Map<string, AudioBuffer> = new Map();
  private loadingPaths: string[] = [];
  private extension = 'ogg';

  constructor() {
    this.context = new AudioContext();
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
      console.log('I got a buffer that was already loaded')
      const sound = new Sound(buffer, this.context, builtPath, this);
      this.sounds.push({ buffer: buffer, path: builtPath });
      this.soundMap.set(builtPath, buffer);

      return sound;
    } else {
      if (this.loadingPaths.includes(builtPath)) {
        while (this.loadingPaths.includes(builtPath)) {
          await TimeHelper.sleep(25);
        }

        buffer = this.getBufferAtPath(builtPath);
        console.log('I got a buffer after a preload')

        if (!buffer) {
          throw new Error(`Unable to load sound from a preloading buffer at ${this.basePath}/${filePath}.${this.extension}`);
        }
      } else {
        this.loadingPaths.push(filePath);

        const decoderProvider = new DecoderProvider(this.context);

        try {
          buffer = await decoderProvider.createBufferFromPath(builtPath);
          this.sounds.push({ path: filePath, buffer: buffer });
        } catch (error) {
          throw new Error(`Unable to decode ${builtPath}: ${error}`)
        } finally {
          this.loadingPaths = this.loadingPaths.filter((path) => path !== filePath);
        }
      }

      sound = new Sound(buffer, this.context, builtPath, this);

      return sound;
    }
  };

  public getBasePath = () => this.basePath;

  public setBasePath = (newPath: string) => (this.basePath = newPath);

  public getExtension = () => this.extension;

  public setExtension = (newExtension: string) => this.extension = newExtension;



  private getBufferAtPath = (path: string): AudioBuffer | undefined => {
    return this.soundMap.get(path);
  };

  public freeSound = (sound: Sound) => {
    for (let i = 0; i < this.sounds.length; i++) {
      if (this.sounds[i].path === sound.getFilePath()) {
        this.sounds[i].buffer = null;
        this.sounds[i] = null;
        this.sounds.splice(i, 1);
        this.soundMap.delete(sound.getFilePath());
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

  public createStream = (filePath: string, fullPathSpecified = false): StreamedSound => {
    let builtPath = path.join(this.basePath, filePath + `.${this.extension}`)

    if (fullPathSpecified) {
      builtPath = path.resolve(filePath);
    }

    const decoderProvider = new DecoderProvider(this.context);
    const streamHTMLElement: HTMLAudioElement = decoderProvider.createHTMLStreamFromPath(builtPath);

    return new StreamedSound(streamHTMLElement, this.context, builtPath)
  }

  public destroy = (): Promise<void> => {
    return new Promise((resolve) => {
      this.context.close().then(() => {
        this.context = null;
        this.basePath = null;
        this.sounds = null;
        this.soundMap = null;
        this.loadingPaths = null;
        this.extension = null;
        resolve();
      });
    });
  }
}
