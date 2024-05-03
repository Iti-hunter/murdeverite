const mysql = require('mysql');
require("dotenv").config();
let connection;

function connectToDatabase() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  connection.connect((err) => {
    if (err) {
      console.error('Erreur lors de la connexion à la base de données:', err);
      setTimeout(connectToDatabase, 2000);
    } else {
      console.log('Connecté à la base de données!');
    }
  });

  connection.on('error', (err) => {
    if (['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR'].includes(err.code)) {
      connectToDatabase();
    } else {
      throw err;
    }
  });
}

connectToDatabase();

function executeQuery(sql, callback) {
  // Assurez-vous que la connexion est établie avant de tenter d'exécuter une requête
  if (connection && connection.state !== 'disconnected') {
    connection.query(sql, callback);
  } else {
    // Reconnectez ou gérez l'erreur de connexion manquante ici
    console.log("En attente de la connexion à la base de données...");
    setTimeout(() => executeQuery(sql, callback), 1000); // Réessayer après un délai
  }
}

module.exports = { executeQuery };