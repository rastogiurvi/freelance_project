const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
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
        title: {
            type: String,
            required: true   
        },
        description: {
            type: String,
            required: false
        },
        dueDate: {
            type: Date,
            required: false  
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],  
            default: 'Medium' 
        },
        status: {
            type: String,
            enum: ['To-Do', 'In Progress', 'Done'],
            default: 'To-Do' 
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', TaskSchema);