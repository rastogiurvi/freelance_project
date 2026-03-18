const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true    
        },
        name: {
            type: String,
            required: true   
        },
        email: {
            type: String,
            required: true    
        },
        phone: {
            type: String,
            required: false   
        },
        address: {
            type: String,
            required: false  
        }
    },
    {
        timestamps: true   
    }
);

module.exports = mongoose.model('Client', ClientSchema);