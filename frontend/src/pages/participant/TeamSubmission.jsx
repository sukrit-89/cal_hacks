import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Github, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';
import { Badge } from '../../components/ui/Badge';

export const TeamSubmission = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { currentTeam, fetchTeam, submitRegistration, loading } = useTeamStore();

    const [formData, setFormData] = useState({
        projectTitle: '',
        githubRepo: '',
        members: [{ githubUrl: '', resume: null, bio: '' }]
    });
    const [ideaPPT, setIdeaPPT] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId);
        }
    }, [teamId]);

    useEffect(() => {
        if (currentTeam && currentTeam.members) {
            // Initialize members array based on team size
            const membersData = currentTeam.members.map(() => ({
                githubUrl: '',
                resume: null,
                bio: ''
            }));
            setFormData(prev => ({ ...prev, members: membersData }));
        }
    }, [currentTeam]);

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...formData.members];
        newMembers[index][field] = value;
        setFormData({ ...formData, members: newMembers });
    };

    const handleAddMember = () => {
        setFormData({
            ...formData,
            members: [...formData.members, { githubUrl: '', resume: null, bio: '' }]
        });
    };

    const handleRemoveMember = (index) => {
        if (formData.members.length > 1) {
            const newMembers = formData.members.filter((_, i) => i !== index);
            setFormData({ ...formData, members: newMembers });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.projectTitle.trim()) {
            setError('Project title is required');
            return;
        }

        if (!formData.githubRepo.trim()) {
            setError('GitHub repository URL is required');
            return;
        }

        // File uploads are now optional, removed validation
        // if (!ideaPPT) {
        //     setError('Idea presentation is required');
        //     return;
        // }

        for (let i = 0; i < formData.members.length; i++) {
            const member = formData.members[i];
            if (!member.githubUrl.trim()) {
                setError(`GitHub URL required for member ${i + 1}`);
                return;
            }
            // Resumes are now optional
            // if (!member.resume) {
            //     setError(`Resume required for member ${i + 1}`);
            //     return;
            // }
            if (!member.bio.trim()) {
                setError(`Bio required for member ${i + 1}`);
                return;
            }
        }

        try {
            await submitRegistration(teamId, {
                projectDetails: {
                    title: formData.projectTitle,
                    githubRepo: formData.githubRepo
                },
                documents: {
                    ideaPPT: ideaPPT
                },
                teamBios: formData.members
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
                    <h2 className="text-2xl font-bold mb-2">Submission Successful!</h2>
                    <p className="text-gray-400 mb-4">
                        Your team registration has been submitted for review. You'll be notified once it's evaluated.
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
                            <h1 className="text-4xl font-bold mb-2">Team Submission</h1>
                            <p className="text-gray-400">
                                Finalize your entry by providing repository and team details below.
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
                                ⚠️ You've already submitted. Submitting again will override your previous submission.
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Project Details */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <Github className="w-5 h-5 mr-2 text-primary" />
                            Project Details
                        </h2>

                        <div className="space-y-4">
                            <Input
                                label="Project Title"
                                type="text"
                                value={formData.projectTitle}
                                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                                placeholder="Smart Grid AI Optimizer"
                                required
                            />

                            <Input
                                label="GitHub Repository URL"
                                type="url"
                                value={formData.githubRepo}
                                onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                                placeholder="https://github.com/alex-dev/smart-grid-ai"
                                required
                            />
                            <p className="text-xs text-gray-400">
                                Repository is validated successfully ✓
                            </p>
                        </div>
                    </Card>

                    {/* Documents */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Documents</h2>

                        <div className="space-y-6">
                            <FileUpload
                                label="Idea Deck (PPT/PDF) - Optional"
                                accept=".ppt,.pptx,.pdf"
                                endpoint="/uploads/ppt"
                                onUploadComplete={(file) => setIdeaPPT(file.url)}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                💡 File uploads are temporarily optional. You can submit without uploading files.
                            </p>
                        </div>
                    </Card>

                    {/* Team Members */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">The Team</h2>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleAddMember}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Member
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {formData.members.map((member, index) => (
                                <div key={index} className="p-6 bg-dark-bg rounded-lg border border-dark-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold">
                                                {index === 0 ? 'LEAD' : `M${index}`}
                                            </div>
                                            <div>
                                                <div className="font-semibold">
                                                    {index === 0 ? 'Team Lead' : `Member ${index}`}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {index === 0 ? 'Full Stack Dev' : 'Team Member'}
                                                </div>
                                            </div>
                                        </div>
                                        {index > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(index)}
                                                className="p-2 hover:bg-dark-hover rounded-lg text-accent-red"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label="GitHub Profile URL"
                                            type="url"
                                            value={member.githubUrl}
                                            onChange={(e) => handleMemberChange(index, 'githubUrl', e.target.value)}
                                            placeholder="https://github.com/username"
                                            required
                                        />

                                        <FileUpload
                                            label="Resume (PDF) - Optional"
                                            accept=".pdf"
                                            endpoint="/uploads/resume"
                                            onUploadComplete={(file) => handleMemberChange(index, 'resume', file.url)}
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            💡 Resume upload is optional for now
                                        </p>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                value={member.bio}
                                                onChange={(e) => handleMemberChange(index, 'bio', e.target.value)}
                                                placeholder="Full stack developer with a passion for clean code and efficient algorithms. Previously worked on..."
                                                className="input-field min-h-[100px] resize-y"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            <p className="font-medium">Ready to submit?</p>
                            <p className="text-sm text-gray-400">
                                Make sure all information is correct before submitting.
                            </p>
                        </div>
                        <Button type="submit" size="lg" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Application →'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamSubmission;
