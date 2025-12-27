import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, XCircle, AlertCircle, Users, ArrowLeft, Upload, Camera } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { QRScanner } from '../../components/organizer/QRScanner';
import api from '../../services/api';

export const CheckIn = () => {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'upload'
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [checkedInTeams, setCheckedInTeams] = useState([]);
    const fileInputRef = useRef(null);

    const handleScan = async (qrData) => {
        if (loading || result) return;

        setScanning(false);
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/teams/verify-checkin', { qrData });
            setResult(response.data);

            // Add to checked-in list if new check-in
            if (!response.data.alreadyCheckedIn) {
                setCheckedInTeams(prev => [{
                    ...response.data.team,
                    checkedInAt: new Date().toISOString()
                }, ...prev]);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to verify QR code');
        } finally {
            setLoading(false);
        }
    };

    const handleScanError = (errorMessage) => {
        setError(errorMessage);
    };

    const handleScanAgain = () => {
        setResult(null);
        setError(null);
        setScanning(true);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setScanning(false);

        try {
            const html5QrCode = new Html5Qrcode('qr-file-reader');
            const decodedText = await html5QrCode.scanFile(file, true);
            await handleScan(decodedText);
        } catch (err) {
            setError('Could not read QR code from image. Please try another image.');
            setLoading(false);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const switchMode = (mode) => {
        setScanMode(mode);
        setResult(null);
        setError(null);
        setScanning(mode === 'camera');
    };

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Hidden div for file scanning */}
            <div id="qr-file-reader" style={{ display: 'none' }}></div>

            {/* Header */}
            <div className="bg-dark-card border-b border-dark-border px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/organizer/dashboard')}
                            className="p-2 hover:bg-dark-bg rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Team Check-In</h1>
                            <p className="text-gray-400 text-sm">Scan or upload participant QR codes</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                        <Users className="w-5 h-5" />
                        <span className="font-bold text-white">{checkedInTeams.length}</span>
                        <span>checked in this session</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Scanner Section */}
                    <div>
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <QrCode className="w-6 h-6 text-primary" />
                                    <h2 className="text-xl font-bold">QR Scanner</h2>
                                </div>
                                {/* Mode Toggle */}
                                <div className="flex bg-dark-bg rounded-lg p-1">
                                    <button
                                        onClick={() => switchMode('camera')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${scanMode === 'camera'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>Camera</span>
                                    </button>
                                    <button
                                        onClick={() => switchMode('upload')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${scanMode === 'upload'
                                            ? 'bg-primary text-white'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Upload</span>
                                    </button>
                                </div>
                            </div>

                            {/* Camera Mode */}
                            {scanMode === 'camera' && scanning && !loading && (
                                <QRScanner
                                    onScan={handleScan}
                                    onError={handleScanError}
                                    isActive={scanning}
                                />
                            )}

                            {/* Upload Mode */}
                            {scanMode === 'upload' && !result && !loading && (
                                <div className="flex flex-col items-center justify-center p-8 bg-dark-bg rounded-xl border-2 border-dashed border-dark-border">
                                    <Upload className="w-12 h-12 text-gray-500 mb-4" />
                                    <p className="text-gray-400 mb-4 text-center">
                                        Upload a QR code image to check in a team
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="qr-upload"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Choose Image
                                    </button>
                                    <p className="text-xs text-gray-500 mt-3">
                                        Supports PNG, JPG, and other image formats
                                    </p>
                                </div>
                            )}

                            {loading && (
                                <div className="flex flex-col items-center justify-center p-12 bg-dark-bg rounded-xl">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                    <p className="text-gray-400">Verifying QR code...</p>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="flex flex-col items-center p-8 bg-dark-bg rounded-xl">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                                        <XCircle className="w-8 h-8 text-red-400" />
                                    </div>
                                    <p className="text-red-400 font-bold mb-2">Error</p>
                                    <p className="text-gray-400 text-center text-sm mb-6">{error}</p>
                                    <Button onClick={handleScanAgain}>
                                        Try Again
                                    </Button>
                                </div>
                            )}

                            {result && !loading && (
                                <div className="flex flex-col items-center p-6 bg-dark-bg rounded-xl">
                                    {result.alreadyCheckedIn ? (
                                        <>
                                            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                                                <AlertCircle className="w-8 h-8 text-yellow-400" />
                                            </div>
                                            <p className="text-yellow-400 font-bold mb-2">Already Checked In</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle className="w-8 h-8 text-accent-green" />
                                            </div>
                                            <p className="text-accent-green font-bold mb-2">Check-In Successful!</p>
                                        </>
                                    )}

                                    {/* Team Info */}
                                    <div className="w-full mt-4 space-y-3">
                                        <div className="flex justify-between p-3 bg-dark-card rounded-lg">
                                            <span className="text-gray-400">Team Name</span>
                                            <span className="font-bold">{result.team.teamName}</span>
                                        </div>
                                        <div className="flex justify-between p-3 bg-dark-card rounded-lg">
                                            <span className="text-gray-400">Team Code</span>
                                            <span className="font-mono text-primary">{result.team.teamCode}</span>
                                        </div>
                                        {result.hackathon && (
                                            <div className="flex justify-between p-3 bg-dark-card rounded-lg">
                                                <span className="text-gray-400">Hackathon</span>
                                                <span className="font-medium">{result.hackathon.name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Team Members */}
                                    <div className="w-full mt-6">
                                        <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            Team Members ({result.team.memberCount || result.team.memberDetails?.length || 0})
                                        </h3>
                                        <div className="space-y-2">
                                            {result.team.memberDetails?.map((member, idx) => (
                                                <div
                                                    key={member.id || idx}
                                                    className="p-3 bg-dark-card rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium">{member.displayName}</span>
                                                        {member.isLeader && (
                                                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                                Team Lead
                                                            </span>
                                                        )}
                                                    </div>
                                                    {member.email && (
                                                        <p className="text-sm text-gray-400">{member.email}</p>
                                                    )}
                                                    {member.bio && (
                                                        <p className="text-sm text-gray-500 mt-1">{member.bio}</p>
                                                    )}
                                                    {(member.githubUrl || member.linkedinUrl) && (
                                                        <div className="flex gap-3 mt-2">
                                                            {member.githubUrl && (
                                                                <a
                                                                    href={member.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    GitHub
                                                                </a>
                                                            )}
                                                            {member.linkedinUrl && (
                                                                <a
                                                                    href={member.linkedinUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-primary hover:underline"
                                                                >
                                                                    LinkedIn
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button onClick={handleScanAgain} className="mt-6 w-full">
                                        Scan Next Team
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Recent Check-ins */}
                    <div>
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">Recent Check-ins</h2>

                            {checkedInTeams.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                                    <Users className="w-12 h-12 mb-4 opacity-50" />
                                    <p>No teams checked in yet</p>
                                    <p className="text-sm">Scan a QR code to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {checkedInTeams.map((team, index) => (
                                        <div
                                            key={team.id || index}
                                            className="flex items-center justify-between p-4 bg-dark-bg rounded-lg"
                                        >
                                            <div>
                                                <p className="font-bold">{team.teamName}</p>
                                                <p className="text-sm text-gray-400 font-mono">{team.teamCode}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 text-accent-green">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(team.checkedInAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;
