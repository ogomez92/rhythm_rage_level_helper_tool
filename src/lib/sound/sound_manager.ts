import Sound from "@lib/sound/sound";

export default class SoundManager {
  private context: AudioContext;
  private basePath: string = __dirname;
  private sounds: Map<string, Sound> = new Map();
  private panner: StereoPannerNode;

  constructor() {
    this.context = new AudioContext();
    // Create a dummy panner, otherwise the first panned sound delays a bit
    this.panner = new StereoPannerNode(this.context);
    this.panner.connect(this.context.destination);
  }

  private loadSound = async (filePath: string) => {
    if (!this.sounds.has(filePath)) {
      try {
        const response = await fetch(`${this.basePath}/${filePath}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        const audioSource = new AudioBufferSourceNode(this.context, {
          buffer: audioBuffer,
        });

        audioSource.connect(this.context.destination);

        const sound = new Sound(audioSource, this.context);
        this.sounds.set(filePath, sound);
      } catch (error) {
        throw new Error(`Unable to load sound: ${error}`);
      }
    }
  };

  public getBasePath = () => this.basePath;

  public setBasePath = (newPath: string) => (this.basePath = newPath);
}
