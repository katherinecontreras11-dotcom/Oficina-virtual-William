/**
 * Genera un UUID v4 único para el dispositivo
 * @returns {string} UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Obtiene o crea un ID único para el dispositivo
 * Se guarda en localStorage para ser consistente entre sesiones
 * @returns {string} Device ID único
 */
export function getDeviceId() {
  const DEVICE_ID_KEY = 'aiChat_deviceId';
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = generateUUID();
    try {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } catch (error) {
      console.warn('No se pudo guardar Device ID en localStorage:', error);
      // Si localStorage no está disponible, retorna el UUID generado
      // (no será persistente pero será único en la sesión)
    }
  }
  
  return deviceId;
}

/**
 * Genera la clave de almacenamiento para el historial del chat
 * Única por dispositivo
 * @returns {string} Clave de almacenamiento
 */
export function getChatHistoryKey() {
  return `aiChat_messages_${getDeviceId()}`;
}
