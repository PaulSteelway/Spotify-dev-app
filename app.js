const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const Browser = require('./src/browser');
app.set('view engine', 'pug');
const db = require('./models');
// Импортируем модуль роутера
const personalRouter = require('./routes');
const { Builder } = require('selenium-webdriver');


// Синхронизируем модели с базой данных
db.sequelize.sync()
  .then(() => {
    console.log('Таблицы созданы');
  })
  .catch((err) => {
    console.error('Ошибка при создании таблиц: ', err);
  });

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
// Используем роутер для страниц личного кабинета
app.use('/', personalRouter);

app.use(express.static('public'));

const browsers = {};


app.get('/browser/:id/start', async (req, res) => {
  const id = req.params.id;
  const account = await db.accounts.findByPk(req.params.id);
  
  if (!browsers[id] && account) {
    browsers[id] = new Browser(account);
    await browsers[id].start();
  }

  res.send(`Browser ${id} started`);
});


app.get('/browser/:id/request')

app.get('/browser/:id/stop', async (req, res) => {
  const id = req.params.id;

  if (browsers[id]) {
    await browsers[id].stop();
    delete browsers[id];
  }

  res.send(`Browser ${id} stopped`);
});



app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
