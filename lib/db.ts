import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT), // Converts string to number
  ssl: {
      rejectUnauthorized: false // Necessary for TiDB Cloud
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query({ query, values = [] }: { query: string; values?: any[] }) {
  const [results] = await pool.execute(query, values);
  return results;
}