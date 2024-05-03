// Imports nécessaires
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TermsOfUse from './TermsOfUse';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';

// Création d'une instance de socket. Assurez-vous que l'adresse correspond à celle de votre serveur
const socket = io('https://murdeverite.fr');

function App() {
  const [messages, setMessages] = useState([]); 
  const [churches, setChurches] = useState(new Set());
  const [selectedChurch, setSelectedChurch] = useState('');
  const [openMessageId, setOpenMessageId] = useState(null);

  // Récupération initiale des messages du serveur
  useEffect(() => {
    axios.get('https://murdeverite.fr/api/messages')
      .then((response) => {
        //console.log(response.data);
        //setMessages(response.data);
        const sortedMessages = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMessages(sortedMessages);
        const churchesSet = new Set(response.data.map(message => message.church.toLowerCase()));
        setChurches(churchesSet);
      })
      .catch((error) => console.error('Error fetching messages:', error));


      socket.on('new-message', (newMessage) => {
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        setChurches(prevChurches => new Set([...prevChurches, newMessage.church.toLowerCase()]));
      });
      

    socket.on('new-comment', (newComment) => {
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === newComment.message_id ? {...message, comments: [...message.comments, newComment]} : message
        )
      );
    });

    // Nettoyage des écouteurs à la désinscription du composant
    return () => {
      socket.off('new-message');
      socket.off('new-comment');
    };
  }, []);

  const handleChurchChange = (e) => {
    setSelectedChurch(e.target.value);
  };

  const handleSubmit = async (formData) => {
    try {
      const { data: newMessage } = await axios.post('https://murdeverite.fr/api/messages', formData);
      setMessages([newMessage, ...messages]);
      setChurches(new Set([...churches, formData.church.toLowerCase()]));
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const handleCommentSubmit = async (commentData, messageId) => {
    try {
      await axios.post(`https://murdeverite.fr/api/messages/${messageId}/comments`, commentData);
      // Ici, l'actualisation des commentaires se fera via socket.io
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (messageId) => {
    setOpenMessageId(openMessageId === messageId ? null : messageId);
  };

  const filteredMessages = selectedChurch
    ? messages.filter(message => message.church.toLowerCase() === selectedChurch.toLowerCase())
    : messages;

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <>
              <h1>Mur de vérités</h1>
              <div className="church-filter-container">
                <label htmlFor="churchFilter">Filtrer par église :</label>
                <select id="churchFilter" value={selectedChurch} onChange={handleChurchChange}>
                  <option value="">Toutes les églises</option>
                  {[...churches].map((church, index) => (
                    <option key={index} value={church}>{church}</option>
                  ))}
                </select>
              </div>
              <AddMessageForm onSubmit={handleSubmit} />
              <div className="messages">
                {filteredMessages && filteredMessages.map(message => (
                message.text && message.pseudo && <MessageList
                  key={message.id || message.text} // Utilisez un fallback si id est null
                  message={message}
                  onCommentSubmit={handleCommentSubmit}
                  toggleComments={toggleComments}
                  isOpen={openMessageId === message.id}
                />
               ))}
              </div>
            </>
          } />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `Ajouté le ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


// Reste de votre code pour Footer, AddMessageForm, et MessageList...


function Footer() {
  const currentYear = new Date().getFullYear(); // Obtenez l'année courante

  return (
    <footer className="footer">
      <p>Tous droits réservés &copy; {currentYear} | WEY & Sudobe</p>
      <Link to="/terms-of-use">Conditions d'Utilisation</Link>

    </footer>
  );
}

function AddMessageForm({ onSubmit }) {
  const [formData, setFormData] = useState({ text: '', pseudo: '', church: '' });
  const maxMessageLength = 400;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.text.trim() === '' || formData.pseudo.trim() === '' || formData.church.trim() === '') return;
    onSubmit(formData);
    setFormData({ text: '', pseudo: '', church: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input
        type="text"
        name="text"
        value={formData.text}
        onChange={handleInputChange}
        placeholder="Écrivez votre vérité ici"
        maxLength={maxMessageLength} // Limite à 400 caractères pour le message
      />
      <div className="input-row">
        <input
          type="text"
          name="pseudo"
          value={formData.pseudo}
          onChange={handleInputChange}
          placeholder="Votre pseudo"
          maxLength="12" // Limite à 12 caractères pour le nom de l'église
        />
        <input
          type="text"
          name="church"
          value={formData.church}
          onChange={handleInputChange}
          placeholder="Nom de l'église"
          maxLength="20" // Limite à 12 caractères pour le nom de l'église
        />
      </div>
      <button type="submit">Ajouter une vérité</button>
    </form>
  );
}

function MessageList({ message, onCommentSubmit, toggleComments, isOpen }) {
  const [commentData, setCommentData] = useState({ text: '', pseudo: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommentData({ ...commentData, [name]: value });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentData.text.trim() !== '' && commentData.pseudo.trim() !== '') {
      onCommentSubmit({ ...commentData, date: new Date().toLocaleString() }, message.id);
      setCommentData({ text: '', pseudo: '' });
    }
  };

  return (
    <div className="message-container">
      <div className="message-content">
      <p><strong>{message.pseudo} ({message.church}) :</strong> {message.text}</p>
      <p className="date">{formatDate(message.date)}</p>
        <button onClick={() => toggleComments(message.id)}>
          {message.comments.length} Commentaire(s)
        </button>
      </div>

      {isOpen && (
        <div className="comments-panel">
          {message.comments.map((comment, index) => (
            <p key={comment.id}><strong>{comment.pseudo}:</strong> {comment.text}</p>
          ))}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              name="text"
              value={commentData.text}
              onChange={handleInputChange}
              placeholder="Votre commentaire..."
            />
            <input
              type="text"
              name="pseudo"
              value={commentData.pseudo}
              onChange={handleInputChange}
              placeholder="Votre pseudo"
            />
            <button type="submit">Publier</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;