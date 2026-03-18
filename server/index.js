const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());



app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/payments', require('./routes/payments'));


// Test route
app.get('/', (req, res) => {
    res.send('Freelancer Platform Server is Running!');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
