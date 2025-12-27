import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Navbar } from './components/layout/Navbar';

// Public pages
import LandingPage from './pages/public/LandingPage';
import HackathonListing from './pages/public/HackathonListing';
import HackathonDetail from './pages/public/HackathonDetail';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Participant pages
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import TeamCreation from './pages/participant/TeamCreation';
import TeamSubmission from './pages/participant/TeamSubmission';
import TeamRSVP from './pages/participant/TeamRSVP';
import FinalSubmission from './pages/participant/FinalSubmission';
import Results from './pages/participant/Results';

// Organizer pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateHackathon from './pages/organizer/CreateHackathon';
import Analytics from './pages/organizer/Analytics';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    const { initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-dark-bg text-white">
                <Routes>
                    {/* Public routes with Navbar */}
                    <Route
                        path="/"
                        element={
                            <>
                                <Navbar />
                                <div className="pt-16">
                                    <LandingPage />
                                </div>
                            </>
                        }
                    />
                    <Route
                        path="/hackathons"
                        element={
                            <>
                                <Navbar />
                                <div className="pt-16">
                                    <HackathonListing />
                                </div>
                            </>
                        }
                    />
                    <Route
                        path="/hackathons/:id"
                        element={
                            <>
                                <Navbar />
                                <div className="pt-16">
                                    <HackathonDetail />
                                </div>
                            </>
                        }
                    />

                    {/* Auth routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Participant routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute requiredRole="participant">
                                <ParticipantDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/hackathons/:hackathonId/team/create"
                        element={
                            <ProtectedRoute requiredRole="participant">
                                <TeamCreation />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teams/:teamId/submit"
                        element={
                            <ProtectedRoute requiredRole="participant">
                                <TeamSubmission />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teams/:teamId/rsvp"
                        element={
                            <ProtectedRoute requiredRole="participant">
                                <TeamRSVP />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/teams/:teamId/final"
                        element={
                            <ProtectedRoute requiredRole="participant">
                                <FinalSubmission />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/hackathons/:hackathonId/results"
                        element={
                            <>
                                <Navbar />
                                <div className="pt-16">
                                    <Results />
                                </div>
                            </>
                        }
                    />

                    {/* Organizer routes */}
                    <Route
                        path="/organizer/dashboard"
                        element={
                            <ProtectedRoute requiredRole="organizer">
                                <OrganizerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizer/create"
                        element={
                            <ProtectedRoute requiredRole="organizer">
                                <CreateHackathon />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizer/analytics"
                        element={
                            <ProtectedRoute requiredRole="organizer">
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
