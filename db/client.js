const DB_NAME = "jo_tattoos";

const { Client } = require("pg"); //imports the pg module

const connectionString =
  process.env.DATABASE_URL || `postgres://localhost:5432/${DB_NAME}`;
//supply the db name and location of the db

const client = new Client({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

module.exports = client;
