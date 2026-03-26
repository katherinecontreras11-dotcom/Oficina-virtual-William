import Notification from '../models/Notification.js'

/**
 * Crear una notificación
 * @param {String} userId - ID del usuario que recibe
 * @param {String} type - Tipo: 'message', 'appointment', 'case', 'client_created', 'client_updated'
 * @param {String} title - Título de la notificación
 * @param {String} message - Descripción
 * @param {String} relatedId - ID del recurso relacionado
 * @param {String} actionUrl - URL para navegar al hacer click
 * @param {String} icon - Nombre del ícono lucide-react
 */
export async function createNotification(
  userId,
  type,
  title,
  message,
  relatedId = null,
  actionUrl = null,
  icon = null
) {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      actionUrl,
      icon
    })
    const saved = await notification.save()
    console.log(`[Notification] Creada para usuario ${userId}: ${title}`)
    return saved
  } catch (error) {
    console.error('[Notification] Error creando:', error.message)
    return null
  }
}

/**
 * Crear notificación de mensaje
 */
export async function notifyNewMessage(recipientId, senderName, messageText, messageId, actionUrl) {
  return createNotification(
    recipientId.toString(),
    'message',
    'Nuevo Mensaje',
    `${senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
    messageId?.toString(),
    actionUrl,
    'Mail'
  )
}

/**
 * Crear notificación de cita
 */
export async function notifyNewAppointment(recipientId, date, time, appointmentId, actionUrl) {
  return createNotification(
    recipientId.toString(),
    'appointment',
    'Nueva Cita Agendada',
    `Cita programada para ${date} a las ${time}`,
    appointmentId?.toString(),
    actionUrl,
    'Calendar'
  )
}

/**
 * Crear notificación de cita actualizada
 */
export async function notifyAppointmentUpdated(recipientId, newDate, newTime, appointmentId, actionUrl) {
  return createNotification(
    recipientId.toString(),
    'appointment',
    'Cita Actualizada',
    `Cita reprogramada para ${newDate} a las ${newTime}`,
    appointmentId?.toString(),
    actionUrl,
    'Calendar'
  )
}

/**
 * Crear notificación de cliente creado
 */
export async function notifyClientCreated(adminId, clientName, clientEmail, clientId, actionUrl) {
  return createNotification(
    adminId.toString(),
    'client_created',
    'Nuevo Cliente Registrado',
    `${clientName} (${clientEmail}) ha sido creado como cliente`,
    clientId?.toString(),
    actionUrl,
    'Users'
  )
}

/**
 * Crear notificación de caso actualizado
 */
export async function notifyClientCaseUpdated(recipientId, caseTitle, caseId, actionUrl) {
  return createNotification(
    recipientId.toString(),
    'case',
    'Expediente Actualizado',
    `El caso "${caseTitle}" ha sido actualizado`,
    caseId?.toString(),
    actionUrl,
    'FileText'
  )
}
