import React from 'react';
import { Bell } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import './ChatBubbleIcon.css';

export function ChatBubbleIcon() {
  const { toggleChat, showNotification, dismissNotification } = useChatContext();

  const handleBubbleClick = () => {
    toggleChat();
  };

  const handleNotificationClick = (e) => {
    e.stopPropagation();
    dismissNotification();
  };

  return (
    <div className="chat-bubble-container">
      {/* Notificación flotante */}
      {showNotification && (
        <div className="notification-popup">
          <button 
            className="notification-close" 
            onClick={handleNotificationClick}
            aria-label="Cerrar notificación"
          >
            ×
          </button>
          <p className="notification-text">¿Necesitas ayuda?</p>
        </div>
      )}

      {/* Icono robot flotante */}
      <button
        className="chat-bubble"
        onClick={handleBubbleClick}
        aria-label="Abrir chat de asistente"
        title="Asistente de IA"
      >
        <img src="/robot.png" alt="Asistente Bot" className="chat-bubble-robot" />
        
        {/* Badge de notificación */}
        {showNotification && <div className="notification-badge" />}
      </button>
    </div>
  );
}
