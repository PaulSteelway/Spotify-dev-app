const { Sequelize, DataTypes } = require('sequelize');

// Подключаем базу данных
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../database.sqlite'
});

// Определяем модель Account
const Account = sequelize.define('Account', {
  account: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  proxy: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Экспортируем модель
module.exports = Account;
