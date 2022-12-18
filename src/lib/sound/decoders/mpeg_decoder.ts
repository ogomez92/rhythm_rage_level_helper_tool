import AudioDecoder from "@lib/sound/interfaces/AudioDecoder";
import { MPEGDecoderWebWorker } from 'mpg123-decoder';
import * as fs from 'fs';

class MpegDecoder implements AudioDecoder {
    context: AudioContext;

    constructor(context: AudioContext) {
        console.log('using mmpeg decoder')
        this.context = context;
    }

    public decode = async (path: string): Promise<AudioBuffer> => {
        try {
            const decoder = new MPEGDecoderWebWorker();
            console.log('created decoder')
            await decoder.ready;
            console.log('ready');
            let response = await fetch(path);
            console.log('fetched')
            let arrayBuffer = await response.arrayBuffer();
            response = null;

            const { channelData, samplesDecoded, sampleRate } = await decoder.decode(new Uint8Array(arrayBuffer));
            console.log('decoded')

            const buffer = this.context.createBuffer(channelData.length, samplesDecoded, sampleRate);

            channelData.map((channel: any, index: any) => {
                buffer.copyToChannel(channel, index);
            });

            decoder.free();

            arrayBuffer = null;

            return buffer;
        } catch (error) {
            throw new Error(`mpeg audio decoder was unable to decode the file at ${path}: ${error}`)
        }
    }

    public streamFile = async (path: string): Promise<void> => {
        return new Promise((resolve) => {
            const decoder = new MPEGDecoderWebWorker();
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

export default MpegDecoder;
