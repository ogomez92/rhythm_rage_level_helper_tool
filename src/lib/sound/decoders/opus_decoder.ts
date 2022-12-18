import AudioDecoder from "@lib/sound/interfaces/AudioDecoder";
import * as fs from 'fs';
import { OggOpusDecoderWebWorker } from 'ogg-opus-decoder';

class OpusDecoder implements AudioDecoder {
    context: AudioContext;

    constructor(context: AudioContext) {
        console.log('using opus decoder')
        this.context = context;
    }

    public decode = async (path: string): Promise<AudioBuffer> => {
        try {
            const decoder = new OggOpusDecoderWebWorker();
            await decoder.ready;
            
            const fileData = await fs.readFileSync(path);

            const { channelData, samplesDecoded, sampleRate } = await decoder.decodeFile(new Uint8Array(fileData));

            const buffer = this.context.createBuffer(channelData.length, samplesDecoded, sampleRate);

            channelData.map((channel: any, index: any) => {
                buffer.copyToChannel(channel, index);
            });

            decoder.free();

            return buffer;
        } catch (error) {
            throw new Error(`opus decoder was unable to decode the file at ${path}: ${error.stack}`)
        }
    }

    public streamFile = async (path: string): Promise<void> => {
        return new Promise((resolve) => {
            const decoder = new OggOpusDecoderWebWorker();
            let source: AudioBufferSourceNode;
            decoder.ready.then(() => {
                const buffer = fs.createReadStream(path);
                buffer.on('data', (chunk: any) => {
                    decoder.decode(new Uint8Array(chunk)).then(({ channelData, samplesDecoded, sampleRate }: any) => {
                        const buffer = this.context.createBuffer(channelData.length, samplesDecoded, sampleRate);

                        channelData.map((channel: any, index: any) => {
                            buffer.copyToChannel(channel, index);
                        });

                        // Play the audio
                        source = this.context.createBufferSource();
                        source.buffer = buffer;
                        source.connect(this.context.destination);
                        source.start();
                    });
                });

                buffer.on('end', () => {
                    source.stop();
                    decoder.free();
                    resolve();
                });

            });
        });
    }

}

export default OpusDecoder;
