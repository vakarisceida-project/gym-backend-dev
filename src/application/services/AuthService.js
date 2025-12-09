import bcrypt from 'bcrypt';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';

const SALT_ROUNDS = 10;

export class AuthService {
  static async register(email, password, firstName, lastName) {
    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new Error('All fields are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Return user without password
    return this.sanitizeUser(user);
  }

  static sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
