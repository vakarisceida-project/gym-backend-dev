import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "../../domain/entities/User.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",           
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  synchronize: true,         
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});