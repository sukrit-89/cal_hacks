import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { useHackathonStore } from '../../stores/hackathonStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sidebar } from '../../components/layout/Sidebar';
import { TeamDetailModal } from '../../components/organizer/TeamDetailModal';
import api from '../../services/api';

export const OrganizerDashboard = () => {
    const { user } = useAuthStore();
    const { teams, fetchTeamsByHackathon } = useTeamStore();
    const { hackathons, fetchHackathons } = useHackathonStore();
    const [selectedHackathon, setSelectedHackathon] = useState(null);
    const [aiWeights, setAiWeights] = useState({
        innovation: 40,
        complexity: 30,
        design: 20,
        pitch: 10
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchHackathons({ organizerId: user.id });
        }
    }, [user]);

    useEffect(() => {
        if (selectedHackathon) {
            fetchTeamsByHackathon(selectedHackathon.id);
            if (selectedHackathon.aiWeights) {
                setAiWeights(selectedHackathon.aiWeights);
            }
        }
    }, [selectedHackathon]);

    // Set first hackathon as selected by default
    useEffect(() => {
        if (!selectedHackathon && hackathons.length > 0) {
            setSelectedHackathon(hackathons[0]);
        }
    }, [hackathons]);

    const handleUpdateWeights = async () => {
        try {
            await api.put(`/hackathons/${selectedHackathon.id}`, { aiWeights });
            alert('AI weights updated successfully');
        } catch (error) {
            alert('Failed to update weights');
        }
    };

    const handleTriggerEvaluation = async () => {
        try {
            await api.post(`/ai/pre-evaluate/${selectedHackathon.id}`);
            alert('AI evaluation triggered! Check back in a few moments.');
            fetchTeamsByHackathon(selectedHackathon.id);
        } catch (error) {
            alert('Failed to trigger evaluation');
        }
    };

    const handleUpdateTeamStatus = async (teamId, status) => {
        try {
            await api.put(`/teams/${teamId}`, { status });
            fetchTeamsByHackathon(selectedHackathon.id);
        } catch (error) {
            alert('Failed to update team status');
        }
    };

    // Calculate stats
    const totalApplications = teams.length;
    const pendingReview = teams.filter(t => t.status === 'pending').length;
    const avgHackHealth = teams.length > 0
        ? Math.round(teams.reduce((sum, t) => sum + (t.scores?.total || 0), 0) / teams.length)
        : 0;
    const remainingSpots = (selectedHackathon?.maxTeams || 100) - teams.filter(t => t.status === 'accepted').length;

    // Filter teams
    const filteredTeams = teams.filter(team =>
        team.teamName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-dark-bg">
            <Sidebar role="organizer" />

            <div className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">
                                {selectedHackathon?.title || 'Select a Hackathon'}
                            </h1>
                            <p className="text-gray-400">Organizer Admin</p>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/organizer/create">
                                <Button className="flex items-center space-x-2">
                                    <span>+ Create Hackathon</span>
                                </Button>
                            </Link>
                            {selectedHackathon && (
                                <Button variant="secondary">View Live Site</Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6 mb-8">
                    {/* Stats Cards */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Applications</span>
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-3xl font-bold">{totalApplications}</div>
                        <div className="flex items-center text-sm text-accent-green mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12% from last week
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Avg HackHealth</span>
                            <Target className="w-5 h-5" />
                        </div>
                        <div className="text-3xl font-bold">{avgHackHealth}/100</div>
                        <div className="flex items-center text-sm text-accent-green mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +5% quality increase
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Pending Review</span>
                            <Filter className="w-5 h-5" />
                        </div>
                        <div className="text-3xl font-bold">{pendingReview}</div>
                        <div className="flex items-center text-sm text-accent-red mt-1">
                            <TrendingDown className="w-3 h-3 mr-1" />
                            -2% processing rate
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Remaining Spots</span>
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-3xl font-bold">{remainingSpots}</div>
                        <div className="text-sm text-gray-400 mt-1">
                            Cap: {selectedHackathon?.maxTeams || 100} Teams
                        </div>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Applications Table */}
                    <div className="lg:col-span-3">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Applications</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search teams, tech stack..."
                                            className="input-field pl-10 w-80"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="success" size="sm">Accept</Button>
                                        <Button variant="danger" size="sm">Reject</Button>
                                        <Button variant="secondary" size="sm">Waitlist</Button>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-dark-border text-left text-sm text-gray-400">
                                            <th className="pb-3">
                                                <input type="checkbox" className="rounded" />
                                            </th>
                                            <th className="pb-3">TEAM NAME</th>
                                            <th className="pb-3">MEMBERS</th>
                                            <th className="pb-3">TECH STACK</th>
                                            <th className="pb-3">HACKHEALTH</th>
                                            <th className="pb-3">STATUS</th>
                                            <th className="pb-3">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeams.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="py-8 text-center text-gray-400">
                                                    No applications yet
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTeams.map((team) => (
                                                <tr key={team.id} className="border-b border-dark-border/50 hover:bg-dark-hover/30">
                                                    <td className="py-4">
                                                        <input type="checkbox" className="rounded" />
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="font-medium">{team.teamName}</div>
                                                        <div className="text-xs text-gray-400">#{team.teamCode}</div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex -space-x-2">
                                                            {[...Array(Math.min(team.members?.length || 1, 3))].map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="w-8 h-8 rounded-full bg-primary border-2 border-dark-card flex items-center justify-center text-xs"
                                                                >
                                                                    U{i + 1}
                                                                </div>
                                                            ))}
                                                            {team.members?.length > 3 && (
                                                                <div className="w-8 h-8 rounded-full bg-dark-hover border-2 border-card flex items-center justify-center text-xs">
                                                                    +{team.members.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex gap-1">
                                                            {team.tags?.slice(0, 2).map((tag, i) => (
                                                                <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                                                    {tag}
                                                                </span>
                                                            )) || (
                                                                    <span className="text-xs text-gray-400">-</span>
                                                                )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center">
                                                            <span className="font-bold mr-2">{team.scores?.total || '-'}/100</span>
                                                            {team.scores?.total && (
                                                                <div className="w-16 h-2 bg-dark-bg rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-accent-green to-primary"
                                                                        style={{ width: `${team.scores.total}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <Badge status={team.status}>{team.status}</Badge>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTeam(team);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                className="p-1 hover:bg-dark-hover rounded"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
                                <div>Showing 1-{filteredTeams.length} of {totalApplications} teams</div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm">Previous</Button>
                                    <Button variant="secondary" size="sm">Next</Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* AI Scoring Weights Panel */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold">AI Scoring Weights</h3>
                                <button className="text-sm text-primary hover:underline">Reset</button>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(aiWeights).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full mr-2 ${key === 'innovation' ? 'bg-accent-purple' :
                                                    key === 'complexity' ? 'bg-primary' :
                                                        key === 'design' ? 'bg-accent-pink' :
                                                            'bg-accent-yellow'
                                                    }`} />
                                                <span className="text-sm font-medium capitalize">{key}</span>
                                            </div>
                                            <span className="text-sm font-bold">{value}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={value}
                                            onChange={(e) => {
                                                const newValue = parseInt(e.target.value);
                                                setAiWeights({ ...aiWeights, [key]: newValue });
                                            }}
                                            className="w-full"
                                            style={{
                                                accentColor: key === 'innovation' ? '#8B5CF6' :
                                                    key === 'complexity' ? '#3B82F6' :
                                                        key === 'design' ? '#EC4899' :
                                                            '#F59E0B'
                                            }}
                                        />
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-dark-border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Total Weight</span>
                                        <span className={`font-bold ${Object.values(aiWeights).reduce((a, b) => a + b, 0) === 100
                                                ? 'text-accent-green'
                                                : 'text-accent-red'
                                            }`}>
                                            {Object.values(aiWeights).reduce((a, b) => a + b, 0)}%
                                        </span>
                                    </div>
                                </div>

                                <Button onClick={handleUpdateWeights} className="w-full">
                                    Update AI Model
                                </Button>

                                <Button onClick={handleTriggerEvaluation} variant="secondary" className="w-full">
                                    Trigger Evaluation
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Team Detail Modal */}
            <TeamDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                team={selectedTeam}
                onStatusUpdate={(teamId, newStatus) => {
                    fetchTeamsByHackathon(selectedHackathon.id);
                }}
            />
        </div>
    );
};

export default OrganizerDashboard;
