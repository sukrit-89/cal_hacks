import { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, Bell, Target } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTeamStore } from '../../stores/teamStore';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Sidebar } from '../../components/layout/Sidebar';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/helpers';

export const ParticipantDashboard = () => {
    const { user } = useAuthStore();
    const { teams, fetchUserTeams } = useTeamStore();

    useEffect(() => {
        fetchUserTeams();
    }, []);

    // Mock notifications and stats
    const notifications = [
        {
            id: 1,
            type: 'success',
            message: 'HackMIT accepted your application!',
            time: '2 hours ago'
        },
        {
            id: 2,
            type: 'info',
            message: 'Team invite from @Sarah_Design for Web3 Summit',
            time: '5 hours ago',
            actions: true
        }
    ];

    const deadlines = [
        {
            id: 1,
            title: 'Idea Submission',
            event: 'AI Global Challenge',
            time: 'Tomorrow, 11:59 PM'
        },
        {
            id: 2,
            title: 'Team Registration Closes',
            event: 'Web3 Summit',
            time: 'Oct 25, 05:00 PM'
        }
    ];

    // Stats
    const activeHackathons = teams.filter(t => ['pending', 'accepted'].includes(t.status)).length;
    const pendingReviews = teams.filter(t => t.status === 'pending').length;
    const totalWins = 5; // Mock
    const teamInvites = 2; // Mock

    return (
        <div className="flex min-h-screen">
            <Sidebar role="participant" />

            <div className="flex-1 ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.displayName || 'there'}</h1>
                    <p className="text-gray-400">Here's what's happening with your hackathons today.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Active Hackathons</span>
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold">{activeHackathons}</div>
                        <div className="text-sm text-accent-green mt-1">+1 this month</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Pending Reviews</span>
                            <Calendar className="w-5 h-5 text-accent-yellow" />
                        </div>
                        <div className="text-3xl font-bold">{pendingReviews}</div>
                        <div className="text-sm text-gray-400 mt-1">Awaiting results</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Wins</span>
                            <Target className="w-5 h-5 text-accent-green" />
                        </div>
                        <div className="text-3xl font-bold">{totalWins}</div>
                        <div className="text-sm text-accent-green mt-1">Top 10% Rank</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Team Invites</span>
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold">{teamInvites}</div>
                        <div className="text-sm text-gray-400 mt-1">New requests</div>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">My Applications</h2>
                            <Link to="/hackathons">
                                <Button variant="secondary" size="sm">Browse Hackathons</Button>
                            </Link>
                        </div>

                        {teams.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <h3 className="text-xl font-bold mb-2">No applications yet</h3>
                                <p className="text-gray-400 mb-4">Start by joining a hackathon!</p>
                                <Link to="/hackathons">
                                    <Button>Explore Hackathons</Button>
                                </Link>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {teams.map((team) => (
                                    <Card key={team.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-purple rounded-lg flex items-center justify-center">
                                                        <span className="text-lg font-bold">{team.teamName?.charAt(0) || 'T'}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg">{team.teamName}</h3>
                                                        <p className="text-sm text-gray-400">Team Code: {team.teamCode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge status={team.status}>{team.status}</Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <div className="text-gray-400">Role</div>
                                                <div className="font-medium">
                                                    {team.leaderId === user?.id ? 'Team Lead' : 'Member'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400">Members</div>
                                                <div className="font-medium">{team.members?.length || 1}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-400">Created</div>
                                                <div className="font-medium">{formatDateTime(team.createdAt)}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            <Link to={`/teams/${team.id}`} className="flex-1">
                                                <Button variant="secondary" size="sm" className="w-full">
                                                    View Team
                                                </Button>
                                            </Link>
                                            {team.status === 'accepted' && !team.rsvpStatus && (
                                                <Button size="sm" className="flex-1">RSVP Now</Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Content */}
                    <div className="space-y-6">
                        {/* Notifications */}
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-primary" />
                                    Notifications
                                </h3>
                                <button className="text-sm text-primary hover:underline">Mark all read</button>
                            </div>
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="p-3 bg-dark-bg rounded-lg">
                                        <div className="flex items-start space-x-2">
                                            <div
                                                className={`w-2 h-2 rounded-full mt-1.5 ${notification.type === 'success' ? 'bg-accent-green' : 'bg-primary'
                                                    }`}
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                {notification.actions && (
                                                    <div className="flex gap-2 mt-2">
                                                        <button className="text-xs btn-primary py-1 px-3">Accept</button>
                                                        <button className="text-xs btn-secondary py-1 px-3">Decline</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Deadlines */}
                        <Card className="p-6">
                            <h3 className="font-bold flex items-center mb-4">
                                <Calendar className="w-5 h-5 mr-2 text-accent-yellow" />
                                Deadlines
                            </h3>
                            <div className="space-y-3">
                                {deadlines.map((deadline) => (
                                    <div key={deadline.id} className="p-3 bg-dark-bg rounded-lg">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="font-medium text-sm">{deadline.title}</p>
                                            <div className="w-2 h-2 bg-accent-red rounded-full mt-1.5" />
                                        </div>
                                        <p className="text-xs text-gray-400">{deadline.event}</p>
                                        <p className="text-xs text-accent-red mt-1">{deadline.time}</p>
                                    </div>
                                ))}
                                <button className="w-full text-sm text-primary hover:underline mt-2">
                                    View Full Calendar
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantDashboard;
