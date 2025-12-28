import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:5174'],

    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    },

    axicov: {
        preEvalUrl: process.env.AXICOV_PRE_EVAL_URL,
        finalEvalUrl: process.env.AXICOV_FINAL_EVAL_URL,
        apiKey: process.env.AXICOV_API_KEY
    },

    openai: {
        apiKey: process.env.OPENAI_API_KEY
    }
};

export default config;
