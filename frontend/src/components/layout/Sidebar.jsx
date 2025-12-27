import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Trophy,
    Plus,
    Users,
    Settings,
    BarChart3,
    FolderKanban,
    LogOut,
    QrCode
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useAuthStore } from '../../stores/authStore';

export const Sidebar = ({ role = 'participant' }) => {
    const location = useLocation();
    const { user, signOut } = useAuthStore();

    const participantLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/hackathons', icon: Trophy, label: 'Browse Hackathons' },
        { to: '/my-projects', icon: FolderKanban, label: 'My Projects' },
        { to: '/settings', icon: Settings, label: 'Settings' }
    ];

    const organizerLinks = [
        { to: '/organizer/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/organizer/create', icon: Plus, label: 'Create Hackathon' },
        { to: '/organizer/applications', icon: Users, label: 'Applications' },
        { to: '/organizer/checkin', icon: QrCode, label: 'Check-In' },
        { to: '/organizer/scoring', icon: BarChart3, label: 'Scoring' },
        { to: '/organizer/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/organizer/settings', icon: Settings, label: 'Settings' }
    ];

    const mentorLinks = [
        { to: '/mentor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/settings', icon: Settings, label: 'Settings' }
    ];

    const links = role === 'organizer' ? organizerLinks :
        role === 'mentor' ? mentorLinks :
            participantLinks;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-card border-r border-dark-border flex flex-col z-30">
            {/* Logo */}
            <div className="p-6 border-b border-dark-border">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent-purple rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold">H</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">HackHub</h1>
                        <p className="text-xs text-gray-400 capitalize">{role}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.to;

                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                                isActive
                                    ? 'bg-primary text-white'
                                    : 'text-gray-400 hover:bg-dark-hover hover:text-white'
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-dark-border">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">
                            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-gray-400 hover:bg-dark-hover hover:text-white rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Log Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
