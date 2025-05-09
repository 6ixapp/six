const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the .env file
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env file from:', envPath);

// Check if the .env file exists
if (fs.existsSync(envPath)) {
  console.log('.env file exists at the specified path');
} else {
  console.error('ERROR: .env file does not exist at the specified path');
}

// Load environment variables from .env file with explicit path
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

// Get the PostgreSQL connection string from environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not defined in the .env file');
  process.exit(1);
}

console.log('Initializing PostgreSQL connection with URL:', DATABASE_URL);

// Create a new Sequelize instance
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, // Log SQL queries for debugging
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // This is needed if you're using a self-signed certificate
    }
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
