import express from 'express'
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import { verifyToken } from '../middleware/auth.js'
import { notifyNewMessage } from '../utils/notificationHelper.js'

const router = express.Router()

// GET /api/messages/:convId
router.get('/:convId', verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.convId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversación no encontrada' })
    }

    const requesterId = String(req.user.id)
    const isParticipant = requesterId === String(conversation.clientId) || requesterId === String(conversation.lawyerId)
    if (!isParticipant) {
      return res.status(403).json({ error: 'No autorizado para ver esta conversación' })
    }

    const messages = await Message.find({ conversationId: req.params.convId })
      .sort({ sentAt: 1 })
    
    res.json(messages)
  } catch (error) {
    console.error('[Messages] Error listando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/messages
router.post('/', verifyToken, async (req, res) => {
  try {
    const { conversationId, text } = req.body

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Conversación no encontrada' })
    }

    const requesterId = String(req.user.id)
    const isLawyerSender = requesterId === String(conversation.lawyerId)
    const isClientSender = requesterId === String(conversation.clientId)

    if (!isLawyerSender && !isClientSender) {
      return res.status(403).json({ error: 'No autorizado para enviar mensajes en esta conversación' })
    }

    const from = isLawyerSender ? 'lawyer' : 'client'
    
    const message = new Message({
      conversationId,
      from,
      text
    })
    
    await message.save()
    
    // Actualizar última posición de conversación
    await Conversation.findByIdAndUpdate(
      conversationId,
      { lastMessage: text, lastMessageTime: new Date() }
    )

    // 🔔 CREAR NOTIFICACIÓN PARA EL OTRO PARTICIPANTE
    const recipientId = isLawyerSender ? conversation.clientId : conversation.lawyerId
    const senderName = isLawyerSender ? 'El Abogado' : 'Tu Cliente'
    const actionUrl = isLawyerSender ? '/cliente/mensajes' : '/admin/mensajes'

    await notifyNewMessage(
      String(recipientId),
      senderName,
      text,
      message._id.toString(),
      actionUrl
    )
    
    console.log(`[Messages] Mensaje enviado por ${from} en conversación ${conversationId}`)
    
    res.json({ success: true, message })
  } catch (error) {
    console.error('[Messages] Error enviando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/messages/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text, edited: true, editedAt: new Date() },
      { new: true }
    )
    
    console.log(`[Messages] Mensaje editado: ${req.params.id}`)
    
    res.json({ success: true, message })
  } catch (error) {
    console.error('[Messages] Error editando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/messages/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
    if (!message) {
      return res.status(404).json({ error: 'Mensaje no encontrado' })
    }

    // Verificar que el usuario sea propietario del mensaje o admin
    const conversation = await Conversation.findById(message.conversationId)
    const requesterId = String(req.user.id)
    const isLawyer = requesterId === String(conversation.lawyerId)
    const isClient = requesterId === String(conversation.clientId)

    if (!isLawyer && !isClient) {
      return res.status(403).json({ error: 'No autorizado para eliminar este mensaje' })
    }

    await Message.findByIdAndDelete(req.params.id)
    
    console.log(`[Messages] Mensaje eliminado: ${req.params.id}`)
    
    res.json({ success: true, message: 'Mensaje eliminado' })
  } catch (error) {
    console.error('[Messages] Error eliminando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
