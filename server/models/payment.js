const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true    
        },
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true    
        },
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: false  
        },
        amount: {
            type: Number,
            required: true    
        },
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Overdue'],
            default: 'Pending' 
        },
        description: {
            type: String,
            required: false   
        },
        date: {
            type: Date,
            default: Date.now  
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Payment', PaymentSchema);