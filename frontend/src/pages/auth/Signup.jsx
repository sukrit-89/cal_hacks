import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        role: 'participant'
    });
    const [error, setError] = useState('');
    const { signUp, loading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            const user = await signUp(
                formData.email,
                formData.password,
                formData.displayName,
                formData.role
            );

            // Redirect based on role
            if (user.role === 'organizer') {
                navigate('/organizer/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Failed to create account');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-400">Join HackHub and start your journey</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'participant' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'participant'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-dark-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="font-semibold">Participant</div>
                                    <div className="text-xs text-gray-400 mt-1">Join hackathons</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'organizer' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${formData.role === 'organizer'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-dark-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="font-semibold">Organizer</div>
                                    <div className="text-xs text-gray-400 mt-1">Host hackathons</div>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Already have an account? </span>
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
