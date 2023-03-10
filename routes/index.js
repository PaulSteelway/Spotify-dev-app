const express = require('express');
const router = express.Router();

const accountsRouter = require('./accounts');
const tasksRouter = require('./tasks');
const proxyRouter = require('./proxies');
// Redirect to accounts
router.get('/', (req, res) => {
  res.redirect('/accounts');
});



// Render proxy page
// router.get('/proxy', (req, res) => {
//   res.render('proxy', {
//     title: 'Proxy',
//     currentPage: '/proxy'
//   });
// });

// Render monitoring page
router.get('/monitoring', (req, res) => {
  res.render('monitoring', {
    title: 'Monitoring',
    currentPage: '/monitoring'
  });
});

// Use accounts router
router.use('/accounts', accountsRouter);
router.use('/tasks', tasksRouter);
router.use('/proxy', proxyRouter);

module.exports = router;
