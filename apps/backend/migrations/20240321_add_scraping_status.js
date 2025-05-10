'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'scrapingStatus', {
      type: Sequelize.ENUM('pending', 'done', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'scrapingStatus');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_scrapingStatus;');
  }
}; 