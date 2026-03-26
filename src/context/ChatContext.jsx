import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendMessageToDeepseek } from '../services/aiService';
import { getChatHistoryKey } from '../utils/deviceId';

const ChatContext = createContext();

function normalizeAssistantResponse(content) {
  if (!content) return '';

  let normalized = String(content).replace(/\r\n/g, '\n').trim();
  const emojiToken = /^(?:📌|⚖️|📄|⏱️|💼|📋|✅)$/;
  const endsWithAllowedEmoji = /(?:📌|⚖️|📄|⏱️|💼|📋|✅)$/;

  // Limpieza ligera de markdown para que no aparezcan símbolos innecesarios.
  normalized = normalized
    .replace(/###\s*/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '');

  // Separadores de secciones comunes.
  normalized = normalized
    .replace(/\s+(Pasos principales)\s+/gi, '\n\n$1\n\n')
    .replace(/\s+(Documentos necesarios\s*[📄]?)\s+/gi, '\n\n$1\n\n')
    .replace(/\s+(Informaci[oó]n importante\s*[📋]?)\s+/gi, '\n\n$1\n\n')
    .replace(/\s+(Plazos importantes\s*[⏱️]?)\s+/gi, '\n\n$1\n\n');

  // Encabezados más consistentes con emoji lógico.
  normalized = normalized
    .replace(/^Documentos necesarios\s*$/gim, 'Documentos necesarios 📄')
    .replace(/^Plazos importantes\s*$/gim, 'Plazos importantes ⏱️')
    .replace(/^Informaci[oó]n importante\s*$/gim, 'Información importante 📋');

  // Saltos de línea antes de enumerados y viñetas cuando vengan todo en una línea.
  normalized = normalized
    .replace(/\s(\d+\.\s)/g, '\n\n$1')
    .replace(/\s([•-]\s)/g, '\n$1');

  // Si el emoji llega en una línea aparte, moverlo al título anterior.
  const lines = normalized.split('\n');
  const mergedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (emojiToken.test(trimmed)) {
      let prevIndex = mergedLines.length - 1;
      while (prevIndex >= 0 && mergedLines[prevIndex].trim() === '') {
        prevIndex -= 1;
      }

      if (prevIndex >= 0 && !endsWithAllowedEmoji.test(mergedLines[prevIndex].trim())) {
        mergedLines[prevIndex] = `${mergedLines[prevIndex].trim()} ${trimmed}`;
      }

      continue;
    }

    mergedLines.push(line);
  }

  // Limpieza de encabezados intercalados/duplicados dentro de listas numeradas.
  const cleanLines = [];
  const isHeaderLine = (line) => /^(Pasos principales|Documentos necesarios(?:\s*📄)?|Informaci[oó]n importante(?:\s*📋)?|Plazos importantes(?:\s*⏱️)?)$/i.test(line.trim());
  const isNumberedLine = (line) => /^\d+\.\s+/.test(line.trim());
  const headerPlain = (line) => line.replace(/[📄📋⏱️]/g, '').trim().toLowerCase();

  for (let i = 0; i < mergedLines.length; i += 1) {
    const current = mergedLines[i];
    const currentTrim = current.trim();

    if (!currentTrim) {
      cleanLines.push(current);
      continue;
    }

    if (isHeaderLine(currentTrim)) {
      let prevIndex = cleanLines.length - 1;
      while (prevIndex >= 0 && cleanLines[prevIndex].trim() === '') prevIndex -= 1;

      let nextIndex = i + 1;
      while (nextIndex < mergedLines.length && mergedLines[nextIndex].trim() === '') nextIndex += 1;

      const prevLine = prevIndex >= 0 ? cleanLines[prevIndex].trim() : '';
      const nextLine = nextIndex < mergedLines.length ? mergedLines[nextIndex].trim() : '';

      // Caso típico de encabezado colado entre dos pasos numerados: se elimina.
      if (isNumberedLine(prevLine) && isNumberedLine(nextLine)) {
        // Mejora opcional: si el paso quedó cortado en "2. Reunir", completar con "documentos necesarios".
        if (/^\d+\.\s+reunir$/i.test(prevLine) && headerPlain(currentTrim).startsWith('documentos necesarios')) {
          cleanLines[prevIndex] = `${prevLine} documentos necesarios`;
        }
        continue;
      }

      // Evitar encabezados repetidos consecutivos o idénticos cercanos.
      if (prevIndex >= 0 && isHeaderLine(prevLine) && headerPlain(prevLine) === headerPlain(currentTrim)) {
        continue;
      }
    }

    cleanLines.push(current);
  }

  normalized = cleanLines.join('\n');

  // Evitar exceso de líneas en blanco.
  normalized = normalized.replace(/\n{3,}/g, '\n\n').trim();

  return normalized;
}

export function ChatContextProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);

  // Cargar histórico del chat desde localStorage al montar
  useEffect(() => {
    const chatHistoryKey = getChatHistoryKey();
    const savedMessages = localStorage.getItem(chatHistoryKey);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading chat history:', error);
        setMessages([]);
      }
    }
    
    // Mostrar notificación después de 3 segundos si no ha sido despedida
    const notificationTimer = setTimeout(() => {
      if (!notificationDismissed) {
        setShowNotification(true);
      }
    }, 3000);

    return () => clearTimeout(notificationTimer);
  }, [notificationDismissed]);

  // Guardar histórico en localStorage cada vez que cambian los mensajes
  useEffect(() => {
    if (messages.length > 0) {
      const chatHistoryKey = getChatHistoryKey();
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
    }
  }, [messages]);

  // Cuando se abre el chat, añadir mensaje inicial de bienvenida si está vacío
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        role: 'assistant',
        content: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre servicios legales, el acceso a la plataforma y más. ¿Qué necesitas saber?',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const openChat = () => {
    setIsOpen(true);
    setShowNotification(false);
    setNotificationDismissed(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  const dismissNotification = () => {
    setShowNotification(false);
    setNotificationDismissed(true);
  };

  const sendMessage = async (userMessageText) => {
    if (!userMessageText.trim()) return;

    // Crear mensaje del usuario
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toISOString()
    };

    // Agregar mensaje del usuario a la lista
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Preparar historial para la API (solo role y content)
      const apiHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Llamar a la API de Deepseek
      const aiResponse = await sendMessageToDeepseek(userMessageText, apiHistory);
      const formattedAiResponse = normalizeAssistantResponse(aiResponse);

      // Crear mensaje del asistente
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: formattedAiResponse,
        timestamp: new Date().toISOString()
      };

      // Agregar respuesta del asistente
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Mostrar mensaje de error al usuario
      const errorMessage = {
        id: Date.now() + 2,
        role: 'assistant',
        content: `Disculpa, ocurrió un error al procesar tu mensaje: ${error.message}. Por favor, intenta nuevamente o contacta por WhatsApp: https://wa.me/51925651248`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const chatHistoryKey = getChatHistoryKey();
    setMessages([]);
    localStorage.removeItem(chatHistoryKey);
  };

  const value = {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    messages,
    sendMessage,
    isLoading,
    showNotification,
    dismissNotification,
    clearChat,
    notificationDismissed
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatContextProvider');
  }
  return context;
}
