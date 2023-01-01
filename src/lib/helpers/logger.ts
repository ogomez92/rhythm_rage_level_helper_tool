import * as path from 'path';
import * as fs from 'fs';

export default class Logger {
    public static makeLogFile = async (filename: string, stringToWrite: string) => {
        const logPath = path.join(__dirname, 'logs');

        if (await !fs.existsSync(logPath)) {
            await fs.mkdirSync(logPath);
        }

        const filePath = path.join(logPath, `${filename}.log`);

        await fs.writeFileSync(filePath, `${stringToWrite}\r\n`)
    }

    public static appendToFile = async (filename: string, stringToWrite: string) => {
        const logPath = path.join(__dirname, 'logs');

        if (await !fs.existsSync(logPath)) {
            await fs.mkdirSync(logPath);
        }

        const filePath = path.join(logPath, `${filename}.log`);

        await fs.appendFileSync(filePath, `${stringToWrite}\r\n`)
    }
}
