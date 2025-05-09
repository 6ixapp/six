const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PuppeteerCookies = sequelize.define('PuppeteerCookies', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'puppeteer_cookies',
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: false
});

module.exports = PuppeteerCookies; 