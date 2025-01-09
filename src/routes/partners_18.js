// zippee-backend - File:src/routes/partners.js - v18

const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();

// Middleware per autenticare il token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        if (req.user.role !== 'partner' && req.user.role !== 'manager') {
            return res.sendStatus(403);
        }
       next();
    });
};

// Middleware per verificare che l'utente sia un manager
const authenticateManager = (req, res, next) => {
    console.log('Ruolo utente:', req.user.role); // Log di debug
    if (req.user.role !== 'manager') {
        return res.sendStatus(403);
    }
    next();
};

// IMPORTANTE: L'endpoint /me deve essere definito PRIMA dell'endpoint /:id
// Endpoint per ottenere i dati del partner loggato (per partner)
router.get('/me', authenticateToken, async (req, res) => {
     try {
         if (req.user.role !== 'partner') {
             return res.status(403).json({ error: 'Access denied. Partner role required.' });
         }
         
         //estraggo l'id del partner dal token
        const partnerId = req.user.partner_id;

        // Verifica se il partner esiste
        const partner = await db.query('SELECT * FROM partners WHERE id = $1', [partnerId]);
         if (partner.rows.length === 0) {
              return res.status(404).json({ error: 'Partner not found' });
         }
         // Restituisci i dati del partner
       res.status(200).json(partner.rows[0]);
    } catch (error) {
         console.error(error);
       res.status(500).json({ error: 'Get partner failed' });
    }
});

// Endpoint per ottenere tutti i partner (per manager)
router.get('/', authenticateToken, authenticateManager, async (req, res) => {
    try {
          const partners = await db.query(`
            SELECT
                p.id,
                p.name,
		p.company_name,
                pu.email
            FROM
                partners p
            INNER JOIN
                partner_users pu ON p.id = pu.partner_id
            WHERE
                pu.role = 'partner_admin'
        `);
        res.status(200).json(partners.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Get partners failed' });
    }
});


// Endpoint per ottenere tutti i viaggi (solo per manager)
router.get('/trips', authenticateToken, authenticateManager, async (req, res) => {
    try {
//        console.log('Richiesta ricevuta per ottenere tutti i viaggi'); // Log di debug

        const query = `
            SELECT
                v.id,
                v.partner_id,
                v.num_persone,
                v.created_at,
                v.eco_trip_code,
                v.carbon_cancelling_code
            FROM
                viaggi v
            INNER JOIN
                partners p ON v.partner_id = p.id
        `;

//        console.log('Query SQL:', query); // Log di debug

        const trips = await db.query(query);

//        console.log('Dati recuperati dal database:', trips.rows); // Log di debug

        res.status(200).json(trips.rows);
    } catch (error) {
        console.error('Errore durante il recupero dei viaggi:', error); // Log di debug
        res.status(500).json({ error: 'Errore durante il recupero dei viaggi' });
    }
});


// Endpoint per ottenere un singolo partner tramite ID (per manager)
router.get('/:id', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await db.query('SELECT * FROM partners WHERE id = $1', [id]);
        if (partner.rows.length === 0) {
            return res.status(404).json({ error: 'Partner not found' });
        }
        res.status(200).json(partner.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Get partner failed' });
    }
});

// Endpoint per creare un nuovo partner
router.post('/', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { name, email, password, companyName, address, phoneNumber, userName, managerMessage } = req.body;

        // Verifica se l'email è già registrata (nella tabella partner_users)
        const existingPartnerUser = await db.query('SELECT * FROM partner_users WHERE email = $1', [email]);
        if (existingPartnerUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Crea un nuovo partner
        const newPartner = await db.query(
            'INSERT INTO partners (name, company_name, address, phone_number, user_name, manager_message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, created_at, manager_message',
            [name, companyName, address, phoneNumber, userName, managerMessage]
        );

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea un nuovo utente partner associato al partner creato
        const newPartnerUser = await db.query(
            'INSERT INTO partner_users (email, password, role, partner_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role, partner_id',
            [email, hashedPassword, "partner_admin", newPartner.rows[0].id]
        );

        res.status(201).json({
             id: newPartner.rows[0].id,
            name: newPartner.rows[0].name,
            created_at: newPartner.rows[0].created_at,
             managerMessage : newPartner.rows[0].manager_message,
             partnerUser: newPartnerUser.rows[0]
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Endpoint per aggiornare un partner esistente
router.put('/:id', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, companyName, address, phoneNumber, fixedPrice, fixedPriceDescription, managerMessage, email, password } = req.body;

        // Verifica se il partner esiste
        const existingPartner = await db.query('SELECT * FROM partners WHERE id = $1', [id]);
        if (existingPartner.rows.length === 0) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Hash della nuova password (se fornita)
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
            // Aggiorna la password dell'utente partner
            await db.query(
                'UPDATE partner_users SET password = $1 WHERE partner_id = $2',
                [hashedPassword, id]
            );
        }

        // Aggiorna il partner
        const updatePartner = await db.query(
            'UPDATE partners SET name = $1, company_name = $2, address = $3, phone_number = $4, fixed_price = $5, fixed_price_description = $6, manager_message = $7 WHERE id = $8 RETURNING id, name, company_name, address, phone_number, created_at, fixed_price, fixed_price_description, manager_message',
            [name || existingPartner.rows[0].name,
            companyName || existingPartner.rows[0].company_name,
            address || existingPartner.rows[0].address,
            phoneNumber || existingPartner.rows[0].phone_number,
            fixedPrice || existingPartner.rows[0].fixed_price,
            fixedPriceDescription || existingPartner.rows[0].fixed_price_description,
            managerMessage || existingPartner.rows[0].manager_message,
            id]
        );

        if(email) {
            //recupero l'email dell'utente partner
            const partnerUser = await db.query('SELECT * FROM partner_users WHERE partner_id = $1', [id]);
            if (partnerUser.rows.length === 0) {
                return res.status(404).json({ error: 'Partner not found' });
            }
            // Aggiorno la email
            await db.query(
                'UPDATE partner_users SET email = $1 WHERE partner_id = $2',
                [email || partnerUser.rows[0].email, id]
            );
        }

        res.status(200).json(updatePartner.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Update partner failed' });
    }
});

// Endpoint per aggiornare la password di un partner
router.put('/:id/password', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Verifica se il partner esiste
        const existingPartnerUser = await db.query('SELECT * FROM partner_users WHERE partner_id = $1', [id]);
        if (existingPartnerUser.rows.length === 0) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Hash della password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Aggiorna la password
        await db.query(
            'UPDATE partner_users SET password = $1 WHERE partner_id = $2',
            [hashedPassword, id]
        );

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Update password failed' });
    }
});

