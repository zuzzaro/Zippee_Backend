// zippee-backend - File:migrations/20250102000000-update-database-schema.js
module.exports = {
  up: async ({ sql }) => {
    console.log('Creating partners_users table...');

    await sql`
      -- Rimozione delle colonne email e password dalla tabella partners
      ALTER TABLE partners
      DROP COLUMN IF EXISTS email,
      DROP COLUMN IF EXISTS password;

      -- Creazione della tabella partner_users
      CREATE TABLE partner_users (
          id SERIAL PRIMARY KEY,
          partner_id INT NOT NULL REFERENCES partners(id),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('partners_users table created!');
  },
    down: async ({ sql }) => {
      console.log('Dropping partners_users table...');

    await sql`
    -- Rimozione della tabella partners_users
        DROP TABLE IF EXISTS partner_users;

       -- Ripristino delle colonne email e password dalla tabella partners
      ALTER TABLE partners
      ADD COLUMN email VARCHAR(255) UNIQUE,
      ADD COLUMN password VARCHAR(255);
    `;
    console.log('partners_users table dropped!');
  },
};