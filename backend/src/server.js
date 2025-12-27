import express from 'express';
import cors from 'cors';
import config from './config/config.js';

// Import routes
import authRoutes from './routes/auth.js';
import hackathonRoutes from './routes/hackathons.js';
import teamRoutes from './routes/teams.js';
import uploadRoutes from './routes/uploads.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import statsRoutes from './routes/stats.js';
import deadlinesRoutes from './routes/deadlines.js';

const app = express();

// Middleware
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/deadlines', deadlinesRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(config.nodeEnv === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
});

export default app;
