import { useState } from 'react';
import { X, Github, FileText, Users, ExternalLink } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import api from '../../services/api';

export const TeamDetailModal = ({ isOpen, onClose, team, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);

    if (!team) return null;

    const handleStatusChange = async (newStatus) => {
        try {
            setLoading(true);
            await api.put(`/teams/${team.id}`, { status: newStatus });
            if (onStatusUpdate) {
                onStatusUpdate(team.id, newStatus);
            }
            onClose();
        } catch (error) {
            alert('Failed to update team status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Team Details" size="xl">
            <div className="space-y-6">
                {/* Team Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">{team.teamName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Code: <span className="font-mono text-primary">{team.teamCode}</span></span>
                            <span>•</span>
                            <span>{team.members?.length || 1} members</span>
                        </div>
                    </div>
                    <Badge status={team.status}>{team.status}</Badge>
                </div>

                {/* HackHealth Score */}
                {team.scores && (
                    <div className="p-6 bg-dark-bg rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold">HackHealth Score</h4>
                            <div className="text-3xl font-bold text-primary">
                                {team.scores.total || 0}
                                <span className="text-sm text-gray-400">/100</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Innovation</div>
                                <div className="flex items-center">
                                    <div className="flex-1 h-2 bg-dark-card rounded-full mr-3">
                                        <div
                                            className="h-full bg-accent-purple rounded-full"
                                            style={{ width: `${team.scores.innovation || 0}%` }}
                                        />
                                    </div>
                                    <span className="font-medium">{team.scores.innovation || 0}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Complexity</div>
                                <div className="flex items-center">
                                    <div className="flex-1 h-2 bg-dark-card rounded-full mr-3">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${team.scores.complexity || 0}%` }}
                                        />
                                    </div>
                                    <span className="font-medium">{team.scores.complexity || 0}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Design</div>
                                <div className="flex items-center">
                                    <div className="flex-1 h-2 bg-dark-card rounded-full mr-3">
                                        <div
                                            className="h-full bg-accent-pink rounded-full"
                                            style={{ width: `${team.scores.design || 0}%` }}
                                        />
                                    </div>
                                    <span className="font-medium">{team.scores.design || 0}</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Pitch</div>
                                <div className="flex items-center">
                                    <div className="flex-1 h-2 bg-dark-card rounded-full mr-3">
                                        <div
                                            className="h-full bg-accent-yellow rounded-full"
                                            style={{ width: `${team.scores.pitch || 0}%` }}
                                        />
                                    </div>
                                    <span className="font-medium">{team.scores.pitch || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Details */}
                {team.projectDetails && (
                    <div>
                        <h4 className="font-bold mb-3">Project Details</h4>
                        <div className="p-4 bg-dark-bg rounded-lg space-y-3">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Title</div>
                                <div className="font-medium">{team.projectDetails.title || 'Not provided'}</div>
                            </div>
                            {team.projectDetails.githubRepo && (
                                <div>
                                    <div className="text-sm text-gray-400 mb-1">Repository</div>
                                    <a
                                        href={team.projectDetails.githubRepo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-primary hover:underline"
                                    >
                                        <Github className="w-4 h-4 mr-2" />
                                        <span className="truncate">{team.projectDetails.githubRepo}</span>
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Team Members */}
                <div>
                    <h4 className="font-bold mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Team Members
                    </h4>
                    <div className="space-y-3">
                        {team.teamBios?.map((member, index) => (
                            <div key={index} className="p-4 bg-dark-bg rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                            {index === 0 ? 'L' : `M${index}`}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {index === 0 ? 'Team Lead' : `Member ${index}`}
                                            </div>
                                            {member.githubUrl && (
                                                <a
                                                    href={member.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline flex items-center"
                                                >
                                                    <Github className="w-3 h-3 mr-1" />
                                                    GitHub Profile
                                                    <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {member.resume && (
                                        <a
                                            href={member.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-400 hover:text-white flex items-center"
                                        >
                                            <FileText className="w-4 h-4 mr-1" />
                                            Resume
                                        </a>
                                    )}
                                </div>
                                {member.bio && (
                                    <p className="text-sm text-gray-400 mt-2">{member.bio}</p>
                                )}
                            </div>
                        )) || (
                                <div className="text-sm text-gray-400 text-center py-4">
                                    No member details available
                                </div>
                            )}
                    </div>
                </div>

                {/* Documents */}
                {team.documents && (
                    <div>
                        <h4 className="font-bold mb-3">Submitted Documents</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {team.documents.ideaPPT && (
                                <a
                                    href={team.documents.ideaPPT}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 bg-dark-bg rounded-lg hover:bg-dark-hover transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 mr-3 text-primary" />
                                        <span className="font-medium">Idea Deck</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                </a>
                            )}
                            {team.submissions?.final?.files && team.submissions.final.files.length > 0 && (
                                <a
                                    href={team.submissions.final.files[0]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 bg-dark-bg rounded-lg hover:bg-dark-hover transition-colors flex items-center justify-between"
                                >
                                    <div className="flex items-center">
                                        <FileText className="w-5 h-5 mr-3 text-primary" />
                                        <span className="font-medium">Final Submission</span>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400" />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="pt-6 border-t border-dark-border">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">Update team status:</div>
                        <div className="flex gap-3">
                            <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleStatusChange('accepted')}
                                disabled={loading || team.status === 'accepted'}
                            >
                                Accept
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleStatusChange('waitlisted')}
                                disabled={loading || team.status === 'waitlisted'}
                            >
                                Waitlist
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleStatusChange('rejected')}
                                disabled={loading || team.status === 'rejected'}
                            >
                                Reject
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default TeamDetailModal;
