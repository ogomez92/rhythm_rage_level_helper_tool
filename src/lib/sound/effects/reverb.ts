import Effect from "@lib/sound/interfaces/effect";

export default class Reverb implements Effect {
  private effectNode: ConvolverNode;
  private context: AudioContext;

  constructor(context: AudioContext) {
    this.context = context;
    this.effectNode = this.context.createConvolver();
  }

  public connect = (node: AudioNode): Effect => {
    this.effectNode.connect(node);

    return this;
  };

  public disconnect = () => {
    this.effectNode.disconnect();
    this.effectNode = null;
  };

  public getNode = (): AudioNode => this.effectNode;

  public setImpulseResponseFromFile = async (fullPath: string) => {
    try {
    const response = await fetch(fullPath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.effectNode.buffer = audioBuffer;
    } catch(error) {
      throw new Error(`Unable to set reverb impulse response from ${fullPath}: ${error}`)
    }
  };
}
