import React, { useRef, useEffect, useState } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { WHATSAPP_LINK } from '../config/aiConfig';
import './AIChatModal.css';

export function AIChatModal() {
  const { isOpen, closeChat, messages, sendMessage, isLoading } = useChatContext();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input cuando abre el modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      await sendMessage(inputValue);
      setInputValue('');
      // Re-focus en input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div className="chat-modal-overlay" onClick={closeChat} />

      {/* Modal del chat */}
      <div className="chat-modal">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-content">
            <h2 className="chat-title">Asistente Virtual</h2>
            <p className="chat-subtitle">¿Cómo podemos ayudarte?</p>
          </div>
          <button
            className="close-button"
            onClick={closeChat}
            aria-label="Cerrar chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Área de mensajes */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role}-message ${
                message.isError ? 'error-message' : ''
              }`}
            >
              <div className="message-content">
                {message.content}
                {/* Buscar y convertir links a WhatsApp en clickeables */}
                {message.content.includes('wa.me') && (
                  <div className="message-actions">
                    <a
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-button"
                    >
                      📱 Contactar por WhatsApp
                    </a>
                  </div>
                )}
              </div>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString('es-PE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          ))}

          {/* Indicador de carga */}
          {isLoading && (
            <div className="message assistant-message loading-message">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              maxLength={500}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Enviar mensaje"
            >
              {isLoading ? (
                <Loader size={18} className="spinner" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <div className="input-hint">
            {inputValue.length > 0 && (
              <span className="char-count">{inputValue.length}/500</span>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
