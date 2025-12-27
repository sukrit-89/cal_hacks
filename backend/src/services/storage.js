import { bucket } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file, folder) => {
    try {
        const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (error) => {
                console.error('Upload error:', error);
                reject(error);
            });

            stream.on('finish', async () => {
                // Make file publicly accessible
                await fileUpload.makePublic();

                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve({
                    url: publicUrl,
                    path: fileName
                });
            });

            stream.end(file.buffer);
        });
    } catch (error) {
        console.error('File upload error:', error);
        throw new Error('File upload failed');
    }
};

export const deleteFile = async (filePath) => {
    try {
        await bucket.file(filePath).delete();
        return true;
    } catch (error) {
        console.error('File deletion error:', error);
        throw new Error('File deletion failed');
    }
};

export const getFileURL = (filePath) => {
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
};

export default {
    uploadFile,
    deleteFile,
    getFileURL
};
