import axios from 'axios';
import config from '../config/config.js';

// Axicov AI integration with OpenAI fallback

// Debug: Log which AI services are configured at startup
console.log('\n🔧 AI Service Configuration:');
console.log('   Axicov Pre-Eval URL:', config.axicov.preEvalUrl ? '✅ Set' : '❌ Not set');
console.log('   Axicov Final-Eval URL:', config.axicov.finalEvalUrl ? '✅ Set' : '❌ Not set');
console.log('   Axicov API Key:', config.axicov.apiKey ? '✅ Set' : '❌ Not set');
console.log('   OpenAI API Key:', config.openai.apiKey ? '✅ Set' : '❌ Not set');
console.log('');

/**
 * Call OpenAI API for pre-evaluation (fallback)
 */
const openAIPreEvaluate = async (teamData, weights) => {
  console.log('🔄 Falling back to OpenAI for pre-evaluation...');

  const prompt = `You are an AI judge for a hackathon. Evaluate the following team based on the provided weights.

Team Information:
- Team Name: ${teamData.teamName || 'Unknown'}
- Team ID: ${teamData.teamId}
- Number of Members: ${teamData.members?.length || 0}
- Idea Title: ${teamData.ideaTitle || 'Not provided'}
- Idea Description: ${teamData.ideaDescription || 'Not provided'}
- Problem Statement: ${teamData.problemStatement || 'Not provided'}
- Tech Stack: ${teamData.techStack?.join(', ') || 'Not specified'}

Scoring Weights:
- Innovation: ${weights.innovation}%
- Technical Complexity: ${weights.complexity}%
- Design: ${weights.design}%
- Pitch Quality: ${weights.pitch}%

Please provide scores (0-100) for each category and calculate a weighted total. Return your response in the following JSON format only (no additional text):
{
    "scores": {
        "innovation": <number>,
        "complexity": <number>,
        "design": <number>,
        "pitch": <number>,
        "total": <weighted_average>
    },
    "breakdown": {
        "github": "<brief analysis of team profiles>",
        "resume": "<brief analysis of team experience>",
        "idea": "<brief analysis of idea>",
        "bio": "<brief analysis of team composition>"
    }
}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a hackathon judge AI that evaluates teams. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const content = response.data.choices[0].message.content;
  const parsed = JSON.parse(content);

  console.log('\n========================================');
  console.log('🎯 PRE-EVALUATION COMPLETED BY: OpenAI');
  console.log('========================================\n');

  return {
    teamId: teamData.teamId,
    scores: parsed.scores,
    breakdown: parsed.breakdown,
    timestamp: new Date().toISOString(),
    provider: 'openai'
  };
};

/**
 * Call OpenAI API for final evaluation (fallback)
 */
const openAIFinalEvaluate = async (teamData, weights) => {
  console.log('🔄 Falling back to OpenAI for final evaluation...');

  const prompt = `You are an AI judge for a hackathon final evaluation. Evaluate the following project submission.

Team Information:
- Team Name: ${teamData.teamName || 'Unknown'}
- Team ID: ${teamData.teamId}
- Project Repository: ${teamData.repoUrl || 'Not provided'}
- Demo URL: ${teamData.demoUrl || 'Not provided'}
- Video URL: ${teamData.videoUrl || 'Not provided'}
- Description: ${teamData.description || 'Not provided'}
- Tech Stack: ${teamData.techStack?.join(', ') || 'Not specified'}

Please evaluate and provide scores (0-100) for:
- Code Quality: How clean, well-structured, and maintainable is the code?
- Innovation: How creative and novel is the solution?
- Completeness: How feature-complete is the project?
- Documentation: How well documented is the project?

Return your response in the following JSON format only (no additional text):
{
    "scores": {
        "codeQuality": <number>,
        "innovation": <number>,
        "completeness": <number>,
        "documentation": <number>,
        "total": <average>
    },
    "breakdown": {
        "repository": "<analysis of repository>",
        "commits": "<analysis of development activity>",
        "documentation": "<analysis of documentation>",
        "functionality": "<analysis of project functionality>"
    }
}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a hackathon judge AI that evaluates final project submissions. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${config.openai.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const content = response.data.choices[0].message.content;
  const parsed = JSON.parse(content);

  return {
    teamId: teamData.teamId,
    scores: parsed.scores,
    breakdown: parsed.breakdown,
    timestamp: new Date().toISOString(),
    provider: 'openai'
  };
};

/**
 * Pre-evaluate team using Axicov AI, with OpenAI fallback
 */
export const preEvaluateTeam = async (teamData, weights) => {
  // First, try Axicov AI
  if (config.axicov.preEvalUrl && config.axicov.apiKey) {
    try {
      console.log('🤖 Attempting Axicov pre-evaluation...');
      const response = await axios.post(
        config.axicov.preEvalUrl,
        {
          team: teamData,
          weights: weights
        },
        {
          headers: {
            'Authorization': `Bearer ${config.axicov.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('\n========================================');
      console.log('🎯 PRE-EVALUATION COMPLETED BY: Axicov');
      console.log('========================================\n');
      return {
        ...response.data,
        provider: 'axicov'
      };
    } catch (axicovError) {
      console.error('❌ Axicov pre-evaluation failed:', axicovError.message);
      console.log('🔄 Attempting OpenAI fallback...');
    }
  } else {
    console.log('⚠️ Axicov not configured, using OpenAI...');
  }

  // Fallback to OpenAI
  if (config.openai.apiKey) {
    try {
      return await openAIPreEvaluate(teamData, weights);
    } catch (openaiError) {
      console.error('❌ OpenAI pre-evaluation failed:', openaiError.message);
      throw new Error('All AI evaluation services failed');
    }
  }

  throw new Error('No AI evaluation service configured. Please set AXICOV_API_KEY or OPENAI_API_KEY.');
};

/**
 * Final evaluate team using Axicov AI, with OpenAI fallback
 */
export const finalEvaluateTeam = async (teamData, weights) => {
  // First, try Axicov AI
  if (config.axicov.finalEvalUrl && config.axicov.apiKey) {
    try {
      console.log('🤖 Attempting Axicov final evaluation...');
      const response = await axios.post(
        config.axicov.finalEvalUrl,
        {
          team: teamData,
          weights: weights
        },
        {
          headers: {
            'Authorization': `Bearer ${config.axicov.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('\n========================================');
      console.log('🎯 FINAL EVALUATION COMPLETED BY: Axicov');
      console.log('========================================\n');
      return {
        ...response.data,
        provider: 'axicov'
      };
    } catch (axicovError) {
      console.error('❌ Axicov final evaluation failed:', axicovError.message);
      console.log('🔄 Attempting OpenAI fallback...');
    }
  } else {
    console.log('⚠️ Axicov not configured, using OpenAI...');
  }

  // Fallback to OpenAI
  if (config.openai.apiKey) {
    try {
      return await openAIFinalEvaluate(teamData, weights);
    } catch (openaiError) {
      console.error('❌ OpenAI final evaluation failed:', openaiError.message);
      throw new Error('All AI evaluation services failed');
    }
  }

  throw new Error('No AI evaluation service configured. Please set AXICOV_API_KEY or OPENAI_API_KEY.');
};

export default {
  preEvaluateTeam,
  finalEvaluateTeam
};
