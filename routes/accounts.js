const express = require('express');
const router = express.Router();
const db = require('../models');
const Acc = require('../controller/accounts');

// Get all accounts
router.get('/', async (req, res) => {
    const accounts = await db.accounts.findAll({include: [{
        model: db.proxies,
        as: 'proxyAccount'
    }]});
    res.render('accounts/index', {
        accounts,
        currentPage: '/accounts'

    });
});

// Display form for creating a new account
router.get('/new', (req, res) => {
    res.render('accounts/new',{
        currentPage: '/accounts'
    });
});

// Create a new account
router.post('/', async (req, res) => {
    const newAccount = req.body;
    await db.accounts.create(newAccount);
    res.redirect('/accounts');
});

// Display form for editing an account
router.get('/:id/edit', async (req, res) => {
    const account = await db.accounts.findByPk(req.params.id);
    const proxies = await db.proxies.findAll({where:{active:true}})
    res.render('accounts/edit', {
        account,
        proxies,
        currentPage: '/accounts'
    });
});

router.post('/:id/check', async (req, res) => {
    const id = req.params.id;
    const bodyId = req.body && req.body.id; // проверяем, что объект req.body существует и имеет свойство id
    const result = await Acc.check(bodyId || id);

    if (result == 200) {
        res.redirect(`/accounts`)
    } else {
        res.status(404);
        res.render('error', {
            message: result,
            error: {}
        });
    }
});

// Update an account
router.post('/:id', async (req, res) => {
    const updatedAccount = req.body;
    console.log(req.body);
    await db.accounts.update(updatedAccount, {
        where: {
            id: req.params.id
        }
    });
    res.redirect('/accounts');
});

router.get('/:id', async (req, res) => {
    const account = await db.accounts.findByPk(req.params.id,{include: [{
        model: db.proxies,
        as: 'proxyAccount',

    }]});
    console.log(account)

    res.render('accounts/show', {
        account,
        currentPage: '/accounts'
    });
});

// Delete an account
router.post('/:id/delete', async (req, res) => {
    console.log('delete account',req.params.id)
    await db.accounts.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/accounts');
});

module.exports = router;
