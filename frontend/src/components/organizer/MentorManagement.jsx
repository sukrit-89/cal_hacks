import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';

export const MentorManagement = ({ hackathonId }) => {
    const [mentors, setMentors] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [distributing, setDistributing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        domains: [],
        maxLoad: 5
    });

    const AVAILABLE_DOMAINS = ['AI', 'Web', 'Blockchain', 'Cloud', 'IoT', 'Data'];

    // Fetch mentors on mount
    const fetchMentors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/mentors');
            setMentors(response.data.mentors || []);
        } catch (error) {
            console.error('Failed to fetch mentors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMentor = async (e) => {
        e.preventDefault();

        if (formData.domains.length === 0) {
            alert('Please select at least one domain');
            return;
        }

        try {
            await api.post('/mentors', formData);
            alert('Mentor created successfully!');
            setShowCreateModal(false);
            setFormData({ name: '', email: '', domains: [], maxLoad: 5 });
            fetchMentors();
        } catch (error) {
            console.error('Failed to create mentor:', error);
            alert('Failed to create mentor');
        }
    };

    const handleDistributePPTs = async () => {
        if (!hackathonId) {
            alert('Please select a hackathon first');
            return;
        }

        const confirmed = confirm(
            'This will assign team PPTs to mentors based on their domains. Continue?'
        );

        if (!confirmed) return;

        try {
            setDistributing(true);
            const response = await api.post(`/mentor/assign/${hackathonId}`);
            const summary = response.data.summary;

            alert(
                `Distribution complete!\n\n` +
                `Teams processed: ${summary.totalTeams}\n` +
                `Total assignments: ${summary.totalAssignments}\n` +
                `Skipped teams: ${summary.skippedTeams.length}\n\n` +
                `Check mentor loads in the list below.`
            );

            fetchMentors();
        } catch (error) {
            console.error('Distribution error:', error);
            alert('Failed to distribute PPTs. See console for details.');
        } finally {
            setDistributing(false);
        }
    };

    const toggleDomain = (domain) => {
        setFormData(prev => ({
            ...prev,
            domains: prev.domains.includes(domain)
                ? prev.domains.filter(d => d !== domain)
                : [...prev.domains, domain]
        }));
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <h3 className="font-bold">Mentor Management</h3>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={fetchMentors}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Create Mentor
                    </Button>
                </div>
            </div>

            {/* Mentor List */}
            {mentors.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    No mentors created yet. Click "Create Mentor" to add one.
                </div>
            ) : (
                <div className="space-y-3 mb-4">
                    {mentors.map((mentor) => (
                        <div
                            key={mentor.id}
                            className="flex items-center justify-between p-3 bg-dark-hover/30 rounded-lg"
                        >
                            <div className="flex-1">
                                <div className="font-medium">{mentor.name}</div>
                                <div className="text-sm text-gray-400">{mentor.email}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    {mentor.domains?.map((domain) => (
                                        <span
                                            key={domain}
                                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                                        >
                                            {domain}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-400">Load: </span>
                                    <span className={mentor.assignedCount >= mentor.maxLoad ? 'text-accent-red font-medium' : 'text-accent-green font-medium'}>
                                        {mentor.assignedCount}/{mentor.maxLoad}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Distribute Button */}
            <Button
                variant="success"
                className="w-full"
                onClick={handleDistributePPTs}
                disabled={distributing || mentors.length === 0}
            >
                {distributing ? 'Distributing...' : 'Distribute PPTs to Mentors'}
            </Button>

            {/* Create Mentor Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-dark-card border border-dark-border rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Create Mentor</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 hover:bg-dark-hover rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateMentor} className="space-y-4">
                            <Input
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Domains (select at least one)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_DOMAINS.map((domain) => (
                                        <button
                                            key={domain}
                                            type="button"
                                            onClick={() => toggleDomain(domain)}
                                            className={`px-3 py-1 rounded text-sm transition-colors ${formData.domains.includes(domain)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-dark-hover text-gray-400 hover:bg-dark-hover/70'
                                                }`}
                                        >
                                            {domain}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Input
                                label="Max Load"
                                type="number"
                                min="1"
                                value={formData.maxLoad}
                                onChange={(e) => setFormData({ ...formData, maxLoad: parseInt(e.target.value) })}
                                required
                            />

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1">
                                    Create
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default MentorManagement;
