import Sound from "@lib/sound/sound";

export default class SoundManager {
  private context: AudioContext;
  private basePath: string = __dirname;
  private sounds: Map<string, AudioBuffer> = new Map();
  private panner: StereoPannerNode;

  constructor() {
    this.context = new AudioContext();
    // Create a dummy panner, otherwise the first panned sound delays a bit
    this.panner = new StereoPannerNode(this.context);
    this.panner.connect(this.context.destination);
  }

  public create = async (filePath: string) => {
    let sound: Sound;
    if (!this.sounds.has(filePath)) {
      try {
        const response = await fetch(`${this.basePath}/${filePath}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.sounds.set(filePath, audioBuffer);

        sound = new Sound(audioBuffer, this.context, filePath);
      } catch (error) {
        throw new Error(`Unable to load sound: ${error}`);
      }
    } else {
      sound = new Sound(this.sounds.get(filePath), this.context, filePath);
    }

    return sound;
  };

  public getBasePath = () => this.basePath;

  public setBasePath = (newPath: string) => (this.basePath = newPath);
}
