import * as fs from 'fs';
import FileInfo from '@src/domain/file_info'

export default class fileManager {
    private path: string;

    constructor(path: string) {
        this.path = path;
    }

    public getPath = () => this.path;

    public getFileList = (): FileInfo[] => {

        const files = fs.readdirSync(this.path);
        const fileList: FileInfo[] = [];
        files.forEach((file) => {
            const stats = fs.statSync(`${this.path}/${file}`);
            const size = stats.size;
            const fileInfo = new FileInfo(file, size);
            fileList.push(fileInfo);
        });

        return fileList;
    }
}
