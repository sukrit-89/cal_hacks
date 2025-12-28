import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Upload, CheckCircle, Lightbulb } from 'lucide-react';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

export const IdeaSubmission = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { currentTeam, fetchTeam } = useTeamStore();

    const [formData, setFormData] = useState({
        ideaTitle: '',
        ideaDescription: '',
        pptFile: null,
        pptUrl: ''
    });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (teamId) {
            fetchTeam(teamId);
        }
    }, [teamId]);

    // Pre-fill if already submitted
    useEffect(() => {
        if (currentTeam?.submissions?.idea) {
            const idea = currentTeam.submissions.idea;
            setFormData({
                ideaTitle: idea.title || '',
                ideaDescription: idea.description || '',
                pptFile: null,
                pptUrl: idea.pptUrl || ''
            });
        }
    }, [currentTeam]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PDF or PowerPoint file');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setError('');
        setFormData({ ...formData, pptFile: file });

        // Upload file immediately
        try {
            setUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append('ppt', file);

            const response = await api.post('/uploads/ppt', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, pptUrl: response.data.file.url }));
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || 'Failed to upload file');
            setFormData(prev => ({ ...prev, pptFile: null }));
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.ideaTitle.trim()) {
            setError('Idea title is required');
            return;
        }

        if (!formData.ideaDescription.trim()) {
            setError('Idea description is required');
            return;
        }

        if (formData.ideaDescription.length < 50) {
            setError('Please provide a more detailed description (at least 50 characters)');
            return;
        }

        // PPT is now optional - can test with description only
        // if (!formData.pptUrl) {
        //     setError('Please upload your Idea PPT');
        //     return;
        // }

        try {
            setSubmitting(true);

            await api.post(`/teams/${teamId}/idea-submit`, {
                title: formData.ideaTitle,
                description: formData.ideaDescription,
                pptUrl: formData.pptUrl
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.error || 'Failed to submit idea');
        } finally {
            setSubmitting(false);
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
                    <h2 className="text-2xl font-bold mb-2">Idea Submitted!</h2>
                    <p className="text-gray-400 mb-4">
                        Your idea has been submitted successfully. Mentors will review your PPT soon!
                    </p>
                    <Badge status="pending">Under Review</Badge>
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
                            <h1 className="text-4xl font-bold mb-2 flex items-center">
                                <Lightbulb className="w-10 h-10 text-accent-yellow mr-3" />
                                Submit Your Idea
                            </h1>
                            <p className="text-gray-400">
                                Upload your Idea PPT and describe your project concept
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Team</div>
                            <div className="font-mono text-xl font-bold text-primary">
                                {currentTeam.teamName}
                            </div>
                        </div>
                    </div>

                    {currentTeam.submissions?.idea && (
                        <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg">
                            <p className="text-accent-yellow text-sm">
                                ⚠️ You've already submitted your idea. Submitting again will update your submission.
                            </p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Idea Details */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-primary" />
                            Project Idea
                        </h2>

                        <div className="space-y-6">
                            <Input
                                label="Idea Title"
                                value={formData.ideaTitle}
                                onChange={(e) => setFormData({ ...formData, ideaTitle: e.target.value })}
                                placeholder="e.g., AI-Powered Study Assistant"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Idea Description <span className="text-accent-red">*</span>
                                </label>
                                <textarea
                                    value={formData.ideaDescription}
                                    onChange={(e) => setFormData({ ...formData, ideaDescription: e.target.value })}
                                    placeholder="Describe your project idea in detail. Include:\n- What problem does it solve?\n- What technologies will you use? (e.g., React, AI, Blockchain, Cloud, IoT, Data Analytics)\n- What makes it innovative?\n- Who is the target audience?"
                                    className="input-field min-h-[200px] resize-y"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {formData.ideaDescription.length} characters (minimum 50)
                                </p>
                                <p className="text-xs text-primary mt-1">
                                    💡 Tip: Mention specific technologies (AI, Web, Blockchain, Cloud, IoT, Data) to help us assign relevant mentors!
                                </p>
                            </div>

                            <Input
                                label="Tech Stack"
                                value={formData.techStack}
                                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                placeholder="e.g., React, Node.js, Python, AI/ML, Firebase"
                                helperText="Comma-separated list of technologies you'll use"
                            />
                        </div>
                    </Card>

                    {/* PPT Upload */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <Upload className="w-5 h-5 mr-2 text-primary" />
                            Idea Presentation (PPT)
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Upload PPT/PDF (Optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf,.ppt,.pptx"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="ppt-upload"
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="ppt-upload"
                                        className={`flex items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading
                                            ? 'border-gray-600 bg-gray-800/50 cursor-wait'
                                            : formData.pptUrl
                                                ? 'border-accent-green bg-accent-green/10'
                                                : 'border-dark-border bg-dark-bg hover:border-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        {uploading ? (
                                            <div className="text-center">
                                                <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400 animate-pulse" />
                                                <p className="text-gray-400">Uploading...</p>
                                            </div>
                                        ) : formData.pptUrl ? (
                                            <div className="text-center">
                                                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-accent-green" />
                                                <p className="text-accent-green font-medium">
                                                    {formData.pptFile?.name || 'File uploaded successfully'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Click to replace
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                                <p className="text-gray-300 font-medium">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    PDF or PowerPoint (Max 10MB)
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                <p className="text-sm text-primary">
                                    <strong>Note:</strong> Your PPT will be reviewed by mentors who specialize in your project's domain (AI, Web, Blockchain, etc.)
                                </p>
                            </div>
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
                            <p className="font-medium">Ready to submit your idea?</p>
                            <p className="text-sm text-gray-400">
                                You can update your submission anytime before the deadline.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={submitting || uploading}
                        >
                            {submitting ? 'Submitting...' : 'Submit Idea →'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IdeaSubmission;
