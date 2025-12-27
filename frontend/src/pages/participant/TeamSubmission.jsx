import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, CheckCircle, Linkedin } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const TeamSubmission = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { currentTeam, fetchTeam, submitRegistration, loading } = useTeamStore();

    const [memberProfiles, setMemberProfiles] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId);
        }
    }, [teamId]);

    useEffect(() => {
        if (currentTeam && currentTeam.members) {
            // Initialize profiles for each existing team member
            const profiles = currentTeam.members.map(() => ({
                bio: '',
                linkedinUrl: ''
            }));
            setMemberProfiles(profiles);
        }
    }, [currentTeam]);

    const handleProfileChange = (index, field, value) => {
        const newProfiles = [...memberProfiles];
        newProfiles[index][field] = value;
        setMemberProfiles(newProfiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation - only bio is required
        for (let i = 0; i < memberProfiles.length; i++) {
            if (!memberProfiles[i].bio.trim()) {
                setError(`Bio is required for member ${i + 1}`);
                return;
            }
        }

        try {
            await submitRegistration(teamId, {
                teamBios: memberProfiles
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit registration');
        }
    };

    if (!currentTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading team...</div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-12 text-center max-w-md">
                    <CheckCircle className="w-16 h-16 text-accent-green mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
                    <p className="text-gray-400 mb-4">
                        Your team profiles have been submitted for review. You'll be notified once approved.
                    </p>
                    <Badge status="pending">Pending Review</Badge>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Team Registration</h1>
                            <p className="text-gray-400">
                                Complete team member profiles to finalize your registration
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Team Code</div>
                            <div className="font-mono text-2xl font-bold text-primary">{currentTeam.teamCode}</div>
                        </div>
                    </div>

                    {currentTeam.submissions?.initial && (
                        <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg">
                            <p className="text-accent-yellow text-sm">
                                ⚠️ You've already submitted. Submitting again will update your team profiles.
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Team Members Info */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-primary" />
                                    Team Member Profiles
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {currentTeam.members?.length || 0} member(s) joined via team code
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {memberProfiles.map((profile, index) => (
                                <div key={index} className="p-6 bg-dark-bg rounded-lg border border-dark-border">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-purple rounded-full flex items-center justify-center font-bold text-lg">
                                            {index === 0 ? '★' : `${index + 1}`}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">
                                                {index === 0 ? 'Team Lead' : `Member ${index + 1}`}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {currentTeam.members?.[index] || 'Pending join'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Bio <span className="text-accent-red">*</span>
                                            </label>
                                            <textarea
                                                value={profile.bio}
                                                onChange={(e) => handleProfileChange(index, 'bio', e.target.value)}
                                                placeholder="Tell us about yourself, your skills, interests, and what you bring to the team..."
                                                className="input-field min-h-[120px] resize-y"
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                {profile.bio.length} characters
                                            </p>
                                        </div>

                                        <Input
                                            label="LinkedIn Profile (Optional)"
                                            type="url"
                                            value={profile.linkedinUrl}
                                            onChange={(e) => handleProfileChange(index, 'linkedinUrl', e.target.value)}
                                            placeholder="https://linkedin.com/in/username"
                                            icon={<Linkedin className="w-4 h-4" />}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                            <p className="text-sm text-primary">
                                <strong>Note:</strong> Team members can join using your team code ({currentTeam.teamCode}).
                                Once they join, they'll need to complete their profiles here.
                            </p>
                        </div>
                    </Card>

                    {error && (
                        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between p-6 bg-dark-card rounded-xl border border-dark-border">
                        <div>
                            <p className="font-medium">Ready to submit team profiles?</p>
                            <p className="text-sm text-gray-400">
                                You can add project details later during final submission.
                            </p>
                        </div>
                        <Button type="submit" size="lg" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Registration →'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamSubmission;
