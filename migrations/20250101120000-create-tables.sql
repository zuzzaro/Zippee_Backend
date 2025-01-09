   CREATE TABLE partners (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     partner_id INT NULL REFERENCES partners(id),
     role  VARCHAR(10) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 CREATE TABLE viaggi (
      id SERIAL PRIMARY KEY,
     partner_id INT NOT NULL REFERENCES partners(id),
      num_persone INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 
CREATE TABLE tratte (
     id SERIAL PRIMARY KEY,
     viaggio_id INT NOT NULL REFERENCES viaggi(id),
     tipo_tratta VARCHAR(10) NOT NULL,
     mezzo_trasporto VARCHAR(20) NOT NULL,
     citta_partenza VARCHAR(255) NOT NULL,
     citta_arrivo VARCHAR(255) NOT NULL,
     data_partenza DATE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 CREATE TABLE compensazioni (
     id SERIAL PRIMARY KEY,
     viaggio_id INT NOT NULL REFERENCES viaggi(id),
     data_compensazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     costo_totale DECIMAL(10, 2) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 CREATE TABLE certificati (
     id SERIAL PRIMARY KEY,
     compensazione_id INT NOT NULL REFERENCES compensazioni(id),
     codice VARCHAR(255) UNIQUE NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );

 CREATE TABLE tariffe (
     id SERIAL PRIMARY KEY,
     data_inizio_validita DATE NOT NULL,
     data_fine_validita DATE NULL,
     costo_per_co2 DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 CREATE TABLE fattori_emissione(
     id SERIAL PRIMARY KEY,
     mezzo_trasporto VARCHAR(20) NOT NULL,
     fattore DECIMAL(10, 5) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 