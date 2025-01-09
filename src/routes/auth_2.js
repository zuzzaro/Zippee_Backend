// zippee-backend - File:src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Middleware per autenticare il token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Token mancante

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token non valido
        req.user = user; // Aggiunge i dati dell'utente alla richiesta
        next();
    });
};

// Endpoint per il login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se l'utente esiste
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // Verifica la password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

        // Genera il token JWT
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role }, // Payload
            process.env.JWT_SECRET, // Chiave segreta
            { expiresIn: '1h' } // Scadenza del token
        );

        // Restituisce il token
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
});

// Endpoint per il login del partner
router.post('/login-partner', async (req, res) => {
     try {
        const { email, password } = req.body;

        // Verifica se l'utente esiste nella tabella partner_users
        const partnerUser = await db.query('SELECT * FROM partner_users WHERE email = $1', [email]);
         if (partnerUser.rows.length === 0) {
            return res.status(401).json({ error: 'Credenziali non valide' });
         }
        // Verifica la password
        const validPassword = await bcrypt.compare(password, partnerUser.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenziali non valide' });
        }

       // Genera il token JWT
       const token = jwt.sign(
            { id: partnerUser.rows[0].id, role: "partner", partner_id:partnerUser.rows[0].partner_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Restituisce il token
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
});

// Endpoint per la registrazione di un nuovo utente (manager e admin)
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
      
        // Registrazione di un utente manager/admin
         // Verifica se l'utente esiste già nella tabella users
          const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
          if (existingUser.rows.length > 0) {
              return res.status(400).json({ error: 'Utente già esistente' });
          }

          // Hash della password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Crea un nuovo utente
          const newUser = await db.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, hashedPassword, role]
          );

          // Restituisce i dati dell'utente creato
          return res.status(201).json(newUser.rows[0]);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante la registrazione' });
    }
});


// Endpoint per aggiornare i dati dell'utente
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Recupera l'utente corrente
        const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // Hash della nuova password (se fornita)
        let hashedPassword = user.rows[0].password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Aggiorna i dati dell'utente
        const updatedUser = await db.query(
            'UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING id, email, role',
            [email || user.rows[0].email, hashedPassword, req.user.id]
        );

        // Restituisce i dati aggiornati
        res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'utente' });
    }
});

// Endpoint per ottenere i dati dell'utente corrente
router.get('/me', authenticateToken, async (req, res) => {
    try {
       let user;
       if(req.user.partner_id){
           user = await db.query('SELECT id, email, role FROM partner_users WHERE id = $1', [req.user.id]);
       } else {
           user = await db.query('SELECT id, email, role FROM users WHERE id = $1', [req.user.id]);
       }

        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Errore durante il recupero dei dati dell\'utente' });
    }
});

module.exports = router;