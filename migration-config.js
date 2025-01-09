// zippee-backend - File:migration-config.js
module.exports = {
  database: {
    connectionString: process.env.DATABASE_URL,
  },
  migrationsDir: "./migrations",
};