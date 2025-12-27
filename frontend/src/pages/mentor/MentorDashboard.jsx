import { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, Clock } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export const MentorDashboard = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, reviewed
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, [filter]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const statusParam = filter !== 'all' ? `?status=${filter}` : '';
            const response = await api.get(`/mentor/assignments${statusParam}`);
            setAssignments(response.data.assignments || []);
        } catch (err) {
            console.error('Failed to fetch assignments:', err);
            setError('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReviewed = async (assignmentId) => {
        try {
            await api.post(`/mentor/assignments/${assignmentId}/reviewed`);
            fetchAssignments(); // Refresh list
            alert('Assignment marked as reviewed!');
        } catch (err) {
            console.error('Failed to mark as reviewed:', err);
            alert('Failed to update status');
        }
    };

    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const reviewedCount = assignments.filter(a => a.status === 'reviewed').length;

    return (
        <div className="flex min-h-screen bg-dark-bg">
            <Sidebar role="mentor" />

            <div className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Mentor Dashboard</h1>
                    <p className="text-gray-400">Review assigned team idea presentations</p>
                </div>

                {/* Stats Cards */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Assignments</span>
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-3xl font-bold">{assignments.length}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Pending Review</span>
                            <Clock className="w-5 h-5 text-accent-yellow" />
                        </div>
                        <div className="text-3xl font-bold text-accent-yellow">{pendingCount}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Reviewed</span>
                            <CheckCircle className="w-5 h-5 text-accent-green" />
                        </div>
                        <div className="text-3xl font-bold text-accent-green">{reviewedCount}</div>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={filter === 'all' ? 'primary' : 'secondary'}
                        onClick={() => setFilter('all')}
                    >
                        All ({assignments.length})
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'primary' : 'secondary'}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({pendingCount})
                    </Button>
                    <Button
                        variant={filter === 'reviewed' ? 'primary' : 'secondary'}
                        onClick={() => setFilter('reviewed')}
                    >
                        Reviewed ({reviewedCount})
                    </Button>
                </div>

                {/* Assignments Table */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-6">Assigned PPTs</h2>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading assignments...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-accent-red">{error}</div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            {filter === 'all'
                                ? 'No assignments yet. Check back later!'
                                : `No ${filter} assignments.`}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-dark-border text-left text-sm text-gray-400">
                                        <th className="pb-3">TEAM NAME</th>
                                        <th className="pb-3">DOMAIN</th>
                                        <th className="pb-3">PPT</th>
                                        <th className="pb-3">STATUS</th>
                                        <th className="pb-3">ASSIGNED DATE</th>
                                        <th className="pb-3">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="border-b border-dark-border/50 hover:bg-dark-hover/30">
                                            <td className="py-4">
                                                <div className="font-medium">{assignment.teamName}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-medium">
                                                    {assignment.domain}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                {assignment.pptUrl ? (
                                                    <a
                                                        href={assignment.pptUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-primary hover:underline text-sm"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        View PPT
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">No PPT uploaded</span>
                                                )}
                                            </td>
                                            <td className="py-4">
                                                <Badge status={assignment.status === 'reviewed' ? 'accepted' : 'pending'}>
                                                    {assignment.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <span className="text-sm text-gray-400">
                                                    {new Date(assignment.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                {assignment.status === 'pending' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleMarkReviewed(assignment.id)}
                                                    >
                                                        Mark Reviewed
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center gap-1 text-accent-green text-sm">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Completed
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MentorDashboard;
