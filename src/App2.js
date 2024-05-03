// Code source de l'application
//créé par WEY et Sudobe
//Date de création: 02/04/2024

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TermsOfUse from './TermsOfUse';
import './App.css';


function App() {
  const [messages, setMessages] = useState([]); 
  const [churches, setChurches] = useState(new Set());
  const [selectedChurch, setSelectedChurch] = useState('');
  const [openMessageId, setOpenMessageId] = useState(null);
 
  
  const handleSubmit = (formData) => {
    const newMessage = {
      id: Date.now(),
      text: formData.text,
      pseudo: formData.pseudo,
      church: formData.church.toLowerCase(),
      date: new Date().toLocaleString(),
      comments: [],
    };
    setMessages([newMessage, ...messages]);
    setChurches(new Set([...churches, newMessage.church]));
  };

  const handleChurchChange = (e) => {
    setSelectedChurch(e.target.value);
  };

  const handleCommentSubmit = (comment, messageId) => {
    const updatedMessages = messages.map((message) => {
      if (message.id === messageId) {
        return {
          ...message,
          comments: [...message.comments, { ...comment, id: Date.now(), reports: 0 }],
        };
      }
      return message;
    });
    setMessages(updatedMessages);
    setOpenMessageId(null); // Fermer le panneau de commentaires après la soumission
  };

  const toggleComments = (messageId) => {
    if (openMessageId === messageId) {
      setOpenMessageId(null);
    } else {
      setOpenMessageId(messageId);
    }
  };

  const filteredMessages = selectedChurch
    ? messages.filter(message => message.church === selectedChurch.toLowerCase())
    : messages;

    return (
      <Router>
        <div className="App">
          <Routes>
            {/* Définir la route pour la page d'accueil */}
            <Route path="/" element={
              <>
                <h1>Mur de vérités</h1>
                <h4>Tu ne porteras point de faux témoignage contre ton prochain. (Exode 20.16)</h4>
                {/* ... Autres composants de la page d'accueil ... */}
                <div className="church-filter-container">
                  <label htmlFor="churchFilter">Filtrer par église : </label>
                  <select id="churchFilter" value={selectedChurch} onChange={handleChurchChange}>
                    <option value="">Toutes les églises</option>
                    {[...churches].map((church, index) => (
                      <option key={index} value={church}>{church}</option>
                    ))}
                  </select>
                </div>
                <AddMessageForm onSubmit={handleSubmit} />
                <div className="messages">
                  {filteredMessages.map((message) => (
                    <Message
                      key={message.id}
                      message={message}
                      onCommentSubmit={handleCommentSubmit}
                      toggleComments={toggleComments}
                      isOpen={openMessageId === message.id}
                    />
                  ))}
                </div>
              </>
            } />
            {/* Définir la route pour les conditions d'utilisation */}
            <Route path="/terms-of-use" element={<TermsOfUse />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    );
  }

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

function Message({ message, onCommentSubmit, toggleComments, isOpen }) {
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
        <p className="date">Ajouté le {message.date}</p>
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