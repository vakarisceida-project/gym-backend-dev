import express from 'express';
import cors from 'cors';
import { AppDataSource } from './infrastructure/database/data-source.js'
import authRoutes from './presentation/routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development and production
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4200',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Database connection established');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
      console.log(`📱 Android emulator: http://10.0.2.2:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  });