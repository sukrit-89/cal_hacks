import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, Plus, Key } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const TeamCreation = () => {
    const { hackathonId } = useParams();
    const navigate = useNavigate();
    const { createTeam, joinTeam, loading } = useTeamStore();
    const [mode, setMode] = useState('create'); // 'create' or 'join'
    const [teamName, setTeamName] = useState('');
    const [teamCode, setTeamCode] = useState('');
    const [error, setError] = useState('');

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setError('');

        if (!teamName.trim()) {
            setError('Team name is required');
            return;
        }

        try {
            const team = await createTeam(hackathonId, teamName);
            navigate(`/teams/${team.id}/submit`);
        } catch (err) {
            setError(err.message || 'Failed to create team');
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        setError('');

        if (!teamCode.trim()) {
            setError('Team code is required');
            return;
        }

        try {
            const team = await joinTeam(teamCode.toUpperCase());
            navigate(`/teams/${team.id}`);
        } catch (err) {
            setError(err.message || 'Failed to join team');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Join the Hackathon</h1>
                    <p className="text-gray-400">Create a new team or join an existing one</p>
                </div>

                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setMode('create')}
                        className={`p-6 rounded-xl border-2 transition-all ${mode === 'create'
                                ? 'border-primary bg-primary/10'
                                : 'border-dark-border hover:border-primary/50'
                            }`}
                    >
                        <Plus className="w-8 h-8 mx-auto mb-3 text-primary" />
                        <div className="font-semibold text-lg">Create Team</div>
                        <div className="text-sm text-gray-400 mt-1">Start your own team</div>
                    </button>

                    <button
                        onClick={() => setMode('join')}
                        className={`p-6 rounded-xl border-2 transition-all ${mode === 'join'
                                ? 'border-primary bg-primary/10'
                                : 'border-dark-border hover:border-primary/50'
                            }`}
                    >
                        <Users className="w-8 h-8 mx-auto mb-3 text-primary" />
                        <div className="font-semibold text-lg">Join Team</div>
                        <div className="text-sm text-gray-400 mt-1">Use a team code</div>
                    </button>
                </div>

                {/* Create Team Form */}
                {mode === 'create' && (
                    <Card className="p-8">
                        <form onSubmit={handleCreateTeam} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Create Your Team</h2>
                                <p className="text-gray-400 mb-6">
                                    Choose a unique name for your team. You'll get a team code to share with members.
                                </p>
                            </div>

                            <Input
                                label="Team Name"
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g., Neural Ninjas"
                                required
                            />

                            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <Key className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-primary mb-1">Team Code</p>
                                        <p className="text-gray-400">
                                            After creating your team, you'll receive a unique 6-character code to share with your teammates.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Team'}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* Join Team Form */}
                {mode === 'join' && (
                    <Card className="p-8">
                        <form onSubmit={handleJoinTeam} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Join a Team</h2>
                                <p className="text-gray-400 mb-6">
                                    Enter the 6-character team code shared by your team leader.
                                </p>
                            </div>

                            <Input
                                label="Team Code"
                                type="text"
                                value={teamCode}
                                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                                placeholder="e.g., ABC123"
                                maxLength={6}
                                className="text-center text-2xl font-mono tracking-wider"
                                required
                            />

                            <div className="p-4 bg-dark-bg rounded-lg">
                                <p className="text-sm text-gray-400">
                                    <strong>Don't have a code?</strong> Ask your team leader to share the team code with you.
                                    Team codes are generated automatically when a team is created.
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Joining...' : 'Join Team'}
                            </Button>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default TeamCreation;
