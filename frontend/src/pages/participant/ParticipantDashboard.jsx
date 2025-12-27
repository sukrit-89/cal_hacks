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
import { useNotifications } from '../../hooks/useNotifications';
import { useUserStats } from '../../hooks/useUserStats';
import { useTeamInvites } from '../../hooks/useTeamInvites';
import { useDeadlines } from '../../hooks/useDeadlines';

export const ParticipantDashboard = () => {
    const { user } = useAuthStore();
    const { teams, fetchUserTeams } = useTeamStore();

    // Use custom hooks for real data
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { stats, loading: statsLoading } = useUserStats();
    const { invites, acceptInvite, rejectInvite, inviteCount } = useTeamInvites();
    const { deadlines, loading: deadlinesLoading } = useDeadlines();

    useEffect(() => {
        fetchUserTeams();
    }, []);

    // Stats from API
    const activeHackathons = stats?.activeHackathons || 0;
    const pendingReviews = stats?.pendingReviews || 0;
    const totalWins = stats?.totalWins || 0;
    const teamInvites = inviteCount;

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
                        <div className="text-sm text-accent-green mt-1">
                            {stats?.rankPercentile ? `Top ${stats.rankPercentile}% Rank` : 'Keep going!'}
                        </div>
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
                                    {unreadCount > 0 && (
                                        <span className="ml-2 bg-primary text-xs px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h3>
                                <button
                                    className="text-sm text-primary hover:underline"
                                    onClick={markAllAsRead}
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4">
                                        No notifications yet
                                    </p>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-lg cursor-pointer ${notification.read ? 'bg-dark-bg' : 'bg-dark-bg border border-primary/30'
                                                }`}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start space-x-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full mt-1.5 ${notification.type === 'application_status' ? 'bg-accent-green' : 'bg-primary'
                                                        }`}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm">{notification.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                    {notification.type === 'team_invite' && notification.data?.teamId && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                className="text-xs btn-primary py-1 px-3"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    // Find the matching invite
                                                                    const invite = invites.find(inv =>
                                                                        inv.teamId === notification.data.teamId
                                                                    );
                                                                    if (invite) {
                                                                        await acceptInvite(invite.id);
                                                                        markAsRead(notification.id);
                                                                    }
                                                                }}
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="text-xs btn-secondary py-1 px-3"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const invite = invites.find(inv =>
                                                                        inv.teamId === notification.data.teamId
                                                                    );
                                                                    if (invite) {
                                                                        await rejectInvite(invite.id);
                                                                        markAsRead(notification.id);
                                                                    }
                                                                }}
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Deadlines */}
                        <Card className="p-6">
                            <h3 className="font-bold flex items-center mb-4">
                                <Calendar className="w-5 h-5 mr-2 text-accent-yellow" />
                                Deadlines
                            </h3>
                            <div className="space-y-3">
                                {deadlinesLoading ? (
                                    <p className="text-gray-400 text-sm text-center py-4">
                                        Loading deadlines...
                                    </p>
                                ) : deadlines.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-4">
                                        No upcoming deadlines
                                    </p>
                                ) : (
                                    deadlines.slice(0, 5).map((deadline) => (
                                        <div key={deadline.id} className="p-3 bg-dark-bg rounded-lg">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="font-medium text-sm">{deadline.title}</p>
                                                <div className="w-2 h-2 bg-accent-red rounded-full mt-1.5" />
                                            </div>
                                            <p className="text-xs text-gray-400">{deadline.event}</p>
                                            <p className="text-xs text-accent-red mt-1">
                                                {new Date(deadline.time).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                                {deadlines.length > 5 && (
                                    <button className="w-full text-sm text-primary hover:underline mt-2">
                                        View Full Calendar
                                    </button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantDashboard;
