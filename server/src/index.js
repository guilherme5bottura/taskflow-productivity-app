import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import categoryRoutes from './routes/categories.js';
import tagRoutes from './routes/tags.js';
import statsRoutes from './routes/stats.js';
import { getDb } from './db/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging (clean development)
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor' });
});

// Initialize DB and start server
async function startServer() {
  try {
    const db = await getDb();
    console.log('📦 Banco de dados SQLite inicializado com sucesso.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend rodando na porta http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Falha crítica ao inicializar o banco de dados:', err);
    process.exit(1);
  }
}

startServer();
