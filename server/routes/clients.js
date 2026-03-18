const express = require('express');
const router = express.Router();
const Client = require('../models/client');
const auth = require('../middleware/auth');


router.get('/', auth, async (req, res) => {
    try {
       
        const clients = await Client.find({ user: req.user });
        res.status(200).json(clients);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        
        const client = await Client.create({
            user: req.user,   
            name,
            email,
            phone,
            address
        });

        res.status(201).json({
            message: 'Client added successfully!',
            client
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(
            req.params.id, 
            req.body,     
            { new: true } 
        );

        if (!client) {
            return res.status(404).json({ message: 'Client not found!' });
        }

        res.status(200).json({
            message: 'Client updated successfully!',
            client
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found!' });
        }

        res.status(200).json({ message: 'Client deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;