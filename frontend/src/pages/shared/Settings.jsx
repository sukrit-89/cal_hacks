import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Github, Linkedin, FileText, Save, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sidebar } from '../../components/layout/Sidebar';
import api from '../../services/api';

export const Settings = ({ role = 'participant' }) => {
    const navigate = useNavigate();
    const { user, initialize } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        githubUrl: '',
        linkedinUrl: '',
        resumeUrl: '',
        phone: '',
        organization: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                bio: user.bio || '',
                githubUrl: user.githubUrl || '',
                linkedinUrl: user.linkedinUrl || '',
                resumeUrl: user.resumeUrl || '',
                phone: user.phone || '',
                organization: user.organization || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSaved(false);

        try {
            await api.put('/users/me', formData);
            setSaved(true);
            // Refresh user data
            initialize();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getDashboardPath = () => {
        if (role === 'organizer') return '/organizer/dashboard';
        if (role === 'mentor') return '/mentor/dashboard';
        return '/dashboard';
    };

    return (
        <div className="flex min-h-screen bg-dark-bg">
            <Sidebar role={role} />

            <div className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <button
                            onClick={() => navigate(getDashboardPath())}
                            className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">Settings</h1>
                            <p className="text-gray-400">Manage your personal information</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <form onSubmit={handleSubmit}>
                        {/* Profile Information */}
                        <Card className="p-6 mb-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <User className="w-5 h-5 mr-2 text-primary" />
                                Profile Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Email
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-400">{user?.email}</span>
                                        <span className="text-xs text-gray-600">(cannot be changed)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Organization / Company
                                    </label>
                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="Your organization or company"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="input-field w-full resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Social Links */}
                        <Card className="p-6 mb-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <Github className="w-5 h-5 mr-2 text-primary" />
                                Social Links
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        GitHub URL
                                    </label>
                                    <div className="flex items-center">
                                        <span className="bg-dark-bg px-3 py-2.5 border border-dark-border border-r-0 rounded-l-lg text-gray-500">
                                            <Github className="w-5 h-5" />
                                        </span>
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            className="input-field w-full rounded-l-none"
                                            placeholder="https://github.com/username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        LinkedIn URL
                                    </label>
                                    <div className="flex items-center">
                                        <span className="bg-dark-bg px-3 py-2.5 border border-dark-border border-r-0 rounded-l-lg text-gray-500">
                                            <Linkedin className="w-5 h-5" />
                                        </span>
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                            className="input-field w-full rounded-l-none"
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Resume URL
                                    </label>
                                    <div className="flex items-center">
                                        <span className="bg-dark-bg px-3 py-2.5 border border-dark-border border-r-0 rounded-l-lg text-gray-500">
                                            <FileText className="w-5 h-5" />
                                        </span>
                                        <input
                                            type="url"
                                            name="resumeUrl"
                                            value={formData.resumeUrl}
                                            onChange={handleChange}
                                            className="input-field w-full rounded-l-none"
                                            placeholder="https://drive.google.com/... or link to resume"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}

                        {saved && (
                            <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg text-accent-green flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Profile updated successfully!
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
