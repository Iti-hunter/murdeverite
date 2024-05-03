const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connection = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Permettre à toutes les origines
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Route pour créer un nouveau message
app.post('/api/messages', (req, res) => {
  const { text, pseudo, church } = req.body;
  const query = 'INSERT INTO messages (text, pseudo, church) VALUES (?, ?, ?)';

  connection.executeQuery(query, [text, pseudo, church], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    const newMessage = { id: result.insertId, text, pseudo, church, comments: [] };
    io.emit('new-message', newMessage);
    res.status(201).json(newMessage);
  });
});

// Route pour créer un nouveau commentaire
app.post('/api/messages/:id/comments', (req, res) => {
  const { text, pseudo } = req.body;
  const messageId = req.params.id;
  const query = 'INSERT INTO comments (text, pseudo, message_id) VALUES (?, ?, ?)';

  connection.executeQuery(query, [text, pseudo, messageId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }
    const newComment = { id: result.insertId, text, pseudo, message_id: messageId };
    io.emit('new-comment', newComment);
    res.status(201).json(newComment);
  });
});

// Route pour récupérer tous les messages et leurs commentaires associés
app.get('/api/messages', async (req, res) => {
  const queryMessages = 'SELECT * FROM messages';
  const queryComments = 'SELECT * FROM comments';
  try {
    const messagesResults = await new Promise((resolve, reject) => {
      connection.executeQuery(queryMessages, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const commentsResults = await new Promise((resolve, reject) => {
      connection.executeQuery(queryComments, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const messages = messagesResults.map(msg => ({
      ...msg,
      comments: commentsResults.filter(comment => comment.message_id === msg.id)
    }));

    res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});