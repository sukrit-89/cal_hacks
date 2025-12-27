import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

export const Results = () => {
    const { hackathonId } = useParams();
    const [results, setResults] = useState([]);
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [hackathonId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const [hackRes, teamsRes] = await Promise.all([
                api.get(`/hackathons/${hackathonId}`),
                api.get(`/hackathons/${hackathonId}/teams`)
            ]);

            setHackathon(hackRes.data.hackathon);

            // Sort teams by final scores
            const sortedTeams = teamsRes.data.teams
                .filter(t => t.status === 'accepted' && t.scores?.total)
                .sort((a, b) => (b.scores?.total || 0) - (a.scores?.total || 0));

            setResults(sortedTeams);
        } catch (error) {
            console.error('Failed to fetch results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-8 h-8 text-accent-yellow" />;
            case 2:
                return <Medal className="w-8 h-8 text-gray-400" />;
            case 3:
                return <Award className="w-8 h-8 text-orange-400" />;
            default:
                return null;
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'from-accent-yellow/20 to-transparent border-accent-yellow/40';
            case 2:
                return 'from-gray-400/20 to-transparent border-gray-400/40';
            case 3:
                return 'from-orange-400/20 to-transparent border-orange-400/40';
            default:
                return 'from-primary/10 to-transparent border-dark-border';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">Loading results...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">Final Results</h1>
                    <p className="text-xl text-gray-400">
                        {hackathon?.title || 'Hackathon'} Leaderboard
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Evaluated by AI based on Innovation, Complexity, Design, and Pitch
                    </p>
                </div>

                {/* Top 3 Podium */}
                {results.length >= 3 && (
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {/* 2nd Place */}
                        <Card className={`p-8 text-center bg-gradient-to-br ${getRankColor(2)} order-1 md:order-2`}>
                            <div className="mb-4">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gray-400/10 rounded-full flex items-center justify-center">
                                    {getRankIcon(2)}
                                </div>
                                <div className="text-4xl font-bold mb-2">2nd</div>
                                <h3 className="text-xl font-bold mb-2">{results[1]?.teamName}</h3>
                                <div className="text-3xl font-bold text-gray-400 mb-4">
                                    {results[1]?.scores?.total || 0}
                                    <span className="text-sm text-gray-500">/100</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                {results[1]?.scores && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Innovation</span>
                                            <span>{results[1].scores.innovation || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Complexity</span>
                                            <span>{results[1].scores.complexity || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* 1st Place */}
                        <Card className={`p-8 text-center bg-gradient-to-br ${getRankColor(1)} md:scale-110 md:shadow-2xl order-2 md:order-1`}>
                            <div className="mb-4">
                                <div className="w-24 h-24 mx-auto mb-4 bg-accent-yellow/10 rounded-full flex items-center justify-center">
                                    {getRankIcon(1)}
                                </div>
                                <div className="text-5xl font-bold mb-2 text-accent-yellow">1st</div>
                                <h3 className="text-2xl font-bold mb-2">{results[0]?.teamName}</h3>
                                <div className="text-4xl font-bold text-accent-yellow mb-4">
                                    {results[0]?.scores?.total || 0}
                                    <span className="text-sm text-gray-500">/100</span>
                                </div>
                                <Badge className="bg-accent-yellow/20 text-accent-yellow border-accent-yellow/40">
                                    🏆 Winner
                                </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                                {results[0]?.scores && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Innovation</span>
                                            <span>{results[0].scores.innovation || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Complexity</span>
                                            <span>{results[0].scores.complexity || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* 3rd Place */}
                        <Card className={`p-8 text-center bg-gradient-to-br ${getRankColor(3)} order-3`}>
                            <div className="mb-4">
                                <div className="w-20 h-20 mx-auto mb-4 bg-orange-400/10 rounded-full flex items-center justify-center">
                                    {getRankIcon(3)}
                                </div>
                                <div className="text-4xl font-bold mb-2">3rd</div>
                                <h3 className="text-xl font-bold mb-2">{results[2]?.teamName}</h3>
                                <div className="text-3xl font-bold text-orange-400 mb-4">
                                    {results[2]?.scores?.total || 0}
                                    <span className="text-sm text-gray-500">/100</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                {results[2]?.scores && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Innovation</span>
                                            <span>{results[2].scores.innovation || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Complexity</span>
                                            <span>{results[2].scores.complexity || 0}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Full Leaderboard */}
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Complete Leaderboard</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-dark-border text-left text-sm text-gray-400">
                                    <th className="pb-3 w-16">Rank</th>
                                    <th className="pb-3">Team</th>
                                    <th className="pb-3">Innovation</th>
                                    <th className="pb-3">Complexity</th>
                                    <th className="pb-3">Design</th>
                                    <th className="pb-3">Pitch</th>
                                    <th className="pb-3">Total</th>
                                    <th className="pb-3">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((team, index) => (
                                    <tr
                                        key={team.id}
                                        className={`border-b border-dark-border/50 ${index < 3 ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <td className="py-4">
                                            <div className="flex items-center">
                                                {index < 3 ? (
                                                    <div className="w-8 h-8 flex items-center justify-center">
                                                        {getRankIcon(index + 1)}
                                                    </div>
                                                ) : (
                                                    <span className="font-bold text-lg">#{index + 1}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="font-medium">{team.teamName}</div>
                                            <div className="text-xs text-gray-400">
                                                {team.members?.length || 1} members
                                            </div>
                                        </td>
                                        <td className="py-4 font-medium">{team.scores?.innovation || 0}</td>
                                        <td className="py-4 font-medium">{team.scores?.complexity || 0}</td>
                                        <td className="py-4 font-medium">{team.scores?.design || 0}</td>
                                        <td className="py-4 font-medium">{team.scores?.pitch || 0}</td>
                                        <td className="py-4">
                                            <span className="text-xl font-bold text-primary">
                                                {team.scores?.total || 0}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center text-accent-green">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                <span className="text-sm">+{Math.floor(Math.random() * 10)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {results.length === 0 && (
                        <div className="py-12 text-center text-gray-400">
                            No results available yet. Check back after final evaluation.
                        </div>
                    )}
                </Card>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <Card className="p-6 text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                            {results.length}
                        </div>
                        <div className="text-sm text-gray-400">Total Submissions</div>
                    </Card>
                    <Card className="p-6 text-center">
                        <div className="text-3xl font-bold text-accent-green mb-2">
                            {results.length > 0 ? Math.round(results.reduce((sum, t) => sum + (t.scores?.total || 0), 0) / results.length) : 0}
                        </div>
                        <div className="text-sm text-gray-400">Average Score</div>
                    </Card>
                    <Card className="p-6 text-center">
                        <div className="text-3xl font-bold text-accent-yellow mb-2">
                            {results[0]?.scores?.total || 0}
                        </div>
                        <div className="text-sm text-gray-400">Highest Score</div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Results;
