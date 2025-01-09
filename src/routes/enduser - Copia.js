// zippee-backend - File src/routes/enduser.js - v1

const express = require('express');
const db = require('../db');
const router = express.Router();

// Endpoint pubblico per ottenere i dettagli di un viaggio
router.get('/api/enduser/trips/:tripId', async (req, res) => {
    try {
        const tripId = req.params.tripId;

        // Recupera i dettagli del viaggio e il nome dell'azienda
        const trip = await db.query(
            `SELECT
                v.id,
                v.partner_id,
                v.num_persone,
                v.created_at,
                v.eco_trip_code,
                v.carbon_cancelling_code,
                v.date_departure,
                v.return_date,
                p.company_name
            FROM
                viaggi v
            INNER JOIN
                partners p ON v.partner_id = p.id
            WHERE
                v.id = $1`,
            [tripId]
        );

        if (trip.rows.length === 0) {
            return res.status(404).json({ error: 'Viaggio non trovato' });
        }

        res.status(200).json(trip.rows[0]);
    } catch (error) {
        console.error('Errore durante il recupero dei dettagli del viaggio:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei dettagli del viaggio' });
    }
});

module.exports = router;