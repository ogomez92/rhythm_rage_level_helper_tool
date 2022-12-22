import EffectProvider from "@lib/sound/effects/effect_provider";
import EffectType from "@lib/sound/enums/effect_type";
import Effect from "@lib/sound/interfaces/effect";

export default class StreamedSound {
  private stream: HTMLAudioElement;
  private source: MediaElementAudioSourceNode;
  private startTime: number;
  private position = 0;
  private context: AudioContext;
  private playing = false;
  private effectProvider: EffectProvider;
  private effects: Effect[];
  private tag: string;
  private speed = 1.0;
  private isLooped = false;
  private filePath: string;

  constructor(stream: HTMLAudioElement, context: AudioContext, path: string) {
    this.stream = stream;
    this.context = context;
    this.filePath = path;
    this.effectProvider = new EffectProvider(this.context);
    this.effects = [];
    this.source = this.context.createMediaElementSource(this.stream);
  }

  public getSpeed = () => this.speed;

  public setSpeed = (newSpeed: number): StreamedSound => {
    this.speed = newSpeed;

    if (!this.source) {
      return;
    }

    this.configureStream();

    return this;
  };

  private breakChain = () => {
    this.playing = false;
    if (this.source) {
      this.source.disconnect();
    }
  };

  public play = (): StreamedSound => {
    this.startTime = this.context.currentTime;

    if (!this.stream) {
      throw new Error(
        `This sound was previously destroyed and must be recreated`
      );
    }

    if (this.playing) {
      this.configureStream();
      return;
    }

    this.makeAudioChain();
    this.stream.currentTime = this.position / 1000;
    this.stream.play();

    this.playing = true;

    return this;
  };

  public stop = (): StreamedSound => {
    this.playing = false;
    this.position = 0;

    if (!this.source) {
      return;
    }

    this.breakChain();

    return this;
  };

  public destroy = () => {
    if (this.source) {
      this.breakChain();
    }

    this.stream = null;
    this.context = null;
  };

  public getFilePath = (): string => this.filePath;

  public getStream = (): HTMLAudioElement => this.stream;

  public setLooped = (newValue: boolean) => {
    this.isLooped = newValue;

    if (this.source) {
      this.configureStream();
    }
  };

  private makeAudioChain = (): StreamedSound => {
    this.configureStream();
    this.addEffectsAndConnectToDestination();
    return this;
  };

  public isPlaying = (): boolean => this.source && this.playing;

  private configureStream = () => {
    this.stream.loop = this.isLooped;
    this.stream.playbackRate = this.speed;
  };

  public getCurrentTime = (): number => {
    if (!this.source) {
      return 0;
    }

    return this.stream.currentTime;
  };

  public seek = (position: number) => {
    this.position = position;
    this.stream.currentTime = position / 1000;
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

  public addEffect = (type: EffectType): Effect => {
    const playing = this.playing;

    const effect = this.effectProvider.createEffect(type);
    this.effects.push(effect);
    this.pause();
    this.makeAudioChain();

    if (playing) {
      this.play();
    }

    return effect;
  };

  public getDuration = () => this.stream.currentTime * 1000;

  public playWait = async (): Promise<StreamedSound> => {
    this.play();
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!this.isPlaying()) {
          clearInterval(interval);
          resolve(this);
        }
      }, 50);
    });
  };

  public pause = () => {
    this.playing = false;
    this.position = this.stream.currentTime * 1000;

    if (!this.source) {
      return;
    }

    this.breakChain();
  }
}
