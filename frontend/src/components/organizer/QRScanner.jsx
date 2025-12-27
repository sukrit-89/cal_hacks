import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const QRScanner = ({ onScan, onError, isActive = true }) => {
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        if (!isActive) {
            stopScanner();
            return;
        }

        startScanner();

        return () => {
            stopScanner();
        };
    }, [isActive]);

    const startScanner = async () => {
        if (html5QrCodeRef.current || isScanning) return;

        try {
            html5QrCodeRef.current = new Html5Qrcode('qr-reader');

            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    // QR code detected
                    onScan(decodedText);
                },
                (errorMessage) => {
                    // Ignore scanning errors (happens when no QR code in view)
                }
            );

            setIsScanning(true);
            setHasPermission(true);
        } catch (err) {
            console.error('Failed to start scanner:', err);
            setHasPermission(false);
            if (onError) {
                onError(err.message || 'Failed to access camera');
            }
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
            html5QrCodeRef.current = null;
            setIsScanning(false);
        }
    };

    if (hasPermission === false) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-dark-card rounded-xl border border-dark-border">
                <div className="text-red-400 text-center">
                    <p className="font-bold mb-2">Camera Permission Required</p>
                    <p className="text-sm text-gray-400">
                        Please allow camera access to scan QR codes.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                id="qr-reader"
                ref={scannerRef}
                className="w-full max-w-md mx-auto rounded-xl overflow-hidden"
            />
            {!isScanning && hasPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-card rounded-xl">
                    <div className="text-gray-400">Initializing camera...</div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
