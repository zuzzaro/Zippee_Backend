// routes/trips.js
const express = require('express');
const db = require('../db');
const authenticateToken = require('./middleware/authenticateToken'); // Middleware per l'autenticazione
const router = express.Router();

// Endpoint per creare un nuovo viaggio
router.post('/api/trips', authenticateToken, async (req, res) => {
    try {
        const { numPersone } = req.body;
        const partnerId = req.user.partner_id; // Ottieni l'ID del partner dal token JWT

        // Inserisci i dati nella tabella viaggi
        const newTrip = await db.query(
            'INSERT INTO viaggi (partner_id, num_persone, created_at) VALUES ($1, $2, $3) RETURNING *',
            [partnerId, numPersone, new Date().toISOString()]
        );

        res.status(201).json(newTrip.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la creazione del viaggio' });
    }
});

// Endpoint per ottenere tutti i viaggi di un partner
router.get('/api/trips', authenticateToken, async (req, res) => {
    try {
        const partnerId = req.user.partner_id; // Ottieni l'ID del partner dal token JWT

        // Recupera i viaggi del partner
        const trips = await db.query(
            'SELECT * FROM viaggi WHERE partner_id = $1',
            [partnerId]
        );

        res.status(200).json(trips.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei viaggi' });
    }
});

module.exports = router;