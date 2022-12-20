interface Effect {
    connect(node: AudioNode): Effect;
    disconnect(): void;
    getValue(): number;
    setValue(newValue: number): Effect;
    ramp(milliseconds: number, toValue: number): Promise<Effect>;
    sweep(duration: number, speed: number, from: number, to: number): Promise<Effect>;
}

export default Effect;
