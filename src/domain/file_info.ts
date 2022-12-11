export default class FileInfo {
    private filename: string;
    private size: number;
    private cursorPosition: number;

    constructor(filename: string, size: number) {
        this.filename = filename;
        this.size = size;
        this.cursorPosition = 0;
    }

    public getName = () => this.filename;

    public getSize = () => this.size;

    public getCursorPosition = () => this.cursorPosition;

    public setCursorPosition = (cursorPosition: number) => this.cursorPosition = cursorPosition;

    public serialize = () => {
        return {
            name: this.filename,
            size: this.size,
            position: this.cursorPosition,
        };
    }

    public getExtension = (): string => {
        const splitFilename = this.filename.split('.');
        return splitFilename[splitFilename.length - 1];
    }
}
