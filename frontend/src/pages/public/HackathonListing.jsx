import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Clock } from 'lucide-react';
import { useHackathonStore } from '../../stores/hackathonStore';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

export const HackathonListing = () => {
    const { hackathons, fetchHackathons, loading } = useHackathonStore();
    const { user } = useAuthStore();
    const [filters, setFilters] = useState({});

    useEffect(() => {
        fetchHackathons(filters);
    }, [filters]);

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-4">Discover Upcoming Hackathons</h1>
                    <p className="text-xl text-gray-400">
                        Find your next challenge in AI, Web3, and Open Source. Join thousands of developers building the future.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="Search by name, tag, or stack..."
                        className="input-field flex-1 min-w-[300px]"
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <select className="input-field" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Status</option>
                        <option value="live">Live</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse text-gray-400">Loading hackathons...</div>
                    </div>
                ) : hackathons.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No hackathons found</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hackathons.map((hackathon) => (
                            <Card key={hackathon.id} className="flex flex-col">
                                {/* Banner */}
                                <div className="relative h-48 -m-6 mb-0 rounded-t-xl overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent-purple/20"
                                        style={{
                                            backgroundImage: hackathon.banner ? `url(${hackathon.banner})` : undefined
                                        }}
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge status={hackathon.status}>{hackathon.status}</Badge>
                                    </div>
                                    {hackathon.mode && (
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-dark-card/80 backdrop-blur-sm">
                                                {hackathon.mode}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col p-6">
                                    <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                        {hackathon.description}
                                    </p>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        {hackathon.timeline?.registrationStart && (
                                            <div className="flex items-center text-sm text-gray-400">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {formatDate(hackathon.timeline.registrationStart)}
                                            </div>
                                        )}
                                        {hackathon.location && (
                                            <div className="flex items-center text-sm text-gray-400">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {hackathon.location}
                                            </div>
                                        )}
                                        <div className="flex items-center text-sm text-gray-400">
                                            <Users className="w-4 h-4 mr-2" />
                                            {hackathon.registeredTeams || 0} / {hackathon.maxTeams} teams
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {hackathon.tags && hackathon.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {hackathon.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-auto">
                                        <Link to={`/hackathons/${hackathon.id}`}>
                                            <Button variant="secondary" className="w-full flex items-center justify-center space-x-2">
                                                <span>View Details</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HackathonListing;
