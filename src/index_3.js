// zippee-backend - File src/index.js - v3
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const partnerRoutes = require('./routes/partners');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

// Middleware di autenticazione
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Aumentato il limite per gestire PDF più grandi

// Configura la cartella pubblica per i PDF
app.use('/pdf', express.static(path.join(__dirname, '..', 'public', 'pdf')));

// Endpoint per salvare il PDF (ora con autenticazione)
app.post('/api/save-pdf', authenticateToken, async (req, res) => {
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

// Route principale
app.get('/', (req, res) => {
    res.send('Benvenuto nel Backend di Zippee!');
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});
