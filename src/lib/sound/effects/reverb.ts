import Effect from "@lib/sound/interfaces/effect";

export default class Reverb implements Effect {
    private effectNode: ConvolverNode;
    private context: AudioContext;

    constructor(context: AudioContext) {
        this.context = context;
        this.effectNode = this.context.createConvolver();
        this.effectNode.buffer = this.context.createBuffer(2, 4096, 44100);

    }

    public connect = (node: AudioNode): Effect => {
        this.effectNode.connect(node);

        return this;
    }

    public disconnect = () => {
        this.effectNode.disconnect();
        this.effectNode = null;
    }

    public getNode = (): AudioNode => this.effectNode;
}