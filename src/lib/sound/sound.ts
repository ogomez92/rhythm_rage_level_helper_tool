export default class Sound {
  private source: AudioBufferSourceNode;
  private context: AudioContext;
  private tag: string;
  private pan = 0.0;
  private pitch = 1.0;
  private volume = 1.0;
  private isLooped = false;
  private panner: StereoPannerNode;
  private gain: GainNode;

  constructor(sound: AudioBufferSourceNode, context: AudioContext) {
    this.source = sound;
    this.context = context;
  }

  private setupPan = () => {
    if (this.panner) {
      return;
    }

    this.panner = new StereoPannerNode(this.context);
    this.panner.connect(this.context.destination);
  };

  private setupGain = () => {
    if (this.gain) {
      return;
    }

    this.gain = new GainNode(this.context);
    this.gain.connect(this.context.destination);
  };

  public getPan = () => this.pan;

  public setPan = (newPan: number) => {
    this.pan = newPan;
    this.setupPan();
    this.panner.pan.setValueAtTime(this.pan, this.context.currentTime);
  };

  public getVolume = () => this.volume;

  public setVolume = (newVolume: number) => {
    this.volume = newVolume;
    this.setupGain();
    this.gain.gain.setValueAtTime(this.volume, this.context.currentTime);
  };

  public getPitch = () => this.pitch;

  public setPitch = (newPitch: number) => {
    this.pitch = newPitch;
    this.source.playbackRate.setValueAtTime(
      this.pitch,
      this.context.currentTime
    );
  };
}
