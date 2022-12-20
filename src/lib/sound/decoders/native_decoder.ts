class NativeDecoder {
    context: AudioContext;

    constructor(context: AudioContext) {
        console.log('using native webaudio decoder')
        this.context = context;
    }

    public decode = async (path: string): Promise<AudioBuffer> => {
        try {
            let response = await fetch(path);
            let arrayBuffer = await response.arrayBuffer();

            const buffer = await this.context.decodeAudioData(arrayBuffer)
            response = null;
            arrayBuffer = null;

            return buffer;
        } catch (error) {
            throw new Error(`Native audio decoder was unable to decode the file at ${path}: ${error}`)
        }
    }
}

export default NativeDecoder;
