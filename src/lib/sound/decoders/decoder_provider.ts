import AudioDecoder from "@lib/sound/interfaces/AudioDecoder";
import NativeDecoder from "@lib/sound/decoders/native_decoder";
import MpegDecoder from "@lib/sound/decoders/mpeg_decoder";
import OpusDecoder from "@lib/sound/decoders/opus_decoder";

export default class DecoderProvider {
    private context: AudioContext;

    constructor(context: AudioContext) {
        this.context = context;
    }

    public createBufferFromPath = async (filePath: string) => {
        const extension = filePath.split(".").pop().toLowerCase();
        let decoder: AudioDecoder;

        try {
            switch (extension) {
                case 'mp3':
                    decoder = new MpegDecoder(this.context);
                    break;
                case 'opus':
                    decoder = new OpusDecoder(this.context);
                    break;

                default:
                    decoder = new NativeDecoder(this.context);
                    break;

            }

            const audioBuffer = await decoder.decode(filePath);

            return audioBuffer;
        } catch (error) {
            throw new Error(`Unable to create buffer for ${filePath}: ${error}`);
        }
    };

    public playStream = async (path: string) => {
        const extension = path.split(".").pop().toLowerCase();
        let decoder: AudioDecoder;

        try {
            switch (extension) {
                case 'mp3':
                    decoder = new MpegDecoder(this.context);
                    break;
                case 'opus':
                    decoder = new OpusDecoder(this.context);
                    break;

                default:
                    throw new Error('This extension does not have any decoders which support streaming')
                    break;
            }

            return decoder.streamFile(path);
        } catch {
            throw new Error(`Failed to stream file at ${path}: ${Error}`)
        }
    }
}
