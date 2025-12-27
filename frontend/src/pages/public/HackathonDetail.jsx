import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Award, ArrowRight, CheckCircle } from 'lucide-react';
import { useHackathonStore } from '../../stores/hackathonStore';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatDateTime } from '../../utils/helpers';

export const HackathonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentHackathon, fetchHackathon, loading } = useHackathonStore();
    const { user } = useAuthStore();

    useEffect(() => {
        if (id) {
            fetchHackathon(id);
        }
    }, [id]);

    const handleApply = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/hackathons/${id}/team/create`);
    };

    if (loading || !currentHackathon) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading hackathon...</div>
            </div>
        );
    }

    const spotsRemaining = (currentHackathon.maxTeams || 100) - (currentHackathon.registeredTeams || 0);
    const isRegistrationOpen = currentHackathon.status === 'live';

    return (
        <div className="min-h-screen">
            {/* Hero Banner */}
            <div className="relative h-96 overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-primary/30 via-dark-bg to-accent-purple/30"
                    style={{
                        backgroundImage: currentHackathon.banner ? `url(${currentHackathon.banner})` : undefined
                    }}
                />
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-12">
                    <div className="mb-4">
                        <Badge status={currentHackathon.status} className="text-base px-4 py-2">
                            {currentHackathon.status}
                        </Badge>
                    </div>
                    <h1 className="text-5xl font-bold mb-4">{currentHackathon.title}</h1>
                    <p className="text-xl text-gray-300 max-w-3xl">{currentHackathon.description}</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Key Info */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Event Details</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-medium">Registration</div>
                                        <div className="text-sm text-gray-400">
                                            {formatDate(currentHackathon.timeline?.registrationStart)} - {formatDate(currentHackathon.timeline?.registrationEnd)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Clock className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-medium">Hackathon Duration</div>
                                        <div className="text-sm text-gray-400">
                                            {formatDate(currentHackathon.timeline?.hackathonStart)} - {formatDate(currentHackathon.timeline?.hackathonEnd)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-medium">Location</div>
                                        <div className="text-sm text-gray-400">{currentHackathon.location || 'Online'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <Users className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-medium">Team Size</div>
                                        <div className="text-sm text-gray-400">1-4 members</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* About */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-4">About</h2>
                            <p className="text-gray-400 leading-relaxed">
                                {currentHackathon.description}
                            </p>
                        </Card>

                        {/* Rules */}
                        {currentHackathon.rules && (
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Rules & Guidelines</h2>
                                <div className="space-y-3">
                                    {currentHackathon.rules.split('\n').map((rule, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <CheckCircle className="w-5 h-5 text-accent-green mt-0.5 flex-shrink-0" />
                                            <p className="text-gray-400">{rule}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Prizes */}
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Prizes & Rewards</h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gradient-to-br from-accent-yellow/20 to-transparent border border-accent-yellow/30 rounded-lg text-center">
                                    <Award className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-accent-yellow">$10,000</div>
                                    <div className="text-sm text-gray-400">First Place</div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-gray-400/20 to-transparent border border-gray-400/30 rounded-lg text-center">
                                    <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">$5,000</div>
                                    <div className="text-sm text-gray-400">Second Place</div>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-orange-400/20 to-transparent border border-orange-400/30 rounded-lg text-center">
                                    <Award className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">$2,500</div>
                                    <div className="text-sm text-gray-400">Third Place</div>
                                </div>
                            </div>
                        </Card>

                        {/* Tags */}
                        {currentHackathon.tags && currentHackathon.tags.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {currentHackathon.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/30"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply Card */}
                        <Card className="p-6 sticky top-24">
                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-primary mb-2">
                                    {spotsRemaining}
                                </div>
                                <div className="text-gray-400">Spots Remaining</div>
                                <div className="text-sm text-gray-500">of {currentHackathon.maxTeams} total</div>
                            </div>

                            <div className="mb-6">
                                <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-accent-purple"
                                        style={{
                                            width: `${((currentHackathon.registeredTeams || 0) / (currentHackathon.maxTeams || 100)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {isRegistrationOpen ? (
                                <Button
                                    onClick={handleApply}
                                    className="w-full flex items-center justify-center space-x-2"
                                    size="lg"
                                >
                                    <span>Apply Now</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            ) : (
                                <Button variant="secondary" className="w-full" size="lg" disabled>
                                    Registration Closed
                                </Button>
                            )}

                            <div className="mt-4 pt-4 border-t border-dark-border space-y-2 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Registration Opens</span>
                                    <span className="text-white">{formatDate(currentHackathon.timeline?.registrationStart)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Registration Closes</span>
                                    <span className="text-white">{formatDate(currentHackathon.timeline?.registrationEnd)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Organizer Info */}
                        <Card className="p-6">
                            <h3 className="font-bold mb-4">Organized By</h3>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-purple rounded-full flex items-center justify-center">
                                    <span className="text-lg font-bold">O</span>
                                </div>
                                <div>
                                    <div className="font-medium">OpenAI & Microsoft</div>
                                    <div className="text-sm text-gray-400">Tech Giants</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonDetail;
