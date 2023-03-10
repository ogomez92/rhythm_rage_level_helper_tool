export default class HTMLStreamer {
    context: AudioContext;

    constructor(context: AudioContext) {
        this.context = context;
    }

    public stream = (path: string): HTMLAudioElement => {
        try {
            return new Audio(path);
        } catch (error) {
            throw new Error(`Native audio decoder was unable to decode the file at ${path}: ${error}`)
        }
    }
}
