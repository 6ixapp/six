const { sequelize, testConnection } = require('../../config/database');
const User = require('./User');
const PuppeteerCookies = require('./PuppeteerCookies');

// Define relationships between models here if needed
// For example: User.hasMany(SomeOtherModel)

// Sync all models with the database
const syncDatabase = async () => {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to PostgreSQL database. Cannot sync models.');
      return false;
    }
    
    // Force: true will drop the table if it already exists (use with caution)
    // Use alter: true for development to update tables without losing data
    await sequelize.sync({ alter: true });
    console.log('Database & tables synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  PuppeteerCookies,
  syncDatabase
};
