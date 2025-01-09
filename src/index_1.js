// src/index.js - v1

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partners');
// const tripRoutes = require('./routes/trips'); // Importa il router dei viaggi

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
// app.use('/api/trips', tripRoutes);

app.get('/', (req, res) => {
    res.send('Benvenuto nel Backend di Zippee!');
});

app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});