import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// GET: Obtener notificaciones del usuario (con opción de filtrar no leídas)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { unreadOnly } = req.query
    const userId = String(req.user.id)
    const query = { userId }
    
    if (unreadOnly === 'true') {
      query.read = false
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()

    // Contar no leídas
    const unreadCount = await Notification.countDocuments({ userId, read: false })

    res.json({
      success: true,
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('[Notifications] Error fetching:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST: Crear notificación (use internally)
// No está expuesto como ruta, se usa desde otras rutas
export async function createNotification(userId, type, title, message, relatedId = null, actionUrl = null, icon = null) {
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
    return await notification.save()
  } catch (error) {
    console.error('[Notifications] Error creating:', error.message)
    return null
  }
}

// PUT: Marcar notificación como leída
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: String(req.user.id) },
      { read: true, updatedAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    res.json({ success: true, notification })
  } catch (error) {
    console.error('[Notifications] Error marking as read:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT: Marcar todas como leídas
router.put('/read/all', verifyToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: String(req.user.id), read: false },
      { read: true, updatedAt: new Date() }
    )

    res.json({ success: true, modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error('[Notifications] Error marking all as read:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE: Limpiar notificaciones leídas
router.delete('/clear/read', verifyToken, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: String(req.user.id), read: true })

    res.json({ success: true, deletedCount: result.deletedCount })
  } catch (error) {
    console.error('[Notifications] Error clearing read:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE: Eliminar notificación
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: String(req.user.id)
    })

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    res.json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    console.error('[Notifications] Error deleting:', error.message)
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
