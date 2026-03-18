const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');


router.get('/', auth, async (req, res) => {
    try {
    
        const tasks = await Task.find({ user: req.user })
            .populate('client', 'name email');

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/client/:clientId', auth, async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.user,
            client: req.params.clientId  
        }).populate('client', 'name email');

        res.status(200).json(tasks);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.post('/', auth, async (req, res) => {
    try {
        const { title, description, client, dueDate, priority, status } = req.body;

        const task = await Task.create({
            user: req.user,  
            title,
            description,
            client,
            dueDate,
            priority,
            status
        });

        res.status(201).json({
            message: 'Task created successfully!',
            task
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found!' });
        }

        res.status(200).json({
            message: 'Task updated successfully!',
            task
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },      
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ message: 'Task not found!' });
        }

        res.status(200).json({
            message: 'Task status updated!',
            task
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found!' });
        }

        res.status(200).json({ message: 'Task deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;