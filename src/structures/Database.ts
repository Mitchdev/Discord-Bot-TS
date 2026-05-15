import mysql from 'mysql2/promise';
import initiateTables from './DatabaseTables';

export default class Database {

  connection: mysql.Connection = null;

  constructor() {
    this.connect();
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'discord',
      timezone: 'Z',
    });

    initiateTables(this)
  }

  async query(query: string) {
    if (this.connection) {
      const [rows] = await this.connection.query(query);
      return rows;
    }
    throw new Error('Not connected to database');
  }
}
