import { useState } from 'react';
import { Users, Plus, X, Trash2, BarChart3, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';

export const MentorManagement = ({ hackathonId }) => {
    const [mentors, setMentors] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [distributionStats, setDistributionStats] = useState(null);
    const [distributing, setDistributing] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
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

    // Fetch distribution statistics
    const fetchDistributionStats = async () => {
        if (!hackathonId) {
            alert('Please select a hackathon first');
            return;
        }

        try {
            setLoadingStats(true);
            const response = await api.get(`/mentors/distribution-stats/${hackathonId}`);
            setDistributionStats(response.data);
            setShowStatsModal(true);
        } catch (error) {
            console.error('Failed to fetch distribution stats:', error);
            alert('Failed to fetch distribution statistics');
        } finally {
            setLoadingStats(false);
        }
    };

    const handleDeleteMentor = async (mentorId, mentorName) => {
        const confirmed = confirm(
            `Are you sure you want to delete mentor "${mentorName}"?\n\nThis will also remove all their assignments.`
        );

        if (!confirmed) return;

        try {
            const response = await api.delete(`/mentors/${mentorId}`);
            alert(`Mentor deleted successfully! ${response.data.deletedAssignments || 0} assignments removed.`);
            fetchMentors();
        } catch (error) {
            console.error('Failed to delete mentor:', error);
            const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Unknown error';
            alert(`Failed to delete mentor: ${errorMessage}`);
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
            'This will assign team PPTs to mentors based on their domains and send email notifications to each mentor. Continue?'
        );

        if (!confirmed) return;

        try {
            setDistributing(true);
            const response = await api.post(`/mentor/assign/${hackathonId}`);
            const summary = response.data.summary;
            const emailResults = response.data.emailResults;

            let message = `Distribution complete!\n\n` +
                `Teams processed: ${summary.totalTeams}\n` +
                `Total assignments: ${summary.totalAssignments}\n` +
                `Skipped teams: ${summary.skippedTeams.length}\n\n`;

            if (emailResults) {
                message += `📧 Emails sent: ${emailResults.sent}\n`;
                if (emailResults.failed > 0) {
                    message += `⚠️ Emails failed: ${emailResults.failed}\n`;
                }
            }

            message += `\nCheck mentor loads in the list below.`;

            alert(message);

            fetchMentors();
        } catch (error) {
            console.error('Distribution error:', error);
            const errorMessage = error.response?.data?.error || 'Unknown error occurred';
            alert(`Failed to distribute PPTs: ${errorMessage}`);
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
                                <button
                                    onClick={() => handleDeleteMentor(mentor.id, mentor.name)}
                                    className="p-2 text-gray-400 hover:text-accent-red hover:bg-dark-hover rounded transition-colors"
                                    title="Delete mentor"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Distribute Button */}
            <div className="flex gap-2">
                <Button
                    variant="success"
                    className="flex-1"
                    onClick={handleDistributePPTs}
                    disabled={distributing || mentors.length === 0}
                >
                    {distributing ? 'Distributing...' : 'Distribute PPTs to Mentors'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={fetchDistributionStats}
                    disabled={loadingStats}
                    title="View Distribution Accuracy"
                >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {loadingStats ? 'Loading...' : 'Stats'}
                </Button>
            </div>

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

            {/* Distribution Stats Modal */}
            {showStatsModal && distributionStats && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-card border border-dark-border rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                                Distribution Accuracy Report
                            </h3>
                            <button
                                onClick={() => setShowStatsModal(false)}
                                className="p-1 hover:bg-dark-hover rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Uniformity Score Card */}
                        <div className={`p-4 rounded-lg mb-6 ${distributionStats.uniformity.score >= 80 ? 'bg-accent-green/10 border border-accent-green/30' :
                                distributionStats.uniformity.score >= 60 ? 'bg-primary/10 border border-primary/30' :
                                    distributionStats.uniformity.score >= 40 ? 'bg-accent-yellow/10 border border-accent-yellow/30' :
                                        'bg-accent-red/10 border border-accent-red/30'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                    {distributionStats.uniformity.score >= 60 ? (
                                        <CheckCircle className="w-6 h-6 text-accent-green mr-2" />
                                    ) : (
                                        <AlertCircle className="w-6 h-6 text-accent-yellow mr-2" />
                                    )}
                                    <span className="font-semibold text-lg">Uniformity Score</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold">{distributionStats.uniformity.score}</span>
                                    <span className="text-gray-400">/100</span>
                                </div>
                            </div>
                            <div className="w-full bg-dark-bg rounded-full h-3 mb-2">
                                <div
                                    className={`h-3 rounded-full transition-all ${distributionStats.uniformity.score >= 80 ? 'bg-accent-green' :
                                            distributionStats.uniformity.score >= 60 ? 'bg-primary' :
                                                distributionStats.uniformity.score >= 40 ? 'bg-accent-yellow' :
                                                    'bg-accent-red'
                                        }`}
                                    style={{ width: `${distributionStats.uniformity.score}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className={`font-medium ${distributionStats.uniformity.score >= 80 ? 'text-accent-green' :
                                        distributionStats.uniformity.score >= 60 ? 'text-primary' :
                                            distributionStats.uniformity.score >= 40 ? 'text-accent-yellow' :
                                                'text-accent-red'
                                    }`}>
                                    {distributionStats.uniformity.rating}
                                </span>
                                <span className="text-gray-400">{distributionStats.uniformity.description}</span>
                            </div>
                        </div>

                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-3 bg-dark-hover/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-primary">{distributionStats.overview.totalTeams}</div>
                                <div className="text-xs text-gray-400">Total Teams</div>
                            </div>
                            <div className="p-3 bg-dark-hover/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-accent-green">{distributionStats.overview.totalAssignments}</div>
                                <div className="text-xs text-gray-400">Assignments</div>
                            </div>
                            <div className="p-3 bg-dark-hover/30 rounded-lg text-center">
                                <div className="text-2xl font-bold text-accent-purple">{distributionStats.overview.mentorsWithAssignments}</div>
                                <div className="text-xs text-gray-400">Active Mentors</div>
                            </div>
                            <div className="p-3 bg-dark-hover/30 rounded-lg text-center">
                                <div className={`text-2xl font-bold ${distributionStats.overview.unassignedTeamsCount > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                                    {distributionStats.overview.unassignedTeamsCount}
                                </div>
                                <div className="text-xs text-gray-400">Unassigned</div>
                            </div>
                        </div>

                        {/* Statistical Details */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-dark-bg rounded-lg">
                                <h4 className="font-semibold mb-3 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                                    Distribution Metrics
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Avg per mentor:</span>
                                        <span className="font-medium">{distributionStats.uniformity.avgAssignmentsPerMentor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Max assignments:</span>
                                        <span className="font-medium">{distributionStats.uniformity.maxAssignments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Min assignments:</span>
                                        <span className="font-medium">{distributionStats.uniformity.minAssignments}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Std deviation:</span>
                                        <span className="font-medium">{distributionStats.uniformity.standardDeviation}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-dark-bg rounded-lg">
                                <h4 className="font-semibold mb-3">Domain Distribution</h4>
                                <div className="space-y-2 text-sm">
                                    {Object.entries(distributionStats.domainDistribution || {}).map(([domain, count]) => (
                                        <div key={domain} className="flex justify-between items-center">
                                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">{domain}</span>
                                            <span className="font-medium">{count} teams</span>
                                        </div>
                                    ))}
                                    {Object.keys(distributionStats.domainDistribution || {}).length === 0 && (
                                        <span className="text-gray-400">No assignments yet</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mentor Breakdown Table */}
                        <div className="mb-6">
                            <h4 className="font-semibold mb-3">Mentor Breakdown</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-dark-border text-left text-gray-400">
                                            <th className="pb-2">Mentor</th>
                                            <th className="pb-2">Domains</th>
                                            <th className="pb-2 text-center">Assigned</th>
                                            <th className="pb-2 text-center">Max Load</th>
                                            <th className="pb-2 text-center">Utilization</th>
                                            <th className="pb-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {distributionStats.mentorBreakdown?.map((mentor, idx) => (
                                            <tr key={idx} className="border-b border-dark-border/50">
                                                <td className="py-2">
                                                    <div className="font-medium">{mentor.name}</div>
                                                    <div className="text-xs text-gray-400">{mentor.email}</div>
                                                </td>
                                                <td className="py-2">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {mentor.domains?.map(d => (
                                                            <span key={d} className="px-1 py-0.5 bg-primary/10 text-primary text-xs rounded">{d}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-center font-medium">{mentor.assigned}</td>
                                                <td className="py-2 text-center text-gray-400">{mentor.maxLoad}</td>
                                                <td className="py-2 text-center">
                                                    <span className={`font-medium ${parseFloat(mentor.utilization) >= 100 ? 'text-accent-red' :
                                                            parseFloat(mentor.utilization) >= 70 ? 'text-accent-yellow' :
                                                                'text-accent-green'
                                                        }`}>
                                                        {mentor.utilization}
                                                    </span>
                                                </td>
                                                <td className="py-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs ${mentor.status === 'At Capacity' ? 'bg-accent-red/10 text-accent-red' :
                                                            mentor.status === 'Active' ? 'bg-accent-green/10 text-accent-green' :
                                                                'bg-gray-500/10 text-gray-400'
                                                        }`}>
                                                        {mentor.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Unassigned Teams Warning */}
                        {distributionStats.unassignedTeams?.length > 0 && (
                            <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg">
                                <h4 className="font-semibold text-accent-red mb-2 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Unassigned Teams ({distributionStats.unassignedTeams.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {distributionStats.unassignedTeams.map(team => (
                                        <span key={team.id} className="px-2 py-1 bg-dark-bg rounded text-sm">
                                            {team.name} <span className="text-gray-400">#{team.code}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full mt-4"
                            onClick={() => setShowStatsModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default MentorManagement;
