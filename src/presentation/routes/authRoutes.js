import express from 'express';
import { AuthService } from '../../application/services/AuthService.js';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    console.log('🔐 Verifying token...');
    const authHeader = req.headers.authorization;
    console.log('📋 Authorization header:', authHeader ? 'Present' : 'MISSING');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('🎟️ Token:', token.substring(0, 20) + '...');
    
    const decoded = AuthService.verifyToken(token);
    console.log('✅ Token verified for user:', decoded.username);
    
    req.userId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

/**
 * POST /auth/register
 * Register a new user
 * Body: { username, password, weight, height, schedule }
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, weight, height, schedule } = req.body;

    const user = await AuthService.register(username, password, weight, height, schedule);

    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }

    res.status(400).json({ message: error.message || 'Registration failed' });
  }
});

/**
 * POST /auth/login
 * Login user and get JWT token
 * Body: { username, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await AuthService.login(username, password);

    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);

    res.status(401).json({
      success: false,
      message: error.message || 'Prisijungimo vardas arba slaptažodis nesutampa',
    });
  }
});

/**
 * GET /auth/profile
 * Get user profile (protected endpoint)
 * Headers: Authorization: Bearer <token>
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    console.log('📥 GET /profile - User ID:', req.userId);
    
    const user = await UserRepository.findById(req.userId);
    console.log('👤 User found:', user ? user.username : 'NOT FOUND');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform schedule format for response
    const scheduleFormatted = user.schedule.map((item) => ({
      day: item.dayName,
      workout: item.workoutName,
    }));

    const response = {
      username: user.username,
      weight: user.weight,
      height: user.height,
      schedule: scheduleFormatted,
    };

    console.log('✅ Sending profile:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ message: error.message || 'Failed to get profile' });
  }
});

/**
 * PUT /auth/profile
 * Update user profile (protected endpoint)
 * Headers: Authorization: Bearer <token>
 * Body: { weight, height, schedule }
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { weight, height, schedule } = req.body;

    const updateData = {};
    if (weight) updateData.weight = weight;
    if (height) updateData.height = height;
    if (schedule) updateData.schedule = schedule;

    const updatedUser = await UserRepository.update(req.userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
});

export default router;
