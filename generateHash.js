const bcrypt = require('bcrypt');
const password = 'password123'; // La password che vuoi hashare
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Errore durante la generazione dell\'hash:', err);
    } else {
        console.log('Password hashata:', hash);
    }
});