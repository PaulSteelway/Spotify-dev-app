// require('dotenv').config()


// const dbConfig = {
//     DB: process.env.DB_NAME,
//     USER: process.env.DB_USER,
//     PASSWORD: process.env.DB_PASSWORD,
//     dialect: process.env.DB_TYPE,
//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }

// };




const { Sequelize, Op, Model, DataTypes } = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: '../database.sqlite'
  });
  


// const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//     host: dbConfig.HOST,
//     dialect: dbConfig.dialect,
//     operatorsAliases: false,
//     pool: {
//         max: dbConfig.pool.max,
//         min: dbConfig.pool.min,
//         acquire: dbConfig.pool.acquire,
//         idle: dbConfig.pool.idle
//     }
// });


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

const Account = sequelize.define('account', {
    account: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cookies:{
        type:DataTypes.JSON,
        allowNull:true
    },
    token:{
        type:DataTypes.JSON,
        allowNull:true
    },
    browser:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'stop'
    }


  });

const Proxy = sequelize.define('proxy', {
    host:{
        type: DataTypes.STRING,
        allowNull:false,
    },
    credentials:{
        type:DataTypes.STRING,
        allowNull:false
    },
    active:{
        type:DataTypes.BOOLEAN,
        allowNull:true
    }
});
const Task = sequelize.define('task', {
    name:{
        type: DataTypes.STRING,
        allowNull:false
    },
    target:{
        type: DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    options:{
        type: DataTypes.JSON,
        allowNull:true
    },
    log:{
        type: DataTypes.STRING,
        allowNull:false,
        defaultValue:'created'
    }
});

Proxy.hasMany(Account,{as:'accounts',foreignKey:'proxyId'});
Account.belongsTo(Proxy, {as:'proxyAccount',foreignKey:'proxyId'});

Account.hasMany(Task,{as:'tasks',foreignKey:'accountId', onDelete:'CASCADE'});
Task.belongsTo(Account,{as:'taskAccount',foreignKey:'accountId'});

db.accounts = Account;
db.proxies = Proxy;
db.tasks = Task;

module.exports = db;