// zippee-backend - File src/index.js - v2

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partners');
// const tripRoutes = require('./routes/trips'); // Importa il router dei viaggi

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configura la cartella pubblica per i PDF
app.use('/pdf', express.static(path.join(__dirname, '..', 'public', 'pdf')));

// Endpoint per salvare il PDF
app.post('/api/save-pdf', async (req, res) => {
    const { fileName, pdfData } = req.body;

    try {
        // Verifica se la cartella esiste, altrimenti creala
        const pdfDir = path.join(__dirname, '..', 'public', 'pdf');
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        // Salva il PDF nella cartella pubblica
        const filePath = path.join(pdfDir, fileName);
        fs.writeFileSync(filePath, pdfData, 'base64');

        // Restituisce l'URL pubblico del PDF
        const pdfUrl = `${req.protocol}://${req.get('host')}/pdf/${fileName}`;
        res.json({ pdfUrl });
    } catch (error) {
        console.error('Errore durante il salvataggio del PDF:', error);
        res.status(500).json({ error: 'Errore durante il salvataggio del PDF' });
    }
});

// Route
app.use('/api/auth', authRoutes);
app.use('/api/partners', partnerRoutes);
// app.use('/api/trips', tripRoutes);

// Route principale
app.get('/', (req, res) => {
    res.send('Benvenuto nel Backend di Zippee!');
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});