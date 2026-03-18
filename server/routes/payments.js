const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const auth = require('../middleware/auth');


router.get('/', auth, async (req, res) => {
    try {
        // get all payments with client details
        const payments = await Payment.find({ user: req.user })
            .populate('client', 'name email')
            .populate('task', 'title');

        res.status(200).json(payments);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/client/:clientId', auth, async (req, res) => {
    try {
        const payments = await Payment.find({
            user: req.user,
            client: req.params.clientId
        })
            .populate('client', 'name email')
            .populate('task', 'title');

        res.status(200).json(payments);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.get('/summary', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user });

       
        const summary = {
            totalEarned: 0,
            totalPending: 0,
            totalOverdue: 0
        };

        payments.forEach(payment => {
            if (payment.status === 'Paid') {
                summary.totalEarned += payment.amount;
            } else if (payment.status === 'Pending') {
                summary.totalPending += payment.amount;
            } else if (payment.status === 'Overdue') {
                summary.totalOverdue += payment.amount;
            }
        });

        res.status(200).json(summary);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.post('/', auth, async (req, res) => {
    try {
        const { amount, client, task, status, description, date } = req.body;

        const payment = await Payment.create({
            user: req.user,  
            amount,
            client,
            task,
            status,
            description,
            date
        });

        res.status(201).json({
            message: 'Payment recorded successfully!',
            payment
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },     
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found!' });
        }

        res.status(200).json({
            message: 'Payment status updated!',
            payment
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.put('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found!' });
        }

        res.status(200).json({
            message: 'Payment updated successfully!',
            payment
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findByIdAndDelete(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found!' });
        }

        res.status(200).json({ message: 'Payment deleted successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;