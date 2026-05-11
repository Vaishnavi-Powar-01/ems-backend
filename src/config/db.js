const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  port: parseInt(process.env.DB_PORT) || 19519,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    // Aiven requires SSL connection
    rejectUnauthorized: true  // Set to true for production
  }
});

// Convert to promise-based pool
const promisePool = pool.promise();

// Test the connection immediately
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully to Aiven MySQL');
    console.log(`📊 Database: ${process.env.DB_NAME || 'defaultdb'}`);
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your database credentials and network settings');
    process.exit(1); // Exit if database connection fails
  }
};

testConnection();

module.exports = promisePool;