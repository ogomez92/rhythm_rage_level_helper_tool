import SoundManager from "@lib/sound/sound_manager";

export default class Sound{
  private buffer: AudioBuffer;
  private source: AudioBufferSourceNode;
  private fadeDuration = 400;
  private context: AudioContext;
  private tag: string;
  private pan = 0.0;
  private pitch = 1.0;
  private volume = 1.0;
  private isLooped = false;
  private panner: StereoPannerNode;
  private gain: GainNode;
  private filePath: string;
  private manager: SoundManager;

  constructor(buffer: AudioBuffer, context: AudioContext, path: string, manager: SoundManager) {
    this.buffer = buffer;
    this.context = context;
    this.filePath = path;
    this.source = new AudioBufferSourceNode(this.context, {
      buffer: this.buffer,
    });

    this.source.connect(this.context.destination);
    this.manager = manager;
  }

  private setupPan = () => {
    if (this.panner) {
      return;
    }

    this.panner = new StereoPannerNode(this.context);
    this.source.connect(this.panner);
    this.panner.connect(this.context.destination);
  };

  private setupGain = () => {
    if (this.gain) {
      return;
    }

    this.gain = new GainNode(this.context);
    this.source.connect(this.gain);
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

  private disconnect = () => {
    this.source.stop();
    this.source.disconnect();
    if (this.panner) {
      this.panner.disconnect();
    }

    if (this.gain) {
      this.gain.disconnect();
    }

    this.gain = null;
    this.panner = null;
    this.source = null;
  };

  public fadeOut(milliseconds = this.fadeDuration) {
    if (!this.gain) {
      this.setupGain();
    }

    this.gain.gain.linearRampToValueAtTime(
      0,
      this.context.currentTime + milliseconds / 1000
    );
    setTimeout(this.stop, milliseconds);
  }

  public fadeIn(milliseconds = this.fadeDuration, toVolume = 1) {
    if (!this.gain) {
      this.setupGain();
    }

    this.gain.gain.linearRampToValueAtTime(
      toVolume,
      this.context.currentTime + milliseconds / 1000
    );
  }

  public getFadeDuration = () => this.fadeDuration;

  public setFadeDuration = (newFadeDuration: number) =>
    (this.fadeDuration = newFadeDuration);

  public pause = () => {
    this.source.stop();
    this.disconnect();
  };

  public play = () => {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = this.isLooped;
    this.source.playbackRate.setValueAtTime(
      this.pitch,
      this.context.currentTime
    );
    this.source.connect(this.context.destination);
    this.setupPan();
    this.setupGain();
    this.source.start();
  };

  public gradualSlowdown = (
    milliseconds = this.fadeDuration,
    newPitchValue = 0
  ) => {
    this.source.playbackRate.linearRampToValueAtTime(
      newPitchValue,
      this.context.currentTime + milliseconds / 1000
    );

    this.pitch = newPitchValue;

    if (this.pitch == 0) {
      setTimeout(this.stop, milliseconds);
    }
  };

  public stop = () => {
    this.source.stop();
    this.disconnect();
  };

  public speedUp = (milliseconds = this.fadeDuration, newPitchValue = 1) => {
    this.source.playbackRate.linearRampToValueAtTime(
      newPitchValue,
      this.context.currentTime + milliseconds / 1000
    );
    this.pitch = newPitchValue;
  };

  public stereoSweep = (duration: number, sweepSpeedMilliseconds: number) => {
    const sweepSpeed = sweepSpeedMilliseconds / 1000;

    this.setupPan();

    for (let i = 0; i <= duration; i += sweepSpeed) {
      this.panner.pan.linearRampToValueAtTime(1, this.context.currentTime + i);
      this.panner.pan.linearRampToValueAtTime(
        -1,
        this.context.currentTime + i + sweepSpeed
      );
    }
    this.panner.pan.linearRampToValueAtTime(
      0,
      this.context.currentTime + duration + sweepSpeed
    );
  };

  public destroy = () => {
    this.disconnect();
    this.buffer = null;
    this.context = null;
    this.gain = null;
    this.panner = null;
    this.manager.freeSound(this);
  };

  public getFilePath = (): string => this.filePath;

  public getBuffer = (): AudioBuffer => this.buffer;
}
