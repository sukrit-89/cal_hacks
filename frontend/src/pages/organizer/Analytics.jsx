import { useEffect, useState } from 'react';
import { TrendingUp, Users, Target, Award, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card } from '../../components/ui/Card';

export const Analytics = () => {
    const { user } = useAuthStore();

    // Mock analytics data
    const stats = {
        totalApplications: 247,
        acceptanceRate: 68,
        avgTeamSize: 3.2,
        topTechStack: 'React, Python, TensorFlow',
        dailyApplications: [
            { day: 'Mon', count: 32 },
            { day: 'Tue', count: 45 },
            { day: 'Wed', count: 38 },
            { day: 'Thu', count: 52 },
            { day: 'Fri', count: 41 },
            { day: 'Sat', count: 23 },
            { day: 'Sun', count: 16 }
        ],
        scoreDistribution: [
            { range: '0-20', count: 5 },
            { range: '21-40', count: 18 },
            { range: '41-60', count: 45 },
            { range: '61-80', count: 92 },
            { range: '81-100', count: 87 }
        ]
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar role="organizer" />

            <div className="flex-1 ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
                    <p className="text-gray-400">Detailed insights into your hackathon performance</p>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Applications</span>
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold">{stats.totalApplications}</div>
                        <div className="text-sm text-accent-green mt-1">+23% vs last event</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Acceptance Rate</span>
                            <Target className="w-5 h-5 text-accent-green" />
                        </div>
                        <div className="text-3xl font-bold">{stats.acceptanceRate}%</div>
                        <div className="text-sm text-gray-400 mt-1">Industry avg: 55%</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Avg Team Size</span>
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-3xl font-bold">{stats.avgTeamSize}</div>
                        <div className="text-sm text-gray-400 mt-1">members per team</div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Avg HackHealth</span>
                            <Award className="w-5 h-5 text-accent-yellow" />
                        </div>
                        <div className="text-3xl font-bold">72.4</div>
                        <div className="text-sm text-accent-green mt-1">+5.2 vs last week</div>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Daily Applications Chart */}
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-primary" />
                            Applications This Week
                        </h3>
                        <div className="space-y-4">
                            {stats.dailyApplications.map((day, index) => {
                                const maxCount = Math.max(...stats.dailyApplications.map(d => d.count));
                                const percentage = (day.count / maxCount) * 100;

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium w-12">{day.day}</span>
                                            <div className="flex-1 mx-4">
                                                <div className="h-8 bg-dark-bg rounded-lg overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-accent-purple flex items-center justify-end pr-3"
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <span className="text-xs font-bold">{day.count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Score Distribution */}
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-accent-green" />
                            Score Distribution
                        </h3>
                        <div className="space-y-4">
                            {stats.scoreDistribution.map((range, index) => {
                                const maxCount = Math.max(...stats.scoreDistribution.map(r => r.count));
                                const percentage = (range.count / maxCount) * 100;

                                return (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium w-16">{range.range}</span>
                                            <div className="flex-1 mx-4">
                                                <div className="h-8 bg-dark-bg rounded-lg overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-accent-green to-accent-yellow flex items-center justify-end pr-3"
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        <span className="text-xs font-bold">{range.count} teams</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Tech Stack */}
                <Card className="p-6 mt-8">
                    <h3 className="text-xl font-bold mb-4">Popular Tech Stacks</h3>
                    <div className="flex flex-wrap gap-3">
                        {['React', 'Python', 'TensorFlow', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'PyTorch', 'Next.js', 'PostgreSQL'].map((tech, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-lg border border-primary/30"
                            >
                                {tech} ({Math.floor(Math.random() * 50 + 20)})
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
