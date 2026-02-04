import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '127.0.0.1',      // Matches what you said
  user: 'root',           // Matches what you said
  password: 'root',       // UPDATE THIS to 'root'
  database: 'gambling_db', // Ensure this matches your SQL file
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query({ query, values = [] }: { query: string; values?: any[] }) {
  const [results] = await pool.execute(query, values);
  return results;
}