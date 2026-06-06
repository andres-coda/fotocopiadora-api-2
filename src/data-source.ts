// src/data-source.ts

import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'fotocopiadora2',

  entities: ['src/**/*.entity.ts'],
  migrations: ['src/dataBase/migrations/*{.ts,.js}'],
});