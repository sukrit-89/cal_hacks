import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Calendar, MapPin, Download, CheckCircle } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const TeamRSVP = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { currentTeam, fetchTeam, rsvp, loading } = useTeamStore();
    const [qrCode, setQrCode] = useState(null);
    const [confirmed, setConfirmed] = useState(false);

    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId);
        }
    }, [teamId]);

    useEffect(() => {
        if (currentTeam?.qrCode) {
            setQrCode(currentTeam.qrCode);
            setConfirmed(true);
        }
    }, [currentTeam]);

    const handleRSVP = async () => {
        try {
            const code = await rsvp(teamId);
            setQrCode(code);
            setConfirmed(true);
        } catch (error) {
            alert('Failed to RSVP. Please try again.');
        }
    };

    const handleDownloadQR = () => {
        if (!qrCode) return;

        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `team-${currentTeam?.teamName || teamId}-qr.png`;
        link.click();
    };

    if (!currentTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (currentTeam.status !== 'accepted') {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="p-12 text-center max-w-md">
                    <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">RSVP Not Available</h2>
                    <p className="text-gray-400 mb-4">
                        Your team must be accepted before you can RSVP for the hackathon.
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-3xl mx-auto">
                {!confirmed ? (
                    /* RSVP Confirmation */
                    <Card className="p-12">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
                            <p className="text-xl text-gray-400">
                                Your team has been accepted. Please confirm your attendance.
                            </p>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="p-6 bg-dark-bg rounded-xl">
                                <h3 className="font-bold mb-4">Event Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 text-gray-400">
                                        <Calendar className="w-5 h-5" />
                                        <span>October 12-14, 2024</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-400">
                                        <MapPin className="w-5 h-5" />
                                        <span>San Francisco, CA (Hybrid)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                                <p className="text-sm text-accent-green">
                                    <strong>Important:</strong> After confirming, you'll receive a unique QR code for check-in at the venue.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleRSVP}
                            size="lg"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Confirming...' : 'Confirm Attendance'}
                        </Button>
                    </Card>
                ) : (
                    /* QR Code Display */
                    <Card className="p-12">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-accent-green" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2">RSVP Confirmed!</h1>
                            <p className="text-gray-400">
                                You're all set for the hackathon. Show this QR code at check-in.
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-8">
                            <div className="p-8 bg-white rounded-2xl shadow-2xl">
                                {qrCode ? (
                                    <img src={qrCode} alt="Team QR Code" className="w-64 h-64" />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center">
                                        <QrCode className="w-32 h-32 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Info */}
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-dark-bg rounded-lg">
                                <div className="text-sm text-gray-400 mb-1">Team Name</div>
                                <div className="font-bold">{currentTeam.teamName}</div>
                            </div>
                            <div className="p-4 bg-dark-bg rounded-lg">
                                <div className="text-sm text-gray-400 mb-1">Team Code</div>
                                <div className="font-mono font-bold text-primary">{currentTeam.teamCode}</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={handleDownloadQR}
                                variant="secondary"
                                className="flex-1 flex items-center justify-center space-x-2"
                            >
                                <Download className="w-5 h-5" />
                                <span>Download QR Code</span>
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1"
                            >
                                Back to Dashboard
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-dark-bg rounded-lg text-center text-sm text-gray-400">
                            <p>
                                Save this QR code to your device or take a screenshot. You'll need it for venue access.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TeamRSVP;
