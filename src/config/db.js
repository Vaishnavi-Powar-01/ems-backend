const mysql = require('mysql2');
const fs = require('fs');

// For Aiven MySQL, you need to download their CA certificate or disable strict SSL checking
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
    // Option 1: Accept self-signed certificates (Quick fix)
    rejectUnauthorized: false,
    
    // Option 2: If you have the CA certificate (More secure)
    // ca: fs.readFileSync('./ca.pem'), // Download from Aiven dashboard
  }
});

const promisePool = pool.promise();

// Test the connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully to Aiven MySQL');
    connection.release();
    
    // Test a simple query
    const [rows] = await promisePool.query('SELECT VERSION() as version');
    console.log(`📊 MySQL Version: ${rows[0].version}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Troubleshooting tips:');
    console.error('   - Check if host/port are correct');
    console.error('   - Verify credentials in Aiven dashboard');
    console.error('   - Ensure IP is whitelisted (0.0.0.0/0 for testing)');
    process.exit(1);
  }
};

testConnection();

module.exports = promisePool;