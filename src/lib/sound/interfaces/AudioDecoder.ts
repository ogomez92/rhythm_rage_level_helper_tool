interface AudioDecoder {
    context: AudioContext;

    decode(path: string): Promise<AudioBuffer>;
}

export default AudioDecoder;
