import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

export const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-40 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent-purple rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold">H</span>
                        </div>
                        <span className="text-xl font-bold hidden sm:block">HackHub</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/hackathons" className="text-gray-300 hover:text-white transition-colors">
                            Hackathons
                        </Link>
                        {user && (
                            <>
                                {user.role === 'participant' && (
                                    <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                                        Dashboard
                                    </Link>
                                )}
                                {user.role === 'organizer' && (
                                    <Link to="/organizer/dashboard" className="text-gray-300 hover:text-white transition-colors">
                                        Dashboard
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-2 text-gray-300">
                                    <User className="w-5 h-5" />
                                    <span className="text-sm">{user.displayName || user.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <button className="btn-secondary py-2 px-4">
                                        Log In
                                    </button>
                                </Link>
                                <Link to="/signup">
                                    <button className="btn-primary py-2 px-4">
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-dark-hover"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-dark-border animate-fade-in">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            to="/hackathons"
                            className="block px-4 py-2 rounded-lg hover:bg-dark-hover"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Hackathons
                        </Link>
                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'organizer' ? '/organizer/dashboard' : '/dashboard'}
                                    className="block px-4 py-2 rounded-lg hover:bg-dark-hover"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleSignOut();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-dark-hover text-accent-red"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block px-4 py-2 rounded-lg hover:bg-dark-hover"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block px-4 py-2 rounded-lg hover:bg-dark-hover"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
