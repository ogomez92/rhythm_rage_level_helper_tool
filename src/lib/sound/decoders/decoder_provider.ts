import NativeDecoder from "@lib/sound/decoders/native_decoder";
import HTMLStreamer from "@lib/sound/decoders/html_streamer";

export default class DecoderProvider {
    private context: AudioContext;

    constructor(context: AudioContext) {
        this.context = context;
    }

    public createBufferFromPath = async (filePath: string): Promise<AudioBuffer> => {
        const start = performance.now();

        try {
            const decoder = new NativeDecoder(this.context);

            const audioBuffer = await decoder.decode(filePath);
            console.log(`Decoding took ${performance.now() - start} ms.`)
            return audioBuffer;
        } catch (error) {
            throw new Error(`Unable to create buffer for ${filePath}: ${error}`);
        }
    };

    public createHTMLStreamFromPath = (filePath: string): HTMLAudioElement => {
        const start = performance.now();

        try {
            const decoder = new HTMLStreamer(this.context);

            const audioElement: HTMLAudioElement = decoder.stream(filePath);
            console.log(`Decoding took ${performance.now() - start} ms.`)
            return audioElement;
        } catch (error) {
            throw new Error(`Unable to create buffer for ${filePath}: ${error}`);
        }
    };

}
