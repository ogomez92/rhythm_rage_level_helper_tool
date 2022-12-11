import * as dotenv from 'dotenv';
import FileManager from './managers/file_manager';

window.onload = () => {
    setup();
};

async function setup() {
    dotenv.config();
    const fileManager = new FileManager(process.env.PACK_PATH);

    const oggFiles = fileManager.getFileList().filter((file) => file.getExtension() == 'ogg');
    
}
