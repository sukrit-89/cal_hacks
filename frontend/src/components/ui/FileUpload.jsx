import { useState } from 'react';
import { Upload, X, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';
import api from '../../services/api';

export const FileUpload = ({
    label,
    accept,
    endpoint,
    onUploadComplete,
    className = ''
}) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            setUploadedUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            const fieldName = endpoint.split('/').pop(); // resume, ppt, or executable
            formData.append(fieldName, file);

            const response = await api.post(`/uploads/${fieldName}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setUploadedUrl(response.data.file.url);
            if (onUploadComplete) {
                onUploadComplete(response.data.file);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setUploadedUrl(null);
        setError(null);
    };

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    {label}
                </label>
            )}

            {!file && !uploadedUrl && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        {accept && (
                            <p className="text-xs text-gray-500 mt-1">{accept}</p>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileChange}
                    />
                </label>
            )}

            {file && !uploadedUrl && (
                <div className="flex items-center justify-between p-4 bg-dark-card border border-dark-border rounded-lg">
                    <div className="flex items-center space-x-3">
                        <Upload className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="btn-primary py-1.5 px-4 text-sm"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button
                            onClick={handleRemove}
                            className="p-2 hover:bg-dark-hover rounded-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {uploadedUrl && (
                <div className="flex items-center justify-between p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-accent-green" />
                        <div>
                            <p className="text-sm font-medium text-accent-green">Uploaded successfully</p>
                            <p className="text-xs text-gray-400 truncate max-w-md">{uploadedUrl}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="p-2 hover:bg-dark-hover rounded-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-accent-red">{error}</p>
            )}
        </div>
    );
};

export default FileUpload;
