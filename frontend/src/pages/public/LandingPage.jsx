import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, TrendingUp, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

export const LandingPage = () => {
    const { user } = useAuthStore();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-purple/10" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM3NDE1MSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

                <div className="relative max-w-6xl mx-auto text-center z-10">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">AI-POWERED JUDGING</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-slide-up">
                        Build the Future.
                        <br />
                        <span className="text-gradient">One Hackathon at a Time.</span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                        The ultimate platform to host, manage, and participate in hackathons
                        with AI-powered evaluation. Fair, transparent, and intelligent judging for everyone.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        {user ? (
                            <Link to={user.role === 'organizer' ? '/organizer/dashboard' : '/dashboard'}>
                                <Button size="lg" className="flex items-center space-x-2">
                                    <span>Go to Dashboard</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup">
                                    <Button size="lg" className="flex items-center space-x-2">
                                        <span>Get Started for Free</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to="/hackathons">
                                    <Button variant="secondary" size="lg">
                                        Explore Hackathons
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div>
                            <div className="text-3xl font-bold text-primary">1,240</div>
                            <div className="text-sm text-gray-400">Active Hackathons</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-accent-green">50K+</div>
                            <div className="text-sm text-gray-400">Participants</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-accent-purple">98%</div>
                            <div className="text-sm text-gray-400">Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-xl text-gray-400">
                            Simple process, powerful results
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="card text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-primary">1</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Define & Launch</h3>
                            <p className="text-gray-400">
                                Organizers create hackathons, set rules, and define AI evaluation criteria.
                            </p>
                        </div>

                        <div className="card text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-primary">2</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Manage Submissions</h3>
                            <p className="text-gray-400">
                                Teams submit code, resumes, and project decks. Our AI analyzes everything.
                            </p>
                        </div>

                        <div className="card text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-primary">3</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI Evaluation</h3>
                            <p className="text-gray-400">
                                Advanced AI scores projects based on innovation, complexity, and execution.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Judging Section */}
            <section className="py-24 px-4 bg-dark-card/50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent-purple/10 border border-accent-purple/30 rounded-full mb-6">
                                <Brain className="w-4 h-4 text-accent-purple" />
                                <span className="text-sm font-medium">UNBIASED JUDGING</span>
                            </div>

                            <h2 className="text-4xl font-bold mb-6">
                                Powered by
                                <br />
                                <span className="text-gradient">Intelligence.</span>
                            </h2>

                            <p className="text-gray-400 mb-6">
                                Stop guessing, start knowing. Our AI-powered models analyze code,
                                creativity, and innovation to provide objective, bias-free evaluations
                                that you and your team can trust.
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start space-x-3">
                                    <Zap className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-semibold">Automated Code Scoring</div>
                                        <div className="text-sm text-gray-400">GitHub analysis based on commit history and code quality</div>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <TrendingUp className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-semibold">Progress-Based Ranking</div>
                                        <div className="text-sm text-gray-400">Dynamic scoring that adapts to your project's complexity</div>
                                    </div>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <Brain className="w-5 h-5 text-primary mt-1" />
                                    <div>
                                        <div className="font-semibold">Intelligent Weighting</div>
                                        <div className="text-sm text-gray-400">Organizers define what matters, AI does the rest</div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="relative">
                            <div className="card p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Code Efficiency</span>
                                        <span className="text-sm font-bold text-accent-green">94%</span>
                                    </div>
                                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-accent-green to-primary" style={{ width: '94%' }} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Innovation</span>
                                        <span className="text-sm font-bold text-primary">88%</span>
                                    </div>
                                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-accent-purple" style={{ width: '88%' }} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Documentation</span>
                                        <span className="text-sm font-bold text-accent-yellow">76%</span>
                                    </div>
                                    <div className="h-2 bg-dark-bg rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-accent-yellow to-accent-green" style={{ width: '76%' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to launch your hackathon?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Join thousands of organizers and participants shaping the future of tech.
                    </p>
                    <Link to="/signup">
                        <Button size="lg" className="flex items-center space-x-2 mx-auto">
                            <span>Get Started for Free</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-dark-border py-12 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-purple rounded-lg flex items-center justify-center">
                                <span className="text-lg font-bold">H</span>
                            </div>
                            <span className="text-lg font-bold">HackHub</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            The ultimate platform for AI-powered hackathon management.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Features</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>AI Judging</li>
                            <li>Team Management</li>
                            <li>Live Tracking</li>
                            <li>Analytics</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Documentation</li>
                            <li>Help Center</li>
                            <li>API</li>
                            <li>Status</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>About</li>
                            <li>Contact</li>
                            <li>Privacy</li>
                            <li>Terms of Service</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-dark-border text-center text-sm text-gray-400">
                    © 2024 HackHub Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
