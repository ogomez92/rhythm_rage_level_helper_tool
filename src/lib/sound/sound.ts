import SoundManager from "@lib/sound/sound_manager";
import TimeHelper from "../helpers/time_helper";

export default class Sound {
  private buffer: AudioBuffer;
  private source: AudioBufferSourceNode;
  private startTime: number;
  private position = 0;
  private context: AudioContext;
  private playing = false;

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
  }

  public getPitch = () => this.pitch;

  public setPitch = (newPitch: number): Sound => {
    this.pitch = newPitch;
    this.setSoundValues();
    this.source.playbackRate.value = this.pitch;

    return this;
  };

  private breakChain = () => {
    if (this.source) {
      this.source.stop();
    }

    this.source.disconnect();
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
      this.setSoundValues();
      this.seek(0);
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
    this.source.playbackRate.exponentialRampToValueAtTime(
      toPitch,
      this.context.currentTime + milliseconds / 1000
    );

    if (this.pitch == 0) {
      setTimeout(this.stop, milliseconds);
    }

    await TimeHelper.sleep(milliseconds);

    return Promise.resolve(this);
  };

  public stop = (): Sound => {
    this.playing = false;

    if (!this.source) {
      return;
    }

    this.source.stop();

    this.breakChain();

    return this;
  };

  public destroy = () => {
    this.breakChain();
    this.buffer = null;
    this.context = null;
    this.manager.freeSound(this);
  };

  public getFilePath = (): string => this.filePath;

  public getBuffer = (): AudioBuffer => this.buffer;

  public setLooped = (newValue: boolean) => {
    this.isLooped = newValue;
    if (this.source) {
      this.source.loop = this.isLooped;
    }
  };

  private makeAudioChain = (): Sound => {
    if (this.source) {
      return this;
    }

    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.setSoundValues();
    return this;
  };

  public isPlaying = (): boolean => this.source && this.playing;

  private setSoundValues = () => {
    this.source.loop = this.isLooped;
    this.source.playbackRate.value = this.pitch;
  };

  public getCurrentTime = (): number => {
    if (!this.source) {
      return 0;
    }

    return ((this.context.currentTime - this.startTime) * 1000) + this.position;
  };

  public seek = (position: number) => {
    this.position = position;
    this.stop();
    this.play(this.startTime - position / 1000);
  };

  public getTag = () => this.tag;

  public setTag = (tag: string) => this.tag = tag;
}
