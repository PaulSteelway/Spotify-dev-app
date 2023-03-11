const express = require('express');
const router = express.Router();
const {
    Op
} = require('sequelize');

const db = require('../models');
const Task = db.tasks;
const Account = db.accounts;
const taskName = require('../src/taskName');
const taskController = require('../controller/tasks');
// Get all tasks
router.get('/', async (req, res) => {
    const tasks = await Task.findAll({
        include: [{
            model: Account,
            as: 'taskAccount'
        }]
    });
    res.render('tasks/index', {
        tasks,
        currentPage: '/tasks'
    });
});

// Display form for creating a new task
router.get('/new', async (req, res) => {
    const accounts = await Account.findAll({
        where: {
            token: {
                [Op.not]: null
            }
        }
    });
    res.render('tasks/new', {
        accounts,
        currentPage: '/tasks',
        taskName
    });
});

// Create a new task
router.post('/', async (req, res) => {
    const newTask = req.body;
    await Task.create(newTask);
    res.redirect('/tasks');
});

// Display form for editing a task
router.get('/:id/edit', async (req, res) => {
    const task = await Task.findByPk(req.params.id, {
        include: [{
            model: Account,
            as: 'taskAccount'
        }]
    });
    const accounts = await Account.findAll({
        where: {
            token: {
                [Op.not]: null
            }
        }
    });
    res.render('tasks/edit', {
        task,
        accounts,
        currentPage: '/tasks'
    });
});

// Update a task
router.post('/:id', async (req, res) => {
    const updatedTask = req.body;
    const task = await Task.update(updatedTask, {
        where: {
            id: req.params.id
        }
    });
    res.redirect('/tasks');
});

router.post('/:id/start', async (req, res) => {
    let request;
    const type = req.body.type;
    switch (type) {
        case 'Listening track':
            request = taskController.Get(req.params.id,'track')
            break;
        case 'Listening playlist':
            request = taskController.Get(req.params.id,'playlist')
            break;
        case 'Listening artist':
            request = taskController.Get(req.params.id,'artist')
            break;
        case 'Like track':
            request = taskController.like(req.params.id,'track')
            break;
        case 'Like playlists':
            request = taskController.like(req.params.id,'playlist')
            break;
        case 'Like artist':
            request = taskController.like(req.params.id,'artist')
            break;
    }
    res.redirect('/tasks')



});

// Delete a task
router.delete('/:id', async (req, res) => {
    await Task.destroy({
        where: {
            id: req.params.id
        }
    });
    res.redirect('/tasks');
});


module.exports = router;