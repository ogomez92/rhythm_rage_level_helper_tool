import SoundManager from "@lib/sound/sound_manager";

export default class Sound {
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
    this.manager = manager;
  }

  private setupPan = () => {
    if (this.panner || this.pan == 0.0) {
      return;
    }

    this.createPanner();
  };

  private createPanner = () => {
    console.log('setting up pan');
    this.panner = new StereoPannerNode(this.context);
    this.source.connect(this.panner);
    this.panner.pan.setValueAtTime(this.pan, this.context.currentTime);
    this.panner.connect(this.context.destination);
  }

  private setupGain = () => {
    if (this.gain || this.volume == 1.0) {
      return;
    }
  };

  private createGain = () => {
    console.log('setting up gain')
    this.gain = new GainNode(this.context);
    this.gain.gain.setValueAtTime(this.volume, this.context.currentTime);
    this.source.connect(this.gain);
    this.gain.connect(this.context.destination);
  }

  public getPan = () => this.pan;

  public setPan = (newPan: number): Sound => {
    this.pan = newPan;
    this.setupPan();
    this.panner.pan.setValueAtTime(this.pan, this.context.currentTime);
    return this;
  };

  public getVolume = () => this.volume;

  public setVolume = (newVolume: number): Sound => {
    this.volume = newVolume;
    this.setupGain();
    this.gain.gain.setValueAtTime(this.volume, this.context.currentTime);

    return this;
  };

  public getPitch = () => this.pitch;

  public setPitch = (newPitch: number): Sound => {
    this.pitch = newPitch;
    this.source.playbackRate.setValueAtTime(
      this.pitch,
      this.context.currentTime
    );

    return this;
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

  public async fadeOut(milliseconds = this.fadeDuration): Promise<void> {
    return new Promise((resolve) => {
      if (!this.gain) {
        this.setupGain();
      }

      this.gain.gain.linearRampToValueAtTime(
        0,
        this.context.currentTime + milliseconds / 1000
      );
      setTimeout(this.stop, milliseconds);
      setTimeout(resolve, milliseconds)
    });
  }

  public async fadeIn(milliseconds = this.fadeDuration, toVolume = 1): Promise<void> {
    return new Promise((resolve) => {
      if (!this.gain) {
        this.createGain();
      }

      this.gain.gain.linearRampToValueAtTime(
        toVolume,
        this.context.currentTime + milliseconds / 1000
      );
      setTimeout(resolve, milliseconds)
    });
  }

  public getFadeDuration = () => this.fadeDuration;

  public setFadeDuration = (newFadeDuration: number): Sound => {
    (this.fadeDuration = newFadeDuration);
    return this;
  }

  public pause = (): Sound => {
    this.source.stop();
    this.disconnect();

    return this;
  };

  public play = (): Sound => {
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

    return this;
  };

  public gradualSlowdown = async (
    milliseconds = this.fadeDuration,
    newPitchValue = 0
  ): Promise<void> => {
    return new Promise((resolve) => {
      this.source.playbackRate.linearRampToValueAtTime(
        newPitchValue,
        this.context.currentTime + milliseconds / 1000
      );

      this.pitch = newPitchValue;

      if (this.pitch == 0) {
        setTimeout(this.stop, milliseconds);
      }
      setTimeout(resolve, milliseconds)
    });
  };

  public stop = (): Sound => {
    this.source.stop();
    this.disconnect();

    return this;
  };

  public speedUp = async (milliseconds = this.fadeDuration, newPitchValue = 1): Promise<void> => {
    return new Promise((resolve) => {
      this.source.playbackRate.linearRampToValueAtTime(
        newPitchValue,
        this.context.currentTime + milliseconds / 1000
      );
      this.pitch = newPitchValue;

      setTimeout(resolve, milliseconds);
    });
  };

  public stereoSweep = async (duration: number, sweepSpeedMilliseconds: number): Promise<void> => {
    return new Promise((resolve) => {
      const sweepSpeed = sweepSpeedMilliseconds / 1000;

      this.createPanner();

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

      setTimeout(resolve, duration);
    });
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

  public setLooped = (newValue: boolean) => {
    this.isLooped = newValue;
    if (this.source) {
      this.source.loop = this.isLooped;
    }

  }
}
