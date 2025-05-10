const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  preference: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  lookingFor: {
    type: DataTypes.ENUM('friend', 'date', ''),
    defaultValue: ''
  },
  followRequestSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  followRequestAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  scrapingStatus: {
    type: DataTypes.ENUM('pending', 'done', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true, // Enables createdAt and updatedAt
  tableName: 'users' // Explicitly set table name
});

module.exports = User;
