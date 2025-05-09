const { Sequelize } = require('sequelize');

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Get the PostgreSQL connection string from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not defined');
  process.exit(1);
}

console.log('Initializing PostgreSQL connection...');

// Create a new Sequelize instance
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production', // Only log SQL in development
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Railway's PostgreSQL
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
