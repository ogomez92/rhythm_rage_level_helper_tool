import Effect from "@lib/sound/interfaces/effect";
import TimeHelper from "@lib/helpers/time_helper";

export default class Gain implements Effect {
    private effectNode: GainNode;
    private context: AudioContext;

    constructor(context: AudioContext) {
        this.context = context;
        this.effectNode = new GainNode(this.context);
    }

    public connect = (node: AudioNode): Effect => {
        this.effectNode.connect(node);

        return this;
    }

    public disconnect = () => {
        this.effectNode.disconnect();
        this.effectNode = null;
    }

    public getValue = (): number => this.effectNode.gain.value;

    public setValue = (newValue: number): Effect => {
        this.effectNode.gain.value = newValue;

        return this;
    }

    public ramp = async (milliseconds: number, toValue: number): Promise<Effect> => {
        this.effectNode.gain.linearRampToValueAtTime(
            toValue,
            this.context.currentTime + milliseconds / 1000
        );

        await TimeHelper.sleep(milliseconds);

        return Promise.resolve(this);
    }

    public sweep = async (
        duration: number,
        speed: number,
        from: number,
        to: number
    ): Promise<Effect> => {
        const oldValue = this.effectNode.gain.value;
        const sweepSpeed = speed / 1000;

        for (let i = 0; i <= duration; i += sweepSpeed) {
            this.effectNode.gain.linearRampToValueAtTime(from, this.context.currentTime + i);
            this.effectNode.gain.linearRampToValueAtTime(
                to,
                this.context.currentTime + i + sweepSpeed
            );
        }
        
        this.effectNode.gain.linearRampToValueAtTime(
            oldValue,
            this.context.currentTime + duration + sweepSpeed
        );

        await TimeHelper.sleep(duration + sweepSpeed);

        return Promise.resolve(this);
    };

    public getNode = (): AudioNode => this.effectNode;
}