import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, Upload, CheckCircle } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FileUpload } from '../../components/ui/FileUpload';

export const FinalSubmission = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { currentTeam, fetchTeam, submitFinal, loading } = useTeamStore();

    const [formData, setFormData] = useState({
        repositoryUrl: '',
        projectDescription: '',
        executableFile: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId);
        }
    }, [teamId]);

    useEffect(() => {
        if (currentTeam?.submissions?.final) {
            setFormData({
                repositoryUrl: currentTeam.submissions.final.repositoryUrl || '',
                projectDescription: currentTeam.submissions.final.projectDescription || '',
                executableFile: currentTeam.submissions.final.files?.[0] || null
            });
        }
    }, [currentTeam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.repositoryUrl.trim()) {
            setError('GitHub repository URL is required');
            return;
        }

        if (!formData.projectDescription.trim()) {
            setError('Project description is required');
            return;
        }

        try {
            await submitFinal(teamId, {
                repositoryUrl: formData.repositoryUrl,
                projectDescription: formData.projectDescription,
                files: formData.executableFile ? [formData.executableFile] : []
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to submit final project');
        }
    };

    if (!currentTeam) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (currentTeam.status !== 'accepted' || !currentTeam.rsvpStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="p-12 text-center max-w-md">
                    <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Final Submission Not Available</h2>
                    <p className="text-gray-400 mb-4">
                        You must be accepted and have RSVP'd before submitting your final project.
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="p-12 text-center max-w-md">
                    <CheckCircle className="w-20 h-20 text-accent-green mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Submission Complete!</h2>
                    <p className="text-gray-400 mb-6">
                        Your final project has been submitted successfully. Good luck!
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                        <p>You'll be notified once judging is complete.</p>
                        <p>Results will be announced on the event day.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Final Submission</h1>
                    <p className="text-gray-400">
                        Submit your completed project for final evaluation. Deadline: <span className="text-white font-medium">3 Days Left</span>
                    </p>
                </div>

                {currentTeam.submissions?.final && (
                    <div className="mb-6 p-4 bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg">
                        <p className="text-accent-yellow text-sm">
                            ⚠️ You've already made a final submission. Submitting again will replace your previous submission.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Project Repository */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <Github className="w-5 h-5 mr-2 text-primary" />
                            Project Repository
                        </h2>

                        <Input
                            label="GitHub Repository URL"
                            type="url"
                            value={formData.repositoryUrl}
                            onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
                            placeholder="https://github.com/username/project-name"
                            required
                        />

                        <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                            <p className="text-sm text-primary">
                                <strong>Requirements:</strong>
                            </p>
                            <ul className="text-sm text-gray-400 mt-2 space-y-1 list-disc list-inside">
                                <li>Repository must be public</li>
                                <li>Include a comprehensive README</li>
                                <li>Code must be well-documented</li>
                                <li>Commit history must show team collaboration</li>
                            </ul>
                        </div>
                    </Card>

                    {/* Project Description */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-6">Project Description</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Describe your project
                            </label>
                            <textarea
                                value={formData.projectDescription}
                                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                                placeholder="Provide a detailed description of your project, including the problem it solves, technologies used, and unique features..."
                                className="input-field min-h-[200px] resize-y"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Min. 200 characters • {formData.projectDescription.length} characters
                            </p>
                        </div>
                    </Card>

                    {/* Optional: Executable/Demo */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Executable / Demo (Optional)</h2>
                        <p className="text-sm text-gray-400 mb-6">
                            If your project has a standalone executable or additional files, upload them here.
                        </p>

                        <FileUpload
                            label="Project Files (ZIP, EXE, etc.) - Optional"
                            accept=".zip,.exe,.dmg,.apk"
                            endpoint="/uploads/executable"
                            onUploadComplete={(file) => setFormData({ ...formData, executableFile: file.url })}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            💡 File uploads are temporarily optional due to storage configuration.
                        </p>
                    </Card>

                    {error && (
                        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between p-6 bg-dark-card rounded-xl border border-dark-border">
                        <div>
                            <p className="font-medium">Ready to submit your final project?</p>
                            <p className="text-sm text-gray-400">
                                Make sure all information is correct. This will be evaluated by AI judges.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Save Draft
                            </Button>
                            <Button type="submit" size="lg" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Final Project →'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FinalSubmission;
