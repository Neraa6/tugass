const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
connectDB();


const app = express();

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const financeRoutes = require('./routes/financeRoutes');

// Gunakan rute API
 app.use('/api/users', userRoutes);
app.use('/api/finances', financeRoutes);


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));