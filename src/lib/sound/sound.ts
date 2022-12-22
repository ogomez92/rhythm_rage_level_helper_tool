import SoundManager from "@lib/sound/sound_manager";
import TimeHelper from "../helpers/time_helper";
import EffectProvider from "@lib/sound/effects/effect_provider";
import EffectType from "@lib/sound/enums/effect_type";
import Effect from "@lib/sound/interfaces/effect";

export default class Sound {
  private buffer: AudioBuffer;
  private source: AudioBufferSourceNode;
  private startTime: number;
  private position = 0;
  private context: AudioContext;
  private playing = false;
  private effectProvider: EffectProvider;
  private effects: Effect[];
  private tag: string;
  private pitch = 1.0;
  private isLooped = false;
  private filePath: string;
  private manager: SoundManager;

  constructor(
    buffer: AudioBuffer,
    context: AudioContext,
    path: string,
    manager: SoundManager
  ) {
    this.buffer = buffer;
    this.context = context;
    this.filePath = path;
    this.manager = manager;
    this.effectProvider = new EffectProvider(this.context);
    this.effects = [];
  }

  public getPitch = () => this.pitch;

  public setPitch = (newPitch: number): Sound => {
    this.pitch = newPitch;

    if (!this.source) {
      return;
    }

    this.configureSource();

    return this;
  };

  private breakChain = () => {
    this.playing = false;
    if (this.source) {
      this.source.stop();
      this.killEffects();
      this.source.disconnect();
    }

    this.source = null;
  };

  public play = (position = 0): Sound => {
    this.startTime = this.context.currentTime;

    if (!this.buffer) {
      throw new Error(
        `This sound was previously destroyed and must be recreated`
      );
    }

    if (this.playing) {
      this.configureSource();
      return;
    }

    this.makeAudioChain();
    this.source.start(0, this.startTime - position);

    this.playing = true;
    return this;
  };

  public pitchRamp = async (
    milliseconds: number,
    toPitch: number
  ): Promise<Sound> => {
    if (!this.playing) {
      throw new Error(`Called pitch ramp while source was not playing`);
    }

    this.source.playbackRate.linearRampToValueAtTime(
      toPitch,
      this.context.currentTime + milliseconds / 1000
    );

    if (toPitch == 0) {
      setTimeout(this.stop, milliseconds);
    }

    await TimeHelper.sleep(milliseconds);

    return Promise.resolve(this);
  };

  public stop = (): Sound => {
    this.playing = false;
    this.position = 0;

    if (!this.source) {
      return;
    }

    this.source.stop();

    this.breakChain();

    return this;
  };

  public destroy = () => {
    if (this.source) {
      this.source.stop();
      this.breakChain();
    }

    this.buffer = null;
    this.context = null;
    this.manager.freeSound(this);
  };

  public getFilePath = (): string => this.filePath;

  public getBuffer = (): AudioBuffer => this.buffer;

  public setLooped = (newValue: boolean) => {
    this.isLooped = newValue;

    if (this.source) {
      this.configureSource();
    }
  };

  private makeAudioChain = (): Sound => {
    if (this.source) {
      this.breakChain();
    }

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.configureSource();
    this.addEffectsAndConnectToDestination();
    return this;
  };

  public isPlaying = (): boolean => this.source && this.playing;

  private configureSource = () => {
    this.source.loop = this.isLooped;
    this.source.playbackRate.value = this.pitch;
  };

  public getCurrentTime = (): number => {
    if (!this.source) {
      return 0;
    }

    return (this.context.currentTime - this.startTime) * 1000 + this.position;
  };

  public seek = (position: number) => {
    this.position = position;
    this.stop();
    this.play(this.startTime - position / 1000);
  };

  public getTag = () => this.tag;

  public setTag = (tag: string) => (this.tag = tag);

  private addEffectsAndConnectToDestination = () => {
    if (this.effects.length == 0) {
      this.source.connect(this.context.destination);
      return;
    }

    this.source.connect(this.effects[0].getNode());

    for (let i = 0; i < this.effects.length - 1; i++) {
      this.effects[i].connect(this.effects[i + 1].getNode());
    }

    this.effects[this.effects.length - 1].connect(this.context.destination);
  };

  public removeEffect = (effect: Effect) => {
    const index = this.effects.indexOf(effect);

    if (index == -1) {
      return;
    }

    this.effects.splice(index, 1);

    if (this.source) {
      this.makeAudioChain();
    }
  };

  private killEffects = () => {
    this.effects = [];

    this.makeAudioChain();
  };

  public addEffect = (type: EffectType): Effect => {
    const effect = this.effectProvider.createEffect(type);
    this.effects.push(effect);

    if (this.playing) {
      this.makeAudioChain();
    }

    return effect;
  };

  public getDuration = () => this.buffer.duration * 1000;

  public playWait = async (): Promise<Sound> => {
    this.play();
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.isPlaying()) {
          clearInterval(interval);
          resolve(this);
        }
      }, 50);
    });

  }

}
