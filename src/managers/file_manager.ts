import * as fs from "fs";
import * as path from 'path';
import FileInfo from "@src/domain/file_info";

export default class fileManager {
  private path: string;

  constructor(folderPath: string) {
    this.path = path.resolve(folderPath);
  }

  public getPath = () => this.path;

  public getFileList = (): FileInfo[] => {
    if (!this.path) {
      return [];
    }
    const files = fs.readdirSync(this.path);
    const fileList: FileInfo[] = [];
    files.forEach((file) => {
      const stats = fs.statSync(`${this.path}/${file}`);
      const size = stats.size;
      const fileInfo = new FileInfo(file, size);
      fileList.push(fileInfo);
    });

    return fileList;
  };
}
