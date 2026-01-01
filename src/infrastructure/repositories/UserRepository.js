import { AppDataSource } from '../database/data-source.js';
import { User } from '../../domain/entities/User.js';

export const getUserRepository = () => {
  return AppDataSource.getRepository(User);
};

export class UserRepository {
  static async findByUsername(username) {
    const repository = getUserRepository();
    return repository.findOne({ where: { username } });
  }

  static async findById(id) {
    const repository = getUserRepository();
    return repository.findOne({ where: { id } });
  }

  static async create(userData) {
    const repository = getUserRepository();
    const user = repository.create(userData);
    return repository.save(user);
  }

  static async findAll() {
    const repository = getUserRepository();
    return repository.find();
  }

  static async update(id, userData) {
    const repository = getUserRepository();
    await repository.update(id, userData);
    return this.findById(id);
  }

  static async delete(id) {
    const repository = getUserRepository();
    return repository.delete(id);
  }
}
