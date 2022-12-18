interface AudioDecoder {
    context: AudioContext;

    decode(path: string): Promise<AudioBuffer>;
    streamFile?(path: string): Promise<void>;
}

export default AudioDecoder;