// Endpoint per eliminare un partner
router.delete('/:id', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se il partner esiste
        const existingPartner = await db.query('SELECT * FROM partners WHERE id = $1', [id]);
        if (existingPartner.rows.length === 0) {
            return res.status(404).json({ error: 'Partner not found' });
        }

        // Elimina il partner
        await db.query(
            'DELETE FROM partner_users WHERE partner_id = $1',
            [id]
        );

        const deletePartner = await db.query(
            'DELETE FROM partners WHERE id = $1 RETURNING id, name, created_at',
            [id]
        );
        res.status(200).json(deletePartner.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Delete partner failed' });
    }
});

// Endpoint per creare un nuovo viaggio
router.post('/:id/trips', authenticateToken, async (req, res) => {
    try {
        const { numPersone, date_of_stay, eco_trip_code } = req.body; // Include i nuovi campi
        const partnerId = req.params.id;

        // Verifica che l'utente loggato sia il partner corretto
        if (req.user.partner_id !== parseInt(partnerId, 10)) {
            return res.status(403).json({ error: 'Accesso negato' });
        }

        // Inserisci i dati nella tabella viaggi
        const newTrip = await db.query(
            `INSERT INTO viaggi (partner_id, num_persone, created_at, return_date, eco_trip_code)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [partnerId, numPersone, new Date().toISOString(), date_of_stay, eco_trip_code]
        );

        res.status(201).json(newTrip.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la creazione del viaggio' });
    }
});

// Endpoint per ottenere tutti i viaggi di un partner (accessibile solo ai partner)
router.get('/:id/trips', authenticateToken, async (req, res) => {
    try {
        const partnerId = req.params.id; // Ottieni l'ID del partner dall'URL

        // Verifica che l'utente loggato sia il partner corretto
        if (req.user.partner_id !== parseInt(partnerId, 10)) {
            return res.status(403).json({ error: 'Accesso negato' });
        }

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

// Endpoint per ottenere i dettagli di un singolo viaggio (accessibile solo ai manager)
router.get('/trips/:tripId', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { tripId } = req.params;

        // Recupera i dettagli del viaggio
        const trip = await db.query(
            `SELECT
                v.id,
                v.partner_id,
                v.num_persone,
                v.created_at,
                v.eco_trip_code,
                v.carbon_cancelling_code,
                v.date_departure,
                v.return_date
            FROM
                viaggi v
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

// Endpoint per aggiornare il Carbon Cancelling Code di un viaggio
router.put('/trips/:tripId/update-carbon-cancelling', authenticateToken, authenticateManager, async (req, res) => {
    try {
        const { tripId } = req.params;
        const { carbon_cancelling_code } = req.body;

        // Aggiorna il Carbon Cancelling Code
        const updatedTrip = await db.query(
            'UPDATE viaggi SET carbon_cancelling_code = $1 WHERE id = $2 RETURNING *',
            [carbon_cancelling_code, tripId]
        );

        if (updatedTrip.rows.length === 0) {
            return res.status(404).json({ error: 'Viaggio non trovato' });
        }

        res.status(200).json(updatedTrip.rows[0]);
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del Carbon Cancelling Code:', error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento del Carbon Cancelling Code' });
    }
});

module.exports = router;
