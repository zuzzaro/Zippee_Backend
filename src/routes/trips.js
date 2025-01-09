// zippee-backend - File:src/routes/trips.js - v2

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

// Endpoint per ottenere i dettagli di un singolo viaggio
router.get('/api/trips/:tripId', authenticateToken, async (req, res) => {
    try {
        const tripId = req.params.tripId; // Ottieni l'ID del viaggio dall'URL
        const partnerId = req.user.partner_id; // Ottieni l'ID del partner dal token JWT

        // Recupera i dettagli del viaggio
        const trip = await db.query(
            'SELECT * FROM viaggi WHERE id = $1 AND partner_id = $2',
            [tripId, partnerId]
        );

        if (trip.rows.length === 0) {
            return res.status(404).json({ error: 'Viaggio non trovato' });
        }

        res.status(200).json(trip.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei dettagli del viaggio' });
    }
});

module.exports = router;