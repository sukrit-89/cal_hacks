import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Object} file - Multer file object with buffer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} Upload result with url and path
 */
export const uploadFile = async (file, folder) => {
    try {
        return new Promise((resolve, reject) => {
            // Create a unique filename
            const fileName = `${uuidv4()}-${file.originalname}`;
            const publicId = `${folder}/${fileName}`;

            // Upload to Cloudinary using upload_stream
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    resource_type: 'auto', // Auto-detect file type (image, video, raw for PDFs/docs)
                    folder: folder
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return reject(error);
                    }

                    resolve({
                        url: result.secure_url,
                        path: result.public_id
                    });
                }
            );

            // Pipe the file buffer to Cloudinary
            uploadStream.end(file.buffer);
        });
    } catch (error) {
        console.error('File upload error:', error);
        throw new Error('File upload failed');
    }
};

/**
 * Delete file from Cloudinary
 * @param {string} filePath - Cloudinary public_id
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (filePath) => {
    try {
        await cloudinary.uploader.destroy(filePath, { resource_type: 'raw' });
        return true;
    } catch (error) {
        console.error('File deletion error:', error);
        throw new Error('File deletion failed');
    }
};

/**
 * Get file URL from Cloudinary public_id
 * @param {string} filePath - Cloudinary public_id
 * @returns {string} Public URL
 */
export const getFileURL = (filePath) => {
    return cloudinary.url(filePath, { resource_type: 'raw' });
};

export default {
    uploadFile,
    deleteFile,
    getFileURL
};
