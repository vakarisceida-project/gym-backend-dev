import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthService {
  static async register(username, password, weight, height, schedule) {
    // Check if user already exists
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('User with this username already exists');
    }

    // Validate input
    if (!username || !password || !weight || !height) {
      throw new Error('All fields are required');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserRepository.create({
      username,
      password: hashedPassword,
      weight,
      height,
      schedule: schedule || [],
    });

    // Return user without password
    return this.sanitizeUser(user);
  }

  static async login(username, password) {
    // Find user by username
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      throw new Error('Prisijungimo vardas arba slaptažodis nesutampa');
    }

    // Validate password
    const isPasswordValid = await this.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Prisijungimo vardas arba slaptažodis nesutampa');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return { success: true, token };
  }

  static sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
