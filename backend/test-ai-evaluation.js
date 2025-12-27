// Test script for AI evaluation service
import { preEvaluateTeam } from './src/services/aiEvaluationService.js';

// Mock team data for testing
const mockTeam = {
    id: 'test-team-123',
    teamName: 'Test Team Alpha',
    teamCode: 'ABC123',
    teamBios: [
        {
            name: 'John Doe',
            role: 'Full Stack Developer',
            bio: 'Experienced developer with 3 years of experience in React and Node.js',
            githubUrl: 'https://github.com/octocat/'
        },
        {
            name: 'Jane Smith',
            role: 'ML Engineer',
            bio: 'Machine learning specialist with expertise in Python and TensorFlow',
            githubUrl: 'https://github.com/torvalds/'
        }
    ],
    submissions: {
        idea: {
            title: 'AI-Powered Health Monitor',
            description: 'An innovative mobile app that uses AI to monitor health metrics in real-time, providing personalized recommendations and early warning signs for potential health issues.'
        }
    },
    members: ['user1', 'user2']
};

const weights = {
    github: 30,
    resume: 20,
    idea: 40,
    bios: 10
};

async function testEvaluation() {
    console.log('🧪 Starting AI Evaluation Test...\n');
    console.log('📝 Team Data:', JSON.stringify(mockTeam, null, 2));
    console.log('\n⚖️ Weights:', weights);
    console.log('\n-----------------------------------\n');

    try {
        const result = await preEvaluateTeam(mockTeam, weights);

        console.log('\n✅ Evaluation Result:');
        console.log('-----------------------------------');
        console.log('Scores:', JSON.stringify(result.scores, null, 2));
        console.log('\nReasoning:', JSON.stringify(result.reasoning, null, 2));
        console.log('\nBreakdown:', JSON.stringify(result.breakdown, null, 2));
        console.log('-----------------------------------');
        console.log('\n🎉 Test completed successfully!');

        // Verify scores are valid
        if (result.scores.total > 0) {
            console.log(`\n✅ HackHealth Score: ${result.scores.total}/100`);
        } else {
            console.log('\n⚠️ Warning: Total score is 0');
        }
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

testEvaluation();
