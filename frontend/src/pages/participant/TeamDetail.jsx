import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, UserMinus, UserPlus, Copy, Check, Crown, LogOut, Settings, FileText, Lightbulb } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

export const TeamDetail = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { teams, fetchUserTeams } = useTeamStore();

    const [team, setTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        loadTeamDetails();
    }, [teamId]);

    const loadTeamDetails = async () => {
        try {
            setLoading(true);

            // Fetch team details
            const teamResponse = await api.get(`/teams/${teamId}`);
            const teamData = teamResponse.data.team;
            setTeam(teamData);

            // Fetch hackathon details
            const hackathonResponse = await api.get(`/hackathons/${teamData.hackathonId}`);
            setHackathon(hackathonResponse.data.hackathon);

            // Fetch member details
            const memberPromises = teamData.members.map(memberId =>
                api.get(`/users/${memberId}`).catch(() => ({ data: { user: { id: memberId, displayName: 'Unknown User' } } }))
            );
            const memberResponses = await Promise.all(memberPromises);
            setTeamMembers(memberResponses.map(r => r.data.user));

        } catch (error) {
            console.error('Error loading team:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyTeamCode = () => {
        navigator.clipboard.writeText(team.teamCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveMember = async (memberId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const updatedMembers = team.members.filter(id => id !== memberId);
            await api.put(`/teams/${teamId}`, { members: updatedMembers });
            await loadTeamDetails();
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        }
    };

    const handleLeaveTeam = async () => {
        if (!confirm('Are you sure you want to leave this team?')) return;

        try {
            const updatedMembers = team.members.filter(id => id !== user.uid);
            await api.put(`/teams/${teamId}`, { members: updatedMembers });
            navigate('/participant/dashboard');
            fetchUserTeams();
        } catch (error) {
            console.error('Error leaving team:', error);
            alert('Failed to leave team');
        }
    };

    const handleSendInvite = async () => {
        if (!inviteEmail) return;

        try {
            // This is a placeholder - you'd need to implement user lookup by email
            await api.post(`/teams/${teamId}/invite`, { invitedUserId: inviteEmail });
            setShowInviteModal(false);
            setInviteEmail('');
            alert('Invite sent successfully!');
        } catch (error) {
            console.error('Error sending invite:', error);
            alert('Failed to send invite');
        }
    };

    const isLeader = team && user && team.leaderId === user.uid;
    const isMember = team && user && team.members.includes(user.uid);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading team details...</div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">Team not found</p>
                    <Button onClick={() => navigate('/participant/dashboard')}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold">{team.teamName}</h1>
                            {hackathon && (
                                <Link
                                    to={`/hackathons/${hackathon.id}`}
                                    className="text-primary hover:underline mt-2 inline-block"
                                >
                                    {hackathon.title}
                                </Link>
                            )}
                        </div>
                        <Badge status={team.status}>{team.status}</Badge>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Team Code Card */}
                    <Card className="md:col-span-1">
                        <h3 className="font-bold mb-4">Team Code</h3>
                        <div className="flex items-center space-x-2">
                            <code className="flex-1 bg-dark-bg px-4 py-3 rounded text-xl font-mono text-primary">
                                {team.teamCode}
                            </code>
                            <button
                                onClick={copyTeamCode}
                                className="p-3 hover:bg-dark-bg rounded transition-colors"
                                title="Copy team code"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-accent-green" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-3">
                            Share this code with others to join your team
                        </p>
                    </Card>

                    {/* Team Stats */}
                    <Card className="md:col-span-2">
                        <h3 className="font-bold mb-4">Team Statistics</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-gray-400 text-sm">Members</div>
                                <div className="text-2xl font-bold">{team.members.length}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm">Status</div>
                                <div className="text-2xl font-bold capitalize">{team.status}</div>
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm">RSVP</div>
                                <div className="text-2xl font-bold">
                                    {team.rsvpStatus ? '✓' : '✗'}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Team Members */}
                <Card className="mt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Team Members ({teamMembers.length})
                        </h3>
                        {isLeader && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowInviteModal(true)}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Member
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 bg-dark-bg rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-primary font-bold">
                                            {(member.displayName || 'U')[0].toUpperCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="font-medium flex items-center">
                                            {member.displayName || 'Unknown User'}
                                            {member.id === team.leaderId && (
                                                <Crown className="w-4 h-4 ml-2 text-accent-yellow" title="Team Leader" />
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-400">{member.email}</div>
                                    </div>
                                </div>

                                {isLeader && member.id !== team.leaderId && (
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-accent-red hover:underline text-sm flex items-center"
                                    >
                                        <UserMinus className="w-4 h-4 mr-1" />
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions for Team Leader */}
                {/* TEMPORARILY SHOWING FOR ALL MEMBERS FOR DEBUGGING */}
                <Card className="mt-6">
                    <h3 className="font-bold mb-4">Team Submissions</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => navigate(`/teams/${teamId}/submit`)}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Team Registration
                            {team.submissions?.initial && (
                                <Check className="w-4 h-4 ml-2 text-accent-green" />
                            )}
                        </Button>

                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => navigate(`/teams/${teamId}/idea`)}
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Submit Idea PPT
                            {team.submissions?.idea && (
                                <Check className="w-4 h-4 ml-2 text-accent-green" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                        📌 Submit your team profiles first, then upload your Idea PPT for mentor review
                    </p>
                </Card>

                {/* Actions */}
                <div className="mt-6 flex justify-between">
                    <Button variant="secondary" onClick={() => navigate('/participant/dashboard')}>
                        Back to Dashboard
                    </Button>

                    {isMember && !isLeader && (
                        <Button variant="danger" onClick={handleLeaveTeam}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Leave Team
                        </Button>
                    )}
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="max-w-md w-full mx-4">
                            <h3 className="font-bold text-xl mb-4">Invite Team Member</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                Enter the user ID or email of the person you want to invite
                            </p>
                            <input
                                type="text"
                                className="input-field w-full mb-4"
                                placeholder="User ID or email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                            <div className="flex space-x-3">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowInviteModal(false);
                                        setInviteEmail('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={handleSendInvite}
                                >
                                    Send Invite
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamDetail;
