import express from 'express';
import { AuthService } from '../../application/services/AuthService.js';

const router = express.Router();

/**
 * POST /auth/register
 * Register a new user
 * Body: { email, password, firstName, lastName }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const user = await AuthService.register(email, password, firstName, lastName);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      error: error.message || 'Registration failed',
    });
  }
});

export default router;
