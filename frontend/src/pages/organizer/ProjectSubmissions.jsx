import { useEffect, useState } from 'react';
import { Github, FileText, ExternalLink, Users, Calendar, Search, Filter } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sidebar } from '../../components/layout/Sidebar';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';

const ProjectSubmissions = () => {
    const { user } = useAuthStore();
    const [hackathons, setHackathons] = useState([]);
    const [selectedHackathon, setSelectedHackathon] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchHackathons();
    }, [user]);

    const fetchHackathons = async () => {
        try {
            const response = await api.get('/hackathons', { params: { organizerId: user?.id } });
            setHackathons(response.data.hackathons || []);
            if (response.data.hackathons?.length > 0) {
                setSelectedHackathon(response.data.hackathons[0]);
            }
        } catch (error) {
            console.error('Failed to fetch hackathons:', error);
        }
    };

    useEffect(() => {
        if (selectedHackathon) {
            fetchTeams();
        }
    }, [selectedHackathon]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/teams/hackathon/${selectedHackathon.id}`);
            setTeams(response.data.teams || []);
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter teams with final submissions
    const submittedTeams = teams.filter(team => team.submissions?.final);

    // Apply search and filter
    const filteredTeams = submittedTeams.filter(team => {
        const matchesSearch = team.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            team.submissions?.final?.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && team.status === filterStatus;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex min-h-screen bg-dark-bg">
            <Sidebar role="organizer" />

            <main className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Project Submissions</h1>
                    <p className="text-gray-400">
                        View all final project submissions from participants
                    </p>
                </div>

                {/* Hackathon Selector */}
                <div className="mb-6 flex items-center gap-4">
                    <select
                        value={selectedHackathon?.id || ''}
                        onChange={(e) => {
                            const hack = hackathons.find(h => h.id === e.target.value);
                            setSelectedHackathon(hack);
                        }}
                        className="input-field max-w-md"
                    >
                        {hackathons.map(hack => (
                            <option key={hack.id} value={hack.id}>{hack.title}</option>
                        ))}
                    </select>

                    <Badge status={selectedHackathon?.submissionsOpen ? 'accepted' : 'pending'}>
                        {selectedHackathon?.submissionsOpen ? 'Submissions Open' : 'Submissions Closed'}
                    </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="text-gray-400 mb-2">Total Teams</div>
                        <div className="text-3xl font-bold">{teams.length}</div>
                    </Card>
                    <Card className="p-6">
                        <div className="text-gray-400 mb-2">Projects Submitted</div>
                        <div className="text-3xl font-bold text-accent-green">{submittedTeams.length}</div>
                    </Card>
                    <Card className="p-6">
                        <div className="text-gray-400 mb-2">Pending Submissions</div>
                        <div className="text-3xl font-bold text-accent-yellow">{teams.length - submittedTeams.length}</div>
                    </Card>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by team name or project description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10 w-full"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field"
                    >
                        <option value="all">All Teams</option>
                        <option value="accepted">Accepted</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {/* Submissions List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading submissions...</div>
                ) : filteredTeams.length === 0 ? (
                    <Card className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Submissions Yet</h3>
                        <p className="text-gray-400">
                            {submittedTeams.length === 0
                                ? 'No teams have submitted their final projects yet.'
                                : 'No submissions match your search criteria.'
                            }
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {filteredTeams.map(team => (
                            <Card key={team.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{team.teamName}</h3>
                                            <Badge status={team.status}>{team.status}</Badge>
                                            {team.tags?.length > 0 && (
                                                <div className="flex gap-1">
                                                    {team.tags.map(tag => (
                                                        <span key={tag} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {team.members?.length || 1} members
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Submitted: {formatDate(team.submissions?.final?.submittedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* GitHub Link */}
                                    {team.submissions?.final?.repositoryUrl && (
                                        <a
                                            href={team.submissions.final.repositoryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-dark-bg px-4 py-2 rounded-lg hover:bg-dark-border transition-colors"
                                        >
                                            <Github className="w-5 h-5" />
                                            <span>View Repository</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>

                                {/* Project Description */}
                                <div className="bg-dark-bg rounded-lg p-4 mb-4">
                                    <h4 className="font-medium mb-2 text-gray-300">Project Description</h4>
                                    <p className="text-gray-400 whitespace-pre-wrap">
                                        {team.submissions?.final?.projectDescription || 'No description provided'}
                                    </p>
                                </div>

                                {/* AI Scores if available */}
                                {team.scores && (
                                    <div className="flex gap-4 mt-4">
                                        <div className="bg-dark-bg rounded-lg px-4 py-2">
                                            <span className="text-gray-400 text-sm">GitHub</span>
                                            <div className="font-bold text-primary">{team.scores.github || 0}</div>
                                        </div>
                                        <div className="bg-dark-bg rounded-lg px-4 py-2">
                                            <span className="text-gray-400 text-sm">Resume</span>
                                            <div className="font-bold text-primary">{team.scores.resume || 0}</div>
                                        </div>
                                        <div className="bg-dark-bg rounded-lg px-4 py-2">
                                            <span className="text-gray-400 text-sm">Idea</span>
                                            <div className="font-bold text-primary">{team.scores.idea || 0}</div>
                                        </div>
                                        <div className="bg-dark-bg rounded-lg px-4 py-2">
                                            <span className="text-gray-400 text-sm">Bios</span>
                                            <div className="font-bold text-primary">{team.scores.bios || 0}</div>
                                        </div>
                                        <div className="bg-primary/20 rounded-lg px-4 py-2">
                                            <span className="text-primary text-sm">Total Score</span>
                                            <div className="font-bold text-primary text-xl">{team.scores.total || 0}</div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProjectSubmissions;
