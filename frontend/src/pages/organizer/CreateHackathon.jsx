import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useHackathonStore } from '../../stores/hackathonStore';

export const CreateHackathon = () => {
    const navigate = useNavigate();
    const { createHackathon, loading } = useHackathonStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: 'Online',
        mode: 'hybrid',
        maxTeams: 100,
        banner: '',
        tags: '',
        rules: '',
        timeline: {
            registrationStart: '',
            registrationEnd: '',
            hackathonStart: '',
            hackathonEnd: ''
        },
        aiWeights: {
            innovation: 40,
            complexity: 30,
            design: 20,
            pitch: 10
        }
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTimelineChange = (field, value) => {
        setFormData({
            ...formData,
            timeline: { ...formData.timeline, [field]: value }
        });
    };

    const handleWeightChange = (field, value) => {
        setFormData({
            ...formData,
            aiWeights: { ...formData.aiWeights, [field]: parseInt(value) }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        const totalWeight = Object.values(formData.aiWeights).reduce((a, b) => a + b, 0);
        if (totalWeight !== 100) {
            setError('AI weights must total 100%');
            return;
        }

        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);

            const result = await createHackathon({
                ...formData,
                tags: tagsArray,
                status: 'draft'
            });

            navigate('/organizer/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to create hackathon');
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar role="organizer" />

            <div className="flex-1 ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-2">Create Hackathon</h1>
                        <p className="text-gray-400">Set up a new hackathon event with AI-powered judging</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">Basic Information</h2>
                            <div className="space-y-4">
                                <Input
                                    label="Hackathon Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="AI Revolution Hack 2024"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Build the next generation of AI-powered applications..."
                                        className="input-field min-h-[120px] resize-y"
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="San Francisco, CA"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Mode
                                        </label>
                                        <select
                                            name="mode"
                                            value={formData.mode}
                                            onChange={handleChange}
                                            className="input-field"
                                        >
                                            <option value="online">Online</option>
                                            <option value="in-person">In-Person</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Max Teams"
                                        name="maxTeams"
                                        type="number"
                                        value={formData.maxTeams}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />

                                    <Input
                                        label="Banner Image URL (Optional)"
                                        name="banner"
                                        type="url"
                                        value={formData.banner}
                                        onChange={handleChange}
                                        placeholder="https://example.com/banner.jpg"
                                    />
                                </div>

                                <Input
                                    label="Tags (comma-separated)"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="AI, Machine Learning, Web3"
                                />
                            </div>
                        </Card>

                        {/* Timeline */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">Timeline</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Registration Start"
                                    type="datetime-local"
                                    value={formData.timeline.registrationStart}
                                    onChange={(e) => handleTimelineChange('registrationStart', e.target.value)}
                                    required
                                />

                                <Input
                                    label="Registration End"
                                    type="datetime-local"
                                    value={formData.timeline.registrationEnd}
                                    onChange={(e) => handleTimelineChange('registrationEnd', e.target.value)}
                                    required
                                />

                                <Input
                                    label="Hackathon Start"
                                    type="datetime-local"
                                    value={formData.timeline.hackathonStart}
                                    onChange={(e) => handleTimelineChange('hackathonStart', e.target.value)}
                                    required
                                />

                                <Input
                                    label="Hackathon End"
                                    type="datetime-local"
                                    value={formData.timeline.hackathonEnd}
                                    onChange={(e) => handleTimelineChange('hackathonEnd', e.target.value)}
                                    required
                                />
                            </div>
                        </Card>

                        {/* Rules */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">Rules & Guidelines</h2>
                            <textarea
                                name="rules"
                                value={formData.rules}
                                onChange={handleChange}
                                placeholder="1. Teams must have 1-4 members&#10;2. All code must be original&#10;3. Submissions must be made before deadline"
                                className="input-field min-h-[150px] resize-y"
                            />
                        </Card>

                        {/* AI Weights */}
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">AI Evaluation Weights</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Configure how the AI will evaluate submissions. Weights must total 100%.
                            </p>

                            <div className="space-y-6">
                                {Object.entries(formData.aiWeights).map(([key, value]) => (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium capitalize">{key}</label>
                                            <span className="text-sm font-bold">{value}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={value}
                                            onChange={(e) => handleWeightChange(key, e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-dark-border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Total Weight</span>
                                        <span className={`font-bold text-lg ${Object.values(formData.aiWeights).reduce((a, b) => a + b, 0) === 100
                                                ? 'text-accent-green'
                                                : 'text-accent-red'
                                            }`}>
                                            {Object.values(formData.aiWeights).reduce((a, b) => a + b, 0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {error && (
                            <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center justify-end space-x-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/organizer/dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Hackathon'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateHackathon;
